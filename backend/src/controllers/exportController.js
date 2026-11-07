const { pool } = require('../config/db');

exports.exportCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let query = `
      SELECT a.id, a.name, c.name AS category, a.productivity_classification AS classification,
             a.duration_seconds, ROUND(a.duration_seconds / 60, 1) AS duration_minutes,
             ROUND(a.duration_seconds / 3600, 2) AS duration_hours,
             a.date, a.start_time, a.end_time, a.description
      FROM activities a
      LEFT JOIN activity_categories c ON a.category_id = c.id
      WHERE a.user_id = ?
    `;
    const params = [userId];

    if (startDate && endDate) {
      query += ' AND a.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    query += ' ORDER BY a.start_time DESC';

    const [rows] = await pool.query(query, params);

    // Build CSV format
    const headers = ['ID', 'Activity Name', 'Category', 'Classification', 'Duration (Min)', 'Duration (Hours)', 'Date', 'Start Time', 'End Time', 'Notes'];
    const csvLines = [headers.join(',')];

    rows.forEach((r) => {
      const escape = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
      csvLines.push([
        r.id,
        escape(r.name),
        escape(r.category || 'None'),
        r.classification,
        r.duration_minutes,
        r.duration_hours,
        r.date,
        escape(r.start_time),
        escape(r.end_time),
        escape(r.description || ''),
      ].join(','));
    });

    const csvContent = csvLines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="time-intelligence-export-${Date.now()}.csv"`);
    return res.send(csvContent);
  } catch (error) {
    console.error('exportCSV error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate CSV export.' });
  }
};

exports.getReportData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month', date } = req.query;

    const [user] = await pool.query('SELECT full_name, email FROM users WHERE id = ?', [userId]);
    const [activities] = await pool.query(
      `SELECT a.*, c.name AS category_name
       FROM activities a
       LEFT JOIN activity_categories c ON a.category_id = c.id
       WHERE a.user_id = ?
       ORDER BY a.start_time DESC LIMIT 100`,
      [userId]
    );

    const [scores] = await pool.query(
      `SELECT * FROM productivity_scores WHERE user_id = ? ORDER BY date DESC LIMIT 30`,
      [userId]
    );

    return res.json({
      success: true,
      report: {
        generated_at: new Date(),
        user: user[0],
        period,
        activities_count: activities.length,
        activities,
        scores,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve report data.' });
  }
};
