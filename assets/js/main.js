/* ============================================================
   PORTFOLIO — Lucas Delbecque
   Three.js full-page · objets thématiques colorés · dark/light toggle
   ============================================================ */

(function initScene() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const BG_DARK  = 0x0e0b1e;
  const BG_LIGHT = 0xfdf4e3;
  renderer.setClearColor(BG_DARK, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG_DARK, 0.016);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 22);

  /* ── Lumières ── */
  scene.add(new THREE.AmbientLight(0x2a1a4e, 4));

  const lights = [
    new THREE.PointLight(0xff7c3e, 200, 90),
    new THREE.PointLight(0xb845ff, 120, 90),
    new THREE.PointLight(0x00e5ff, 80,  70),
    new THREE.PointLight(0xffd700, 60,  60),
  ];
  lights[0].position.set(-18, 10, 12);
  lights[1].position.set( 20, -8, 10);
  lights[2].position.set(  0, 18,  6);
  lights[3].position.set(  5,-15,  8);
  lights.forEach(l => scene.add(l));

  /* ================================================================
     MATÉRIAUX helpers
  ================================================================ */
  const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({
    color, roughness: opts.r ?? 0.35, metalness: opts.m ?? 0.7,
    emissive: opts.emissive ?? color, emissiveIntensity: opts.ei ?? 0,
    transparent: opts.t ?? false, opacity: opts.o ?? 1,
  });
  const wireMat = (color, opacity = 0.75) =>
    new THREE.LineBasicMaterial({ color, transparent: true, opacity });

  /* ================================================================
     OBJETS THÉMATIQUES
  ================================================================ */

  /* ── Trou noir dramatique ── */
  function createBlackHole() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 32, 32),
      mat(0x000000, { r: 1, m: 0, ei: 0 })
    ));
    const diskOuter = new THREE.Mesh(
      new THREE.TorusGeometry(2.8, 0.5, 8, 80),
      mat(0xff4400, { r: 0.9, m: 0, emissive: 0xff3300, ei: 2.5, t: true, o: 0.9 })
    );
    diskOuter.rotation.x = Math.PI / 2.4;
    g.add(diskOuter);
    const diskInner = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.2, 8, 80),
      mat(0xffcc00, { r: 0.9, m: 0, emissive: 0xffcc00, ei: 3.5, t: true, o: 0.8 })
    );
    diskInner.rotation.x = Math.PI / 2.4;
    g.add(diskInner);
    const pt = new THREE.PointLight(0xff6600, 50, 14);
    g.add(pt);
    g.userData = { diskOuter, diskInner };
    return g;
  }

  /* ── CPU coloré ── */
  function createCPU() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(3, 0.22, 3), mat(0x1a1535, { r: 0.2, m: 0.9 })));
    g.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(3, 0.22, 3)),
      wireMat(0x00e5ff)
    ));
    // Die central
    const die = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.14, 1.4),
      mat(0x0a0520, { r: 0.05, m: 0.95, emissive: 0xb845ff, ei: 0.8 })
    );
    die.position.y = 0.17; g.add(die);
    // Glowing dots sur la surface
    [[0.55,0.45],[-.55,0.45],[0.55,-.45],[-.55,-.45],[0,0]].forEach(([x,z], i) => {
      const colors = [0xff7c3e, 0xb845ff, 0x00e5ff, 0xffd700, 0xff7c3e];
      const dot = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.05, 0.14),
        mat(colors[i], { r: 0.3, m: 0.5, emissive: colors[i], ei: 2 })
      );
      dot.position.set(x, 0.18, z); g.add(dot);
    });
    // Pins métalliques
    const pinMat = mat(0xbbccdd, { r: 0.1, m: 1 });
    for (let i = 0; i < 9; i++) {
      [-1.65, 1.65].forEach(side => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.07,0.36,0.07), pinMat);
        p.position.set(side, -0.29, -1.6 + i*0.4); g.add(p);
      });
      [-1.65, 1.65].forEach(side => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.07,0.36,0.07), pinMat);
        p.position.set(-1.6+i*0.4, -0.29, side); g.add(p);
      });
    }
    const glow = new THREE.PointLight(0x00e5ff, 30, 8);
    glow.position.y = -1; g.add(glow);
    return g;
  }

  /* ── Manette colorée style Fortnite ── */
  function createController() {
    const g = new THREE.Group();
    const bodyMat = mat(0x1a1040, { r: 0.4, m: 0.6 });
    g.add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.65, 1.5), bodyMat));
    [-1.15, 1.15].forEach(x => {
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.52, 1.5, 12), bodyMat);
      grip.position.set(x, -0.65, 0.05); g.add(grip);
    });
    // Boutons couleurs vives
    const btnData = [
      [0xff4455, [ 0.7, 0.34,  0.5]],
      [0x44aaff, [ 1.0, 0.34,  0.2]],
      [0xffd700, [ 0.7, 0.34, -0.1]],
      [0x44ff88, [ 1.0, 0.34, -0.4]],
    ];
    btnData.forEach(([c, [x,y,z]]) => {
      const btn = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 10, 10),
        mat(c, { r: 0.3, m: 0.3, emissive: c, ei: 1.2 })
      );
      btn.position.set(x, y, z); g.add(btn);
    });
    // Joysticks
    [[-0.6, 0.12], [0.3, -0.15]].forEach(([x, z]) => {
      const s = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.24, 12),
        mat(0x2a1a50, { r: 0.5, m: 0.3 })
      );
      s.position.set(x, 0.39, z); g.add(s);
    });
    // Indicateur central lumineux
    const ind = new THREE.Mesh(
      new THREE.CircleGeometry(0.18, 16),
      mat(0xff7c3e, { r: 0.3, m: 0, emissive: 0xff7c3e, ei: 3 })
    );
    ind.position.set(0, 0.34, 0);
    ind.rotation.x = -Math.PI / 2;
    g.add(ind);
    new THREE.PointLight(0xff7c3e, 15, 5).position.set(0, 0.5, 0);
    return g;
  }

  /* ── Laptop écran coloré ── */
  function createLaptop() {
    const g = new THREE.Group();
    const bodyMat = mat(0x1a1040, { r: 0.25, m: 0.85 });
    g.add(new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 1.9), bodyMat));
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.75, 1.85, 0.09), bodyMat);
    frame.position.set(0, 1.0, -0.9);
    frame.rotation.x = THREE.MathUtils.degToRad(-15);
    g.add(frame);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.45, 1.6),
      mat(0x120830, { r: 0.1, m: 0, emissive: 0xb845ff, ei: 1.5 })
    );
    screen.position.set(0, 1.0, -0.85);
    screen.rotation.x = THREE.MathUtils.degToRad(-15);
    g.add(screen);
    // Touches claviers colorées par rangée
    const rowColors = [0xff7c3e, 0xffd700, 0x00e5ff];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 9; col++) {
        const key = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 0.04, 0.2),
          mat(rowColors[row], { r: 0.5, m: 0.2, emissive: rowColors[row], ei: 0.3 })
        );
        key.position.set(-0.95 + col * 0.24, 0.07, 0.52 - row * 0.3); g.add(key);
      }
    }
    const glow = new THREE.PointLight(0xb845ff, 25, 10);
    glow.position.set(0, 1.2, -0.6); g.add(glow);
    return g;
  }

  /* ── Icosaèdre wireframe coloré ── */
  function createIcosa(radius, edgeColor, fillColor = 0x0a0520) {
    const geo = new THREE.IcosahedronGeometry(radius, 1);
    const g   = new THREE.Group();
    g.add(new THREE.Mesh(geo, mat(fillColor, { r: 0.5, m: 0.2, t: true, o: 0.25 })));
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), wireMat(edgeColor, 0.85)));
    return g;
  }

  /* ── Torus knot vibrant ── */
  function createTorusKnot(color, eiVal = 0.4) {
    const g   = new THREE.Group();
    const geo = new THREE.TorusKnotGeometry(0.95, 0.3, 90, 14, 2, 3);
    g.add(new THREE.Mesh(geo, mat(color, { r: 0.15, m: 0.8, emissive: color, ei: eiVal })));
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), wireMat(color, 0.2)));
    return g;
  }

  /* ── Cluster mathématique arc-en-ciel ── */
  function createMathCluster() {
    const g = new THREE.Group();
    const palette = [0xff7c3e, 0xb845ff, 0xffd700, 0x00e5ff, 0x44ff88, 0xff4455];
    for (let i = 0; i < 6; i++) {
      const c = palette[i];
      const mesh = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.28 + Math.random() * 0.3, 0),
        mat(c, { r: 0.25, m: 0.5, emissive: c, ei: 0.6 })
      );
      mesh.position.set((Math.random()-0.5)*2.8, (Math.random()-0.5)*2.2, (Math.random()-0.5)*1.8);
      g.add(mesh);
    }
    return g;
  }

  /* ── Petite sphère pulsante (déco) ── */
  function createOrb(color) {
    const g   = new THREE.Group();
    const geo = new THREE.SphereGeometry(0.55, 20, 20);
    g.add(new THREE.Mesh(geo, mat(color, { r: 0.1, m: 0.9, emissive: color, ei: 1.8 })));
    const pt  = new THREE.PointLight(color, 20, 6);
    g.add(pt);
    g.userData.light = pt;
    return g;
  }

  /* ================================================================
     PLACEMENT DES OBJETS
     Camera: y=0 → y=-52 pendant le scroll
  ================================================================ */
  const objects = [];

  function add(mesh, x, y, z, rotSpeed, floatAmp, floatSpd) {
    mesh.position.set(x, y, z);
    scene.add(mesh);
    objects.push({
      mesh, baseY: y,
      rot:   rotSpeed   || { x:.003, y:.006, z:0 },
      amp:   floatAmp   ?? 0.4,
      spd:   floatSpd   ?? 0.45,
      off:   Math.random() * Math.PI * 2,
    });
  }

  // ── Zone hero (y 0..−4) ──
  const bh = createBlackHole();
  bh.scale.setScalar(1.1);
  add(bh,  10,  1.5, -8,  {x:0, y:.004, z:0}, 0.3, 0.3);

  const ctrl1 = createController();
  ctrl1.scale.setScalar(0.9);
  add(ctrl1, -10, 2, -7, {x:.002, y:.007, z:.001}, 0.5, 0.38);

  add(createIcosa(1.2, 0xb845ff),   6, -2, -13, {x:.006, y:.004, z:.003}, 0.55, 0.6);
  add(createIcosa(0.85, 0x00e5ff), -7, -1, -15, {x:.005, y:.008, z:.002}, 0.4,  0.7);

  // ── Zone about (y −8..−16) ──
  const cpu = createCPU();
  cpu.scale.setScalar(0.88);
  add(cpu,  9, -11, -9, {x:.001, y:.005, z:.002}, 0.35, 0.35);

  add(createTorusKnot(0xff7c3e, 0.5), -8, -10, -11, {x:.005, y:.008, z:.003}, 0.5, 0.5);
  add(createMathCluster(),             5, -15,  -8,  {x:.004, y:.006, z:.001}, 0.6, 0.4);
  add(createOrb(0xffd700),           -4,  -8,  -6,  {x:.002, y:.01,  z:.001}, 0.3, 0.6);

  // ── Zone projects (y −18..−36) ──
  const laptop = createLaptop();
  laptop.scale.setScalar(0.88);
  add(laptop, -9, -22, -8, {x:0, y:.005, z:0}, 0.4, 0.38);

  add(createIcosa(1.55, 0xffd700, 0x100820),  9, -20, -14, {x:.003, y:.005, z:.004}, 0.5, 0.45);
  add(createTorusKnot(0xb845ff, 0.5),         -6, -28, -11, {x:.006, y:.004, z:.002}, 0.55, 0.5);
  add(createMathCluster(),                     8, -32, -12, {x:.003, y:.007, z:.002}, 0.6,  0.35);
  add(createOrb(0x00e5ff),                    -3, -25,  -6, {x:.002, y:.008, z:.001}, 0.25, 0.7);

  // ── Zone films/contact (y −38..−52) ──
  const ctrl2 = createController();
  ctrl2.scale.setScalar(0.78);
  add(ctrl2,  8, -40, -9,  {x:.003, y:.006, z:.001}, 0.45, 0.4);

  add(createIcosa(1.0, 0x44ff88, 0x0a1a14), -9, -44, -13, {x:.005, y:.007, z:.003}, 0.5, 0.5);
  add(createOrb(0xff7c3e),                   4, -48,  -7,  {x:.002, y:.009, z:.001}, 0.3, 0.55);

  /* ── Champ d'étoiles ── */
  const stPos = new Float32Array(1400 * 3);
  for (let i = 0; i < 1400; i++) {
    stPos[i*3]   = (Math.random()-.5)*180;
    stPos[i*3+1] = (Math.random()-.5)*160;
    stPos[i*3+2] = (Math.random()-.5)*70 - 25;
  }
  const stGeo = new THREE.BufferGeometry();
  stGeo.setAttribute('position', new THREE.BufferAttribute(stPos, 3));
  scene.add(new THREE.Points(stGeo,
    new THREE.PointsMaterial({ color: 0xeeddff, size: 0.11, transparent: true, opacity: 0.7, sizeAttenuation: true })
  ));

  /* ================================================================
     INPUT & THEME
  ================================================================ */
  let mouseX = 0, mouseY = 0;
  let currentScrollY = 0, targetScrollY = 0;
  let isLight = false;

  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  window.addEventListener('scroll', () => { targetScrollY = window.scrollY; });
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Expose pour le toggle
  window.__setTheme = (light) => {
    isLight = light;
    const bg = light ? BG_LIGHT : BG_DARK;
    renderer.setClearColor(bg, 1);
    scene.fog.color.setHex(bg);
    scene.fog.density = light ? 0.012 : 0.016;
    // Ambient light plus chaud en light mode
    scene.children
      .filter(c => c.isAmbientLight)
      .forEach(l => l.color.setHex(light ? 0xeeddcc : 0x2a1a4e));
  };

  /* ================================================================
     BOUCLE DE RENDU
  ================================================================ */
  const WORLD_H = 52;
  let t = 0;

  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    currentScrollY += (targetScrollY - currentScrollY) * 0.06;
    const maxScroll  = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const sf         = currentScrollY / maxScroll;

    // Caméra scroll + parallax souris
    camera.position.x += (mouseX * 1.8  - camera.position.x) * 0.04;
    camera.position.y += (-sf * WORLD_H + (-mouseY * 1.2) - camera.position.y) * 0.05;
    camera.lookAt(camera.position.x * 0.35, camera.position.y, 0);

    // Lumières oscillantes
    lights[0].position.x = -18 + Math.sin(t * 0.28) * 4;
    lights[1].position.x =  20 + Math.cos(t * 0.22) * 4;
    lights[2].intensity  = (isLight ? 40 : 80) + Math.sin(t * 1.1) * 20;

    // Objets
    objects.forEach(o => {
      o.mesh.rotation.x += o.rot.x;
      o.mesh.rotation.y += o.rot.y;
      o.mesh.rotation.z += o.rot.z;
      o.mesh.position.y = o.baseY + Math.sin(t * o.spd + o.off) * o.amp;
    });

    // Pulse trou noir
    const bhd = bh.userData;
    if (bhd.diskOuter) {
      bhd.diskOuter.material.emissiveIntensity = 2.0 + Math.sin(t * 1.5) * 0.8;
      bhd.diskInner.material.emissiveIntensity = 3.0 + Math.sin(t * 2.2) * 1.2;
    }

    renderer.render(scene, camera);
  }
  animate();
})();

/* ── DARK / LIGHT TOGGLE ── */
(function initThemeToggle() {
  const btn  = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  if (!btn) return;

  let light = false;

  btn.addEventListener('click', () => {
    light = !light;
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    icon.textContent = light ? '🌙' : '☀️';
    if (window.__setTheme) window.__setTheme(light);
  });
})();

/* ── SCROLL ANIMATIONS ── */
(function initScrollAnimations() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.project').forEach(el => obs.observe(el));
})();

/* ── NAV SCROLL STYLE ── */
(function initNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (document.documentElement.dataset.theme === 'light') return;
    nav.style.background = window.scrollY > 40
      ? 'rgba(14, 11, 30, 0.96)'
      : 'rgba(14, 11, 30, 0.72)';
  });
})();
