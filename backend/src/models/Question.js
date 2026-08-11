const mongoose = require('mongoose');

// concept MUST be one of the 8 canonical values that have StudentConcept rows.
// Subtopic flavor (e.g. "BST Deletion", "AVL Rotations") goes in text/explanation only.
const VALID_CONCEPTS = [
  'Arrays',
  'Linked Lists',
  'Binary Trees',
  'BST',
  'AVL',
  'Graphs',
  'BFS',
  'Dijkstra',
];

const questionSchema = new mongoose.Schema(
  {
    concept: {
      type: String,
      required: true,
      enum: VALID_CONCEPTS,
    },
    difficulty: {
      type: Number,
      required: true,
      enum: [1, 2, 3], // 1=easy, 2=medium, 3=hard
    },
    text: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      validate: {
        validator: (v) => v.length === 4,
        message: 'Options must have exactly 4 items',
      },
      required: true,
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: {
      type: String,
      required: true,
    },
    exposure: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ['seed', 'AI Generated', 'Bulk Generator'],
      default: 'seed',
    },
    eloRating: {
      type: Number,
      default: 1100,
      index: true,
    },
    timesCorrect: {
      type: Number,
      default: 0,
    },
    timesAnswered: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
