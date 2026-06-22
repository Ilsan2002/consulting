/* =================================================================
   NORTHLIGHT — interactions
   Vanilla JS, no dependencies. Progressive enhancement:
   everything degrades gracefully without JS and respects
   prefers-reduced-motion.
   ================================================================= */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---- footer year ---- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---- sticky header shadow ---- */
  const header = $(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- mobile nav ---- */
  const body = document.body;
  const toggle = $(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$(".mobile-menu a").forEach((a) =>
      a.addEventListener("click", () => {
        body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---- scroll reveal ---- */
  const revealEls = $$(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---- FAQ accordion ---- */
  $$(".faq-item").forEach((item) => {
    const btn = $(".faq-q", item);
    const panel = $(".faq-a", item);
    if (!btn || !panel) return;
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // close siblings for a cleaner single-open feel
      const group = item.parentElement;
      $$(".faq-item.open", group).forEach((other) => {
        if (other !== item) {
          other.classList.remove("open");
          $(".faq-q", other).setAttribute("aria-expanded", "false");
          $(".faq-a", other).style.height = "0px";
        }
      });
      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      panel.style.height = isOpen ? "0px" : $(".faq-a-inner", panel).offsetHeight + "px";
    });
  });

  /* ---- count-up stats ---- */
  const countEls = $$("[data-count]");
  if (countEls.length) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      const dec = (el.dataset.count.split(".")[1] || "").length;
      if (reduced) {
        el.textContent = prefix + target.toFixed(dec) + suffix;
        return;
      }
      const dur = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (target * eased).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + target.toFixed(dec) + suffix;
      };
      requestAnimationFrame(tick);
    };
    const sio = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    countEls.forEach((el) => sio.observe(el));
  }

  /* ---- Demo widget: tabs + scripted reveal ---- */
  const demo = $(".demo");
  if (demo) {
    const tabs = $$(".demo-tab", demo);
    const panels = $$(".demo-panel", demo);
    let played = {};

    const playPanel = (panel) => {
      const id = panel.id;
      if (played[id]) return;
      played[id] = true;
      const items = $$("[data-seq]", panel);
      if (reduced) {
        items.forEach((it) => it.classList.add("show"));
        return;
      }
      items.forEach((it, i) => {
        setTimeout(() => it.classList.add("show"), 180 + i * 620);
      });
    };

    const select = (i) => {
      tabs.forEach((t, j) => t.setAttribute("aria-selected", String(j === i)));
      panels.forEach((p, j) => {
        const active = j === i;
        p.hidden = !active;
        if (active) playPanel(p);
      });
    };

    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(i));
      t.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const dir = e.key === "ArrowRight" ? 1 : -1;
          const next = (i + dir + tabs.length) % tabs.length;
          tabs[next].focus();
          select(next);
        }
      });
    });

    // play the first panel once it scrolls into view
    if ("IntersectionObserver" in window && !reduced) {
      const dio = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const active = panels.find((p) => !p.hidden);
              if (active) playPanel(active);
              obs.disconnect();
            }
          });
        },
        { threshold: 0.3 }
      );
      dio.observe(demo);
    } else {
      const active = panels.find((p) => !p.hidden);
      if (active) playPanel(active);
    }
  }

  /* ---- smooth-close mobile menu on resize to desktop ---- */
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (window.innerWidth >= 920) {
        body.classList.remove("nav-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
      // recompute open FAQ heights
      $$(".faq-item.open").forEach((item) => {
        const panel = $(".faq-a", item);
        panel.style.height = $(".faq-a-inner", panel).offsetHeight + "px";
      });
    }, 150);
  });
})();
