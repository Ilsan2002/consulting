/* Kenius — "Overnight" design exploration · WebGL2 particle engine.

   The day's work (calls, messages, invoices, leads) is a cloud of particles.
   Each page section asks for a "formation"; a GPU simulation pulls every
   particle toward its place in that formation at its own pace, with a little
   turbulence on the way. Positions live in float textures (ping-pong), so a
   new formation can be requested at any moment and the motion stays fluid.

   No dependencies. Exposes window.KeniusGL = { create(canvas, opts) }. */
(function () {
  'use strict';

  var FORMS = {
    swarm: 0, timeline: 1, map: 2, pipeline: 3, voice: 4, docs: 5,
    sphere: 6, nodes: 7, line: 8, dust: 9, ring: 10, grid: 11
  };

  /* ---------------------------------------------------------------- GLSL */

  var COMMON = [
    '#define PI 3.141592653589793',
    '#define TAU 6.283185307179586',
    'vec4 hash44(vec4 p4) {',
    '  p4 = fract(p4 * vec4(.1031, .1030, .0973, .1099));',
    '  p4 += dot(p4, p4.wzxy + 33.33);',
    '  return fract((p4.xxyz + p4.yzzw) * p4.zywx);',
    '}',
    'float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }',
    'vec3 hash33(vec3 p3) {',
    '  p3 = fract(p3 * vec3(.1031, .1030, .0973));',
    '  p3 += dot(p3, p3.yxz + 33.33);',
    '  return fract((p3.xxy + p3.yxx) * p3.zyx);',
    '}',
    'float gnoise(vec3 p) {',
    '  vec3 i = floor(p), f = p - i;',
    '  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);',
    '  #define G(o) dot(hash33(i + o) * 2.0 - 1.0, f - o)',
    '  float n = mix(mix(mix(G(vec3(0,0,0)), G(vec3(1,0,0)), u.x), mix(G(vec3(0,1,0)), G(vec3(1,1,0)), u.x), u.y),',
    '                mix(mix(G(vec3(0,0,1)), G(vec3(1,0,1)), u.x), mix(G(vec3(0,1,1)), G(vec3(1,1,1)), u.x), u.y), u.z);',
    '  #undef G',
    '  return n * 1.4;',
    '}',
    'mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }'
  ].join('\n');

  // Formations. Every function maps a particle (seed s in [0,1)^4, integer-ish
  // id) at time t to a position; col.rgb is its light and col.a its size.
  var FORMATIONS = [
    'const vec3 NEUTRAL = vec3(0.56, 0.64, 0.82);',
    'const vec3 SIGNAL = vec3(0.30, 0.95, 0.58);',
    'const vec3 FLAG = vec3(1.00, 0.66, 0.26);',

    // 0 · the inbox at 2 a.m.: a turbulent cloud; tasks get picked up in
    // packets and leave along five lanes (the top one is "flagged for you").
    'vec3 fSwarm(vec4 s, float id, float t, out vec4 col) {',
    '  float grp = floor(id / 36.0);',
    '  vec4 g = hash44(vec4(grp, grp * 1.7, 3.1, 9.2));',
    '  float cyc = fract(g.x + t * 0.042);',
    '  float r = pow(s.y, 0.85) * 1.75;',
    '  float th = s.z * TAU, ph = acos(2.0 * s.w - 1.0);',
    '  vec3 b = r * vec3(sin(ph) * cos(th), cos(ph) * 0.62, sin(ph) * sin(th));',
    '  b.xz = rot(t * 0.22 / (0.4 + r) + r * 1.4) * b.xz;',
    '  vec3 w1 = vec3(gnoise(b * 0.9 + t * 0.12), gnoise(b * 0.9 + 19.1 - t * 0.1), gnoise(b * 0.9 + 7.7 + t * 0.09));',
    '  b += w1 * 0.55;',
    '  b += vec3(gnoise(b * 2.4 + 3.0 + t * 0.2), gnoise(b * 2.4 + 11.0), gnoise(b * 2.4 + 27.0 - t * 0.2)) * 0.16;',
    '  b.x -= 1.15;',
    '  float lane = floor(g.y * 5.0);',
    '  float ly = (lane - 2.0) * 0.34;',
    '  float along = clamp((cyc - 0.7) / 0.3, 0.0, 1.0);',
    '  float within = (s.x - 0.5) * 0.16;',
    '  vec3 lp = vec3(mix(0.55, 7.5, along) + within, ly + (s.w - 0.5) * 0.022, (s.z - 0.5) * 0.035);',
    '  float pick = smoothstep(0.64, 0.72, cyc);',
    '  vec3 p = mix(b, lp, pick);',
    '  float flagged = step(4.0, lane);',
    '  vec3 lc = mix(SIGNAL, FLAG, flagged);',
    '  float core = exp(-r * r * 0.7);',
    '  float clump = smoothstep(-0.25, 0.55, gnoise(b * 1.25 + vec3(0.0, t * 0.05, 0.0)));',
    '  float base = 0.07 + 0.13 * s.x * s.x + 0.12 * core + step(0.985, s.x) * 0.9;',
    '  float glow = mix(base * (0.35 + 1.25 * clump), 0.62 * (1.0 - smoothstep(0.75, 1.0, along)), pick);',
    '  vec3 tint = mix(NEUTRAL, vec3(0.75, 0.8, 0.95), core);',
    '  col = vec4(mix(tint, lc, pick) * glow, mix(1.0, 1.35, pick));',
    '  return p;',
    '}',

    // 1 · the engagement: four stations, chaos to order, left to right.
    'vec3 fTimeline(vec4 s, float id, float t, out vec4 col) {',
    '  if (s.x > 0.84) {',
    '    float u = fract(s.y + t * 0.05);',
    '    vec3 p = vec3(mix(-3.6, 3.6, u), 0.012 * sin(u * 40.0 + t), 0.0);',
    '    col = vec4(mix(NEUTRAL, SIGNAL, u) * 0.16, 0.9);',
    '    return p;',
    '  }',
    '  float st = floor(s.x / 0.21);',
    '  vec3 c = vec3(-2.7 + st * 1.8, 0.0, 0.0);',
    '  vec3 p;',
    '  if (st < 0.5) {',
    '    float r = pow(s.y, 0.45) * 0.62;',
    '    float th = s.z * TAU, ph = acos(2.0 * s.w - 1.0);',
    '    p = r * vec3(sin(ph) * cos(th), cos(ph), sin(ph) * sin(th));',
    '    p += vec3(gnoise(p * 3.0 + t * 0.5), gnoise(p * 3.0 + 9.0 - t * 0.4), gnoise(p * 3.0 + 4.0)) * 0.2;',
    '    col = vec4(NEUTRAL * 0.13, 1.0);',
    '  } else if (st < 1.5) {',
    '    vec2 gcell = floor(vec2(s.y, s.z) * 13.0) - 6.0;',
    '    float hgt = 0.28 * pow(gnoise(vec3(gcell * 0.35, 2.0)) * 0.5 + 0.5, 2.0);',
    '    p = vec3(gcell.x * 0.1, hgt * s.w - 0.1, gcell.y * 0.1);',
    '    p.yz = rot(-0.5) * p.yz;',
    '    col = vec4(mix(NEUTRAL * 0.2, SIGNAL * 0.34, step(0.2, hgt)), 1.0);',
    '  } else if (st < 2.5) {',
    '    vec3 q = floor(vec3(s.y, s.z, s.w) * 7.0) / 6.0 - 0.5;',
    '    p = q * 0.8;',
    '    p.xz = rot(t * 0.3) * p.xz;',
    '    col = vec4(mix(NEUTRAL, SIGNAL, 0.35) * 0.22, 1.0);',
    '  } else {',
    '    float a = s.y * TAU + t * 0.4, b2 = s.z * TAU;',
    '    p = vec3((0.46 + 0.1 * cos(b2)) * cos(a), 0.1 * sin(b2), (0.46 + 0.1 * cos(b2)) * sin(a));',
    '    p.yz = rot(1.1) * p.yz;',
    '    col = vec4(SIGNAL * 0.34, 1.1);',
    '  }',
    '  return c + p;',
    '}',

    // 2 · strategy: a map of where the hours go; amber columns pay off.
    'vec3 fMap(vec4 s, float id, float t, out vec4 col) {',
    '  vec2 cell = floor(vec2(s.x * 30.0, s.y * 16.0)) - vec2(14.5, 7.5);',
    '  vec2 xz = cell * vec2(0.19, 0.19);',
    '  float n = gnoise(vec3(xz * 0.8, 3.0)) * 0.5 + 0.5;',
    '  float h = 0.08 + 1.55 * pow(n, 2.4);',
    '  float hot = step(0.6, gnoise(vec3(xz * 0.55, 11.0)) * 0.5 + 0.5) * step(0.45, n);',
    '  float y = h * s.z;',
    '  vec3 p = vec3(xz.x, y - 0.55, xz.y) + (vec3(s.w, s.x, s.y) - 0.5) * 0.035;',
    '  p.xz = rot(0.35 + t * 0.03) * p.xz;',
    '  float top = smoothstep(0.6, 1.0, s.z);',
    '  col = vec4(mix(NEUTRAL * (0.13 + 0.26 * top), SIGNAL * (0.32 + 0.7 * top), hot), 1.0 + 0.25 * top);',
    '  return p;',
    '}',

    // 3 · agents: plan -> act -> approve, with a human on the last step.
    'vec3 bez(vec3 a, vec3 b, vec3 c, float u) { return mix(mix(a, b, u), mix(b, c, u), u); }',
    'vec3 fPipeline(vec4 s, float id, float t, out vec4 col) {',
    '  vec3 A = vec3(-2.5, -0.25, 0.0), B = vec3(0.0, 0.55, 0.3), C = vec3(2.5, -0.25, 0.0);',
    '  if (s.x < 0.42) {',
    '    float k = floor(s.y * 3.0);',
    '    vec3 c = k < 0.5 ? A : (k < 1.5 ? B : C);',
    '    float r = pow(s.z, 0.4) * 0.36;',
    '    float th = s.w * TAU, ph = acos(2.0 * fract(s.z * 7.13) - 1.0);',
    '    vec3 d = r * vec3(sin(ph) * cos(th), cos(ph), sin(ph) * sin(th));',
    '    d.xz = rot(t * 0.5) * d.xz;',
    '    vec3 kc = k < 0.5 ? NEUTRAL : (k < 1.5 ? SIGNAL : FLAG);',
    '    col = vec4(kc * (k < 0.5 ? 0.22 : 0.4), 1.15);',
    '    return c + d;',
    '  }',
    '  float e = floor(s.y * 3.0);',
    '  float u = fract(s.z + t * (e < 1.5 ? 0.16 : 0.07));',
    '  vec3 p;',
    '  if (e < 0.5) p = bez(A, vec3(-1.3, 1.3, 0.2), B, u);',
    '  else if (e < 1.5) p = bez(B, vec3(1.3, 1.3, 0.2), C, u);',
    '  else p = bez(C, vec3(0.0, -1.7, -0.4), A, u);',
    '  p += (vec3(s.w, fract(s.w * 3.7), fract(s.w * 7.9)) - 0.5) * 0.06;',
    '  float dash = step(0.5, fract(u * 14.0 - t * 0.5));',
    '  col = e < 1.5 ? vec4(SIGNAL * 0.3, 1.0) : vec4(FLAG * 0.22 * dash, 0.9);',
    '  return p;',
    '}',

    // 4 · voice: a speaking core, ripples spreading across a calm surface.
    'vec3 fVoice(vec4 s, float id, float t, out vec4 col) {',
    '  if (s.x < 0.07) {',
    '    float r = pow(s.y, 0.45) * (0.2 + 0.04 * sin(t * 4.8));',
    '    float th = s.z * TAU, ph = acos(2.0 * s.w - 1.0);',
    '    vec3 p = r * vec3(sin(ph) * cos(th), cos(ph), sin(ph) * sin(th));',
    '    p.y += 0.22;',
    '    p.yz = rot(-0.3) * p.yz;',
    '    col = vec4(SIGNAL * 0.55 + vec3(0.12), 1.1);',
    '    return p;',
    '  }',
    '  float u = (s.x - 0.07) / 0.93;',
    '  float r = 0.32 + sqrt(u) * 3.05;',
    '  float a = s.y * TAU;',
    '  float w = sin(r * 4.3 - t * 2.4);',
    '  float env = exp(-r * 0.33);',
    '  float y = 0.3 * w * env + (s.z - 0.5) * 0.014;',
    '  vec3 p = vec3(r * cos(a), y, r * sin(a));',
    '  p.yz = rot(-0.3) * p.yz;',
    '  float crest = smoothstep(0.55, 1.0, w) * (0.35 + env);',
    '  col = vec4(mix(NEUTRAL * 0.09, SIGNAL * 0.8, clamp(crest, 0.0, 1.0)), 1.0 + crest * 0.4);',
    '  return p;',
    '}',

    // 5 · documents: a fanned stack of pages, lines of text, one exception.
    'vec3 fDocs(vec4 s, float id, float t, out vec4 col) {',
    '  float k = floor(s.x * 7.0);',
    '  float line = floor(s.y * 17.0);',
    '  float len = 0.45 + 0.55 * hash11(k * 17.0 + line * 3.1);',
    '  if (line > 15.5) len = 0.35;',
    '  float u = s.z * len;',
    '  vec3 q;',
    '  if (s.w < 0.14) {',
    '    float per = fract(s.w / 0.14 * 7.0) * 4.0;',
    '    float e = fract(per);',
    '    q = per < 1.0 ? vec3(e, 0.0, 0.0) : per < 2.0 ? vec3(1.0, e, 0.0) : per < 3.0 ? vec3(1.0 - e, 1.0, 0.0) : vec3(0.0, 1.0 - e, 0.0);',
    '    q = vec3((q.x - 0.5) * 1.05, (q.y - 0.5) * 1.42, 0.0);',
    '    col = vec4(NEUTRAL * 0.2, 0.95);',
    '  } else {',
    '    q = vec3((u - 0.5) * 0.86 - 0.43 * (1.0 - len), 0.58 - line * 0.074, 0.0);',
    '    float flagged = step(5.5, k) * step(8.5, line) * step(line, 9.5);',
    '    float scanY = 0.66 - fract(t * 0.16 + k * 0.137) * 1.36;',
    '    float scan = exp(-pow((q.y - scanY) / 0.05, 2.0)) * (1.0 - flagged);',
    '    col = vec4(mix(NEUTRAL * 0.19, FLAG * 0.7, flagged) + SIGNAL * 0.45 * scan, 1.0 + flagged * 0.3 + scan * 0.3);',
    '  }',
    '  float off = k - 3.0;',
    '  q.xz = rot(-0.28 * off) * q.xz;',
    '  vec3 p = q + vec3(off * 0.74, 0.05 * sin(off * 1.7 + t * 0.7), -abs(off) * 0.3);',
    '  p.yz = rot(-0.16) * p.yz;',
    '  return p;',
    '}',

    // 6 · copilots: your knowledge as a slowly turning globe of notes.
    'vec3 fSphere(vec4 s, float id, float t, out vec4 col) {',
    '  float n = 1600.0;',
    '  float i = floor(s.x * n);',
    '  float y = 1.0 - (i + 0.5) / n * 2.0;',
    '  float rr = sqrt(1.0 - y * y);',
    '  float a = i * 2.39996323;',
    '  vec3 d = vec3(rr * cos(a), y, rr * sin(a));',
    '  d += (vec3(s.y, s.z, s.w) - 0.5) * 0.05;',
    '  vec3 p = normalize(d) * (1.75 + (s.w - 0.5) * 0.05);',
    '  float topic = smoothstep(0.55, 0.8, gnoise(normalize(d) * 2.2 + 5.0) * 0.5 + 0.5);',
    '  if (s.y < 0.18) {',
    '    float ring = floor(s.z * 3.0);',
    '    float aa = s.w * TAU + t * (0.2 + ring * 0.1);',
    '    p = vec3(cos(aa), 0.0, sin(aa)) * (2.15 + ring * 0.22);',
    '    p.xy = rot(0.35 + ring * 0.5) * p.xy;',
    '    col = vec4(NEUTRAL * 0.09, 0.9);',
    '    return p;',
    '  }',
    '  p.xz = rot(t * 0.12) * p.xz;',
    '  p.yz = rot(0.3) * p.yz;',
    '  col = vec4(mix(NEUTRAL * 0.14, SIGNAL * 0.5, topic), 1.0 + topic * 0.3);',
    '  return p;',
    '}',

    // 7 · integration: your systems, with data flowing between them.
    'vec3 nodePos(float k, float t) {',
    '  float a = k / 6.0 * TAU + t * 0.05;',
    '  vec3 p = vec3(cos(a) * 2.35, 0.0, sin(a) * 2.35);',
    '  p.yz = rot(-0.62) * p.yz;',
    '  return p;',
    '}',
    'vec3 fNodes(vec4 s, float id, float t, out vec4 col) {',
    '  if (s.x < 0.5) {',
    '    float k = floor(s.y * 6.0);',
    '    vec3 q = (floor(vec3(s.z, s.w, fract(s.z * 13.7)) * 6.0) / 5.0 - 0.5) * 0.42;',
    '    col = vec4(NEUTRAL * 0.24, 1.05);',
    '    return nodePos(k, t) + q;',
    '  }',
    '  float k = floor(s.y * 6.0);',
    '  float j = mod(k + 1.0 + floor(s.z * 3.0), 6.0);',
    '  vec3 a = nodePos(k, t), b = nodePos(j, t);',
    '  float u = fract(s.w + t * 0.14);',
    '  vec3 mid = (a + b) * 0.5 + vec3(0.0, 1.0 + 0.4 * length(a - b) * 0.25, 0.0);',
    '  vec3 p = bez(a, mid, b, u) + (vec3(fract(s.z * 91.0), fract(s.z * 57.0), fract(s.z * 33.0)) - 0.5) * 0.04;',
    '  col = vec4(SIGNAL * 0.26 * smoothstep(0.0, 0.15, u) * smoothstep(1.0, 0.85, u), 0.95);',
    '  return p;',
    '}',

    // 8 · a calm horizon line.
    'vec3 fLine(vec4 s, float id, float t, out vec4 col) {',
    '  if (s.x < 0.12) {',
    '    col = vec4(NEUTRAL * 0.05, 0.8);',
    '    return (vec3(s.y, s.z, s.w) - 0.5) * vec3(12.0, 5.0, 4.0);',
    '  }',
    '  float x = (s.y - 0.5) * 10.0;',
    '  float y = 0.07 * sin(x * 1.3 + t * 0.6) * exp(-x * x * 0.03) + (s.z - 0.5) * 0.012;',
    '  col = vec4(mix(NEUTRAL * 0.12, SIGNAL * 0.45, exp(-x * x * 0.4)), 1.0);',
    '  return vec3(x, y - 0.1, (s.w - 0.5) * 0.05);',
    '}',

    // 9 · ambient dust.
    'vec3 fDust(vec4 s, float id, float t, out vec4 col) {',
    '  vec3 p = (vec3(s.x, fract(s.y + t * 0.004), s.z) - 0.5) * vec3(13.0, 7.5, 6.0);',
    '  p += vec3(gnoise(p * 0.3 + t * 0.05), gnoise(p * 0.3 + 4.0), gnoise(p * 0.3 + 8.0)) * 0.3;',
    '  col = vec4(NEUTRAL * (0.03 + 0.1 * pow(s.w, 6.0)), 0.9);',
    '  return p;',
    '}',

    // 10 · the 24-hour ring: the overnight hours handed to agents, "now" in amber.
    'uniform float uHour;',
    'uniform float uSel;',
    'vec3 fRing(vec4 s, float id, float t, out vec4 col) {',
    '  float R = 2.05;',
    '  if (s.x < 0.1) {',
    '    float h = floor(s.y * 24.0);',
    '    float a = PI * 0.5 - h / 24.0 * TAU;',
    '    float len = mod(h, 6.0) < 0.5 ? 0.3 : 0.14;',
    '    vec3 p = vec3(cos(a), sin(a), 0.0) * (R + 0.14 + s.z * len);',
    '    col = vec4(NEUTRAL * 0.22, 0.9);',
    '    return p;',
    '  }',
    '  float hr = s.y * 24.0;',
    '  float a = PI * 0.5 - s.y * TAU;',
    '  float rr = R + (s.z - 0.5) * 0.09 + (s.w - 0.5) * 0.02;',
    '  vec3 p = vec3(cos(a) * rr, sin(a) * rr, (s.w - 0.5) * 0.05);',
    '  float night = step(18.0, hr) + step(hr, 7.0);',
    '  float dn = abs(mod(hr - uHour + 12.0, 24.0) - 12.0);',
    '  float now = exp(-dn * dn * 8.0);',
    '  vec3 c = mix(NEUTRAL * 0.12, SIGNAL * 0.42, clamp(night, 0.0, 1.0));',
    '  c = mix(c, vec3(1.0, 0.93, 0.82) * 0.95, now);',
    '  col = vec4(c, 1.0 + now * 0.8);',
    '  return p;',
    '}',

    // 11 · six commitments: a 3x2 grid of small, orderly clusters.
    'vec3 fGrid(vec4 s, float id, float t, out vec4 col) {',
    '  float k = floor(s.x * 6.0);',
    '  vec2 c = vec2(mod(k, 3.0) - 1.0, 0.5 - floor(k / 3.0)) * vec2(1.9, 1.45);',
    '  vec3 q = floor(vec3(s.y, s.z, s.w) * 8.0) / 7.0 - 0.5;',
    '  q *= 0.62;',
    '  q.xz = rot(t * 0.2 + k) * q.xz;',
    '  q.yz = rot(0.5) * q.yz;',
    '  col = vec4(mix(NEUTRAL * 0.24, SIGNAL * 0.5, 1.0 - step(0.5, abs(k - uSel))), 1.0);',
    '  return vec3(c, 0.0) + q;',
    '}',

    'vec3 mote(vec4 s, float t, out vec4 col) {',
    '  vec3 p = (vec3(s.x, s.y, s.z) - 0.5) * vec3(11.0, 6.5, 8.0) + vec3(0.0, 0.0, 1.6);',
    '  p += vec3(sin(t * 0.07 + s.x * 40.0), cos(t * 0.05 + s.y * 30.0), sin(t * 0.04 + s.z * 20.0)) * 0.35;',
    '  col = vec4(NEUTRAL * 0.05 * (0.4 + fract(s.x * 71.0)), 2.6);',
    '  return p;',
    '}',
    'vec3 formation(int f, vec4 s, float id, float t, out vec4 col) {',
    '  if (fract(s.w * 97.0 + s.x * 13.0) > 0.988) return mote(s, t, col);',
    '  if (f == 0) return fSwarm(s, id, t, col);',
    '  if (f == 1) return fTimeline(s, id, t, col);',
    '  if (f == 2) return fMap(s, id, t, col);',
    '  if (f == 3) return fPipeline(s, id, t, col);',
    '  if (f == 4) return fVoice(s, id, t, col);',
    '  if (f == 5) return fDocs(s, id, t, col);',
    '  if (f == 6) return fSphere(s, id, t, col);',
    '  if (f == 7) return fNodes(s, id, t, col);',
    '  if (f == 8) return fLine(s, id, t, col);',
    '  if (f == 9) return fDust(s, id, t, col);',
    '  if (f == 10) return fRing(s, id, t, col);',
    '  return fGrid(s, id, t, col);',
    '}'
  ].join('\n');

  var FULL_VERT = [
    '#version 300 es',
    'layout(location = 0) in vec2 aPos;',
    'out vec2 vUv;',
    'void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }'
  ].join('\n');

  var SIM_FRAG = [
    '#version 300 es',
    'precision highp float;',
    'precision highp int;',
    COMMON,
    FORMATIONS,
    'uniform sampler2D uPos;',
    'uniform sampler2D uCol;',
    'uniform int uForm;',
    'uniform float uTime;',
    'uniform float uDt;',
    'uniform float uInit;',
    'uniform float uCalm;',
    'uniform int uW;',
    'uniform vec3 uMouse;',
    'uniform float uMouseK;',
    'uniform float uStir;',
    'layout(location = 0) out vec4 oPos;',
    'layout(location = 1) out vec4 oCol;',
    'void main() {',
    '  ivec2 ij = ivec2(gl_FragCoord.xy);',
    '  float id = float(ij.y * uW + ij.x);',
    '  vec4 s = hash44(vec4(id, id * 1.37 + 11.0, id * 2.71 + 23.0, id * 0.61 + 37.0));',
    '  vec4 tc, tp;',
    '  vec3 tgt = formation(uForm, s, id, uTime, tc);',
    '  if (uInit > 0.5) { oPos = vec4(tgt, 1.0); oCol = tc; return; }',
    '  vec3 prev = formation(uForm, s, id, uTime - uDt, tp);',
    '  vec3 p = texelFetch(uPos, ij, 0).xyz;',
    '  vec4 c = texelFetch(uCol, ij, 0);',
    '  float k = mix(1.1, 3.6, s.w * s.w) * mix(1.0, 3.0, uCalm);',
    '  float a = 1.0 - exp(-uDt * k);',
    '  vec3 d = tgt - p;',
    '  float far = min(length(d), 2.5);',
    '  vec3 q = p * 0.55 + uTime * 0.12;',
    '  vec3 swirl = vec3(gnoise(q), gnoise(q + 17.3), gnoise(q + 41.9));',
    '  p += (tgt - prev) + d * a + swirl * (far * 1.8 + uStir * 0.9) * uDt * (1.0 - uCalm);',
    '  vec3 dm = p - uMouse;',
    '  float r2 = dot(dm, dm);',
    '  p += dm * inversesqrt(r2 + 1e-3) * uMouseK * exp(-r2 * 3.0) * uDt * 2.6 * (1.0 - uCalm);',
    '  oPos = vec4(p, 1.0);',
    '  oCol = mix(c, tc, 1.0 - exp(-uDt * 2.2));',
    '}'
  ].join('\n');

  var POINT_VERT = [
    '#version 300 es',
    'precision highp float;',
    'precision highp int;',
    'uniform sampler2D uPos;',
    'uniform sampler2D uCol;',
    'uniform mat4 uVP;',
    'uniform int uW;',
    'uniform float uPx;',
    'uniform float uFocus;',
    'uniform float uAperture;',
    'uniform float uGain;',
    'uniform float uScale;',
    'out vec3 vCol;',
    'void main() {',
    '  ivec2 ij = ivec2(gl_VertexID % uW, gl_VertexID / uW);',
    '  vec3 p = texelFetch(uPos, ij, 0).xyz;',
    '  vec4 c = texelFetch(uCol, ij, 0);',
    '  vec4 clip = uVP * vec4(p, 1.0);',
    '  gl_Position = clip;',
    '  float w = max(clip.w, 0.1);',
    '  float size = c.a * uScale * uPx / w;',
    '  float coc = abs(w - uFocus) * uAperture * uPx;',
    '  float total = max(size + coc, uPx * 0.9);',
    '  gl_PointSize = min(total, 48.0 * uPx);',
    '  vCol = c.rgb * uGain * (size * size) / (total * total) * (size < uPx ? size / uPx : 1.0);',
    '}'
  ].join('\n');

  var POINT_FRAG = [
    '#version 300 es',
    'precision highp float;',
    'in vec3 vCol;',
    'out vec4 o;',
    'void main() {',
    '  vec2 q = gl_PointCoord * 2.0 - 1.0;',
    '  float d = dot(q, q);',
    '  if (d > 1.0) discard;',
    '  float a = exp(-d * 2.8) * (1.0 - d);',
    '  o = vec4(vCol * a * 1.9, 1.0);',
    '}'
  ].join('\n');

  var DOWN_FRAG = [
    '#version 300 es',
    'precision highp float;',
    'in vec2 vUv;',
    'uniform sampler2D uSrc;',
    'uniform vec2 uTexel;',
    'uniform float uPre;',
    'out vec4 o;',
    'vec3 tap(vec2 d) { return texture(uSrc, vUv + uTexel * d).rgb; }',
    'void main() {',
    '  vec3 c = tap(vec2(0.0)) * 0.25;',
    '  c += (tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0))) * 0.125;',
    '  c += (tap(vec2(-2.0, 0.0)) + tap(vec2(2.0, 0.0)) + tap(vec2(0.0, -2.0)) + tap(vec2(0.0, 2.0))) * 0.0625;',
    '  if (uPre > 0.5) { float b = max(c.r, max(c.g, c.b)); c *= smoothstep(0.08, 0.5, b); }',
    '  o = vec4(c, 1.0);',
    '}'
  ].join('\n');

  var UP_FRAG = [
    '#version 300 es',
    'precision highp float;',
    'in vec2 vUv;',
    'uniform sampler2D uLow;',
    'uniform sampler2D uHigh;',
    'uniform vec2 uTexel;',
    'out vec4 o;',
    'void main() {',
    '  vec2 t = uTexel;',
    '  vec3 s = texture(uLow, vUv).rgb * 4.0;',
    '  s += (texture(uLow, vUv + vec2(-t.x, 0.0)).rgb + texture(uLow, vUv + vec2(t.x, 0.0)).rgb + texture(uLow, vUv + vec2(0.0, -t.y)).rgb + texture(uLow, vUv + vec2(0.0, t.y)).rgb) * 2.0;',
    '  s += texture(uLow, vUv - t).rgb + texture(uLow, vUv + t).rgb + texture(uLow, vUv + vec2(t.x, -t.y)).rgb + texture(uLow, vUv + vec2(-t.x, t.y)).rgb;',
    '  o = vec4(texture(uHigh, vUv).rgb + s / 16.0, 1.0);',
    '}'
  ].join('\n');

  var COMPOSITE_FRAG = [
    '#version 300 es',
    'precision highp float;',
    'in vec2 vUv;',
    'uniform sampler2D uScene;',
    'uniform sampler2D uBloom;',
    'uniform float uBloomK;',
    'uniform float uExposure;',
    'uniform float uTime;',
    'uniform vec2 uRes;',
    'uniform float uDawn;',
    'out vec4 o;',
    'vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }',
    'float h12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }',
    'void main() {',
    '  vec2 c = vUv - 0.5;',
    '  vec3 col = texture(uScene, vUv).rgb;',
    '  col += texture(uBloom, vUv).rgb * uBloomK;',
    '  col = aces(col * uExposure);',
    '  col = pow(col, vec3(1.0 / 2.2));',
    // night sky in display space: tinted near-black, a touch lighter low down
    '  float asp = uRes.x / uRes.y;',
    '  vec3 sky = mix(vec3(0.043, 0.063, 0.110), vec3(0.024, 0.035, 0.062), smoothstep(0.0, 1.0, vUv.y));',
    '  vec2 g = (vUv - vec2(0.68, 0.62)) * vec2(asp, 1.0);',
    '  sky += vec3(0.020, 0.028, 0.055) * exp(-dot(g, g) * 1.6);',
    '  vec2 dw = (vUv - vec2(0.7, -0.18)) * vec2(asp * 0.8, 1.0);',
    '  float glow = exp(-dot(dw, dw) * 2.2);',
    '  sky += uDawn * (vec3(0.30, 0.13, 0.10) * glow + vec3(0.55, 0.30, 0.12) * glow * glow * glow);',
    '  col = 1.0 - (1.0 - col) * (1.0 - sky);',
    '  col *= 1.0 - 0.28 * smoothstep(0.45, 1.05, length(c * vec2(asp, 1.0)));',
    '  col += (h12(gl_FragCoord.xy + fract(uTime * 7.1) * 311.0) - 0.5) * 0.014;',
    '  o = vec4(col, 1.0);',
    '}'
  ].join('\n');

  /* ------------------------------------------------------------ helpers */

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error('shader: ' + log);
    }
    return sh;
  }

  function program(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
    var u = {};
    var n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
      var info = gl.getActiveUniform(p, i);
      u[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, info.name);
    }
    return { p: p, u: u };
  }

  function texture(gl, w, h, internal, format, type, filter) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  function target(gl, textures) {
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    var bufs = [];
    textures.forEach(function (t, i) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0);
      bufs.push(gl.COLOR_ATTACHMENT0 + i);
    });
    gl.drawBuffers(bufs);
    var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return ok ? fb : null;
  }

  /* ------------------------------------------------------------- matrices */

  function perspective(fovY, aspect, near, far, sx, sy) {
    var f = 1 / Math.tan(fovY / 2);
    var nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, -sx, -sy, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  }
  function lookAt(eye, at, up) {
    var zx = eye[0] - at[0], zy = eye[1] - at[1], zz = eye[2] - at[2];
    var zl = Math.hypot(zx, zy, zz); zx /= zl; zy /= zl; zz /= zl;
    var xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    var xl = Math.hypot(xx, xy, xz); xx /= xl; xy /= xl; xz /= xl;
    var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]), -(yx * eye[0] + yy * eye[1] + yz * eye[2]), -(zx * eye[0] + zy * eye[1] + zz * eye[2]), 1];
  }
  function mul(a, b) {
    var o = new Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }

  /* --------------------------------------------------------------- engine */

  function create(canvas, opts) {
    opts = opts || {};
    var gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.preserve });
    if (!gl) return null;
    var floatOK = !!gl.getExtension('EXT_color_buffer_float');
    var halfOK = floatOK || !!gl.getExtension('EXT_color_buffer_half_float');
    if (!halfOK) return null;
    gl.getExtension('OES_texture_float_linear');

    var small = opts.small;
    var W = small ? 160 : 256;
    var H = small ? 150 : 256;
    var COUNT = W * H;

    var progs;
    try {
      progs = {
        sim: program(gl, FULL_VERT, SIM_FRAG),
        pts: program(gl, POINT_VERT, POINT_FRAG),
        down: program(gl, FULL_VERT, DOWN_FRAG),
        up: program(gl, FULL_VERT, UP_FRAG),
        comp: program(gl, FULL_VERT, COMPOSITE_FRAG)
      };
    } catch (e) {
      if (window.console) console.warn('Kenius GL disabled:', e.message);
      return null;
    }

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    var vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var emptyVao = gl.createVertexArray();

    // simulation state, ping-pong
    var posFmt = floatOK ? gl.RGBA32F : gl.RGBA16F;
    var posType = floatOK ? gl.FLOAT : gl.HALF_FLOAT;
    var state = [0, 1].map(function () {
      var p = texture(gl, W, H, posFmt, gl.RGBA, posType, gl.NEAREST);
      var c = texture(gl, W, H, posFmt, gl.RGBA, posType, gl.NEAREST);
      return { pos: p, col: c, fb: target(gl, [p, c]) };
    });
    if (!state[0].fb || !state[1].fb) return null;
    var cur = 0;

    // HDR scene + bloom chain
    var hdrFmt = gl.RGBA16F;
    var scene = null;
    var mips = [];
    var LEVELS = 5;
    var width = 1, height = 1;

    function alloc() {
      if (scene) {
        gl.deleteTexture(scene.t);
        gl.deleteFramebuffer(scene.fb);
        mips.forEach(function (m) { gl.deleteTexture(m.d.t); gl.deleteFramebuffer(m.d.fb); gl.deleteTexture(m.u.t); gl.deleteFramebuffer(m.u.fb); });
      }
      var st = texture(gl, width, height, hdrFmt, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR);
      scene = { t: st, fb: target(gl, [st]), w: width, h: height };
      mips = [];
      var w = width, h = height;
      for (var i = 0; i < LEVELS; i++) {
        w = Math.max(1, w >> 1);
        h = Math.max(1, h >> 1);
        var dt = texture(gl, w, h, hdrFmt, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR);
        var ut = texture(gl, w, h, hdrFmt, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR);
        mips.push({ w: w, h: h, d: { t: dt, fb: target(gl, [dt]) }, u: { t: ut, fb: target(gl, [ut]) } });
      }
    }

    function full(prog) {
      gl.useProgram(prog.p);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function bindTex(unit, tex, loc) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(loc, unit);
    }

    var S = {
      form: FORMS[opts.form] || 0,
      init: true,
      time: 0,
      hour: new Date().getHours() + new Date().getMinutes() / 60,
      dawn: 0,
      exposure: 1,
      calm: opts.reduced ? 1 : 0,
      cam: { dist: 8.6, yaw: 0, pitch: 0.08, fov: 34, sx: 0, sy: 0, focus: 8.6, aperture: 0.7 },
      pointer: [0, 0],
      pointerNdc: [9, 9],
      mouse: [99, 99, 99],
      mouseK: 0,
      stir: 0,
      sel: -1
    };

    function resize(w, h) {
      width = Math.max(1, w | 0);
      height = Math.max(1, h | 0);
      canvas.width = width;
      canvas.height = height;
      alloc();
    }

    function step(dt, px) {
      S.time += dt;
      // ---- simulate
      var src = state[cur], dst = state[1 - cur];
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
      gl.viewport(0, 0, W, H);
      gl.disable(gl.BLEND);
      var sp = progs.sim;
      gl.useProgram(sp.p);
      bindTex(0, src.pos, sp.u.uPos);
      bindTex(1, src.col, sp.u.uCol);
      gl.uniform1i(sp.u.uForm, S.form);
      gl.uniform1f(sp.u.uTime, S.time);
      gl.uniform1f(sp.u.uDt, Math.max(dt, 1e-4));
      gl.uniform1f(sp.u.uInit, S.init ? 1 : 0);
      gl.uniform1f(sp.u.uCalm, S.calm);
      gl.uniform1i(sp.u.uW, W);
      if (sp.u.uHour) gl.uniform1f(sp.u.uHour, S.hour);
      if (sp.u.uSel) gl.uniform1f(sp.u.uSel, S.sel);
      gl.uniform3f(sp.u.uMouse, S.mouse[0], S.mouse[1], S.mouse[2]);
      gl.uniform1f(sp.u.uMouseK, S.mouseK);
      gl.uniform1f(sp.u.uStir, S.stir);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      cur = 1 - cur;
      S.init = false;

      // ---- camera
      var c = S.cam;
      var aspect = width / height;
      var yaw = c.yaw + S.pointer[0] * 0.08;
      var pitch = c.pitch - S.pointer[1] * 0.05;
      var eye = [Math.sin(yaw) * Math.cos(pitch) * c.dist, Math.sin(pitch) * c.dist, Math.cos(yaw) * Math.cos(pitch) * c.dist];
      var proj = perspective(c.fov * Math.PI / 180, aspect, 0.1, 60, c.sx, c.sy);
      var view = lookAt(eye, [0, 0, 0], [0, 1, 0]);
      var vp = mul(proj, view);
      S.vp = vp;
      // pointer -> the plane through the origin facing the camera
      var th = Math.tan(c.fov * Math.PI / 360);
      var vx = (S.pointerNdc[0] - c.sx) * th * aspect * c.dist;
      var vy = (S.pointerNdc[1] - c.sy) * th * c.dist;
      S.mouse = [view[0] * vx + view[1] * vy, view[4] * vx + view[5] * vy, view[8] * vx + view[9] * vy];

      // ---- scene
      gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fb);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      var pp = progs.pts;
      gl.useProgram(pp.p);
      bindTex(0, state[cur].pos, pp.u.uPos);
      bindTex(1, state[cur].col, pp.u.uCol);
      gl.uniformMatrix4fv(pp.u.uVP, false, new Float32Array(vp));
      gl.uniform1i(pp.u.uW, W);
      gl.uniform1f(pp.u.uPx, px);
      gl.uniform1f(pp.u.uFocus, c.focus);
      gl.uniform1f(pp.u.uAperture, c.aperture);
      gl.uniform1f(pp.u.uGain, small ? 1.9 : 1.0);
      gl.uniform1f(pp.u.uScale, 11.0);
      gl.bindVertexArray(emptyVao);
      gl.drawArrays(gl.POINTS, 0, COUNT);
      gl.disable(gl.BLEND);

      // ---- bloom
      var srcT = scene.t, sw = width, sh = height;
      var dp = progs.down;
      for (var i = 0; i < LEVELS; i++) {
        var m = mips[i];
        gl.bindFramebuffer(gl.FRAMEBUFFER, m.d.fb);
        gl.viewport(0, 0, m.w, m.h);
        gl.useProgram(dp.p);
        bindTex(0, srcT, dp.u.uSrc);
        gl.uniform2f(dp.u.uTexel, 1 / sw, 1 / sh);
        gl.uniform1f(dp.u.uPre, i === 0 ? 1 : 0);
        full(dp);
        srcT = m.d.t; sw = m.w; sh = m.h;
      }
      var upg = progs.up;
      var low = mips[LEVELS - 1].d;
      var lw = mips[LEVELS - 1].w, lh = mips[LEVELS - 1].h;
      for (var k = LEVELS - 2; k >= 0; k--) {
        var mm = mips[k];
        gl.bindFramebuffer(gl.FRAMEBUFFER, mm.u.fb);
        gl.viewport(0, 0, mm.w, mm.h);
        gl.useProgram(upg.p);
        bindTex(0, low.t, upg.u.uLow);
        bindTex(1, mm.d.t, upg.u.uHigh);
        gl.uniform2f(upg.u.uTexel, 1 / lw, 1 / lh);
        full(upg);
        low = mm.u; lw = mm.w; lh = mm.h;
      }

      // ---- composite
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      var cp = progs.comp;
      gl.useProgram(cp.p);
      bindTex(0, scene.t, cp.u.uScene);
      bindTex(1, mips[0].u.t, cp.u.uBloom);
      gl.uniform1f(cp.u.uBloomK, 0.9);
      gl.uniform1f(cp.u.uExposure, S.exposure);
      gl.uniform1f(cp.u.uTime, S.time);
      gl.uniform2f(cp.u.uRes, width, height);
      gl.uniform1f(cp.u.uDawn, S.dawn);
      full(cp);
    }

    // Project a world point to CSS pixels (for HTML labels).
    function project(p, cssW, cssH) {
      var m = S.vp;
      if (!m) return null;
      var x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12];
      var y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13];
      var w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
      if (w <= 0) return null;
      return [(x / w * 0.5 + 0.5) * cssW, (0.5 - y / w * 0.5) * cssH];
    }

    return {
      state: S,
      count: COUNT,
      forms: FORMS,
      resize: resize,
      step: step,
      project: project,
      setForm: function (name, snap) {
        if (FORMS[name] === undefined) return;
        S.form = FORMS[name];
        if (snap) S.init = true;
      },
      lose: function () {
        var ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
    };
  }

  window.KeniusGL = { create: create, forms: FORMS };
})();
