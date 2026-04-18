/* ================================================================
   WEDDING INVITATION — script.js
   Features:
   - URL param: ?for=NamaTamu
   - Cover open animation
   - Countdown timer
   - Scroll reveal
   - Music player
   - RSVP + Wishes (localStorage)
   - Parallax on cover
================================================================ */

// ── URL PARAMETER ────────────────────────────────────────────────
const params   = new URLSearchParams(window.location.search);
const namaRaw  = params.get('for');

function formatNama(nama) {
  if (!nama) return 'Tamu Undangan';
  // Decode URI + capitalize each word
  return decodeURIComponent(nama)
    .split(/[\s+]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

const namaFormatted = formatNama(namaRaw);

// Render nama ke semua elemen
document.getElementById('guestName').textContent    = namaFormatted;
document.getElementById('guestInline').textContent  = namaFormatted;

// Pre-fill RSVP name if guest name provided
if (namaRaw) {
  const rsvpNameEl = document.getElementById('rsvpName');
  if (rsvpNameEl) rsvpNameEl.value = namaFormatted;
}

// ── COVER — BUKA UNDANGAN ────────────────────────────────────────
const btnOpen     = document.getElementById('btnOpen');
const cover       = document.getElementById('cover');
const mainContent = document.getElementById('mainContent');

btnOpen.addEventListener('click', () => {
  // Fade out cover
  cover.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  cover.style.opacity    = '0';
  cover.style.transform  = 'scale(1.03)';

  setTimeout(() => {
    cover.style.display = 'none';

    // Show main content
    mainContent.classList.add('visible');
    requestAnimationFrame(() => {
      mainContent.classList.add('faded-in');
    });

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Trigger reveal check
    observeReveal();

    // Start music if allowed
    tryAutoPlay();
  }, 700);
});

// ── COUNTDOWN ───────────────────────────────────────────────────
const WEDDING_DATE = new Date('2025-06-14T08:00:00');

function updateCountdown() {
  const now  = new Date();
  const diff = WEDDING_DATE - now;

  if (diff <= 0) {
    document.getElementById('cdDays').textContent    = '00';
    document.getElementById('cdHours').textContent   = '00';
    document.getElementById('cdMinutes').textContent = '00';
    document.getElementById('cdSeconds').textContent = '00';
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('cdDays').textContent    = String(days).padStart(2, '0');
  document.getElementById('cdHours').textContent   = String(hours).padStart(2, '0');
  document.getElementById('cdMinutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('cdSeconds').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ── SCROLL REVEAL ────────────────────────────────────────────────
function observeReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-child');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Unobserve after reveal (no re-animation)
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

// ── PARALLAX ON COVER ────────────────────────────────────────────
window.addEventListener('scroll', () => {
  if (cover.style.display === 'none') return;
  const scrollY = window.scrollY;
  const orb1 = cover.querySelector('.cover-orb--1');
  const orb2 = cover.querySelector('.cover-orb--2');
  if (orb1) orb1.style.transform = `translate(0, ${scrollY * 0.15}px)`;
  if (orb2) orb2.style.transform = `translate(0, ${scrollY * -0.1}px)`;
}, { passive: true });

// ── MUSIC PLAYER ────────────────────────────────────────────────
const audio       = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicIconPlay  = document.getElementById('musicIconPlay');
const musicIconPause = document.getElementById('musicIconPause');
const musicWave   = document.getElementById('musicWave');

let isPlaying = false;

function setPlaying(state) {
  isPlaying = state;
  musicIconPlay.style.display  = state ? 'none'  : 'block';
  musicIconPause.style.display = state ? 'block' : 'none';
  musicWave.classList.toggle('playing', state);
}

musicToggle.addEventListener('click', () => {
  if (isPlaying) {
    audio.pause();
    setPlaying(false);
  } else {
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }
});

function tryAutoPlay() {
  audio.volume = 0;
  audio.play().then(() => {
    setPlaying(true);
    // Fade in volume
    let vol = 0;
    const fadeIn = setInterval(() => {
      vol = Math.min(vol + 0.05, 0.4);
      audio.volume = vol;
      if (vol >= 0.4) clearInterval(fadeIn);
    }, 150);
  }).catch(() => {
    // Auto-play blocked — user must tap play
    setPlaying(false);
  });
}

// ── RSVP ────────────────────────────────────────────────────────
const btnRsvp    = document.getElementById('btnRsvp');
const rsvpSuccess = document.getElementById('rsvpSuccess');

btnRsvp.addEventListener('click', () => {
  const name  = document.getElementById('rsvpName').value.trim();
  const hadir = document.querySelector('input[name="hadir"]:checked')?.value;
  const count = document.getElementById('rsvpCount').value;

  if (!name) {
    flashInput(document.getElementById('rsvpName'));
    return;
  }

  // Save to localStorage
  const rsvpData = JSON.parse(localStorage.getItem('rsvpList') || '[]');
  rsvpData.push({ name, hadir, count, ts: Date.now() });
  localStorage.setItem('rsvpList', JSON.stringify(rsvpData));

  // Show success
  document.querySelector('.rsvp-form .form-group:first-child').style.display = 'none';
  btnRsvp.style.display = 'none';
  rsvpSuccess.style.display = 'block';
  rsvpSuccess.style.animation = 'wishSlideIn 0.5s ease';
});

function flashInput(el) {
  el.style.borderBottomColor = '#e25555';
  el.focus();
  setTimeout(() => el.style.borderBottomColor = '', 1500);
}

// ── WISHES / UCAPAN ──────────────────────────────────────────────
const WISHES_KEY  = 'weddingWishes_arjuna_rahayu';
const btnWish     = document.getElementById('btnWish');
const wishesWall  = document.getElementById('wishesWall');

function loadWishes() {
  const wishes = JSON.parse(localStorage.getItem(WISHES_KEY) || '[]');
  wishesWall.innerHTML = '';

  if (wishes.length === 0) {
    wishesWall.innerHTML = `
      <p style="font-family:var(--serif);font-style:italic;color:rgba(250,250,248,0.25);font-size:14px;text-align:center;padding:20px 0;">
        Jadilah yang pertama memberikan ucapan...
      </p>`;
    return;
  }

  // Show most recent first
  [...wishes].reverse().forEach(w => {
    const el = document.createElement('div');
    el.className = 'wish-item';
    el.innerHTML = `
      <p class="wish-item-name">${escapeHtml(w.name)}</p>
      <p class="wish-item-text">${escapeHtml(w.message)}</p>
    `;
    wishesWall.appendChild(el);
  });
}

btnWish.addEventListener('click', () => {
  const name = document.getElementById('wishName').value.trim();
  const msg  = document.getElementById('wishText').value.trim();

  if (!name) { flashInput(document.getElementById('wishName')); return; }
  if (!msg)  { flashInput(document.getElementById('wishText')); return; }

  const wishes = JSON.parse(localStorage.getItem(WISHES_KEY) || '[]');
  wishes.push({ name, message: msg, ts: Date.now() });
  localStorage.setItem(WISHES_KEY, JSON.stringify(wishes));

  document.getElementById('wishName').value = '';
  document.getElementById('wishText').value = '';

  loadWishes();
});

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initialize wishes on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadWishes();

  // If no cover is shown (direct section access), init reveal
  if (mainContent.classList.contains('visible')) {
    observeReveal();
  }
});
