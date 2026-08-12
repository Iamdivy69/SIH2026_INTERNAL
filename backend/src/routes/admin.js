const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const authMiddleware = require('../middleware/auth');
const Question = require('../models/Question');
const StudentConcept = require('../models/StudentConcept');

const groq = new Groq({ apiKey: process.env.LLM_API_KEY });

const User = require('../models/User');
const AssessmentSession = require('../models/AssessmentSession');
const Response = require('../models/Response');
const MasteryLog = require('../models/MasteryLog');

// Role guard middleware
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
}

// ── GET /api/admin/overview ────────────────────────────────────────
router.get('/overview', authMiddleware, adminOnly, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAssessments = await AssessmentSession.countDocuments({ status: 'completed' });
    const questionBankSize = await Question.countDocuments({});

    // Average institution mastery across all student concept records
    const masteryAgg = await StudentConcept.aggregate([
      { $group: { _id: null, avgMastery: { $avg: '$mastery' } } }
    ]);
    const avgInstitutionMastery = masteryAgg.length > 0 ? Math.round(masteryAgg[0].avgMastery) : 0;

    // Violations logged in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sessionsWithViolations = await AssessmentSession.find({
      'violations.timestamp': { $gte: sevenDaysAgo }
    }).lean();

    let violationsThisWeek = 0;
    sessionsWithViolations.forEach(s => {
      if (Array.isArray(s.violations)) {
        violationsThisWeek += s.violations.filter(v => new Date(v.timestamp) >= sevenDaysAgo).length;
      }
    });

    return res.json({
      totalStudents,
      totalAssessments,
      avgInstitutionMastery,
      questionBankSize,
      violationsThisWeek,
    });
  } catch (err) {
    console.error('GET /api/admin/overview error:', err);
    return res.status(500).json({ message: 'Server error fetching admin overview.' });
  }
});

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

// ── GET /api/admin/students ────────────────────────────────────────
router.get('/students', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { search, sort } = req.query;

    // Search filter
    const filter = { role: 'student' };
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const students = await User.find(filter).lean();

    // Enrich each student with aggregated metrics
    const enriched = await Promise.all(
      students.map(async (st) => {
        const userId = st._id;

        // Mastery avg
        const concepts = await StudentConcept.find({ userId }).lean();
        const overallMastery = concepts.length > 0
          ? Math.round(concepts.reduce((sum, c) => sum + c.mastery, 0) / concepts.length)
          : 0;

        // Assessment sessions
        const userSessions = await AssessmentSession.find({ userId }).lean();
        const assessmentsCompleted = userSessions.filter(s => s.status === 'completed').length;
        const totalViolations = userSessions.reduce((sum, s) => sum + (s.violationCount || 0), 0);

        // Flagged: any session terminated OR any single session violationCount >= 3
        const flagged = userSessions.some(s => s.status === 'terminated' || (s.violationCount && s.violationCount >= 3));

        return {
          id: st._id,
          name: st.name,
          email: st.email,
          lastActiveAt: st.lastActiveAt || st.updatedAt || st.createdAt,
          overallMastery,
          assessmentsCompleted,
          totalViolations,
          flagged,
        };
      })
    );

    // Sort enriched results
    const sortField = sort || 'lastActive';
    enriched.sort((a, b) => {
      if (sortField === 'mastery') return b.overallMastery - a.overallMastery;
      if (sortField === 'violations') return b.totalViolations - a.totalViolations;
      // Default: lastActive descending
      return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
    });

    return res.json({ students: enriched });
  } catch (err) {
    console.error('GET /api/admin/students error:', err);
    return res.status(500).json({ message: 'Server error fetching student roster.' });
  }
});

