const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    concept: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    timeSpent: {
      type: Number, // seconds
      default: 0,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for the two key queries in the adaptive engine
responseSchema.index({ userId: 1, sessionId: 1 });
responseSchema.index({ userId: 1, sessionId: 1, concept: 1, createdAt: -1 });

module.exports = mongoose.model('Response', responseSchema);
