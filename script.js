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

  // ── WEBGL 3D SCENE ──
  const canvas = document.getElementById('webgl');

  if (canvas && typeof THREE !== 'undefined' && !reducedMotion) {
    const scene = new THREE.Scene();
    const wrap = canvas.parentElement;

    const camera = new THREE.PerspectiveCamera(
      40, wrap.clientWidth / wrap.clientHeight, 0.1, 100
    );
    camera.position.set(0, 0.5, 5.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(4, 5, 6);
    scene.add(key);

    const teal = new THREE.PointLight(0x3ea094, 2.4, 22);
    teal.position.set(-4, 2, 3);
    scene.add(teal);

    const violet = new THREE.PointLight(0x7c5cff, 1.6, 22);
    violet.position.set(4, -2, 2);
    scene.add(violet);

    // Particles (subtle background)
    const count = 160;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 2;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(p) * Math.cos(t);
      positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      positions[i * 3 + 2] = r * Math.cos(p);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dust = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x3ea094,
      size: 0.035,
      transparent: true,
      opacity: 0.4
    }));
    scene.add(dust);

    // ── TEXT BOX (front layer) ──
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 1024;
    textCanvas.height = 512;
    const ctx = textCanvas.getContext('2d');

    ctx.clearRect(0, 0, 1024, 512);

    ctx.fillStyle = 'rgba(10, 14, 23, 0.55)';
    ctx.roundRect(0, 0, 1024, 512, 24);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 96px "DM Sans", "Inter Tight", sans-serif';
    ctx.fillText('PAVEL', 512, 190);

    ctx.fillStyle = '#3ea094';
    ctx.font = '600 72px "DM Sans", "Inter Tight", sans-serif';
    ctx.fillText('//', 512, 290);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 96px "DM Sans", "Inter Tight", sans-serif';
    ctx.fillText('MASHKOVICH', 512, 390);

    const textTex = new THREE.CanvasTexture(textCanvas);
    textTex.needsUpdate = true;

    const boxMat = new THREE.MeshStandardMaterial({
      map: textTex,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      side: THREE.DoubleSide
    });

    const textBox = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.4, 1.6),
      boxMat
    );
    textBox.position.set(0, -3, 1.8);
    scene.add(textBox);

    const edgeMat = new THREE.MeshBasicMaterial({
      color: 0x3ea094,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const edgeBox = new THREE.Mesh(
      new THREE.BoxGeometry(2.9, 0.5, 1.7),
      edgeMat
    );
    edgeBox.position.copy(textBox.position);
    scene.add(edgeBox);

    // Pointer target
    let tx = 0, ty = 0, rxc = 0, ryc = 0;
    wrap.addEventListener('pointermove', e => {
      const r = wrap.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    wrap.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

    const clock = new THREE.Clock();
    let visible = true;

    const sceneObserver = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    }, { threshold: 0 });
    sceneObserver.observe(wrap);

    const animate = () => {
      requestAnimationFrame(animate);
      if (!visible) return;

      const t = clock.getElapsedTime();

      rxc += (ty * 0.4 - rxc) * 0.05;
      ryc += (tx * 0.5 - ryc) * 0.05;

      dust.rotation.y = t * 0.04;

      teal.position.x = Math.cos(t * 0.6) * 4.5;
      teal.position.z = Math.sin(t * 0.6) * 4.5;

      // Text box animation: float bottom → top + rotate
      const floatY = Math.sin(t * 0.5) * 1.6;
      textBox.position.y = floatY;
      textBox.rotation.y = t * 0.4;
      textBox.rotation.x = Math.sin(t * 0.2) * 0.08;
      textBox.rotation.z = Math.cos(t * 0.15) * 0.04;

      edgeBox.position.y = floatY;
      edgeBox.rotation.y = t * 0.4;
      edgeBox.rotation.x = Math.sin(t * 0.2) * 0.08;
      edgeBox.rotation.z = Math.cos(t * 0.15) * 0.04;

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', resize);
  }
});
