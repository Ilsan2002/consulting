/* Kenius Work Order — dependency-free. Hero form fills itself; reveals; callback form. */
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
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* the work order fills itself out (hero) — types each .type value, ticks boxes, stamps */
  var wo = $("#wo-hero");
  if (wo) {
    var steps = $$(".type", wo), stamp = $(".stamp", wo);
    if (reduced) {
      steps.forEach(function (s) { s.classList.add("on"); });
      $$(".cb", wo).forEach(function (c) { c.classList.add("done"); });
      if (stamp) stamp.classList.add("on");
    } else {
      steps.forEach(function (s) { s.dataset.full = s.textContent; s.textContent = ""; });
      var i = 0;
      var typeStep = function () {
        if (i >= steps.length) {
          $$(".cb[data-tick]", wo).forEach(function (c, n) { setTimeout(function(){ c.classList.add("done"); }, 220 * n); });
          if (stamp) setTimeout(function(){ stamp.classList.add("on"); }, 620);
          return;
        }
        var el = steps[i++], full = el.dataset.full, n = 0;
        el.classList.add("on", "caret");
        var t = setInterval(function () {
          n++; el.textContent = full.slice(0, n);
          if (n >= full.length) { clearInterval(t); el.classList.remove("caret"); setTimeout(typeStep, 160); }
        }, 26);
      };
      setTimeout(typeStep, 500);
    }
  }

  /* callback form — AJAX (Web3Forms), honeypot + in-page confirmation */
  var f = $("form[data-ajax]");
  if (f) {
    var ok = $("#form-success"), sb = f.querySelector('[type="submit"]'), hp = f.querySelector(".hp");
    f.addEventListener("submit", function (e) {
      if (hp && hp.checked) { e.preventDefault(); return; }
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var orig = sb.innerHTML; sb.disabled = true; sb.textContent = "Sending…";
      fetch(f.action, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw 0; f.reset();
          if (ok) { f.hidden = true; ok.hidden = false; ok.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); } })
        .catch(function () {
          sb.disabled = false; sb.innerHTML = orig;
          var m = $(".form-err", f);
          if (!m) { m = document.createElement("p"); m.className = "form-note form-err"; m.style.color = "#8a2b1d"; sb.insertAdjacentElement("afterend", m); }
          m.textContent = "That didn’t send — please email hello@kenius.us instead.";
        });
    });
  }
})();
