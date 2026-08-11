const mongoose = require('mongoose');

const assessmentSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'terminated'],
    default: 'in_progress',
  },
  violationCount: {
    type: Number,
    default: 0,
  },
  violations: [
    {
      type: {
        type: String,
        enum: ['tab_switch', 'fullscreen_exit', 'window_blur'],
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  terminationReason: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('AssessmentSession', assessmentSessionSchema);
