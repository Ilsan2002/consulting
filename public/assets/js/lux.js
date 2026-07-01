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

  /* hero entrance is owned by the motion layer (assets/js/motion.js) when GSAP
     is present; without it the headline simply renders in place. */

  /* close overlay on resize to desktop */
  addEventListener("resize", function () {
    if (innerWidth >= 900) { body.classList.remove("nav-open"); if (btn) btn.setAttribute("aria-expanded", "false"); }
  });

  /* contact form — AJAX (Web3Forms), honeypot + in-page success */
  var cform = $("form[data-ajax]");
  if (cform) {
    var ok = $("#form-success"), sb = cform.querySelector('[type="submit"]'), hp = cform.querySelector(".hp");
    cform.addEventListener("submit", function (e) {
      if (hp && hp.checked) { e.preventDefault(); return; }
      e.preventDefault();
      if (!cform.checkValidity()) { cform.reportValidity(); return; }
      var orig = sb.innerHTML; sb.disabled = true; sb.textContent = "Sending…";
      fetch(cform.action, { method: "POST", body: new FormData(cform), headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw 0; cform.reset();
          if (ok) { cform.hidden = true; ok.hidden = false; ok.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); } })
        .catch(function () {
          sb.disabled = false; sb.innerHTML = orig;
          var m = $(".form-err", cform);
          if (!m) { m = document.createElement("p"); m.className = "form-note form-err"; m.style.color = "#9C3B2E"; sb.insertAdjacentElement("afterend", m); }
          m.textContent = "Sorry — that didn't send. Please email hello@kenius.us instead.";
        });
    });
  }

  /* live ops ledger (homepage hero) — a continuously updating status feed.
     Paused entirely under reduced-motion and while the tab is hidden. */
  var lrows = $(".ledger-rows");
  if (lrows && !reduced) {
    var POOL = [
      ["property-mgmt", "“leak under the sink, 2C”", "plumber booked"],
      ["real-estate", "“is 214 Oak still available?”", "tour booked"],
      ["hvac", "“AC out, two kids home”", "tech en route"],
      ["e-commerce", "wrong size · needs exchange", "return started"],
      ["law", "fees and process question", "answered"],
      ["accounting", "“can you file my extension?”", "scheduled"],
      ["roofing", "storm-damage photos", "quote sent"],
      ["freight", "“where’s my load #LT-4471?”", "ETA sent"],
      ["freight", "carrier check-in · dock 7", "scheduled"],
      ["property-mgmt", "lease-renewal question", "answered"],
      ["real-estate", "portal lead · 3BR, pre-approved", "qualified"],
      ["hvac", "missed call · 11:58pm", "called back"],
      ["e-commerce", "“where’s my order #7710?”", "tracking sent"],
      ["law", "conflict check · new matter", "cleared"],
      ["accounting", "1099 chase · reminder 2", "docs in"],
      ["property-mgmt", "“no hot water, unit 9”", "dispatched"]
    ];
    var vmin = 6 * 60 + 39, pi = 0;
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var fmt = function (m) { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); };
    var makeRow = function () {
      vmin += 1 + Math.floor(Math.random() * 6);
      var e = POOL[pi % POOL.length]; pi++;
      var li = document.createElement("li");
      li.className = "enter fresh";
      li.innerHTML = "<time>" + fmt(vmin) + "</time><span class='dom'>" + e[0] +
        "</span><span class='msg'>" + e[1] + "</span><span class='st'>" + e[2] + "</span>";
      return li;
    };
    var step = function () {
      if (document.hidden) return;
      var prev = lrows.querySelector("li.fresh"); if (prev) prev.classList.remove("fresh");
      lrows.insertBefore(makeRow(), lrows.firstChild);
      while (lrows.children.length > 5) lrows.removeChild(lrows.lastChild);
    };
    setTimeout(function () { setInterval(step, 3400); }, 3200);
  }
})();
