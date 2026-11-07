const { pool } = require('../config/db');

function getTodayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

exports.getGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, type = 'all' } = req.query;
    const targetDate = date || getTodayString();

    let dailyGoals = [];
    let weeklyGoals = [];

    if (type === 'all' || type === 'daily') {
      const [dg] = await pool.query(
        `SELECT g.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
         FROM daily_goals g
         LEFT JOIN activity_categories c ON g.category_id = c.id
         WHERE g.user_id = ? AND g.target_date = ?
         ORDER BY g.is_completed ASC, g.id DESC`,
        [userId, targetDate]
      );
      dailyGoals = dg;
    }

    if (type === 'all' || type === 'weekly') {
      const [wg] = await pool.query(
        `SELECT g.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
         FROM weekly_goals g
         LEFT JOIN activity_categories c ON g.category_id = c.id
         WHERE g.user_id = ?
         ORDER BY g.is_completed ASC, g.id DESC`,
        [userId]
      );
      weeklyGoals = wg;
    }

    return res.json({
      success: true,
      daily_goals: dailyGoals,
      weekly_goals: weeklyGoals,
    });
  } catch (error) {
    console.error('getGoals error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve goals.' });
  }
};

exports.createDailyGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, category_id, target_minutes, target_date } = req.body;

    if (!title || !target_minutes) {
      return res.status(400).json({ success: false, message: 'Title and target duration in minutes are required.' });
    }

    const goalDate = target_date || getTodayString();
    const [result] = await pool.query(
      `INSERT INTO daily_goals (user_id, title, category_id, target_minutes, current_minutes, target_date, is_completed)
       VALUES (?, ?, ?, ?, 0, ?, FALSE)`,
      [userId, title.trim(), category_id || null, parseInt(target_minutes, 10), goalDate]
    );

    const [created] = await pool.query(
      `SELECT g.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM daily_goals g
       LEFT JOIN activity_categories c ON g.category_id = c.id
       WHERE g.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ success: true, goal: created[0] });
  } catch (error) {
    console.error('createDailyGoal error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create daily goal.' });
  }
};

exports.createWeeklyGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, category_id, target_hours, week_start_date } = req.body;

    if (!title || !target_hours) {
      return res.status(400).json({ success: false, message: 'Title and target hours are required.' });
    }

    const startDate = week_start_date || getTodayString();
    const [result] = await pool.query(
      `INSERT INTO weekly_goals (user_id, title, category_id, target_hours, current_hours, week_start_date, is_completed)
       VALUES (?, ?, ?, ?, 0.00, ?, FALSE)`,
      [userId, title.trim(), category_id || null, parseFloat(target_hours), startDate]
    );

    const [created] = await pool.query(
      `SELECT g.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM weekly_goals g
       LEFT JOIN activity_categories c ON g.category_id = c.id
       WHERE g.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ success: true, goal: created[0] });
  } catch (error) {
    console.error('createWeeklyGoal error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create weekly goal.' });
  }
};

exports.updateDailyGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, category_id, target_minutes, current_minutes, is_completed } = req.body;

    const [existing] = await pool.query('SELECT * FROM daily_goals WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Daily goal not found.' });
    }

    const cur = existing[0];
    const newTarget = target_minutes !== undefined ? parseInt(target_minutes, 10) : cur.target_minutes;
    const newCurrent = current_minutes !== undefined ? parseInt(current_minutes, 10) : cur.current_minutes;
    const newCompleted = is_completed !== undefined ? Boolean(is_completed) : newCurrent >= newTarget;

    await pool.query(
      `UPDATE daily_goals SET
        title = COALESCE(?, title),
        category_id = ?,
        target_minutes = ?,
        current_minutes = ?,
        is_completed = ?
       WHERE id = ? AND user_id = ?`,
      [
        title ? title.trim() : cur.title,
        category_id !== undefined ? category_id : cur.category_id,
        newTarget,
        newCurrent,
        newCompleted,
        id,
        userId,
      ]
    );

    const [updated] = await pool.query(
      `SELECT g.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM daily_goals g
       LEFT JOIN activity_categories c ON g.category_id = c.id
       WHERE g.id = ?`,
      [id]
    );

    return res.json({ success: true, goal: updated[0] });
  } catch (error) {
    console.error('updateDailyGoal error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update goal.' });
  }
};

exports.deleteDailyGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM daily_goals WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    return res.json({ success: true, message: 'Goal deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete goal.' });
  }
};

exports.deleteWeeklyGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM weekly_goals WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    return res.json({ success: true, message: 'Goal deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete goal.' });
  }
};
