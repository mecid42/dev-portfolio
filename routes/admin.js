const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

const requireAuth = (req, res, next) => {
  if (req.session.adminId) return next();
  res.redirect('/admin/login');
};

const getSettings = async () => {
  const rows = await db.allAsync('SELECT key, value FROM site_settings');
  const s = {};
  rows.forEach(r => s[r.key] = r.value);
  return s;
};

router.get('/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin');
  res.render('admin/login', { error: null });
});
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await db.getAsync('SELECT * FROM admin WHERE username = ?', [username]);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.render('admin/login', { error: 'Hatalı kullanıcı adı veya şifre' });
  }
  req.session.adminId = admin.id;
  req.session.adminUsername = admin.username;
  res.redirect('/admin');
});
router.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/admin/login'); });

router.get('/', requireAuth, async (req, res) => {
  const realVisitors  = (await db.getAsync('SELECT COUNT(*) as c FROM visitors')).c;
  const uniqueVisitors= (await db.getAsync('SELECT COUNT(DISTINCT session_id) as c FROM visitors')).c;
  const offsetRow     = await db.getAsync('SELECT offset_count FROM visitor_offset WHERE id=1');
  const offset        = offsetRow ? offsetRow.offset_count : 0;
  const stats = {
    total_visitors:  realVisitors,
    unique_visitors: uniqueVisitors + offset,
    total_projects:  (await db.getAsync('SELECT COUNT(*) as c FROM projects')).c,
    subscribers:     (await db.getAsync('SELECT COUNT(*) as c FROM subscribers WHERE is_active=1')).c,
    unread_messages: (await db.getAsync('SELECT COUNT(*) as c FROM messages WHERE is_read=0')).c,
    delivered_projects:(await db.getAsync("SELECT COUNT(*) as c FROM projects WHERE status='delivered'")).c,
    total_likes:     (await db.getAsync('SELECT COUNT(*) as c FROM project_likes')).c,
  };
  const recentVisitors = await db.allAsync('SELECT * FROM visitors ORDER BY visited_at DESC LIMIT 15');
  const topPages = await db.allAsync('SELECT page, COUNT(*) as visits FROM visitors GROUP BY page ORDER BY visits DESC LIMIT 8');
  const topCountries = await db.allAsync('SELECT country, COUNT(DISTINCT session_id) as visitors FROM visitors GROUP BY country ORDER BY visitors DESC LIMIT 8');
  const visitorsByDay = await db.allAsync(`SELECT DATE(visited_at) as date, COUNT(DISTINCT session_id) as visitors FROM visitors WHERE visited_at >= DATE('now', '-30 days') GROUP BY DATE(visited_at) ORDER BY date ASC`);
  const browserStats = await db.allAsync('SELECT browser, COUNT(*) as count FROM visitors GROUP BY browser ORDER BY count DESC LIMIT 5');
  const deviceStats = await db.allAsync('SELECT device, COUNT(*) as count FROM visitors GROUP BY device ORDER BY count DESC');
  res.render('admin/dashboard', { stats, recentVisitors, topPages, topCountries, visitorsByDay, browserStats, deviceStats, adminUsername: req.session.adminUsername });
});

router.get('/visitors', requireAuth, async (req, res) => {
  const visitors = await db.allAsync('SELECT * FROM visitors ORDER BY visited_at DESC LIMIT 500');
  const realVisitors = (await db.getAsync('SELECT COUNT(DISTINCT session_id) as c FROM visitors')).c;
  const offsetRow    = await db.getAsync('SELECT offset_count FROM visitor_offset WHERE id=1');
  const offset       = offsetRow ? offsetRow.offset_count : 0;
  const totalVisitors= realVisitors + offset;
  const todayRow     = await db.getAsync("SELECT COUNT(DISTINCT session_id) as c FROM visitors WHERE DATE(visited_at)=DATE('now')");
  const todayVisitors= todayRow ? todayRow.c : 0;
  res.render('admin/visitors', { visitors, adminUsername: req.session.adminUsername, realVisitors, offset, totalVisitors, todayVisitors, saved: req.query.saved });
});

router.get('/hero', requireAuth, async (req, res) => {
  const settings = await getSettings();
  res.render('admin/hero', { settings, adminUsername: req.session.adminUsername, success: req.query.saved });
});
router.post('/hero', requireAuth, async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    await db.runAsync('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)', [key, value]);
  }
  res.redirect('/admin/hero?saved=1');
});

