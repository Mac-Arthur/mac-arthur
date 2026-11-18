/* ==========================================================================
   Immanuel Mac-Arthur — Portfolio Behaviour
   Pure vanilla JS. No dependencies.
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById('site-header');
  var backToTop = document.getElementById('back-to-top');

  function onScroll() {
    var scrolled = window.scrollY > 12;
    if (header) header.classList.toggle('is-scrolled', scrolled);
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 480);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.addEventListener('click', function (e) {
      if (e.target.classList.contains('nav-link')) {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Smooth anchor scrolling with header offset ---------- */
  var headerHeight = header ? header.offsetHeight : 76;

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 1;
      window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      history.pushState(null, '', id);
    });
  });

  /* ---------- Scroll reveal via IntersectionObserver ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = el.getAttribute('data-reveal-delay');
          if (delay) el.style.transitionDelay = delay + 'ms';
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Active nav link highlighting ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- Button ripple effect ---------- */
  document.querySelectorAll('.btn-ripple').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var rect = btn.getBoundingClientRect();
      var ripple = document.createElement('span');
      var size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      window.setTimeout(function () { ripple.remove(); }, 650);
    });
  });

  /* ---------- 3D tilt effect on cards ---------- */
  if (!prefersReducedMotion && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var maxTilt = 6;

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          'perspective(900px) rotateX(' + (-y * maxTilt).toFixed(2) + 'deg) ' +
          'rotateY(' + (x * maxTilt).toFixed(2) + 'deg) translateY(-4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ==========================================================================
     Hero — "Guyman Engineer"
     Everything visual is CSS; JS only writes a few variables onto .hero
     (--mx/--my pointer, --sy/--sp scroll, --wm-size) and flips state classes.
     ========================================================================== */
  var hero = document.getElementById('hero');

  if (hero) {
    var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ----- Header floats transparent over the photo ----- */
    var syncHeaderOnHero = function () {
      if (!header) return;
      var onHero = window.scrollY < hero.offsetHeight - header.offsetHeight - 40;
      header.classList.toggle('is-on-hero', onHero);
    };
    window.addEventListener('scroll', syncHeaderOnHero, { passive: true });
    window.addEventListener('resize', syncHeaderOnHero);
    syncHeaderOnHero();

    if (navToggle && header) {
      navToggle.addEventListener('click', function () {
        header.classList.toggle('menu-open', navToggle.getAttribute('aria-expanded') === 'true');
      });
      navMenu && navMenu.addEventListener('click', function (e) {
        if (e.target.classList.contains('nav-link')) header.classList.remove('menu-open');
      });
    }

    /* ----- Fit the wordmark to the viewport ----- */
    var wordmark = hero.querySelector('.hero-wordmark');
    var fitWordmark = function () {
      if (!wordmark) return;
      var stacked = window.innerWidth <= 900;
      var pad = parseFloat(getComputedStyle(hero).getPropertyValue('--hero-pad-x')) || 24;
      var target = window.innerWidth - pad * (stacked ? 1.4 : 1.2);
      hero.style.setProperty('--wm-size', '100px');
      var w = stacked
        ? Math.max.apply(null, Array.prototype.map.call(wordmark.children, function (l) { return l.scrollWidth; }))
        : wordmark.scrollWidth;
      if (!w) return;
      var size = 100 * target / w;
      var cap = window.innerHeight * (stacked ? (window.innerHeight < 740 ? 0.18 : 0.2) : (window.innerHeight < 760 ? 0.27 : 0.31));
      hero.style.setProperty('--wm-size', Math.min(size, cap).toFixed(1) + 'px');
    };
    fitWordmark();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWordmark);
    var fitTimer;
    window.addEventListener('resize', function () {
      clearTimeout(fitTimer);
      fitTimer = setTimeout(fitWordmark, 120);
    });

    /* ----- Intro: wait for the photo + cut-out, then play ----- */
    var startIntro = function () {
      if (hero.classList.contains('is-ready')) return;
      requestAnimationFrame(function () {
        hero.classList.add('is-ready');
        setTimeout(function () { hero.classList.add('is-settled'); }, prefersReducedMotion ? 0 : 3200);
        scramble(hero.querySelector('[data-scramble]'), prefersReducedMotion ? 0 : 1250);
      });
    };
    var heroImgs = hero.querySelectorAll('.hero-bg');
    var pending = heroImgs.length;
    Array.prototype.forEach.call(heroImgs, function (img) {
      var done = function () { if (--pending <= 0) startIntro(); };
      if (img.complete) done();
      else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
    });
    setTimeout(startIntro, 2500); // never hold the page hostage to a slow image

    /* ----- Caption: decode-style text scramble ----- */
    function scramble(el, delay) {
      if (!el || prefersReducedMotion) return;
      var finalText = el.textContent;
      var glyphs = '!<>-_\\/[]{}=+*^?#01ABCDEFGHJKMNPRSTUVWXYZ';
      setTimeout(function () {
        var frame = 0;
        var total = 28;
        (function step() {
          var out = '';
          for (var i = 0; i < finalText.length; i++) {
            var ch = finalText[i];
            if (ch === ' ' || frame > total * (i / finalText.length) + 8) out += ch;
            else out += glyphs[Math.floor(Math.random() * glyphs.length)];
          }
          el.textContent = out;
          if (++frame <= total + 10) requestAnimationFrame(step);
          else el.textContent = finalText;
        })();
      }, delay);
    }
    var caption = hero.querySelector('.hero-caption');
    if (caption && finePointer) {
      caption.addEventListener('mouseenter', function () {
        if (!caption.dataset.busy) {
          caption.dataset.busy = '1';
          scramble(hero.querySelector('[data-scramble]'), 0);
          setTimeout(function () { delete caption.dataset.busy; }, 900);
        }
      });
    }

    /* ----- "> now:" typewriter, cycling work and life ----- */
    var nowEl = document.getElementById('hero-now');
    if (nowEl && !prefersReducedMotion) {
      var phrases = [
        'shipping fintech across Africa',
        'putting the fit together',
        'pulling up to the function',
        'debugging in sunglasses',
        'sketching the next idea',
        'deploying to prod, calmly'
      ];
      var p = 0, c = phrases[0].length, deleting = true;
      var type = function () {
        if (deleting) {
          c--;
          if (c <= 0) { deleting = false; p = (p + 1) % phrases.length; }
        } else {
          c++;
        }
        nowEl.textContent = phrases[p].slice(0, Math.max(c, 0));
        var wait = deleting ? 28 : 55 + Math.random() * 45;
        if (!deleting && c >= phrases[p].length) { deleting = true; wait = 2600; }
        setTimeout(type, wait);
      };
      setTimeout(type, 4200);
    }

    /* ----- Live Accra clock ----- */
    var clockEl = document.getElementById('hero-clock');
    if (clockEl) {
      var tick = function () {
        try {
          clockEl.textContent = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Accra'
          }).format(new Date());
        } catch (err) {
          var d = new Date();
          clockEl.textContent = ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2);
        }
      };
      tick();
      setInterval(tick, 15000);
    }

    /* ----- Scroll + pointer depth (one rAF loop, only while visible) ----- */
    if (!prefersReducedMotion) {
      var target = { x: 0, y: 0 };
      var cur = { x: 0, y: 0 };
      var heroVisible = true;
      var raf = null;

      var loop = function () {
        raf = null;
        var h = hero.offsetHeight || 1;
        var sy = Math.min(Math.max(window.scrollY, 0), h);
        cur.x += (target.x - cur.x) * 0.08;
        cur.y += (target.y - cur.y) * 0.08;
        hero.style.setProperty('--sy', sy.toFixed(1));
        hero.style.setProperty('--sp', (sy / h).toFixed(4));
        hero.style.setProperty('--mx', cur.x.toFixed(4));
        hero.style.setProperty('--my', cur.y.toFixed(4));
        if (Math.abs(target.x - cur.x) > 0.001 || Math.abs(target.y - cur.y) > 0.001) kick();
      };
      var kick = function () { if (!raf && heroVisible) raf = requestAnimationFrame(loop); };

      window.addEventListener('scroll', kick, { passive: true });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          heroVisible = entries[0].isIntersecting;
          if (heroVisible) kick();
        }).observe(hero);
      }

      if (finePointer) {
        hero.addEventListener('pointermove', function (e) {
          var r = hero.getBoundingClientRect();
          target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
          target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
          hero.style.setProperty('--cx', (e.clientX - r.left) + 'px');
          hero.style.setProperty('--cy', (e.clientY - r.top) + 'px');
          hero.classList.add('is-pointer');
          kick();
        });
        hero.addEventListener('pointerleave', function () {
          target.x = 0; target.y = 0;
          hero.classList.remove('is-pointer');
          kick();
        });

        /* Magnetic CTAs */
        hero.querySelectorAll('[data-magnetic]').forEach(function (btn) {
          btn.addEventListener('pointermove', function (e) {
            var r = btn.getBoundingClientRect();
            var dx = e.clientX - (r.left + r.width / 2);
            var dy = e.clientY - (r.top + r.height / 2);
            btn.style.transform = 'translate(' + (dx * 0.22).toFixed(1) + 'px, ' + (dy * 0.3).toFixed(1) + 'px)';
          });
          btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
        });
      }
      kick();
    }
  }

  var blobs = document.querySelectorAll('.blob');
  if (blobs.length && !prefersReducedMotion && matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 2;
      var y = (e.clientY / window.innerHeight - 0.5) * 2;
      blobs.forEach(function (blob, i) {
        var depth = (i + 1) * 6;
        blob.style.transform = 'translate(' + (x * depth) + 'px, ' + (y * depth) + 'px)';
      });
    });
  }

  /* ---------- Lightweight particle field on canvas ---------- */
  var canvas = document.getElementById('particle-canvas');
  if (canvas && canvas.getContext && !prefersReducedMotion) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particleCount = window.innerWidth < 760 ? 40 : 90;
    var rafId = null;

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 1.6 + 0.4,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          a: Math.random() * 0.5 + 0.15
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(13, 13, 13, ' + p.a + ')';
        ctx.fill();
      }
      rafId = requestAnimationFrame(tick);
    }

    var visible = true;
    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden;
      if (visible && !rafId) tick();
      if (!visible && rafId) { cancelAnimationFrame(rafId); rafId = null; }
    });

    resize();
    createParticles();
    tick();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        particleCount = window.innerWidth < 760 ? 40 : 90;
        createParticles();
      }, 200);
    });
  }
})();
