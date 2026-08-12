const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Access denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };

    // Throttled lastActiveAt update (if > 5 minutes since last update)
    const now = Date.now();
    if (!req.user.lastActiveAt || now - new Date(req.user.lastActiveAt).getTime() > 5 * 60 * 1000) {
      User.findByIdAndUpdate(decoded.id, { lastActiveAt: new Date(now) }).catch(() => {});
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
