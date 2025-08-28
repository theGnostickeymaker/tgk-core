// /scripts/theme-pref.js
(function () {
  try {
    var KEY = 'tgk_theme';
    var saved = localStorage.getItem(KEY);

    // default to system preference if user hasn't chosen yet
    var theme = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

    // apply immediately (pre-CSS) to avoid flash
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    // expose setter for the rest of the site
    window.__tgkSetTheme = function (next) {
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
      localStorage.setItem(KEY, next);
      // optional: announce
      window.dispatchEvent(new CustomEvent('tgk:theme', { detail: { theme: next } }));
    };
  } catch (e) { /* noop */ }
})();