// ── GET /api/admin/students/:id ────────────────────────────────────
router.get('/students/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId).lean();

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // 1. Profile
    const profile = {
      id: student._id,
      name: student.name,
      email: student.email,
      lastActiveAt: student.lastActiveAt || student.updatedAt || student.createdAt,
      hasCompletedDiagnostic: student.hasCompletedDiagnostic || false,
    };

    // 2. Concepts (reusing exact state logic parameterized for studentId)
    const concepts = await StudentConcept.find({ userId: studentId }).sort({ concept: 1 }).lean();
    const enrichedConcepts = await Promise.all(
      concepts.map(async (c) => {
        const historyLogs = await MasteryLog.find({ userId: studentId, concept: c.concept })
          .sort({ timestamp: 1 })
          .limit(10)
          .lean();

        const history = historyLogs.map(l => ({
          mastery: l.mastery,
          delta: l.delta,
          timestamp: l.timestamp,
        }));

        const responses = await Response.find({ userId: studentId, concept: c.concept })
          .sort({ createdAt: -1 })
          .lean();

        const attemptCount = responses.length;
        const correctCount = responses.filter(r => r.isCorrect).length;
        const accuracy = attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : 0;
        const totalTime = responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
        const averageResponseTime = attemptCount > 0 ? Math.round(totalTime / attemptCount) : 0;
        const recentAttempts = responses.slice(0, 5).map(r => r.isCorrect);

        return {
          ...c,
          history,
          attemptCount,
          accuracy,
          averageResponseTime,
          recentAttempts,
        };
      })
    );

    // 3. Assessment History
    const userSessions = await AssessmentSession.find({ userId: studentId }).sort({ createdAt: -1 }).lean();
    const assessmentHistory = userSessions.map(s => ({
      sessionId: s.sessionId,
      mode: s.mode || 'adaptive',
      concept: s.concept,
      status: s.status,
      startedAt: s.createdAt,
      completedAt: s.updatedAt,
      violationCount: s.violationCount || 0,
      terminationReason: s.terminationReason,
    }));

    // 4. Violation Log (flattened, chronological desc)
    const violationLog = [];
    userSessions.forEach(s => {
      if (Array.isArray(s.violations)) {
        s.violations.forEach(v => {
          violationLog.push({
            type: v.type,
            timestamp: v.timestamp,
            sessionId: s.sessionId,
          });
        });
      }
    });
    violationLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.json({
      profile,
      concepts: enrichedConcepts,
      assessmentHistory,
      violationLog,
    });
  } catch (err) {
    console.error(`GET /api/admin/students/${req.params.id} error:`, err);
    return res.status(500).json({ message: 'Server error fetching student details.' });
  }
});

// ── GET /api/admin/questions/health ───────────────────────────────
router.get('/questions/health', authMiddleware, adminOnly, async (req, res) => {
  try {
    const CANONICAL_CONCEPTS = ['Arrays', 'Linked Lists', 'Binary Trees', 'BST', 'AVL', 'Graphs', 'BFS', 'Dijkstra'];

    const health = await Promise.all(
      CANONICAL_CONCEPTS.map(async (concept) => {
        const questions = await Question.find({ concept }).lean();
        const total = questions.length;

        const easy = questions.filter(q => q.difficulty === 1).length;
        const medium = questions.filter(q => q.difficulty === 2).length;
        const hard = questions.filter(q => q.difficulty === 3).length;

        const exposures = questions.map(q => q.timesServed || q.exposure || 0);
        const min = exposures.length > 0 ? Math.min(...exposures) : 0;
        const max = exposures.length > 0 ? Math.max(...exposures) : 0;
        const avg = exposures.length > 0 ? Math.round((exposures.reduce((a, b) => a + b, 0) / exposures.length) * 10) / 10 : 0;
        const neverServed = exposures.filter(e => e === 0).length;

        return {
          concept,
          total,
          byDifficulty: { easy, medium, hard },
          exposure: { min, max, avg },
          neverServed,
        };
      })
    );

    return res.json({ health });
  } catch (err) {
    console.error('GET /api/admin/questions/health error:', err);
    return res.status(500).json({ message: 'Server error fetching question health.' });
  }
});

