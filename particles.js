/* =========================================================
   GDB‑7 / Phase‑1: Premium Constellation + Micro‑Interactions
   ---------------------------------------------------------
   - Idle particles
   - Constellation morph to OWL + "ON IT, G!! 🦉⚡"
   - Reveal-on-scroll, scroll-driven speed, hero parallax
   - Toggle SHOW_OWL = false for "phrase only" (Option 1)
   ========================================================= */

/* ---------- Feature flags ---------- */
const SHOW_OWL = true;        // true = owl + phrase (Option 4), false = phrase only (Option 1)
const AUTO_TRIGGER_MS = 1200; // delay before first morph
const HOLD_MS = 1600;         // how long the constellation holds its shape
const CYCLE_PAUSE_MS = 6000;  // pause between morph cycles
const MAX_TARGET_POINTS = 700;// cap for shape points (perf)

/* ---------- Theme (UBS-inspired) ---------- */
const STAR_FILL   = 'rgba(192,194,197,0.35)';  // soft silver flecks
const LINE_SILVER = 'rgba(192,194,197,0.18)';  // faint link lines in hold

/* ---------- Canvas setup ---------- */
const canvas = document.getElementById('particles');
const ctx = canvas ? canvas.getContext('2d') : null;

if (!canvas || !ctx) {
  console.warn('[particles.js] #particles canvas not found.');
}

function resize() {
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => {
  resize();
  buildTargets(); // rebuild targets on size change
});

/* ---------- Particles ---------- */
const BASE_SPEED_MIN = 0.20;
const BASE_SPEED_MAX = 0.70;
let speedFactor = 1.0; // scroll-aware multiplier

class Particle {
  constructor() {
    this.size = Math.random() * 1.3 + 0.3;
    this.reset();
    this.target = null;   // {x,y} when morphing
    this.state  = 'idle'; // 'idle' | 'morph' | 'hold'
  }
  reset() {
    if (!canvas) return;
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.vy = -(Math.random() * (BASE_SPEED_MAX - BASE_SPEED_MIN) + BASE_SPEED_MIN);
    this.vx = (Math.random() - 0.5) * 0.15;
  }
  step() {
    if (!canvas) return;
    if (this.state === 'morph' && this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      this.x += dx * 0.15;
      this.y += dy * 0.15;
      this.vx *= 0.9; this.vy *= 0.9;
    } else if (this.state === 'hold') {
      this.x += (Math.random() - 0.5) * 0.1;
      this.y += (Math.random() - 0.5) * 0.1;
    } else {
      this.x += this.vx;
      this.y += this.vy * speedFactor;
      if (this.y < -2) { this.y = canvas.height + 2; this.x = Math.random() * canvas.width; }
      if (this.x < -2) this.x = canvas.width + 2;
      if (this.x > canvas.width + 2) this.x = -2;
    }
  }
  draw(c) {
    c.beginPath();
    c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    c.fill();
  }
}

const PARTICLE_COUNT = (() => {
  if (!canvas) return 80;
  const base = Math.round((canvas.width * canvas.height) / 40000) + 40;
  return Math.min(90, Math.max(60, base));
})();
const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

/* ---------- Off-screen target builder (phrase + optional owl) ---------- */
let targets = []; // array of {x, y}
let targetBuiltFor = { w: 0, h: 0 };

function buildTargets() {
  if (!canvas) return;
  const w = canvas.width, h = canvas.height;
  if (w === 0 || h === 0) return;
  if (targetBuiltFor.w === w && targetBuiltFor.h === h && targets.length) return;
  targetBuiltFor = { w, h };

  const off = document.createElement('canvas');
  const octx = off.getContext('2d');
  off.width = w; off.height = h;

  octx.clearRect(0, 0, w, h);

  // Phrase centered above middle
  const phrase = 'ON IT, G!! 🦉⚡';
  const baseY  = Math.max(h * 0.38, 140);
  octx.fillStyle = '#E6E8EA';
  const fontSize = Math.min(64, Math.max(28, Math.round(w * 0.045)));
  octx.font = `700 ${fontSize}px Inter, Helvetica, Arial, sans-serif`;
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  octx.fillText(phrase, w / 2, baseY);

  // Owl (minimal line-art) below the phrase if SHOW_OWL
  if (SHOW_OWL) {
    octx.strokeStyle = '#E6E8EA';
    octx.lineWidth   = Math.max(2, Math.round(w * 0.0022));

    const cx = w / 2;
    const cy = baseY + fontSize * 0.95 + Math.min(120, h * 0.085);
    const headR = Math.min(80, Math.max(38, Math.round(w * 0.06)));

    // Head circle
    octx.beginPath(); octx.arc(cx, cy, headR, 0, Math.PI * 2); octx.stroke();

    // Eyes
    const eyeR = Math.max(6, Math.round(headR * 0.18));
    octx.beginPath(); octx.arc(cx - headR * 0.42, cy - headR * 0.15, eyeR, 0, Math.PI * 2); octx.stroke();
    octx.beginPath(); octx.arc(cx + headR * 0.42, cy - headR * 0.15, eyeR, 0, Math.PI * 2); octx.stroke();

    // Beak (small triangle)
    octx.beginPath();
    octx.moveTo(cx - eyeR * 0.5, cy + headR * 0.05);
    octx.lineTo(cx,               cy + headR * 0.26);
    octx.lineTo(cx + eyeR * 0.5,  cy + headR * 0.05);
    octx.closePath(); octx.stroke();

    // Body arc
    octx.beginPath();
    octx.moveTo(cx - headR * 1.2, cy + headR * 0.75);
    octx.quadraticCurveTo(cx,      cy + headR * 1.6,  cx + headR * 1.2, cy + headR * 0.75);
    octx.stroke();

    // Tiny wing hints
    octx.beginPath();
    octx.moveTo(cx - headR * 0.8, cy + headR * 0.70);
    octx.quadraticCurveTo(cx - headR * 1.0, cy + headR * 1.05, cx - headR * 0.65, cy + headR * 1.10);
    octx.stroke();

    octx.beginPath();
    octx.moveTo(cx + headR * 0.8, cy + headR * 0.70);
    octx.quadraticCurveTo(cx + headR * 1.0, cy + headR * 1.05, cx + headR * 0.65, cy + headR * 1.10);
    octx.stroke();
  }

  // Sample bright pixels to create target points
  const img  = octx.getImageData(0, 0, w, h).data;
  const step = Math.max(6, Math.round(Math.min(w, h) * 0.012)); // sampling stride
  const pts  = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4 + 3; // alpha channel
      if (img[idx] > 110) pts.push({ x, y });
    }
  }

  targets = shuffle(pts).slice(0, MAX_TARGET_POINTS);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- Morph controller ---------- */
