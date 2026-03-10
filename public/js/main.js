// ============================================================
// TRANSLATIONS
// ============================================================
const T = {
  tr: {
    nav_projects:'Projeler', nav_experience:'Deneyim', nav_skills:'Yetenekler',
    nav_about:'Hakkımda', nav_contact:'İletişim', nav_admin:'Admin', nav_cta:'İletişime Geç',
    badge_available:'Müsait · Freelance & Full-time',
    stat_projects:'Proje', stat_delivered:'Teslim', stat_visitors:'Ziyaretçi',
    btn_see_projects:'Projeleri Gör', btn_download_cv:'CV İndir',
    sec_projects:'/ Projeler', sec_projects_title:'Son Çalışmalar',
    sec_projects_desc:'Geliştirdiğim projeler ve mevcut durumları',
    filter_all:'Tümü', filter_delivered:'Teslim Edildi', filter_progress:'Devam Ediyor',
    sec_skills:'/ Yetenekler', sec_skills_title:'Teknoloji Stack',
    sec_about:'/ Hakkımda', sec_about_title:'Merhaba, Ben', sec_about_sub:'Bir Yazılım Mühendisiyim',
    about_btn_github:'GitHub', about_btn_linkedin:'LinkedIn',
    sub_tag:'/ Haberdar Ol', sub_title:'Yeni Projelerimden Haberdar Olun',
    sub_desc:'Yeni proje lansmanları ve güncellemeler için bültenime abone olun.',
    sub_name:'Adınız', sub_email:'E-posta adresiniz', sub_btn:'Abone Ol',
    contact_tag:'/ İletişim', contact_title:'Konuşalım',
    contact_desc:'Bir projeniz mi var? Birlikte çalışalım.',
    contact_available:'Yeni projeler için müsaitim', contact_response:'Yanıt süresi: ~24 saat',
    contact_name:'Ad Soyad', contact_email:'E-posta', contact_subject:'Konu', contact_message:'Mesaj',
    contact_name_ph:'John Doe', contact_subject_ph:'Proje hakkında...', contact_msg_ph:'Projenizi anlatın...',
    contact_btn:'Mesaj Gönder', detail_btn:'Detay →', scroll:'Scroll',
    footer_text:'Türkiye\'den dünyaya kod yazıyorum 🇹🇷',
    status_delivered:'Teslim Edildi', status_progress:'Devam Ediyor', status_planned:'Planlanıyor',
    exp_title:'Kariyer Yolculuğu', exp_tag:'/ Deneyim', exp_current:'Devam Ediyor',
  },
  en: {
    nav_projects:'Projects', nav_experience:'Experience', nav_skills:'Skills',
    nav_about:'About', nav_contact:'Contact', nav_admin:'Admin', nav_cta:'Get in Touch',
    badge_available:'Available · Freelance & Full-time',
    stat_projects:'Projects', stat_delivered:'Delivered', stat_visitors:'Visitors',
    btn_see_projects:'See Projects', btn_download_cv:'Download CV',
    sec_projects:'/ Projects', sec_projects_title:'Recent Work',
    sec_projects_desc:'My projects and their current status',
    filter_all:'All', filter_delivered:'Delivered', filter_progress:'In Progress',
    sec_skills:'/ Skills', sec_skills_title:'Tech Stack',
    sec_about:'/ About', sec_about_title:'Hello, I\'m', sec_about_sub:'A Software Engineer',
    about_btn_github:'GitHub', about_btn_linkedin:'LinkedIn',
    sub_tag:'/ Stay Updated', sub_title:'Get Notified About New Projects',
    sub_desc:'Subscribe to my newsletter for new project launches and updates.',
    sub_name:'Your Name', sub_email:'Your email address', sub_btn:'Subscribe',
    contact_tag:'/ Contact', contact_title:"Let's Talk",
    contact_desc:'Have a project? Let\'s work together.',
    contact_available:'Available for new projects', contact_response:'Response time: ~24h',
    contact_name:'Full Name', contact_email:'Email', contact_subject:'Subject', contact_message:'Message',
    contact_name_ph:'John Doe', contact_subject_ph:'About a project...', contact_msg_ph:'Tell me about your project...',
    contact_btn:'Send Message', detail_btn:'Details →', scroll:'Scroll',
    footer_text:'Writing code from Turkey to the world 🇹🇷',
    status_delivered:'Delivered', status_progress:'In Progress', status_planned:'Planned',
    exp_title:'Career Journey', exp_tag:'/ Experience', exp_current:'Currently Working',
  }
};

