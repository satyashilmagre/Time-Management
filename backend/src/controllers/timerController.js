const { pool } = require('../config/db');

function calculateCurrentElapsed(timer) {
  let elapsed = timer.elapsed_before_pause || 0;
  if (!timer.is_paused && timer.start_time) {
    const now = new Date();
    const start = new Date(timer.start_time);
    const diffSeconds = Math.max(0, Math.floor((now - start) / 1000));
    elapsed += diffSeconds;
  }
  return elapsed;
}

exports.getActiveTimer = async (req, res) => {
  try {
    const userId = req.user.id;
    const [timers] = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM active_timers t
       LEFT JOIN activity_categories c ON t.category_id = c.id
       WHERE t.user_id = ?`,
      [userId]
    );

    if (timers.length === 0) {
      return res.json({ success: true, activeTimer: null });
    }

    const timer = timers[0];
    const currentElapsed = calculateCurrentElapsed(timer);

    return res.json({
      success: true,
      activeTimer: {
        ...timer,
        current_elapsed_seconds: currentElapsed,
      },
    });
  } catch (error) {
    console.error('getActiveTimer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve active timer.' });
  }
};

exports.startTimer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activity_name, category_id, productivity_classification, notes } = req.body;

    if (!activity_name) {
      return res.status(400).json({ success: false, message: 'Activity name is required to start a timer.' });
    }

    // Check if an active timer is already running
    const [existing] = await pool.query('SELECT * FROM active_timers WHERE user_id = ?', [userId]);
    if (existing.length > 0) {
      const current = existing[0];
      return res.status(409).json({
        success: false,
        message: `A timer for "${current.activity_name}" is already active. Please stop or discard it first.`,
        activeTimer: {
          ...current,
          current_elapsed_seconds: calculateCurrentElapsed(current),
        },
      });
    }

    const now = new Date();
    const [result] = await pool.query(
      `INSERT INTO active_timers (user_id, activity_name, category_id, productivity_classification, start_time, elapsed_before_pause, is_paused, notes)
       VALUES (?, ?, ?, ?, ?, 0, FALSE, ?)`,
      [
        userId,
        activity_name.trim(),
        category_id || null,
        productivity_classification || 'productive',
        now,
        notes || null,
      ]
    );

    const [created] = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM active_timers t
       LEFT JOIN activity_categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Timer started successfully!',
      activeTimer: {
        ...created[0],
        current_elapsed_seconds: 0,
      },
    });
  } catch (error) {
    console.error('startTimer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to start timer.' });
  }
};

exports.pauseTimer = async (req, res) => {
  try {
    const userId = req.user.id;
    const [timers] = await pool.query('SELECT * FROM active_timers WHERE user_id = ?', [userId]);

    if (timers.length === 0) {
      return res.status(404).json({ success: false, message: 'No active timer found to pause.' });
    }

    const timer = timers[0];
    if (timer.is_paused) {
      return res.json({
        success: true,
        message: 'Timer is already paused.',
        activeTimer: { ...timer, current_elapsed_seconds: timer.elapsed_before_pause },
      });
    }

    const now = new Date();
    const start = new Date(timer.start_time);
    const addedSeconds = Math.max(0, Math.floor((now - start) / 1000));
    const totalElapsed = (timer.elapsed_before_pause || 0) + addedSeconds;

    await pool.query(
      `UPDATE active_timers SET is_paused = TRUE, paused_at = ?, elapsed_before_pause = ? WHERE id = ?`,
      [now, totalElapsed, timer.id]
    );

    const [updated] = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM active_timers t
       LEFT JOIN activity_categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [timer.id]
    );

    return res.json({
      success: true,
      message: 'Timer paused.',
      activeTimer: {
        ...updated[0],
        current_elapsed_seconds: totalElapsed,
      },
    });
  } catch (error) {
    console.error('pauseTimer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to pause timer.' });
  }
};

exports.resumeTimer = async (req, res) => {
  try {
    const userId = req.user.id;
    const [timers] = await pool.query('SELECT * FROM active_timers WHERE user_id = ?', [userId]);

    if (timers.length === 0) {
      return res.status(404).json({ success: false, message: 'No active timer found to resume.' });
    }

    const timer = timers[0];
    if (!timer.is_paused) {
      return res.json({
        success: true,
        message: 'Timer is already running.',
        activeTimer: { ...timer, current_elapsed_seconds: calculateCurrentElapsed(timer) },
      });
    }

    const now = new Date();
    await pool.query(
      `UPDATE active_timers SET is_paused = FALSE, paused_at = NULL, start_time = ? WHERE id = ?`,
      [now, timer.id]
    );

    const [updated] = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM active_timers t
       LEFT JOIN activity_categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [timer.id]
    );

    return res.json({
      success: true,
      message: 'Timer resumed.',
      activeTimer: {
        ...updated[0],
        current_elapsed_seconds: updated[0].elapsed_before_pause,
      },
    });
  } catch (error) {
    console.error('resumeTimer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to resume timer.' });
  }
};

exports.stopTimer = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const userId = req.user.id;

    const [timers] = await conn.query('SELECT * FROM active_timers WHERE user_id = ?', [userId]);
    if (timers.length === 0) {
      return res.status(404).json({ success: false, message: 'No active timer found to stop.' });
    }

    const timer = timers[0];
    const totalDurationSeconds = calculateCurrentElapsed(timer);

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - totalDurationSeconds * 1000);
    const dateStr = endTime.toISOString().split('T')[0];

    // Only save activity if at least 10 seconds or per user request
    let savedActivity = null;
    if (totalDurationSeconds >= 5) {
      const [insertResult] = await conn.query(
        `INSERT INTO activities (user_id, category_id, name, description, start_time, end_time, duration_seconds, productivity_classification, date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          timer.category_id,
          timer.activity_name,
          timer.notes,
          startTime,
          endTime,
          totalDurationSeconds,
          timer.productivity_classification,
          dateStr,
        ]
      );

      const [act] = await conn.query(
        `SELECT a.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
         FROM activities a
         LEFT JOIN activity_categories c ON a.category_id = c.id
         WHERE a.id = ?`,
        [insertResult.insertId]
      );
      savedActivity = act[0];
    }

    // Delete active timer
    await conn.query('DELETE FROM active_timers WHERE id = ?', [timer.id]);
    await conn.commit();

    return res.json({
      success: true,
      message: savedActivity ? 'Timer stopped and activity logged successfully!' : 'Timer stopped (duration too short to record).',
      activity: savedActivity,
      duration_seconds: totalDurationSeconds,
    });
  } catch (error) {
    await conn.rollback();
    console.error('stopTimer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to stop timer.' });
  } finally {
    conn.release();
  }
};

exports.discardTimer = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query('DELETE FROM active_timers WHERE user_id = ?', [userId]);
    return res.json({ success: true, message: 'Active timer discarded without saving.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to discard timer.' });
  }
};
