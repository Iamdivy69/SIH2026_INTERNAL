/**
 * bulkGenerateQuestions.js — Phase 13
 * Bulk question generator: expands question bank to 100+ questions per concept (800+ total).
 * Uses Groq LLaMA (llama-3.3-70b-versatile) with sub-topic hints, Jaccard duplicate prevention,
 * and seeded Elo ratings (1000 / 1250 / 1500). Resumable/Idempotent.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Groq = require('groq-sdk');
const Question = require('../models/Question');

const groq = new Groq({ apiKey: process.env.LLM_API_KEY });

const TARGET_PER_CONCEPT = 20;

// Sub-topic breakdown per concept (80 sub-topics across 8 concepts)
const SUB_TOPICS = {
  'Arrays': [
    'contiguous memory layout and O(1) index access',
    'array insertion and deletion time complexity',
    'prefix sums and range sum queries',
    'two pointers technique for array searching',
    'sliding window pattern on arrays',
    'binary search on a sorted array',
    '2D array row-major and column-major order',
    'array rotation algorithms and space bounds',
    'finding duplicates and frequency counts in arrays',
    'in-place array manipulation and swapping',
  ],
  'Linked Lists': [
    'singly linked list node structure and pointer links',
    'doubly linked list head and tail pointers',
    'inserting a node at head vs tail vs middle',
    'deleting a node from singly linked list',
    'detecting a cycle using Floyd tortoise and hare algorithm',
    'reversing a linked list iteratively and recursively',
    'finding the middle node of a linked list',
    'merging two sorted linked lists',
    'dummy head node technique for simplified pointer logic',
    'circular linked list traversal and insertion',
  ],
  'Binary Trees': [
    'root node, leaf node, parent/child definitions',
    'tree height and depth calculation',
    'in-order traversal logic and call stack',
    'pre-order traversal logic and application',
    'post-order traversal logic and bottom-up evaluation',
    'level-order traversal using a queue',
    'full vs complete vs perfect binary trees',
    'counting total nodes and leaf nodes in a binary tree',
    'binary tree properties and maximum nodes per level',
    'lowest common ancestor in a general binary tree',
  ],
  'BST': [
    'Binary Search Tree ordering invariant',
    'searching for a target value in a BST',
    'finding minimum and maximum elements in a BST',
    'in-order predecessor and in-order successor',
    'finding floor and ceiling of a key in a BST',
    'range search query in a BST',
    'verifying if a binary tree satisfies the BST property',
    'BST insertion algorithm and pointer updates',
    'worst-case degenerate BST height and time complexity',
    'constructing a BST from sorted array',
  ],
  'BST Deletion': [
    'deleting a leaf node with zero children in a BST',
    'deleting a BST node with exactly one child',
    'deleting a BST node with two children using in-order successor',
    'deleting a BST node with two children using in-order predecessor',
    'tree height and structural balance changes after BST deletion',
    'edge case: deleting the root node of a BST',
    'edge case: deleting a node when successor has a right child',
    'pointer re-linking mechanics during BST node removal',
    'time complexity of BST deletion in balanced vs unbalanced trees',
    'recursive vs iterative BST deletion implementation',
  ],
  'AVL': [
    'AVL tree self-balancing invariant and height definition',
    'balance factor calculation (height of left subtree minus right subtree)',
    'valid AVL balance factors (-1, 0, +1)',
    'detecting balance factor violations (+2 or -2) on insertion',
    'detecting balance factor violations (+2 or -2) on deletion',
    'AVL height upper bound O(log N) and Fibonacci tree minimal nodes',
    'comparing search performance between standard BST and AVL tree',
    'AVL node height maintenance during updates',
    'rebalancing trigger conditions during node insertion',
    'rebalancing trigger conditions during node removal',
  ],
  'AVL Rotations': [
    'Left-Left (LL) case: single right rotation mechanics',
    'Right-Right (RR) case: single left rotation mechanics',
    'Left-Right (LR) case: double rotation (left on child, right on root)',
    'Right-Left (RL) case: double rotation (right on child, left on root)',
    'updating sub-tree parent pointers during AVL rotations',
    'recalculating heights of rotated nodes in constant time O(1)',
    'identifying rotation type from balance factors of node and child',
    'rotation mechanics when subtrees are attached to rotated nodes',
    'verifying AVL balance restoration after a single vs double rotation',
    'rotation sequence needed when inserting into heavy subtrees',
  ],
  'Graphs': [
    'vertex and edge definitions in directed vs undirected graphs',
    'adjacency matrix representation space and lookup bounds',
    'adjacency list representation space and iteration bounds',
    'vertex in-degree and out-degree in directed graphs',
    'weighted vs unweighted graph representations',
    'connected components in undirected graphs',
    'strongly connected components in directed graphs',
    'detecting cycles in undirected vs directed graphs',
    'dense vs sparse graph efficiency comparisons',
    'handshaking lemma (sum of degrees equals 2x edges)',
  ],
  'BFS': [
    'Breadth-First Search traversal logic using a FIFO queue',
    'visited set tracking to prevent infinite loops in graph BFS',
    'shortest path in an unweighted graph using BFS',
    'level-order frontier expansion in BFS',
    'time complexity O(V + E) of BFS using adjacency list',
    'space complexity O(V) of BFS queue and visited tracking',
    'finding all connected components using BFS',
    'bipartite graph checking using 2-color BFS',
    'multi-source BFS traversal applications',
    'comparing exploration patterns of BFS vs DFS',
  ],
  'Dijkstra': [
    'single-source shortest path problem definition',
    'greedy choice property in Dijkstra algorithm',
    'dist array initialization and distance relaxation formula',
    'min-priority queue (binary heap) optimization O((V+E) log V)',
    'why Dijkstra fails on graphs with negative edge weights',
    'reconstructing the shortest path using a predecessor array',
    'Dijkstra behavior on DAGs and dense graphs',
    'stopping Dijkstra early when target vertex is popped',
    'comparing Dijkstra vs BFS for shortest path',
    'edge relaxation order and distance bounds',
  ],
};

// Normalized word-set Jaccard similarity check (Fix #1)
function jaccardSimilarity(str1, str2) {
  const words1 = new Set(str1.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }

  const union = words1.size + words2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// Generate single MCQ via Groq
async function generateMCQ(concept, subTopic, difficulty) {
  const diffLabel = { 1: 'Easy (conceptual recall)', 2: 'Medium (application & analysis)', 3: 'Hard (complex reasoning & edge cases)' }[difficulty];
  const prompt = `Generate a high-quality multiple-choice question about the computer science topic: "${concept}".
Sub-topic focus: ${subTopic}
Target difficulty: Level ${difficulty}/3 (${diffLabel})

Return ONLY valid JSON with no markdown, no code fences, no prose. Format:
{"text":"question text here","options":["option A","option B","option C","option D"],"correctAnswer":0,"explanation":"detailed explanation of correct answer"}

Rules:
- correctAnswer is 0-3
- options must have exactly 4 strings
- text must be clear, rigorous, and unambiguous
- explanation must explain why the correct answer is right and why others are wrong`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content || '';
  const stripped = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  const parsed = JSON.parse(stripped);

  if (
    typeof parsed.text !== 'string' ||
    !Array.isArray(parsed.options) || parsed.options.length !== 4 ||
    typeof parsed.correctAnswer !== 'number' ||
    parsed.correctAnswer < 0 || parsed.correctAnswer > 3 ||
    typeof parsed.explanation !== 'string'
  ) {
    throw new Error('Invalid JSON structure returned by LLM');
  }

  return parsed;
}

async function bulkGenerate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for Bulk Question Expansion');

    const concepts = Object.keys(SUB_TOPICS);

    for (const concept of concepts) {
      let currentCount = await Question.countDocuments({ concept });
      console.log(`\n📦 Concept: "${concept}" | Current Count: ${currentCount}/${TARGET_PER_CONCEPT}`);

      if (currentCount >= TARGET_PER_CONCEPT) {
        console.log(`   ✓ Concept "${concept}" already has ${currentCount} questions — skipping.`);
        continue;
      }

      const existingQuestions = await Question.find({ concept }).select('text').lean();
      const existingTexts = existingQuestions.map(q => q.text);

      const subTopics = SUB_TOPICS[concept];
      let subTopicIdx = 0;
      let diffCounter = 1;

      while (currentCount < TARGET_PER_CONCEPT) {
        const subTopic = subTopics[subTopicIdx % subTopics.length];
        const difficulty = (diffCounter % 3) + 1; // cycles 1, 2, 3
        const targetElo = difficulty === 1 ? 1000 : difficulty === 2 ? 1250 : 1500;

        try {
          const generated = await generateMCQ(concept, subTopic, difficulty);

          // Jaccard similarity check against existing concept pool
          const isNearDuplicate = existingTexts.some(text => jaccardSimilarity(text, generated.text) >= 0.7);

          if (isNearDuplicate) {
            console.log(`   ⚠️ Near duplicate detected for "${subTopic.slice(0, 30)}..." — retrying...`);
            continue;
          }

          // Persist Question
          const newQ = await Question.create({
            concept,
            difficulty,
            text: generated.text,
            options: generated.options,
            correctAnswer: generated.correctAnswer,
            explanation: generated.explanation,
            eloRating: targetElo,
            timesAnswered: 0,
            timesCorrect: 0,
            exposure: 0,
            source: 'Bulk Generator',
          });

          existingTexts.push(generated.text);
          currentCount++;
          console.log(`   + [${currentCount}/${TARGET_PER_CONCEPT}] [D${difficulty} / Elo ${targetElo}] "${generated.text.slice(0, 50)}..."`);
        } catch (err) {
          console.error(`   ❌ Failed attempt for ${concept} (${subTopic.slice(0, 20)}...):`, err.message);
          await new Promise(r => setTimeout(r, 1000));
        }

        subTopicIdx++;
        diffCounter++;
      }
    }

    const totalBank = await Question.countDocuments();
    console.log(`\n🎉 BULK GENERATION COMPLETE! Total Questions in MongoDB: ${totalBank}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Bulk Generation Error:', err);
    process.exit(1);
  }
}

bulkGenerate();