let phase = 'idle'; // 'idle' | 'morph' | 'hold' | 'disperse'
let phaseTimer = 0;
let lastTs = 0;

function assignTargets() {
  if (!targets.length) return;
  const k = Math.min(particles.length, targets.length);
  for (let i = 0; i < k; i++) {
    particles[i].target = targets[i];
    particles[i].state  = 'morph';
  }
}
function setHold() {
  particles.forEach(p => {
    if (p.target) p.state = 'hold';
  });
}
function releaseTargets() {
  particles.forEach(p => {
    p.state  = 'idle';
    p.target = null;
    p.vx = (Math.random() - 0.5) * 0.15;
    p.vy = -(Math.random() * (BASE_SPEED_MAX - BASE_SPEED_MIN) + BASE_SPEED_MIN);
  });
}

/* ---------- Draw loop ---------- */
function draw() {
  if (!ctx || !canvas) return requestAnimationFrame(draw);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = STAR_FILL;

  particles.forEach(p => { p.step(); p.draw(ctx); });

  if (phase === 'hold') {
    ctx.strokeStyle = LINE_SILVER;
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i += 3) {
      const a = particles[i], b = particles[(i + 5) % particles.length];
      if (a.target && b.target) {
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 180 * 180) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
  }

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

/* ---------- Phase timeline ---------- */
function tick(ts) {
  if (!lastTs) lastTs = ts;
  const dt = ts - lastTs;
  lastTs   = ts;

  phaseTimer += dt;

  switch (phase) {
    case 'idle':
      if (phaseTimer > AUTO_TRIGGER_MS) {
        buildTargets();
        assignTargets();
        phase = 'morph';
        phaseTimer = 0;
      }
      break;
    case 'morph':
      if (phaseTimer > 900) {
        setHold();
        phase = 'hold';
        phaseTimer = 0;
      }
      break;
    case 'hold':
      if (phaseTimer > HOLD_MS) {
        releaseTargets();
        phase = 'disperse';
        phaseTimer = 0;
      }
      break;
    case 'disperse':
      if (phaseTimer > CYCLE_PAUSE_MS) {
        phase = 'idle';
        phaseTimer = 0;
      }
      break;
  }

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------- Scroll micro‑interactions ---------- */
let lastScrollY = window.scrollY;
let targetSpeed = 1.0;

function onScroll(){
  const currentY = window.scrollY;
  const delta = currentY - lastScrollY;
  const directionBoost = Math.max(-0.2, Math.min(0.4, delta * 0.0015));
  targetSpeed = 1.0 + directionBoost;
  lastScrollY = currentY;
}
window.addEventListener('scroll', onScroll, { passive: true });

function easeSpeed(){
  speedFactor += (targetSpeed - speedFactor) * 0.08;
  requestAnimationFrame(easeSpeed);
}
easeSpeed();

/* ---------- Hero text micro‑parallax ---------- */
const heroText = document.querySelector('.hero-text');
let lastRAF = 0;
function parallaxTick(ts){
  if (ts - lastRAF > 16){
    if (heroText){
      const y = window.scrollY;
      const offset = Math.max(-8, Math.min(8, y * 0.02));
      heroText.style.transform = `translateY(${offset}px)`;
    }
    lastRAF = ts;
  }
  requestAnimationFrame(parallaxTick);
}
requestAnimationFrame(parallaxTick);

/* ---------- Reveal-on-scroll for sections ---------- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('reveal-in');
      io.unobserve(entry.target);
    }
  });
},{ threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
revealEls.forEach(el => io.observe(el));

/* ---------- Reduced motion safety ---------- */
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  if (heroText) heroText.style.transform = 'none';
}

/* ---------- Optional: tap/click to retrigger constellation ---------- */
if (canvas) {
  canvas.addEventListener('click', () => {
    phase = 'idle';
    phaseTimer = 0;
  });
}
