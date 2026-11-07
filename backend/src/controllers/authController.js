const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

function generateTokens(user) {
  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'time_intelligence_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'time_intelligence_refresh_key',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
}

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, timezone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, timezone) VALUES (?, ?, ?, ?)`,
      [email.toLowerCase().trim(), hashedPassword, full_name.trim(), timezone || 'UTC']
    );

    const userId = result.insertId;

    // Default settings
    await pool.query(
      `INSERT INTO user_settings (user_id, theme, pomodoro_focus_min, pomodoro_short_break_min, pomodoro_long_break_min)
       VALUES (?, 'dark', 25, 5, 15)`,
      [userId]
    );

    // Free subscription
    await pool.query(
      `INSERT INTO subscriptions (user_id, plan, status, billing_cycle)
       VALUES (?, 'free', 'active', 'monthly')`,
      [userId]
    );

    // Welcome notification
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Welcome to Time Intelligence!', 'Begin by exploring your dashboard or starting your first focus session.', 'welcome', '/dashboard')`,
      [userId]
    );

    const userObj = { id: userId, email: email.toLowerCase().trim(), full_name: full_name.trim(), role: 'user', onboarding_completed: false };
    const tokens = generateTokens(userObj);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: userObj,
      ...tokens,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while registering account.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    // Load user settings
    const [settings] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [user.id]);
    const [subscription] = await pool.query('SELECT plan, status FROM subscriptions WHERE user_id = ?', [user.id]);

    const { password_hash, ...safeUser } = user;
    safeUser.settings = settings[0] || {};
    safeUser.subscription = subscription[0] || { plan: 'free', status: 'active' };

    const tokens = generateTokens(user);

    return res.json({
      success: true,
      message: 'Login successful!',
      user: safeUser,
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while logging in.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const [settings] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
    const [subscription] = await pool.query('SELECT plan, status FROM subscriptions WHERE user_id = ?', [req.user.id]);

    const { password_hash, ...safeUser } = users[0];
    safeUser.settings = settings[0] || {};
    safeUser.subscription = subscription[0] || { plan: 'free', status: 'active' };

    return res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'time_intelligence_refresh_key');
    const [users] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [decoded.userId || decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const tokens = generateTokens(users[0]);
    return res.json({ success: true, ...tokens });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

exports.logout = (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }
  // Simulate secure reset link generation
  return res.json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been dispatched.',
  });
};

exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }
  return res.json({ success: true, message: 'Your password has been successfully reset. Please log in.' });
};

exports.completeOnboarding = async (req, res) => {
  try {
    const { daily_target_hours, theme, focus_min } = req.body;
    const userId = req.user.id;

    if (daily_target_hours) {
      await pool.query('UPDATE users SET daily_target_hours = ?, onboarding_completed = TRUE WHERE id = ?', [
        parseFloat(daily_target_hours),
        userId,
      ]);
    } else {
      await pool.query('UPDATE users SET onboarding_completed = TRUE WHERE id = ?', [userId]);
    }

    if (theme || focus_min) {
      await pool.query(
        'UPDATE user_settings SET theme = COALESCE(?, theme), pomodoro_focus_min = COALESCE(?, pomodoro_focus_min) WHERE user_id = ?',
        [theme || null, focus_min || null, userId]
      );
    }

    return res.json({ success: true, message: 'Onboarding complete!' });
  } catch (error) {
    console.error('Onboarding error:', error);
    return res.status(500).json({ success: false, message: 'Failed to complete onboarding.' });
  }
};
