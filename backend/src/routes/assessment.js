const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Question = require('../models/Question');
const Response = require('../models/Response');
const StudentConcept = require('../models/StudentConcept');
const AssessmentSession = require('../models/AssessmentSession');
const MasteryLog = require('../models/MasteryLog');

// ── Constants ────────────────────────────────────────────────────
const CONSECUTIVE_THRESHOLD  = 2;   // correct streak before bumping difficulty
const MAX_QUESTIONS_PER_SESSION = 7;
const K_STUDENT  = 24; // Elo student adjustment factor
const K_QUESTION = 8;  // Elo question adjustment factor

// Difficulty threshold → target difficulty
function masteryToDifficulty(mastery) {
  if (mastery < 40)  return 1;
  if (mastery < 70)  return 2;
  return 3;
}

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Get ALL question IDs ever answered by a user across their entire lifetime history.
 * Per Phase 13: Lifetime No-Repeat Guarantee.
 */
async function getLifetimeAnsweredQuestionIds(userId) {
  const responses = await Response.find({ userId }).select('questionId').lean();
  return responses.map(r => r.questionId.toString());
}

/**
 * Derive consecutive correct streak for a concept in a session.
 */
async function getConsecutiveCorrect(userId, sessionId, concept) {
  const recent = await Response.find({ userId, sessionId, concept })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  let streak = 0;
  for (const r of recent) {
    if (r.isCorrect) streak++;
    else break;
  }
  return streak;
}

/**
 * Get the last response for a concept in this session (to check for reinforcement).
 */
async function getLastResponseForConcept(userId, sessionId, concept) {
  return Response.findOne({ userId, sessionId, concept })
    .sort({ createdAt: -1 })
    .lean();
}

/**
 * Count how many questions have been answered in this session.
 */
async function getSessionAnswerCount(userId, sessionId) {
  return Response.countDocuments({ userId, sessionId });
}

/**
 * Build human-readable reason string for explainability panel incorporating Elo rating.
 */
function buildReason({ concept, mastery, abilityRating, consecutiveCorrect, lastWasIncorrect, isReinforcement }) {
  const eloTag = `Matched to your current ${concept} ability rating (${abilityRating || 1100})`;
  if (isReinforcement) {
    return `${eloTag} · Reinforcement after recent miss on ${concept}`;
  }
  if (consecutiveCorrect >= CONSECUTIVE_THRESHOLD) {
    return `${eloTag} · Advancing difficulty after ${consecutiveCorrect} consecutive correct`;
  }
  if (mastery < 40) {
    return `${eloTag} · Weak area: building foundational understanding`;
  }
  if (mastery < 70) {
    return `${eloTag} · Developing area: medium difficulty challenge`;
  }
  return `${eloTag} · Strong area: high difficulty mastery problem`;
}

// ── GET /api/assessment/current ──────────────────────────────────
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Clean up stale sessions (> 2 hours old)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await AssessmentSession.updateMany(
      { userId, status: 'in_progress', createdAt: { $lt: twoHoursAgo } },
      { $set: { status: 'terminated', terminationReason: 'stale_timeout' } }
    );

    const activeSessions = await AssessmentSession.find({ userId, status: 'in_progress' }).sort({ createdAt: -1 });

    if (!activeSessions.length) {
      return res.json({ inProgress: false, session: null });
    }

    return res.json({ inProgress: true, session: activeSessions[0] });
  } catch (err) {
    console.error('GET /api/assessment/current error:', err);
    return res.status(500).json({ message: 'Server error checking current session.' });
  }
});

// ── POST /api/assessment/start ────────────────────────────────────
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { sessionId, mode = 'adaptive', concept } = req.body;
    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required.' });
    }

    // Terminate any previous lingering in_progress sessions for this user
    await AssessmentSession.updateMany(
      { userId, status: 'in_progress' },
      { $set: { status: 'terminated', terminationReason: 'new_session_started' } }
    );

    const sessionDoc = await AssessmentSession.create({
      userId,
      sessionId,
      mode,
      concept,
      status: 'in_progress',
      violationCount: 0,
      violations: [],
    });

    return res.status(201).json({ session: sessionDoc });
  } catch (err) {
    console.error('POST /api/assessment/start error:', err);
    return res.status(500).json({ message: 'Server error starting assessment session.' });
  }
});

