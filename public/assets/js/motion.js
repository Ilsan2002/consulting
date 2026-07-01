/* Kenius — "Atelier" motion layer (GSAP + Lenis).
   Additive and fully guarded: honors prefers-reduced-motion, and if the
   libraries fail to load the baseline site is completely unaffected.
   Restraint is the brief — a silky scroll and a couple of quiet moments,
   not a page that flies apart. */
(function () {
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var gsap = window.gsap, Lenis = window.Lenis, ST = window.ScrollTrigger;
  if (!gsap || !Lenis) return; // libs missing → leave the static site as-is

  /* ---- Lenis: smooth, weighted scroll (the "award-site" feel) ---- */
  var lenis = new Lenis({
    duration: 1.05,
    easing: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }, // expo-out
    smoothWheel: true
  });

  if (ST) {
    gsap.registerPlugin(ST);
    lenis.on("scroll", ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }

  /* in-page anchor links glide instead of jumping */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (a) {
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    a.addEventListener("click", function (e) {
      var el = document.querySelector(id);
      if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -72 }); }
    });
  });

  if (!ST) return; // the moments below need ScrollTrigger

  /* ---- Hero headline: one refined rise on load (homepage owns its hero) ---- */
  var heroH1 = document.querySelector(".hero h1");
  if (heroH1) gsap.from(heroH1, { yPercent: 5, autoAlpha: 0, duration: 1.2, ease: "power3.out", delay: 0.06 });

  /* ---- Dark interlude: quiet parallax for depth (y only — never touches the
          reveal opacity, so it can't fight the IntersectionObserver layer) ---- */
  gsap.utils.toArray(".dark").forEach(function (section) {
    var inner = section.querySelector(".wrap");
    if (!inner) return;
    gsap.fromTo(inner, { y: 26 }, {
      y: -26, ease: "none",
      scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* ---- Big metric numbers settle up as the work section arrives ---- */
  gsap.utils.toArray(".metric .n").forEach(function (n, i) {
    gsap.from(n, {
      yPercent: 40, autoAlpha: 0, duration: 0.9, ease: "power3.out", delay: (i % 2) * 0.08,
      scrollTrigger: { trigger: n, start: "top 88%" }
    });
  });

  /* keep ScrollTrigger honest if late fonts/images shift the layout */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
}());
