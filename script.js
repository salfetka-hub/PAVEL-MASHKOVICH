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

  // ── 3D TILT ON CARDS ──
  if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
      const shine = card.querySelector('.card-shine');

      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * 10;
        const ry = (px - 0.5) * 12;

        card.style.transform =
          `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;

        if (shine) {
          shine.style.opacity = '1';
          shine.style.background =
            `radial-gradient(420px circle at ${px * 100}% ${py * 100}%, rgba(62,160,148,0.18), transparent 60%)`;
        }
      });

      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
        if (shine) shine.style.opacity = '0';
      });
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
      45, wrap.clientWidth / wrap.clientHeight, 0.1, 100
    );
    camera.position.set(0, 0, 6);

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

    // Main knot
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.35, 0.42, 180, 32),
      new THREE.MeshStandardMaterial({
        color: 0x2f8f83,
        roughness: 0.22,
        metalness: 0.72
      })
    );
    scene.add(knot);

    // Wireframe shell
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.5, 1),
      new THREE.MeshBasicMaterial({
        color: 0x3ea094,
        wireframe: true,
        transparent: true,
        opacity: 0.14
      })
    );
    scene.add(shell);

    // Orbiting particles
    const count = 220;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 1.6;
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
      size: 0.045,
      transparent: true,
      opacity: 0.65
    }));
    scene.add(dust);

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

      knot.rotation.x = t * 0.24 + rxc;
      knot.rotation.y = t * 0.32 + ryc;
      knot.position.y = Math.sin(t * 0.9) * 0.12;

      shell.rotation.x = -t * 0.08 + rxc * 0.4;
      shell.rotation.y = t * 0.12 + ryc * 0.4;

      dust.rotation.y = t * 0.05;
      dust.rotation.x = t * 0.02;

      teal.position.x = Math.cos(t * 0.6) * 4.5;
      teal.position.z = Math.sin(t * 0.6) * 4.5;

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
