/* Kenius — "Overnight" design exploration · page behaviour.
   Scenes: every [data-form] section names a particle formation and holds a .stage
   box; the camera fits that formation into the box each frame, so the particles
   live inside the layout and travel with it. Also: the live agent log, reveals,
   the mobile menu and the Web3Forms contact form. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var LANG = (doc.lang || 'en').toLowerCase().slice(0, 2);
  var RU = LANG === 'ru';
  var Q = new URLSearchParams(location.search);
  var reduce = Q.has('reduced') || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduce) doc.classList.add('reduce');
  if (Q.has('shot')) doc.classList.add('shot');

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

  /* ------------------------------------------------------------ chrome */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  var top = $('.top');
  function onScrollChrome() { if (top) top.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScrollChrome, { passive: true });
  onScrollChrome();

  var menu = $('.menu');
  if (menu) {
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.open = false; }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) { menu.open = false; $('summary', menu).focus(); }
    });
    document.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  }

  /* ------------------------------------------------------------ reveals */
  var rvs = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el) { io.observe(el); });
  } else {
    rvs.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------------------------------------------------- agent log */
  // Illustrative entries — typical builds and patterns, not client case studies.
  var EVENTS = RU ? [
    { t: '02:14', q: '«Нет тепла — кв. 4Б.»', a: 'мастер выехал' },
    { t: '06:39', q: '«Нужна справка о доходах?»', a: 'документы собраны' },
    { t: '10:05', q: '«Где мой заказ?»', a: 'решено, без очереди' },
    { t: '13:27', q: '41 счёт прочитан и сверен', a: '2 на проверку', flag: true },
    { t: '18:22', q: 'Заявка с портала, одобрена', a: 'показ назначен' },
    { t: '23:58', q: 'Пропущенный: не работает котёл', a: 'мастер в пути' }
  ] : [
    { t: '02:14', q: '“No heat — unit 4B.”', a: 'tech dispatched' },
    { t: '06:39', q: '“Still need my W-2?”', a: 'docs collected' },
    { t: '10:05', q: '“Where’s my order?”', a: 'resolved, no queue' },
    { t: '13:27', q: '41 invoices read & reconciled', a: '2 flagged for review', flag: true },
    { t: '18:22', q: 'Portal lead, pre-approved', a: 'tour booked' },
    { t: '23:58', q: 'Missed call: furnace out', a: 'tech en route' }
  ];
  var logList = $('#agent-log');
  var clockEl = $('#agent-clock');
  var logIdx = -1;

  function evtHTML(e) {
    return '<time>' + e.t + '</time><span>' + e.q.replace(/&/g, '&amp;') + ' <b' + (e.flag ? ' class="flag"' : '') + '><span class="arw" aria-hidden="true"></span> ' + e.a + '</b></span>';
  }
  function renderLog(animate) {
    if (!logList) return;
    logList.innerHTML = '';
    for (var k = 0; k < 4; k++) {
      var e = EVENTS[(logIdx - k + EVENTS.length * 4) % EVENTS.length];
      var li = document.createElement('li');
      li.className = 'evt' + (k === 0 && animate ? ' is-new' : '');
      li.innerHTML = evtHTML(e);
      logList.appendChild(li);
    }
  }
  if (logList) {
    var now = new Date();
    var h = now.getHours() + now.getMinutes() / 60;
    logIdx = EVENTS.length - 1;
    EVENTS.forEach(function (e, i) {
      var p = e.t.split(':');
      if (+p[0] + p[1] / 60 <= h) logIdx = i;
    });
    // before 02:14 the latest entry is yesterday's 23:58, which the default already covers
    renderLog(false);
    if (!reduce) setInterval(function () { logIdx = (logIdx + 1) % EVENTS.length; renderLog(true); }, 7000);
  }
  function tickClock() { if (clockEl) { var d = new Date(); clockEl.textContent = hm(d); clockEl.dateTime = hm(d); } }
  tickClock();
  setInterval(tickClock, 10000);

  /* --------------------------------------------------------- contact form */
  (function () {
    var f = $('form[data-ajax]');
    if (!f) return;
    var ok = $('#form-success');
    var sb = $('[type="submit"]', f);
    var hp = $('.hp', f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (hp && hp.checked) return;
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var orig = sb.innerHTML;
      sb.disabled = true;
      sb.textContent = RU ? 'Отправляем…' : 'Sending…';
      fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('status ' + r.status);
          f.reset();
          if (ok) {
            f.hidden = true; ok.hidden = false;
            ok.setAttribute('tabindex', '-1');
            ok.focus({ preventScroll: true });
            ok.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
          }
        })
        .catch(function () {
          sb.disabled = false; sb.innerHTML = orig;
          var m = $('.form-err', f);
          if (!m) {
            m = document.createElement('p');
            m.className = 'form-note form-err';
            m.setAttribute('role', 'alert');
            sb.insertAdjacentElement('afterend', m);
          }
          m.textContent = RU
            ? 'Не отправилось — напишите, пожалуйста, на hello@kenius.co.'
            : 'That didn’t send — please email hello@kenius.co instead.';
        });
    });
  })();

  /* ============================================================== scenes */

  // Framing for each formation: the half-extent that must fit the stage,
  // the viewing angle, depth of field and exposure.
  var PRESET = {
    swarm:    { ex: 2.75, ey: 1.95, yaw: 0.0,  pitch: 0.14, ap: 0.55, exp: 1.0 },
    timeline: { ex: 3.6,  ey: 0.6,  yaw: 0.0,  pitch: 0.12, ap: 0.35, exp: 1.05 },
    map:      { ex: 2.95, ey: 1.45, yaw: -0.2, pitch: 0.5,  ap: 0.55, exp: 1.0 },
    pipeline: { ex: 3.0,  ey: 1.9,  yaw: 0.0,  pitch: 0.16, ap: 0.45, exp: 1.0 },
    voice:    { ex: 3.35, ey: 1.4,  yaw: 0.0,  pitch: 0.12, ap: 0.55, exp: 1.0 },
    docs:     { ex: 2.7,  ey: 1.05, yaw: 0.12, pitch: 0.1,  ap: 0.45, exp: 1.1 },
    sphere:   { ex: 2.3,  ey: 2.3,  yaw: 0.0,  pitch: 0.1,  ap: 0.6,  exp: 1.0 },
    nodes:    { ex: 2.9,  ey: 1.85, yaw: 0.0,  pitch: 0.12, ap: 0.5,  exp: 1.0 },
    line:     { ex: 4.7,  ey: 0.5,  yaw: 0.0,  pitch: 0.02, ap: 0.3,  exp: 1.0 },
    dust:     { ex: 3.3,  ey: 2.0,  yaw: 0.0,  pitch: 0.0,  ap: 0.9,  exp: 1.0, viewport: true },
    ring:     { ex: 2.55, ey: 2.55, yaw: 0.0,  pitch: 0.0,  ap: 0.45, exp: 1.0 },
    grid:     { ex: 2.65, ey: 1.55, yaw: 0.0,  pitch: 0.2,  ap: 0.5,  exp: 1.0 }
  };

  var TAU = Math.PI * 2;
  function rot(a, x, y) { var c = Math.cos(a), s = Math.sin(a); return [c * x + s * y, -s * x + c * y]; }
  function hash11(p) { p = (p * 0.1031) % 1; p *= p + 33.33; p *= p + p; return p % 1; }
  function nodePos(k, t) {
    var a = k / 6 * TAU + t * 0.05;
    var x = Math.cos(a) * 2.35, z = Math.sin(a) * 2.35;
    var yz = rot(-0.62, 0, z);
    return [x, yz[0], yz[1]];
  }

  // Labels anchored to points inside formations (mirrors the shader geometry).
  var LABELS = {
    pipeline: function (t, hour) {
      return [
        { p: [-2.5, -0.78, 0], text: RU ? 'План' : 'Plan' },
        { p: [0, 0.02, 0.3], text: RU ? 'Действие' : 'Act', tone: 'signal' },
        { p: [2.5, -0.78, 0], text: RU ? 'Утверждает человек' : 'A person approves', tone: 'flag' }
      ];
    },
    nodes: function (t) {
      var names = RU ? ['Телефон', 'Почта', 'CRM', 'Календарь', 'Учёт', 'Документы'] : ['Phone', 'Inbox', 'CRM', 'Calendar', 'Accounting', 'Documents'];
      return names.map(function (n, k) {
        var p = nodePos(k, t);
        return { p: [p[0], p[1] + 0.42, p[2]], text: n };
      });
    },
    docs: function (t) {
      var len = 0.45 + 0.55 * hash11(6 * 17 + 9 * 3.1);
      var qx = 0;
      var qy = -0.71 - 0.16;
      var xz = rot(-0.28 * 3, qx, 0);
      var px = xz[0] + 3 * 0.74, py = qy + 0.05 * Math.sin(3 * 1.7 + t * 0.7), pz = xz[1] - 3 * 0.3;
      var yz = rot(-0.16, py, pz);
      return [{ p: [px, yz[0], yz[1]], text: RU ? 'Исключение — человеку' : 'Exception, to a person', tone: 'flag' }];
    },
    ring: function (t, hour) {
      var a = Math.PI / 2 - hour / 24 * TAU;
      var r = 2.62;
      var d = new Date();
      return [{ p: [Math.cos(a) * r, Math.sin(a) * r, 0], text: (RU ? 'сейчас ' : 'now ') + hm(d), tone: 'now' }];
    }
  };

  var canvas = $('#gl');
  var engine = null;
  var small = Math.min(window.innerWidth, window.innerHeight) < 700 || (navigator.hardwareConcurrency || 8) <= 4;
  if (canvas && window.KeniusGL && !Q.has('nogl')) {
    try { engine = window.KeniusGL.create(canvas, { small: small, reduced: reduce, preserve: Q.has('shot') }); } catch (err) { engine = null; }
  }
  doc.classList.add(engine ? 'has-gl' : 'no-gl');

  var scenes = $$('[data-form], [data-forms]').map(function (el) {
    var forms = (el.getAttribute('data-forms') || el.getAttribute('data-form')).split(/\s+/);
    var stage = el.classList.contains('stage') ? el : $('.stage', el);
    return {
      el: el, stage: stage || el, forms: forms, idx: 0, hover: -1,
      rows: el.hasAttribute('data-forms') ? $$('.svc-row', el) : null,
      pin: $('.svc-pin', el),
      selItems: el.getAttribute('data-sel') ? $$(el.getAttribute('data-sel'), el) : null,
      dawn: parseFloat(el.getAttribute('data-dawn') || '0')
    };
  });

  // services list: hover / focus previews a formation, scroll picks by progress
  scenes.forEach(function (sc) {
    if (!sc.rows) return;
    sc.rows.forEach(function (row, i) {
      row.addEventListener('mouseenter', function () { sc.hover = i; });
      row.addEventListener('mouseleave', function () { sc.hover = -1; });
      row.addEventListener('focus', function () { sc.hover = i; });
      row.addEventListener('blur', function () { sc.hover = -1; });
    });
  });
  scenes.forEach(function (sc) {
    if (!sc.selItems) return;
    sc.sel = -1;
    sc.selItems.forEach(function (li, i) {
      li.addEventListener('mouseenter', function () { sc.selHover = i; });
      li.addEventListener('mouseleave', function () { sc.selHover = -1; });
    });
  });

  var vw = window.innerWidth, vh = window.innerHeight;
  var active = null;

  function sceneState(sc) {
    // which formation inside a multi-formation scene
    if (sc.rows) {
      var idx = 0;
      var pinned = sc.pin && getComputedStyle(sc.pin).position === 'sticky';
      if (pinned) {
        var r = sc.el.getBoundingClientRect();
        var span = Math.max(1, r.height - vh);
        idx = clamp(Math.floor(clamp(-r.top / span, 0, 0.9999) * sc.forms.length), 0, sc.forms.length - 1);
      } else {
        var best = 1e9;
        sc.rows.forEach(function (row, i) {
          var rr = row.getBoundingClientRect();
          var d = Math.abs(rr.top + rr.height / 2 - vh * 0.5);
          if (d < best) { best = d; idx = i; }
        });
      }
      if (sc.hover >= 0) idx = sc.hover;
      if (idx !== sc.idx || !sc.marked) {
        sc.idx = idx; sc.marked = true;
        sc.rows.forEach(function (row, i) { row.classList.toggle('is-on', i === idx); });
      }
    }
    if (sc.selItems) {
      var sel = -1, bestD = vh * 0.22;
      sc.selItems.forEach(function (li, i) {
        var rr = li.getBoundingClientRect();
        var d = Math.abs(rr.top + rr.height / 2 - vh * 0.5);
        if (d < bestD) { bestD = d; sel = i; }
      });
      if (sc.selHover >= 0) sel = sc.selHover;
      if (sel !== sc.sel) {
        sc.sel = sel;
        sc.selItems.forEach(function (li, i) { li.classList.toggle('is-on', i === sel); });
      }
    }
    return sc.forms[sc.idx] || sc.forms[0];
  }

  function pickScene() {
    var best = null, bestA = -1;
    var a0 = vh * 0.28, a1 = vh * 0.72;
    scenes.forEach(function (sc) {
      var r = sc.el.getBoundingClientRect();
      var ov = Math.min(r.bottom, a1) - Math.max(r.top, a0);
      if (ov > bestA) { bestA = ov; best = sc; }
    });
    return bestA > 0 ? best : (best || scenes[0]);
  }

  // camera that frames `form` inside the stage box of scene `sc`
  function fitFor(sc, form) {
    var P = PRESET[form] || PRESET.dust;
    var H = ch || vh;
    var r = P.viewport ? { left: 0, top: 0, width: vw, height: vh } : sc.stage.getBoundingClientRect();
    var w = Math.max(r.width, 40), h = Math.max(r.height, 40);
    var fov = 34;
    var f = 1 / Math.tan(fov * Math.PI / 360);
    var dist = f * H / 2 * Math.max(P.ex / (w / 2), P.ey / (h / 2));
    return {
      dist: clamp(dist, 4.5, 40),
      sx: ((r.left + w / 2) / vw) * 2 - 1,
      sy: 1 - ((r.top + h / 2) / H) * 2,
      yaw: P.yaw, pitch: P.pitch, ap: P.ap, exp: P.exp, dawn: sc.dawn || 0
    };
  }

  /* ------------------------------------------------------------ engine */
  if (!engine) {
    // no particles: keep the scroll-driven list states alive
    var ticking = false;
    var upd = function () { ticking = false; vh = window.innerHeight; scenes.forEach(sceneState); };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
    return;
  }

  var S = engine.state;
  var labelsRoot = $('.gl-labels');
  var labelEls = [];
  var fixedDpr = Q.get('dpr') ? parseFloat(Q.get('dpr')) : 0;
  var baseDpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
  var dprScale = 1;
  var dpr = fixedDpr || baseDpr;
  var cw = 0, ch = 0;

  function resize(force) {
    vw = window.innerWidth;
    vh = window.innerHeight;
    var w = canvas.clientWidth || vw;
    var h = canvas.clientHeight || vh;
    if (!force && w === cw && Math.abs(h - ch) < 80) return;
    cw = w; ch = h;
    dpr = fixedDpr || baseDpr * dprScale;
    engine.resize(Math.round(w * dpr), Math.round(h * dpr));
    needs = true;
  }

  var cam = null, from = null, blend = 1;
  var curForm = null, curScene = null;
  var needs = true;
  var hour = new Date().getHours() + new Date().getMinutes() / 60;
  S.hour = hour;
  if (reduce) S.time = 37.0;

  function mixCam(a, b, t) {
    var o = {};
    for (var k in b) o[k] = lerp(a[k], b[k], t);
    return o;
  }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function update(dt) {
    var sc = pickScene();
    var form = sceneState(sc);
    var target = fitFor(sc, form);
    var first = !cam;
    if (first) {
      // the first frame starts from scattered dust; the next one asks for the real formation
      cam = target; curScene = sc;
      curForm = reduce ? form : 'dust';
      engine.setForm(curForm, true);
    }
    if (!first && (sc !== curScene || form !== curForm)) {
      from = cam; blend = 0;
      curScene = sc;
      if (form !== curForm) { curForm = form; engine.setForm(form, reduce); }
    }
    if (blend < 1) {
      blend = reduce ? 1 : Math.min(1, blend + dt / 1.15);
      cam = mixCam(from, target, ease(blend));
    } else {
      cam = target;
    }
    var c = S.cam;
    c.dist = cam.dist; c.sx = cam.sx; c.sy = cam.sy; c.yaw = cam.yaw; c.pitch = cam.pitch;
    c.focus = cam.dist; c.aperture = cam.ap; c.fov = 34;
    S.exposure = cam.exp;
    S.dawn = cam.dawn;
    if (sc.selItems) S.sel = sc.sel; else S.sel = -1;
  }

  function updateLabels() {
    if (!labelsRoot) return;
    var fn = LABELS[curForm];
    var list = fn && blend >= 1 ? fn(S.time, hour) : [];
    while (labelEls.length < list.length) {
      var el = document.createElement('span');
      el.className = 'gl-label';
      labelsRoot.appendChild(el);
      labelEls.push(el);
    }
    labelEls.forEach(function (el, i) {
      var L = list[i];
      if (!L) { el.classList.remove('is-on'); return; }
      var p = engine.project(L.p, vw, ch || vh);
      if (!p || p[0] < -200 || p[0] > vw + 200 || p[1] < -50 || p[1] > vh + 50) { el.classList.remove('is-on'); return; }
      if (el.textContent !== L.text) el.textContent = L.text;
      if (L.tone) el.setAttribute('data-tone', L.tone); else el.removeAttribute('data-tone');
      var w = el.offsetWidth, hgt = el.offsetHeight;
      var x = clamp(L.anchor === 'left' ? p[0] + 8 : p[0] - w / 2, 8, vw - w - 8);
      var y = clamp(p[1] - hgt / 2, 8, (ch || vh) - hgt - 8);
      el.style.transform = 'translate3d(' + Math.round(x) + 'px,' + Math.round(y) + 'px,0)';
      el.classList.add('is-on');
    });
  }

  // pointer: parallax + a soft wake through the field (mouse only)
  var lastMove = -1e9;
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var H = ch || vh;
    S.pointer = [e.clientX / vw * 2 - 1, e.clientY / H * 2 - 1];
    S.pointerNdc = [e.clientX / vw * 2 - 1, 1 - e.clientY / H * 2];
    lastMove = performance.now();
  }, { passive: true });
  document.addEventListener('mouseleave', function () { lastMove = -1e9; });

  window.addEventListener('resize', function () { resize(false); needs = true; });
  var lastY = window.scrollY, scrollV = 0;
  window.addEventListener('scroll', function () { needs = true; }, { passive: true });
  canvas.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    running = false;
    doc.classList.remove('has-gl'); doc.classList.add('no-gl');
    if (labelsRoot) labelsRoot.innerHTML = '';
  });

  var running = true;
  var last = 0, acc = 0, frames = 0, slow = 0, fast = 0;
  function frame(ts) {
    if (!running) return;
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 1 / 60;
    last = ts;
    update(dt);
    var y = window.scrollY;
    scrollV = lerp(scrollV, Math.abs(y - lastY) / Math.max(dt, 1 / 120), 1 - Math.exp(-dt * 6));
    lastY = y;
    S.stir = clamp(scrollV / 2500, 0, 1);
    var idle = performance.now() - lastMove;
    S.mouseK = lerp(S.mouseK, idle < 1800 ? 1 : 0, 1 - Math.exp(-dt * 4));
    if (!reduce || needs || blend < 1) {
      engine.step(reduce ? 0 : dt, dpr);
      needs = false;
      updateLabels();
    }
    // adaptive resolution: hold ~50–60 fps on modest GPUs
    if (!fixedDpr && !reduce) {
      acc += dt; frames++;
      if (frames >= 45) {
        var avg = acc / frames;
        if (avg > 0.024) { slow++; fast = 0; } else if (avg < 0.0135) { fast++; slow = 0; } else { slow = fast = 0; }
        if (slow >= 2 && dprScale > 0.55) { dprScale = Math.max(0.55, dprScale * 0.82); slow = 0; resize(true); }
        if (fast >= 6 && dprScale < 1) { dprScale = Math.min(1, dprScale * 1.12); fast = 0; resize(true); }
        acc = 0; frames = 0;
      }
    }
    requestAnimationFrame(frame);
  }

  resize(true);
  requestAnimationFrame(frame);

  // keep the 24-hour ring's "now" honest on long visits
  setInterval(function () { var d = new Date(); hour = d.getHours() + d.getMinutes() / 60; S.hour = hour; needs = true; }, 60000);

  // hooks for automated screenshots
  if (Q.has('shot')) window.__overnight = {
    engine: engine,
    scenes: scenes,
    settle: function () { update(0); update(0); blend = 1; engine.setForm(curForm, true); needs = true; },
    render: function (n) {
      for (var i = 0; i < (n || 1); i++) { update(1 / 60); engine.step(reduce ? 0 : 1 / 60, dpr); }
      blend = 1; updateLabels();
    },
    setHour: function (h) { hour = h; S.hour = h; needs = true; }
  };
})();
