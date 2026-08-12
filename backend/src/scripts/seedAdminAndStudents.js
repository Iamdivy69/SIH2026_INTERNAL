/**
 * seedAdminAndStudents.js — Phase 6 seed
 * Run: npm run seed:admin
 *
 * Creates:
 *   1 admin account (admin@parakh.ai / admin123)
 *   4 mock students with varied explicit mastery overrides
 *
 * Idempotent: deletes seeded accounts before re-creating.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const StudentConcept = require('../models/StudentConcept');

const connectDB = require('../config/db');

// All 8 canonical concepts with signup-default masteries
const DEFAULT_MASTERY = {
  'Arrays':        72,
  'Linked Lists':  65,
  'Binary Trees':  58,
  'BST':           43,
  'AVL':           38,
  'Graphs':        55,
  'BFS':           60,
  'Dijkstra':      48,
};

const Response = require('../models/Response');
const Question = require('../models/Question');

// Mock students with distinct mastery profiles
const TARGET_USERS = [
  {
    name: 'Aksh',
    email: 'aksh@demo.com',
    password: 'Aksh@123',
    role: 'admin',
  },
  {
    name: 'Divya',
    email: 'divya@demo.com',
    password: 'Divya@123',
    role: 'student',
    hasCompletedDiagnostic: true,
    overrides: {
      'Arrays': 88,
      'Linked Lists': 82,
      'Binary Trees': 75,
      'BST': 70,
      'AVL': 64,
      'Graphs': 50,
      'BFS': 45,
      'Dijkstra': 38,
    },
  },
  {
    name: 'Lakshmi',
    email: 'lakshmi@demo.com',
    password: 'Lakshmi@123',
    role: 'student',
    hasCompletedDiagnostic: true,
    overrides: {
      'BFS': 90,
      'Graphs': 85,
      'Dijkstra': 78,
      'Arrays': 65,
      'Linked Lists': 58,
      'Binary Trees': 48,
      'BST': 32,
      'AVL': 25,
    },
  },
];

async function seed() {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Delete ALL existing users, responses & student concepts
    await Response.deleteMany({});
    const deletedConcepts = await StudentConcept.deleteMany({});
    const deletedUsers = await User.deleteMany({});
    console.log(`🗑  Deleted ALL existing users (${deletedUsers.deletedCount}) and student concept data (${deletedConcepts.deletedCount})`);

    const sampleQuestions = await Question.find({}).limit(10).lean();

    // Create target accounts
    for (const u of TARGET_USERS) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      const user = await User.create({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        hasCompletedDiagnostic: u.hasCompletedDiagnostic ?? true,
      });

      if (u.role === 'student') {
        const masteryMap = { ...DEFAULT_MASTERY, ...(u.overrides || {}) };
        const conceptDocs = Object.entries(masteryMap).map(([concept, mastery]) => ({
          userId: user._id,
          concept,
          mastery,
          abilityRating: 1100 + (mastery - 50) * 8,
        }));
        await StudentConcept.insertMany(conceptDocs);

        // Seed distinct sample response history
        if (sampleQuestions.length > 0) {
          const isHighPerformer = u.name === 'Divya';
          const sampleResponses = sampleQuestions.map((q, idx) => ({
            userId: user._id,
            questionId: q._id,
            concept: q.concept,
            difficulty: q.difficulty || 1,
            isCorrect: isHighPerformer ? (idx % 4 !== 0) : (idx % 3 === 0),
            timeSpent: 15 + idx * 3,
            sessionId: `demo_seed_${user._id}_${idx}`,
          }));
          await Response.insertMany(sampleResponses);
        }

        console.log(`✅ Student created: ${u.name} (${u.email}) / ${u.password} (Diagnostic: ${user.hasCompletedDiagnostic})`);
      } else {
        console.log(`✅ Admin created: ${u.name} (${u.email}) / ${u.password}`);
      }
    }

    // Print gap summary
    console.log('\n📊 Concept gap summary across all students:');
    const all = await StudentConcept.find({}).lean();
    const byConceptAll = {};
    all.forEach(c => {
      if (!byConceptAll[c.concept]) byConceptAll[c.concept] = [];
      byConceptAll[c.concept].push(c.mastery);
    });
    const sorted = Object.entries(byConceptAll)
      .map(([concept, masteries]) => ({
        concept,
        avg: Math.round(masteries.reduce((a, b) => a + b, 0) / masteries.length),
      }))
      .sort((a, b) => a.avg - b.avg);
    sorted.forEach(({ concept, avg }) => console.log(`   ${concept}: avg ${avg}%`));

    if (require.main === module) {
      await mongoose.disconnect();
      console.log('\n✅ Seed complete');
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Seed failed:', err);
    if (require.main === module) process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
