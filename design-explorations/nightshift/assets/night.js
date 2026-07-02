/* Kenius Night Shift — Lenis + GSAP ScrollTrigger drive the night.
   Clock scrubs 23:58 → 07:30 with scroll; dawn fades in at the end.
   Reduced-motion / no-JS: chapters read as plain sections, times inline. */
(function () {
  "use strict";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  document.documentElement.classList.add("js");
  $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* reveals */
  var els = $$(".rv");
  if (reduced || !("IntersectionObserver" in window)) {
    els.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (en, ob) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); ob.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    els.forEach(function (e) { io.observe(e); });
  }

  if (reduced) { var d = $(".dawn"); if (d) d.style.opacity = .35; return; }
  var gsap = window.gsap, ST = window.ScrollTrigger, Lenis = window.Lenis;
  if (!gsap || !ST) return;
  gsap.registerPlugin(ST);

  if (Lenis) {
    var lenis = new Lenis({ duration: 1.1, easing: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); } });
    lenis.on("scroll", ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* the clock: 23:58 → 07:30 mapped to the night narrative */
  var night = $("#night"), clock = $("#clock-time");
  if (night && clock) {
    var START = 23 * 60 + 58, END = (24 + 7) * 60 + 30, SPAN = END - START; // 572 min
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    ST.create({
      trigger: night, start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: function (self) {
        var m = Math.round(START + SPAN * self.progress) % 1440;
        clock.textContent = pad(Math.floor(m / 60)) + ":" + pad(m % 60);
      }
    });
  }

  /* dawn fades in across the sunrise chapter */
  var dawn = $(".dawn"), sunrise = $("#sunrise");
  if (dawn && sunrise) {
    gsap.fromTo(dawn, { opacity: 0 }, {
      opacity: 1, ease: "none",
      scrollTrigger: { trigger: sunrise, start: "top 85%", end: "center 45%", scrub: true }
    });
  }

  /* chapter time numerals drift up slightly as they pass (quiet parallax) */
  $$(".ch-time").forEach(function (t) {
    gsap.fromTo(t, { y: 30 }, { y: -30, ease: "none",
      scrollTrigger: { trigger: t, start: "top bottom", end: "bottom top", scrub: true } });
  });
})();
