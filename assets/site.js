/* Marshall Relay — shared site script: sticky nav, mobile menu, reveal on scroll */
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

  var items = doc.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) {
    for (var j = 0; j < items.length; j++) items[j].classList.add('in');
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  for (var k = 0; k < items.length; k++) io.observe(items[k]);
})();
