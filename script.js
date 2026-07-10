/* Corat Coret Layar — Premium JS */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Smooth scroll (CSS already, but keep navbar behavior nice)
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', href);
  });
});

// Header solid on scroll + active nav link
(function initHeader() {
  const header = $('#site-header');
  const links = $$('[data-nav]');
  const sections = links
    .map(l => document.querySelector(l.getAttribute('href') || l.getAttribute('data-nav')))
    .filter(Boolean);

  const setActive = () => {
    let bestId = '#home';
    let bestTop = -Infinity;

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      // consider when section top is near the header
      const top = -rect.top;
      if (top <= window.innerHeight && top > bestTop) {
        bestTop = top;
        bestId = `#${sec.id}`;
      }
    });

    links.forEach(l => {
      const href = l.getAttribute('href');
      l.classList.toggle('is-active', href === bestId);
    });
  };

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-solid', window.scrollY > 24);
    setActive();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Mobile menu
(function initMobileMenu() {
  const toggle = $('.nav__toggle');
  const mobile = $('#mobile-menu');
  if (!toggle || !mobile) return;

  const close = () => {
    mobile.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const open = () => {
    mobile.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  toggle.addEventListener('click', () => {
    const isOpen = mobile.classList.contains('is-open');
    isOpen ? close() : open();
  });

  $$('#mobile-menu [data-mobile-nav]').forEach(a => {
    a.addEventListener('click', close);
  });

  document.addEventListener('click', (e) => {
    if (!mobile.classList.contains('is-open')) return;
    if (mobile.contains(e.target) || toggle.contains(e.target)) return;
    close();
  });
})();

// Ripple effect
(function initRipple() {
  $$('[data-ripple]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      btn.style.setProperty('--ripple-x', `${x}px`);
      btn.style.setProperty('--ripple-y', `${y}px`);

      btn.classList.remove('is-rippling');
      // trigger reflow
      void btn.offsetWidth;
      btn.classList.add('is-rippling');
      setTimeout(() => btn.classList.remove('is-rippling'), 550);
    });
  });

  // adjust ripple pseudo positioning for current button
  const style = document.createElement('style');
  style.textContent = `.ripple::after{left: var(--ripple-x, 50%); top: var(--ripple-y, 50%);}`;
  document.head.appendChild(style);
})();

// Loading overlay
(function initLoading() {
  const overlay = $('#loading');
  if (!overlay) return;

  const done = () => {
    overlay.classList.add('is-hidden');
    setTimeout(() => overlay.remove(), 450);
  };

  window.addEventListener('load', () => {
    // keep a minimum time for nicer effect
    setTimeout(done, 450);
  });

  // fallback
  setTimeout(done, 4000);
})();

// Cursor glow
(function initCursor() {
  const c1 = $('.cursor');
  const c2 = $('.cursor--ring');
  if (!c1 || !c2) return;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let rx = x;
  let ry = y;

  window.addEventListener('mousemove', (e) => {
    x = e.clientX;
    y = e.clientY;
    c1.style.left = `${x}px`;
    c1.style.top = `${y}px`;
  }, { passive: true });

  const tick = () => {
    rx += (x - rx) * 0.08;
    ry += (y - ry) * 0.08;
    c2.style.left = `${rx}px`;
    c2.style.top = `${ry}px`;
    requestAnimationFrame(tick);
  };
  tick();
})();

// Typing effect
(function initTyping() {
  const el = document.querySelector('[data-typing]');
  if (!el) return;
  const words = (el.getAttribute('data-typing') || '').split(',').map(s => s.trim()).filter(Boolean);

  let i = 0;
  let cur = '';
  let deleting = false;
  let speed = 55;
  let pause = 900;

  const tick = () => {
    const word = words[i % words.length] || '';

    if (!deleting) {
      cur = word.slice(0, cur.length + 1);
      el.textContent = cur;
      speed = 55 + Math.random() * 40;
      if (cur.length === word.length) {
        deleting = true;
        speed = pause;
      }
    } else {
      cur = word.slice(0, Math.max(0, cur.length - 1));
      el.textContent = cur;
      speed = 22 + Math.random() * 20;
      if (cur.length === 0) {
        deleting = false;
        i++;
        speed = 250;
      }
    }

    setTimeout(tick, speed);
  };

  tick();
})();

// Scroll reveal
(function initScrollReveal() {
  const nodes = $$('.reveal-up, .reveal-left, .reveal-right');
  if (!nodes.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-show');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  nodes.forEach(n => io.observe(n));
})();

// Testimonial slider
(function initTestimonial() {
  const track = $('#testimonialTrack');
  if (!track) return;

  const cards = $$('[data-testimonial]', track);
  const prev = $('#tPrev');
  const next = $('#tNext');
  const dotsWrap = $('#tDots');
  if (!cards.length) return;

  let index = 0;
  let timer = null;

  // create dots
  const dots = cards.map((_, idx) => {
    const d = document.createElement('span');
    d.className = 'dot';
    d.setAttribute('role', 'button');
    d.setAttribute('aria-label', `Testimoni ${idx + 1}`);
    d.addEventListener('click', () => go(idx, true));
    dotsWrap.appendChild(d);
    return d;
  });

  const updateDots = () => {
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
  };

  const width = () => cards[0].getBoundingClientRect().width + 14; // gap

  const go = (i, resetTimer = false) => {
    index = (i + cards.length) % cards.length;
    track.style.transform = `translateX(${-index * width()}px)`;
    updateDots();
    if (resetTimer) start();
  };

  const start = () => {
    stop();
    timer = setInterval(() => go(index + 1), 4200);
  };

  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  prev?.addEventListener('click', () => go(index - 1));
  next?.addEventListener('click', () => go(index + 1));

  window.addEventListener('resize', () => {
    track.style.transform = `translateX(${-index * width()}px)`;
  });

  updateDots();
  start();

  track.addEventListener('mouseenter', stop);
  track.addEventListener('mouseleave', start);
})();

// FAQ accordion
(function initFAQ() {
  const acc = $('#faqAccordion');
  if (!acc) return;

  $$('.acc-item', acc).forEach(item => {
    const btn = $('.acc-trigger', item);
    const panel = $('.acc-panel', item);
    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // close others
      $$('.acc-trigger', acc).forEach(b => b.setAttribute('aria-expanded', 'false'));
      $$('.acc-panel', acc).forEach(p => p.hidden = true);

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });
})();

// Counter animation (optional)
(function initCounters() {
  const nodes = $$('[data-counter]');
  if (!nodes.length) return;

  const animate = (node) => {
    const target = Number(node.getAttribute('data-counter')) || 0;
    const dur = 950;
    const startVal = 0;
    const t0 = performance.now();

    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const v = Math.floor(startVal + (target - startVal) * (1 - Math.pow(1 - p, 3)));
      node.textContent = v.toLocaleString('id-ID');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animate(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.35 });

  nodes.forEach(n => io.observe(n));
})();