// ── POST /api/admin/generate-question ─────────────────────────────
router.post('/generate-question', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { concept, difficulty, topicHint, count } = req.body;

    if (!concept || !difficulty || !topicHint) {
      return res.status(400).json({ message: 'concept, difficulty, and topicHint are required.' });
    }

    const diffInt = parseInt(difficulty, 10);
    if (![1, 2, 3].includes(diffInt)) {
      return res.status(400).json({ message: 'difficulty must be 1, 2, or 3.' });
    }

    const qty = Math.min(Math.max(parseInt(count || 1, 10), 1), 10);
    const diffLabel = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }[diffInt];

    const prompt = qty === 1
      ? `Generate a multiple-choice question about ${concept} (a data structures topic) at difficulty level ${diffInt}/3 (${diffLabel}).
Topic focus: ${topicHint}

Return ONLY valid JSON with absolutely no markdown, no code fences, no prose before or after. The JSON must be exactly:
{"text":"question text here","options":["option A","option B","option C","option D"],"correctAnswer":0,"explanation":"why the correct answer is correct"}

Rules:
- correctAnswer is 0-3 (index into options array)
- options must have exactly 4 strings
- explanation must specifically explain why the correct answer is right
- Question must test conceptual understanding, not just definitions`
      : `Generate ${qty} unique multiple-choice questions about ${concept} (a data structures topic) at difficulty level ${diffInt}/3 (${diffLabel}).
Topic focus: ${topicHint}

Return ONLY a valid JSON array of ${qty} objects with absolutely no markdown, no code fences, no prose before or after. The JSON array must be exactly:
[
  {"text":"question 1 text","options":["option A","option B","option C","option D"],"correctAnswer":0,"explanation":"why correct"},
  {"text":"question 2 text","options":["option A","option B","option C","option D"],"correctAnswer":1,"explanation":"why correct"}
]

Rules for each question:
- correctAnswer is 0-3 (index into options array)
- options must have exactly 4 strings
- explanation must specifically explain why the correct answer is right
- Question must test conceptual understanding, not just definitions
- Ensure all ${qty} questions are distinct from each other.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1800,
      temperature: 0.8,
    });

    const raw = completion.choices[0]?.message?.content || '';
    const stripped = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    let parsedItems = [];
    try {
      const jsonParsed = JSON.parse(stripped);
      parsedItems = Array.isArray(jsonParsed) ? jsonParsed : [jsonParsed];
    } catch {
      console.error('Groq JSON parse failed. Raw:', raw);
      return res.status(500).json({
        message: 'AI returned malformed JSON. Please try again.',
        raw: stripped.slice(0, 200),
      });
    }

    const generatedResults = [];
    let duplicatesFound = 0;

    for (const item of parsedItems) {
      if (
        typeof item.text !== 'string' ||
        !Array.isArray(item.options) || item.options.length !== 4 ||
        typeof item.correctAnswer !== 'number' ||
        item.correctAnswer < 0 || item.correctAnswer > 3 ||
        typeof item.explanation !== 'string'
      ) {
        continue;
      }

      const escaped = item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const existing = await Question.findOne({
        text: { $regex: new RegExp(escaped, 'i') },
      }).lean();
      const isDuplicate = !!existing;
      if (isDuplicate) duplicatesFound++;

      const createdQ = await Question.create({
        concept,
        difficulty: diffInt,
        text: item.text,
        options: item.options,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        source: 'AI Generated',
        exposure: 0,
      });

      generatedResults.push({ question: createdQ, isDuplicate });
    }

    if (generatedResults.length === 0) {
      return res.status(500).json({ message: 'AI returned invalid question structure. Please try again.' });
    }

    return res.status(201).json({
      message: `Successfully generated ${generatedResults.length} question(s).`,
      results: generatedResults,
      question: generatedResults[0].question,
      isDuplicate: generatedResults[0].isDuplicate,
    });
  } catch (err) {
    console.error('POST /api/admin/generate-question error:', err);
    return res.status(500).json({ message: 'Server error generating questions.' });
  }
});

module.exports = router;
