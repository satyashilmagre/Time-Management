const { pool } = require('../config/db');

exports.getActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, startDate, endDate, categoryId, classification, search, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT a.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon,
             GROUP_CONCAT(t.name) AS tags_list,
             GROUP_CONCAT(t.id) AS tag_ids
      FROM activities a
      LEFT JOIN activity_categories c ON a.category_id = c.id
      LEFT JOIN activity_tag_relations atr ON a.id = atr.activity_id
      LEFT JOIN activity_tags t ON atr.tag_id = t.id
      WHERE a.user_id = ?
    `;
    const params = [userId];

    if (date) {
      query += ` AND a.date = ?`;
      params.push(date);
    } else if (startDate && endDate) {
      query += ` AND a.date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    if (categoryId) {
      query += ` AND a.category_id = ?`;
      params.push(categoryId);
    }

    if (classification) {
      query += ` AND a.productivity_classification = ?`;
      params.push(classification);
    }

    if (search) {
      query += ` AND (a.name LIKE ? OR a.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY a.id ORDER BY a.start_time DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), (parseInt(page, 10) - 1) * parseInt(limit, 10));

    const [rows] = await pool.query(query, params);

    // Format tags array
    const activities = rows.map((row) => ({
      ...row,
      tags: row.tags_list ? row.tags_list.split(',') : [],
      tagIds: row.tag_ids ? row.tag_ids.split(',').map(Number) : [],
    }));

    return res.json({ success: true, activities });
  } catch (error) {
    console.error('getActivities error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch activities.' });
  }
};

exports.createActivity = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const userId = req.user.id;
    const {
      name,
      category_id,
      description,
      start_time,
      end_time,
      duration_seconds,
      productivity_classification,
      date,
      tags = [],
    } = req.body;

    if (!name || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Activity name, start time, and end time are required.' });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);
    const calculatedDuration = duration_seconds ? parseInt(duration_seconds, 10) : Math.max(0, Math.round((end - start) / 1000));
    const actDate = date || start.toISOString().split('T')[0];

    const [result] = await conn.query(
      `INSERT INTO activities (user_id, category_id, name, description, start_time, end_time, duration_seconds, productivity_classification, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        category_id || null,
        name.trim(),
        description || null,
        start,
        end,
        calculatedDuration,
        productivity_classification || 'productive',
        actDate,
      ]
    );

    const activityId = result.insertId;

    // Attach tags
    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagItem of tags) {
        let tagId = typeof tagItem === 'number' ? tagItem : null;
        if (typeof tagItem === 'string') {
          // Find or create tag
          const [existingTag] = await conn.query('SELECT id FROM activity_tags WHERE user_id = ? AND name = ?', [userId, tagItem.trim()]);
          if (existingTag.length > 0) {
            tagId = existingTag[0].id;
          } else {
            const [newTag] = await conn.query('INSERT INTO activity_tags (user_id, name) VALUES (?, ?)', [userId, tagItem.trim()]);
            tagId = newTag.insertId;
          }
        }
        if (tagId) {
          await conn.query('INSERT IGNORE INTO activity_tag_relations (activity_id, tag_id) VALUES (?, ?)', [activityId, tagId]);
        }
      }
    }

    await conn.commit();

    // Fetch created row
    const [created] = await pool.query(
      `SELECT a.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM activities a
       LEFT JOIN activity_categories c ON a.category_id = c.id
       WHERE a.id = ?`,
      [activityId]
    );

    return res.status(201).json({ success: true, activity: created[0] });
  } catch (error) {
    await conn.rollback();
    console.error('createActivity error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create activity.' });
  } finally {
    conn.release();
  }
};

exports.updateActivity = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const userId = req.user.id;
    const { id } = req.params;
    const {
      name,
      category_id,
      description,
      start_time,
      end_time,
      duration_seconds,
      productivity_classification,
      date,
      tags,
    } = req.body;

    const [existing] = await conn.query('SELECT * FROM activities WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found or unauthorized.' });
    }

    const current = existing[0];
    const newStart = start_time ? new Date(start_time) : new Date(current.start_time);
    const newEnd = end_time ? new Date(end_time) : new Date(current.end_time);
    const newDuration = duration_seconds !== undefined ? parseInt(duration_seconds, 10) : Math.max(0, Math.round((newEnd - newStart) / 1000));
    const newDate = date || (start_time ? newStart.toISOString().split('T')[0] : current.date);

    await conn.query(
      `UPDATE activities SET
        name = COALESCE(?, name),
        category_id = ?,
        description = ?,
        start_time = ?,
        end_time = ?,
        duration_seconds = ?,
        productivity_classification = COALESCE(?, productivity_classification),
        date = ?
       WHERE id = ? AND user_id = ?`,
      [
        name ? name.trim() : current.name,
        category_id !== undefined ? category_id : current.category_id,
        description !== undefined ? description : current.description,
        newStart,
        newEnd,
        newDuration,
        productivity_classification,
        newDate,
        id,
        userId,
      ]
    );

    if (Array.isArray(tags)) {
      await conn.query('DELETE FROM activity_tag_relations WHERE activity_id = ?', [id]);
      for (const tagItem of tags) {
        let tagId = typeof tagItem === 'number' ? tagItem : null;
        if (typeof tagItem === 'string') {
          const [existingTag] = await conn.query('SELECT id FROM activity_tags WHERE user_id = ? AND name = ?', [userId, tagItem.trim()]);
          if (existingTag.length > 0) {
            tagId = existingTag[0].id;
          } else {
            const [newTag] = await conn.query('INSERT INTO activity_tags (user_id, name) VALUES (?, ?)', [userId, tagItem.trim()]);
            tagId = newTag.insertId;
          }
        }
        if (tagId) {
          await conn.query('INSERT IGNORE INTO activity_tag_relations (activity_id, tag_id) VALUES (?, ?)', [id, tagId]);
        }
      }
    }

    await conn.commit();

    const [updated] = await pool.query(
      `SELECT a.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM activities a
       LEFT JOIN activity_categories c ON a.category_id = c.id
       WHERE a.id = ?`,
      [id]
    );

    return res.json({ success: true, activity: updated[0] });
  } catch (error) {
    await conn.rollback();
    console.error('updateActivity error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update activity.' });
  } finally {
    conn.release();
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM activities WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found or unauthorized.' });
    }

    return res.json({ success: true, message: 'Activity removed successfully.' });
  } catch (error) {
    console.error('deleteActivity error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete activity.' });
  }
};
