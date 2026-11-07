const { pool } = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    const unreadCount = rows.filter((r) => !r.is_read).length;
    return res.json({ success: true, notifications: rows, unreadCount });
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (id === 'all') {
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    } else {
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
    }

    return res.json({ success: true, message: 'Marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (id === 'all') {
      await pool.query('DELETE FROM notifications WHERE user_id = ?', [userId]);
    } else {
      await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [id, userId]);
    }

    return res.json({ success: true, message: 'Notification removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete notification.' });
  }
};

exports.sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title = 'Time Intelligence Reminder', message = 'Time to take a 5-minute break and stretch.', type = 'reminder', link = '/focus' } = req.body;

    const [result] = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)`,
      [userId, title, message, type, link]
    );

    return res.status(201).json({ success: true, notificationId: result.insertId, message: 'Notification dispatched.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to dispatch notification.' });
  }
};
