(function() {
  'use strict';

  const root = document.documentElement;
  const panels = Array.from(document.querySelectorAll('.site-panel'));
  const links = Array.from(document.querySelectorAll('.top-nav .nav-link'));
  const honorsAnchors = ['competitions', 'awards'];
  const english = root.lang === 'en';
  const titles = english
    ? { bio: 'Bio', honors: 'Honors', projects: 'Projects', life: 'Life' }
    : { bio: '简介', honors: '荣誉', projects: '项目', life: '生活' };
  const siteName = document.querySelector('.name-lettering').textContent.trim();
  const rail = document.querySelector('.nav-left');
  const readingNav = document.querySelector('.chapter-index');
  const readingTrack = readingNav.querySelector('.reading-track');
  const readingLinks = Array.from(readingNav.querySelectorAll('a'));
  const readingSections = honorsAnchors.map(function(id) { return document.getElementById(id); });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scrollFrame = 0;
  let readingFrame = 0;

  function resolve(hash) {
    const id = hash.replace(/^#/, '');
    if (honorsAnchors.includes(id)) return { panel: 'honors', anchor: id };
    if (id === 'about' || id === 'experience' || id === 'education') return { panel: 'bio', anchor: id };
    return { panel: Object.prototype.hasOwnProperty.call(titles, id) ? id : 'bio' };
  }

  function updateRail() {
    const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
    rail.classList.toggle('can-scroll-left', rail.scrollLeft > 2);
    rail.classList.toggle('can-scroll-right', rail.scrollLeft < max - 2);
  }

  function honorsOffset() {
    return document.querySelector('.top-nav').offsetHeight + readingNav.offsetHeight + 16;
  }

  function updateReadingProgress() {
    readingFrame = 0;
    if (root.dataset.panel !== 'honors') return;
    const y = window.scrollY;
    const offset = honorsOffset();
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const stops = readingSections.map(function(section) {
      return Math.max(0, Math.min(maxScroll, section.getBoundingClientRect().top + y - offset));
    });
    let current = 0;
    stops.forEach(function(stop, index) { if (y >= stop - 1) current = index; });
    const next = Math.min(current + 1, stops.length - 1);
    const distance = stops[next] - stops[current];
    const fraction = distance > 0 ? Math.max(0, Math.min(1, (y - stops[current]) / distance)) : 0;
    const progress = (current + fraction) / (stops.length - 1);
    readingNav.style.setProperty('--reading-progress', progress.toFixed(4));
    readingTrack.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    readingTrack.setAttribute('aria-valuetext', readingLinks[current].textContent.trim());
    readingLinks.forEach(function(link, index) {
      link.classList.toggle('is-reached', index <= current);
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function requestReadingUpdate() {
    if (root.dataset.panel !== 'honors' || readingFrame) return;
    readingFrame = requestAnimationFrame(updateReadingProgress);
  }

  function showChapter(moveToContent, smoothAnchor) {
    const route = resolve(location.hash);
    const sameChapter = root.dataset.panel === route.panel;
    root.dataset.panel = route.panel;
    panels.forEach(function(panel) { panel.hidden = panel.id !== route.panel; });
    links.forEach(function(link) {
      const active = link.hash === '#' + route.panel;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = titles[route.panel] + ' · ' + siteName;
    updateRail();
    requestReadingUpdate();

    cancelAnimationFrame(scrollFrame);
    if (!moveToContent) return;
    scrollFrame = requestAnimationFrame(function() {
      const panel = document.getElementById(route.panel);
      const destination = route.anchor ? document.getElementById(route.anchor) : panel;
      const heading = destination.querySelector('h2, h3');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
      const navHeight = document.querySelector('.top-nav').getBoundingClientRect().height;
      const inset = window.innerWidth <= 1080 ? 16 : 28;
      const offset = route.panel === 'honors' && route.anchor ? honorsOffset() : navHeight + inset;
      const top = destination.getBoundingClientRect().top + window.scrollY - offset;
      const smooth = smoothAnchor && sameChapter && route.anchor && !reducedMotion.matches;
      window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'instant' });
      requestReadingUpdate();
    });
  }

  document.addEventListener('click', function(event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    if (link.hash === '#main-content') {
      event.preventDefault();
      showChapter(true);
      return;
    }
    const id = link.hash.slice(1);
    if (!Object.prototype.hasOwnProperty.call(titles, id) &&
        id !== 'about' && id !== 'experience' && id !== 'education' &&
        !honorsAnchors.includes(id)) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    showChapter(true, true);
  });

  window.addEventListener('hashchange', function() { showChapter(true); });
  window.addEventListener('popstate', function() { showChapter(true); });
  window.addEventListener('resize', updateRail, { passive: true });
  window.addEventListener('scroll', requestReadingUpdate, { passive: true });
  window.addEventListener('resize', requestReadingUpdate, { passive: true });
  window.addEventListener('load', requestReadingUpdate);
  if ('ResizeObserver' in window) {
    const readingObserver = new ResizeObserver(requestReadingUpdate);
    readingObserver.observe(document.getElementById('honors'));
  }
  rail.addEventListener('scroll', updateRail, { passive: true });
  showChapter(Boolean(location.hash));
})();
