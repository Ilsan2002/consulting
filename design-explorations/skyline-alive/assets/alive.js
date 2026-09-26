/* Kenius — "Skyline Alive" exploration.
   The live Skyline, same paintings, same page — but the sky machine runs on
   WebGL2: the four paintings dissolve into each other with an ordered pixel
   dither, city windows switch on one by one at dusk and off through the night,
   lamps glow, stars twinkle, the odd shooting star crosses the sky and birds
   cross it by day. Scroll (or drag the hero) to move the clock. The agent log
   fires its entries as the sky's clock passes their hour.
   Without WebGL2 it falls back to the live image cross-fade; with reduced
   motion it paints the visitor's actual time of day, once, and stays still. */

(function () {
  'use strict';

  var doc = document.documentElement;
  var Q = new URLSearchParams(location.search);
  var LANG = (doc.lang || 'en').toLowerCase().slice(0, 2);
  var RU = LANG === 'ru';
  var reduceMotion = Q.has('reduced') || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduceMotion) doc.classList.add('reduce');
  if (Q.has('shot')) doc.classList.add('shot');

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function wrap24(h) { return ((h % 24) + 24) % 24; }
  function fmt(hour) {
    var h = Math.floor(wrap24(hour));
    var m = Math.floor((wrap24(hour) - h) * 60);
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  /* ------------------------------------------------------------ the day */

  // key paintings and the hour each one owns (same as the live site)
  var FRAMES = [
    { id: 'night', at: 1 },
    { id: 'dawn', at: 5.5 },
    { id: 'day', at: 12.5 },
    { id: 'sunset', at: 18 }
  ];

  // which two paintings, and how far between them, at a given hour
  function segmentAt(hour) {
    var h = wrap24(hour);
    for (var i = 0; i < FRAMES.length; i++) {
      var a = FRAMES[i], b = FRAMES[(i + 1) % FRAMES.length];
      var bAt = b.at <= a.at ? b.at + 24 : b.at;
      var hh = h < a.at ? h + 24 : h;
      if (hh >= a.at && hh <= bAt) return { a: i, b: (i + 1) % FRAMES.length, t: (hh - a.at) / (bAt - a.at) };
    }
    return { a: 0, b: 1, t: 0 };
  }
  // hold each painting, then sweep to the next through the middle of the gap
  function sweep(t) { var x = clamp((t - 0.22) / 0.56, 0, 1); return x * x * (3 - 2 * x); }

  /* -------------------------------------------------------- agent log */

  // Illustrative entries — typical builds and patterns, not client case studies.
  var EVENTS_EN = [
    { at: 2 + 14 / 60, t: '02:14', html: '&ldquo;No heat &mdash; unit 4B.&rdquo; <b>&rarr; tech dispatched</b>' },
    { at: 6 + 39 / 60, t: '06:39', html: '&ldquo;Still need my W-2?&rdquo; <b>&rarr; docs collected</b>' },
    { at: 10 + 5 / 60, t: '10:05', html: '&ldquo;Where&rsquo;s my order?&rdquo; <b>&rarr; resolved, no queue</b>' },
    { at: 13 + 27 / 60, t: '13:27', html: '41 invoices read &amp; reconciled <b>&rarr; 2 flagged for review</b>' },
    { at: 18 + 22 / 60, t: '18:22', html: 'Portal lead, pre-approved <b>&rarr; tour booked</b>' },
    { at: 23 + 58 / 60, t: '23:58', html: 'Missed call: furnace out <b>&rarr; tech en route</b>' }
  ];
  var EVENTS_RU = [
    { at: 2 + 14 / 60, t: '02:14', html: '&laquo;Нет тепла &mdash; кв. 4Б.&raquo; <b>&rarr; мастер выехал</b>' },
    { at: 6 + 39 / 60, t: '06:39', html: '&laquo;Нужна справка о доходах?&raquo; <b>&rarr; документы собраны</b>' },
    { at: 10 + 5 / 60, t: '10:05', html: '&laquo;Где мой заказ?&raquo; <b>&rarr; решено, без очереди</b>' },
    { at: 13 + 27 / 60, t: '13:27', html: '41 счёт прочитан и сверен <b>&rarr; 2 на проверку</b>' },
    { at: 18 + 22 / 60, t: '18:22', html: 'Заявка с портала, одобрена <b>&rarr; показ назначен</b>' },
    { at: 23 + 58 / 60, t: '23:58', html: 'Пропущенный: не работает котёл <b>&rarr; мастер в пути</b>' }
  ];
  var EVENTS = RU ? EVENTS_RU : EVENTS_EN;
  var clockEl = $('#agent-clock');
  var evtEl = $('#agent-evt');
  var currentEvt = -1;
  var lastClock = '';

  function eventIndexFor(hour) {
    var h = wrap24(hour), idx = EVENTS.length - 1;
    for (var i = 0; i < EVENTS.length; i++) if (EVENTS[i].at <= h) idx = i;
    return idx;
  }
  function setEvent(i, animate) {
    if (i === currentEvt || !evtEl) return;
    currentEvt = i;
    var e = EVENTS[i];
    var swap = function () {
      evtEl.innerHTML = '<span class="evt-t">' + e.t + '</span> <span class="evt-x">' + e.html + '</span>';
      evtEl.classList.remove('is-out');
    };
    if (animate && !reduceMotion) { evtEl.classList.add('is-out'); setTimeout(swap, 360); } else swap();
  }
  function showClock(hour) {
    var c = fmt(hour);
    if (c !== lastClock && clockEl) { clockEl.textContent = c; lastClock = c; }
  }

  /* ---------------------------------------------------------- the clock */

  var now = new Date();
  var realHour = now.getHours() + now.getMinutes() / 60;
  var DAY_SECONDS = 40;                 // one timelapse day
  var SPEED = 24 / DAY_SECONDS;         // scene hours per real second
  var sceneHour = realHour;
  var scrub = 0, scrubTarget = 0, drag = 0;

  /* ============================================================ WebGL */

  var VERT = [
    '#version 300 es',
    'layout(location = 0) in vec2 aPos;',
    'void main() { gl_Position = vec4(aPos, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    '#version 300 es',
    'precision highp float;',
    'uniform sampler2D tNight, tDawn, tDay, tSunset, tLights, tMeta;',
    'uniform vec2 uRes;       // canvas px',
    'uniform vec2 uImg;       // painting px',
    'uniform vec2 uPos;       // object-position',
    'uniform float uFrameH;   // px of the canvas that belong to the hero frame (the rest is the dissolve band)',
    'uniform float uBandTop;  // px of dissolve band above the frame (footer)',
    'uniform float uBand;     // dissolve band height, px',
    'uniform float uPx;       // device pixels per css pixel',
    'uniform float uZoom;',
    'uniform float uShift;    // parallax, px',
    'uniform int uA, uB;      // paintings either side of now',
    'uniform float uP;        // sweep progress between them',
    'uniform float uHour;',
    'uniform float uTime;',
    'uniform float uStill;    // reduced motion: soft blend, no flicker',
    'uniform vec3 uPage;      // page background the edge dissolves into',
    'uniform vec4 uBandTint;  // the scrim colour + strength at that edge, so the band continues it',
    'out vec4 o;',
    '',
    'float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }',
    'float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }',
    'float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }',
    'float h12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }',
    'vec4 h44(vec4 p) { p = fract(p * vec4(0.1031, 0.1030, 0.0973, 0.1099)); p += dot(p, p.wzxy + 33.33); return fract((p.xxyz + p.yzzw) * p.zywx); }',
    'float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(h12(i), h12(i + vec2(1, 0)), f.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), f.x), f.y); }',
    '',
    // how many of the city\'s lights are on at this hour; a light is on if its id is below this
    'float windowsOn(float h) {',
    '  if (h >= 12.0) return smoothstep(17.3, 20.2, h) * mix(0.92, 0.6, smoothstep(22.0, 24.0, h));',
    '  float p = mix(0.6, 0.28, smoothstep(0.0, 3.5, h)) + 0.3 * smoothstep(4.6, 6.4, h);',
    '  return clamp(p * (1.0 - smoothstep(6.6, 8.2, h)), 0.0, 1.0);',
    '}',
    'float lampsOn(float h, float r) {',
    '  float on = h >= 12.0 ? smoothstep(18.2 + r * 0.9, 18.35 + r * 0.9, h) : 1.0 - smoothstep(6.0 + r * 0.6, 6.15 + r * 0.6, h);',
    '  return on;',
    '}',
    'float lightK(vec4 m, float h, bool night) {',
    '  float kind = m.g * 255.0, r = m.r;',
    '  if (kind > 250.0) {',                                    // star
    '    if (!night) return 0.0;',
    '    float tw = 0.5 + 0.5 * sin(uTime * (1.3 + r * 3.1) + r * 43.0);',
    '    return mix(1.0, 0.25 + 0.95 * tw * tw, 1.0 - uStill);',
    '  }',
    '  if (kind > 160.0) {',                                    // lamp
    '    return lampsOn(h, r) * mix(1.0, 0.86 + 0.14 * sin(uTime * 2.1 + r * 6.3), 1.0 - uStill);',
    '  }',
    '  if (kind > 100.0) {',                                    // window
    '    float on = step(r, windowsOn(h));',
    '    float tv = r > 0.9 ? 0.72 + 0.28 * sin(uTime * 11.0 + r * 50.0) * sin(uTime * 6.1 + r * 17.0) : 1.0;',
    '    return on * mix(1.0, tv, 1.0 - uStill);',
    '  }',
    '  if (kind > 30.0) return lampsOn(h, r * 0.4);',            // floodlit architecture
    '  return 0.0;',
    '}',
    '',
    'vec3 painting(int f, vec2 uv, vec3 lights, vec4 meta) {',
    '  if (f == 0) return texture(tNight, uv).rgb + lights * lightK(meta, uHour, true);',
    '  if (f == 1) return texture(tDawn, uv).rgb;',
    '  if (f == 2) return texture(tDay, uv).rgb;',
    '  float dusk = meta.g * 255.0 > 250.0 ? 0.0 : lightK(meta, uHour, false);',
    '  return texture(tSunset, uv).rgb + lights * dusk * 0.9;',
    '}',
    '',
    // a 5x3 bird sprite in two wing positions, drawn on the painting's pixel grid
    'float bird(vec2 q, float flap) {',
    '  q = floor(q);',
    '  if (q.x < 0.0 || q.x > 4.0 || q.y < 0.0 || q.y > 2.0) return 0.0;',
    '  float row = flap > 0.5 ? (q.y < 0.5 ? 17.0 : q.y < 1.5 ? 10.0 : 4.0) : (q.y < 0.5 ? 0.0 : q.y < 1.5 ? 27.0 : 4.0);',
    '  return mod(floor(row / exp2(q.x)), 2.0);',
    '}',
    '',
    'void main() {',
    '  vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);',   // top-left origin, canvas px
    '  vec2 frame = vec2(uRes.x, uFrameH);',
    '  float sc = max(frame.x / uImg.x, frame.y / uImg.y) * uZoom;',
    '  vec2 disp = uImg * sc;',
    '  vec2 off = (frame - disp) * uPos;',
    '  vec2 ip = (fc - vec2(0.0, uBandTop) - off - vec2(0.0, uShift)) / sc;',   // painting px
    '  vec2 uv = clamp(ip / uImg, vec2(0.0), vec2(1.0));',
    '  vec2 cell = floor(ip / 2.0);',                                        // the painting\'s own pixel grid
    '',
    '  vec3 lights = texture(tLights, uv).rgb;',
    '  vec4 meta = texture(tMeta, uv);',
    '  vec3 A = painting(uA, uv, lights, meta);',
    '  vec3 B = painting(uB, uv, lights, meta);',
    '',
    // dither sweep: the sky turns first, a ragged front works down through the city
    '  vec2 cell3 = floor(ip / 3.0);',
    '  float thr = clamp(0.68 * uv.y + 0.18 * vnoise(cell3 / 14.0 + float(uA) * 7.0) + 0.14 * bayer8(cell3), 0.0, 1.0);',
    '  float p = mix(-0.02, 1.02, uP);',
    '  vec3 col = uStill > 0.5 ? mix(A, B, uP) : (thr < p ? B : A);',
    '',
    // lamp halos after dark
    '  float nightK = (uA == 0 ? 1.0 - uP : 0.0) + (uB == 0 ? uP : 0.0) + 0.6 * ((uA == 3 ? 1.0 - uP : 0.0) + (uB == 3 ? uP : 0.0)) * smoothstep(18.3, 19.5, uHour);',
    '  if (nightK > 0.01) {',
    '    vec3 g = vec3(0.0);',
    '    for (int i = 0; i < 12; i++) {',
    '      float a = float(i) * 2.39996;',
    '      float rr = 3.0 + 9.0 * fract(float(i) * 0.618);',
    '      g += texture(tLights, clamp((ip + rr * vec2(cos(a), sin(a))) / uImg, 0.0, 1.0)).rgb;',
    '    }',
    '    col += g / 12.0 * 0.55 * nightK * lampsOn(uHour, 0.5);',
    '  }',
    '',
    '  if (uStill < 0.5) {',
    // shooting stars at night, in the band above the peaks
    '    float nightOnly = (uA == 0 ? 1.0 - uP : 0.0) + (uB == 0 ? uP : 0.0);',
    '    if (nightOnly > 0.5) {',
    '      float per = 5.5;',
    '      float k = floor(uTime / per);',
    '      float lt = uTime - k * per;',
    '      vec4 rn = h44(vec4(k, k * 1.7 + 3.1, 5.3, 9.1));',
    '      if (rn.x < 0.75 && lt < 1.2) {',
    '        vec2 a = vec2(mix(0.12, 0.88, rn.y), mix(0.03, 0.15, rn.z)) * uImg;',
    '        vec2 dir = normalize(vec2(rn.w > 0.5 ? 1.0 : -1.0, 0.42));',
    '        float head = lt / 1.2 * 150.0;',
    '        vec2 q = (cell + 0.5) * 2.0 - a;',
    '        float along = dot(q, dir), perp = abs(dot(q, vec2(-dir.y, dir.x)));',
    '        float tail = 54.0;',
    '        if (perp < 1.6 && along < head && along > head - tail) {',
    '          float f = 1.0 - (head - along) / tail;',
    '          col = mix(col, vec3(1.0, 0.97, 0.9), f * f * smoothstep(0.0, 0.15, lt) * (1.0 - smoothstep(0.9, 1.2, lt)));',
    '        }',
    '      }',
    '    }',
    // birds by day, crossing the band above the peaks
    '    float dayOnly = (uA == 2 ? 1.0 - uP : 0.0) + (uB == 2 ? uP : 0.0) + (uA == 1 ? (1.0 - uP) * 0.6 : 0.0);',
    '    if (dayOnly > 0.5) {',
    '      float per = 13.0;',
    '      float k = floor(uTime / per);',
    '      float lt = uTime - k * per;',
    '      vec4 rn = h44(vec4(k + 11.0, k * 2.3, 1.9, 4.4));',
    '      float dirx = rn.x > 0.5 ? 1.0 : -1.0;',
    '      vec2 base = vec2(dirx > 0.0 ? -60.0 : uImg.x + 60.0, mix(0.07, 0.2, rn.y) * uImg.y);',
    '      for (int i = 0; i < 4; i++) {',
    '        float fi = float(i);',
    '        vec2 pos = base + vec2(dirx * (lt * 95.0 - fi * 16.0), fi * 7.0 - abs(fi - 1.5) * 5.0 + 3.0 * sin(lt * 2.0 + fi));',
    '        float flap = step(0.5, fract(lt * 3.2 + fi * 0.37));',
    '        vec2 q = (ip - pos) / 2.0;',
    '        if (dirx < 0.0) q.x = 4.0 - q.x;',
    '        float b = bird(q, flap);',
    '        col = mix(col, vec3(0.1, 0.12, 0.17), b * 0.85);',
    '      }',
    '    }',
    '  }',
    '',
    // pixel dissolve into the page: below the hero, above the footer
    '  float band = 0.0;',
    '  vec2 sc3 = floor(gl_FragCoord.xy / (3.0 * uPx));',
    '  if (uBand > 0.0) {',
    '    if (fc.y > uBandTop + uFrameH) band = (fc.y - uBandTop - uFrameH) / uBand;',
    '    if (fc.y < uBandTop) band = 1.0 - fc.y / uBandTop;',
    '  }',
    '  if (band > 0.0) {',
    '    if (bayer8(sc3) < band * 1.04) { o = vec4(uPage, 1.0); return; }',
    '    col = mix(col, uBandTint.rgb, uBandTint.a);',
    '  }',
    '  o = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  var IMG_DIR = (function () {
    var css = $('link[rel="stylesheet"][href*="skyline"]');
    return css ? css.getAttribute('href').replace(/skyline[^/]*$/, 'img/') : 'assets/img/';
  })();

  // one renderer per canvas: the hero sky or the footer night
  function Sky(canvas, opts) {
    var gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: Q.has('shot') });
    if (!gl) throw new Error('no webgl2');
    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    var U = {};
    ['tNight', 'tDawn', 'tDay', 'tSunset', 'tLights', 'tMeta', 'uRes', 'uImg', 'uPos', 'uFrameH', 'uBandTop', 'uBand', 'uPx', 'uZoom', 'uShift',
      'uA', 'uB', 'uP', 'uHour', 'uTime', 'uStill', 'uPage', 'uBandTint'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    var vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    var names = opts.frames;   // which files feed night / dawn / day / sunset
    var units = { tNight: 0, tDawn: 1, tDay: 2, tSunset: 3, tLights: 4, tMeta: 5 };
    var files = {
      tNight: 'alive-night-off.webp', tDawn: names.dawn, tDay: names.day, tSunset: names.sunset,
      tLights: 'alive-lights.png', tMeta: 'alive-meta.png'
    };
    var pending = 0;
    var self = this;
    this.ready = false;
    Object.keys(files).forEach(function (k) {
      if (!files[k]) return;
      pending++;
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () {
        var t = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + units[k]);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        var nearest = k === 'tMeta';
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, nearest ? gl.NEAREST : gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, nearest ? gl.NEAREST : gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(U[k], units[k]);
        if (--pending === 0) { self.ready = true; if (opts.onready) opts.onready(); }
      };
      img.onerror = function () { if (opts.onerror) opts.onerror(); };
      img.src = IMG_DIR + files[k];
    });

    this.gl = gl;
    this.render = function (s) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var area = canvas.clientWidth * canvas.clientHeight;
      if (area * dpr * dpr > 5.5e6) dpr = Math.max(1, Math.sqrt(5.5e6 / area));
      var w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.uRes, w, h);
      gl.uniform2f(U.uImg, 1305, 816);
      gl.uniform2f(U.uPos, opts.pos[0], opts.pos[1]);
      gl.uniform1f(U.uFrameH, (canvas.clientHeight - opts.bandBelow - opts.bandAbove) * dpr);
      gl.uniform1f(U.uBandTop, opts.bandAbove * dpr);
      gl.uniform1f(U.uBand, (opts.bandBelow || opts.bandAbove) * dpr);
      gl.uniform1f(U.uPx, dpr);
      gl.uniform1f(U.uZoom, s.zoom);
      gl.uniform1f(U.uShift, s.shift * dpr);
      gl.uniform1i(U.uA, s.a);
      gl.uniform1i(U.uB, s.b);
      gl.uniform1f(U.uP, s.p);
      gl.uniform1f(U.uHour, s.hour);
      gl.uniform1f(U.uTime, s.time);
      gl.uniform1f(U.uStill, reduceMotion ? 1 : 0);
      gl.uniform3f(U.uPage, 250 / 255, 250 / 255, 250 / 255);
      gl.uniform4f(U.uBandTint, opts.tint[0] / 255, opts.tint[1] / 255, opts.tint[2] / 255, opts.tint[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  }

  /* ------------------------------------------------------ hero wiring */

  var hero = $('.hero');
  var skyEl = $('.sky', hero);
  var layers = {};
  FRAMES.forEach(function (f) { layers[f.id] = document.getElementById('sky-' + f.id); });
  var frameFiles = {};
  FRAMES.forEach(function (f) {
    var el = layers[f.id];
    if (el) frameFiles[f.id] = el.getAttribute('src').split('/').pop();
  });

  var heroSky = null, footSky = null;
  var BAND = 44;

  function startGL() {
    if (!hero || !skyEl || Q.has('nogl')) return false;
    var c = document.createElement('canvas');
    c.className = 'sky-gl';
    c.setAttribute('aria-hidden', 'true');
    skyEl.insertBefore(c, $('.sky-scrim', skyEl));
    try {
      heroSky = new Sky(c, {
        frames: frameFiles, pos: [0.5, 0.62], bandBelow: BAND, bandAbove: 0, tint: [10, 14, 26, 0.38],
        onready: function () { doc.classList.add('alive-on'); kick(); },
        onerror: function () { stopGL(); }
      });
    } catch (e) {
      c.remove(); heroSky = null;
      return false;
    }
    c.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stopGL(); });

    var foot = $('.foot');
    if (foot) {
      var fc = document.createElement('canvas');
      fc.className = 'foot-gl';
      fc.setAttribute('aria-hidden', 'true');
      fc.style.top = -BAND + 'px';
      foot.insertBefore(fc, $('.foot-scrim', foot));
      try {
        footSky = new Sky(fc, {
          frames: { dawn: null, day: null, sunset: null }, pos: [0.5, 0.3], bandBelow: 0, bandAbove: BAND, tint: [7, 10, 20, 0.15],
          onready: function () { doc.classList.add('alive-foot'); kick(); }
        });
      } catch (e) { fc.remove(); footSky = null; }
    }
    return true;
  }
  function stopGL() {
    running = false;
    doc.classList.remove('alive-on', 'alive-foot');
    $$('.sky-gl, .foot-gl').forEach(function (c) { c.remove(); });
    heroSky = footSky = null;
    startImages();
  }

  /* -------------------------------------------- fallback: the live fade */

  function weightsAt(hour) {
    var s = segmentAt(hour);
    var x = clamp(s.t, 0, 1), k = x * x * (3 - 2 * x), out = {};
    FRAMES.forEach(function (f) { out[f.id] = 0; });
    out[FRAMES[s.a].id] = 1 - k;
    out[FRAMES[s.b].id] = k;
    return out;
  }
  var imagesMode = false;
  function paintImages(hour) {
    var w = weightsAt(hour);
    FRAMES.forEach(function (f) { if (layers[f.id]) layers[f.id].style.opacity = w[f.id]; });
  }
  function startImages() {
    if (imagesMode) return;
    imagesMode = true;
    var dayImg = layers.day;
    if (dayImg) dayImg.classList.remove('is-on');
    paintImages(sceneHour);
    if (!reduceMotion) kick();
  }

  /* --------------------------------------------------------- the loop */

  var running = false, t0 = null, lastTs = 0;
  var heroVisible = true, footVisible = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { heroVisible = e.isIntersecting; }); if (heroVisible) kick(); }).observe(hero || document.body);
    var footEl = $('.foot');
    if (footEl) new IntersectionObserver(function (es) { es.forEach(function (e) { footVisible = e.isIntersecting; }); if (footVisible) kick(); }, { rootMargin: '80px 0px' }).observe(footEl);
  }

  function sceneState(hour, time) {
    var s = segmentAt(hour);
    return { a: s.a, b: s.b, p: reduceMotion ? clamp(s.t, 0, 1) : sweep(s.t), hour: wrap24(hour), time: time, zoom: 1, shift: 0 };
  }

  function frame(ts) {
    if (!running) return;
    if (t0 === null) t0 = ts;
    var dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
    lastTs = ts;
    var time = (ts - t0) / 1000;

    // scroll moves the clock forward (up to 9 hours across the hero)
    var hh = hero ? hero.offsetHeight : window.innerHeight;
    scrubTarget = clamp(window.scrollY / hh, 0, 1.2) * 9;
    scrub += (scrubTarget - scrub) * (1 - Math.exp(-dt * 5));
    sceneHour = realHour + (reduceMotion ? 0 : time * SPEED) + scrub + drag;

    showClock(sceneHour);
    setEvent(eventIndexFor(sceneHour), true);

    if (imagesMode) {
      paintImages(sceneHour);
    } else {
      var s = sceneState(sceneHour, time);
      if (heroSky && heroSky.ready && heroVisible) {
        var y = window.scrollY;
        s.zoom = 1.015 + 0.015 * (0.5 - 0.5 * Math.cos(time * 0.08)) + clamp(y / hh, 0, 1) * 0.04;
        s.shift = clamp(y, 0, hh) * 0.32;
        heroSky.render(s);
      }
      if (footSky && footSky.ready && footVisible) {
        // the footer is night, always: the same lights, stars and shooting stars
        footSky.render({ a: 0, b: 0, p: 0, hour: 23.2, time: time + 17, zoom: 1, shift: 0 });
      }
    }
    if (reduceMotion) { running = false; return; }
    // nothing on screen to animate: rest until the hero or footer scrolls back in
    if (!imagesMode && !heroVisible && !footVisible) { running = false; return; }
    requestAnimationFrame(frame);
  }
  function kick() {
    if (running) return;
    running = true;
    lastTs = 0;
    requestAnimationFrame(frame);
  }

  // drag across the hero to scrub the day (mouse / pen)
  if (hero && !reduceMotion) {
    var dragFrom = null, dragBase = 0;
    hero.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || e.button !== 0 || e.target.closest('a, button, .agent, h1, p')) return;
      e.preventDefault();
      dragFrom = e.clientX; dragBase = drag;
      doc.classList.add('is-scrubbing');
    });
    window.addEventListener('pointermove', function (e) {
      if (dragFrom === null) return;
      drag = dragBase + (e.clientX - dragFrom) / Math.max(320, window.innerWidth) * 12;
    });
    window.addEventListener('pointerup', function () { dragFrom = null; doc.classList.remove('is-scrubbing'); });
  }
  window.addEventListener('resize', function () { if (reduceMotion) { running = false; kick(); } });
  window.addEventListener('scroll', function () { if (reduceMotion) return; kick(); }, { passive: true });

  if (!startGL()) startImages();
  // reduced motion: the visitor's actual time of day, painted once
  showClock(realHour);
  setEvent(eventIndexFor(realHour), false);
  kick();

  /* ---------------------------------------------------- page motion */

  // headings type themselves in, letter by letter, like the agent log
  function typeOn(el, delay) {
    if (reduceMotion || Q.has('shot') || el.dataset.typed) return;
    el.dataset.typed = '1';
    // screen readers get the whole heading at once; the letters are decoration
    var original = el.innerHTML;
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var chars = [];
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split('').forEach(function (ch) {
            var s = document.createElement('span');
            s.className = 'ch';
            s.setAttribute('aria-hidden', 'true');
            s.textContent = ch;
            frag.appendChild(s);
            chars.push(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') split(n);
      });
    })(el);
    el.classList.add('typing');
    var cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    var i = 0;
    var step = Math.max(14, Math.min(38, 900 / chars.length));
    setTimeout(function tick() {
      if (i < chars.length) {
        chars[i].classList.add('on');
        chars[i].after(cursor);
        i++;
        setTimeout(tick, step);
      } else {
        setTimeout(function () {
          el.classList.remove('typing');
          el.innerHTML = original;
          el.removeAttribute('aria-label');
        }, 1400);
      }
    }, delay || 0);
  }

  var rvs = $$('.rv');
  var typed = $$('.sec-head h2, .sec-cta h2');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        $$('h2', en.target).concat(en.target.matches('h2') ? [en.target] : []).forEach(function (h) {
          if (typed.indexOf(h) >= 0) typeOn(h, 120);
        });
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el) { io.observe(el); });
  } else {
    rvs.forEach(function (el) { el.classList.add('in'); });
  }
  var h1 = $('.hero-title h1');
  if (h1 && !reduceMotion && !Q.has('shot')) typeOn(h1, 250);

  /* ------------------------------------------------------------ year */
  var yr = String(new Date().getFullYear());
  $$('[data-year]').forEach(function (el) { el.textContent = yr; });

  // hooks for automated screenshots
  if (Q.has('shot')) {
    window.__alive = {
      at: function (h) { realHour = h; drag = 0; scrub = scrubTarget = 0; t0 = null; },
      state: function () { return { hour: sceneHour, gl: !!heroSky, ready: !!(heroSky && heroSky.ready), foot: !!(footSky && footSky.ready) }; }
    };
  }
})();

/* --- contact form (Web3Forms) — only runs where the form exists --- */
(function () {
  'use strict';
  var f = document.querySelector('form[data-ajax]');
  if (!f) return;
  var ok = document.getElementById('form-success');
  var sb = f.querySelector('[type="submit"]');
  var hp = f.querySelector('.hp');
  var ru = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2) === 'ru';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  f.addEventListener('submit', function (e) {
    if (hp && hp.checked) { e.preventDefault(); return; }
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    var orig = sb.innerHTML; sb.disabled = true; sb.textContent = ru ? 'Отправляем…' : 'Sending…';
    fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw 0;
        f.reset();
        if (ok) { f.hidden = true; ok.hidden = false; ok.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
      })
      .catch(function () {
        sb.disabled = false; sb.innerHTML = orig;
        var m = f.querySelector('.form-err');
        if (!m) { m = document.createElement('p'); m.className = 'form-note form-err'; m.setAttribute('role', 'alert'); m.style.color = '#b91c1c'; sb.insertAdjacentElement('afterend', m); }
        m.textContent = ru
          ? 'Не отправилось — напишите, пожалуйста, на hello@kenius.co.'
          : 'That didn’t send — please email hello@kenius.co instead.';
      });
  });
})();
