const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await pool.query(
      'SELECT id, email, full_name, avatar_url, role, timezone, daily_target_hours, onboarding_completed, created_at FROM users WHERE id = ?',
      [userId]
    );

    const [settings] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
    const [subscription] = await pool.query('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);

    return res.json({
      success: true,
      profile: users[0],
      settings: settings[0] || {},
      subscription: subscription[0] || { plan: 'free', status: 'active' },
    });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, avatar_url, role, timezone, daily_target_hours } = req.body;

    await pool.query(
      `UPDATE users SET
        full_name = COALESCE(?, full_name),
        avatar_url = COALESCE(?, avatar_url),
        role = COALESCE(?, role),
        timezone = COALESCE(?, timezone),
        daily_target_hours = COALESCE(?, daily_target_hours)
       WHERE id = ?`,
      [full_name, avatar_url, role, timezone, daily_target_hours ? parseFloat(daily_target_hours) : null, userId]
    );

    const [users] = await pool.query(
      'SELECT id, email, full_name, avatar_url, role, timezone, daily_target_hours FROM users WHERE id = ?',
      [userId]
    );

    return res.json({ success: true, message: 'Profile updated successfully!', profile: users[0] });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      theme,
      pomodoro_focus_min,
      pomodoro_short_break_min,
      pomodoro_long_break_min,
      sound_enabled,
      email_notifications,
      push_notifications,
      daily_reminder_time,
      weekly_review_day,
    } = req.body;

    await pool.query(
      `INSERT INTO user_settings (user_id, theme, pomodoro_focus_min, pomodoro_short_break_min, pomodoro_long_break_min, sound_enabled, email_notifications, push_notifications, daily_reminder_time, weekly_review_day)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        theme = COALESCE(VALUES(theme), theme),
        pomodoro_focus_min = COALESCE(VALUES(pomodoro_focus_min), pomodoro_focus_min),
        pomodoro_short_break_min = COALESCE(VALUES(pomodoro_short_break_min), pomodoro_short_break_min),
        pomodoro_long_break_min = COALESCE(VALUES(pomodoro_long_break_min), pomodoro_long_break_min),
        sound_enabled = COALESCE(VALUES(sound_enabled), sound_enabled),
        email_notifications = COALESCE(VALUES(email_notifications), email_notifications),
        push_notifications = COALESCE(VALUES(push_notifications), push_notifications),
        daily_reminder_time = COALESCE(VALUES(daily_reminder_time), daily_reminder_time),
        weekly_review_day = COALESCE(VALUES(weekly_review_day), weekly_review_day)`,
      [
        userId,
        theme || 'dark',
        pomodoro_focus_min || 25,
        pomodoro_short_break_min || 5,
        pomodoro_long_break_min || 15,
        sound_enabled !== undefined ? sound_enabled : true,
        email_notifications !== undefined ? email_notifications : true,
        push_notifications !== undefined ? push_notifications : true,
        daily_reminder_time || '09:00',
        weekly_review_day || 'Sunday',
      ]
    );

    const [settings] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [userId]);

    return res.json({ success: true, message: 'Settings saved successfully!', settings: settings[0] });
  } catch (error) {
    console.error('updateSettings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    const isMatch = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password.' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, userId]);

    return res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan, billing_cycle = 'monthly' } = req.body;

    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected.' });
    }

    const nextPeriod = new Date();
    if (billing_cycle === 'yearly') nextPeriod.setFullYear(nextPeriod.getFullYear() + 1);
    else nextPeriod.setMonth(nextPeriod.getMonth() + 1);

    await pool.query(
      `INSERT INTO subscriptions (user_id, plan, status, billing_cycle, current_period_end)
       VALUES (?, ?, 'active', ?, ?)
       ON DUPLICATE KEY UPDATE
        plan = VALUES(plan),
        status = 'active',
        billing_cycle = VALUES(billing_cycle),
        current_period_end = VALUES(current_period_end)`,
      [userId, plan, billing_cycle, nextPeriod]
    );

    const [sub] = await pool.query('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);

    return res.json({ success: true, message: `Upgraded to ${plan.toUpperCase()} plan!`, subscription: sub[0] });
  } catch (error) {
    console.error('updateSubscription error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update subscription.' });
  }
};
