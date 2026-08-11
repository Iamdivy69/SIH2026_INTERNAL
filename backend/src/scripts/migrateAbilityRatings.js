/**
 * migrateAbilityRatings.js
 * One-time database migration script for Phase 12.
 * Backfills `abilityRating` across EVERY `StudentConcept` document in MongoDB:
 * abilityRating = 1100 + (mastery - 50) * 8
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const StudentConcept = require('../models/StudentConcept');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for abilityRating Backfill Migration');

    const allConcepts = await StudentConcept.find({});
    console.log(`Found ${allConcepts.length} StudentConcept documents across all users.`);

    let updatedCount = 0;
    for (const doc of allConcepts) {
      const calculatedAbility = 1100 + (doc.mastery - 50) * 8;
      doc.abilityRating = calculatedAbility;
      await doc.save();
      updatedCount++;
    }

    console.log(`✅ Backfilled abilityRating for ${updatedCount} StudentConcept documents.`);
    await mongoose.disconnect();
    if (require.main === module) process.exit(0);
  } catch (err) {
    console.error('❌ Migration Error:', err);
    if (require.main === module) process.exit(1);
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