// ── POST /api/assessment/violation ────────────────────────────────
router.post('/violation', authMiddleware, async (req, res) => {
  try {
    const { sessionId, type } = req.body;
    const userId = req.user.id;

    if (!sessionId || !type) {
      return res.status(400).json({ message: 'sessionId and type are required.' });
    }

    let sessionDoc = await AssessmentSession.findOne({ sessionId, userId });
    if (!sessionDoc) {
      sessionDoc = await AssessmentSession.create({
        userId,
        sessionId,
        status: 'in_progress',
        violationCount: 0,
        violations: [],
      });
    }

    if (sessionDoc.status === 'terminated') {
      return res.status(403).json({
        message: 'Assessment already terminated due to excessive proctoring violations.',
        isTerminated: true,
        violationCount: sessionDoc.violationCount,
      });
    }

    sessionDoc.violationCount += 1;
    sessionDoc.violations.push({ type, timestamp: new Date() });

    const isTerminated = sessionDoc.violationCount > 3;
    if (isTerminated) {
      sessionDoc.status = 'terminated';
      sessionDoc.terminationReason = 'excessive_violations';
    }

    await sessionDoc.save();

    return res.json({
      violationCount: sessionDoc.violationCount,
      isTerminated,
      violations: sessionDoc.violations,
    });
  } catch (err) {
    console.error('POST /api/assessment/violation error:', err);
    return res.status(500).json({ message: 'Server error recording violation.' });
  }
});

// ── POST /api/assessment/quit ────────────────────────────────────
router.post('/quit', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    // Terminate target session AND any lingering in_progress sessions for this user
    await AssessmentSession.updateMany(
      { userId, status: 'in_progress' },
      { $set: { status: 'terminated', terminationReason: 'user_quit' } }
    );

    if (sessionId) {
      await AssessmentSession.findOneAndUpdate(
        { sessionId, userId },
        { $set: { status: 'terminated', terminationReason: 'user_quit' } },
        { upsert: true }
      );
    }

    return res.json({ message: 'Assessment session quit successfully.' });
  } catch (err) {
    console.error('POST /api/assessment/quit error:', err);
    return res.status(500).json({ message: 'Server error quitting assessment session.' });
  }
});

