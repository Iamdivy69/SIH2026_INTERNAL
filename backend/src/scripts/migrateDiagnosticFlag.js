/**
 * migrateDiagnosticFlag.js
 * One-time database migration script for Phase 14 Part 2.
 * Backfills `hasCompletedDiagnostic: true` ONLY for existing users with response history (Response.exists({ userId })).
 * Users without response history (e.g. fresh signups) are explicitly left with `hasCompletedDiagnostic: false`.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Response = require('../models/Response');

async function migrate() {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    console.log('✅ Connected to MongoDB for Diagnostic Flag Migration');

    const users = await User.find({});
    console.log(`📊 Processing ${users.length} user accounts...`);

    let setTrueCount = 0;
    let leftFalseCount = 0;

    for (const user of users) {
      const hasResponses = await Response.exists({ userId: user._id });
      if (hasResponses) {
        user.hasCompletedDiagnostic = true;
        await user.save();
        setTrueCount++;
        console.log(`   - ${user.email} (${user.name}): set hasCompletedDiagnostic = true (has response history)`);
      } else {
        user.hasCompletedDiagnostic = false;
        await user.save();
        leftFalseCount++;
        console.log(`   - ${user.email} (${user.name}): left hasCompletedDiagnostic = false (no response history)`);
      }
    }

    console.log(`\n✅ AFTER Migration:`);
    console.log(`   - Users set to hasCompletedDiagnostic = true: ${setTrueCount}`);
    console.log(`   - Users set to hasCompletedDiagnostic = false: ${leftFalseCount}`);
    console.log(`🎉 Diagnostic flag migration complete.`);

    if (require.main === module) {
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Diagnostic Flag Migration Error:', err);
    if (require.main === module) process.exit(1);
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
