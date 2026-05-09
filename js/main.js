/* ============================================
   SYSTEM ANALYSIS & DESIGN — PROJECT SHOWCASE
   Main JavaScript — Animations & Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeroReveal();
  initParticles();
  initTypewriter();
  initRevealAnimations();
  initSideNav();
  initCardTilt();
});

/* ---------- HERO REVEAL (immediate) ---------- */
function initHeroReveal() {
  document.querySelectorAll('.hero-section .reveal').forEach((el, i) => {
    const delay = parseInt(el.dataset.delay) || i * 150;
    setTimeout(() => el.classList.add('visible'), delay);
  });
}

/* ---------- PARTICLE SYSTEM ---------- */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  const PARTICLE_COUNT = 70;
  const MAX_DIST = 140;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x += dx * force * 0.02;
        this.y += dy * force * 0.02;
      }

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(192, 57, 43, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139, 26, 43, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
}

/* ---------- TYPEWRITER EFFECT ---------- */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const text = 'This website showcases our project.';
  let idx = 0;
  function type() {
    if (idx <= text.length) {
      el.textContent = text.substring(0, idx);
      idx++;
      setTimeout(type, 70 + Math.random() * 40);
    }
  }
  setTimeout(type, 1200);
}

/* ---------- SCROLL REVEAL ANIMATIONS ---------- */
function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal:not(.hero-section .reveal)');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay) || 0;
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* ---------- SIDE NAVIGATION ---------- */
function initSideNav() {
  const dots = document.querySelectorAll('.nav-dot');
  const sections = document.querySelectorAll('.section');

  // Click navigation
  dots.forEach(dot => {
    dot.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(dot.dataset.section);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Active state on scroll
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        dots.forEach(d => d.classList.remove('active'));
        const activeDot = document.querySelector(`.nav-dot[data-section="${id}"]`);
        if (activeDot) activeDot.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => navObserver.observe(sec));
}

/* ---------- 3D CARD TILT EFFECT ---------- */
function initCardTilt() {
  const cards = document.querySelectorAll('[data-tilt]');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

/* ---------- PDF MODAL (PDF.js) ---------- */
let currentPdfDoc = null;

async function openPDF(src, title) {
  const modal = document.getElementById('pdfModal');
  const body = document.querySelector('.modal-body');
  const modalTitle = document.getElementById('modalTitle');
  modalTitle.textContent = title || 'Document Viewer';

  // Show modal immediately with loading text
  body.innerHTML = '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:40px;">Loading PDF...</p>';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  try {
    const pdfjsLib = window.pdfjsLib;
    const pdf = await pdfjsLib.getDocument(src).promise;
    currentPdfDoc = pdf;

    // Create scrollable container for all pages
    body.innerHTML = '';
    const container = document.createElement('div');
    container.style.cssText = 'overflow-y:auto;height:100%;background:#525659;padding:10px 0;';
    body.appendChild(container);

    // Render all pages at high resolution
    const dpr = window.devicePixelRatio || 1;
    const renderScale = 2.5; // Base scale for sharp graphics

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);

      // Get the CSS-level viewport for layout sizing
      const cssViewport = page.getViewport({ scale: renderScale });
      // Get a high-res viewport for actual pixel rendering
      const hiResViewport = page.getViewport({ scale: renderScale * dpr });

      const canvas = document.createElement('canvas');
      // Internal pixel resolution (high-res)
      canvas.width = hiResViewport.width;
      canvas.height = hiResViewport.height;
      // CSS display size (logical size) — keeps layout correct while canvas is crisp
      canvas.style.width = cssViewport.width + 'px';
      canvas.style.height = cssViewport.height + 'px';
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto 10px';
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';

      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport: hiResViewport }).promise;
    }
  } catch (err) {
    body.innerHTML = '<p style="color:#E74C3C;text-align:center;padding:40px;">Could not load PDF.<br>Make sure the file exists in assets/pdfs/</p>';
  }
}

function closePDF() {
  const modal = document.getElementById('pdfModal');
  const body = document.querySelector('.modal-body');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => {
    body.innerHTML = '';
    currentPdfDoc = null;
  }, 350);
}

// Close modal on overlay click
document.getElementById('pdfModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closePDF();
});

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePDF();
});
