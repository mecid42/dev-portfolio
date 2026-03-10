const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
const bcrypt  = require('bcryptjs');

const dbPath = process.env.NODE_ENV === 'production'
  ? '/app/data/portfolio.db'
  : path.join(__dirname, 'portfolio.db');

const db = new sqlite3.Database(dbPath);

db.runAsync = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function(err) { err ? reject(err) : resolve(this); }));

db.getAsync = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)));

db.allAsync = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));

db.prepare = (sql) => ({
  run: (...params) => new Promise((resolve, reject) =>
    db.run(sql, params.flat(), function(err) { err ? reject(err) : resolve(this); })),
  get: (...params) => new Promise((resolve, reject) =>
    db.get(sql, params.flat(), (err, row) => err ? reject(err) : resolve(row))),
  all: (...params) => new Promise((resolve, reject) =>
    db.all(sql, params.flat(), (err, rows) => err ? reject(err) : resolve(rows))),
});

const init = async () => {
  await db.runAsync(`PRAGMA journal_mode=WAL`);

  // Tables
  await db.runAsync(`CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    tech_stack TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    category TEXT DEFAULT 'web',
    github_url TEXT,
    live_url TEXT,
    featured INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    ip TEXT,
    country TEXT,
    city TEXT,
    region TEXT,
    lat REAL,
    lon REAL,
    device TEXT,
    browser TEXT,
    os TEXT,
    page TEXT DEFAULT '/',
    referrer TEXT,
    user_agent TEXT,
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add missing columns if upgrading
  const cols = await db.allAsync(`PRAGMA table_info(visitors)`);
  const colNames = cols.map(c => c.name);
  if (!colNames.includes('region')) await db.runAsync(`ALTER TABLE visitors ADD COLUMN region TEXT`);
  if (!colNames.includes('lat'))    await db.runAsync(`ALTER TABLE visitors ADD COLUMN lat REAL`);
  if (!colNames.includes('lon'))    await db.runAsync(`ALTER TABLE visitors ADD COLUMN lon REAL`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
  )`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level INTEGER DEFAULT 80,
    sort_order INTEGER DEFAULT 0
  )`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  )`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    description TEXT,
    start_date TEXT,
    end_date TEXT,
    is_current INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0
  )`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS project_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, session_id)
  )`);

  // ── visitor_offset: admin'in eklediği yapay ziyaretçi sayısı ──
  await db.runAsync(`CREATE TABLE IF NOT EXISTS visitor_offset (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    offset_count INTEGER DEFAULT 0
  )`);
  const voff = await db.getAsync(`SELECT id FROM visitor_offset WHERE id=1`);
  if (!voff) await db.runAsync(`INSERT INTO visitor_offset (id, offset_count) VALUES (1, 0)`);

  // ── Seed admin ──
  const adminExists = await db.getAsync(`SELECT id FROM admin WHERE username='admin'`);
  if (!adminExists) {
    const hash = bcrypt.hashSync('Admin123!', 10);
    await db.runAsync(`INSERT INTO admin (username,password) VALUES ('admin',?)`, [hash]);
  }

  // ── Seed settings ──
  const defaults = {
    site_name: 'DEV.IO', hero_title: 'BUILDING THE FUTURE',
    hero_subtitle: 'Full-Stack Developer & Computer Engineer',
    about_text: 'Bilgisayar Mühendisliği mezunu, modern web teknolojileri ile kullanıcı odaklı uygulamalar geliştiriyorum.',
    email: 'hello@example.com', github_url: '', linkedin_url: '', cv_url: ''
  };
  for (const [k, v] of Object.entries(defaults)) {
    await db.runAsync(`INSERT OR IGNORE INTO site_settings (key,value) VALUES (?,?)`, [k, v]);
  }

  // ── Seed projects ──
  const pc = await db.getAsync(`SELECT COUNT(*) as c FROM projects`);
  if (!pc || pc.c === 0) {
    const projects = [
      ['E-Commerce Platform', 'Modern alışveriş deneyimi sunan tam stack uygulama', 'Next.js, Node.js, PostgreSQL, Stripe', 'delivered', 'web', 'https://github.com', '', 1, 1, '2024-01-15', '2024-06-20'],
      ['AI Chat Dashboard', 'GPT tabanlı müşteri destek otomasyonu', 'React, Python, FastAPI, OpenAI, Redis', 'in_progress', 'ai', 'https://github.com', '', 1, 2, '2024-08-01', null],
      ['Mobile Fitness App', 'Kişisel antrenman takip uygulaması', 'React Native, Firebase, Node.js', 'delivered', 'mobile', '', 'https://example.com', 0, 3, '2023-09-01', '2024-02-28'],
      ['DevOps Pipeline Tool', 'CI/CD ve container yönetim aracı', 'Go, Docker, Kubernetes, PostgreSQL', 'planned', 'web', '', '', 0, 4, '2025-01-01', null],
    ];
    for (const p of projects) {
      await db.runAsync(
        `INSERT INTO projects (title,description,tech_stack,status,category,github_url,live_url,featured,sort_order,start_date,end_date) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        p
      );
    }
  }

  // ── Seed skills ──
  const sc = await db.getAsync(`SELECT COUNT(*) as c FROM skills`);
  if (!sc || sc.c === 0) {
    const skills = [
      ['JavaScript','Frontend',92,1],['TypeScript','Frontend',85,2],['React','Frontend',90,3],['Next.js','Frontend',82,4],['CSS/Tailwind','Frontend',88,5],
      ['Node.js','Backend',90,1],['Python','Backend',80,2],['PostgreSQL','Backend',82,3],['MongoDB','Backend',75,4],['Redis','Backend',70,5],
      ['Docker','DevOps',78,1],['Kubernetes','DevOps',65,2],['AWS','DevOps',72,3],['CI/CD','DevOps',75,4],['Linux','DevOps',85,5],
    ];
    for (const [name,cat,level,sort] of skills) {
      await db.runAsync(`INSERT INTO skills (name,category,level,sort_order) VALUES (?,?,?,?)`, [name,cat,level,sort]);
    }
  }

  // ── Seed experience ──
  const ec = await db.getAsync(`SELECT COUNT(*) as c FROM experience`);
  if (!ec || ec.c === 0) {
    const exp = [
      ['TechCorp A.Ş.','Senior Full-Stack Developer','React ve Node.js ile B2B SaaS platform geliştirme. 50K+ kullanıcıya ulaşan ürünler.','2023-03',null,1,1],
      ['StartupXYZ','Full-Stack Developer','MVP geliştirme, mikroservis mimarisi tasarımı, DevOps süreçleri.','2021-06','2023-02',0,2],
      ['Freelance','Web Developer','Çeşitli müşteriler için e-ticaret ve kurumsal web siteleri.','2020-01','2021-05',0,3],
    ];
    for (const e of exp) {
      await db.runAsync(
        `INSERT INTO experience (company,position,description,start_date,end_date,is_current,sort_order) VALUES (?,?,?,?,?,?,?)`, e
      );
    }
  }

  console.log('✅  DB hazır');
};

init().catch(console.error);
module.exports = db;

// Logo upload helper — saves logo as base64 in site_settings
