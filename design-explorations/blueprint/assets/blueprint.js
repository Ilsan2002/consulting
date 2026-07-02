/* Kenius Blueprint — minimal, dependency-free. Reveals, year, RFI form. */
(function () {
  "use strict";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  var els = $$(".rv");
  if (reduced || !("IntersectionObserver" in window)) {
    els.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (en, ob) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); ob.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* RFI form — AJAX (Web3Forms), honeypot + in-page revision log */
  var f = $("form[data-ajax]");
  if (f) {
    var ok = $("#form-success"), sb = f.querySelector('[type="submit"]'), hp = f.querySelector(".hp");
    f.addEventListener("submit", function (e) {
      if (hp && hp.checked) { e.preventDefault(); return; }
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var orig = sb.innerHTML; sb.disabled = true; sb.textContent = "Transmitting…";
      fetch(f.action, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw 0; f.reset();
          if (ok) { f.hidden = true; ok.hidden = false; ok.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); } })
        .catch(function () {
          sb.disabled = false; sb.innerHTML = orig;
          var m = $(".form-err", f);
          if (!m) { m = document.createElement("p"); m.className = "form-note form-err"; m.style.color = "#8a3b2e"; sb.insertAdjacentElement("afterend", m); }
          m.textContent = "Transmission failed — please email hello@kenius.us instead.";
        });
    });
  }
})();
