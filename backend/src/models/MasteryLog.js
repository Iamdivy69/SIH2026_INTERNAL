const mongoose = require('mongoose');

const masteryLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  concept: {
    type: String,
    required: true,
    index: true,
  },
  mastery: {
    type: Number,
    required: true,
  },
  abilityRating: {
    type: Number,
    default: 1100,
  },
  delta: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('MasteryLog', masteryLogSchema);