// ── GET /api/assessment/next?sessionId=xxx ───────────────────────
router.get('/next', authMiddleware, async (req, res) => {
  try {
    const { sessionId, mode: queryMode, concept: queryConcept } = req.query;
    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId query param is required.' });
    }

    const userId = req.user.id;

    // 0. Proctoring & Session Check
    let sessionDoc = await AssessmentSession.findOne({ sessionId, userId });

    // Determine mode & concept from authoritative sessionDoc or query fallback
    const sessionMode = sessionDoc?.mode || queryMode || 'adaptive';
    const sessionConcept = sessionDoc?.concept || queryConcept;
    const maxQuestions = sessionMode === 'diagnostic' ? 10 : MAX_QUESTIONS_PER_SESSION;

    if (sessionDoc && sessionDoc.status === 'terminated') {
      return res.status(403).json({
        message: 'Assessment terminated due to excessive proctoring violations.',
        isTerminated: true,
        violationCount: sessionDoc.violationCount,
      });
    }

    // 1. Session Complete Check
    const answeredCount = await getSessionAnswerCount(userId, sessionId);
    if (answeredCount >= maxQuestions) {
      if (sessionDoc && sessionDoc.status !== 'completed') {
        sessionDoc.status = 'completed';
        sessionDoc.completedAt = new Date();
        await sessionDoc.save();

        if (sessionMode === 'diagnostic') {
          const User = require('../models/User');
          await User.findByIdAndUpdate(userId, { hasCompletedDiagnostic: true });
        }
      }
      return res.status(200).json({ done: true, questionsAnswered: answeredCount, totalQuestions: maxQuestions });
    }

    // 2. Read StudentConcept rows for user
    const allConcepts = await StudentConcept.find({ userId }).lean();
    if (!allConcepts.length) {
      return res.status(404).json({ message: 'No concept data found. Please sign up again.' });
    }

    // 3. Lifetime Answered Question IDs (Lifetime No-Repeat Guarantee)
    const lifetimeAnsweredIds = await getLifetimeAnsweredQuestionIds(userId);
    const objectIdExclusions = lifetimeAnsweredIds.map(id => {
      try { return require('mongoose').Types.ObjectId.createFromHexString(id); } catch { return null; }
    }).filter(Boolean);

    // 4. Select target concept based on mode
    let targetConceptDoc = null;
    let consecutiveCorrect = 0;
    let lastWasIncorrect = false;
    let candidateQuestions = [];

    const CANONICAL_CONCEPTS = [
      'Arrays', 'Linked Lists', 'Binary Trees', 'BST',
      'AVL', 'Graphs', 'BFS', 'Dijkstra'
    ];

    if (sessionMode === 'diagnostic') {
      // Diagnostic mode: cycle round-robin through all 8 concepts
      const targetConceptName = CANONICAL_CONCEPTS[answeredCount % CANONICAL_CONCEPTS.length];
      targetConceptDoc = allConcepts.find(c => c.concept === targetConceptName) || { concept: targetConceptName, mastery: 50, abilityRating: 1100 };

      const unserved = await Question.find({
        concept: targetConceptName,
        _id: { $nin: objectIdExclusions },
      }).lean();

      if (unserved.length === 0) {
        candidateQuestions = await Question.find({ concept: targetConceptName }).lean();
      } else {
        candidateQuestions = unserved;
      }
      consecutiveCorrect = await getConsecutiveCorrect(userId, sessionId, targetConceptName);
      const lastResponse = await getLastResponseForConcept(userId, sessionId, targetConceptName);
      lastWasIncorrect = !!(lastResponse && !lastResponse.isCorrect);

    } else if (sessionMode === 'targeted' && sessionConcept) {
      // Targeted mode: restrict selection strictly to specified concept
      const targetConceptName = sessionConcept;
      targetConceptDoc = allConcepts.find(c => c.concept === targetConceptName) || { concept: targetConceptName, mastery: 50, abilityRating: 1100 };

      const unserved = await Question.find({
        concept: targetConceptName,
        _id: { $nin: objectIdExclusions },
      }).lean();

      if (unserved.length === 0) {
        candidateQuestions = await Question.find({ concept: targetConceptName }).lean();
      } else {
        candidateQuestions = unserved;
      }
      consecutiveCorrect = await getConsecutiveCorrect(userId, sessionId, targetConceptName);
      const lastResponse = await getLastResponseForConcept(userId, sessionId, targetConceptName);
      lastWasIncorrect = !!(lastResponse && !lastResponse.isCorrect);

    } else {
      // Adaptive mode: mix of topics prioritized by lowest mastery
      const sortedConcepts = [...allConcepts].sort((a, b) => a.mastery - b.mastery);
      const validConceptDocs = [];

      for (const cDoc of sortedConcepts) {
        const countInBank = await Question.countDocuments({ concept: cDoc.concept });
        if (countInBank > 0) {
          validConceptDocs.push(cDoc);
        }
      }

      if (validConceptDocs.length > 0) {
        // Rotate concept based on question index to ensure a diverse mix of topics
        const conceptIndex = answeredCount % validConceptDocs.length;
        const conceptDoc = validConceptDocs[conceptIndex];
        const { concept } = conceptDoc;

        const unserved = await Question.find({
          concept,
          _id: { $nin: objectIdExclusions },
        }).lean();

        if (unserved.length === 0) {
          candidateQuestions = await Question.find({ concept }).lean();
        } else {
          candidateQuestions = unserved;
        }

        const streak = await getConsecutiveCorrect(userId, sessionId, concept);
        const lastResponse = await getLastResponseForConcept(userId, sessionId, concept);
        const wasIncorrect = lastResponse && !lastResponse.isCorrect;

        targetConceptDoc = conceptDoc;
        consecutiveCorrect = streak;
        lastWasIncorrect = !!wasIncorrect;
      }
    }

    if (!targetConceptDoc || candidateQuestions.length === 0) {
      return res.status(200).json({ done: true, questionsAnswered: answeredCount, totalQuestions: maxQuestions });
    }

    const { concept, mastery, abilityRating } = targetConceptDoc;
    const studentElo = abilityRating || (1100 + (mastery - 50) * 8);

    // 5. Phase 12 Candidate Scoring & Top-N Selection
    const scoredCandidates = candidateQuestions.map(q => {
      const qElo = q.eloRating || (q.difficulty === 1 ? 1000 : q.difficulty === 2 ? 1250 : 1500);
      const ratingGap = Math.abs(qElo - studentElo);
      const exposure = q.exposure || 0;
      const exposurePenalty = exposure / (exposure + 10);
      const score = ratingGap + (exposurePenalty * 150);
      return { question: q, score };
    });

    scoredCandidates.sort((a, b) => a.score - b.score);

    const topNCount = Math.min(3, scoredCandidates.length);
    const selectedPair = scoredCandidates[Math.floor(Math.random() * topNCount)];
    const question = selectedPair.question;

    // 6. Increment question exposure count
    await Question.findByIdAndUpdate(question._id, { $inc: { exposure: 1 } });

    // 7. Build Reasoning Object with Elo ability rating
    const isReinforcement = lastWasIncorrect && consecutiveCorrect === 0;
    const reasoning = {
      concept,
      mastery,
      abilityRating: studentElo,
      targetDifficulty: question.difficulty,
      consecutiveCorrect,
      isReinforcement,
      mode: sessionMode,
      reason: buildReason({ concept, mastery, abilityRating: studentElo, consecutiveCorrect, lastWasIncorrect, isReinforcement }),
    };

    // 8. Return question WITHOUT correctAnswer
    const { correctAnswer, ...questionSafe } = question;

    return res.json({
      question: questionSafe,
      reasoning,
      questionsAnswered: answeredCount,
      totalQuestions: maxQuestions,
      mode: sessionMode,
      concept: sessionConcept,
    });
  } catch (err) {
    console.error('GET /api/assessment/next error:', err);
    return res.status(500).json({ message: 'Server error in hybrid adaptive engine.' });
  }
});

