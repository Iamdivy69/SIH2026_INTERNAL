/**
 * migrateQuestionElo.js
 * One-time database migration script for Phase 14 Part 1.
 * Backfills `eloRating` across Question documents sitting at schema default (1100):
 * - difficulty 1 (easy)   → eloRating = 1000
 * - difficulty 2 (medium) → eloRating = 1250
 * - difficulty 3 (hard)   → eloRating = 1500
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Question = require('../models/Question');

async function migrate() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB for Question eloRating Migration');

    const beforeTier1 = await Question.countDocuments({ difficulty: 1, eloRating: 1100 });
    const beforeTier2 = await Question.countDocuments({ difficulty: 2, eloRating: 1100 });
    const beforeTier3 = await Question.countDocuments({ difficulty: 3, eloRating: 1100 });
    const totalBefore = beforeTier1 + beforeTier2 + beforeTier3;

    console.log(`📊 BEFORE Migration (questions at default 1100 eloRating):`);
    console.log(`   - Easy   (Diff 1, Elo 1100): ${beforeTier1}`);
    console.log(`   - Medium (Diff 2, Elo 1100): ${beforeTier2}`);
    console.log(`   - Hard   (Diff 3, Elo 1100): ${beforeTier3}`);
    console.log(`   - Total candidates: ${totalBefore}`);

    let updatedCount = 0;
    const questionsToMigrate = await Question.find({ eloRating: 1100 });

    for (const q of questionsToMigrate) {
      if (q.difficulty === 1) q.eloRating = 1000;
      else if (q.difficulty === 2) q.eloRating = 1250;
      else if (q.difficulty === 3) q.eloRating = 1500;
      await q.save();
      updatedCount++;
    }

    const afterTier1 = await Question.countDocuments({ difficulty: 1, eloRating: 1000 });
    const afterTier2 = await Question.countDocuments({ difficulty: 2, eloRating: 1250 });
    const afterTier3 = await Question.countDocuments({ difficulty: 3, eloRating: 1500 });
    const remainingDefault = await Question.countDocuments({ eloRating: 1100 });

    console.log(`\n✅ AFTER Migration:`);
    console.log(`   - Easy   (Diff 1, Elo 1000): ${afterTier1}`);
    console.log(`   - Medium (Diff 2, Elo 1250): ${afterTier2}`);
    console.log(`   - Hard   (Diff 3, Elo 1500): ${afterTier3}`);
    console.log(`   - Remaining at default 1100: ${remainingDefault}`);
    console.log(`🎉 Migration complete. Total questions updated: ${updatedCount}`);

    if (require.main === module) {
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Question Elo Migration Error:', err);
    if (require.main === module) process.exit(1);
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
