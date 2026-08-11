/**
 * seedQuestions.js — Phase 2 question bank seed
 * Run: node src/scripts/seedQuestions.js
 *
 * ALL questions use concept: "BST" or concept: "AVL" ONLY.
 * Subtopic flavor (deletion, rotations, etc.) is in text/explanation, never the concept field.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Question = require('../models/Question');

const questions = [
  // ─── BST — Easy (difficulty 1) ─────────────────────────────────
  {
    concept: 'BST',
    difficulty: 1,
    text: 'Which property defines a Binary Search Tree (BST)?',
    options: [
      'Every node has exactly two children',
      'Left child < parent < right child',
      'All leaf nodes are at the same level',
      'The root is always the smallest element',
    ],
    correctAnswer: 1,
    explanation: 'A BST satisfies the BST property: for every node, all values in its left subtree are less than the node, and all values in its right subtree are greater.',
  },
  {
    concept: 'BST',
    difficulty: 1,
    text: 'Which traversal of a BST outputs node values in ascending (sorted) order?',
    options: ['Pre-order', 'Post-order', 'In-order', 'Level-order'],
    correctAnswer: 2,
    explanation: 'In-order traversal (left → root → right) of a BST always produces values in ascending sorted order due to the BST property.',
  },
  {
    concept: 'BST',
    difficulty: 1,
    text: 'What is the time complexity for searching a value in a balanced BST with n nodes?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correctAnswer: 1,
    explanation: 'In a balanced BST, each comparison eliminates half the remaining nodes, giving O(log n) search time.',
  },

  // ─── BST — Medium (difficulty 2) ──────────────────────────────
  {
    concept: 'BST',
    difficulty: 2,
    text: 'When deleting a node with two children from a BST, which node typically replaces it?',
    options: [
      'The root node',
      'The in-order successor (smallest node in right subtree)',
      'The in-order predecessor (largest node in left subtree)',
      'Either B or C — both maintain the BST property',
    ],
    correctAnswer: 3,
    explanation: 'Both the in-order successor and in-order predecessor can replace a deleted node with two children while preserving the BST property. Most implementations use the in-order successor.',
  },
  {
    concept: 'BST',
    difficulty: 2,
    text: 'In a BST, what is the time complexity of finding the minimum value?',
    options: ['O(1)', 'O(log n)', 'O(h) where h is the height', 'O(n)'],
    correctAnswer: 2,
    explanation: 'The minimum is always the leftmost node. We traverse left pointers from root to leaf, which takes O(h) time — O(log n) for balanced, O(n) worst case (skewed tree).',
  },
  {
    concept: 'BST',
    difficulty: 2,
    text: 'Which of the following insertion sequences into an empty BST produces a perfectly balanced tree?',
    options: ['1, 2, 3, 4, 5', '5, 4, 3, 2, 1', '3, 1, 5, 2, 4', '4, 2, 1, 3, 5'],
    correctAnswer: 2,
    explanation: 'Inserting 3 as root, then 1 and 5 as its children, then 2 and 4 produces a balanced BST. Sequential insertions (1,2,3,4,5) produce a degenerate (skewed) tree.',
  },
  {
    concept: 'BST',
    difficulty: 2,
    text: 'After deleting the root of a BST (which has two children) using in-order successor replacement, what becomes the new root?',
    options: [
      'The left child of the deleted root',
      'The right child of the deleted root',
      'The smallest element in the right subtree',
      'The largest element in the left subtree',
    ],
    correctAnswer: 2,
    explanation: 'The in-order successor — the smallest element in the right subtree (leftmost node of right subtree) — replaces the deleted root, maintaining the BST property.',
  },

  // ─── BST — Hard (difficulty 3) ────────────────────────────────
  {
    concept: 'BST',
    difficulty: 3,
    text: 'What is the worst-case space complexity of a recursive BST search due to the call stack?',
    options: ['O(1)', 'O(log n)', 'O(h) where h is the height', 'O(n²)'],
    correctAnswer: 2,
    explanation: 'Each recursive call adds a frame to the call stack. In the worst case (skewed tree), height h = n, giving O(n) stack space. For a balanced tree, h = O(log n).',
  },
  {
    concept: 'BST',
    difficulty: 3,
    text: 'You insert keys 10, 20, 5, 15, 3 into an empty BST, then delete 10. Using in-order successor replacement, what is the new structure at the root?',
    options: [
      'Root=15, left=5(left=3), right=20',
      'Root=5, left=3, right=20(left=15)',
      'Root=20, left=5(left=3, right=15)',
      'Root=3, right=5(right=15(right=20))',
    ],
    correctAnswer: 0,
    explanation: 'After inserting 10,20,5,15,3 the tree is: root=10, left=5(left=3), right=20(left=15). Deleting 10: in-order successor is 15 (smallest in right subtree). 15 replaces 10, 20 becomes 15\'s right child. Result: root=15, left=5(left=3), right=20.',
  },
  {
    concept: 'BST',
    difficulty: 3,
    text: 'In a BST, the number of nodes with keys strictly between values k1 and k2 (k1 < k2) can be found in:',
    options: ['O(n) always', 'O(log n + count) time', 'O(k2 - k1) time', 'O(n²) time'],
    correctAnswer: 1,
    explanation: 'Using the BST property, we can navigate to k1 in O(log n) time, then perform an in-order traversal counting nodes until we exceed k2. Total: O(log n + count) where count is the number of qualifying nodes.',
  },

  // ─── AVL — Easy (difficulty 1) ────────────────────────────────
  {
    concept: 'AVL',
    difficulty: 1,
    text: 'What is the balance factor of a node in an AVL tree?',
    options: [
      'Left subtree height minus right subtree height',
      'Number of nodes in left subtree minus right subtree',
      'Height of the entire tree',
      'Depth of the node from the root',
    ],
    correctAnswer: 0,
    explanation: 'The balance factor = height(left subtree) - height(right subtree). In a valid AVL tree, every node must have a balance factor of -1, 0, or +1.',
  },
  {
    concept: 'AVL',
    difficulty: 1,
    text: 'What is the allowed range of balance factors for nodes in a valid AVL tree?',
    options: ['{0, 1}', '{-2, -1, 0, 1, 2}', '{-1, 0, 1}', '{0}'],
    correctAnswer: 2,
    explanation: 'An AVL tree maintains the invariant that every node\'s balance factor (height_left - height_right) is -1, 0, or +1. Any violation triggers a rotation.',
  },

  // ─── AVL — Medium (difficulty 2) ──────────────────────────────
  {
    concept: 'AVL',
    difficulty: 2,
    text: 'Which rotation fixes a Left-Left (LL) imbalance in an AVL tree?',
    options: ['Left rotation on the unbalanced node', 'Right rotation on the unbalanced node', 'Left-Right double rotation', 'Right-Left double rotation'],
    correctAnswer: 1,
    explanation: 'An LL imbalance (left subtree of left child is too tall) is fixed by a single right rotation on the unbalanced node. The left child becomes the new root of that subtree.',
  },
  {
    concept: 'AVL',
    difficulty: 2,
    text: 'After inserting a new node causes a Right-Left (RL) imbalance, which sequence of rotations is applied?',
    options: [
      'Single left rotation on the unbalanced node',
      'Single right rotation on the unbalanced node',
      'Right rotation on right child, then left rotation on unbalanced node',
      'Left rotation on left child, then right rotation on unbalanced node',
    ],
    correctAnswer: 2,
    explanation: 'An RL imbalance is fixed by a double rotation: first a right rotation on the right child (converting it to a RR case), then a left rotation on the unbalanced node.',
  },
  {
    concept: 'AVL',
    difficulty: 2,
    text: 'What is the guaranteed worst-case height of an AVL tree with n nodes?',
    options: ['n', 'n/2', '1.44 log₂(n)', '2 log₂(n)'],
    correctAnswer: 2,
    explanation: 'An AVL tree\'s height is at most 1.44 log₂(n+2) - 0.328. This guarantees O(log n) operations, unlike a plain BST which can degrade to O(n) height.',
  },
  {
    concept: 'AVL',
    difficulty: 2,
    text: 'When might a deletion in an AVL tree require more rotations than an insertion?',
    options: [
      'Never — deletion never requires rotations',
      'Always — deletion always requires more rotations',
      'When multiple ancestors become unbalanced after removing a node',
      'Only when deleting leaf nodes',
    ],
    correctAnswer: 2,
    explanation: 'An insertion requires at most one rotation (single or double). A deletion can cause imbalances that propagate up the tree, potentially requiring O(log n) rotations — one at each ancestor level.',
  },

  // ─── AVL — Hard (difficulty 3) ────────────────────────────────
  {
    concept: 'AVL',
    difficulty: 3,
    text: 'Insert keys 3, 2, 1 into an empty AVL tree. After the necessary rotation, what is the resulting tree structure?',
    options: [
      'Root=3, left=2, left-left=1 (no rotation needed)',
      'Root=2, left=1, right=3 (single right rotation)',
      'Root=1, right=2, right-right=3 (left rotation)',
      'Root=2, left=3, right=1 (invalid)',
    ],
    correctAnswer: 1,
    explanation: 'Inserting 3, then 2 (left child of 3), then 1 (left child of 2) creates an LL imbalance at node 3 (balance factor = +2). A right rotation on 3 makes 2 the root with 1 as left child and 3 as right child.',
  },
  {
    concept: 'AVL',
    difficulty: 3,
    text: 'In an AVL tree with n nodes, what is the minimum number of nodes required to achieve height h?',
    options: [
      'N(h) = N(h-1) + N(h-2) + 1, with N(0)=1, N(-1)=0',
      'N(h) = 2^h',
      'N(h) = h²',
      'N(h) = 2h + 1',
    ],
    correctAnswer: 0,
    explanation: 'The minimum-node AVL tree of height h (a Fibonacci tree) satisfies the recurrence N(h) = N(h-1) + N(h-2) + 1. This is related to Fibonacci numbers and proves that AVL height is O(log n).',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing questions (idempotent seed)
    const deleted = await Question.deleteMany({ source: 'seed' });
    console.log(`🗑  Cleared ${deleted.deletedCount} existing seeded questions`);

    // Insert all questions
    const inserted = await Question.insertMany(questions.map(q => ({ ...q, exposure: 0, source: 'seed' })));
    console.log(`✅ Seeded ${inserted.length} questions`);

    // Summary
    const bstCount = inserted.filter(q => q.concept === 'BST').length;
    const avlCount = inserted.filter(q => q.concept === 'AVL').length;
    console.log(`   BST: ${bstCount} questions`);
    console.log(`   AVL: ${avlCount} questions`);

    await mongoose.disconnect();
    console.log('✅ Done');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