router.get('/about', requireAuth, async (req, res) => {
  const settings = await getSettings();
  res.render('admin/about', { settings, adminUsername: req.session.adminUsername, success: req.query.saved });
});
router.post('/about', requireAuth, async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    await db.runAsync('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)', [key, value]);
  }
  res.redirect('/admin/about?saved=1');
});

router.get('/experience', requireAuth, async (req, res) => {
  const experience = await db.allAsync('SELECT * FROM experience ORDER BY sort_order ASC');
  res.render('admin/experience', { experience, adminUsername: req.session.adminUsername });
});
router.post('/experience/add', requireAuth, async (req, res) => {
  const { company, position, description, start_date, end_date, is_current, sort_order } = req.body;
  await db.runAsync('INSERT INTO experience (company,position,description,start_date,end_date,is_current,sort_order) VALUES (?,?,?,?,?,?,?)',
    [company, position, description||'', start_date||'', end_date||'', is_current?1:0, sort_order||0]);
  res.redirect('/admin/experience');
});
router.post('/experience/:id/delete', requireAuth, async (req, res) => {
  await db.runAsync('DELETE FROM experience WHERE id=?', [req.params.id]);
  res.redirect('/admin/experience');
});

router.get('/skills', requireAuth, async (req, res) => {
  const skills = await db.allAsync('SELECT * FROM skills ORDER BY sort_order ASC');
  res.render('admin/skills', { skills, adminUsername: req.session.adminUsername });
});
router.post('/skills/add', requireAuth, async (req, res) => {
  const { name, category, level, sort_order } = req.body;
  await db.runAsync('INSERT INTO skills (name,category,level,sort_order) VALUES (?,?,?,?)', [name, category, level||80, sort_order||0]);
  res.redirect('/admin/skills');
});
router.post('/skills/:id/delete', requireAuth, async (req, res) => {
  await db.runAsync('DELETE FROM skills WHERE id=?', [req.params.id]);
  res.redirect('/admin/skills');
});

router.get('/contact-settings', requireAuth, async (req, res) => {
  const settings = await getSettings();
  res.render('admin/contact-settings', { settings, adminUsername: req.session.adminUsername, success: req.query.saved });
});
router.post('/contact-settings', requireAuth, async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    await db.runAsync('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)', [key, value]);
  }
  res.redirect('/admin/contact-settings?saved=1');
});

router.get('/projects', requireAuth, async (req, res) => {
  const projects = await db.allAsync('SELECT * FROM projects ORDER BY sort_order ASC');
  for (const p of projects) {
    const l = await db.getAsync('SELECT COUNT(*) as c FROM project_likes WHERE project_id=?', [p.id]);
    p.likes = l ? l.c : 0;
  }
  res.render('admin/projects', { projects, adminUsername: req.session.adminUsername });
});
router.get('/projects/new', requireAuth, (req, res) => {
  res.render('admin/project-form', { project: null, adminUsername: req.session.adminUsername });
});
router.post('/projects/new', requireAuth, async (req, res) => {
  const { title, description, long_description, tech_stack, status, category, github_url, live_url, featured, sort_order, start_date, end_date } = req.body;
  await db.runAsync('INSERT INTO projects (title,description,long_description,tech_stack,status,category,github_url,live_url,featured,sort_order,start_date,end_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
    [title, description, long_description||'', tech_stack, status, category||'web', github_url||'', live_url||'', featured?1:0, sort_order||0, start_date||null, end_date||null]);
  res.redirect('/admin/projects');
});
router.get('/projects/:id/edit', requireAuth, async (req, res) => {
  const project = await db.getAsync('SELECT * FROM projects WHERE id=?', [req.params.id]);
  if (!project) return res.redirect('/admin/projects');
  res.render('admin/project-form', { project, adminUsername: req.session.adminUsername });
});
router.post('/projects/:id/edit', requireAuth, async (req, res) => {
  const { title, description, long_description, tech_stack, status, category, github_url, live_url, featured, sort_order, start_date, end_date } = req.body;
  await db.runAsync('UPDATE projects SET title=?,description=?,long_description=?,tech_stack=?,status=?,category=?,github_url=?,live_url=?,featured=?,sort_order=?,start_date=?,end_date=?,updated_at=CURRENT_TIMESTAMP WHERE id=?',
    [title, description, long_description||'', tech_stack, status, category||'web', github_url||'', live_url||'', featured?1:0, sort_order||0, start_date||null, end_date||null, req.params.id]);
  res.redirect('/admin/projects');
});
router.post('/projects/:id/delete', requireAuth, async (req, res) => {
  await db.runAsync('DELETE FROM projects WHERE id=?', [req.params.id]);
  res.redirect('/admin/projects');
});