// ── POST /api/assessment/answer ──────────────────────────────────
router.post('/answer', authMiddleware, async (req, res) => {
  try {
    const { questionId, selectedAnswer, timeSpent, sessionId } = req.body;
    const userId = req.user.id;

    if (!questionId || selectedAnswer === undefined || !sessionId) {
      return res.status(400).json({ message: 'questionId, selectedAnswer, and sessionId are required.' });
    }

    // 0. Proctoring Check
    const sessionDoc = await AssessmentSession.findOne({ sessionId, userId });
    if (sessionDoc && sessionDoc.status === 'terminated') {
      return res.status(403).json({
        message: 'Assessment terminated due to excessive proctoring violations.',
        isTerminated: true,
        violationCount: sessionDoc.violationCount,
      });
    }

    const sessionMode = sessionDoc?.mode || 'adaptive';
    const maxQuestions = sessionMode === 'diagnostic' ? 10 : MAX_QUESTIONS_PER_SESSION;

    // 1. Fetch Question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    // 2. Fetch StudentConcept
    let conceptDoc = await StudentConcept.findOne({ userId, concept: question.concept });
    if (!conceptDoc) {
      conceptDoc = await StudentConcept.create({
        userId,
        concept: question.concept,
        mastery: 50,
        abilityRating: 1100,
      });
    }

    // 3. Phase 12 Paired Elo Rating Calculation
    const sElo = conceptDoc.abilityRating || (1100 + (conceptDoc.mastery - 50) * 8);
    const qElo = question.eloRating || (question.difficulty === 1 ? 1000 : question.difficulty === 2 ? 1250 : 1500);

    const expected = 1 / (1 + Math.pow(10, (qElo - sElo) / 400));
    const actualScore = isCorrect ? 1 : 0;

    const newStudentElo  = Math.round(sElo + K_STUDENT * (actualScore - expected));
    const newQuestionElo = Math.round(qElo + K_QUESTION * (expected - actualScore));

    const newMastery = Math.max(0, Math.min(100, Math.round(50 + (newStudentElo - 1100) / 8)));
    const masteryChange = newMastery - conceptDoc.mastery;

    // Update StudentConcept
    await StudentConcept.findByIdAndUpdate(conceptDoc._id, {
      abilityRating: newStudentElo,
      mastery: newMastery,
    });

    // Update Question Elo & Response Counters
    await Question.findByIdAndUpdate(question._id, {
      eloRating: newQuestionElo,
      $inc: { timesAnswered: 1, timesCorrect: isCorrect ? 1 : 0 },
    });

    // 4. Persist Response
    await Response.create({
      userId,
      questionId: question._id,
      concept: question.concept,
      difficulty: question.difficulty,
      isCorrect,
      timeSpent: timeSpent || 0,
      sessionId,
    });

    // 5. Log MasteryLog Entry with Elo rating
    await MasteryLog.create({
      userId,
      concept: question.concept,
      mastery: newMastery,
      abilityRating: newStudentElo,
      delta: masteryChange,
      timestamp: new Date(),
    });

    // 6. Check Session Completion
    const questionsAnswered = await getSessionAnswerCount(userId, sessionId);
    const done = questionsAnswered >= maxQuestions;

    if (done && sessionDoc && sessionDoc.status !== 'completed') {
      sessionDoc.status = 'completed';
      sessionDoc.completedAt = new Date();
      await sessionDoc.save();

      if (sessionMode === 'diagnostic') {
        const User = require('../models/User');
        await User.findByIdAndUpdate(userId, { hasCompletedDiagnostic: true });
      }
    }

    return res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      masteryDelta: masteryChange,
      updatedMastery: newMastery,
      updatedAbilityRating: newStudentElo,
      updatedQuestionElo: newQuestionElo,
      questionsAnswered,
      totalQuestions: maxQuestions,
      done,
    });
  } catch (err) {
    console.error('POST /api/assessment/answer error:', err);
    return res.status(500).json({ message: 'Server error saving answer.' });
  }
});

module.exports = router;
