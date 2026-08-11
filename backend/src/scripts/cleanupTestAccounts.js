const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const StudentConcept = require('../models/StudentConcept');
const Response = require('../models/Response');

async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const testEmails = ['test@parakh.ai', 'test2@parakh.ai', 'tutor_grounding@parakh.ai'];
  const testUsers = await User.find({ email: { $in: testEmails } });

  if (testUsers.length > 0) {
    const ids = testUsers.map(u => u._id);
    await StudentConcept.deleteMany({ userId: { $in: ids } });
    await Response.deleteMany({ userId: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
    console.log(`🗑  Removed ${testUsers.length} test accounts (${testEmails.join(', ')})`);
  } else {
    console.log('✅ No leftover test accounts found');
  }

  await mongoose.disconnect();
}

cleanup();
