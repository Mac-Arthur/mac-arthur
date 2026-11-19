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
    /* Optional hero-look switch: uncomment with the silhouette and switch markup in index.html.
    var heroLookButtons = Array.prototype.slice.call(hero.querySelectorAll('button[data-hero-look]'));
    hero.querySelector('.hero-look-switch').hidden = false;
    var heroLookRequest = 0;
    heroLookButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var request = ++heroLookRequest;
        var look = button.getAttribute('data-hero-look');
        var photo = hero.querySelector(look === 'print' ? '.hero-portrait-image' : '.hero-silhouette img');
        var ready = photo.decode ? photo.decode().catch(function () {}) : Promise.resolve();
        ready.then(function () {
          if (request !== heroLookRequest) return;
          hero.setAttribute('data-hero-look', look);
          heroLookButtons.forEach(function (option) { option.setAttribute('aria-pressed', String(option === button)); });
        });
      });
    });

    */

    var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ----- Header floats transparent over the photo ----- */
    var darkSections = document.querySelectorAll('[data-header-dark]');
    var syncHeaderOnHero = function () {
      if (!header) return;
      var hh = header.offsetHeight;
      var onHero = window.scrollY < hero.offsetHeight - hh - 40;
      var onDark = Array.prototype.some.call(darkSections, function (s) {
        var r = s.getBoundingClientRect();
        return r.top <= hh * 0.5 && r.bottom >= hh;
      });
      header.classList.toggle('is-on-hero', onHero || onDark);
      if (backToTop) backToTop.classList.toggle('is-muted', onDark);
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
    var wordmarkViewportWidth = window.innerWidth;
    var wordmarkViewportHeight = window.innerHeight;
    window.addEventListener('resize', function () {
      if (!finePointer && window.innerWidth === wordmarkViewportWidth && Math.abs(window.innerHeight - wordmarkViewportHeight) < 150) return;
      wordmarkViewportWidth = window.innerWidth;
      wordmarkViewportHeight = window.innerHeight;
      clearTimeout(fitTimer);
      fitTimer = setTimeout(fitWordmark, 120);
    });

    /* ----- Intro: wait for the main JPEG, then play ----- */
    var startIntro = function () {
      if (hero.classList.contains('is-ready')) return;
      requestAnimationFrame(function () {
        hero.classList.add('is-ready');
        setTimeout(function () { hero.classList.add('is-settled'); }, prefersReducedMotion ? 0 : 3200);
        scramble(hero.querySelector('[data-scramble]'), prefersReducedMotion ? 0 : 1250);
      });
    };
    var heroImgs = hero.querySelectorAll('.hero-bg, .hero-silhouette img');
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
          var magneticRect = null;
          btn.addEventListener('pointerenter', function () { magneticRect = btn.getBoundingClientRect(); });
          btn.addEventListener('pointermove', function (e) {
            var r = magneticRect || btn.getBoundingClientRect();
            var dx = e.clientX - (r.left + r.width / 2);
            var dy = e.clientY - (r.top + r.height / 2);
            btn.style.transform = 'translate(' + (dx * 0.22).toFixed(1) + 'px, ' + (dy * 0.3).toFixed(1) + 'px)';
          });
          btn.addEventListener('pointerleave', function () { btn.style.transform = ''; magneticRect = null; });
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
  /* ==========================================================================
     About — scroll-filled heading, 9–5 / after-5 mode switch, stat counters
     ========================================================================== */
  var about = document.getElementById('about');

  if (about) {
    var hasIO = 'IntersectionObserver' in window;

    /* --- Heading: each word fills in from faint to ink as it scrolls up. --- */
    var aboutTitle = about.querySelector('[data-words]');
    var words = [];
    if (aboutTitle && hasIO && !prefersReducedMotion) {
      Array.prototype.slice.call(aboutTitle.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          var frag = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'w';
            w.textContent = part;
            frag.appendChild(w);
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === 1) {
          node.classList.add('w');   /* <em>, highlighter: one unit each */
        }
      });
      words = Array.prototype.slice.call(aboutTitle.querySelectorAll('.w'));
    }

    var titleRaf = null;
    var titleNear = false;
    var renderTitle = function () {
      titleRaf = null;
      var vh = window.innerHeight;
      var r = aboutTitle.getBoundingClientRect();
      /* 0 when the heading's top sits at 90% of the viewport, 1 at 35%. */
      var p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.55)));
      var n = words.length;
      words.forEach(function (w, i) {
        var a = Math.min(1, Math.max(0, p * (n + 1.5) - i));
        w.style.setProperty('--a', a.toFixed(3));
        if (w.classList.contains('about-mark')) w.style.setProperty('--mark', a.toFixed(3));
      });
    };
    var kickTitle = function () { if (!titleRaf && titleNear) titleRaf = requestAnimationFrame(renderTitle); };

    if (words.length) {
      renderTitle();
      new IntersectionObserver(function (entries) {
        titleNear = entries[0].isIntersecting;
        kickTitle();
      }, { rootMargin: '20% 0px 20% 0px' }).observe(aboutTitle);
      window.addEventListener('scroll', kickTitle, { passive: true });
      window.addEventListener('resize', kickTitle);
    }

    /* --- Mode switch: circular wipe that grows out of the pressed button. --- */
    var modeBtns = Array.prototype.slice.call(about.querySelectorAll('[data-set-mode]'));
    var photo = about.querySelector('.about-photo');
    var cycleTimer = null;
    var userTook = false;
    var resumeTimer = null;
    var visualInView = false;
    var CYCLE = 5200;

    var setMode = function (mode) {
      var btn = about.querySelector('[data-set-mode="' + mode + '"]');
      if (btn && photo) {
        var b = btn.getBoundingClientRect();
        var f = photo.getBoundingClientRect();
        photo.style.setProperty('--cx', (b.left + b.width / 2 - f.left) + 'px');
        photo.style.setProperty('--cy', (b.top + b.height / 2 - f.top) + 'px');
      }
      about.setAttribute('data-mode', mode);
      modeBtns.forEach(function (b2) {
        b2.setAttribute('aria-pressed', String(b2.getAttribute('data-set-mode') === mode));
      });
    };

    var stopCycle = function () {
      clearInterval(cycleTimer);
      cycleTimer = null;
      about.classList.remove('is-cycling');
    };
    var startCycle = function () {
      if (cycleTimer || userTook || prefersReducedMotion || document.hidden || !visualInView) return;
      about.style.setProperty('--cycle', CYCLE + 'ms');
      /* restart the progress bar in step with the timer */
      about.classList.remove('is-cycling');
      void about.offsetWidth;
      about.classList.add('is-cycling');
      cycleTimer = setInterval(function () {
        setMode(about.getAttribute('data-mode') === 'work' ? 'life' : 'work');
      }, CYCLE);
    };

    if (modeBtns.length) {
      about.classList.add('is-live');
      if (prefersReducedMotion) about.style.setProperty('--wipe', '1ms');

      modeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          userTook = true;
          stopCycle();
          setMode(btn.getAttribute('data-set-mode'));
          /* hand control back to the auto-cycle after a quiet spell */
          clearTimeout(resumeTimer);
          resumeTimer = setTimeout(function () { userTook = false; startCycle(); }, 12000);
        });
      });

      var visual = about.querySelector('.about-visual');
      if (hasIO && visual) {
        new IntersectionObserver(function (entries) {
          var e = entries[entries.length - 1];
          /* a tall visual on a short screen can never reach 55% of itself, so also accept "fills half the viewport" */
          visualInView = e.isIntersecting && (e.intersectionRatio >= 0.4 || e.intersectionRect.height >= window.innerHeight * 0.5);
          if (visualInView) startCycle(); else stopCycle();
        }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1] }).observe(visual);
      }
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stopCycle(); else startCycle();
      });
    }

    /* --- Stat counters: 00 → target when the strip scrolls in. --- */
    var counters = about.querySelectorAll('[data-count]');
    if (counters.length && hasIO && !prefersReducedMotion) {
      var countIO = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-count'), 10);
          var t0 = null;
          var DUR = 1100;
          el.textContent = '00';
          (function step(t) {
            if (t0 === null) t0 = t;
            var k = Math.min(1, (t - t0) / DUR);
            var eased = 1 - Math.pow(1 - k, 3);
            var v = Math.round(target * eased);
            el.textContent = (v < 10 ? '0' : '') + v;
            if (k < 1) requestAnimationFrame(step);
          })(performance.now());
        });
      }, { threshold: 0.6 });
      Array.prototype.forEach.call(counters, function (el) { countIO.observe(el); });
    }
  }

  /* Contact: copy the same address used by the email link. */
  var copyEmail = document.querySelector('.contact-copy');
  if (copyEmail && navigator.clipboard && window.isSecureContext) {
    copyEmail.hidden = false;
    copyEmail.addEventListener('click', function () {
      var status = document.querySelector('.contact-copy-status');
      var address = document.querySelector('.contact-email').getAttribute('href').replace('mailto:', '');
      navigator.clipboard.writeText(address).then(function () {
        status.textContent = 'Email copied. Ready when you are.';
      }).catch(function () {
        status.textContent = 'Couldn’t copy — use the email link above.';
      });
    });
  }

  /* Education albums: native dialog, per-school navigation and original-file fallback. */
  var gradDialog = document.querySelector('.grad-dialog');
  if (gradDialog && typeof gradDialog.showModal === 'function') {
    var allGradLinks = Array.prototype.slice.call(document.querySelectorAll('[data-grad-photo]'));
    var gradLinks = [];
    var gradAlbumTitle = ''; 
    var gradImage = gradDialog.querySelector('.grad-dialog-image');
    var gradCaption = gradDialog.querySelector('.grad-dialog-caption');
    var gradIndex = 0;
    var gradOverflow = '';
    var showGrad = function (index) {
      gradIndex = (index + gradLinks.length) % gradLinks.length;
      var source = gradLinks[gradIndex].querySelector('img');
      gradImage.src = source.src;
      gradImage.alt = source.alt;
      gradCaption.textContent = gradAlbumTitle + ' · 0' + (gradIndex + 1) + ' / 0' + gradLinks.length;
    };
    allGradLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        var album = link.closest('[data-gallery-title]');
        gradLinks = Array.prototype.slice.call(album.querySelectorAll('[data-grad-photo]'));
        gradAlbumTitle = album.getAttribute('data-gallery-title');
        showGrad(gradLinks.indexOf(link));
        gradOverflow = document.documentElement.style.overflow;
        gradDialog.showModal();
        document.documentElement.style.overflow = 'hidden';
      });
    });
    gradDialog.querySelector('.grad-close').addEventListener('click', function () { gradDialog.close(); });
    gradDialog.querySelector('.grad-prev').addEventListener('click', function () { showGrad(gradIndex - 1); });
    gradDialog.querySelector('.grad-next').addEventListener('click', function () { showGrad(gradIndex + 1); });
    gradDialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showGrad(gradIndex + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    gradDialog.addEventListener('click', function (event) {
      if (event.target !== gradDialog) return;
      var rect = gradDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) gradDialog.close();
    });
    gradDialog.addEventListener('close', function () { document.documentElement.style.overflow = gradOverflow; });
  }

  /* Projects: accessible category filters and in-view sketch animation. */
  var projects = document.getElementById('projects');
  if (projects) {
    var projectCards = Array.prototype.slice.call(projects.querySelectorAll('.project-card'));
    var projectFilters = Array.prototype.slice.call(projects.querySelectorAll('[data-project-filter]'));
    var projectResults = projects.querySelector('.project-results');
    projects.querySelector('.project-controls').hidden = false;
    projectFilters.forEach(function (button) {
      button.addEventListener('click', function () {
        var category = button.getAttribute('data-project-filter');
        var count = 0;
        projectCards.forEach(function (card) {
          var matches = category === 'all' || card.getAttribute('data-project-category') === category;
          card.hidden = !matches;
          if (matches) count++;
        });
        projectFilters.forEach(function (filter) { filter.setAttribute('aria-pressed', String(filter === button)); });
        projectResults.textContent = count + (count === 1 ? ' project' : ' projects');
      });
    });
    if (hasIO && !prefersReducedMotion) {
      var projectIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { entry.target.classList.toggle('is-in-view', entry.isIntersecting); });
      }, { threshold: 0.1 });
      projectCards.forEach(function (card) { projectIO.observe(card); });
    }
  }

  /* Experience: scroll progress and a quiet pointer-following light. */
  var experience = document.getElementById('experience');
  if (experience) {
    var careerTrack = experience.querySelector('.timeline');
    var careerRows = Array.prototype.slice.call(experience.querySelectorAll('.timeline-item'));
    var careerVisible = false;
    var careerFrame = 0;
    var paintCareer = function () {
      careerFrame = 0;
      if (!careerVisible) return;
      var trackRect = careerTrack.getBoundingClientRect();
      var readingLine = window.innerHeight * 0.55;
      var progress = Math.max(0, Math.min(1, (readingLine - trackRect.top) / trackRect.height));
      experience.style.setProperty('--career-progress', progress.toFixed(4));
      var nearest = 0;
      careerRows.forEach(function (row, i) {
        if (row.getBoundingClientRect().top <= readingLine) nearest = i;
      });
      careerRows.forEach(function (row, i) { row.classList.toggle('is-active', i === nearest); });
    };
    var queueCareer = function () {
      if (careerVisible && !careerFrame) careerFrame = requestAnimationFrame(paintCareer);
    };
    if (hasIO) {
      new IntersectionObserver(function (entries) {
        careerVisible = entries[0].isIntersecting;
        experience.classList.toggle('is-in-view', careerVisible);
        queueCareer();
      }).observe(experience);
    } else {
      careerVisible = true;
      queueCareer();
    }
    window.addEventListener('scroll', queueCareer, { passive: true });
    window.addEventListener('resize', queueCareer);
    if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      careerRows.forEach(function (row) {
        var card = row.querySelector('.timeline-content');
        card.addEventListener('pointermove', function (event) {
          var rect = card.getBoundingClientRect();
          card.style.setProperty('--pointer-x', (event.clientX - rect.left) + 'px');
          card.style.setProperty('--pointer-y', (event.clientY - rect.top) + 'px');
        });
      });
    }
  }

  /* ==========================================================================
     Off the clock — pinned horizontal gallery + lightbox
     Pinned mode: the section is made as tall as the track is wide, the stage
     sticks, and vertical scroll is mapped to the track's translateX.
     Reduced motion / no IO: it stays a native swipeable row.
     ========================================================================== */
  var life = document.getElementById('life');

  if (life) {
    var lifePin = life.querySelector('.life-pin');
    var lifeViewport = life.querySelector('.life-viewport');
    var lifeTrack = life.querySelector('.life-track');
    var lifeGhost = life.querySelector('.life-ghost-track');
    var lifeItems = Array.prototype.slice.call(life.querySelectorAll('.life-track > li'));
    var lifeChips = Array.prototype.slice.call(life.querySelectorAll('[data-goto]'));
    var lifePinned = !prefersReducedMotion && 'IntersectionObserver' in window;
    var lifeDist = 0;
    var lifeChapter = null;
    var lifeRaf = null;
    var lifeNear = false;
    var lifeHeight = 0;

    var setChapter = function (name) {
      if (!name || name === lifeChapter) return;
      lifeChapter = name;
      lifeChips.forEach(function (chip) {
        var on = chip.getAttribute('data-goto') === name;
        chip.classList.toggle('is-active', on);
        if (on && chip.scrollIntoView && lifePinned) {
          var nav = chip.parentNode;
          nav.scrollTo({ left: chip.offsetLeft - nav.clientWidth / 2 + chip.offsetWidth / 2, behavior: 'smooth' });
        }
      });
    };

    var trackContentWidth = function () {
      var last = lifeItems[lifeItems.length - 1];
      return last.offsetLeft + last.offsetWidth + parseFloat(getComputedStyle(lifeTrack).paddingRight || 0);
    };

    /* Self-healing: re-measure from live layout so late image loads, font swaps
       or mobile toolbar changes can never leave a stale distance behind. */
    var syncLifeDist = function () {
      var dist = Math.max(0, trackContentWidth() - lifePin.clientWidth);
      var h = lifePin.offsetHeight + dist;
      if (Math.abs(dist - lifeDist) > 1 || Math.abs(h - lifeHeight) > 1) {
        lifeDist = dist;
        lifeHeight = h;
        life.style.height = h + 'px';
      }
    };

    var renderLife = function () {
      lifeRaf = null;
      var vw = window.innerWidth;
      if (lifePinned) {
        syncLifeDist();
        var r = life.getBoundingClientRect();
        var p = lifeDist ? Math.min(Math.max(-r.top / lifeDist, 0), 1) : 0;
        var x = -p * lifeDist;
        lifeTrack.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
        if (lifeGhost) lifeGhost.style.transform = 'translate3d(' + (x * 0.35).toFixed(1) + 'px,0,0)';
        life.style.setProperty('--life-p', p.toFixed(4));
      }
      var best = null, bestD = Infinity;
      lifeItems.forEach(function (item) {
        var ir = item.getBoundingClientRect();
        if (ir.right < -300 || ir.left > vw + 300) return;
        var c = (ir.left + ir.width / 2 - vw / 2) / vw;
        item.style.setProperty('--px', Math.max(-1, Math.min(1, c)).toFixed(3));
        var d = Math.abs(ir.left + ir.width / 2 - vw * 0.5);
        if (item.dataset.chapter && d < bestD) { bestD = d; best = item.dataset.chapter; }
      });
      setChapter(best || 'Fits');
    };
    var kickLife = function () { if (!lifeRaf && lifeNear) lifeRaf = requestAnimationFrame(renderLife); };

    var measureLife = function () {
      if (!lifePinned) { renderLife(); return; }
      life.classList.add('is-pinned');
      lifeHeight = 0;
      renderLife();
    };

    measureLife();
    window.addEventListener('load', measureLife);
    window.addEventListener('pageshow', function (e) { if (e.persisted) measureLife(); });
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { kickLife(); }).observe(lifeTrack);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureLife);
    var lifeResizeTimer;
    var lifeViewportWidth = window.innerWidth;
    var lifeViewportHeight = window.innerHeight;
    window.addEventListener('resize', function () {
      if (matchMedia('(pointer: coarse)').matches && window.innerWidth === lifeViewportWidth && Math.abs(window.innerHeight - lifeViewportHeight) < 150) return;
      lifeViewportWidth = window.innerWidth;
      lifeViewportHeight = window.innerHeight;
      clearTimeout(lifeResizeTimer);
      lifeResizeTimer = setTimeout(measureLife, 150);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        lifeNear = entries[entries.length - 1].isIntersecting;
        /* Always settle once on enter/leave so a fast flick can't strand the track mid-way. */
        if (lifeNear) kickLife(); else renderLife();
      }, { rootMargin: '200px 0px' }).observe(life);

      var revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      life.querySelectorAll('.life-card').forEach(function (card) { revealIO.observe(card); });
    } else {
      lifeNear = true;
    }

    window.addEventListener('scroll', kickLife, { passive: true });
    lifeViewport.addEventListener('scroll', kickLife, { passive: true });

    /* Chapter chips jump to the first card of that chapter. */
    lifeChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var name = chip.getAttribute('data-goto');
        var card = life.querySelector('.life-track > [data-chapter="' + name + '"]');
        if (!card) return;
        var behavior = prefersReducedMotion ? 'auto' : 'smooth';
        var centerOffset = card.offsetLeft + card.offsetWidth / 2 - lifePin.clientWidth / 2;
        if (lifePinned) {
          var p = Math.min(Math.max(centerOffset / (lifeDist || 1), 0), 1);
          var top = life.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: top + p * lifeDist + 1, behavior: behavior });
        } else {
          lifeViewport.scrollTo({ left: centerOffset, behavior: behavior });
        }
      });
    });

    /* ----- Lightbox ----- */
    var lightbox = document.getElementById('lightbox');
    var frames = Array.prototype.slice.call(life.querySelectorAll('[data-lightbox]'));
    if (lightbox && typeof lightbox.showModal === 'function' && frames.length) {
      var lbSource = lightbox.querySelector('.lightbox-media source');
      var lbImg = lightbox.querySelector('.lightbox-media img');
      var lbChapter = lightbox.querySelector('.lightbox-chapter');
      var lbCaption = lightbox.querySelector('.lightbox-caption');
      var lbExif = lightbox.querySelector('.lightbox-exif');
      var lbIndex = 0;

      var showPhoto = function (i) {
        lbIndex = (i + frames.length) % frames.length;
        var fig = frames[lbIndex].closest('figure');
        var src = fig.querySelector('source');
        var img = fig.querySelector('img');
        lbSource.srcset = src ? src.getAttribute('srcset') : '';
        lbImg.src = img.getAttribute('src');
        lbImg.alt = img.alt;
        lbChapter.textContent = fig.querySelector('.life-chapter').textContent;
        lbCaption.textContent = fig.querySelector('.life-caption').textContent;
        lbExif.textContent = fig.querySelector('.life-exif').textContent;
      };

      frames.forEach(function (frame, i) {
        frame.addEventListener('click', function () {
          showPhoto(i);
          lightbox.showModal();
          document.documentElement.style.overflow = 'hidden';
        });
      });

      lightbox.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
      lightbox.querySelector('.lightbox-close').addEventListener('click', function () { lightbox.close(); });
      lightbox.querySelector('.lightbox-prev').addEventListener('click', function () { showPhoto(lbIndex - 1); });
      lightbox.querySelector('.lightbox-next').addEventListener('click', function () { showPhoto(lbIndex + 1); });
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox || e.target.classList.contains('lightbox-inner')) lightbox.close();
      });
      lightbox.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') showPhoto(lbIndex - 1);
        if (e.key === 'ArrowRight') showPhoto(lbIndex + 1);
      });

      /* Swipe between photos on touch screens. */
      var touchX = null;
      lightbox.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
      lightbox.addEventListener('touchend', function (e) {
        if (touchX === null) return;
        var dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
        touchX = null;
      });
    }
  }
})();
