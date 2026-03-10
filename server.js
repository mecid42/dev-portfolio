require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const db = require('./db');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'portfolio-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// ── Visitor Tracking ───────────────────────────────────────────
app.use(async (req, res, next) => {
  if (req.path.startsWith('/admin') || req.path.startsWith('/api') ||
      req.path.startsWith('/css')   || req.path.startsWith('/js')  ||
      req.path.startsWith('/like')  || req.path.startsWith('/subscribe') ||
      req.path.startsWith('/contact') || req.path.includes('.')) return next();

  const sessionId = req.session.visitorId || uuidv4();
  req.session.visitorId = sessionId;

  let browser = 'Unknown', os = 'Unknown', device = 'desktop';
  try {
    const UAParser = require('ua-parser-js');
    const ua = new UAParser(req.headers['user-agent']);
    browser = ua.getBrowser().name || 'Unknown';
    os      = ua.getOS().name    || 'Unknown';
    device  = ua.getDevice().type || 'desktop';
  } catch(e) {}

  // IP — proxy arkasında da çalışır (Railway, Vercel vs.)
  const rawIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
             || req.headers['x-real-ip']
             || req.socket?.remoteAddress
             || 'unknown';
  // IPv6 mapped IPv4 temizle (::ffff:1.2.3.4 → 1.2.3.4)
  const ip = rawIp.replace(/^::ffff:/, '');

  let country = '?', city = '?', region = '', lat = null, lon = null;
  try {
    const geoip = require('geoip-lite');
    const geo = geoip.lookup(ip);
    if (geo) {
      country = geo.country || '?';
      city    = geo.city    || '?';
      region  = geo.region  || '';
      lat     = geo.ll ? geo.ll[0] : null;
      lon     = geo.ll ? geo.ll[1] : null;
    }
  } catch(e) {}

  try {
    await db.runAsync(
      `INSERT INTO visitors 
       (session_id,ip,country,city,region,lat,lon,device,browser,os,page,referrer,user_agent)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [sessionId, ip, country, city, region, lat, lon,
       device, browser, os, req.path,
       req.headers.referer || '', req.headers['user-agent'] || '']
    );
  } catch(e) {}
  next();
});

app.use('/', require('./routes/public'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀  http://localhost:${PORT}`);
  console.log(`🔒  http://localhost:${PORT}/admin\n`);
});
