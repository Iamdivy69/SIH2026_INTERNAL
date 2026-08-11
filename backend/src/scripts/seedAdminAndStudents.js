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

// Mock students — only overridden concepts listed; rest use defaults
const MOCK_STUDENTS = [
  {
    name: 'Priya Sharma',
    email: 'priya@parakh.ai',
    overrides: { BST: 25, AVL: 20, Arrays: 85, BFS: 70, Graphs: 65 },
  },
  {
    name: 'Rahul Gupta',
    email: 'rahul@parakh.ai',
    overrides: { BST: 72, AVL: 68, Arrays: 55, BFS: 40, Graphs: 35 },
  },
  {
    name: 'Ananya Singh',
    email: 'ananya@parakh.ai',
    overrides: { BST: 40, AVL: 35, Arrays: 60, BFS: 80, Graphs: 75 },
  },
  {
    name: 'Dev Patel',
    email: 'dev@parakh.ai',
    overrides: { BST: 15, AVL: 10, Arrays: 90, BFS: 55, Graphs: 50 },
  },
  {
    name: 'Demo Student',
    email: 'demo@parakh.ai',
    overrides: { BST: 43, AVL: 38, Arrays: 72, BFS: 60, Graphs: 55, Dijkstra: 48 },
  },
  {
    name: 'Proctor Demo',
    email: 'proctor_demo@parakh.ai',
    overrides: { BST: 43, AVL: 38, Arrays: 72 },
  },
];

const SEED_EMAILS = [
  'admin@parakh.ai',
  ...MOCK_STUDENTS.map(s => s.email),
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing seeded accounts (idempotent)
    const existingUsers = await User.find({ email: { $in: SEED_EMAILS } });
    if (existingUsers.length > 0) {
      const ids = existingUsers.map(u => u._id);
      await StudentConcept.deleteMany({ userId: { $in: ids } });
      await User.deleteMany({ _id: { $in: ids } });
      console.log(`🗑  Removed ${existingUsers.length} existing seeded accounts`);
    }

    // Create admin
    const adminHash = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@parakh.ai',
      passwordHash: adminHash,
      role: 'admin',
    });
    console.log(`✅ Admin created: admin@parakh.ai / admin123`);

    // Create mock students with overridden mastery
    const password = await bcrypt.hash('student123', 10);
    for (const s of MOCK_STUDENTS) {
      const user = await User.create({
        name: s.name,
        email: s.email,
        passwordHash: password,
        role: 'student',
      });

      // Merge defaults with overrides
      const masteryMap = { ...DEFAULT_MASTERY, ...s.overrides };
      const conceptDocs = Object.entries(masteryMap).map(([concept, mastery]) => ({
        userId: user._id,
        concept,
        mastery,
        abilityRating: 1100 + (mastery - 50) * 8, // Fix #1: inverse mapping backfill
      }));
      await StudentConcept.insertMany(conceptDocs);
      console.log(`✅ ${s.name} (${s.email}) — BST: ${masteryMap.BST}% (Elo ${1100 + (masteryMap.BST - 50) * 8}), AVL: ${masteryMap.AVL}% (Elo ${1100 + (masteryMap.AVL - 50) * 8})`);
    }

    // Print gap summary
    console.log('\n📊 Concept gap summary across all students (incl. admin):');
    const all = await StudentConcept.find({ userId: { $ne: admin._id } }).lean();
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

    await mongoose.disconnect();
    console.log('\n✅ Seed complete');
    if (require.main === module) process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    if (require.main === module) process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
