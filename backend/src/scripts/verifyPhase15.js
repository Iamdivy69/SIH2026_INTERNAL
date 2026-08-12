const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const StudentConcept = require('../models/StudentConcept');
const AssessmentSession = require('../models/AssessmentSession');
const Question = require('../models/Question');
const Response = require('../models/Response');

async function runVerification() {
  console.log('🔍 Starting Phase 15 Verification Suite...');
  
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGO_URI missing in environment.');
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB Atlas.');

  // 1. Verify Part 1: lastActiveAt field & seed backfill
  console.log('\n--- Part 1: User lastActiveAt Check ---');
  const totalUsers = await User.countDocuments({});
  const usersWithLastActive = await User.countDocuments({ lastActiveAt: { $exists: true } });
  console.log(`Users total: ${totalUsers}, with lastActiveAt: ${usersWithLastActive}`);
  if (usersWithLastActive < totalUsers) {
    console.log('⚠️ Backfilling missing lastActiveAt for existing documents...');
    await User.updateMany({ lastActiveAt: { $exists: false } }, { $set: { lastActiveAt: new Date() } });
    console.log('✅ Backfill complete.');
  }

  // 2. Verify Part 2: GET /api/admin/overview
  console.log('\n--- Part 2: Overview Aggregations ---');
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalAssessments = await AssessmentSession.countDocuments({ status: 'completed' });
  const questionBankSize = await Question.countDocuments({});
  const masteryAgg = await StudentConcept.aggregate([
    { $group: { _id: null, avgMastery: { $avg: '$mastery' } } }
  ]);
  const avgInstitutionMastery = masteryAgg.length > 0 ? Math.round(masteryAgg[0].avgMastery) : 0;
  
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

  console.log(`totalStudents: ${totalStudents}`);
  console.log(`totalAssessments: ${totalAssessments}`);
  console.log(`avgInstitutionMastery: ${avgInstitutionMastery}%`);
  console.log(`questionBankSize: ${questionBankSize}`);
  console.log(`violationsThisWeek: ${violationsThisWeek}`);

  // 3. Verify Part 3: Student Roster Aggregations
  console.log('\n--- Part 3: Student Roster Query ---');
  const students = await User.find({ role: 'student' }).lean();
  console.log(`Found ${students.length} student documents in DB.`);
  const sampleStudent = students[0];
  if (sampleStudent) {
    const concepts = await StudentConcept.find({ userId: sampleStudent._id }).lean();
    const sessions = await AssessmentSession.find({ userId: sampleStudent._id }).lean();
    const flagged = sessions.some(s => s.status === 'terminated' || (s.violationCount && s.violationCount >= 3));
    console.log(`Sample Student: ${sampleStudent.name} (${sampleStudent.email})`);
    console.log(`Concepts recorded: ${concepts.length}, Sessions: ${sessions.length}, Flagged: ${flagged}`);
  }

  // 4. Verify Part 4: Student Detail View Data
  console.log('\n--- Part 4: Student Detail Aggregations ---');
  if (sampleStudent) {
    const userSessions = await AssessmentSession.find({ userId: sampleStudent._id }).lean();
    const violationLog = [];
    userSessions.forEach(s => {
      if (Array.isArray(s.violations)) {
        s.violations.forEach(v => {
          violationLog.push({ type: v.type, timestamp: v.timestamp, sessionId: s.sessionId });
        });
      }
    });
    console.log(`Student ${sampleStudent.name} violation log entries: ${violationLog.length}`);
  }

  // 5. Verify Part 5: Question Bank Health
  console.log('\n--- Part 5: Question Bank Health Matrix ---');
  const CANONICAL_CONCEPTS = ['Arrays', 'Linked Lists', 'Binary Trees', 'BST', 'AVL', 'Graphs', 'BFS', 'Dijkstra'];
  for (const concept of CANONICAL_CONCEPTS) {
    const qCount = await Question.countDocuments({ concept });
    const unserved = await Question.countDocuments({ concept, timesServed: { $eq: 0 } });
    console.log(`Concept: ${concept.padEnd(14)} Total Questions: ${qCount.toString().padStart(3)}, Unserved: ${unserved}`);
  }

  console.log('\n🎉 Phase 15 Verification Suite Completed Successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

runVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
