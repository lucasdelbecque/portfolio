/* The 3D cinema: room, seats, screen, remote, camera, input, YouTube-on-screen. */
(function () {
  'use strict';

  var D = window.PORTFOLIO, I = window.I18N, TV = window.TVScreen;
  var body = document.body;
  var glHost = document.getElementById('gl-layer');
  var cssHost = document.getElementById('css-layer');
  var MU = THREE.MathUtils;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    renderer = null;
  }
  if (!renderer || !renderer.getContext()) { body.classList.add('no-webgl'); return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  glHost.appendChild(renderer.domElement);
  var glCanvas = renderer.domElement;

  var cssRenderer = new THREE.CSS3DRenderer();
  cssHost.appendChild(cssRenderer.domElement);

  THREE.RectAreaLightUniformsLib.init();

  /* ---------- layout constants ---------- */
  var ROOM = { hw: 7.5, front: -12, back: 8.3, h: 9.6 };
  var SCR = { w: 11, h: 6.1875, cx: 0, cy: 4.4, z: -11.86 };
  var ROWS = 10, ROW0 = -4.4, ROW_STEP = 1.15, RISE = 0.4, SEAT_P = 0.6, VIEW_ROW = 5;
  function rowZ(i) { return ROW0 + i * ROW_STEP; }
  function rowY(i) { return i * RISE; }
  function floorAt(z) {
    if (z < ROW0 - ROW_STEP / 2) return 0;
    return rowY(MU.clamp(Math.round((z - ROW0) / ROW_STEP), 0, ROWS - 1));
  }
  var EYE = new THREE.Vector3(0, rowY(VIEW_ROW) + 1.17, rowZ(VIEW_ROW) + 0.05);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060205, 0.016);
  var camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.05, 90);
  camera.rotation.order = 'YXZ';
  camera.position.copy(EYE);
  scene.add(camera);
  var cssScene = new THREE.Scene();

  var maxAniso = renderer.capabilities.getMaxAnisotropy();

  /* ---------- helpers ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var rnd = mulberry32(20260);

  function canvasTex(w, h, draw, repeat) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = maxAniso;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }
  function repeated(tex, rx, ry) {
    var t = tex.clone();
    t.needsUpdate = true;
    t.repeat.set(rx, ry);
    return t;
  }
  function addColors(geo, r, g, b) {
    var n = geo.attributes.position.count, arr = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) { arr[i * 3] = r; arr[i * 3 + 1] = g; arr[i * 3 + 2] = b; }
    geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    return geo;
  }

  /* ---------- textures ---------- */
  var carpetTex = canvasTex(256, 256, function (g, w, h) {
    g.fillStyle = '#220b10';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#3a141c';
    g.lineWidth = 2;
    for (var y = 0; y < h; y += 64) for (var x = 0; x < w; x += 64) {
      g.beginPath();
      g.moveTo(x + 32, y); g.lineTo(x + 64, y + 32); g.lineTo(x + 32, y + 64); g.lineTo(x, y + 32);
      g.closePath(); g.stroke();
      g.fillStyle = '#5a2430';
      g.fillRect(x + 30, y + 30, 4, 4);
    }
    for (var i = 0; i < 4000; i++) {
      g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '255,255,255' : '0,0,0') + ',0.05)';
      g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5);
    }
  }, true);

  var wallTex = canvasTex(512, 512, function (g, w, h) {
    g.fillStyle = '#101013';
    g.fillRect(0, 0, w, h);
    for (var x = 0; x < w; x += 64) {
      var gr = g.createLinearGradient(x, 0, x + 64, 0);
      gr.addColorStop(0, '#0a0a0c');
      gr.addColorStop(0.5, '#1c1c21');
      gr.addColorStop(1, '#0a0a0c');
      g.fillStyle = gr;
      g.fillRect(x, 0, 64, h);
    }
    g.fillStyle = 'rgba(0,0,0,0.5)';
    for (var y = 0; y < h; y += 256) g.fillRect(0, y, w, 3);
    for (var i = 0; i < 3000; i++) {
      g.fillStyle = 'rgba(255,255,255,0.025)';
      g.fillRect(rnd() * w, rnd() * h, 2, 2);
    }
  }, true);

  var softTex = canvasTex(64, 64, function (g, w, h) {
    var gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });

  /* ---------- room shell ---------- */
  var room = new THREE.Group();
  scene.add(room);

  var wallLen = ROOM.back - ROOM.front, wallMidZ = (ROOM.front + ROOM.back) / 2;
  var matSideWall = new THREE.MeshStandardMaterial({ map: repeated(wallTex, wallLen / 3, ROOM.h / 3), roughness: 0.95, metalness: 0 });
  var matEndWall = new THREE.MeshStandardMaterial({ map: repeated(wallTex, ROOM.hw * 2 / 3, ROOM.h / 3), roughness: 0.95, metalness: 0 });
  var matCeil = new THREE.MeshStandardMaterial({ color: 0x08070a, roughness: 1 });

  var wallL = new THREE.Mesh(new THREE.PlaneGeometry(wallLen, ROOM.h), matSideWall);
  wallL.rotation.y = Math.PI / 2;
  wallL.position.set(-ROOM.hw, ROOM.h / 2, wallMidZ);
  var wallR = new THREE.Mesh(new THREE.PlaneGeometry(wallLen, ROOM.h), matSideWall);
  wallR.rotation.y = -Math.PI / 2;
  wallR.position.set(ROOM.hw, ROOM.h / 2, wallMidZ);
  var wallF = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.hw * 2, ROOM.h), matEndWall);
  wallF.position.set(0, ROOM.h / 2, ROOM.front);
  var wallB = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.hw * 2, ROOM.h), matEndWall);
  wallB.rotation.y = Math.PI;
  wallB.position.set(0, ROOM.h / 2, ROOM.back);
  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.hw * 2, wallLen), matCeil);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, ROOM.h, wallMidZ);
  room.add(wallL, wallR, wallF, wallB, ceil);

  /* ---------- stepped floor ---------- */
  var matCarpet = new THREE.MeshStandardMaterial({ map: carpetTex, roughness: 1, metalness: 0 });
  var matRiser = new THREE.MeshStandardMaterial({ color: 0x120608, roughness: 1 });

  (function buildFloor() {
    var z0 = ROOM.front, z1 = rowZ(0) + ROW_STEP / 2;
    var geo = new THREE.PlaneGeometry(ROOM.hw * 2, z1 - z0);
    var uv = geo.attributes.uv;
    for (var k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * ROOM.hw, uv.getY(k) * (z1 - z0) / 2);
    var m = new THREE.Mesh(geo, matCarpet);
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, 0, (z0 + z1) / 2);
    room.add(m);

    for (var i = 1; i < ROWS; i++) {
      var zs = rowZ(i) - ROW_STEP / 2, ze = i === ROWS - 1 ? ROOM.back : rowZ(i) + ROW_STEP / 2;
      var h = rowY(i), d = ze - zs, w = ROOM.hw * 2;
      var bg = new THREE.BoxGeometry(w, h, d);
      var buv = bg.attributes.uv;
      for (var j = 8; j < 12; j++) buv.setXY(j, buv.getX(j) * w / 2, buv.getY(j) * d / 2);
      var step = new THREE.Mesh(bg, [matRiser, matRiser, matCarpet, matRiser, matRiser, matRiser]);
      step.position.set(0, h / 2, (zs + ze) / 2);
      room.add(step);
    }
  })();

  /* aisle + wall step lights */
  var stepLightMat = new THREE.MeshBasicMaterial({ color: 0xff7a2a });
  (function buildStepLights() {
    var xs = [-3.15, 3.15, -ROOM.hw + 0.25, ROOM.hw - 0.25];
    var geo = new THREE.BoxGeometry(0.14, 0.025, 0.14);
    var im = new THREE.InstancedMesh(geo, stepLightMat, xs.length * ROWS);
    var o = new THREE.Object3D(), n = 0;
    for (var i = 0; i < ROWS; i++) xs.forEach(function (x) {
      o.position.set(x, rowY(i) + 0.014, rowZ(i) - 0.35);
      o.updateMatrix();
      im.setMatrixAt(n++, o.matrix);
    });
    im.frustumCulled = false;
    room.add(im);
  })();

  /* ---------- seats ---------- */
  var seatXs = [];
  (function () {
    var k;
    for (k = -4; k <= 4; k++) seatXs.push(k * SEAT_P);
    for (k = 0; k < 4; k++) { seatXs.push(3.9 + k * SEAT_P); seatXs.push(-3.9 - k * SEAT_P); }
  })();

  var seatMesh;
  (function buildSeats() {
    var RED = [0.30, 0.012, 0.025], DARK = [0.012, 0.012, 0.015], parts = [];
    function part(w, h, d, x, y, z, col, rx) {
      var g = new THREE.BoxGeometry(w, h, d);
      if (rx) g.rotateX(rx);
      g.translate(x, y, z);
      parts.push(addColors(g, col[0], col[1], col[2]));
    }
    part(0.5, 0.13, 0.52, 0, 0.46, 0, RED);
    part(0.5, 0.7, 0.12, 0, 0.86, 0.27, RED, 0.14);
    part(0.07, 0.07, 0.46, 0.255, 0.64, -0.02, DARK);
    part(0.07, 0.07, 0.46, -0.255, 0.64, -0.02, DARK);
    part(0.05, 0.3, 0.08, 0.255, 0.47, 0.2, DARK);
    part(0.05, 0.3, 0.08, -0.255, 0.47, 0.2, DARK);
    part(0.12, 0.38, 0.12, 0, 0.19, 0.12, DARK);
    part(0.3, 0.04, 0.34, 0, 0.02, 0.1, DARK);
    var geo = THREE.BufferGeometryUtils.mergeBufferGeometries(parts);
    var mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 });
    seatMesh = new THREE.InstancedMesh(geo, mat, ROWS * seatXs.length);
    var o = new THREE.Object3D(), n = 0;
    for (var r = 0; r < ROWS; r++) seatXs.forEach(function (x) {
      o.position.set(x, rowY(r), rowZ(r));
      o.updateMatrix();
      seatMesh.setMatrixAt(n++, o.matrix);
    });
    seatMesh.frustumCulled = false;
    room.add(seatMesh);
  })();

  /* silhouettes of other spectators */
  (function buildSpectators() {
    var spots = [];
    for (var r = 0; r < ROWS; r++) {
      if (r === 4 || r === 5) continue;
      seatXs.forEach(function (x) {
        var centerBlock = Math.abs(x) < 2.6, chance = r > 5 ? 0.22 : (centerBlock ? (r < 2 ? 0.14 : 0) : 0.3);
        if (rnd() < chance) spots.push({ x: x, r: r });
      });
    }
    var mat = new THREE.MeshStandardMaterial({ color: 0x0a0809, roughness: 1 });
    var heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 12, 10), mat, spots.length);
    var bodies = new THREE.InstancedMesh(new THREE.BoxGeometry(0.4, 0.5, 0.22), mat, spots.length);
    var o = new THREE.Object3D();
    spots.forEach(function (s, i) {
      var z = rowZ(s.r) + 0.12, y = rowY(s.r), tilt = (rnd() - 0.5) * 0.4;
      o.rotation.set(0, tilt, 0);
      o.position.set(s.x + (rnd() - 0.5) * 0.08, y + 1.2 + rnd() * 0.06, z);
      o.updateMatrix();
      heads.setMatrixAt(i, o.matrix);
      o.position.set(s.x, y + 0.88, z + 0.04);
      o.updateMatrix();
      bodies.setMatrixAt(i, o.matrix);
    });
    heads.frustumCulled = bodies.frustumCulled = false;
    room.add(heads, bodies);
  })();

  /* viewer's own legs (visible when looking down) */
  (function buildLegs() {
    var jeans = new THREE.MeshStandardMaterial({ color: 0x1b2a45, roughness: 0.9 });
    var shoe = new THREE.MeshStandardMaterial({ color: 0xdcdcdc, roughness: 0.6 });
    var y = rowY(VIEW_ROW), z = rowZ(VIEW_ROW);
    [-0.14, 0.14].forEach(function (x) {
      var thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.078, 0.52, 12), jeans);
      thigh.rotation.x = Math.PI / 2;
      thigh.position.set(x, y + 0.6, z - 0.08);
      var shin = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.06, 0.52, 12), jeans);
      shin.position.set(x, y + 0.34, z - 0.34);
      var foot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.27), shoe);
      foot.position.set(x, y + 0.045, z - 0.42);
      room.add(thigh, shin, foot);
    });
  })();

  /* popcorn bucket on the left armrest */
  (function buildPopcorn() {
    var stripes = canvasTex(128, 64, function (g, w, h) {
      for (var i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f5f0e6' : '#c8102e'; g.fillRect(i * 16, 0, 16, h); }
    }, true);
    var bucket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.07, 0.22, 20, 1, true),
      new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.7, side: THREE.DoubleSide })
    );
    var g = new THREE.Group();
    bucket.position.y = 0.11;
    g.add(bucket);
    var kernelGeo = new THREE.IcosahedronGeometry(0.022, 0);
    var kernelMat = new THREE.MeshStandardMaterial({ color: 0xf3d98b, roughness: 0.9, flatShading: true });
    var kernels = new THREE.InstancedMesh(kernelGeo, kernelMat, 36), o = new THREE.Object3D();
    for (var i = 0; i < 36; i++) {
      var a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 0.075;
      o.position.set(Math.cos(a) * rr, 0.21 + rnd() * 0.05, Math.sin(a) * rr);
      o.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
      o.scale.setScalar(0.8 + rnd() * 0.6);
      o.updateMatrix();
      kernels.setMatrixAt(i, o.matrix);
    }
    g.add(kernels);
    g.position.set(-0.255, rowY(VIEW_ROW) + 0.675, rowZ(VIEW_ROW) - 0.1);
    room.add(g);
  })();

  /* ---------- screen, frame, curtains ---------- */
  var frameMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.6, metalness: 0.3 });
  (function buildFrame() {
    var back = new THREE.Mesh(new THREE.BoxGeometry(SCR.w + 1.2, SCR.h + 1.2, 0.2), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    back.position.set(SCR.cx, SCR.cy, SCR.z - 0.12);
    room.add(back);
    var t = 0.2, depth = 0.12;
    [
      [SCR.w + 2 * t, t, 0, SCR.h / 2 + t / 2],
      [SCR.w + 2 * t, t, 0, -SCR.h / 2 - t / 2],
      [t, SCR.h, -SCR.w / 2 - t / 2, 0],
      [t, SCR.h, SCR.w / 2 + t / 2, 0]
    ].forEach(function (b) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(b[0], b[1], depth), frameMat);
      m.position.set(SCR.cx + b[2], SCR.cy + b[3], SCR.z + depth / 2 - 0.02);
      room.add(m);
    });
  })();

  var curtainMat = new THREE.MeshStandardMaterial({ color: 0x6e0b17, roughness: 0.92, side: THREE.DoubleSide });
  function curtain(w, h, folds, amp, x, y, z) {
    var geo = new THREE.PlaneGeometry(w, h, Math.round(folds * 6), 1), p = geo.attributes.position;
    for (var i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) / w * folds * Math.PI * 2) * amp);
    geo.computeVertexNormals();
    var m = new THREE.Mesh(geo, curtainMat);
    m.position.set(x, y, z);
    room.add(m);
  }
  curtain(1.7, 8.8, 5, 0.13, -ROOM.hw + 0.9, 4.4, ROOM.front + 0.25);
  curtain(1.7, 8.8, 5, 0.13, ROOM.hw - 0.9, 4.4, ROOM.front + 0.25);
  curtain(ROOM.hw * 2 - 0.1, 1.6, 22, 0.1, 0, 8.7, ROOM.front + 0.3);

  /* the screen itself: hole (shows the CSS3D iframe) + canvas overlay (menu / controls / cursor) */
  var screenTex = new THREE.CanvasTexture(TV.canvas);
  screenTex.encoding = THREE.sRGBEncoding;
  screenTex.anisotropy = maxAniso;
  screenTex.generateMipmaps = true;
  screenTex.minFilter = THREE.LinearMipmapLinearFilter;

  var holeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(SCR.w, SCR.h),
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, transparent: true, blending: THREE.NoBlending, fog: false, toneMapped: false })
  );
  holeMesh.position.set(SCR.cx, SCR.cy, SCR.z);
  holeMesh.renderOrder = 4;
  holeMesh.visible = false;
  scene.add(holeMesh);

  var screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(SCR.w, SCR.h),
    new THREE.MeshBasicMaterial({ map: screenTex, transparent: true, depthWrite: false, fog: false, toneMapped: false })
  );
  screenMesh.position.set(SCR.cx, SCR.cy, SCR.z + 0.012);
  screenMesh.renderOrder = 5;
  scene.add(screenMesh);

  /* CSS3D layer carrying the YouTube iframe, exactly under the hole */
  var vidWrap = document.createElement('div');
  vidWrap.style.cssText = 'width:1280px;height:720px;background:#000;visibility:hidden;';
  var ytFrame = document.createElement('iframe');
  ytFrame.style.cssText = 'width:100%;height:100%;border:0;display:block;';
  ytFrame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    ytFrame.setAttribute('title', 'Video');
  vidWrap.appendChild(ytFrame);
  var cssObj = new THREE.CSS3DObject(vidWrap);
  cssObj.position.set(SCR.cx, SCR.cy, SCR.z);
  cssObj.scale.setScalar(SCR.w / 1280);
  cssObj.visible = false;
  cssScene.add(cssObj);

  /* ---------- posters, doors, exit signs ---------- */
  function coverDraw(g, im, x, y, w, h, isYT) {
    var sx = 0, sy = 0, sw = im.naturalWidth, sh = im.naturalHeight;
    if (isYT) { sy = Math.round(sh * 0.125); sh = Math.round(sh * 0.75); }
    var ar = w / h;
    if (sw / sh > ar) { var nw = sh * ar; sx += (sw - nw) / 2; sw = nw; }
    else { var nh = sw / ar; sy += (sh - nh) / 2; sh = nh; }
    g.drawImage(im, sx, sy, sw, sh, x, y, w, h);
  }

  function makePoster(item) {
    var c = document.createElement('canvas');
    c.width = 480; c.height = 720;
    var g = c.getContext('2d');
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = maxAniso;
    var img = null;
    var title = (typeof item.title === 'object' ? item.title.en : item.title).split(' — ')[0].toUpperCase();
    function draw() {
      var gr = g.createLinearGradient(0, 0, 0, 720);
      gr.addColorStop(0, item.colors[0]);
      gr.addColorStop(1, item.colors[1]);
      g.fillStyle = gr;
      g.fillRect(0, 0, 480, 720);
      if (img) coverDraw(g, img, 0, 0, 480, 520, !!item.yt && !item.img);
      var fade = g.createLinearGradient(0, 300, 0, 720);
      fade.addColorStop(0, 'rgba(0,0,0,0)');
      fade.addColorStop(0.55, 'rgba(0,0,0,0.78)');
      fade.addColorStop(1, 'rgba(0,0,0,0.95)');
      g.fillStyle = fade;
      g.fillRect(0, 300, 480, 420);
      var size = 104, words = title.split(' '), lines;
      for (;;) {
        g.font = "400 " + size + "px 'Bebas Neue', Impact, 'Arial Narrow', sans-serif";
        lines = []; var line = '';
        words.forEach(function (w) {
          var test = line ? line + ' ' + w : w;
          if (g.measureText(test).width > 420 && line) { lines.push(line); line = w; } else line = test;
        });
        lines.push(line);
        if ((lines.length <= 2 && g.measureText(lines.join('')).width > 0 && lines.every(function (l) { return g.measureText(l).width <= 430; })) || size <= 52) break;
        size -= 6;
      }
      g.fillStyle = '#fff';
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      var y0 = 640 - (lines.length - 1) * size * 0.92;
      lines.forEach(function (l, i) { g.fillText(l, 240, y0 + i * size * 0.92); });
      g.fillStyle = '#e9c46a';
      g.font = "700 15px 'Inter', Arial, sans-serif";
      g.fillText('A  L U C A S   D E L B E C Q U E   P R O D U C T I O N', 240, 690);
      g.strokeStyle = 'rgba(233,196,106,0.7)';
      g.lineWidth = 4;
      g.strokeRect(14, 14, 452, 692);
      tex.needsUpdate = true;
    }
    draw();
    var src = item.img ? item.img : 'https://i.ytimg.com/vi/' + item.yt + '/hqdefault.jpg';
    var im = new Image();
    if (/^https?:/.test(src)) im.crossOrigin = 'anonymous';
    im.onload = function () { img = im; draw(); };
    im.src = src;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    return tex;
  }

  (function buildPosters() {
    var items = D.projects.concat(D.films).filter(function (it) { return !it.noPoster; }), zs = [-9.0, -5.9, -2.8, 0.3, 3.4];
    var frame = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5, metalness: 0.4 });
    var lamp = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
    items.forEach(function (item, i) {
      var side = i < 5 ? -1 : 1, z = zs[i % 5], y = floorAt(z) + 2.35;
      var g = new THREE.Group();
      var f = new THREE.Mesh(new THREE.BoxGeometry(1.52, 2.24, 0.07), frame);
      var p = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.1), new THREE.MeshBasicMaterial({ map: makePoster(item), color: 0xb5b5b5 }));
      p.position.z = 0.04;
      var l = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.025, 0.06), lamp);
      l.position.set(0, 1.2, 0.09);
      g.add(f, p, l);
      g.position.set(side * (ROOM.hw - 0.04), y, z);
      g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      room.add(g);
    });
  })();

  (function buildDoors() {
    var signTex = canvasTex(256, 96, function (g, w, h) {
      g.fillStyle = '#08301a'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#7dffb0'; g.font = "700 54px Arial, sans-serif"; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('EXIT', w / 2, h / 2 + 3);
    });
    var doorMat = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.7, metalness: 0.2 });
    [[-1, -11.0], [1, 7.2]].forEach(function (d) {
      var g = new THREE.Group();
      var door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.3, 0.08), doorMat);
      door.position.y = 1.15;
      var sign = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.24), new THREE.MeshBasicMaterial({ map: signTex, fog: false }));
      sign.position.set(0, 2.62, 0.06);
      g.add(door, sign);
      g.position.set(d[0] * (ROOM.hw - 0.04), floorAt(d[1]), d[1]);
      g.rotation.y = d[0] < 0 ? Math.PI / 2 : -Math.PI / 2;
      room.add(g);
    });
  })();

  /* ---------- projector booth, beam, dust ---------- */
  var BOOTH = new THREE.Vector3(0, 7.45, ROOM.back - 0.15);
  (function buildBooth() {
    var housing = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 0.3), new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.6 }));
    housing.position.set(0, BOOTH.y, ROOM.back - 0.15);
    var glass = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.34), new THREE.MeshBasicMaterial({ color: 0xcfe0ff, fog: false }));
    glass.rotation.y = Math.PI;
    glass.position.set(0, BOOTH.y, ROOM.back - 0.31);
    room.add(housing, glass);
  })();

  var beamMat = new THREE.MeshBasicMaterial({
    vertexColors: true, transparent: true, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide, fog: false, opacity: 0.8
  });
  (function buildBeam() {
    var hw = SCR.w / 2, hh = SCR.h / 2, z = SCR.z + 0.1;
    var B = [[-hw, SCR.cy - hh], [hw, SCR.cy - hh], [hw, SCR.cy + hh], [-hw, SCR.cy + hh]];
    var pos = [], col = [];
    for (var i = 0; i < 4; i++) {
      var a = B[i], b = B[(i + 1) % 4];
      pos.push(BOOTH.x, BOOTH.y, BOOTH.z - 0.2, a[0], a[1], z, b[0], b[1], z);
      col.push(0.011, 0.012, 0.016, 0.001, 0.001, 0.0015, 0.001, 0.001, 0.0015);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    var m = new THREE.Mesh(geo, beamMat);
    m.frustumCulled = false;
    m.renderOrder = 3;
    scene.add(m);
  })();

  var dust = (function buildDust() {
    var N = 260, base = new Float32Array(N * 3), ph = new Float32Array(N), pos = new Float32Array(N * 3);
    var hw = SCR.w / 2, hh = SCR.h / 2;
    for (var i = 0; i < N; i++) {
      var t = 0.08 + rnd() * 0.88;
      base[i * 3] = BOOTH.x + (rnd() * 2 - 1) * hw * t;
      base[i * 3 + 1] = BOOTH.y + (SCR.cy - BOOTH.y) * t + (rnd() * 2 - 1) * hh * t;
      base[i * 3 + 2] = (BOOTH.z - 0.2) + (SCR.z - (BOOTH.z - 0.2)) * t;
      ph[i] = rnd() * 100;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({
      size: 0.06, map: softTex, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending,
      depthWrite: false, sizeAttenuation: true, color: 0xdfe8ff, fog: false
    });
    var pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    scene.add(pts);
    return { N: N, base: base, ph: ph, pos: pos, geo: geo, mat: mat };
  })();

  /* ---------- lights ---------- */
  var hemi = new THREE.HemisphereLight(0x7a4f5a, 0x140709, 0.8);
  scene.add(hemi);

  var rectLight = new THREE.RectAreaLight(0xdfe6ff, 3, SCR.w, SCR.h);
  rectLight.position.set(SCR.cx, SCR.cy, SCR.z + 0.35);
  rectLight.lookAt(0, 3.2, 6);
  scene.add(rectLight);

  var sconces = [];
  (function buildSconces() {
    var mat = new THREE.MeshBasicMaterial({ color: 0xff7a1c });
    var zs = [-7.45, -4.35, -1.25, 1.85, 4.95];
    [-1, 1].forEach(function (side) {
      zs.forEach(function (z, idx) {
        var y = floorAt(z) + 2.5;
        var m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.16), mat);
        m.position.set(side * (ROOM.hw - 0.06), y, z);
        room.add(m);
        if (idx % 2 === 0) {
          var pl = new THREE.PointLight(0xff9a45, 1, 10, 2);
          pl.position.set(side * (ROOM.hw - 0.6), y, z);
          scene.add(pl);
          sconces.push(pl);
        }
      });
    });
  })();

  var downMat = new THREE.MeshBasicMaterial({ color: 0xffe2b8 });
  (function buildDownlights() {
    var xs = [-5.2, -2.6, 0, 2.6, 5.2], zs = [-9, -4, 1, 6];
    var im = new THREE.InstancedMesh(new THREE.CircleGeometry(0.14, 16), downMat, xs.length * zs.length), o = new THREE.Object3D(), n = 0;
    xs.forEach(function (x) { zs.forEach(function (z) {
      o.position.set(x, ROOM.h - 0.01, z);
      o.rotation.x = Math.PI / 2;
      o.updateMatrix();
      im.setMatrixAt(n++, o.matrix);
    }); });
    im.frustumCulled = false;
    room.add(im);
  })();

  /* ---------- the remote ---------- */
  var remote = { group: new THREE.Group(), t: 0, restPos: new THREE.Vector3(), restQuat: new THREE.Quaternion(), ledMat: null, glow: null, hit: null };
  (function buildRemote() {
    var g = remote.group;
    var bodyMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.4, metalness: 0.35, emissive: 0x0a0a0c });
    var keyMat = new THREE.MeshStandardMaterial({ color: 0x2c2c32, roughness: 0.6, emissive: 0x111114 });
    var bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.02, 0.19), bodyMat);
    g.add(bodyMesh);
    var power = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 14), new THREE.MeshStandardMaterial({ color: 0xd7263d, emissive: 0x7a0f1d, roughness: 0.5 }));
    power.position.set(0.016, 0.012, -0.07);
    g.add(power);
    var ring = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.004, 24), keyMat);
    ring.position.set(0, 0.012, -0.035);
    g.add(ring);
    var ok = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.006, 16), new THREE.MeshStandardMaterial({ color: 0x4a4a54, roughness: 0.5, emissive: 0x18181c }));
    ok.position.set(0, 0.013, -0.035);
    g.add(ok);
    for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) {
      var k = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.004, 0.009), keyMat);
      k.position.set((c - 1) * 0.0145, 0.012, 0.005 + r * 0.0165);
      g.add(k);
    }
    remote.ledMat = new THREE.MeshBasicMaterial({ color: 0xff2a44 });
    var led = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 10, 8), remote.ledMat);
    led.position.set(0, 0.006, -0.0955);
    g.add(led);

    var rx = EYE.x + 0.255, ry = rowY(VIEW_ROW) + 0.675 + 0.012, rz = rowZ(VIEW_ROW) - 0.09;
    remote.restPos.set(rx, ry, rz);
    remote.restQuat.setFromEuler(new THREE.Euler(0, 0.12, 0));
    g.position.copy(remote.restPos);
    g.quaternion.copy(remote.restQuat);
    scene.add(g);

    var gt = canvasTex(64, 64, function (c, w, h) {
      var gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gr.addColorStop(0, 'rgba(255,60,80,1)');
      gr.addColorStop(0.3, 'rgba(255,40,70,0.45)');
      gr.addColorStop(1, 'rgba(255,40,70,0)');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
    });
    remote.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    remote.glow.scale.set(0.34, 0.34, 1);
    scene.add(remote.glow);
    remote.hit = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.32), new THREE.MeshBasicMaterial({ visible: false }));
    g.add(remote.hit);
  })();

  /* ---------- state ---------- */
  var state = { entered: false, remote: false, view: 'attract' };
  var yt = { id: null, title: '', playing: false };
  var look = { yaw: 0, pitch: -0.1 };
  var BASE_FOV = 56, camFov = BASE_FOV, FOV_FREE = BASE_FOV;
  var input = { lx: 0, ly: 0, px: window.innerWidth / 2, py: window.innerHeight / 2, hasMouse: false, hoverRemote: false };
  var house = 1;
  var clock = new THREE.Clock();
  var YAW_RANGE = 2.6, PITCH_UP = 0.75, PITCH_DOWN = 0.95, BASE_PITCH = 0.1;

  var introEl = document.getElementById('intro');
  var enterBtn = document.getElementById('enter-btn');
  var btnRemote = document.getElementById('btn-remote');
  var btnPlay = document.getElementById('btn-playpause');
  var langBtn = document.getElementById('lang-toggle');

  function updateHud() {
    body.dataset.remote = state.remote ? 'true' : 'false';
    body.dataset.video = yt.id ? 'true' : 'false';
    body.dataset.view = state.view;
    body.dataset.playing = yt.playing ? 'true' : 'false';
  }
  function pushNow() { TV.setNow(yt.id ? { title: yt.title, playing: yt.playing } : null); }

  function setView(v) {
    state.view = v;
    TV.setMode(v);
    var showVideo = v === 'video';
    holeMesh.visible = showVideo;
    cssObj.visible = showVideo;
    vidWrap.style.visibility = showVideo ? 'visible' : 'hidden';
    pushNow();
    updateHud();
  }

  /* ---------- YouTube ---------- */
  function ytSend(func) {
    try { ytFrame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: [] }), '*'); } catch (e) { /* frame not ready */ }
  }
  function ytUrl(id) {
    var q = 'autoplay=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&rel=0&modestbranding=1&playsinline=1&enablejsapi=1';
    if (/^https?:/.test(location.protocol)) q += '&origin=' + encodeURIComponent(location.origin);
    return 'https://www.youtube.com/embed/' + id + '?' + q;
  }
  ytFrame.addEventListener('load', function () {
    if (!yt.id) return;
    try { ytFrame.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch (e) { /* ignore */ }
  });
  window.addEventListener('message', function (e) {
    if (e.source !== ytFrame.contentWindow) return;
    var d = e.data;
    if (typeof d === 'string') { try { d = JSON.parse(d); } catch (err) { return; } }
    if (!d) return;
    var s = null;
    if (d.event === 'onStateChange') s = d.info;
    else if (d.event === 'infoDelivery' && d.info && typeof d.info.playerState === 'number') s = d.info.playerState;
    if (s === null) return;
    var playing = s === 1 || s === 3;
    if (playing !== yt.playing) { yt.playing = playing; pushNow(); updateHud(); }
  });

  function playVideo(id, title) {
    if (yt.id !== id) {
      yt.id = id;
      yt.title = title;
      ytFrame.src = ytUrl(id);
    } else {
      ytSend('playVideo');
    }
    yt.playing = true;
    setView('video');
  }
  function resumeVideo() {
    if (!yt.id) return;
    ytSend('playVideo');
    yt.playing = true;
    setView('video');
  }
  function pauseVideo() {
    ytSend('pauseVideo');
    yt.playing = false;
    pushNow();
    updateHud();
  }
  function stopVideo() {
    ytSend('pauseVideo');
    ytFrame.src = 'about:blank';
    yt.id = null;
    yt.playing = false;
    setView(state.remote ? 'menu' : 'attract');
  }
  function togglePlay() {
    if (!yt.id) return;
    if (state.view === 'menu') { resumeVideo(); return; }
    if (yt.playing) pauseVideo(); else resumeVideo();
  }
  function openMenu() {
    if (!state.remote) return;
    if (yt.id) pauseVideo();
    setView('menu');
  }

  function openLink(url) {
    if (/^mailto:/.test(url)) window.location.href = url;
    else window.open(url, '_blank', 'noopener');
  }

  TV.init(function (a) {
    if (a.type === 'play') { playVideo(a.ytId, a.title); dropRemote(); }
    else if (a.type === 'link') openLink(a.url);
    else if (a.type === 'resume') { resumeVideo(); dropRemote(); }
    else if (a.type === 'stop') stopVideo();
    else if (a.type === 'menu') openMenu();
    else if (a.type === 'togglePlay') togglePlay();
  });

  /* ---------- remote control flow ---------- */
  function takeRemote() {
    if (!state.entered || state.remote) return;
    state.remote = true;
    TV.setRemote(true);
    input.hoverRemote = false;
    glCanvas.style.cursor = '';
    if (yt.id && state.view === 'video') pauseVideo();
    setView('menu');
    updateTVCursor();
    if (btnRemote) btnRemote.blur();
  }
  function dropRemote() {
    if (!state.remote) return;
    state.remote = false;
    TV.setRemote(false);
    if (yt.id) {
      if (state.view === 'menu') resumeVideo(); else setView('video');
    } else {
      setView('attract');
    }
    if (btnRemote) btnRemote.blur();
  }
  function toggleRemote() { if (state.remote) dropRemote(); else takeRemote(); }

  function enter() {
    if (state.entered) return;
    state.entered = true;
    body.dataset.entered = 'true';
    introEl.classList.add('hidden');
    look.pitch = -0.7;
    camFov = 74;
    setView('attract');
  }

  /* ---------- cursor on the screen ---------- */
  var raycaster = new THREE.Raycaster();
  var ndc = new THREE.Vector2();
  var screenPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -SCR.z);
  var hitPoint = new THREE.Vector3();
  function updateTVCursor() {
    if (!state.remote) return;
    ndc.set(input.px / window.innerWidth * 2 - 1, -(input.py / window.innerHeight * 2 - 1));
    raycaster.setFromCamera(ndc, camera);
    if (!raycaster.ray.intersectPlane(screenPlane, hitPoint)) return;
    TV.setCursor((hitPoint.x - SCR.cx) / SCR.w + 0.5, 0.5 - (hitPoint.y - SCR.cy) / SCR.h, true);
  }

  function pointerOverRemote(cx, cy) {
    ndc.set(cx / window.innerWidth * 2 - 1, -(cy / window.innerHeight * 2 - 1));
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObject(remote.hit, false).length > 0;
  }

  /* ---------- input ---------- */
  function deadzone(v) {
    var a = Math.abs(v), dz = 0.05;
    return a < dz ? 0 : Math.sign(v) * (a - dz) / (1 - dz);
  }
  var touch = { id: null, x: 0, y: 0, moved: 0 };

  glCanvas.style.touchAction = 'none';
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    input.px = e.clientX; input.py = e.clientY;
    if (e.target !== glCanvas) return;
    input.hasMouse = true;
    if (!state.remote && state.entered) {
      input.lx = deadzone(e.clientX / window.innerWidth * 2 - 1);
      input.ly = deadzone(-(e.clientY / window.innerHeight * 2 - 1));
      var over = pointerOverRemote(e.clientX, e.clientY);
      if (over !== input.hoverRemote) { input.hoverRemote = over; glCanvas.style.cursor = over ? 'pointer' : ''; }
    }
  });
  glCanvas.addEventListener('pointerdown', function (e) {
    if (!state.entered) return;
    if (e.pointerType === 'touch') {
      touch.id = e.pointerId; touch.x = e.clientX; touch.y = e.clientY; touch.moved = 0;
      glCanvas.setPointerCapture(e.pointerId);
      input.px = e.clientX; input.py = e.clientY;
      if (state.remote) updateTVCursor();
      return;
    }
    if (e.button !== 0) return;
    input.px = e.clientX; input.py = e.clientY;
    if (state.remote) { updateTVCursor(); TV.click(); }
    else if (pointerOverRemote(e.clientX, e.clientY)) takeRemote();
  });
  glCanvas.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'touch' || e.pointerId !== touch.id) return;
    var dx = e.clientX - touch.x, dy = e.clientY - touch.y;
    touch.x = e.clientX; touch.y = e.clientY;
    touch.moved += Math.abs(dx) + Math.abs(dy);
    input.px = e.clientX; input.py = e.clientY;
    if (state.remote) {
      TV.scrollBy(-dy * 1.8);
      updateTVCursor();
    } else {
      input.lx = MU.clamp(input.lx - dx / window.innerWidth * 3.2, -1, 1);
      input.ly = MU.clamp(input.ly + dy / window.innerHeight * 3.2, -1, 1);
    }
  });
  function touchEnd(e) {
    if (e.pointerType !== 'touch' || e.pointerId !== touch.id) return;
    touch.id = null;
    if (touch.moved < 12) {
      if (state.remote) { updateTVCursor(); TV.click(); }
      else if (pointerOverRemote(e.clientX, e.clientY)) takeRemote();
    }
  }
  glCanvas.addEventListener('pointerup', touchEnd);
  glCanvas.addEventListener('pointercancel', function (e) { if (e.pointerId === touch.id) touch.id = null; });

  glCanvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    if (state.remote && state.view === 'video') openMenu();
  });
  window.addEventListener('wheel', function (e) {
    if (!state.remote || state.view !== 'menu') return;
    e.preventDefault();
    TV.scrollBy(e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY);
  }, { passive: false });

  window.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!state.entered) {
      if (e.key === 'Enter') enter();
      return;
    }
    var k = e.key;
    if (k === 'e' || k === 'E') { toggleRemote(); }
    else if (k === 'Escape') { dropRemote(); }
    else if (k === ' ' || k === 'Spacebar') { if (yt.id) { e.preventDefault(); togglePlay(); } }
    else if (k === 'm' || k === 'M') { if (state.remote && yt.id) { if (state.view === 'video') openMenu(); else resumeVideo(); } }
    else if (k === 'l' || k === 'L') { I.toggle(); }
    else if (state.remote && state.view === 'menu') {
      if (k === 'ArrowDown') { e.preventDefault(); TV.scrollBy(90); }
      else if (k === 'ArrowUp') { e.preventDefault(); TV.scrollBy(-90); }
      else if (k === 'PageDown') { e.preventDefault(); TV.scrollBy(600); }
      else if (k === 'PageUp') { e.preventDefault(); TV.scrollBy(-600); }
      else if (k === 'ArrowRight') { TV.nextTab(1); }
      else if (k === 'ArrowLeft') { TV.nextTab(-1); }
    }
  });

  enterBtn.addEventListener('click', enter);
  btnRemote.addEventListener('click', toggleRemote);
  btnPlay.addEventListener('click', function () { togglePlay(); btnPlay.blur(); });
  langBtn.addEventListener('click', function () { I.toggle(); langBtn.blur(); });

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    cssRenderer.setSize(w, h);
    camera.aspect = w / h;
    FOV_FREE = camera.aspect < 1.2 ? 80 : BASE_FOV;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---------- per-frame updates ---------- */
  function remoteFov() {
    var d = EYE.z - SCR.z, asp = camera.aspect, fw = 0.86, fh = 0.8;
    var vW = 2 * Math.atan((SCR.w / 2 / d) / fw / asp), vH = 2 * Math.atan((SCR.h / 2 / d) / fh);
    return MU.radToDeg(Math.max(vW, vH));
  }
  var REMOTE_PITCH = Math.atan2((SCR.cy - 0.35) - EYE.y, EYE.z - SCR.z);

  function updateCamera(dt, t) {
    var tYaw, tPitch, tFov, k;
    if (!state.entered) {
      tYaw = Math.sin(t * 0.17) * 0.22; tPitch = BASE_PITCH + Math.sin(t * 0.11) * 0.03; tFov = FOV_FREE; k = 2;
    } else if (state.remote) {
      tYaw = 0; tPitch = REMOTE_PITCH; tFov = remoteFov(); k = 3.4;
    } else {
      tYaw = -input.lx * YAW_RANGE;
      tPitch = BASE_PITCH + (input.ly > 0 ? input.ly * PITCH_UP : input.ly * PITCH_DOWN);
      tFov = FOV_FREE; k = 4.2;
    }
    var a = 1 - Math.exp(-k * dt);
    look.yaw += (tYaw - look.yaw) * a;
    look.pitch += (tPitch - look.pitch) * a;
    camFov += (tFov - camFov) * (1 - Math.exp(-3.4 * dt));
    var bob = state.remote ? 0 : 1;
    camera.rotation.set(look.pitch + Math.sin(t * 0.9) * 0.003 * bob, look.yaw + Math.sin(t * 0.6) * 0.0025 * bob, 0);
    camera.position.set(EYE.x, EYE.y + Math.sin(t * 0.9) * 0.004 * bob, EYE.z);
    if (Math.abs(camera.fov - camFov) > 0.005) { camera.fov = camFov; camera.updateProjectionMatrix(); }
    camera.updateMatrixWorld();
  }

  var tmpPos = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion(), tmpE = new THREE.Euler(0, 0, 0, 'YXZ');
  function updateRemote(dt, t) {
    var target = state.remote ? 1 : 0;
    remote.t += (target - remote.t) * (1 - Math.exp(-6 * dt));
    if (Math.abs(target - remote.t) < 0.002) remote.t = target;
    var k = MU.clamp(Math.tan(MU.degToRad(camera.fov / 2)) / Math.tan(MU.degToRad(BASE_FOV / 2)), 0.4, 1.1);
    var nx = input.px / window.innerWidth * 2 - 1, ny = -(input.py / window.innerHeight * 2 - 1);
    var th = Math.tan(MU.degToRad(camera.fov / 2)), hd = 0.5;
    tmpPos.set(0.36 * th * camera.aspect * hd, (-0.93 - (1 - remote.t) * 0.4) * th * hd, -hd);
    camera.localToWorld(tmpPos);
    tmpE.set(0.45 + ny * 0.14, -nx * 0.2, 0);
    tmpQ2.setFromEuler(tmpE);
    tmpQ.copy(camera.quaternion).multiply(tmpQ2);
    remote.group.position.lerpVectors(remote.restPos, tmpPos, remote.t);
    remote.group.quaternion.copy(remote.restQuat).slerp(tmpQ, remote.t);
    remote.group.scale.setScalar(MU.lerp(1, k, remote.t));

    var hov = state.remote && TV.isHovering();
    var pulse = 0.5 + 0.5 * Math.sin(t * 4);
    remote.ledMat.color.setRGB(1, 0.16 + (hov ? 0.5 : 0.1) * pulse, 0.27 + (hov ? 0.4 : 0));
    remote.glow.position.copy(remote.group.position);
    remote.glow.position.y += 0.03;
    remote.glow.material.opacity = (1 - remote.t) * (0.35 + 0.55 * pulse) * (state.entered ? 1 : 0.4);
    remote.glow.visible = remote.t < 0.98;
  }

  var lerpTo = function (cur, tgt, k, dt) { return cur + (tgt - cur) * (1 - Math.exp(-k * dt)); };
  var beamOpacity = 0.8;
  function updateLights(dt, t) {
    var tgt = !state.entered ? 1.0 : (state.view === 'video' ? 0.2 : (state.remote ? 0.38 : 0.55));
    house = lerpTo(house, tgt, 1.1, dt);
    hemi.intensity = 0.04 + 0.8 * house;
    for (var i = 0; i < sconces.length; i++) sconces[i].intensity = 1.5 * house;
    var s = 0.25 + 0.75 * house;
    downMat.color.setRGB(1 * s, 0.89 * s, 0.72 * s);
    stepLightMat.color.setRGB(1, 0.48 * (0.7 + 0.3 * house), 0.16);

    var flick = 1 + Math.sin(t * 61) * 0.012 + Math.sin(t * 23.3) * 0.01;
    var base = state.view === 'video' ? 4.2 : (state.view === 'menu' ? 3.4 : 3.0);
    rectLight.intensity = base * flick;

    var bt = (state.view === 'menu' && state.remote) ? 0 : (state.view === 'video' ? (state.remote ? 0.3 : 0.9) : 0.8);
    beamOpacity = lerpTo(beamOpacity, bt, 3, dt);
    beamMat.opacity = beamOpacity;
    beamMat.visible = beamOpacity > 0.01;
    dust.mat.opacity = 0.15 + 0.4 * beamOpacity;
  }

  function updateDust(t) {
    var p = dust.pos, b = dust.base, ph = dust.ph;
    for (var i = 0; i < dust.N; i++) {
      var q = ph[i];
      p[i * 3] = b[i * 3] + Math.sin(t * 0.21 + q) * 0.22;
      p[i * 3 + 1] = b[i * 3 + 1] + Math.sin(t * 0.17 + q * 1.3) * 0.2 - ((t * 0.02 + q) % 0.4);
      p[i * 3 + 2] = b[i * 3 + 2] + Math.cos(t * 0.19 + q * 0.7) * 0.22;
    }
    dust.geo.attributes.position.needsUpdate = true;
  }

  var firstFrame = true;
  function frame() {
    requestAnimationFrame(frame);
    var dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    updateCamera(dt, t);
    updateTVCursor();
    updateRemote(dt, t);
    updateLights(dt, t);
    updateDust(t);
    screenMesh.visible = !(state.view === 'video' && !state.remote);
    if (TV.update(t, dt)) screenTex.needsUpdate = true;
    renderer.render(scene, camera);
    cssRenderer.render(cssScene, camera);
    if (firstFrame) {
      firstFrame = false;
      introEl.classList.add('ready');
    }
  }

  if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
    document.querySelector('.hint-free').setAttribute('data-i18n', 'hud.hint.free.touch');
    document.querySelector('.hint-remote').setAttribute('data-i18n', 'hud.hint.remote.touch');
  }
  I.onChange(function () { pushNow(); });
  I.apply();
  updateHud();
  frame();
})();