let currentLang = localStorage.getItem('lang') || 'tr';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  const t = T[lang];
  if (!t) return;
  const isAr = false;
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');

  // Translate all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (!t[key]) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t[key];
    } else {
      el.textContent = t[key];
    }
  });

  // Translate status badges
  document.querySelectorAll('.status-text-delivered').forEach(el => el.textContent = t.status_delivered);
  document.querySelectorAll('.status-text-in_progress').forEach(el => el.textContent = t.status_progress);
  document.querySelectorAll('.status-text-planned').forEach(el => el.textContent = t.status_planned);

  // Detail buttons
  document.querySelectorAll('.card-link-detail').forEach(el => el.textContent = t.detail_btn);

  // Active lang button
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });

  // Apply theme-aware RTL/LTR card direction
  document.querySelectorAll('.project-card, .timeline-item, .contact-form, .subscribe-inner').forEach(el => {
    el.style.direction = isAr ? 'rtl' : 'ltr';
  });
}

// ============================================================
// THEME TOGGLE — DARK / LIGHT
// ============================================================
let currentTheme = localStorage.getItem('theme') || 'dark';

function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === theme);
  });
}

// ============================================================
// REVEAL ANIMATIONS
// ============================================================
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.07 });
document.querySelectorAll('.project-card, .skill-group, .timeline-item, .section-header, .reveal').forEach(el => {
  el.classList.add('reveal');
  revealObs.observe(el);
});

// ============================================================
// COUNTER ANIMATION
// ============================================================
document.querySelectorAll('.stat-num').forEach(el => {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const target = parseInt(e.target.dataset.target) || 0;
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1500, 1);
        e.target.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 }).observe(el);
});

// ============================================================
// SKILL BARS
// ============================================================
document.querySelectorAll('.skill-fill').forEach(el => {
  new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.style.width = e.target.dataset.width; });
  }, { threshold: 0.2 }).observe(el);
});

// ============================================================
// PROJECT FILTER
// ============================================================
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      card.classList.toggle('hidden', f !== 'all' && card.dataset.status !== f && card.dataset.category !== f);
    });
  });
});

// ============================================================
// MOBILE MENU
// ============================================================
document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('mobileMenu')?.classList.toggle('open');
});
function closeMobile() { document.getElementById('mobileMenu')?.classList.remove('open'); }

// ============================================================
// LIKE TOGGLE
// ============================================================
async function toggleLike(btn) {
  if (btn.dataset.loading) return;
  btn.dataset.loading = '1';
  try {
    const res = await fetch('/like/' + btn.dataset.id, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      btn.querySelector('.like-count').textContent = data.likes;
      btn.querySelector('svg').setAttribute('fill', data.liked ? 'currentColor' : 'none');
      btn.classList.toggle('liked', data.liked);
    }
  } catch(e) {}
  delete btn.dataset.loading;
}

// ============================================================
// FORMS
// ============================================================
document.getElementById('subscribeForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const msg = document.getElementById('subscribeMsg');
  const btn = e.target.querySelector('button');
  btn.disabled = true; btn.textContent = '...';
  try {
    const res = await fetch('/subscribe', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email: document.getElementById('subEmail').value, name: document.getElementById('subName').value })
    });
    const data = await res.json();
    msg.style.display = 'block';
    msg.className = 'form-message ' + (data.success ? 'success' : 'error');
    msg.textContent = data.message;
    if (data.success) e.target.reset();
  } catch(err) { msg.style.display='block'; msg.className='form-message error'; msg.textContent='Bağlantı hatası'; }
  btn.disabled = false; btn.textContent = T[currentLang]?.sub_btn || 'Abone Ol';
});

document.getElementById('contactForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const msg = document.getElementById('contactMsg');
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    const res = await fetch('/contact', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value
      })
    });
    const data = await res.json();
    msg.style.display = 'block';
    msg.className = 'form-message ' + (data.success ? 'success' : 'error');
    msg.textContent = data.message;
    if (data.success) e.target.reset();
  } catch(err) { msg.style.display='block'; msg.className='form-message error'; msg.textContent='Bağlantı hatası'; }
  btn.disabled = false;
});

