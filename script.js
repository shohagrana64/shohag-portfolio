/* ==========================================================================
   Shohag Rana — Portfolio interactions
   Reveal/animation is progressive enhancement: content is shown by a rect
   checker on init/scroll/load AND by IntersectionObserver, so the page is
   never blank even if IO callbacks don't fire (background/preview iframes).
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav scroll state ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- hero role typewriter ---------- */
  var roles = [
    'DevSecOps Engineer',
    'Cloud & DevOps Engineer',
    'Site Reliability Engineer',
    'Cybersecurity Practitioner'
  ];
  var typedEl = document.getElementById('typed');
  if (typedEl) {
    if (reduce) {
      typedEl.textContent = roles[0];
    } else {
      var ri = 0, ci = 0, deleting = false;
      function tick() {
        var word = roles[ri];
        if (!deleting) {
          ci++;
          typedEl.textContent = word.slice(0, ci);
          if (ci === word.length) { deleting = true; return setTimeout(tick, 1500); }
        } else {
          ci--;
          typedEl.textContent = word.slice(0, ci);
          if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
        }
        setTimeout(tick, deleting ? 45 : 85);
      }
      setTimeout(tick, 700);
    }
  }

  /* ---------- terminal boot sequence ---------- */
  var termBody = document.getElementById('terminal-body');
  var terminalStarted = false;
  var termLines = [
    { t: 'pmt', txt: '\u279c  ~  ', cmd: 'cmd', cmdtxt: 'ssh shohag@prod-cluster' },
    { t: 'dim', txt: 'Authenticating via key \u00b7 MFA verified \u2713' },
    { t: 'pmt', txt: '\u279c  prod  ', cmd: 'cmd', cmdtxt: 'kubectl get deployments' },
    { t: 'ok',  txt: '  api-gateway        50/50   READY' },
    { t: 'ok',  txt: '  payment-service    12/12   READY' },
    { t: 'ok',  txt: '  observability      8/8     READY' },
    { t: 'pmt', txt: '\u279c  prod  ', cmd: 'cmd', cmdtxt: './deploy --strategy blue-green' },
    { t: 'info',txt: '  \u25b8 building image \u00b7 scanning \u00b7 trivy CLEAN' },
    { t: 'info',txt: '  \u25b8 shifting traffic  green \u2192 blue  100%' },
    { t: 'ok',  txt: '  \u2713 deploy complete \u00b7 0 downtime \u00b7 MTTR \u2193 50%' },
    { t: 'warn',txt: '  uptime 99.99%  \u00b7  cost \u2193 50%  \u00b7  ISO 27001' },
    { t: 'pmt', txt: '\u279c  prod  ', cmd: 'blink', cmdtxt: '' }
  ];
  function renderTerminal() {
    if (terminalStarted || !termBody) return;
    terminalStarted = true;
    termBody.innerHTML = '';
    if (reduce) {
      termLines.forEach(function (l) {
        var d = document.createElement('div');
        d.className = 'ln';
        d.innerHTML = '<span class="' + l.t + '">' + l.txt + '</span>' +
          (l.cmdtxt ? '<span class="' + (l.cmd || 'cmd') + '">' + l.cmdtxt + '</span>' : '');
        if (l.cmd === 'blink' && !l.cmdtxt) { var bb = document.createElement('span'); bb.className = 'blink'; d.appendChild(bb); }
        termBody.appendChild(d);
      });
      return;
    }
    var i = 0;
    function nextLine() {
      if (i >= termLines.length) return;
      var l = termLines[i];
      var d = document.createElement('div');
      d.className = 'ln';
      d.innerHTML = '<span class="' + l.t + '">' + l.txt + '</span>';
      termBody.appendChild(d);
      if (l.cmdtxt) {
        var span = document.createElement('span');
        span.className = l.cmd || 'cmd';
        d.appendChild(span);
        var ci2 = 0;
        (function typeCmd() {
          ci2++;
          span.textContent = l.cmdtxt.slice(0, ci2);
          if (ci2 < l.cmdtxt.length) { setTimeout(typeCmd, 26); }
          else { i++; setTimeout(nextLine, 360); }
        })();
      } else {
        if (l.cmd === 'blink') { var b = document.createElement('span'); b.className = 'blink'; d.appendChild(b); }
        i++;
        setTimeout(nextLine, 240);
      }
    }
    nextLine();
  }

  /* ---------- count-up metrics ---------- */
  function countUp(el) {
    if (el._counted) return;
    el._counted = true;
    var target = parseFloat(el.getAttribute('data-target'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var thousands = el.getAttribute('data-thousands') === '1';
    var valEl = el.querySelector('.val');
    function fmt(n) {
      var s = n.toFixed(decimals);
      if (thousands) s = Number(s).toLocaleString('en-US');
      return s;
    }
    if (reduce) { valEl.textContent = fmt(target); return; }
    var dur = 1500, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      valEl.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else valEl.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }

  /* ---------- pipeline flow animation ---------- */
  var pipelineDone = false;
  function runPipeline() {
    if (pipelineDone) return;
    pipelineDone = true;
    var stages = document.querySelectorAll('.pstage');
    var conns = document.querySelectorAll('.pconn');
    if (!stages.length) { pipelineDone = false; return; }
    if (reduce) {
      stages.forEach(function (s) { s.classList.add('done'); });
      conns.forEach(function (c) { c.classList.add('flowing'); });
      stages[stages.length - 1].classList.add('live');
      return;
    }
    var idx = 0;
    function advance() {
      if (idx > 0) { stages[idx - 1].classList.remove('live'); stages[idx - 1].classList.add('done'); }
      if (idx >= stages.length) return;
      stages[idx].classList.add('live');
      var conn = conns[idx];
      idx++;
      if (conn) setTimeout(function () { conn.classList.add('flowing'); }, 350);
      setTimeout(advance, 800);
    }
    advance();
  }

  /* ---------- single activation entry point ---------- */
  function activate(el) {
    if (!el || el.classList.contains('in')) return;
    el.classList.add('in');
    if (el.classList.contains('metric')) countUp(el);
    if (el.id === 'terminal') renderTerminal();
    if (el.id === 'pipelineEl' || el.classList.contains('pipeline')) runPipeline();
  }

  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal, .metric'));
  var pipeEl = document.getElementById('pipelineEl');

  /* rect-based checker — the reliable fallback, independent of IO */
  function checkVisible() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = revealEls.length - 1; i >= 0; i--) {
      var el = revealEls[i];
      if (el.classList.contains('in')) { revealEls.splice(i, 1); continue; }
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) { activate(el); revealEls.splice(i, 1); }
    }
    // pipeline (not a .reveal)
    if (pipeEl && !pipelineDone) {
      var pr = pipeEl.getBoundingClientRect();
      if (pr.top < vh * 0.85 && pr.bottom > 0) runPipeline();
    }
  }

  /* IntersectionObserver — primary path when it fires */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { activate(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal, .metric').forEach(function (el) { io.observe(el); });

    if (pipeEl) {
      var pipeIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { runPipeline(); pipeIO.disconnect(); } });
      }, { threshold: 0.35 });
      pipeIO.observe(pipeEl);
    }
  }

  /* Fallbacks: run the checker on scroll, resize, load, and timers so the
     page reveals reliably regardless of IO behaviour in the host context. */
  window.addEventListener('scroll', checkVisible, { passive: true });
  window.addEventListener('resize', checkVisible, { passive: true });
  window.addEventListener('load', checkVisible);
  checkVisible();
  requestAnimationFrame(checkVisible);
  [120, 400, 800, 1500].forEach(function (ms) { setTimeout(checkVisible, ms); });

  /* Last-resort safety net: if anything is still hidden after 2.5s
     (e.g. content above the fold that somehow never triggered), force it. */
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.in), .metric:not(.in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      if (r.top < vh) activate(el);
    });
    renderTerminal();
  }, 2500);

  /* ---------- active nav link on scroll ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav .links a[href^="#"]'));
  if ('IntersectionObserver' in window) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var id = '#' + e.target.id;
        var link = navLinks.find(function (a) { return a.getAttribute('href') === id; });
        if (link && e.isIntersecting) {
          navLinks.forEach(function (a) { a.style.color = ''; });
          if (!link.classList.contains('cta')) link.style.color = 'var(--primary)';
        }
      });
    }, { threshold: 0.5 });
    navLinks.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) spyIO.observe(s);
    });
  }

  /* ====================================================================
     Premium motion layer
     ==================================================================== */
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- scroll progress beam ---------- */
  (function () {
    if (reduce) return;
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------- cursor spotlight over the background grid ---------- */
  (function () {
    if (reduce || !finePointer) return;
    var bgfx = document.querySelector('.bg-fx');
    if (!bgfx) return;
    var spot = document.createElement('div'); spot.className = 'spot';
    var gridHi = document.createElement('div'); gridHi.className = 'grid-hi';
    bgfx.appendChild(gridHi);
    bgfx.appendChild(spot);
    document.body.classList.add('pointer-fine');
    var rafId = null, mx = 0, my = 0;
    function apply() {
      document.body.style.setProperty('--mx', mx + 'px');
      document.body.style.setProperty('--my', my + 'px');
      rafId = null;
    }
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(apply);
    }, { passive: true });
  })();

  /* ---------- hero name: split into animated letters ---------- */
  (function () {
    if (reduce) return;
    var h1 = document.querySelector('.hero h1');
    if (!h1) return;
    var delay = 0;
    Array.prototype.forEach.call(h1.childNodes, function (node) {
      if (node.nodeType === 3) {            // text node -> wrap each char
        var frag = document.createDocumentFragment();
        node.textContent.split('').forEach(function (chr) {
          if (chr === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
          var s = document.createElement('span');
          s.className = 'ch'; s.textContent = chr;
          s.style.animationDelay = (delay += 0.05).toFixed(2) + 's';
          frag.appendChild(s);
        });
        h1.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        // element (e.g. .accent) -> animate as one unit to preserve its gradient clip
        node.classList.add('ch');
        node.style.animationDelay = (delay += 0.08).toFixed(2) + 's';
      }
    });
  })();

  /* ---------- 3D tilt + glare on cards ---------- */
  (function () {
    if (reduce || !finePointer) return;
    var sel = '.terminal, .metric, .tnode .card, .skillcard, .proj, .edu-card, .ccard';
    var MAX = 7; // deg
    document.querySelectorAll(sel).forEach(function (card) {
      card.classList.add('tilt');
      var glare = document.createElement('span'); glare.className = 'glare';
      card.appendChild(glare);
      var raf = null, rx = 0, ry = 0, gx = 50, gy = 50, rect = null;
      function paint() {
        card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
        card.style.setProperty('--gx', gx + '%');
        card.style.setProperty('--gy', gy + '%');
        raf = null;
      }
      card.addEventListener('pointerenter', function () { rect = card.getBoundingClientRect(); card.classList.add('tilting'); });
      card.addEventListener('pointermove', function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        ry = (px - 0.5) * MAX * 2;
        rx = (0.5 - py) * MAX * 2;
        gx = px * 100; gy = py * 100;
        if (!raf) raf = requestAnimationFrame(paint);
      }, { passive: true });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('tilting');
        card.style.transform = '';
        rect = null;
      });
    });
  })();

  /* ---------- magnetic CTAs ---------- */
  (function () {
    if (reduce || !finePointer) return;
    var STRENGTH = 0.35, RADIUS = 90;
    document.querySelectorAll('.btn-primary, .nav .links a.cta').forEach(function (btn) {
      btn.classList.add('magnetic');
      var raf = null, tx = 0, ty = 0;
      function paint() { btn.style.transform = 'translate(' + tx + 'px,' + ty + 'px)'; raf = null; }
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var dx = e.clientX - cx, dy = e.clientY - cy;
        if (Math.hypot(dx, dy) > RADIUS + Math.max(r.width, r.height) / 2) return;
        tx = dx * STRENGTH; ty = dy * STRENGTH;
        if (!raf) raf = requestAnimationFrame(paint);
      }, { passive: true });
      btn.addEventListener('pointerleave', function () { tx = ty = 0; btn.style.transform = ''; });
    });
  })();
})();
