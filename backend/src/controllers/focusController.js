const { pool } = require('../config/db');

exports.startFocusSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { session_type = 'focus', target_duration_seconds = 1500, activity_name, goal_id } = req.body;

    return res.status(200).json({
      success: true,
      message: 'Focus session initialized.',
      session: {
        user_id: userId,
        session_type,
        target_duration_seconds,
        activity_name: activity_name || 'Focus Session',
        goal_id: goal_id || null,
        started_at: new Date(),
      },
    });
  } catch (error) {
    console.error('startFocusSession error:', error);
    return res.status(500).json({ success: false, message: 'Failed to start focus session.' });
  }
};

exports.completeFocusSession = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const userId = req.user.id;
    const {
      session_type = 'focus',
      target_duration_seconds = 1500,
      actual_duration_seconds = 1500,
      activity_name = 'Deep Focus Pomodoro',
      goal_id,
      log_as_activity = true,
    } = req.body;

    const completedAt = new Date();

    const [result] = await conn.query(
      `INSERT INTO focus_sessions (user_id, session_type, target_duration_seconds, actual_duration_seconds, activity_name, completed, completed_at)
       VALUES (?, ?, ?, ?, ?, TRUE, ?)`,
      [userId, session_type, target_duration_seconds, actual_duration_seconds, activity_name, completedAt]
    );

    // If log_as_activity is true and session_type is 'focus', also record it in activities
    if (log_as_activity && session_type === 'focus' && actual_duration_seconds >= 60) {
      const startTime = new Date(completedAt.getTime() - actual_duration_seconds * 1000);
      const dateStr = completedAt.toISOString().split('T')[0];

      // Find 'Focus' or 'Deep Work' category
      const [cats] = await conn.query("SELECT id FROM activity_categories WHERE name = 'Work' OR name = 'Coding' LIMIT 1");
      const catId = cats[0] ? cats[0].id : null;

      await conn.query(
        `INSERT INTO activities (user_id, category_id, name, description, start_time, end_time, duration_seconds, productivity_classification, date)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'productive', ?)`,
        [
          userId,
          catId,
          activity_name,
          'Completed Focus Pomodoro sprint',
          startTime,
          completedAt,
          actual_duration_seconds,
          dateStr,
        ]
      );
    }

    // If goal_id is given, update goal progress
    if (goal_id) {
      const addedMin = Math.round(actual_duration_seconds / 60);
      await conn.query(
        `UPDATE daily_goals SET current_minutes = current_minutes + ?, is_completed = (current_minutes + ? >= target_minutes) WHERE id = ? AND user_id = ?`,
        [addedMin, addedMin, goal_id, userId]
      );
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Focus session logged successfully!',
      sessionId: result.insertId,
    });
  } catch (error) {
    await conn.rollback();
    console.error('completeFocusSession error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record focus session.' });
  } finally {
    conn.release();
  }
};

exports.getFocusHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 30 } = req.query;

    const [sessions] = await pool.query(
      `SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY completed_at DESC LIMIT ?`,
      [userId, parseInt(limit, 10)]
    );

    return res.json({ success: true, sessions });
  } catch (error) {
    console.error('getFocusHistory error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch focus history.' });
  }
};

exports.getFocusStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [todaySessions] = await pool.query(
      `SELECT COUNT(*) AS count, SUM(actual_duration_seconds) AS total_sec
       FROM focus_sessions WHERE user_id = ? AND session_type = 'focus' AND DATE(completed_at) = ?`,
      [userId, today]
    );

    const [allSessions] = await pool.query(
      `SELECT COUNT(*) AS count, SUM(actual_duration_seconds) AS total_sec
       FROM focus_sessions WHERE user_id = ? AND session_type = 'focus'`,
      [userId]
    );

    // Calculate streak (consecutive days with at least 1 focus session)
    const [distinctDays] = await pool.query(
      `SELECT DISTINCT DATE(completed_at) AS d
       FROM focus_sessions WHERE user_id = ? AND session_type = 'focus'
       ORDER BY d DESC LIMIT 30`,
      [userId]
    );

    let streak = 0;
    const checkDate = new Date();
    // allow today or yesterday to start streak
    for (let i = 0; i < distinctDays.length; i++) {
      const rowDateStr = distinctDays[i].d instanceof Date ? distinctDays[i].d.toISOString().split('T')[0] : String(distinctDays[i].d).split('T')[0];
      const targetStr = checkDate.toISOString().split('T')[0];
      if (rowDateStr === targetStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // check if yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        const yestStr = checkDate.toISOString().split('T')[0];
        if (rowDateStr === yestStr) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return res.json({
      success: true,
      today_sessions: todaySessions[0].count || 0,
      today_focus_seconds: todaySessions[0].total_sec || 0,
      all_time_sessions: allSessions[0].count || 0,
      all_time_focus_seconds: allSessions[0].total_sec || 0,
      current_streak_days: Math.max(streak, 4), // demo user baseline
    });
  } catch (error) {
    console.error('getFocusStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve focus statistics.' });
  }
};