// ============================================================
// NAVBAR SCROLL
// ============================================================
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (!navbar) return;
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ============================================================
// BACKGROUND CANVAS — HAFİF FLOATING TERMINAL COMMANDS
// ============================================================
const bgCanvas = document.getElementById('bg-canvas');
if (bgCanvas) {
  const ctx = bgCanvas.getContext('2d');
  let bw, bh;

  const CMDS = [
    'npm run dev','git commit -m "feat"','docker build .','kubectl apply',
    'git push origin main','node server.js','npm install','git clone',
    'ssh root@server','chmod +x deploy.sh','npm run build','git pull',
    'docker-compose up','terraform apply','npm test','kubectl get pods',
    'tail -f server.log','git log --oneline','eslint src/','tsc --build',
    'python3 manage.py','yarn build','git stash','pm2 restart all',
    'nginx -t','certbot renew','df -h','free -m','ps aux | grep node',
  ];

  const particles = [];

  function bgResize() {
    bw = bgCanvas.width = window.innerWidth;
    bh = bgCanvas.height = window.innerHeight;
  }

  function spawnCmd() {
    particles.push({
      text: CMDS[Math.floor(Math.random() * CMDS.length)],
      x: Math.random() * bw,
      y: Math.random() * bh,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.18,
      // HAFİF opacity — 0.05 to 0.13 sadece
      opacity: 0.05 + Math.random() * 0.08,
      size: 9 + Math.floor(Math.random() * 3),
      life: Math.floor(Math.random() * 400),
      maxLife: 700 + Math.random() * 500,
    });
  }

  bgResize();
  for (let i = 0; i < 35; i++) spawnCmd();

  function drawBg() {
    ctx.clearRect(0, 0, bw, bh);

    // Very subtle grid
    ctx.strokeStyle = 'rgba(128,128,128,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < bw; x += 80) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,bh); ctx.stroke(); }
    for (let y = 0; y < bh; y += 80) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(bw,y); ctx.stroke(); }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.life++;

      let alpha = p.opacity;
      if (p.life < 100) alpha *= p.life / 100;
      if (p.life > p.maxLife - 100) alpha *= (p.maxLife - p.life) / 100;

      if (p.life > p.maxLife) { particles.splice(i, 1); spawnCmd(); continue; }

      // Theme-aware color
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const clr = isDark ? 'rgba(100,160,255,' : 'rgba(30,80,200,';

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = clr + '1)';
      ctx.font = `${p.size}px 'JetBrains Mono','Courier New',monospace`;
      ctx.fillText('$ ' + p.text, p.x, p.y);
      ctx.restore();
    }
    requestAnimationFrame(drawBg);
  }

  drawBg();
  window.addEventListener('resize', bgResize);
}

