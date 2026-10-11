/* Marshall Relay — shared site script: sticky nav, mobile menu, screenshot galleries, reveal on scroll, privacy contents */
(function () {
  window.MR_READY = true;
  var doc = document;
  var nav = doc.getElementById('nav');

  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var btn = doc.getElementById('menu-btn');
    var menu = doc.getElementById('mobile-menu');
    if (btn && menu) {
      var setOpen = function (open) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        nav.classList.toggle('menu-open', open);
      };
      btn.addEventListener('click', function () {
        setOpen(btn.getAttribute('aria-expanded') !== 'true');
      });
      menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(false);
      });
      doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('menu-open')) { setOpen(false); btn.focus(); }
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth > 860) setOpen(false);
      });
    }
  }

  var years = doc.querySelectorAll('[data-year]');
  for (var i = 0; i < years.length; i++) years[i].textContent = String(new Date().getFullYear());

  /* Home page: screenshot galleries — arrows and progress bar for the native scroll-snap track */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var galleries = doc.querySelectorAll('[data-gallery]');
  for (var g = 0; g < galleries.length; g++) initGallery(galleries[g]);

  function initGallery(root) {
    var track = root.querySelector('.gallery-track');
    var thumb = root.querySelector('.gallery-thumb');
    var prev = root.querySelector('[data-dir="-1"]');
    var next = root.querySelector('[data-dir="1"]');
    var items = track ? track.querySelectorAll('.gallery-item') : [];
    var last = items[items.length - 1];
    if (!prev || !next || !last) return;
    var update = function () {
      var max = track.scrollWidth - track.clientWidth;
      var x = Math.max(0, Math.min(track.scrollLeft, max));
      /* All shots visible (only the end spacer overflows): no arrows, no progress bar */
      var end = last.getBoundingClientRect().right - track.getBoundingClientRect().left + track.scrollLeft;
      var fits = end <= track.clientWidth + 2;
      if (fits && track.scrollLeft) { track.scrollLeft = 0; x = 0; }
      root.classList.toggle('is-static', fits);
      prev.disabled = x < 4;
      next.disabled = x > max - 4;
      if (thumb) {
        var ratio = Math.min(1, track.clientWidth / track.scrollWidth);
        thumb.style.width = (ratio * 100) + '%';
        thumb.style.transform = 'translateX(' + (max > 0 ? (x / max) * (1 / ratio - 1) * 100 : 0) + '%)';
      }
    };
    var go = function (dir) {
      track.scrollBy({ left: dir * track.clientWidth * 0.85, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    update();

    /* Hidden slides load lazily; fetch them once the gallery comes near the screen so swiping never shows blanks */
    if ('IntersectionObserver' in window) {
      var near = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        var imgs = root.querySelectorAll('img[loading="lazy"]');
        for (var i = 0; i < imgs.length; i++) imgs[i].loading = 'eager';
        near.disconnect();
      }, { rootMargin: '300px 0px' });
      near.observe(root);
    }
  }

  /* Privacy page: close the mobile contents list after a tap */
  var tocMobile = doc.querySelector('.toc-mobile');
  if (tocMobile) {
    tocMobile.addEventListener('click', function (e) {
      if (e.target.closest('a')) tocMobile.removeAttribute('open');
    });
  }

  if (!('IntersectionObserver' in window)) {
    var all = doc.querySelectorAll('.rv');
    for (var j = 0; j < all.length; j++) all[j].classList.add('in');
    return;
  }

  /* Privacy page: highlight the current section in the side contents */
  var sideLinks = doc.querySelectorAll('.doc-side a[href^="#"]');
  if (sideLinks.length) {
    var byId = {};
    for (var s = 0; s < sideLinks.length; s++) byId[sideLinks[s].getAttribute('href').slice(1)] = sideLinks[s];
    var setActive = function (id) {
      for (var key in byId) byId[key].classList.toggle('is-active', key === id);
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    for (var id in byId) {
      var target = doc.getElementById(id);
      if (target) spy.observe(target);
    }
  }

  var items = doc.querySelectorAll('.rv');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  for (var k = 0; k < items.length; k++) io.observe(items[k]);
})();
