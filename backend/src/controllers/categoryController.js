const { pool } = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT * FROM activity_categories WHERE user_id IS NULL OR user_id = ? ORDER BY is_default DESC, name ASC`,
      [userId]
    );
    return res.json({ success: true, categories: rows });
  } catch (error) {
    console.error('getCategories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, color = '#6366f1', icon = 'Tag', default_classification = 'productive' } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO activity_categories (user_id, name, color, icon, default_classification, is_default)
       VALUES (?, ?, ?, ?, ?, FALSE)`,
      [userId, name.trim(), color, icon, default_classification]
    );

    const [created] = await pool.query('SELECT * FROM activity_categories WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, category: created[0] });
  } catch (error) {
    console.error('createCategory error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};

exports.getTags = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM activity_tags WHERE user_id = ? ORDER BY name ASC', [userId]);
    return res.json({ success: true, tags: rows });
  } catch (error) {
    console.error('getTags error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch tags.' });
  }
};

exports.createTag = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, color = '#6366f1' } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tag name is required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO activity_tags (user_id, name, color) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE color = VALUES(color)`,
      [userId, name.trim(), color]
    );

    const [tag] = await pool.query('SELECT * FROM activity_tags WHERE user_id = ? AND name = ?', [userId, name.trim()]);
    return res.status(201).json({ success: true, tag: tag[0] });
  } catch (error) {
    console.error('createTag error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create tag.' });
  }
};
