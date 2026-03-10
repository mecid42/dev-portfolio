const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/projects', async (req, res) => {
  const { status, category } = req.query;
  let query = 'SELECT * FROM projects WHERE 1=1';
  const params = [];
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (category) { query += ' AND category = ?'; params.push(category); }
  query += ' ORDER BY featured DESC, sort_order ASC';
  res.json(await db.allAsync(query, params));
});

router.get('/stats', async (req, res) => {
  res.json({
    visitors: (await db.getAsync('SELECT COUNT(DISTINCT session_id) as c FROM visitors')).c,
    projects: (await db.getAsync('SELECT COUNT(*) as c FROM projects')).c,
    delivered: (await db.getAsync("SELECT COUNT(*) as c FROM projects WHERE status='delivered'")).c,
  });
});

module.exports = router;
