/* Shared language and theme controls; both pages work directly from disk. */
(function () {
  'use strict';
  var root = document.documentElement;
  var english = root.lang === 'en';
  var toggle = document.getElementById('themeToggle');
  var languageLinks = Array.from(document.querySelectorAll('[data-language-base]'));

  function updateLanguageLinks() {
    var query = '?theme=' + (root.dataset.theme === 'dark' ? 'dark' : 'light');
    var hash = location.hash || '#bio';
    languageLinks.forEach(function (link) {
      link.setAttribute('href', link.dataset.languageBase + query + hash);
    });
  }

  function setTheme(dark) {
    root.dataset.theme = dark ? 'dark' : 'light';
    document.getElementById('themeColor').content = dark ? '#17191c' : '#ffffff';
    toggle.setAttribute('aria-pressed', String(dark));
    var label = english
      ? (dark ? 'Switch to light theme' : 'Switch to dark theme')
      : (dark ? '切换至浅色主题' : '切换至深色主题');
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    updateLanguageLinks();
  }

  toggle.addEventListener('click', function () {
    setTheme(root.dataset.theme !== 'dark');
  });
  languageLinks.forEach(function (link) {
    link.addEventListener('click', updateLanguageLinks);
  });
  window.addEventListener('hashchange', updateLanguageLinks);
  window.addEventListener('popstate', updateLanguageLinks);
  document.addEventListener('click', function (event) {
    if (event.target.closest('.top-nav .nav-link, .chapter-index a, a[href^="#"]')) {
      updateLanguageLinks();
    }
  });
  setTheme(root.dataset.theme === 'dark');
})();
