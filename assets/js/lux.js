/* Kenius — "Atelier" interactions. Minimal, progressive, reduced-motion aware. */
(function () {
  "use strict";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header hairline on scroll */
  var hdr = $(".hdr");
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle("stuck", scrollY > 12); };
    onScroll(); addEventListener("scroll", onScroll, { passive: true });
  }

  /* mobile overlay */
  var body = document.body, btn = $(".menu-btn");
  if (btn) {
    btn.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", String(open));
    });
    $$(".overlay a").forEach(function (a) {
      a.addEventListener("click", function () { body.classList.remove("nav-open"); btn.setAttribute("aria-expanded", "false"); });
    });
  }

  /* scroll reveals */
  var els = $$(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    els.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (en, ob) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); ob.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* very subtle hero settle on load */
  if (!reduced) {
    var h1 = $(".hero h1");
    if (h1) { h1.style.opacity = 0; h1.style.transform = "translateY(14px)";
      requestAnimationFrame(function () {
        h1.style.transition = "opacity 1.1s cubic-bezier(.22,.7,.3,1) .1s, transform 1.2s cubic-bezier(.22,.7,.3,1) .1s";
        requestAnimationFrame(function(){ h1.style.opacity = 1; h1.style.transform = "none"; });
      });
    }
  }

  /* close overlay on resize to desktop */
  addEventListener("resize", function () {
    if (innerWidth >= 900) { body.classList.remove("nav-open"); if (btn) btn.setAttribute("aria-expanded", "false"); }
  });
})();
