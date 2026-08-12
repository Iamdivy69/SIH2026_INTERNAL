const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const StudentConcept = require('../models/StudentConcept');
const Response = require('../models/Response');
const MasteryLog = require('../models/MasteryLog');

// ── GET /api/student/state ────────────────────────────────────────
// Single source of truth for student concept mastery + detailed analytics
router.get('/state', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // All concept mastery rows
    let concepts = await StudentConcept.find({ userId })
      .sort({ concept: 1 })
      .lean();

    if (!concepts.length) {
      const DEFAULT_MASTERY = [
        { concept: 'Arrays',        mastery: 72, abilityRating: 1276 },
        { concept: 'Linked Lists',  mastery: 65, abilityRating: 1220 },
        { concept: 'Binary Trees',  mastery: 58, abilityRating: 1164 },
        { concept: 'BST',           mastery: 43, abilityRating: 1044 },
        { concept: 'AVL',           mastery: 38, abilityRating: 1004 },
        { concept: 'Graphs',        mastery: 55, abilityRating: 1140 },
        { concept: 'BFS',           mastery: 60, abilityRating: 1180 },
        { concept: 'Dijkstra',      mastery: 48, abilityRating: 1084 },
      ];
      await StudentConcept.insertMany(DEFAULT_MASTERY.map(c => ({ userId, ...c })));
      concepts = await StudentConcept.find({ userId }).sort({ concept: 1 }).lean();
    }

    // Overall mastery = average across all concepts
    const overallMastery = Math.round(
      concepts.reduce((sum, c) => sum + c.mastery, 0) / concepts.length
    );

    // Classify concepts
    const strong     = concepts.filter(c => c.mastery >= 70);
    const developing = concepts.filter(c => c.mastery >= 40 && c.mastery < 70);
    const weak       = concepts.filter(c => c.mastery < 40);

    // Extend each concept with analytics
    const enrichedConcepts = await Promise.all(
      concepts.map(async (c) => {
        // 1. Fetch MasteryLog history (last 10 records for sparkline)
        const historyLogs = await MasteryLog.find({ userId, concept: c.concept })
          .sort({ timestamp: 1 })
          .limit(10)
          .lean();

        const history = historyLogs.map(l => ({
          mastery: l.mastery,
          delta: l.delta,
          timestamp: l.timestamp,
        }));

        // 2. Fetch Response metrics for this concept
        const responses = await Response.find({ userId, concept: c.concept })
          .sort({ createdAt: -1 })
          .lean();

        const attemptCount = responses.length;
        const correctCount = responses.filter(r => r.isCorrect).length;
        const accuracy     = attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : 0;

        const totalTime    = responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
        const averageResponseTime = attemptCount > 0 ? Math.round(totalTime / attemptCount) : 0;

        // 3. Last 5 attempts as booleans
        const recentAttempts = responses.slice(0, 5).map(r => r.isCorrect).reverse();

        // 4. Compute trend from last 3 MasteryLog deltas
        const last3Deltas = historyLogs.slice(-3).map(l => l.delta);
        let trend = 'stable';
        if (last3Deltas.length > 0) {
          const avgDelta = last3Deltas.reduce((a, b) => a + b, 0) / last3Deltas.length;
          if (avgDelta > 1) trend = 'improving';
          else if (avgDelta < -1) trend = 'declining';
        }

        return {
          ...c,
          history,
          accuracy,
          attemptCount,
          averageResponseTime,
          recentAttempts,
          trend,
        };
      })
    );

    // Recent responses (last 20) for activity context
    const recentResponses = await Response.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('questionId', 'text concept difficulty')
      .lean();

    return res.json({
      concepts: enrichedConcepts,
      overallMastery,
      strong,
      developing,
      weak,
      recentResponses,
    });
  } catch (err) {
    console.error('GET /api/student/state error:', err);
    return res.status(500).json({ message: 'Server error fetching student state.' });
  }
});

module.exports = router;