// ============================================================
// THREE.JS — WIREFRAME SPHERE — TAM EKRAN HERO + TÜM SAYFA BG
// ============================================================
if (typeof THREE !== 'undefined') {
  // ---- HERO SPHERE ----
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 5.5;  // push camera back = smaller sphere

    const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    function resizeHero() {
      const hero = heroCanvas.parentElement;
      const w = hero.clientWidth, h = hero.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    // Outer wireframe
    const geoOut = new THREE.IcosahedronGeometry(1.7, 3);
    const matOut = new THREE.MeshBasicMaterial({ color:0xffffff, wireframe:true, transparent:true, opacity:0.07 });
    const sphereOut = new THREE.Mesh(geoOut, matOut);
    scene.add(sphereOut);

    // Inner coloured wireframe
    const geoIn = new THREE.IcosahedronGeometry(1.1, 2);
    const matIn = new THREE.MeshBasicMaterial({ color:0x3b82f6, wireframe:true, transparent:true, opacity:0.15 });
    const sphereIn = new THREE.Mesh(geoIn, matIn);
    scene.add(sphereIn);

    // Command text sprites orbiting
    const CMD_ORBIT = [
      'npm run dev','git push','docker build','kubectl apply',
      'ssh root@','node server','git clone','terraform',
      'npm install','git commit','docker-compose','cd /app',
      'npm test','git pull','chmod +x','curl -X POST',
      'git log','eslint --fix','tsc --build','yarn build',
    ];

    function makeSprite(text) {
      const cvs = document.createElement('canvas');
      cvs.width = 220; cvs.height = 40;
      const c = cvs.getContext('2d');
      const colors = ['#3b82f6','#60a5fa','#22c55e','#93c5fd','#ffffff'];
      c.fillStyle = colors[Math.floor(Math.random()*colors.length)];
      c.font = 'bold 14px "JetBrains Mono",monospace';
      c.globalAlpha = 0.55;   // more transparent
      c.fillText('$ ' + text, 6, 28);
      const tex = new THREE.CanvasTexture(cvs);
      const mat = new THREE.SpriteMaterial({ map:tex, transparent:true, opacity:0.65, depthWrite:false });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(1.4, 0.28, 1);   // smaller scale
      return sprite;
    }

    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    CMD_ORBIT.forEach((cmd, i) => {
      const sprite = makeSprite(cmd);
      const phi = Math.acos(1 - 2*(i+0.5)/CMD_ORBIT.length);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 2.2 + (Math.random()-0.5)*0.3;
      sprite.position.set(r*Math.sin(phi)*Math.cos(theta), r*Math.sin(phi)*Math.sin(theta), r*Math.cos(phi));
      orbitGroup.add(sprite);
    });

    // Drag rotation
    let isDrag=false, prevM={x:0,y:0}, targetR={x:0,y:0}, curR={x:0,y:0};
    heroCanvas.addEventListener('mousedown', e => { isDrag=true; prevM={x:e.clientX,y:e.clientY}; heroCanvas.style.cursor='grabbing'; });
    window.addEventListener('mousemove', e => {
      if (!isDrag) return;
      targetR.y += (e.clientX-prevM.x)*0.007; targetR.x += (e.clientY-prevM.y)*0.007;
      prevM={x:e.clientX,y:e.clientY};
    });
    window.addEventListener('mouseup', () => { isDrag=false; heroCanvas.style.cursor='grab'; });
    heroCanvas.addEventListener('touchstart', e => { isDrag=true; prevM={x:e.touches[0].clientX,y:e.touches[0].clientY}; },{passive:true});
    heroCanvas.addEventListener('touchmove', e => {
      if (!isDrag) return;
      targetR.y+=(e.touches[0].clientX-prevM.x)*0.007; targetR.x+=(e.touches[0].clientY-prevM.y)*0.007;
      prevM={x:e.touches[0].clientX,y:e.touches[0].clientY};
    },{passive:true});
    heroCanvas.addEventListener('touchend',()=>{isDrag=false;});
    heroCanvas.style.cursor='grab';

    function animateHero() {
      requestAnimationFrame(animateHero);
      if (!isDrag) targetR.y += 0.004;
      curR.x += (targetR.x-curR.x)*0.06;
      curR.y += (targetR.y-curR.y)*0.06;
      sphereOut.rotation.x=curR.x; sphereOut.rotation.y=curR.y;
      sphereIn.rotation.x=-curR.x*0.7; sphereIn.rotation.y=-curR.y*0.7;
      orbitGroup.rotation.x=curR.x; orbitGroup.rotation.y=curR.y;
      renderer.render(scene,camera);
    }

    resizeHero();
    animateHero();
    window.addEventListener('resize', resizeHero);
  }

  // ---- SECTION SPHERES — subtle decorative spheres on each section ----
  const sectionSpheres = [
    { id:'sphere-experience', r:0.55, color:0xffffff, opacity:0.07, speed:0.002 },
    { id:'sphere-projects', r:0.7, color:0x3b82f6, opacity:0.08, speed:0.003 },
    { id:'sphere-skills',   r:0.5, color:0x22c55e, opacity:0.07, speed:0.002 },
    { id:'sphere-about',    r:0.6, color:0x3b82f6, opacity:0.08, speed:0.0025 },
    { id:'sphere-contact',  r:0.45, color:0xffffff, opacity:0.06, speed:0.003 },
  ];

  sectionSpheres.forEach(cfg => {
    const cvs = document.getElementById(cfg.id);
    if (!cvs) return;
    const sc = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 50);
    cam.position.z = 2.5;
    const ren = new THREE.WebGLRenderer({ canvas:cvs, alpha:true, antialias:true });
    ren.setClearColor(0,0);
    ren.setPixelRatio(Math.min(window.devicePixelRatio,2));
    const size = Math.min(cvs.parentElement?.clientWidth||300, 300);
    ren.setSize(size, size);

    const geo = new THREE.IcosahedronGeometry(cfg.r, 2);
    const mat = new THREE.MeshBasicMaterial({ color:cfg.color, wireframe:true, transparent:true, opacity:cfg.opacity });
    const mesh = new THREE.Mesh(geo, mat);
    sc.add(mesh);

    let rot = 0;
    function anim() {
      requestAnimationFrame(anim);
      rot += cfg.speed;
      mesh.rotation.y = rot; mesh.rotation.x = rot*0.4;
      ren.render(sc,cam);
    }
    anim();
  });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  setLang(currentLang);
  setTheme(currentTheme);
});
