(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const header = $('#header');
  const navigation = $('#navigation');
  const menuToggle = $('.menu-toggle');
  const themedSections = $$('[data-header-theme]');
  let headerFrame = 0;
  let menuOpener = null;
  let navigationTarget = null;

  function updateHeader() {
    headerFrame = 0;
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 24);
    if (navigation?.open) {
      header.classList.remove('light');
      return;
    }
    const sampleY = Math.max(1, header.getBoundingClientRect().bottom / 2);
    let theme = 'dark';
    for (const section of themedSections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= sampleY && rect.bottom > sampleY) {
        theme = section.dataset.headerTheme;
        break;
      }
    }
    header.classList.toggle('light', theme === 'light');
  }

  function scheduleHeaderUpdate() {
    if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
  }

  window.addEventListener('scroll', scheduleHeaderUpdate, { passive: true });
  window.addEventListener('resize', scheduleHeaderUpdate, { passive: true });

  function focusDestination(target) {
    if (!target?.isConnected) return;
    const needsTabIndex = !target.hasAttribute('tabindex') &&
      !target.matches('a[href], button, input, select, textarea, summary');
    if (needsTabIndex) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
    target.focus({ preventScroll: true });
  }

  function closeNavigation() {
    if (navigation?.open) navigation.close();
  }

  if (navigation && menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.addEventListener('click', () => {
      if (navigation.open) {
        closeNavigation();
        return;
      }
      menuOpener = document.activeElement;
      navigationTarget = null;
      navigation.showModal();
      document.body.classList.add('overlay-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      updateHeader();
      navigation.querySelector('.nav-close')?.focus({ preventScroll: true });
    });

    navigation.querySelector('.nav-close')?.addEventListener('click', closeNavigation);
    navigation.addEventListener('close', () => {
      document.body.classList.remove('overlay-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      updateHeader();
      const destination = navigationTarget;
      const opener = menuOpener;
      navigationTarget = null;
      menuOpener = null;
      requestAnimationFrame(() => {
        if (navigation.open) return;
        if (destination) focusDestination(destination);
        else if (opener?.isConnected) opener.focus({ preventScroll: true });
      });
    });

    navigation.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (link) {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          try {
            navigationTarget = document.getElementById(decodeURIComponent(href.slice(1)));
          } catch {
            navigationTarget = null;
          }
        }
        closeNavigation();
        return;
      }
      if (event.target === navigation) {
        const rect = navigation.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom) closeNavigation();
      }
    });
  }

  const email = 'hello@kenius.co';
  const copyStatus = $('.copy-status');
  if (copyStatus) {
    copyStatus.setAttribute('role', 'status');
    copyStatus.setAttribute('aria-live', 'polite');
    copyStatus.setAttribute('aria-atomic', 'true');
  }
  $$('.copy-email').forEach((button) => {
    button.addEventListener('click', async () => {
      if (copyStatus) copyStatus.textContent = '';
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(email);
        if (copyStatus) copyStatus.textContent = 'Адрес скопирован: hello@kenius.co';
      } catch {
        if (copyStatus) copyStatus.textContent = 'Скопируйте адрес: hello@kenius.co';
      }
    });
  });

  updateHeader();
})();
