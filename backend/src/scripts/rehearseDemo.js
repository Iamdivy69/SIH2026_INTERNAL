const mongoose = require('mongoose');
require('dotenv').config();

async function runRealDemoRehearsal() {
  const API = process.env.VITE_API_URL || 'http://localhost:5000';

  // 1. Re-seed clean demo account first
  const seed = require('./seedAdminAndStudents');
  await seed();
  await new Promise(r => setTimeout(r, 1000));

  // 2. Login as demo@parakh.ai
  const loginRes = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@parakh.ai', password: 'student123' }),
  });
  const { token, user } = await loginRes.json();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const sessionId = 'live-demo-session-' + Date.now();

  console.log(`\n=== REAL DEMO REHEARSAL FOR ${user.name} (${user.email}) ===`);
  console.log(`Session ID: ${sessionId}\n`);

  // Target answer sequence: [CORRECT, CORRECT, INCORRECT, CORRECT, CORRECT, CORRECT, CORRECT]
  const sequence = [true, true, false, true, true, true, true];

  for (let i = 0; i < sequence.length; i++) {
    // GET next question
    const nextRes = await fetch(`${API}/api/assessment/next?sessionId=${sessionId}`, { headers });
    const nextData = await nextRes.json();

    if (nextData.done) {
      console.log(`Session finished early at Q${i+1}`);
      break;
    }

    const q = nextData.question;
    const r = nextData.reasoning;
    const isTargetCorrect = sequence[i];

    // Answer question (if target correct, we need correct answer, so fetch question from DB to know index)
    const Question = require('../models/Question');
    await mongoose.connect(process.env.MONGO_URI);
    const dbQ = await Question.findById(q._id);
    await mongoose.disconnect();

    const selectedAnswer = isTargetCorrect ? dbQ.correctAnswer : (dbQ.correctAnswer + 1) % 4;

    const ansRes = await fetch(`${API}/api/assessment/answer`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        questionId: q._id,
        selectedAnswer,
        timeSpent: 20,
        sessionId,
      }),
    });
    const ansData = await ansRes.json();

    console.log(`Q${i+1}: [${q.concept} D${q.difficulty}] ${isTargetCorrect ? '✓ CORRECT' : '✗ INCORRECT'}`);
    console.log(`    Reasoning: "${r.reason}"`);
    console.log(`    Outcome: isCorrect=${ansData.isCorrect}, delta=${ansData.masteryDelta}, new ${q.concept} mastery=${ansData.updatedMastery}%\n`);
  }

  // Check final student state
  const stateRes = await fetch(`${API}/api/student/state`, { headers });
  const state = await stateRes.json();

  console.log('=== FINAL DEMO STATE (GET /api/student/state) ===');
  console.log(`Overall Mastery: ${state.overallMastery}%`);
  console.log('Concept Masteries:');
  state.concepts.forEach(c => console.log(`  - ${c.concept}: ${c.mastery}%`));
  console.log(`Strong (${state.strong.length}): ${state.strong.map(c => c.concept).join(', ') || 'none'}`);
  console.log(`Developing (${state.developing.length}): ${state.developing.map(c => c.concept).join(', ') || 'none'}`);
  console.log(`Needs Attention (${state.weak.length}): ${state.weak.map(c => c.concept).join(', ') || 'none'}`);
}

runRealDemoRehearsal();