router.get('/likes', requireAuth, async (req, res) => {
  const likes = await db.allAsync(`
    SELECT pl.*, p.title as project_title 
    FROM project_likes pl 
    LEFT JOIN projects p ON pl.project_id = p.id 
    ORDER BY pl.created_at DESC LIMIT 200
  `);
  const topProjects = await db.allAsync(`
    SELECT p.title, COUNT(pl.id) as likes 
    FROM project_likes pl 
    LEFT JOIN projects p ON pl.project_id = p.id 
    GROUP BY pl.project_id ORDER BY likes DESC
  `);
  res.render('admin/likes', { likes, topProjects, adminUsername: req.session.adminUsername });
});

router.get('/subscribers', requireAuth, async (req, res) => {
  const subscribers = await db.allAsync('SELECT * FROM subscribers ORDER BY subscribed_at DESC');
  res.render('admin/subscribers', { subscribers, adminUsername: req.session.adminUsername });
});

router.get('/messages', requireAuth, async (req, res) => {
  const messages = await db.allAsync('SELECT * FROM messages ORDER BY sent_at DESC');
  await db.runAsync('UPDATE messages SET is_read=1');
  res.render('admin/messages', { messages, adminUsername: req.session.adminUsername });
});

router.get('/settings', requireAuth, async (req, res) => {
  const settings = await getSettings();
  res.render('admin/settings', { settings, adminUsername: req.session.adminUsername, success: req.query.saved });
});
router.post('/settings', requireAuth, async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    await db.runAsync('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)', [key, value]);
  }
  res.redirect('/admin/settings?saved=1');
});

// Logo upload as base64
router.post('/settings/logo', requireAuth, express.raw({ type: ['image/*'], limit: '2mb' }), async (req, res) => {
  try {
    const ct = req.headers['content-type'] || 'image/png';
    const b64 = `data:${ct};base64,` + Buffer.from(req.body).toString('base64');
    await db.runAsync('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)', ['logo_url', b64]);
    res.json({ success: true, url: b64 });
  } catch(e) {
    res.json({ success: false, message: e.message });
  }
});

router.post('/settings/logo/remove', requireAuth, async (req, res) => {
  await db.runAsync("DELETE FROM site_settings WHERE key='logo_url'");
  res.redirect('/admin/settings?saved=1');
});

router.get('/danger', requireAuth, async (req, res) => {
  res.render('admin/danger', { adminUsername: req.session.adminUsername });
});
router.post('/danger/clear-visitors', requireAuth, async (req, res) => {
  await db.runAsync('DELETE FROM visitors');
  res.redirect('/admin/danger?done=visitors');
});
router.post('/danger/clear-subscribers', requireAuth, async (req, res) => {
  await db.runAsync('DELETE FROM subscribers');
  res.redirect('/admin/danger?done=subscribers');
});
router.post('/danger/change-password', requireAuth, async (req, res) => {
  const { current_password, new_password } = req.body;
  const admin = await db.getAsync('SELECT * FROM admin WHERE id=?', [req.session.adminId]);
  if (!bcrypt.compareSync(current_password, admin.password)) {
    return res.render('admin/danger', { adminUsername: req.session.adminUsername, error: 'Mevcut şifre hatalı' });
  }
  const hash = bcrypt.hashSync(new_password, 10);
  await db.runAsync('UPDATE admin SET password=? WHERE id=?', [hash, req.session.adminId]);
  res.redirect('/admin/danger?done=password');
});

module.exports = router;

// ── Visitor Offset (ziyaretçi sayısı artırma) ──
router.post('/visitors/offset', requireAuth, async (req, res) => {
  const add = parseInt(req.body.add_count) || 0;
  await db.runAsync('UPDATE visitor_offset SET offset_count = offset_count + ? WHERE id=1', [add]);
  res.redirect('/admin/visitors?saved=1');
});
router.post('/visitors/offset/reset', requireAuth, async (req, res) => {
  await db.runAsync('UPDATE visitor_offset SET offset_count = 0 WHERE id=1');
  res.redirect('/admin/visitors?saved=1');
});
