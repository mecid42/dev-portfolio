const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  try {
    const projects  = await db.allAsync('SELECT * FROM projects ORDER BY featured DESC, sort_order ASC');
    const skills    = await db.allAsync('SELECT * FROM skills ORDER BY sort_order ASC');
    const experience= await db.allAsync('SELECT * FROM experience ORDER BY sort_order ASC');
    const rows      = await db.allAsync('SELECT key,value FROM site_settings');
    const settings  = {};
    rows.forEach(r => settings[r.key] = r.value);

    // visitor count = real unique sessions + admin offset
    const realVisitors = (await db.getAsync('SELECT COUNT(DISTINCT session_id) as c FROM visitors')).c;
    const offsetRow    = await db.getAsync('SELECT offset_count FROM visitor_offset WHERE id=1');
    const totalVisitors = realVisitors + (offsetRow ? offsetRow.offset_count : 0);

    const stats = {
      projects:  (await db.getAsync('SELECT COUNT(*) as c FROM projects')).c,
      delivered: (await db.getAsync("SELECT COUNT(*) as c FROM projects WHERE status='delivered'")).c,
      visitors:  totalVisitors,
    };

    for (const p of projects) {
      const likes    = await db.getAsync('SELECT COUNT(*) as c FROM project_likes WHERE project_id=?', [p.id]);
      const userLiked= await db.getAsync('SELECT id FROM project_likes WHERE project_id=? AND session_id=?', [p.id, req.session.visitorId||'x']);
      p.likes     = likes ? likes.c : 0;
      p.userLiked = !!userLiked;
    }
    res.render('index', { projects, skills, settings, stats, experience });
  } catch(e) { console.error(e); res.status(500).send('Server error: ' + e.message); }
});

router.get('/projects', async (req, res) => {
  const projects = await db.allAsync('SELECT * FROM projects ORDER BY sort_order ASC');
  for (const p of projects) {
    const likes = await db.getAsync('SELECT COUNT(*) as c FROM project_likes WHERE project_id=?', [p.id]);
    p.likes = likes ? likes.c : 0;
  }
  const rows = await db.allAsync('SELECT key,value FROM site_settings');
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.render('projects', { projects, settings });
});

router.get('/projects/:id', async (req, res) => {
  const project = await db.getAsync('SELECT * FROM projects WHERE id=?', [req.params.id]);
  if (!project) return res.redirect('/projects');
  const likes = await db.getAsync('SELECT COUNT(*) as c FROM project_likes WHERE project_id=?', [req.params.id]);
  project.likes = likes ? likes.c : 0;
  const rows = await db.allAsync('SELECT key,value FROM site_settings');
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.render('project-detail', { project, settings });
});

router.post('/like/:id', async (req, res) => {
  const sid = req.session.visitorId || 'anon';
  try {
    await db.runAsync('INSERT INTO project_likes (project_id,session_id) VALUES (?,?)', [req.params.id, sid]);
    const likes = await db.getAsync('SELECT COUNT(*) as c FROM project_likes WHERE project_id=?', [req.params.id]);
    res.json({ success:true, likes:likes.c, liked:true });
  } catch(e) {
    await db.runAsync('DELETE FROM project_likes WHERE project_id=? AND session_id=?', [req.params.id, sid]);
    const likes = await db.getAsync('SELECT COUNT(*) as c FROM project_likes WHERE project_id=?', [req.params.id]);
    res.json({ success:true, likes:likes.c, liked:false });
  }
});

router.post('/subscribe', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.json({ success:false, message:'Email gerekli' });
  try {
    await db.runAsync('INSERT OR IGNORE INTO subscribers (email,name) VALUES (?,?)', [email, name||'']);
    res.json({ success:true, message:'Takip Ediniz! Teşekkürler.' });
  } catch(e) {
    res.json({ success:false, message:'Bu email zaten kayıtlı.' });
  }
});

router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name||!email||!message) return res.json({ success:false, message:'Tüm alanlar gerekli' });
  await db.runAsync('INSERT INTO messages (name,email,subject,message) VALUES (?,?,?,?)', [name,email,subject||'',message]);
  res.json({ success:true, message:'Mesajınız alındı! En kısa sürede yanıt vereceğim.' });
});

module.exports = router;
