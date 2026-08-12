const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentConcept = require('../models/StudentConcept');

// Starting mastery values for every new student signup (demo defaults)
const DEFAULT_MASTERY = [
  { concept: 'Arrays',        mastery: 72 },
  { concept: 'Linked Lists',  mastery: 65 },
  { concept: 'Binary Trees',  mastery: 58 },
  { concept: 'BST',           mastery: 43 },
  { concept: 'AVL',           mastery: 38 },
  { concept: 'Graphs',        mastery: 55 },
  { concept: 'BFS',           mastery: 60 },
  { concept: 'Dijkstra',      mastery: 48 },
];

// Helper: sign JWT with user payload
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ── POST /api/auth/signup ─────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate presence
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check for existing user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user — role always 'student' for signup; admin via seed script only
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'student',
    });

    // Seed StudentConcept rows for all 8 concepts
    const conceptDocs = DEFAULT_MASTERY.map(({ concept, mastery }) => ({
      userId: user._id,
      concept,
      mastery,
    }));
    await StudentConcept.insertMany(conceptDocs);

    // Sign JWT
    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasCompletedDiagnostic: user.hasCompletedDiagnostic || false,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Server error during signup.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Sign JWT
    const token = signToken(user);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasCompletedDiagnostic: user.hasCompletedDiagnostic || false,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

// ── GET /api/auth/me — protected test route ───────────────────────
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/auth/seed-demo — endpoint to re-seed demo users ──
router.post('/seed-demo', async (req, res) => {
  try {
    const seedAdmin = require('../scripts/seedAdminAndStudents');
    await seedAdmin();
    return res.json({ message: 'Demo accounts seeded successfully.' });
  } catch (err) {
    console.error('Seed demo endpoint error:', err);
    return res.status(500).json({ message: 'Failed to seed demo accounts.', error: err.message });
  }
});

module.exports = router;
