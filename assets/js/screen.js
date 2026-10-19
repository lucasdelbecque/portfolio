/* The cinema screen UI: drawn on a 2D canvas that is used as a WebGL texture. */
(function () {
  'use strict';

  var D = window.PORTFOLIO, I = window.I18N;
  var W = 1600, H = 900;

  var canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  var ctx = canvas.getContext('2d');

  var C = { bg: '#0b0a0e', red: '#d7263d', redHi: '#ff4560', gold: '#e9c46a', text: '#f4efe8', muted: '#9b94a8' };
  var HEAD = "'Bebas Neue', Impact, 'Arial Narrow', sans-serif";
  var BODY = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

  var HEADER_H = 100, BANNER_H = 84, FOOT_H = 46;
  var CARD_X = 56, CARD_W = 1488;
  var TABS = ['projects', 'films', 'about', 'contact'];

  var PATHS = {
    github: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z',
    linkedin: 'M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z',
    mail: 'M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z',
    download: 'M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5zM7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z'
  };
  var PATH2D = {};
  Object.keys(PATHS).forEach(function (k) { PATH2D[k] = new Path2D(PATHS[k]); });

  var S = {
    tab: 'projects', scroll: 0, target: 0,
    mode: 'attract', remote: false, now: null,
    cur: { x: W / 2, y: H / 2, on: false },
    hover: null, layout: null, layoutKey: '', chrome: null, chromeKey: '',
    dirty: true, ripple: null, barUntil: 0, lastDraw: 0, fontVer: 0
  };
  var onAction = function () {};

  /* ---------- helpers ---------- */
  function F(size, weight, fam) { return (weight || 400) + ' ' + size + 'px ' + (fam || BODY); }
  function mw(text, font) { ctx.font = font; return ctx.measureText(text).width; }
  function L(v) { return v && typeof v === 'object' ? (v[I.lang] || v.en) : v; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function now() { return performance.now(); }

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function spaced(text, x, y, sp, align) {
    var i, w = 0, ws = [];
    for (i = 0; i < text.length; i++) { ws[i] = ctx.measureText(text[i]).width; w += ws[i] + sp; }
    w -= sp;
    var sx = align === 'center' ? x - w / 2 : (align === 'right' ? x - w : x);
    ctx.textAlign = 'left';
    for (i = 0; i < text.length; i++) { ctx.fillText(text[i], sx, y); sx += ws[i] + sp; }
  }

  function tokenize(str) {
    var words = [], space = false, cur = null;
    str.split('**').forEach(function (seg, i) {
      var bold = i % 2 === 1;
      (seg.match(/\s+|\S+/g) || []).forEach(function (p) {
        if (/^\s+$/.test(p)) { space = true; cur = null; return; }
        if (cur && !space) cur.runs.push({ t: p, b: bold });
        else { cur = { runs: [{ t: p, b: bold }], sp: words.length > 0 }; words.push(cur); }
        space = false;
      });
    });
    return words;
  }

  function wrapRich(str, maxW, size, fam, boldWeight) {
    var words = tokenize(str), lines = [], line = [], x = 0;
    var fR = F(size, 400, fam), fB = F(size, boldWeight, fam);
    var sp = mw(' ', fR);
    words.forEach(function (w) {
      var rw = 0, runs = w.runs.map(function (r) {
        var o = { t: r.t, b: r.b, x: rw };
        rw += mw(r.t, r.b ? fB : fR);
        return o;
      });
      var px = (x > 0 && w.sp) ? x + sp : x;
      if (x > 0 && px + rw > maxW) { lines.push(line); line = []; px = 0; }
      runs.forEach(function (r) { line.push({ t: r.t, b: r.b, x: px + r.x }); });
      x = px + rw;
    });
    if (line.length) lines.push(line);
    return lines;
  }

  function drawLines(lines, x, y, lh, size, fam, col, boldCol, boldWeight) {
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    lines.forEach(function (line, i) {
      line.forEach(function (k) {
        ctx.font = F(size, k.b ? boldWeight : 400, fam);
        ctx.fillStyle = k.b ? boldCol : col;
        ctx.fillText(k.t, x + k.x, y + i * lh);
      });
    });
  }

  function layoutChips(tags, maxW, size) {
    var out = [], x = 0, y = 0, h = size + 16, gap = 10;
    tags.forEach(function (tg) {
      var w = mw(tg, F(size, 600)) + 28;
      if (x > 0 && x + w > maxW) { x = 0; y += h + gap; }
      out.push({ t: tg, x: x, y: y, w: w, h: h });
      x += w + gap;
    });
    return { chips: out, h: out.length ? y + h : 0, size: size };
  }

  function drawChips(cl, ox, oy) {
    cl.chips.forEach(function (c) {
      rr(ox + c.x, oy + c.y, c.w, c.h, c.h / 2);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.font = F(cl.size, 600);
      ctx.fillStyle = 'rgba(244,239,232,0.85)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.t, ox + c.x + 14, oy + c.y + c.h / 2 + 1);
    });
  }

  /* ---------- images ---------- */
  var imgs = {};
  function getImg(src) {
    if (imgs[src]) return imgs[src];
    var rec = { im: new Image(), ok: false };
    imgs[src] = rec;
    if (/^https?:/.test(src)) rec.im.crossOrigin = 'anonymous';
    rec.im.onload = function () { rec.ok = true; S.dirty = true; };
    rec.im.src = src;
    return rec;
  }
  function thumbSrc(it) { return it.img ? it.img : 'https://i.ytimg.com/vi/' + it.yt + '/hqdefault.jpg'; }
  function drawThumb(it, x, y, w, h, r, alpha) {
    var rec = getImg(thumbSrc(it));
    ctx.save();
    rr(x, y, w, h, r);
    ctx.clip();
    var g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, it.colors[0]);
    g.addColorStop(1, it.colors[1]);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    if (rec.ok) {
      var im = rec.im, sx = 0, sy = 0, sw = im.naturalWidth, sh = im.naturalHeight;
      if (it.yt && !it.img) { sy = Math.round(sh * 0.125); sh = Math.round(sh * 0.75); }
      var ar = w / h;
      if (sw / sh > ar) { var nw = sh * ar; sx += (sw - nw) / 2; sw = nw; }
      else { var nh = sw / ar; sy += (sh - nh) / 2; sh = nh; }
      ctx.globalAlpha = alpha === undefined ? 1 : alpha;
      ctx.drawImage(im, sx, sy, sw, sh, x, y, w, h);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /* ---------- icons ---------- */
  function drawIcon(kind, cx, cy, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    if (kind === 'play') {
      var s = size * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.7, cy - s);
      ctx.lineTo(cx + s * 1.05, cy);
      ctx.lineTo(cx - s * 0.7, cy + s);
      ctx.closePath();
      ctx.fill();
    } else if (kind === 'pause') {
      var b = size * 0.2, hh = size * 0.5;
      ctx.fillRect(cx - b * 1.8, cy - hh, b * 1.4, hh * 2);
      ctx.fillRect(cx + b * 0.4, cy - hh, b * 1.4, hh * 2);
    } else if (kind === 'stop') {
      var q = size * 0.42;
      ctx.fillRect(cx - q, cy - q, q * 2, q * 2);
    } else if (kind === 'menu') {
      var m = size * 0.5;
      ctx.lineWidth = size * 0.14;
      ctx.lineCap = 'round';
      for (var i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - m, cy + i * m * 0.7);
        ctx.lineTo(cx + m, cy + i * m * 0.7);
        ctx.stroke();
      }
    } else if (PATH2D[kind]) {
      var k = size / 16;
      ctx.translate(cx - size / 2, cy - size / 2);
      ctx.scale(k, k);
      ctx.fill(PATH2D[kind]);
    }
    ctx.restore();
  }

  function drawButton(b, hovered) {
    rr(b.x, b.y, b.w, b.h, b.h / 2);
    if (b.kind === 'primary') {
      ctx.fillStyle = hovered ? C.redHi : C.red;
      ctx.fill();
    } else {
      ctx.fillStyle = hovered ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.05)';
      ctx.fill();
      ctx.strokeStyle = hovered ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    var label = b.label.toUpperCase();
    ctx.font = F(b.fs || 30, 400, HEAD);
    var tw = 0, i;
    for (i = 0; i < label.length; i++) tw += ctx.measureText(label[i]).width + 1.5;
    tw -= 1.5;
    var iconW = 26, gap = 12, total = iconW + gap + tw;
    var sx = b.x + (b.w - total) / 2;
    drawIcon(b.icon, sx + iconW / 2, b.y + b.h / 2, b.icon === 'github' ? 24 : 22, '#fff');
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    spaced(label, sx + iconW + gap, b.y + b.h / 2 + 2, 1.5, 'left');
  }

  /* ---------- layouts (content coordinates: y = 0 at top of the viewport) ---------- */
  function playAction(it) { return { type: 'play', ytId: it.yt, title: L(it.title), ref: it.id }; }

  function layoutCard(it, y, kind, idx) {
    var pad = 24, thumbW = 360, thumbH = 202, gap = 32, btnW = 240, btnH = 58;
    var textX = pad + thumbW + gap;
    var textW = CARD_W - textX - gap - btnW - pad;
    var title = L(it.title).toUpperCase();
    var tsize = 58, tw = mw(title, F(tsize, 400, HEAD));
    if (tw > textW) tsize = Math.max(34, Math.floor(tsize * textW / tw));
    var chipsL = layoutChips(it.tags || [], textW, 17);
    var descSize = 21, lh = 31;
    var lines = wrapRich(L(it.desc), textW, descSize, BODY, 700);
    var role = it.role ? L(it.role) : null;
    var textH = 22 + 8 + tsize * 0.95 + 14 + (role ? 34 : 0) + (chipsL.h ? chipsL.h + 16 : 0) + lines.length * lh;
    var h = Math.max(thumbH + pad * 2, textH + pad * 2);

    var btns = [];
    if (it.yt) btns.push({ id: 'btn:watch:' + it.id, label: I.t('screen.watch'), icon: 'play', kind: 'primary', action: playAction(it) });
    if (it.github) btns.push({ id: 'btn:gh:' + it.id, label: I.t('screen.github'), icon: 'github', kind: 'ghost', action: { type: 'link', url: it.github } });
    var totalH = btns.length * btnH + (btns.length - 1) * 14;
    var by = (h - totalH) / 2;
    btns.forEach(function (b, i) {
      b.x = CARD_X + CARD_W - pad - btnW;
      b.y = y + by + i * (btnH + 14);
      b.w = btnW;
      b.h = btnH;
    });

    var card = {
      kind: 'card', it: it, x: CARD_X, y: y, w: CARD_W, h: h, pad: pad,
      thumbW: thumbW, thumbH: thumbH, textX: textX, textW: textW, tsize: tsize, title: title,
      chips: chipsL, lines: lines, lh: lh, descSize: descSize, textH: textH, role: role, btns: btns,
      tag: (kind === 'film' ? I.t('screen.film') : I.t('screen.project')) + ' ' + (idx < 9 ? '0' : '') + (idx + 1),
      id: 'card:' + it.id
    };
    var main = it.yt ? playAction(it) : (it.github ? { type: 'link', url: it.github } : null);
    card.region = { id: card.id, x: CARD_X, y: y, w: CARD_W, h: h, action: main };
    return card;
  }

  function layoutList(list, kind) {
    var items = [], regions = [], y = 14;
    list.forEach(function (it, i) {
      var c = layoutCard(it, y, kind, i);
      items.push(c);
      regions.push(c.region);
      c.btns.forEach(function (b) { regions.push({ id: b.id, x: b.x, y: b.y, w: b.w, h: b.h, action: b.action }); });
      y += c.h + 26;
    });
    return { items: items, regions: regions, height: y + 10, kind: 'list' };
  }

  function layoutAbout() {
    var colLW = 860, colRX = 980, colRW = 564, x0 = CARD_X;
    var y = 22;
    var label = I.t('about.label').toUpperCase();
    var titleLines = wrapRich(I.t('about.title'), colLW, 66, HEAD, 400);
    var yTitle = y + 54;
    var yPar = yTitle + titleLines.length * 70 + 14;
    var pars = ['p1', 'p2', 'p3'].map(function (k) {
      var lines = wrapRich(L(D.about[k]), colLW, 25, BODY, 700);
      var p = { lines: lines, y: yPar };
      yPar += lines.length * 39 + 22;
      return p;
    });
    var ry = 24, groups = D.about.skills.map(function (g) {
      var cl = layoutChips(g.tags, colRW, 18);
      var o = { title: L(g.title).toUpperCase(), y: ry, chips: cl };
      ry += 44 + cl.h + 34;
      return o;
    });
    return { kind: 'about', x0: x0, label: label, y: y, titleLines: titleLines, yTitle: yTitle, pars: pars, groups: groups, colRX: colRX, regions: [], height: Math.max(yPar, ry) + 30 };
  }

  function layoutContact() {
    var x0 = CARD_X;
    var y = 22;
    var label = I.t('contact.label').toUpperCase();
    var titleLines = wrapRich(I.t('contact.title'), 1200, 74, HEAD, 400);
    var yTitle = y + 56;
    var yDesc = yTitle + titleLines.length * 78 + 12;
    var descLines = wrapRich(L(D.contact.desc), 1100, 25, BODY, 700);
    var yTiles = yDesc + descLines.length * 39 + 34;
    var tw = 726, th = 132, gap = 36;
    var defs = [
      { k: 'linkedin', name: 'LinkedIn', sub: 'linkedin.com/in/lucas-delbecque', url: D.links.linkedin },
      { k: 'github', name: 'GitHub', sub: 'github.com/lucasdelbecque', url: D.links.github },
      { k: 'mail', name: I.t('contact.email'), sub: D.links.email, url: 'mailto:' + D.links.email },
      { k: 'download', name: I.t('contact.cv'), sub: I.t('contact.cv.sub'), url: D.links.cv }
    ];
    var tiles = defs.map(function (d, i) {
      var col = i % 2, row = Math.floor(i / 2);
      return {
        k: d.k, name: d.name, sub: d.sub, id: 'tile:' + d.k,
        x: x0 + col * (tw + gap), y: yTiles + row * (th + gap), w: tw, h: th,
        action: { type: 'link', url: d.url }
      };
    });
    return {
      kind: 'contact', x0: x0, label: label, y: y, titleLines: titleLines, yTitle: yTitle,
      descLines: descLines, yDesc: yDesc, tiles: tiles,
      regions: tiles.map(function (t) { return { id: t.id, x: t.x, y: t.y, w: t.w, h: t.h, action: t.action }; }),
      height: yTiles + 2 * th + gap + 30
    };
  }

  function getLayout() {
    var key = S.tab + '|' + I.lang + '|' + S.fontVer;
    if (S.layout && S.layoutKey === key) return S.layout;
    var l;
    if (S.tab === 'projects') l = layoutList(D.projects, 'project');
    else if (S.tab === 'films') l = layoutList(D.films, 'film');
    else if (S.tab === 'about') l = layoutAbout();
    else l = layoutContact();
    S.layout = l;
    S.layoutKey = key;
    return l;
  }

  function hasBanner() { return S.mode === 'menu' && !!S.now; }
  function contentTop() { return HEADER_H + (hasBanner() ? BANNER_H + 12 : 0); }
  function viewH() { return H - FOOT_H - contentTop(); }
  function maxScroll() { return Math.max(0, getLayout().height - viewH()); }

  /* ---------- fixed regions (header tabs, banner, video bar) ---------- */
  function barAlpha() {
    if (S.mode !== 'video' || !S.remote) return 0;
    return clamp((S.barUntil - now()) / 500, 0, 1);
  }

  function getChrome() {
    var key = I.lang + '|' + S.fontVer + '|' + S.mode + '|' + (S.now ? (S.now.playing ? 'p' : 'z') : 'n');
    if (S.chrome && S.chromeKey === key) return S.chrome;
    var regions = [], tabs = [], i, x = W - 56;
    for (i = TABS.length - 1; i >= 0; i--) {
      var label = I.t('tab.' + TABS[i]).toUpperCase();
      ctx.font = F(32, 400, HEAD);
      var tw = 0, j;
      for (j = 0; j < label.length; j++) tw += ctx.measureText(label[j]).width + 1.5;
      var w = tw + 46;
      x -= w;
      var t = { id: TABS[i], label: label, x: x, y: 24, w: w, h: 54 };
      tabs.unshift(t);
      regions.push({ id: 'tab:' + TABS[i], x: t.x, y: t.y, w: t.w, h: t.h, action: { type: 'tab', id: TABS[i] } });
      x -= 6;
    }
    var banner = null;
    if (S.mode === 'menu' && S.now) {
      var by = HEADER_H;
      banner = {
        y: by,
        resume: { id: 'banner:resume', x: W - 56 - 250 - 14 - 170, y: by + 14, w: 250, h: 56, label: I.t('screen.resume'), icon: 'play', kind: 'primary', fs: 28 },
        stop: { id: 'banner:stop', x: W - 56 - 170, y: by + 14, w: 170, h: 56, label: I.t('screen.stop'), icon: 'stop', kind: 'ghost', fs: 28 }
      };
      regions.push({ id: banner.resume.id, x: banner.resume.x, y: banner.resume.y, w: 250, h: 56, action: { type: 'resume' } });
      regions.push({ id: banner.stop.id, x: banner.stop.x, y: banner.stop.y, w: 170, h: 56, action: { type: 'stop' } });
    }
    var bar = null;
    if (S.mode === 'video') {
      var bw = 230, bh = 66, gap = 18, total = bw * 3 + gap * 2, bx = (W - total) / 2, byy = H - 120;
      bar = [
        { id: 'bar:menu', x: bx, y: byy, w: bw, h: bh, label: I.t('screen.menu'), icon: 'menu', kind: 'ghost', fs: 30, action: { type: 'menu' } },
        { id: 'bar:toggle', x: bx + bw + gap, y: byy, w: bw, h: bh, label: S.now && S.now.playing ? I.t('screen.pause') : I.t('screen.play'), icon: S.now && S.now.playing ? 'pause' : 'play', kind: 'primary', fs: 30, action: { type: 'togglePlay' } },
        { id: 'bar:stop', x: bx + (bw + gap) * 2, y: byy, w: bw, h: bh, label: I.t('screen.stop'), icon: 'stop', kind: 'ghost', fs: 30, action: { type: 'stop' } }
      ];
    }
    S.chrome = { tabs: tabs, regions: regions, banner: banner, bar: bar };
    S.chromeKey = key;
    return S.chrome;
  }

  function inside(r, x, y) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

  function hitTest() {
    var x = S.cur.x, y = S.cur.y, i, ch = getChrome();
    if (S.mode === 'video') {
      if (barAlpha() < 0.2 || !ch.bar) return null;
      for (i = ch.bar.length - 1; i >= 0; i--) if (inside(ch.bar[i], x, y)) return ch.bar[i];
      return null;
    }
    for (i = ch.regions.length - 1; i >= 0; i--) if (inside(ch.regions[i], x, y)) return ch.regions[i];
    var top = contentTop();
    if (y >= top && y <= H - FOOT_H) {
      var yy = y - top + S.scroll, regs = getLayout().regions;
      for (i = regs.length - 1; i >= 0; i--) if (inside(regs[i], x, yy)) return regs[i];
    }
    return null;
  }

  function isHover(id) { return !!S.hover && S.hover.id === id; }

  /* ---------- drawing ---------- */
  function drawCard(c) {
    var hov = isHover(c.id);
    rr(c.x, c.y, c.w, c.h, 22);
    ctx.fillStyle = hov ? 'rgba(255,255,255,0.085)' : 'rgba(255,255,255,0.04)';
    ctx.fill();
    ctx.strokeStyle = hov ? 'rgba(233,196,106,0.55)' : 'rgba(255,255,255,0.08)';
    ctx.lineWidth = hov ? 2.5 : 1.5;
    ctx.stroke();

    var tx = c.x + c.pad, ty = c.y + (c.h - c.thumbH) / 2;
    drawThumb(c.it, tx, ty, c.thumbW, c.thumbH, 14);
    if (c.it.yt) {
      var cx = tx + c.thumbW / 2, cy = ty + c.thumbH / 2, rad = hov ? 40 : 34;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fillStyle = hov ? 'rgba(215,38,61,0.95)' : 'rgba(0,0,0,0.55)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      drawIcon('play', cx + 2, cy, 30, '#fff');
    }
    rr(tx, ty, c.thumbW, c.thumbH, 14);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    var x = c.x + c.textX;
    var y = c.y + c.pad + (c.h - 2 * c.pad - c.textH) / 2;
    ctx.fillStyle = C.gold;
    ctx.font = F(15, 700);
    ctx.textBaseline = 'alphabetic';
    spaced(c.tag.toUpperCase(), x, y + 15, 3, 'left');
    y += 22 + 8;
    ctx.font = F(c.tsize, 400, HEAD);
    ctx.fillStyle = C.text;
    ctx.textAlign = 'left';
    ctx.fillText(c.title, x, y + c.tsize * 0.8);
    y += c.tsize * 0.95 + 14;
    if (c.role) {
      ctx.font = F(19, 600);
      ctx.fillStyle = C.muted;
      ctx.fillText(c.role, x, y + 18);
      y += 34;
    }
    if (c.chips.h) {
      drawChips(c.chips, x, y);
      y += c.chips.h + 16;
    }
    drawLines(c.lines, x, y + 21, c.lh, c.descSize, BODY, 'rgba(244,239,232,0.78)', '#fff', 700);

    c.btns.forEach(function (b) {
      drawButton(b, isHover(b.id));
    });
  }

  function drawTitleBlock(lay, label) {
    ctx.fillStyle = C.gold;
    ctx.font = F(16, 700);
    ctx.textBaseline = 'alphabetic';
    spaced(label, lay.x0, lay.y + 16, 4, 'left');
    drawLines(lay.titleLines, lay.x0, lay.yTitle + 48, lay.kind === 'about' ? 70 : 78, lay.kind === 'about' ? 66 : 74, HEAD, C.text, C.gold, 400);
  }

  function drawAboutContent(lay) {
    drawTitleBlock(lay, lay.label);
    lay.pars.forEach(function (p) {
      drawLines(p.lines, lay.x0, p.y + 28, 39, 25, BODY, 'rgba(244,239,232,0.8)', '#fff', 700);
    });
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(lay.colRX - 30, 20, 2, lay.height - 70);
    lay.groups.forEach(function (g) {
      ctx.font = F(34, 400, HEAD);
      ctx.fillStyle = C.gold;
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      ctx.fillText(g.title, lay.colRX, g.y + 32);
      drawChips(g.chips, lay.colRX, g.y + 48);
    });
  }

  function drawContactContent(lay) {
    drawTitleBlock(lay, lay.label);
    drawLines(lay.descLines, lay.x0, lay.yDesc + 28, 39, 25, BODY, 'rgba(244,239,232,0.8)', '#fff', 700);
    lay.tiles.forEach(function (t) {
      var hov = isHover(t.id);
      rr(t.x, t.y, t.w, t.h, 24);
      ctx.fillStyle = hov ? 'rgba(215,38,61,0.22)' : 'rgba(255,255,255,0.045)';
      ctx.fill();
      ctx.strokeStyle = hov ? C.redHi : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = hov ? 3 : 1.5;
      ctx.stroke();
      drawIcon(t.k, t.x + 74, t.y + t.h / 2, 54, hov ? '#fff' : C.gold);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.font = F(46, 400, HEAD);
      ctx.fillStyle = C.text;
      ctx.fillText(t.name.toUpperCase(), t.x + 134, t.y + 62);
      ctx.font = F(20, 500);
      ctx.fillStyle = C.muted;
      ctx.fillText(t.sub, t.x + 134, t.y + 96);
    });
  }

  function drawHeader() {
    var g = ctx.createLinearGradient(0, 0, 0, HEADER_H + 26);
    g.addColorStop(0, 'rgba(11,10,14,1)');
    g.addColorStop(0.78, 'rgba(11,10,14,0.97)');
    g.addColorStop(1, 'rgba(11,10,14,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, HEADER_H + 26);

    rr(56, 22, 58, 58, 15);
    ctx.fillStyle = C.red;
    ctx.fill();
    ctx.font = F(36, 400, HEAD);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LD', 85, 53);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = C.gold;
    ctx.font = F(13, 700);
    spaced('PORTFOLIO 2026', 134, 38, 3.5, 'left');
    ctx.fillStyle = C.text;
    ctx.font = F(44, 400, HEAD);
    ctx.fillText('LUCAS DELBECQUE', 134, 76);

    getChrome().tabs.forEach(function (t) {
      var active = S.tab === t.id, hov = isHover('tab:' + t.id);
      if (active || hov) {
        rr(t.x, t.y, t.w, t.h, 27);
        ctx.fillStyle = active ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)';
        ctx.fill();
      }
      ctx.font = F(32, 400, HEAD);
      ctx.fillStyle = active ? '#fff' : (hov ? C.text : C.muted);
      ctx.textBaseline = 'middle';
      spaced(t.label, t.x + t.w / 2, t.y + t.h / 2 + 2, 1.5, 'center');
      if (active) {
        ctx.fillStyle = C.red;
        rr(t.x + 20, t.y + t.h - 6, t.w - 40, 4, 2);
        ctx.fill();
      }
    });
  }

  function drawBanner() {
    var b = getChrome().banner;
    if (!b) return;
    rr(56, b.y + 4, W - 112, BANNER_H - 8, 20);
    ctx.fillStyle = 'rgba(215,38,61,0.14)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(215,38,61,0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawIcon(S.now.playing ? 'play' : 'pause', 100, b.y + BANNER_H / 2, 26, C.redHi);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = C.gold;
    ctx.font = F(14, 700);
    spaced((S.now.playing ? I.t('screen.playing') : I.t('screen.paused')).toUpperCase(), 140, b.y + 33, 3.5, 'left');
    ctx.fillStyle = C.text;
    ctx.font = F(36, 400, HEAD);
    ctx.fillText(S.now.title.toUpperCase(), 140, b.y + 66);
    drawButton(b.resume, isHover(b.resume.id));
    drawButton(b.stop, isHover(b.stop.id));
  }

  function drawFooter() {
    var g = ctx.createLinearGradient(0, H - FOOT_H - 26, 0, H);
    g.addColorStop(0, 'rgba(11,10,14,0)');
    g.addColorStop(0.5, 'rgba(11,10,14,0.96)');
    g.addColorStop(1, 'rgba(11,10,14,1)');
    ctx.fillStyle = g;
    ctx.fillRect(0, H - FOOT_H - 26, W, FOOT_H + 26);
    ctx.font = F(16, 500);
    ctx.fillStyle = C.muted;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(I.t('screen.footer'), 56, H - 20);
    ctx.textAlign = 'right';
    ctx.fillText(I.t('screen.footer.esc'), W - 56, H - 20);
  }

  function drawScrollbar() {
    var ms = maxScroll();
    if (ms <= 0) return;
    var top = contentTop() + 6, h = viewH() - 12, th = Math.max(60, h * viewH() / getLayout().height);
    var ty = top + (h - th) * (S.scroll / ms);
    rr(W - 34, top, 8, h, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fill();
    rr(W - 34, ty, 8, th, 4);
    ctx.fillStyle = 'rgba(233,196,106,0.8)';
    ctx.fill();
  }

  function drawMenu() {
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#100c12');
    bg.addColorStop(1, '#0a090c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    var glow = ctx.createRadialGradient(W * 0.85, 0, 0, W * 0.85, 0, 700);
    glow.addColorStop(0, 'rgba(215,38,61,0.20)');
    glow.addColorStop(1, 'rgba(215,38,61,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    var lay = getLayout(), top = contentTop();
    S.scroll = clamp(S.scroll, 0, maxScroll());
    S.target = clamp(S.target, 0, maxScroll());
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, W, H - FOOT_H - top);
    ctx.clip();
    ctx.translate(0, top - S.scroll);
    if (lay.kind === 'list') {
      lay.items.forEach(function (c) {
        if (c.y + c.h < S.scroll - 10 || c.y > S.scroll + viewH() + 10) return;
        drawCard(c);
      });
    } else if (lay.kind === 'about') drawAboutContent(lay);
    else drawContactContent(lay);
    ctx.restore();

    drawScrollbar();
    drawHeader();
    drawBanner();
    drawFooter();
  }

  var noiseCanvas = null;
  function noise() {
    if (noiseCanvas) return noiseCanvas;
    noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = noiseCanvas.height = 256;
    var nc = noiseCanvas.getContext('2d'), id = nc.createImageData(256, 256), i, v;
    for (i = 0; i < id.data.length; i += 4) {
      v = Math.random() * 255;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
      id.data[i + 3] = 255;
    }
    nc.putImageData(id, 0, 0);
    return noiseCanvas;
  }

  function drawAttract(t) {
    ctx.fillStyle = '#050406';
    ctx.fillRect(0, 0, W, H);
    var glow = ctx.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H * 0.42, 820);
    glow.addColorStop(0, 'rgba(215,38,61,0.26)');
    glow.addColorStop(0.55, 'rgba(110,18,38,0.10)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    var sweep = (t * 90) % (W + 600) - 300;
    var sg = ctx.createLinearGradient(sweep - 200, 0, sweep + 200, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)');
    sg.addColorStop(0.5, 'rgba(255,230,200,0.045)');
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);

    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = C.redHi;
    ctx.font = F(20, 700);
    var showing = I.t('attract.showing').toUpperCase();
    var showW = ctx.measureText(showing).width + 8 * (showing.length - 1) * 0.55;
    spaced(showing, W / 2 + 20, 118, 8, 'center');
    ctx.beginPath();
    ctx.arc(W / 2 + 20 - showW / 2 - 30, 111, 7, 0, Math.PI * 2);
    ctx.globalAlpha = 0.55 + 0.45 * Math.sin(t * 4);
    ctx.fill();
    ctx.globalAlpha = 1;

    var tg = ctx.createLinearGradient(0, 160, 0, 340);
    tg.addColorStop(0, '#fff3cf');
    tg.addColorStop(0.55, '#e9c46a');
    tg.addColorStop(1, '#a8741a');
    ctx.fillStyle = tg;
    ctx.font = F(206, 400, HEAD);
    ctx.textAlign = 'center';
    ctx.fillText('LUCAS DELBECQUE', W / 2, 322);

    ctx.fillStyle = C.text;
    ctx.font = F(30, 600);
    spaced(I.t('attract.tag').toUpperCase(), W / 2, 388, 6, 'center');

    var feat = D.projects.concat(D.films);
    var phase = t / 3.6, idx = Math.floor(phase) % feat.length, f = phase - Math.floor(phase);
    var alpha = Math.min(1, f * 4, (1 - f) * 4);
    var it = feat[idx], fw = 400, fh = 225, fx = W / 2 - fw / 2, fy = 440;
    ctx.globalAlpha = alpha;
    drawThumb(it, fx, fy, fw, fh, 16);
    rr(fx, fy, fw, fh, 16);
    ctx.strokeStyle = 'rgba(233,196,106,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = C.text;
    ctx.font = F(40, 400, HEAD);
    ctx.textAlign = 'center';
    ctx.fillText(L(it.title).toUpperCase(), W / 2, fy + fh + 50);
    ctx.globalAlpha = 1;

    var strip = D.projects.concat(D.films).map(function (p) { return L(p.title).toUpperCase(); }).join('   ✦   ') + '   ✦   ';
    ctx.font = F(46, 400, HEAD);
    var sw = ctx.measureText(strip).width, off = (t * 70) % sw;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.textAlign = 'left';
    ctx.fillText(strip, -off, 800);
    ctx.fillText(strip, -off + sw, 800);

    var pulse = 0.65 + 0.35 * Math.sin(t * 3);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#fff';
    ctx.font = F(24, 600);
    spaced(I.t('attract.cta').toUpperCase(), W / 2, 862, 5, 'center');
    ctx.globalAlpha = 1;

    var vg = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1000);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.translate(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
    ctx.fillStyle = ctx.createPattern(noise(), 'repeat');
    ctx.fillRect(-256, -256, W + 256, H + 256);
    ctx.restore();
    ctx.globalAlpha = 1;
    if (Math.random() < 0.06) {
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawVideoBar() {
    var a = barAlpha();
    if (a <= 0.01) return;
    var ch = getChrome();
    ctx.save();
    ctx.globalAlpha = a;
    var g = ctx.createLinearGradient(0, H - 260, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = g;
    ctx.fillRect(0, H - 260, W, 260);
    var g2 = ctx.createLinearGradient(0, 0, 0, 150);
    g2.addColorStop(0, 'rgba(0,0,0,0.65)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, 150);
    if (S.now) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = C.gold;
      ctx.font = F(14, 700);
      spaced(I.t('screen.playing').toUpperCase(), 60, 52, 3.5, 'left');
      ctx.fillStyle = '#fff';
      ctx.font = F(48, 400, HEAD);
      ctx.fillText(S.now.title.toUpperCase(), 60, 98);
    }
    ch.bar.forEach(function (b) { drawButton(b, isHover(b.id)); });
    ctx.restore();
  }

  function drawCursor() {
    var x = S.cur.x, y = S.cur.y, hov = !!S.hover;
    ctx.save();
    ctx.translate(x, y);
    var rad = hov ? 46 : 34;
    var g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
    g.addColorStop(0, hov ? 'rgba(255,69,96,0.55)' : 'rgba(255,255,255,0.3)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.scale(1.15, 1.15);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 30);
    ctx.lineTo(7.5, 23.5);
    ctx.lineTo(13, 36);
    ctx.lineTo(19, 33.3);
    ctx.lineTo(13.5, 21);
    ctx.lineTo(23, 21);
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.fillStyle = hov ? C.redHi : '#fff';
    ctx.fill();
    ctx.restore();
    if (S.ripple) {
      var age = now() - S.ripple.t;
      if (age < 450) {
        ctx.beginPath();
        ctx.arc(S.ripple.x, S.ripple.y, 12 + age * 0.12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,' + (1 - age / 450) * 0.9 + ')';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    if (S.mode === 'attract') { drawAttract(t); return; }
    if (S.mode === 'menu') drawMenu();
    else if (S.remote) drawVideoBar();
    if (S.remote && S.cur.on) drawCursor();
  }

  /* ---------- public API ---------- */
  function update(t, dt) {
    var d = S.target - S.scroll;
    if (Math.abs(d) > 0.4) { S.scroll += d * (1 - Math.exp(-14 * dt)); S.dirty = true; }
    else if (S.scroll !== S.target) { S.scroll = S.target; S.dirty = true; }

    var h = (S.remote && S.cur.on && S.mode !== 'attract') ? hitTest() : null;
    if ((h ? h.id : null) !== (S.hover ? S.hover.id : null)) { S.hover = h; S.dirty = true; }
    if (h && S.mode === 'video') S.barUntil = Math.max(S.barUntil, now() + 1500);

    if (S.mode === 'attract' && t - S.lastDraw > 0.04) S.dirty = true;
    if (S.ripple) { if (now() - S.ripple.t < 450) S.dirty = true; else { S.ripple = null; S.dirty = true; } }
    if (S.mode === 'video' && S.remote) { var a = barAlpha(); if (a > 0 && a < 1) S.dirty = true; if (a > 0) S.dirty = true; }

    if (!S.dirty) return false;
    S.dirty = false;
    S.lastDraw = t;
    draw(t);
    return true;
  }

  function setCursor(u, v, on) {
    var x = clamp(u, 0, 1) * W, y = clamp(v, 0, 1) * H;
    if (Math.abs(x - S.cur.x) > 0.5 || Math.abs(y - S.cur.y) > 0.5 || on !== S.cur.on) {
      S.cur.x = x;
      S.cur.y = y;
      S.cur.on = on;
      S.barUntil = now() + 3500;
      S.dirty = true;
    }
  }

  function setTab(id) {
    if (TABS.indexOf(id) < 0 || id === S.tab) return;
    S.tab = id;
    S.scroll = S.target = 0;
    S.hover = null;
    S.dirty = true;
  }

  var api = {
    canvas: canvas, W: W, H: H,
    init: function (handler) { onAction = handler; },
    update: update,
    setCursor: setCursor,
    setMode: function (m) { if (S.mode !== m) { S.mode = m; S.hover = null; S.barUntil = now() + 3500; S.dirty = true; } },
    setRemote: function (r) { S.remote = r; if (!r) { S.cur.on = false; S.hover = null; } S.barUntil = now() + 3500; S.dirty = true; },
    setNow: function (n) { S.now = n; S.chrome = null; S.dirty = true; },
    scrollBy: function (dy) { S.target = clamp(S.target + dy, 0, maxScroll()); S.dirty = true; },
    setTab: setTab,
    nextTab: function (dir) { setTab(TABS[(TABS.indexOf(S.tab) + dir + TABS.length) % TABS.length]); },
    click: function () {
      if (!S.remote || S.mode === 'attract') return;
      var h = hitTest();
      S.ripple = { x: S.cur.x, y: S.cur.y, t: now() };
      S.dirty = true;
      if (!h || !h.action) return;
      if (h.action.type === 'tab') { setTab(h.action.id); return; }
      onAction(h.action);
    },
    isHovering: function () { return !!S.hover; },
    invalidate: function () { S.layout = null; S.chrome = null; S.dirty = true; }
  };
  window.TVScreen = api;

  I.onChange(function () { api.invalidate(); });

  function bumpFonts() { S.fontVer++; S.layout = null; S.chrome = null; S.dirty = true; }
  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load("400 40px 'Bebas Neue'"),
      document.fonts.load("400 20px 'Inter'"),
      document.fonts.load("600 20px 'Inter'"),
      document.fonts.load("700 20px 'Inter'")
    ]).then(bumpFonts, bumpFonts);
    document.fonts.ready.then(bumpFonts);
  }
})();
