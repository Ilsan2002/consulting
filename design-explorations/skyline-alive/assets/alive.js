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

  var COMMON = [
    'float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }',
    'float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }',
    'float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }',
    'float h12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }',
    'vec4 h44(vec4 p) { p = fract(p * vec4(0.1031, 0.1030, 0.0973, 0.1099)); p += dot(p, p.wzxy + 33.33); return fract((p.xxyz + p.yzzw) * p.zywx); }',
    'float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(h12(i), h12(i + vec2(1, 0)), f.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), f.x), f.y); }',
    'float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s / 0.9375; }',
    'float fbm3(vec2 p) { float s = 0.0, a = 0.55; for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.07 + 11.3; a *= 0.45; } return s / 0.8339; }',
    // the dither sweep between two paintings: the sky turns first, a ragged front works down through the city
    'float sweepPick(vec2 ip, float imgH, int a, float p, float still) {',
    '  if (still > 0.5) return p;',
    '  vec2 c3 = floor(ip / 3.0);',
    '  float thr = clamp(0.68 * (ip.y / imgH) + 0.18 * vnoise(c3 / 14.0 + float(a) * 7.0) + 0.14 * bayer8(c3), 0.0, 1.0);',
    '  return step(thr, mix(-0.02, 1.02, p));',
    '}',
    // the painted sky gradient (rows 0-7) and cloud colours (rows 8-11)
    'vec3 skyCol(sampler2D lut, int f, float xf, float y) {',
    '  float u = (clamp(y, 0.0, 1.0) * 15.0 + 0.5) / 16.0;',
    '  vec3 l = texture(lut, vec2(u, (float(2 * f) + 0.5) / 12.0)).rgb;',
    '  vec3 r = texture(lut, vec2(u, (float(2 * f + 1) + 0.5) / 12.0)).rgb;',
    '  return mix(l, r, smoothstep(0.18, 0.86, xf));',
    '}',
    'vec3 cloudCol(sampler2D lut, int f, int j) { return texture(lut, vec2((float(j) + 0.5) / 16.0, (float(8 + f) + 0.5) / 12.0)).rgb; }'
  ].join('\n');

  // pass 1 — the sky, drawn on the painting's own pixel grid (one texel = 2 painting px)
  var SKY_FRAG = [
    '#version 300 es',
    'precision highp float;',
    'uniform sampler2D tLut;',
    'uniform vec2 uImg;',
    'uniform float uRidge[46];',
    'uniform int uA, uB;',
    'uniform float uP, uHour, uTime, uStill;',
    'out vec4 o;',
    COMMON,
    'float ridgeAt(float x) { float f = clamp(x / 29.0, 0.0, 44.999); int i = int(floor(f)); return mix(uRidge[i], uRidge[i + 1], fract(f)); }',
    // is there cloud in this cell? decks of cloud: flat base, lumpy top
    'float cloudAt(vec2 cell, float fl, float drift, float rY) {',
    '  float yf = (cell.y + 0.5) * 2.0 / max(rY, 1.0);',
    '  float decks = fl < 0.5 ? 4.0 : 3.0;',
    '  float yr = yf * decks + fl * 0.45;',
    '  float v = fract(yr);',
    '  float deck = floor(yr);',
    '  if (v > 0.8) return 0.0;',
    '  float lo = fl < 0.5 ? 0.22 : 0.04, hi = fl < 0.5 ? 0.86 : 0.6;',
    '  if (yf < lo || yf > hi) return 0.0;',
    '  vec2 k = fl < 0.5 ? vec2(1.0 / 70.0, 1.0 / 10.0) : vec2(1.0 / 95.0, 1.0 / 13.0);',
    '  vec2 b = vec2(cell.x - drift, cell.y) * k + vec2(deck * 13.1 + fl * 31.7, deck * 5.3);',
    '  float dens = fbm3(b) + 0.1 * vnoise(b * vec2(3.6, 2.2));',
    '  float thr = (fl < 0.5 ? 0.69 : 0.71) + (0.8 - v) * 0.15;',
    '  return (dens - thr);',
    '}',
    // a 5x3 bird in two wing positions
    'float bird(vec2 q, float flap) {',
    '  q = floor(q);',
    '  if (q.x < 0.0 || q.x > 4.0 || q.y < 0.0 || q.y > 2.0) return 0.0;',
    '  float row = flap > 0.5 ? (q.y < 0.5 ? 17.0 : q.y < 1.5 ? 10.0 : 4.0) : (q.y < 0.5 ? 0.0 : q.y < 1.5 ? 27.0 : 4.0);',
    '  return mod(floor(row / exp2(q.x)), 2.0);',
    '}',
    'void main() {',
    '  vec2 cell = floor(gl_FragCoord.xy);',                   // texel row 0 = top of the painting, as sampled by the city pass
    '  vec2 ip = (cell + 0.5) * 2.0;',
    '  float rY = ridgeAt(ip.x);',
    '  float yf = ip.y / max(rY, 1.0);',
    '  float xf = ip.x / uImg.x;',
    '  float w = sweepPick(ip, uImg.y, uA, uP, uStill);',
    '  float t = uStill > 0.5 ? 40.0 : uTime;',
    // banded gradient with dithered steps, like a hand-drawn pixel sky
    '  float yq = (floor(yf * 18.0 + (bayer4(cell) - 0.5) * 0.95) + 0.5) / 18.0;',
    '  vec3 col = mix(skyCol(tLut, uA, xf, yq), skyCol(tLut, uB, xf, yq), w);',
    '  float wNight = (uA == 0 ? 1.0 - w : 0.0) + (uB == 0 ? w : 0.0);',
    '  float wDawn = (uA == 1 ? 1.0 - w : 0.0) + (uB == 1 ? w : 0.0);',
    '  float wDay = (uA == 2 ? 1.0 - w : 0.0) + (uB == 2 ? w : 0.0);',
    '  float wSun = (uA == 3 ? 1.0 - w : 0.0) + (uB == 3 ? w : 0.0);',
    '',
    // stars
    '  float dark = wNight + 0.4 * wDawn;',
    '  if (dark > 0.01 && yf < 0.92) {',
    '    float h = h12(cell * 1.37 + 7.0);',
    '    if (h > 0.9922) {',
    '      float h2 = h12(cell + 19.0);',
    '      float tw = uStill > 0.5 ? 0.85 : 0.5 + 0.5 * sin(t * (0.7 + 2.8 * h2) + h2 * 60.0);',
    '      col = mix(col, vec3(0.93, 0.95, 1.0), dark * (0.35 + 0.65 * h2) * (0.35 + 0.65 * tw) * (1.0 - smoothstep(0.6, 0.92, yf)));',
    '    }',
    '  }',
    '',
    // moon: rises low on the left at dusk, highest after midnight, sets on the right at dawn
    '  float nh = mod(uHour - 19.5 + 24.0, 24.0) / 10.0;',
    '  float mvis = clamp(wNight + 0.3 * wDawn + 0.35 * wSun, 0.0, 1.0);',
    '  if (nh < 1.0 && mvis > 0.02) {',
    '    float mx = mix(0.12, 0.9, nh) * uImg.x;',
    '    vec2 mc = vec2(mx, ridgeAt(mx) * mix(0.96, 0.17, sin(nh * 3.14159))) / 2.0;',
    '    vec2 q = cell + 0.5 - mc;',
    '    float d = length(q), R = 6.5;',
    '    float halo = (1.0 - smoothstep(R, R * 2.6, d)) * mvis;',
    '    if (d > R && bayer8(cell) < halo * 0.4) col = mix(col, vec3(0.78, 0.82, 0.96), 0.22);',
    '    float lit = step(d, R) * step(R * 0.9, length(q - vec2(3.4, -1.5)));',
    '    col = mix(col, vec3(0.99, 0.96, 0.84), lit * mvis);',
    '  }',
    '',
    // the sun, low over the ridge at dawn and dusk (the city pass hides it behind the peaks)
    '  float warm = wSun + wDawn;',
    '  if (warm > 0.02) {',
    '    vec2 sc = vec2(-999.0);',
    '    if (uHour > 16.2 && uHour < 19.7) sc = vec2(0.8 * uImg.x, mix(-95.0, 45.0, (uHour - 16.2) / 3.5));',
    '    if (uHour > 4.7 && uHour < 7.9) sc = vec2(0.84 * uImg.x, mix(45.0, -95.0, (uHour - 4.7) / 3.2));',
    '    if (sc.x > 0.0) {',
    '      sc.y += ridgeAt(sc.x);',
    '      vec2 q = cell + 0.5 - sc / 2.0;',
    '      float d = length(q);',
    '      float g = exp(-d * d / 320.0);',
    '      float gq = floor(g * 5.0 + bayer4(cell)) / 5.0;',                 // glow in dithered rings
    '      col = mix(col, vec3(1.0, 0.72, 0.42), gq * 0.45 * warm);',
    '      if (d < 8.5) col = mix(col, d < 6.0 ? vec3(1.0, 0.96, 0.84) : vec3(1.0, 0.82, 0.55), warm);',
    '    }',
    '  }',
    '',
    // clouds: two decks of pixel cumulus drifting on the wind — flat bases, lumpy tops, lit from above
    '  for (int L = 0; L < 2; L++) {',
    '    float fl = float(L);',
    '    float drift = t * (fl < 0.5 ? 0.7 : 1.35);',
    '    float here = cloudAt(cell, fl, drift, rY);',
    '    if (here > 0.0) {',
    '      float up = cloudAt(cell - vec2(0.0, 1.0), fl, drift, rY);',
    '      float dn1 = cloudAt(cell + vec2(0.0, 1.0), fl, drift, rY);',
    '      float dn2 = cloudAt(cell + vec2(0.0, 2.0), fl, drift, rY);',
    // lit tops and sunlit cores, shaded undersides
    '      int j = up <= 0.0 ? 0 : ((dn1 <= 0.0 || dn2 <= 0.0) ? 2 : (here > 0.075 + (bayer4(cell) - 0.5) * 0.03 ? 0 : 1));',
    '      col = mix(cloudCol(tLut, uA, j), cloudCol(tLut, uB, j), w);',
    '    }',
    '  }',
    '',
    '  if (uStill < 0.5) {',
    // shooting stars at night
    '    if (wNight > 0.5) {',
    '      float per = 5.5;',
    '      float kk = floor(uTime / per);',
    '      float lt = uTime - kk * per;',
    '      vec4 rn = h44(vec4(kk, kk * 1.7 + 3.1, 5.3, 9.1));',
    '      if (rn.x < 0.75 && lt < 1.2) {',
    '        vec2 a = vec2(mix(0.12, 0.88, rn.y), mix(0.03, 0.15, rn.z)) * uImg;',
    '        vec2 dir = normalize(vec2(rn.w > 0.5 ? 1.0 : -1.0, 0.42));',
    '        float head = lt / 1.2 * 150.0;',
    '        vec2 q = ip - a;',
    '        float along = dot(q, dir), perp = abs(dot(q, vec2(-dir.y, dir.x)));',
    '        float tail = 54.0;',
    '        if (perp < 1.6 && along < head && along > head - tail) {',
    '          float f = 1.0 - (head - along) / tail;',
    '          col = mix(col, vec3(1.0, 0.97, 0.9), f * f * smoothstep(0.0, 0.15, lt) * (1.0 - smoothstep(0.9, 1.2, lt)));',
    '        }',
    '      }',
    '    }',
    // birds by day
    '    if (wDay + 0.6 * wDawn > 0.5) {',
    '      float per = 13.0;',
    '      float kk = floor(uTime / per);',
    '      float lt = uTime - kk * per;',
    '      vec4 rn = h44(vec4(kk + 11.0, kk * 2.3, 1.9, 4.4));',
    '      float dirx = rn.x > 0.5 ? 1.0 : -1.0;',
    '      vec2 base = vec2(dirx > 0.0 ? -60.0 : uImg.x + 60.0, mix(0.07, 0.2, rn.y) * uImg.y);',
    '      for (int i = 0; i < 4; i++) {',
    '        float fi = float(i);',
    '        vec2 pos = base + vec2(dirx * (lt * 95.0 - fi * 16.0), fi * 7.0 - abs(fi - 1.5) * 5.0 + 3.0 * sin(lt * 2.0 + fi));',
    '        float flap = step(0.5, fract(lt * 3.2 + fi * 0.37));',
    '        vec2 q = (ip - pos) / 2.0;',
    '        if (dirx < 0.0) q.x = 4.0 - q.x;',
    '        col = mix(col, vec3(0.1, 0.12, 0.17), bird(q, flap) * 0.85);',
    '      }',
    '    }',
    '  }',
    '  o = vec4(col, 1.0);',
    '}'
  ].join('\n');

  // pass 2 — the city: paintings with depth parallax, wind, lights, mist and people; the sky pass shows above the ridge
  var MAIN_FRAG = [
    '#version 300 es',
    'precision highp float;',
    'uniform sampler2D tNight, tDawn, tDay, tSunset, tLights, tMeta, tScene, tSky, tLut;',
    'uniform vec2 uRes, uImg, uPos, uCam;',
    'uniform float uFrameH, uBandTop, uBand, uPx, uZoom, uShift, uWind;',
    'uniform int uA, uB;',
    'uniform float uP, uHour, uTime, uStill;',
    'uniform vec3 uPage;',
    'uniform vec4 uBandTint;',
    'out vec4 o;',
    COMMON,
    // how many of the city\'s lights are on at this hour; a light is on if its id is below this
    'float windowsOn(float h) {',
    '  if (h >= 12.0) return smoothstep(17.3, 20.2, h) * mix(0.92, 0.6, smoothstep(22.0, 24.0, h));',
    '  float p = mix(0.6, 0.28, smoothstep(0.0, 3.5, h)) + 0.3 * smoothstep(4.6, 6.4, h);',
    '  return clamp(p * (1.0 - smoothstep(6.6, 8.2, h)), 0.0, 1.0);',
    '}',
    'float lampsOn(float h, float r) {',
    '  return h >= 12.0 ? smoothstep(18.2 + r * 0.9, 18.35 + r * 0.9, h) : 1.0 - smoothstep(6.0 + r * 0.6, 6.15 + r * 0.6, h);',
    '}',
    'float lightK(vec4 m, float h, bool night) {',
    '  float kind = m.g * 255.0, r = m.r;',
    '  if (kind > 250.0) return 0.0;',                              // painted stars: the sky pass draws its own
    '  if (kind > 160.0) return lampsOn(h, r) * mix(1.0, 0.86 + 0.14 * sin(uTime * 2.1 + r * 6.3), 1.0 - uStill);',
    '  if (kind > 100.0) {',
    '    float on = step(r, windowsOn(h));',
    '    float tv = r > 0.9 ? 0.72 + 0.28 * sin(uTime * 11.0 + r * 50.0) * sin(uTime * 6.1 + r * 17.0) : 1.0;',
    '    return on * mix(1.0, tv, 1.0 - uStill);',
    '  }',
    '  if (kind > 30.0) return lampsOn(h, r * 0.4);',
    '  return 0.0;',
    '}',
    'vec3 painting(int f, vec2 uv, vec3 lights, vec4 meta) {',
    '  if (f == 0) return texture(tNight, uv).rgb + lights * lightK(meta, uHour, true);',
    '  if (f == 1) return texture(tDawn, uv).rgb;',
    '  if (f == 2) return texture(tDay, uv).rgb;',
    '  return texture(tSunset, uv).rgb + lights * lightK(meta, uHour, false) * 0.9;',
    '}',
    // a 3x5 walker, two leg positions: head, shoulders, body, legs
    'float walker(vec2 q, float stepF, out int part) {',
    '  part = 0;',
    '  if (q.x < 0.0 || q.x > 2.0 || q.y < 0.0 || q.y > 4.0) return 0.0;',
    '  float row = q.y < 0.5 ? 2.0 : q.y < 1.5 ? 7.0 : q.y < 2.5 ? 2.0 : q.y < 3.5 ? 2.0 : (stepF > 0.5 ? 5.0 : 2.0);',
    '  part = q.y < 0.5 ? 1 : (q.y < 2.5 ? 2 : 3);',
    '  return mod(floor(row / exp2(q.x)), 2.0);',
    '}',
    '',
    'void main() {',
    '  vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);',
    '  vec2 frame = vec2(uRes.x, uFrameH);',
    '  float sc = max(frame.x / uImg.x, frame.y / uImg.y) * uZoom;',
    '  vec2 off = (frame - uImg * sc) * uPos;',
    '  vec2 ip = (fc - vec2(0.0, uBandTop) - off - vec2(0.0, uShift)) / sc;',
    '',
    // depth parallax: near things (trees) move more than the city, the city more than the peaks
    '  float d0 = texture(tScene, clamp(ip / uImg, 0.0, 1.0)).r;',
    '  vec2 ipw = ip + d0 * uCam;',
    '  float d1 = texture(tScene, clamp(ipw / uImg, 0.0, 1.0)).r;',
    '  ipw = ip + d1 * uCam;',
    // wind in the foreground trees, stepped at 8 frames a second like hand-drawn animation
    '  vec4 sc0 = texture(tScene, clamp(ipw / uImg, 0.0, 1.0));',
    '  float ts = floor(uTime * 8.0) / 8.0;',
    '  float gust = 1.0 + 0.7 * max(0.0, sin(ts * 0.37));',
    '  ipw.x += sc0.b * uWind * gust * (sin(ts * 1.9 + ipw.y * 0.045 + ipw.x * 0.006) * 1.3 + sin(ts * 3.1 + ipw.x * 0.021) * 0.6);',
    '  vec2 uv = clamp(ipw / uImg, 0.0, 1.0);',
    '  vec4 scn = texture(tScene, uv);',
    '  float w = sweepPick(ipw, uImg.y, uA, uP, uStill);',
    '  float wNight = (uA == 0 ? 1.0 - w : 0.0) + (uB == 0 ? w : 0.0);',
    '  float wDawn = (uA == 1 ? 1.0 - w : 0.0) + (uB == 1 ? w : 0.0);',
    '  float wDay = (uA == 2 ? 1.0 - w : 0.0) + (uB == 2 ? w : 0.0);',
    '  float wSun = (uA == 3 ? 1.0 - w : 0.0) + (uB == 3 ? w : 0.0);',
    '  vec3 col;',
    '  if (scn.g > 0.5) {',
    '    col = texture(tSky, uv).rgb;',
    '  } else {',
    '    vec3 lights = texture(tLights, uv).rgb;',
    '    vec4 meta = texture(tMeta, uv);',
    '    vec3 A = painting(uA, uv, lights, meta);',
    '    vec3 B = painting(uB, uv, lights, meta);',
    '    col = uStill > 0.5 ? mix(A, B, uP) : (w > 0.5 ? B : A);',
    '',
    // morning mist settling over the city at the foot of the mountains
    '    float mistK = smoothstep(4.6, 5.8, uHour) * (1.0 - smoothstep(8.2, 9.8, uHour)) + 0.35 * smoothstep(18.8, 19.8, uHour) * (1.0 - smoothstep(21.4, 22.6, uHour));',
    '    float dz = scn.r;',
    '    float mband = smoothstep(0.1, 0.2, dz) * (1.0 - smoothstep(0.36, 0.5, dz)) * (1.0 - scn.b);',
    '    if (mistK * mband > 0.01) {',
    '      vec2 mc = floor(ipw / 2.0);',
    '      float n = fbm(vec2(mc.x / 110.0 - (uStill > 0.5 ? 0.0 : uTime * 0.05), mc.y / 16.0));',
    '      float m = clamp((n - 0.38) * 2.2, 0.0, 1.0) * mband * mistK;',
    '      float q = floor(m * 4.0 + bayer8(mc)) / 4.0;',
    '      vec3 hz = mix(skyCol(tLut, uA, uv.x, 0.97), skyCol(tLut, uB, uv.x, 0.97), w);',
    '      col = mix(col, mix(hz, vec3(0.85, 0.87, 0.92), 0.35), q * 0.5);',
    '    }',
    '',
    // people crossing the square; hidden behind the foreground trees
    '    if (uStill < 0.5 && scn.b < 0.2 && ipw.y > 670.0 && ipw.y < 752.0) {',
    '      float crowd = smoothstep(6.3, 7.3, uHour) * (1.0 - smoothstep(22.2, 23.2, uHour));',
    '      float light = 0.3 + 0.7 * clamp(wDay + 0.75 * wDawn + 0.8 * wSun, 0.0, 1.0);',
    '      for (int i = 0; i < 10; i++) {',
    '        float fi = float(i);',
    '        vec4 rn = h44(vec4(fi, fi * 3.1 + 1.0, 7.0, 2.0));',
    '        if (rn.w > crowd * 1.05) continue;',
    '        float laneY = i < 4 ? 744.0 : (i < 7 ? 728.0 : 690.0);',
    '        float x0 = i < 4 ? 612.0 : 614.0;',
    '        float x1 = i < 4 ? 1102.0 : 872.0;',
    '        float dir = rn.x > 0.5 ? 1.0 : -1.0;',
    '        float span = x1 - x0;',
    '        float x = x0 + mod(rn.z * span + dir * mix(5.0, 10.0, rn.y) * uTime, span);',
    '        vec2 q = floor((ipw - vec2(x - 3.0, laneY + (rn.w - 0.5) * 5.0 - 10.0)) / 2.0);',
    '        if (dir < 0.0) q.x = 2.0 - q.x;',
    '        int part;',
    '        float hit = walker(q, step(0.5, fract(uTime * 2.4 + rn.y)), part);',
    '        if (hit > 0.5) {',
    '          vec3 shirt = vec3[5](vec3(0.18, 0.24, 0.42), vec3(0.62, 0.16, 0.14), vec3(0.86, 0.84, 0.78), vec3(0.2, 0.42, 0.28), vec3(0.8, 0.62, 0.2))[int(rn.y * 4.99)];',
    '          vec3 pc = part == 1 ? vec3(0.86, 0.66, 0.5) : (part == 2 ? shirt : vec3(0.16, 0.17, 0.22));',
    '          col = pc * light;',
    '        }',
    '      }',
    '    }',
    '  }',
    '',
    // lamp halos after dark
    '  float nightK = wNight + 0.6 * wSun * smoothstep(18.3, 19.5, uHour);',
    '  if (nightK > 0.01) {',
    '    vec3 g = vec3(0.0);',
    '    for (int i = 0; i < 12; i++) {',
    '      float a = float(i) * 2.39996;',
    '      float rr = 3.0 + 9.0 * fract(float(i) * 0.618);',
    '      g += texture(tLights, clamp((ipw + rr * vec2(cos(a), sin(a))) / uImg, 0.0, 1.0)).rgb;',
    '    }',
    '    col += g / 12.0 * 0.55 * nightK * lampsOn(uHour, 0.5) * (1.0 - scn.g);',
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

  // the mountain ridge (painting px, every 29 px), from tools/bake-scene.py
  var RIDGE = [241, 231, 221, 233, 237, 250, 246, 250, 259, 260, 255, 268, 276, 272, 278, 281, 274, 275, 288, 296, 305, 303, 302,
    311, 301, 313, 321, 324, 319, 316, 328, 333, 334, 344, 337, 344, 357, 367, 358, 365, 375, 368, 367, 367, 369, 369];

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function link(gl, fs, names) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {};
    names.forEach(function (n) { u[n] = gl.getUniformLocation(p, n); });
    return { p: p, u: u };
  }

  var IMG_DIR = (function () {
    var css = $('link[rel="stylesheet"][href*="skyline"]');
    return css ? css.getAttribute('href').replace(/skyline[^/]*$/, 'img/') : 'assets/img/';
  })();

  // one renderer per canvas: the hero or the footer
  function Sky(canvas, opts) {
    var gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: Q.has('shot') });
    if (!gl) throw new Error('no webgl2');
    var sky = link(gl, SKY_FRAG, ['tLut', 'uImg', 'uRidge', 'uA', 'uB', 'uP', 'uHour', 'uTime', 'uStill']);
    var main = link(gl, MAIN_FRAG, ['tNight', 'tDawn', 'tDay', 'tSunset', 'tLights', 'tMeta', 'tScene', 'tSky', 'tLut',
      'uRes', 'uImg', 'uPos', 'uCam', 'uFrameH', 'uBandTop', 'uBand', 'uPx', 'uZoom', 'uShift', 'uWind',
      'uA', 'uB', 'uP', 'uHour', 'uTime', 'uStill', 'uPage', 'uBandTint']);
    var vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // the sky pass target: one texel per painting pixel-pair
    var SW = 653, SH = 408;
    var skyTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + 7);
    gl.bindTexture(gl.TEXTURE_2D, skyTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, SW, SH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(function (k) { gl.texParameteri(gl.TEXTURE_2D, k, gl.NEAREST); });
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, skyTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var names = opts.frames;
    var units = { tNight: 0, tDawn: 1, tDay: 2, tSunset: 3, tLights: 4, tMeta: 5, tScene: 6, tLut: 8 };
    var files = {
      tNight: 'alive-night-off.webp', tDawn: names.dawn, tDay: names.day, tSunset: names.sunset,
      tLights: 'alive-lights.png', tMeta: 'alive-meta.png', tScene: 'alive-scene.png', tLut: 'alive-sky.png'
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

      // pass 1: the sky
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, SW, SH);
      gl.useProgram(sky.p);
      gl.uniform1i(sky.u.tLut, units.tLut);
      gl.uniform2f(sky.u.uImg, 1305, 816);
      gl.uniform1fv(sky.u.uRidge, RIDGE);
      gl.uniform1i(sky.u.uA, s.a);
      gl.uniform1i(sky.u.uB, s.b);
      gl.uniform1f(sky.u.uP, s.p);
      gl.uniform1f(sky.u.uHour, s.hour);
      gl.uniform1f(sky.u.uTime, s.time);
      gl.uniform1f(sky.u.uStill, reduceMotion ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // pass 2: the city, with the sky showing above the ridge
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.useProgram(main.p);
      Object.keys(units).forEach(function (k) { gl.uniform1i(main.u[k], units[k]); });
      gl.uniform1i(main.u.tSky, 7);
      gl.uniform2f(main.u.uRes, w, h);
      gl.uniform2f(main.u.uImg, 1305, 816);
      gl.uniform2f(main.u.uPos, opts.pos[0], opts.pos[1]);
      gl.uniform2f(main.u.uCam, s.cam[0], s.cam[1]);
      gl.uniform1f(main.u.uFrameH, (canvas.clientHeight - opts.bandBelow - opts.bandAbove) * dpr);
      gl.uniform1f(main.u.uBandTop, opts.bandAbove * dpr);
      gl.uniform1f(main.u.uBand, (opts.bandBelow || opts.bandAbove) * dpr);
      gl.uniform1f(main.u.uPx, dpr);
      gl.uniform1f(main.u.uZoom, s.zoom);
      gl.uniform1f(main.u.uShift, s.shift * dpr);
      gl.uniform1f(main.u.uWind, reduceMotion ? 0 : 1);
      gl.uniform1i(main.u.uA, s.a);
      gl.uniform1i(main.u.uB, s.b);
      gl.uniform1f(main.u.uP, s.p);
      gl.uniform1f(main.u.uHour, s.hour);
      gl.uniform1f(main.u.uTime, s.time);
      gl.uniform1f(main.u.uStill, reduceMotion ? 1 : 0);
      gl.uniform3f(main.u.uPage, 250 / 255, 250 / 255, 250 / 255);
      gl.uniform4f(main.u.uBandTint, opts.tint[0] / 255, opts.tint[1] / 255, opts.tint[2] / 255, opts.tint[3]);
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
  var pointer = [0, 0], look = [0, 0];
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || reduceMotion) return;
    pointer = [e.clientX / window.innerWidth * 2 - 1, e.clientY / window.innerHeight * 2 - 1];
  }, { passive: true });
  var heroVisible = true, footVisible = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { heroVisible = e.isIntersecting; }); if (heroVisible) kick(); }).observe(hero || document.body);
    var footEl = $('.foot');
    if (footEl) new IntersectionObserver(function (es) { es.forEach(function (e) { footVisible = e.isIntersecting; }); if (footVisible) kick(); }, { rootMargin: '80px 0px' }).observe(footEl);
  }

  function sceneState(hour, time) {
    var s = segmentAt(hour);
    return { a: s.a, b: s.b, p: reduceMotion ? clamp(s.t, 0, 1) : sweep(s.t), hour: wrap24(hour), time: time, zoom: 1, shift: 0, cam: [0, 0] };
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
        var k = 1 - Math.exp(-dt * 4);
        look[0] += (pointer[0] - look[0]) * k;
        look[1] += (pointer[1] - look[1]) * k;
        s.zoom = 1.02 + 0.012 * (0.5 - 0.5 * Math.cos(time * 0.08)) + clamp(y / hh, 0, 1) * 0.03;
        s.shift = clamp(y, 0, hh) * 0.25;
        // depth parallax: the pointer looks around (desktop), scrolling lifts the near trees
        s.cam = [look[0] * 7, look[1] * 4 + clamp(y / hh, 0, 1) * 12];
        heroSky.render(s);
      }
      if (footSky && footSky.ready && footVisible) {
        // the footer is night, always: the same lights, stars and shooting stars
        footSky.render({ a: 0, b: 0, p: 0, hour: 23.2, time: time + 17, zoom: 1, shift: 0, cam: [look[0] * 4, 0] });
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
