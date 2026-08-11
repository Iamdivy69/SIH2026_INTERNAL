const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const authMiddleware = require('../middleware/auth');
const StudentConcept = require('../models/StudentConcept');
const Response = require('../models/Response');

const groq = new Groq({ apiKey: process.env.LLM_API_KEY });

// Keywords → canonical concept names
const CONCEPT_KEYWORDS = {
  BST:  ['bst', 'binary search tree', 'deletion', 'successor', 'predecessor', 'search tree'],
  AVL:  ['avl', 'rotation', 'rotations', 'balance factor', 'balanced', 'avl tree'],
  'Binary Trees': ['binary tree', 'tree traversal', 'inorder', 'preorder', 'postorder'],
  Arrays: ['array', 'arrays', 'sorting', 'searching'],
  'Linked Lists': ['linked list', 'linked lists', 'pointer', 'node'],
  Graphs: ['graph', 'graphs', 'vertex', 'edge', 'adjacency'],
  BFS: ['bfs', 'breadth first', 'breadth-first', 'queue traversal'],
  Dijkstra: ['dijkstra', 'shortest path', 'weighted graph'],
};

function detectConcept(message) {
  const lower = message.toLowerCase();
  for (const [concept, keywords] of Object.entries(CONCEPT_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return concept;
  }
  return null;
}

// POST /api/tutor/ask
router.post('/ask', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const userId = req.user.id;

    // 1. Fetch all StudentConcept rows
    const concepts = await StudentConcept.find({ userId }).sort({ mastery: 1 }).lean();
    if (!concepts.length) {
      return res.status(404).json({ message: 'No concept data found.' });
    }

    const weak   = concepts.filter(c => c.mastery < 40).map(c => `${c.concept} (${c.mastery}%)`);
    const strong = concepts.filter(c => c.mastery >= 70).map(c => `${c.concept} (${c.mastery}%)`);

    // 2. Fetch last 10 responses (overall accuracy)
    const recentAll = await Response.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const total   = recentAll.length;
    const correct = recentAll.filter(r => r.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : null;

    // 3. Detect concept from message
    const matchedConcept = detectConcept(message);
    let conceptSection = '';

    if (matchedConcept) {
      const recentConcept = await Response.find({ userId, concept: matchedConcept })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      const cTotal   = recentConcept.length;
      const cCorrect = recentConcept.filter(r => r.isCorrect).length;
      const cAccuracy = cTotal > 0 ? Math.round((cCorrect / cTotal) * 100) : null;
      const cMastery  = concepts.find(c => c.concept === matchedConcept)?.mastery ?? 'unknown';

      if (cTotal > 0) {
        conceptSection = `\nOn ${matchedConcept} specifically:\n- Mastery: ${cMastery}%\n- Recent accuracy: ${cAccuracy}% (${cCorrect}/${cTotal} attempts)`;
      } else {
        conceptSection = `\nOn ${matchedConcept}: Mastery is ${cMastery}%. No recent attempts.`;
      }
    }

    // 4. Build system prompt
    const systemPrompt = `You are an adaptive computer science tutor in PARAKH AI, an assessment platform for engineering students.

The student's current mastery levels (0–100 scale):
${concepts.map(c => `- ${c.concept}: ${c.mastery}%`).join('\n')}

Overall recent performance (last ${total} questions):
${accuracy !== null ? `- Accuracy: ${accuracy}% (${correct}/${total} correct)` : '- No recent responses yet'}${conceptSection}

Weak areas (mastery < 40%): ${weak.join(', ') || 'none'}
Strong areas (mastery ≥ 70%): ${strong.join(', ') || 'none'}

INSTRUCTIONS:
- Reference the student's ACTUAL mastery numbers and accuracy above — not generic advice
- Use hedged language: "your recent responses suggest", "based on your ${matchedConcept || 'recent'} performance", "this may indicate a gap in"
- Keep to 2–3 focused paragraphs maximum
- Do NOT reproduce textbook definitions — diagnose what's likely going wrong and advise specifically
- If their mastery is low on a concept they asked about, acknowledge it directly with the actual number`;

    // 5. Call Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: message.trim() },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    return res.json({ reply });

  } catch (err) {
    console.error('POST /api/tutor/ask error:', err);
    return res.status(500).json({ message: 'Server error from AI tutor.' });
  }
});

module.exports = router;
