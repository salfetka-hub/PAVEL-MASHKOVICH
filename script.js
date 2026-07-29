document.addEventListener('DOMContentLoaded', () => {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── MOBILE MENU ──
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      nav.classList.toggle('active');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        nav.classList.remove('active');
      });
    });
  }

  // ── HEADER STATE ──
  const header = document.getElementById('header');
  const onScroll = () => {
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── SCROLL REVEAL ──
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${Math.min(i * 80, 240)}ms`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ── SPLIT TEXT ANIMATION ──
  document.querySelectorAll('.section-title').forEach(title => {
    const words = title.textContent.trim().split(/\s+/);
    title.textContent = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'split-word';
      span.textContent = word;
      span.style.transitionDelay = `${i * 0.12}s`;
      title.appendChild(span);
      if (i < words.length - 1) title.append(' ');
    });
  });

  document.querySelectorAll('.section-tag').forEach(tag => {
    const chars = tag.textContent.trim().split('');
    tag.textContent = '';
    chars.forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.transitionDelay = `${i * 0.04}s`;
      tag.appendChild(span);
    });
  });

  const splitObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseFloat(el.dataset.revealDelay) || 0;
        setTimeout(() => el.classList.add('visible'), delay * 1000);
        splitObserver.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.split-word, .split-char, .reveal-l, .reveal-r, .reveal-scale')
    .forEach(el => splitObserver.observe(el));

  // ── 3D TILT ON CARDS ──
  if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
    const grid = document.querySelector('.services-grid');
    if (!grid) return;

    let active = null, shineRaf = null;
    let sx = 0.5, sy = 0.5;

    const resetCard = (card) => {
      if (!card) return;
      card.style.transform = '';
      const s = card.querySelector('.card-shine');
      if (s) { s.style.opacity = '0'; }
    };

    const updateShine = () => {
      shineRaf = null;
      if (!active) return;
      const s = active.querySelector('.card-shine');
      if (!s) return;
      s.style.background =
        `radial-gradient(380px circle at ${sx * 100}% ${sy * 100}%, rgba(62,160,148,0.18), transparent 60%)`;
    };

    grid.addEventListener('pointermove', e => {
      const card = e.target.closest('.tilt');
      if (!card) { resetCard(active); active = null; return; }
      if (active !== card) { resetCard(active); active = card; }

      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const dx = px - 0.5;
      const dy = py - 0.5;

      card.style.transform =
        `perspective(700px) rotateX(${-dy * 18}deg) rotateY(${dx * 20}deg) translateY(-4px)`;

      sx = px; sy = py;
      if (!shineRaf) shineRaf = requestAnimationFrame(updateShine);
    });

    grid.addEventListener('pointerleave', () => {
      resetCard(active);
      active = null;
      if (shineRaf) { cancelAnimationFrame(shineRaf); shineRaf = null; }
    });
  }

  // ── PARALLAX FLOATING CARDS ──
  if (!reducedMotion) {
    const floats = document.querySelectorAll('[data-depth]');
    let mx = 0, my = 0, cx = 0, cy = 0;

    window.addEventListener('pointermove', e => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const loopFloats = () => {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      floats.forEach(el => {
        const d = parseFloat(el.dataset.depth) || 0.05;
        el.style.transform =
          `translate3d(${cx * d * 340}px, ${cy * d * 340}px, 0)`;
      });
      requestAnimationFrame(loopFloats);
    };
    loopFloats();
  }

  // ── WEBGL 3D TEXT BOX ──
  (function init3D() {
    const canvas = document.getElementById('webgl');
    if (!canvas || typeof THREE === 'undefined' || reducedMotion) return;
    const wrap = canvas.parentElement;
    if (!wrap) return;

    try {

      // Canvas texture with text
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 512;
      const x = c.getContext('2d');

      // Solid dark bg
      x.fillStyle = 'rgba(10,14,23,0.6)';
      x.beginPath();
      x.moveTo(20,0); x.lineTo(1004,0);
      x.quadraticCurveTo(1024,0,1024,20);
      x.lineTo(1024,492);
      x.quadraticCurveTo(1024,512,1004,512);
      x.lineTo(20,512);
      x.quadraticCurveTo(0,512,0,492);
      x.lineTo(0,20);
      x.quadraticCurveTo(0,0,20,0);
      x.closePath();
      x.fill();

      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillStyle = '#fff';
      x.font = '700 76px "DM Sans","Inter Tight",sans-serif';
      x.fillText('PAVEL', 512, 160);
      x.fillStyle = '#3ea094';
      x.font = '600 56px "DM Sans","Inter Tight",sans-serif';
      x.fillText('//', 512, 240);
      x.fillStyle = '#fff';
      x.font = '700 76px "DM Sans","Inter Tight",sans-serif';
      x.fillText('MASHKOVICH', 512, 326);

      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;

      // Scene, camera, renderer
      const S = new THREE.Scene();
      const C = new THREE.PerspectiveCamera(35, wrap.clientWidth / wrap.clientHeight, 0.1, 20);
      C.position.set(0, 0.4, 4.8);
      const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      R.setSize(wrap.clientWidth, wrap.clientHeight);

      // Lights
      S.add(new THREE.AmbientLight(0xffffff, 0.6));
      const DL = new THREE.DirectionalLight(0xffffff, 1.2);
      DL.position.set(3, 5, 4);
      S.add(DL);

      // Box
      const M = new THREE.MeshStandardMaterial({
        map: tex, roughness: 0.15, metalness: 0.0, transparent: true, side: THREE.DoubleSide
      });
      const box = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.4, 1.4), M);
      box.position.z = 0.8;
      S.add(box);

      // Wireframe edge
      const EM = new THREE.MeshBasicMaterial({
        color: 0x3ea094, wireframe: true, transparent: true, opacity: 0.18
      });
      const edge = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.52, 1.52), EM);
      edge.position.copy(box.position);
      S.add(edge);

      // Animation
      const clock = new THREE.Clock();
      const anim = () => {
        requestAnimationFrame(anim);
        const t = clock.getElapsedTime();
        const fy = Math.sin(t * 0.5) * 1.5;
        box.position.y = fy;
        box.rotation.y = t * 0.45;
        box.rotation.x = Math.sin(t * 0.2) * 0.06;
        edge.position.y = fy;
        edge.rotation.y = t * 0.45;
        edge.rotation.x = Math.sin(t * 0.2) * 0.06;
        R.render(S, C);
      };
      anim();

      const resize = () => {
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        C.aspect = w / h;
        C.updateProjectionMatrix();
        R.setSize(w, h);
      };
      window.addEventListener('resize', resize);

    } catch (e) {
      console.warn('3D box error:', e);
    }
  })();
});
