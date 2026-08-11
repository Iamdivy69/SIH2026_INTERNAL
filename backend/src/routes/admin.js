const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const authMiddleware = require('../middleware/auth');
const Question = require('../models/Question');
const StudentConcept = require('../models/StudentConcept');

const groq = new Groq({ apiKey: process.env.LLM_API_KEY });

// Role guard middleware
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
}

// ── GET /api/admin/gaps ────────────────────────────────────────────
// Real MongoDB aggregation — average mastery per concept across ALL students
router.get('/gaps', authMiddleware, adminOnly, async (req, res) => {
  try {
    const gaps = await StudentConcept.aggregate([
      {
        $group: {
          _id: '$concept',
          avgMastery:    { $avg: '$mastery' },
          studentCount:  { $sum: 1 },
          weakStudents:  { $sum: { $cond: [{ $lt: ['$mastery', 40] }, 1, 0] } },
        },
      },
      { $sort: { avgMastery: 1 } }, // weakest first
      {
        $project: {
          _id: 0,
          concept:      '$_id',
          avgMastery:   { $round: ['$avgMastery', 1] },
          studentCount: 1,
          weakStudents: 1,
        },
      },
    ]);

    return res.json({ gaps });
  } catch (err) {
    console.error('GET /api/admin/gaps error:', err);
    return res.status(500).json({ message: 'Server error fetching gaps.' });
  }
});

// ── POST /api/admin/generate-question ─────────────────────────────
router.post('/generate-question', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { concept, difficulty, topicHint } = req.body;

    if (!concept || !difficulty || !topicHint) {
      return res.status(400).json({ message: 'concept, difficulty, and topicHint are required.' });
    }

    const diffInt = parseInt(difficulty, 10);
    if (![1, 2, 3].includes(diffInt)) {
      return res.status(400).json({ message: 'difficulty must be 1, 2, or 3.' });
    }

    // 1. Build Groq prompt
    const diffLabel = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }[diffInt];
    const prompt = `Generate a multiple-choice question about ${concept} (a data structures topic) at difficulty level ${diffInt}/3 (${diffLabel}).
Topic focus: ${topicHint}

Return ONLY valid JSON with absolutely no markdown, no code fences, no prose before or after. The JSON must be exactly:
{"text":"question text here","options":["option A","option B","option C","option D"],"correctAnswer":0,"explanation":"why the correct answer is correct"}

Rules:
- correctAnswer is 0-3 (index into options array)
- options must have exactly 4 strings
- explanation must specifically explain why the correct answer is right
- Question must test conceptual understanding, not just definitions
- Difficulty ${diffInt}: ${diffInt === 1 ? 'basic recall and identification' : diffInt === 2 ? 'application and analysis' : 'synthesis, edge cases, and complex reasoning'}`;

    // 2. Call Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.8,
    });

    const raw = completion.choices[0]?.message?.content || '';

    // 3. Strip markdown fences if present, then parse
    const stripped = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(stripped);
    } catch {
      console.error('Groq JSON parse failed. Raw:', raw);
      return res.status(500).json({
        message: 'AI returned malformed JSON. Please try again.',
        raw: stripped.slice(0, 200),
      });
    }

    // 4. Validate structure
    if (
      typeof parsed.text !== 'string' ||
      !Array.isArray(parsed.options) || parsed.options.length !== 4 ||
      typeof parsed.correctAnswer !== 'number' ||
      parsed.correctAnswer < 0 || parsed.correctAnswer > 3 ||
      typeof parsed.explanation !== 'string'
    ) {
      return res.status(500).json({
        message: 'AI returned invalid question structure. Please try again.',
      });
    }

    // 5. Duplicate check — AFTER generation, against generated text (Fix #1)
    const escaped = parsed.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Fix #6: regex-escape
    const existing = await Question.findOne({
      text: { $regex: new RegExp(escaped, 'i') },
    }).lean();
    const isDuplicate = !!existing;

    // 6. Persist question (even if duplicate — flag is informational per plan)
    const question = await Question.create({
      concept,
      difficulty: diffInt,
      text: parsed.text,
      options: parsed.options,
      correctAnswer: parsed.correctAnswer,
      explanation: parsed.explanation,
      source: 'AI Generated',
      exposure: 0,
    });

    return res.status(201).json({ question, isDuplicate });
  } catch (err) {
    console.error('POST /api/admin/generate-question error:', err);
    return res.status(500).json({ message: 'Server error generating question.' });
  }
});

module.exports = router;
