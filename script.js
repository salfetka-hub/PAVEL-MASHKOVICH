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
        `perspective(700px) rotateX(${-dy * 10}deg) rotateY(${dx * 12}deg) translateY(-3px)`;

      sx = px; sy = py;
      if (!shineRaf) shineRaf = requestAnimationFrame(updateShine);
    });

    grid.addEventListener('pointerleave', () => {
      resetCard(active);
      active = null;
      if (shineRaf) { cancelAnimationFrame(shineRaf); shineRaf = null; }
    });
  }

  // ── AMBIENT BLOB BEHIND CURSOR ──
  if (!reducedMotion) {
    const blob = document.querySelector('.cursor-blob');
    if (blob) {
      let mx = 0, my = 0;
      let bx = -500, by = -500;

      window.addEventListener('pointermove', e => {
        mx = e.clientX;
        my = e.clientY;
      }, { passive: true });

      const loopBlob = () => {
        bx += (mx - bx) * 0.05;
        by += (my - by) * 0.05;
        blob.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
        requestAnimationFrame(loopBlob);
      };
      loopBlob();
    }
  }

  // ── MAGNETIC BUTTONS ──
  if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.btn, .nav-cta, .contact-links a').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const dx = Math.max(-6, Math.min(6, (e.clientX - r.left - r.width / 2) * 0.1));
        const dy = Math.max(-6, Math.min(6, (e.clientY - r.top - r.height / 2) * 0.1));
        el.style.transform = el.classList.contains('btn') || el.classList.contains('nav-cta')
          ? `translate3d(${dx}px, ${dy - 3}px, 0)`
          : `translate3d(${dx}px, ${dy}px, 0)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ── SCROLL PROGRESS ──
  const bar = document.querySelector('.scroll-progress');
  if (bar) {
    const updateBar = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = h > 0 ? `${(window.scrollY / h) * 100}%` : '0%';
    };
    window.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
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
    if (!canvas || typeof THREE === 'undefined' || reducedMotion) {
      console.log('3D box skipped:', { canvas: !!canvas, three: typeof THREE !== 'undefined', reducedMotion });
      return;
    }
    const wrap = canvas.parentElement;
    if (!wrap) return;

    console.log('Starting 3D text box...');
    try {

      // Canvas texture with text (retina-safe)
      const dpr = Math.min(window.devicePixelRatio, 2);
      const W = 1024, H = 512;
      const c = document.createElement('canvas');
      c.width = W * dpr; c.height = H * dpr;
      const x = c.getContext('2d');
      x.scale(dpr, dpr);

      // Solid black background
      x.fillStyle = '#0a0a0a';
      x.fillRect(0, 0, W, H);

      // Subtle border glow
      const borderGrad = x.createRadialGradient(W/2, H/2, 100, W/2, H/2, 320);
      borderGrad.addColorStop(0, 'rgba(62,160,148,0)');
      borderGrad.addColorStop(0.7, 'rgba(62,160,148,0)');
      borderGrad.addColorStop(1, 'rgba(62,160,148,0.04)');
      x.fillStyle = borderGrad;
      x.fillRect(0, 0, W, H);

      // Subtle grid
      x.strokeStyle = 'rgba(62,160,148,0.05)';
      x.lineWidth = 0.5;
      for (let i = 0; i < W; i += 24) {
        x.beginPath(); x.moveTo(i,0); x.lineTo(i,H); x.stroke();
      }
      for (let i = 0; i < H; i += 24) {
        x.beginPath(); x.moveTo(0,i); x.lineTo(W,i); x.stroke();
      }

      x.textAlign = 'center';
      x.textBaseline = 'middle';

      // Glow behind "PAVEL"
      x.shadowColor = 'rgba(62,160,148,0.4)';
      x.shadowBlur = 36;
      x.fillStyle = '#ffffff';
      x.font = '800 74px "DM Sans","Inter Tight",sans-serif';
      x.fillText('PAVEL', W/2, 192);

      // Glow behind "MASHKOVICH"
      x.shadowColor = 'rgba(62,160,148,0.3)';
      x.shadowBlur = 28;
      x.fillStyle = '#ffffff';
      x.font = '800 56px "DM Sans","Inter Tight",sans-serif';
      x.fillText('MASHKOVICH', W/2, 276);

      // Accent line
      x.shadowBlur = 0;
      x.strokeStyle = 'rgba(62,160,148,0.3)';
      x.lineWidth = 1;
      x.beginPath();
      x.moveTo(W/2 - 72, 236); x.lineTo(W/2 + 72, 236);
      x.stroke();

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 4;
      tex.needsUpdate = true;

      // Environment map for glossy reflections
      const EC = document.createElement('canvas');
      EC.width = 512; EC.height = 256;
      const EX = EC.getContext('2d');
      EX.fillStyle = '#06060a';
      EX.fillRect(0, 0, 512, 256);
      // Bright spot top-right
      var g = EX.createRadialGradient(380, 80, 0, 380, 80, 120);
      g.addColorStop(0, 'rgba(255,240,220,0.35)');
      g.addColorStop(0.4, 'rgba(255,240,220,0.08)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      EX.fillStyle = g; EX.fillRect(0, 0, 512, 256);
      // Bright spot mid-right
      var g2 = EX.createRadialGradient(440, 160, 0, 440, 160, 90);
      g2.addColorStop(0, 'rgba(255,245,230,0.25)');
      g2.addColorStop(0.5, 'rgba(255,245,230,0.05)');
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      EX.fillStyle = g2; EX.fillRect(0, 0, 512, 256);
      // Soft teal on left
      var g3 = EX.createRadialGradient(80, 140, 0, 80, 140, 100);
      g3.addColorStop(0, 'rgba(62,160,148,0.06)');
      g3.addColorStop(1, 'rgba(0,0,0,0)');
      EX.fillStyle = g3; EX.fillRect(0, 0, 512, 256);
      const envTex = new THREE.CanvasTexture(EC);
      envTex.mapping = THREE.EquirectangularReflectionMapping;

      // Scene, camera, renderer
      const S = new THREE.Scene();
      const C = new THREE.PerspectiveCamera(32, wrap.clientWidth / wrap.clientHeight, 0.1, 20);
      C.position.set(0, 0.3, 5.8);
      const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      R.setSize(wrap.clientWidth, wrap.clientHeight);
      R.toneMapping = THREE.ACESFilmicToneMapping;
      R.toneMappingExposure = 1.1;

      // Lights
      S.add(new THREE.AmbientLight(0x202040, 0.25));

      // Main spotlight from the right
      const key = new THREE.DirectionalLight(0xfff5e8, 3.5);
      key.position.set(6, 2, 1);
      S.add(key);

      // Secondary highlight from below-right
      const key2 = new THREE.DirectionalLight(0xffeedd, 2.0);
      key2.position.set(4, -1.5, 2.5);
      S.add(key2);

      // Sharp point light for extra glint
      const glint = new THREE.PointLight(0xffffff, 1.5, 4);
      glint.position.set(3, 0.5, 1);
      S.add(glint);

      // Fill from front-left (soft)
      const fill = new THREE.DirectionalLight(0x3ea094, 0.3);
      fill.position.set(-3, 0, 2);
      S.add(fill);

      // Rim from behind
      const rim = new THREE.DirectionalLight(0x7c5cff, 0.3);
      rim.position.set(0, -2, -4);
      S.add(rim);

      // Box materials: [right, left, top, bottom, front, back]
      const blackMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a, roughness: 0.01, metalness: 0.0,
        envMap: envTex, envMapIntensity: 2.0
      });
      const texMat = new THREE.MeshStandardMaterial({
        map: tex, roughness: 0.01, metalness: 0.0, side: THREE.DoubleSide,
        envMap: envTex, envMapIntensity: 1.8
      });
      const box = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.35, 1.4), [
        texMat, texMat, blackMat, blackMat, texMat, texMat
      ]);
      box.position.z = 0.6;
      S.add(box);

      // Edge outline (clean lines, no cross-hatch)
      const EG = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.88, 0.43, 1.48));
      const EL = new THREE.LineBasicMaterial({
        color: 0x3ea094, transparent: true, opacity: 0.35
      });
      const edge = new THREE.LineSegments(EG, EL);
      box.add(edge);

      // ── Load Ali & Nino statue ──
      if (typeof THREE.GLTFLoader !== 'undefined') {
        const loader = new THREE.GLTFLoader();
        loader.load('ali-and-nino/source/ali-and-nino.glb', function (gltf) {
          const model = gltf.scene;
          // Compute bounding box to position feet on top of box
          const box3 = new THREE.Box3().setFromObject(model);
          const size = box3.getSize(new THREE.Vector3());
          // Scale statue to ~0.6 units tall
          const statueHeight = 1.8;
          const scale = statueHeight / size.y;
          model.scale.setScalar(scale);
          // Recompute bounds after scale
          const sb = new THREE.Box3().setFromObject(model);
          const sf = sb.min.y;
          model.position.y = 0.175 - sf; // feet on top face
          // Mirror the glossy material
          model.traverse(function (child) {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x3ea094, roughness: 0.05, metalness: 0.7,
                envMap: envTex, envMapIntensity: 2.5
              });
            }
          });
          box.add(model);
        }, undefined, function (err) {
          console.warn('Statue load error:', err);
        });
      }

      // Animation
      // Mouse tilt on scene
      let mx = 0, my = 0, tx = 0, ty = 0;

      if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
        wrap.addEventListener('pointermove', e => {
          const r = wrap.getBoundingClientRect();
          mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
          my = ((e.clientY - r.top) / r.height - 0.5) * 2;
        });
        wrap.addEventListener('pointerleave', () => { mx = 0; my = 0; });
      }

      const clock = new THREE.Clock();
      const anim = () => {
        requestAnimationFrame(anim);
        const t = clock.getElapsedTime();

        // Mouse tilt (spring back)
        tx += (mx - tx) * 0.08;
        ty += (my - ty) * 0.08;

        // Float Y (smooth up/down)
        const fy = Math.sin(t * 0.5) * 0.2 - 0.55;

        box.position.y = fy;
        box.rotation.y = t * 0.5 + Math.sin(t * 0.12) * 0.08 + tx * 0.15;
        box.rotation.x = Math.sin(t * 0.22) * 0.08 + ty * 0.12;
        box.rotation.z = Math.cos(t * 0.15) * 0.04 + tx * ty * 0.04;

        key.position.y = 2 + Math.sin(t * 0.3) * 1.2;
        key2.position.y = -1.5 + Math.sin(t * 0.4 + 1) * 0.8;
        glint.position.x = 3 + Math.sin(t * 0.6) * 1.0;
        glint.position.z = 1 + Math.cos(t * 0.5) * 1.0;

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
