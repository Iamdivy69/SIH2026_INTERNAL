/**
 * seedAllDemoData.js
 * Master seed script to populate complete demo dataset:
 * - Questions (seed bank)
 * - Admin & Mock Student Accounts (Priya, Rahul, Ananya, Dev, Demo Student, Proctor Demo)
 * - Question Elo Ratings
 * - User Diagnostic Flags
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

async function seedAll() {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    console.log('🌱 Starting Full Demo Data Seed...\n');

    console.log('--- 1. Seeding Base Questions ---');
    const seedQuestions = require('./seedQuestions');
    if (typeof seedQuestions === 'function') await seedQuestions();

    console.log('\n--- 2. Seeding Admin & Mock Students ---');
    const seedAdmin = require('./seedAdminAndStudents');
    if (typeof seedAdmin === 'function') await seedAdmin();

    console.log('\n--- 3. Running Question Elo Rating Migration ---');
    const migrateElo = require('./migrateQuestionElo');
    if (typeof migrateElo === 'function') await migrateElo();

    console.log('\n--- 4. Running Diagnostic Flag Migration ---');
    const migrateFlags = require('./migrateDiagnosticFlag');
    if (typeof migrateFlags === 'function') await migrateFlags();

    console.log('\n🎉 ALL DEMO DATA SEEDED SUCCESSFULLY!');

    if (require.main === module) {
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Demo Data Seeding Failed:', err);
    if (require.main === module) process.exit(1);
  }
}

if (require.main === module) {
  seedAll();
}

module.exports = seedAll;
