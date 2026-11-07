const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'time_intelligence_secret_key');
    
    const [users] = await pool.query(
      'SELECT id, email, full_name, avatar_url, role, timezone, daily_target_hours, onboarding_completed FROM users WHERE id = ?',
      [decoded.userId || decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ success: false, message: 'Invalid authentication token.' });
  }
}

// Optional auth middleware for public-accessible endpoints with personalized view if logged in
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'time_intelligence_secret_key');
      const [users] = await pool.query(
        'SELECT id, email, full_name, avatar_url, role, timezone, daily_target_hours, onboarding_completed FROM users WHERE id = ?',
        [decoded.userId || decoded.id]
      );
      if (users.length > 0) {
        req.user = users[0];
      }
    }
  } catch (e) {
    // ignore token errors for optional auth
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
};
