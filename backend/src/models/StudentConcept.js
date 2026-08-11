const mongoose = require('mongoose');

const studentConceptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    concept: {
      type: String,
      required: true,
    },
    mastery: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 50,
    },
    abilityRating: {
      type: Number,
      default: 1100,
      index: true,
    },
  },
  { timestamps: true }
);

// Each user has exactly one row per concept
studentConceptSchema.index({ userId: 1, concept: 1 }, { unique: true });

module.exports = mongoose.model('StudentConcept', studentConceptSchema);
