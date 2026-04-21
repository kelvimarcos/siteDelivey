/* =============================================
   BURGUER HOUSE — script.js
   Micro-interações e UX enhancements
   ============================================= */

/* ── Utilitários ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* =============================================
   1. [REMOVIDO] Barra de progresso de leitura
   ============================================= */

/* =============================================
   2. HEADER — efeito de scroll + nav ativa
   ============================================= */
function initHeader() {
  const header = $('header');
  const sections = $$('section[id], footer[id]');
  const navLinks = $$('.nav-desktop a, .nav-mobile .mobile-link');

  /* Sombra ao rolar */
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 16);
  }, { passive: true });

  /* Link ativo com IntersectionObserver */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(sec => observer.observe(sec));
}

/* =============================================
   3. MENU MOBILE — toggle com animação
   ============================================= */
function initMobileMenu() {
  const toggle = $('#menu-toggle');
  const mobileNav = $('#mobile-menu');
  if (!toggle || !mobileNav) return;

  function closeMenu() {
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    mobileNav.classList.toggle('open', isOpen);
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
  });

  /* Fecha ao clicar em link */
  $$('.mobile-link, .btn-mobile-cta', mobileNav).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Fecha ao clicar fora */
  document.addEventListener('click', e => {
    if (!mobileNav.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  /* Fecha com Esc */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* =============================================
   4. SCROLL REVEAL — fade + slide-up
   ============================================= */
function initScrollReveal() {
  const targets = $$('[data-reveal]');
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

/* =============================================
   5. CONTADOR ANIMADO — hero stats
   ============================================= */
function animateCounter(el, target, suffix = '', duration = 1400) {
  const start = performance.now();
  const isDecimal = target % 1 !== 0;

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    /* easeOutExpo */
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = target * eased;
    el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function initCounters() {
  const statsSection = $('.hero-stats');
  if (!statsSection) return;

  const items = [
    { el: statsSection.querySelectorAll('strong')[0], target: 500, suffix: '+' },
    { el: statsSection.querySelectorAll('strong')[1], target: 4.9, suffix: '★' },
    { el: statsSection.querySelectorAll('strong')[2], target: 40, suffix: ' min' },
  ];

  let fired = false;
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !fired) {
      fired = true;
      items.forEach(({ el, target, suffix }) => animateCounter(el, target, suffix));
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  observer.observe(statsSection);
}

/* =============================================
   6. RIPPLE NOS BOTÕES
   ============================================= */
function initRipple() {
  $$('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const existing = this.querySelector('.ripple');
      if (existing) existing.remove();

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
      this.appendChild(ripple);

      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* =============================================
   7. CARDS DO CARDÁPIO — tilt 3D suave
   ============================================= */
function initCardTilt() {
  const cards = $$('.menu-card');
  const MAX_TILT = 6; /* graus */

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      card.style.transform = `
        perspective(800px)
        rotateX(${-dy * MAX_TILT}deg)
        rotateY(${dx * MAX_TILT}deg)
        translateY(-6px)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* =============================================
   8. PARTÍCULAS FLUTUANTES — hero background
   ============================================= */
function initHeroParticles() {
  const wrapper = $('.hero-wrapper');
  if (!wrapper) return;

  /* Já existe canvas? */
  if (wrapper.querySelector('canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'hero-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  wrapper.prepend(canvas);

  const ctx = canvas.getContext('2d');

  const PARTICLE_COUNT = 38;
  const COLORS = ['rgba(255,107,53,0.18)', 'rgba(255,107,53,0.10)', 'rgba(255,140,80,0.12)'];

  let particles = [];
  let W, H, animId;

  function resize() {
    W = canvas.width = wrapper.offsetWidth;
    H = canvas.height = wrapper.offsetHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticle() {
    return {
      x: randomBetween(0, W),
      y: randomBetween(0, H),
      r: randomBetween(6, 24),
      dx: randomBetween(-0.18, 0.18),
      dy: randomBetween(-0.22, -0.06),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: randomBetween(0.4, 1),
      pulse: randomBetween(0, Math.PI * 2),
      pulseSpeed: randomBetween(0.006, 0.016),
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.pulse += p.pulseSpeed;
      const r = p.r + Math.sin(p.pulse) * 2;

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
      ctx.fill();
      ctx.globalAlpha = 1;

      p.x += p.dx;
      p.y += p.dy;

      /* Rebote suave nas bordas */
      if (p.x < -p.r * 2) p.x = W + p.r;
      if (p.x > W + p.r * 2) p.x = -p.r;
      if (p.y < -p.r * 2) p.y = H + p.r;
    });

    animId = requestAnimationFrame(draw);
  }

  /* Pausa quando a section sai da viewport (performance) */
  const visObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!animId) draw();
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  });

  visObs.observe(wrapper);

  window.addEventListener('resize', () => {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }, { passive: true });

  init();
  draw();
}

/* =============================================
   9. BLOB ANIMADO — seção CTA
   ============================================= */
function initCtaBlobs() {
  const cta = $('.cta');
  if (!cta) return;
  if (cta.querySelector('.cta-blob')) return;

  [
    { size: 420, x: '-12%', y: '-30%', delay: '0s' },
    { size: 320, x: '70%',  y: '40%',  delay: '-4s' },
    { size: 200, x: '40%',  y: '-50%', delay: '-8s' },
  ].forEach(({ size, x, y, delay }) => {
    const blob = document.createElement('div');
    blob.className = 'cta-blob';
    blob.setAttribute('aria-hidden', 'true');
    blob.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x}; top:${y};
      animation-delay:${delay};
    `;
    cta.prepend(blob);
  });
}

/* =============================================
   10. TOAST — feedback ao clicar em "Pedir"
   ============================================= */
function initToast() {
  /* Cria container de toasts */
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);

  function showToast(msg, duration = 3500) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${msg}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
  }

  /* Intercept nos botões "Pedir" dos cards */
  $$('.menu-card .btn').forEach(btn => {
    btn.addEventListener('click', e => {
      /* Não bloqueia o link — só mostra o toast */
      showToast('🍔 Redirecionando para o WhatsApp...');
    });
  });
}

/* =============================================
   11. ADICIONA ATRIBUTOS data-reveal AO HTML
   (Para não poluir o HTML estático)
   ============================================= */
function addRevealAttrs() {
  const groups = [
    ['.hero-content', 'left'],
    ['.hero-image-wrapper', 'right'],
    ['.section-header', 'up'],
    ['.menu-card', 'up'],
    ['.sobre-img-wrapper', 'left'],
    ['.sobre-content', 'right'],
    ['.cta-inner', 'up'],
    ['.footer-brand', 'up'],
    ['.footer-section', 'up'],
    ['.sobre-diferenciais li', 'left'],
  ];

  groups.forEach(([sel, dir]) => {
    $$(sel).forEach((el, i) => {
      el.setAttribute('data-reveal', dir);
      if (i > 0) el.style.transitionDelay = `${i * 0.08}s`;
    });
  });
}

/* =============================================
   12. PARALLAX LEVE NA IMAGEM HERO
   ============================================= */
function initHeroParallax() {
  const heroImg = $('.hero-image-wrapper img');
  if (!heroImg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    const offset = window.scrollY * 0.12;
    heroImg.style.transform = `translateY(${offset}px)`;
  }, { passive: true });
}

/* =============================================
   INIT — Aguarda DOM pronto
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  addRevealAttrs();
  initScrollReveal();
  initCounters();
  initRipple();
  initCardTilt();
  initHeroParticles();
  initCtaBlobs();
  initToast();
  initHeroParallax();
});
