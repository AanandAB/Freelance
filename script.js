// ── CURSOR ──
const cur = document.getElementById('cur');
if (cur) {
  document.addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px';
    cur.style.top  = e.clientY + 'px';
  });
  document.querySelectorAll('a,button,.service-card').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('grow'));
    el.addEventListener('mouseleave', () => cur.classList.remove('grow'));
  });
}

// ── CHARACTER-LEVEL HERO ANIMATION (kinetic drop) ──
(function initHero() {
  const hed = document.getElementById('hero-hed');
  if (!hed) return;
  const words = hed.querySelectorAll('.word');
  words.forEach(word => {
    const isAccent = word.classList.contains('accent');
    const text = word.textContent;
    word.textContent = '';
    [...text].forEach((char, ci) => {
      const span = document.createElement('span');
      span.className = 'char' + (isAccent ? ' accent' : '');
      span.textContent = char;
      word.appendChild(span);
    });
  });
  // Animate after DOM settles
  setTimeout(() => {
    const chars = hed.querySelectorAll('.word .char');
    chars.forEach((char, i) => {
      setTimeout(() => char.classList.add('in'), 300 + i * 35);
    });
  }, 200);
})();

// ── MARQUEE BUILD ──
const items = ['Website Development','Software Engineering','Full-Stack Apps','Clean Code','Fast Delivery','Kerala, India','Available Now','React & Next.js','Python','Node.js','Freelance Ready'];
const track = document.getElementById('mtrack');
if (track) {
  let marqueeHTML = '';
  for(let r = 0; r < 3; r++) items.forEach(t => { marqueeHTML += `<span class="marquee-item">${t}</span>`; });
  track.innerHTML = marqueeHTML;
}

// ── LENIS SMOOTH SCROLL ──
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;
if (window.Lenis && !prefersReduced) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); revealObserver.unobserve(e.target); }});
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.r').forEach(el => revealObserver.observe(el));

// ── COUNTER ANIMATION ──
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '+';
    let start = 0;
    const step = target / 50;
    const t = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start) + suffix;
      if(start >= target) clearInterval(t);
    }, 24);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ── SKILL BARS ──
const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(!e.isIntersecting) return;
    e.target.querySelectorAll('.skill-bar').forEach(b => {
      b.style.width = b.dataset.w + '%';
    });
    skillObserver.unobserve(e.target);
  });
}, { threshold: 0.3 });
const skillsList = document.querySelector('.skills-list');
if(skillsList) skillObserver.observe(skillsList);

// ── FORM → WHATSAPP ──
const sendBtn = document.getElementById('send-btn');
if (sendBtn) sendBtn.addEventListener('click', function() {
  const name    = document.getElementById('form-name').value.trim() || '(not provided)';
  const email   = document.getElementById('form-email').value.trim() || '(not provided)';
  const service = document.getElementById('form-service').value || '(not selected)';
  const message = document.getElementById('form-message').value.trim() || '(no message)';

  const waNumber = '917034026295';
  const waMsg = `*New Project Enquiry*%0A%0A*Name:* ${name}%0A*Email:* ${email}%0A*Service:* ${service}%0A*Message:* ${message}%0A%0A_Sent from aanandab.dev_`;

  window.open(`https://wa.me/${waNumber}?text=${waMsg}`, '_blank');

  const s = this.querySelector('span');
  s.textContent = '✓ Opening WhatsApp...';
  this.style.background = 'var(--paper)';
  setTimeout(() => {
    s.textContent = 'Send message →';
    this.style.background = '';
  }, 3500);
});

// ── SMOOTH SCROLL FOR ANCHOR LINKS (Lenis-aware) ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if(!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -70 });
    else target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── SCROLL PROGRESS BAR ──
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', Math.round(pct));
  }, { passive: true });
}

// ── BACK TO TOP (Lenis-aware) ──
const backBtn = document.getElementById('back-to-top');
if (backBtn) {
  window.addEventListener('scroll', () => {
    backBtn.classList.toggle('visible', window.scrollY > window.innerHeight * 0.5);
  }, { passive: true });
  backBtn.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── PARALLAX (typography + shapes) ──
// Elements carry data-parallax="<speed>" (negative = recede, positive = advance).
// We measure each element's document-relative centre once, then translate it
// relative to the viewport centre — this avoids transform feedback accumulation.
const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]')).map(el => ({
  el,
  speed: parseFloat(el.getAttribute('data-parallax')) || 0,
  base: 0
}));
if (parallaxEls.length && !prefersReduced) {
  function measureBases() {
    const scrollY = window.scrollY;
    parallaxEls.forEach(p => {
      p.el.style.transform = 'none';
      const rect = p.el.getBoundingClientRect();
      p.base = rect.top + scrollY + rect.height / 2;
    });
  }
  function applyParallax() {
    const vh = window.innerHeight;
    const vc = window.scrollY + vh / 2;
    parallaxEls.forEach(p => {
      const offset = p.base - vc;
      p.el.style.transform = 'translate3d(0,' + (-offset * p.speed).toFixed(1) + 'px,0)';
    });
  }
  measureBases();
  applyParallax();
  window.addEventListener('resize', () => { measureBases(); applyParallax(); });
  window.addEventListener('scroll', () => {
    requestAnimationFrame(applyParallax);
  }, { passive: true });
}
