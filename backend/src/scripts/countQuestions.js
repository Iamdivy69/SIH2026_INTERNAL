const mongoose = require('mongoose');
require('dotenv').config();
const Question = require('../models/Question');

async function count() {
  await mongoose.connect(process.env.MONGO_URI);
  const total = await Question.countDocuments();
  const byConcept = await Question.aggregate([
    { $group: { _id: '$concept', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  console.log(`📊 TOTAL QUESTIONS IN MONGO DB: ${total}`);
  byConcept.forEach(c => console.log(`   - ${c._id}: ${c.count}`));
  await mongoose.disconnect();
}

count();
