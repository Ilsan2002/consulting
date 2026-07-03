/* Kenius — "Skyline" exploration.
   Sky engine: four stills cross-faded by a virtual clock (24h per 24s),
   seeded from the visitor's real local time. The agent log fires its
   entries when the virtual clock passes their hour. */

(function () {
  'use strict';

  var CYCLE_MS = 24000; // one full day

  var FRAMES = [
    { id: 'night',  at: 1 },
    { id: 'dawn',   at: 5.5 },
    { id: 'day',    at: 12.5 },
    { id: 'sunset', at: 18 }
  ];

  // Log entries carry the Blueprint copy; times are spread across the day
  // so each fires under the matching sky. Illustrative, not case studies.
  var EVENTS = [
    { at: 2 + 14 / 60,  t: '02:14', html: '&ldquo;No heat &mdash; unit 4B.&rdquo; <b>&rarr; tech dispatched</b>' },
    { at: 6 + 39 / 60,  t: '06:39', html: '&ldquo;Still need my W-2?&rdquo; <b>&rarr; docs collected</b>' },
    { at: 10 + 5 / 60,  t: '10:05', html: '&ldquo;Where&rsquo;s my order?&rdquo; <b>&rarr; resolved, no queue</b>' },
    { at: 13 + 27 / 60, t: '13:27', html: '41 invoices read &amp; reconciled <b>&rarr; 2 flagged for review</b>' },
    { at: 18 + 22 / 60, t: '18:22', html: 'Portal lead, pre-approved <b>&rarr; tour booked</b>' },
    { at: 23 + 58 / 60, t: '23:58', html: 'Missed call: furnace out <b>&rarr; tech en route</b>' }
  ];

  var layers = {};
  FRAMES.forEach(function (f) { layers[f.id] = document.getElementById('sky-' + f.id); });
  var clockEl = document.getElementById('agent-clock');
  var evtEl = document.getElementById('agent-evt');

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- weights: sequential neighbour blend, smoothstep-eased --- */
  var ORDER = FRAMES.slice().sort(function (a, b) { return a.at - b.at; });

  function weightsAt(hour) {
    var h = ((hour % 24) + 24) % 24;
    var seg = null;
    for (var i = 0; i < ORDER.length; i++) {
      var a = ORDER[i], b = ORDER[(i + 1) % ORDER.length];
      var bAt = b.at <= a.at ? b.at + 24 : b.at;
      var hh = h < a.at ? h + 24 : h;
      if (hh >= a.at && hh <= bAt) { seg = { a: a, b: b, t: (hh - a.at) / (bAt - a.at) }; break; }
    }
    var t = Math.max(0, Math.min(1, seg.t));
    var s = t * t * (3 - 2 * t); // smoothstep
    var out = {};
    FRAMES.forEach(function (f) { out[f.id] = 0; });
    out[seg.a.id] = 1 - s;
    out[seg.b.id] = s;
    return out;
  }

  function paintSky(hour) {
    var w = weightsAt(hour);
    FRAMES.forEach(function (f) {
      if (layers[f.id]) layers[f.id].style.opacity = w[f.id];
    });
  }

  function fmt(hour) {
    var h = Math.floor(hour) % 24;
    var m = Math.floor((hour - Math.floor(hour)) * 60);
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  /* --- agent log --- */
  var currentEvt = -1;

  function eventIndexFor(hour) {
    // latest event whose time has passed (wrapping to the last of yesterday)
    var idx = EVENTS.length - 1;
    for (var i = 0; i < EVENTS.length; i++) {
      if (EVENTS[i].at <= hour) idx = i;
    }
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
    if (animate && !reduceMotion) {
      evtEl.classList.add('is-out');
      setTimeout(swap, 360);
    } else {
      swap();
    }
  }

  /* --- clock: real local time, ticking at real speed --- */
  var now = new Date();
  var startHour = now.getHours() + now.getMinutes() / 60; // seed: visitor's sky
  var lastClock = '';

  function updateClock() {
    var d = new Date();
    var c = fmt(d.getHours() + d.getMinutes() / 60);
    if (c !== lastClock && clockEl) { clockEl.textContent = c; lastClock = c; }
  }
  updateClock();
  setInterval(updateClock, 15000);

  // remove the CSS fallback flag; JS owns opacity from here
  var dayImg = document.getElementById('sky-day');
  if (dayImg) dayImg.classList.remove('is-on');

  if (reduceMotion) {
    // static: honour the visitor's actual time of day, no animation
    paintSky(startHour);
    setEvent(eventIndexFor(startHour), false);
  } else {
    /* sky: ambient loop, one full day per CYCLE_MS */
    var t0 = null;
    var tick = function (ts) {
      if (t0 === null) t0 = ts;
      paintSky((startHour + ((ts - t0) / CYCLE_MS) * 24) % 24);
      requestAnimationFrame(tick);
    };
    paintSky(startHour);
    requestAnimationFrame(tick);

    /* log: rotate calmly through the entries, most recent first */
    setEvent(eventIndexFor(startHour), false);
    setInterval(function () {
      setEvent((currentEvt + 1) % EVENTS.length, true);
    }, 7000);
  }

  /* --- scroll reveals --- */
  var rvs = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el) { io.observe(el); });
  } else {
    rvs.forEach(function (el) { el.classList.add('in'); });
  }

  /* --- year --- */
  var y = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = y; });
})();
