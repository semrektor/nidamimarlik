/* NIDA MIMARLIK — shared site behavior */
(function () {
  'use strict';

  /* Sticky nav: solidify after leaving the top of the page */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 40) nav.classList.add('is-solid');
      else nav.classList.remove('is-solid');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile menu toggle */
  var toggle = document.querySelector('.nav__toggle');
  var mobileMenu = document.querySelector('.nav__mobile');
  if (toggle && mobileMenu) {
    var closeMenu = function () {
      toggle.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    toggle.addEventListener('click', function () {
      var open = toggle.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* Active nav link highlighting based on current path */
  var current = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href) return;
    var page = href.split('/').pop();
    if (page === current || (current === '' && page === 'index.html')) {
      a.classList.add('is-active');
    }
  });

  /* Scroll-reveal */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el, i) {
      el.style.setProperty('--i', i % 6);
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Marquee: duplicate content once so the 50% loop is seamless */
  document.querySelectorAll('.marquee__track').forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* Footer year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Contact form: no backend — hand off to the visitor's mail client */
  var form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#cf-name').value.trim();
      var email = form.querySelector('#cf-email').value.trim();
      var phone = form.querySelector('#cf-phone').value.trim();
      var message = form.querySelector('#cf-message').value.trim();
      var note = form.querySelector('.form-note');

      if (!name || !email || !message) {
        note.textContent = 'Lütfen isim, e-posta ve mesaj alanlarını doldurun.';
        note.classList.remove('is-ok');
        return;
      }

      var to = 'nidamimarlik1@gmail.com';
      var subject = 'Web sitesi iletişim formu — ' + name;
      var body =
        'İsim: ' + name + '\n' +
        'E-posta: ' + email + '\n' +
        (phone ? 'Telefon: ' + phone + '\n' : '') +
        '\nMesaj:\n' + message;

      window.location.href =
        'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

      note.textContent = 'E-posta uygulamanız açılıyor — mesajınızı gönderdiğinizde bize ulaşacak.';
      note.classList.add('is-ok');
    });
  }
})();
