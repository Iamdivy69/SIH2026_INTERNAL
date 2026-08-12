const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Atlas connection failed (${error.message}). Starting MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ Connected to local MongoMemoryServer: ${conn.connection.host}`);

      // Auto-seed if fallback memory server is fresh
      const Question = require('../models/Question');
      const count = await Question.countDocuments();
      if (count === 0) {
        console.log('🌱 Seeding initial questions and users into local MongoMemoryServer...');
        const seedQuestions = require('../scripts/seedQuestions');
        const seedAdmin = require('../scripts/seedAdminAndStudents');
        if (typeof seedQuestions === 'function') await seedQuestions();
        if (typeof seedAdmin === 'function') await seedAdmin();
      }
    } catch (fallbackErr) {
      console.error(`❌ Fallback MongoDB connection error: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
