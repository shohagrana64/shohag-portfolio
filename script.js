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
    { t: 'warn',txt: '  uptime 99.99%  \u00b7  cost \u2193 50%  \u00b7  ISO 27001' }
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
      startShell();
      return;
    }
    var i = 0;
    function nextLine() {
      if (i >= termLines.length) { startShell(); return; }
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

  /* ---------- interactive terminal shell ----------
     The hero terminal becomes a real, explorable shell once the boot
     sequence finishes. Fully client-side (fake FS), keyboard-accessible. */
  var shellMounted = false;
  function startShell() {
    if (shellMounted || !termBody) return;
    shellMounted = true;

    var RESUME = 'Shohag-Rana-Resume.pdf';
    var EMAIL = 'shohagrana64@gmail.com';
    var history = [], hidx = -1;
    var awaitingFix = false, solved = false;
    var activeEdit = null;

    var COMMANDS = ['about', 'banner', 'cat', 'clear', 'coffee', 'contact', 'curl', 'cv',
      'date', 'deploy', 'download', 'echo', 'exit', 'experience', 'feedback', 'fix', 'github',
      'help', 'hint', 'hire', 'history', 'linkedin', 'ls', 'projects', 'pwd', 'resume', 'skills',
      'sudo', 'suggest', 'uptime', 'wget', 'whoami'];
    var FILES = ['about.txt', 'skills.json', 'experience.log', 'contact.vcf', 'resume.pdf',
      'projects/', '.secret', '.config'];

    function esc(s) {
      return String(s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }
    function scrollBottom() { termBody.scrollTop = termBody.scrollHeight; }
    function print(cls, html) {
      var d = document.createElement('div');
      d.className = 'ln out' + (cls ? ' ' + cls : '');
      d.innerHTML = html;
      termBody.appendChild(d);
      scrollBottom();
      return d;
    }
    function printLines(arr) { arr.forEach(function (o) { print(o.c, o.t); }); }

    function prompt() {
      var line = document.createElement('div');
      line.className = 'ln input';
      line.innerHTML = '<span class="pmt">➜  prod  </span>';
      var edit = document.createElement('input');
      edit.type = 'text'; edit.className = 'term-edit';
      edit.setAttribute('autocomplete', 'off'); edit.setAttribute('autocapitalize', 'off');
      edit.setAttribute('autocorrect', 'off'); edit.setAttribute('spellcheck', 'false');
      edit.setAttribute('aria-label', 'terminal command input');
      edit.placeholder = 'type a command — try: help';
      line.appendChild(edit);
      termBody.appendChild(line);
      activeEdit = edit;
      edit.addEventListener('keydown', onKey);
      edit.focus();
      scrollBottom();
    }
    function freeze(text) {
      if (!activeEdit) return;
      var span = document.createElement('span');
      span.className = 'cmd'; span.textContent = text;
      activeEdit.parentNode.replaceChild(span, activeEdit);
      activeEdit = null;
    }
    function clearScreen() { termBody.innerHTML = ''; prompt(); }

    function onKey(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var raw = e.target.value;
        if (raw.trim() && history[history.length - 1] !== raw) history.push(raw);
        hidx = history.length;
        freeze(raw);
        handle(raw);
        prompt();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hidx > 0) { hidx--; e.target.value = history[hidx]; moveCaretEnd(e.target); }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hidx < history.length - 1) { hidx++; e.target.value = history[hidx]; }
        else { hidx = history.length; e.target.value = ''; }
      } else if (e.key === 'Tab') {
        e.preventDefault(); complete(e.target);
      } else if (e.key.toLowerCase() === 'l' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); clearScreen();
      } else if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault(); freeze(e.target.value + '^C'); prompt();
      }
    }
    function moveCaretEnd(el) { setTimeout(function () { try { el.selectionStart = el.selectionEnd = el.value.length; } catch (x) {} }, 0); }

    /* insert a line ABOVE the active prompt (bash-style candidate listing) */
    function printAbove(cls, html) {
      var d = document.createElement('div');
      d.className = 'ln out' + (cls ? ' ' + cls : '');
      d.innerHTML = html;
      var line = activeEdit ? activeEdit.parentNode : null;
      if (line && line.parentNode === termBody) termBody.insertBefore(d, line);
      else termBody.appendChild(d);
      scrollBottom();
    }
    function commonPrefix(arr) {
      var p = arr[0];
      for (var i = 1; i < arr.length; i++) {
        while (p && arr[i].toLowerCase().indexOf(p.toLowerCase()) !== 0) p = p.slice(0, -1);
        if (!p) return '';
      }
      return p;
    }
    function complete(el) {
      var val = el.value;
      var toks = val.length ? val.split(/\s+/) : [];
      if (/\s$/.test(val) || toks.length === 0) toks.push('');   // completing a fresh token
      var idx = toks.length - 1;
      var frag = toks[idx] || '';
      var pool;
      if (idx === 0) pool = COMMANDS;
      else {
        var c = toks[0].toLowerCase();
        if (c === 'cat' || c === 'open' || c === 'less' || c === 'more' || c === 'ls' || c === 'dir') pool = FILES;
        else if (c === 'fix') pool = ['DB_HOST=postgres'];
        else return;
      }
      var matches = pool.filter(function (x) { return x.toLowerCase().indexOf(frag.toLowerCase()) === 0; });
      if (!matches.length) return;
      var add = matches.length === 1 ? matches[0] : commonPrefix(matches);
      if (add) toks[idx] = add;
      el.value = toks.join(' ') + (matches.length === 1 ? ' ' : '');
      moveCaretEnd(el);
      if (matches.length > 1 && add.toLowerCase() === frag.toLowerCase()) {
        printAbove('dim', matches.map(function (m) { return esc(m); }).join('   '));
      }
    }

    /* ----- command implementations ----- */
    function cmdHelp() {
      print('info', 'Available commands');
      printLines([
        { c: 'dim', t: "  <b class='cmd'>ls</b> [-a]        list files in this directory" },
        { c: 'dim', t: "  <b class='cmd'>cat</b> &lt;file&gt;     read a file  (about.txt, skills.json, contact.vcf…)" },
        { c: 'dim', t: "  <b class='cmd'>resume</b>         download my CV  (aliases: download, wget resume)" },
        { c: 'dim', t: "  <b class='cmd'>whoami</b>         the short version" },
        { c: 'dim', t: "  <b class='cmd'>experience</b>     career log" },
        { c: 'dim', t: "  <b class='cmd'>projects</b>       selected work" },
        { c: 'dim', t: "  <b class='cmd'>contact</b>        how to reach me" },
        { c: 'dim', t: "  <b class='cmd'>deploy</b>         ship to prod… if you can keep it up  〔mini-game〕" },
        { c: 'dim', t: "  <b class='cmd'>suggest</b> &lt;msg&gt;  leave me a note (opens your email)" },
        { c: 'dim', t: "  <b class='cmd'>clear</b>          wipe the screen   (^L)" }
      ]);
      print('dim', "a few commands aren't on this list. good engineers poke around.");
    }
    function cmdLs(args) {
      var rest = args.filter(function (a) { return a.charAt(0) !== '-'; });
      if (rest[0] === 'projects' || rest[0] === 'projects/') return cmdProjects();
      var showHidden = args.indexOf('-a') >= 0;
      var line = "<span class='cmd'>about.txt</span>   <span class='cmd'>skills.json</span>   <span class='cmd'>experience.log</span>   <span class='cmd'>contact.vcf</span>   <span class='cmd'>resume.pdf</span>   <span class='pmt'>projects/</span>";
      if (showHidden) line += "   <span class='dim'>.secret</span>   <span class='dim'>.config</span>";
      print('', line);
    }
    function cmdCat(file) {
      switch ((file || '').toLowerCase()) {
        case 'about.txt': case 'about':
          return print('', "Shohag Rana — Cybersecurity &amp; DevSecOps engineer in Sydney. I build secure, observable, self-healing cloud infrastructure: CI/CD pipelines, hardened systems, and cost cut without cutting uptime.");
        case 'skills.json': case 'skills':
          return printLines([
            { c: 'dim', t: '{' },
            { c: '', t: "  <span class='info'>\"cloud\"</span>:    [ AWS, Azure, Kubernetes, Docker, Helm, ArgoCD ]," },
            { c: '', t: "  <span class='info'>\"cicd\"</span>:     [ Jenkins, CodePipeline, Tekton, blue-green ]," },
            { c: '', t: "  <span class='info'>\"security\"</span>: [ Rapid7 SIEM, Cloudflare WAF, DevSecOps, hardening ]," },
            { c: '', t: "  <span class='info'>\"observe\"</span>:  [ Prometheus, Grafana, ELK ]," },
            { c: '', t: "  <span class='info'>\"iac\"</span>:      [ Terraform, Ansible, KEDA ]," },
            { c: '', t: "  <span class='info'>\"langs\"</span>:    [ Python, Go, Java, C++, JS ]" },
            { c: 'dim', t: '}' }
          ]);
        case 'experience.log': case 'experience':
          return cmdExperience();
        case 'contact.vcf': case 'contact':
          return cmdContact();
        case 'resume.pdf': case 'resume':
          return print('warn', "resume.pdf is a binary (231 KB). run <b class='cmd'>resume</b> to download it.");
        case '.secret':
          return printLines([
            { c: 'ok', t: 'you found it.' },
            { c: 'dim', t: "first principle: <i>uptime is a feature, security is a requirement, and cost is a design constraint.</i>" },
            { c: 'dim', t: "psst — there's an incident waiting. try <b class='cmd'>deploy</b>." }
          ]);
        case '.config':
          return print('dim', "# nice try. my real configs live in a private vault, not the frontend.");
        case undefined: case '':
          return print('warn', 'usage: cat <file>');
        default:
          return print('warn', 'cat: ' + esc(file) + ': No such file or directory');
      }
    }
    function cmdExperience() {
      printLines([
        { c: 'ok', t: 'YouxPowered · Sydney            <span class="dim">Jul 2025 — Present</span>' },
        { c: 'dim', t: '  Infra-focused full-stack eng · CI/CD, AWS, observability · ↓50% cost' },
        { c: 'ok', t: 'bKash · Fintech · Bangladesh    <span class="dim">Oct 2021 — Feb 2023</span>' },
        { c: 'dim', t: '  Platform & systems eng · 500+ VMs, K8s, 50k+ TPS · 99.99% uptime' },
        { c: 'ok', t: 'UTS · Sydney                    <span class="dim">Jan 2024 — Jul 2025</span>' },
        { c: 'dim', t: '  Academic tutor · Cybersecurity & Digital Forensics' }
      ]);
    }
    function cmdProjects() {
      printLines([
        { c: 'pmt', t: 'projects/' },
        { c: '', t: "  <span class='cmd'>01_payment-gateway-cicd</span>   national fintech CI/CD · secure, auditable releases" },
        { c: '', t: "  <span class='cmd'>02_lambda-fleet</span>           200+ Lambdas across 5 environments" },
        { c: '', t: "  <span class='cmd'>03_mongodb-pitr</span>          self-hosted cluster · point-in-time recovery" },
        { c: '', t: "  <span class='cmd'>04_k8s-platform</span>          50+ services on Docker/K8s · 99.99% uptime" }
      ]);
    }
    function cmdContact() {
      printLines([
        { c: '', t: "email     <a class='tlink' href='mailto:" + EMAIL + "'>" + EMAIL + "</a>" },
        { c: '', t: "phone     <a class='tlink' href='tel:+61403286661'>0403 286 661</a>" },
        { c: '', t: "linkedin  <a class='tlink' target='_blank' rel='noopener' href='https://www.linkedin.com/in/shohagrana64/'>in/shohagrana64</a>" },
        { c: '', t: "github    <a class='tlink' target='_blank' rel='noopener' href='https://github.com/shohagrana64'>shohagrana64</a>" }
      ]);
    }
    function triggerDownload() {
      var a = document.createElement('a');
      a.href = RESUME; a.setAttribute('download', RESUME);
      document.body.appendChild(a); a.click(); a.remove();
    }
    function cmdDownload() {
      if (reduce) { print('info', '▸ downloading ' + RESUME + ' …'); triggerDownload(); return print('ok', '✓ saved ' + RESUME); }
      print('info', '▸ GET /' + RESUME);
      var bar = print('ok', '');
      var pct = 0;
      var iv = setInterval(function () {
        pct = Math.min(100, pct + (Math.floor(Math.random() * 16) + 9));
        var filled = Math.round(pct / 5);
        bar.innerHTML = '  [' + new Array(filled + 1).join('#') + new Array(21 - filled).join('.') + '] ' + pct + '%';
        scrollBottom();
        if (pct >= 100) {
          clearInterval(iv);
          triggerDownload();
          print('ok', '✓ saved ' + RESUME + ' · thanks for reading it.');
        }
      }, 110);
    }
    function cmdSuggest(text) {
      if (!text) return print('warn', 'usage: suggest <your message>   — e.g. suggest you should add a blog');
      print('info', '▸ opening your mail client…');
      var subject = encodeURIComponent('A note from your portfolio terminal');
      var body = encodeURIComponent(text + '\n\n— sent via the shohag-rana.com terminal');
      window.location.href = 'mailto:' + EMAIL + '?subject=' + subject + '&body=' + body;
      print('ok', '✓ thanks! add your email in there so I can reply.');
    }
    function cmdDeploy() {
      awaitingFix = true;
      printLines([
        { c: 'info', t: '▸ docker build -t registry.io/pay:v2 . ... ok' },
        { c: 'info', t: '▸ docker push registry.io/pay:v2 ......... ok' },
        { c: 'info', t: '▸ kubectl apply -f k8s/ .................. ok' },
        { c: 'warn', t: '✗ pod payment-svc  CrashLoopBackOff  (3 restarts)' },
        { c: 'dim', t: '  ── logs ───────────────────────────────────' },
        { c: 'warn', t: '  Error: connect ECONNREFUSED 127.0.0.1:5432' },
        { c: 'dim', t: '  env: DB_HOST=localhost  DB_PORT=5432' },
        { c: '', t: "a container that dials <b class='warn'>localhost</b> is dialing <i>itself</i>." },
        { c: 'info', t: "your move →  <b class='cmd'>fix DB_HOST=&lt;value&gt;</b>   (stuck? <b class='cmd'>hint</b>)" }
      ]);
    }
    function tryFix(rest) {
      var m = rest.match(/DB_HOST\s*=\s*([^\s]+)/i);
      var val = m ? m[1].toLowerCase().replace(/['"]/g, '') : '';
      if (!val) return print('warn', 'format: fix DB_HOST=postgres   (point it at the DB service)');
      if (val === 'localhost' || val === '127.0.0.1') return print('warn', 'still CrashLooping — localhost loops back to the pod itself. use the service DNS name.');
      awaitingFix = false; solved = true;
      printLines([
        { c: 'info', t: '▸ kubectl set env deploy/payment-svc DB_HOST=' + esc(val) },
        { c: 'info', t: '▸ rollout status ........................ ok' },
        { c: 'ok', t: '✓ payment-svc  1/1 Running · 0 downtime · MTTR ↓' },
        { c: 'ok', t: "you debug like an SRE.  〔unlocked: <b class='cmd'>hire</b>〕" }
      ]);
    }
    function cmdHint() {
      if (!awaitingFix) return print('dim', 'no open incident. run `deploy` to start one.');
      print('info', "in Kubernetes, services resolve by DNS name. the DB service is `postgres`. try:  fix DB_HOST=postgres");
    }
    function cmdHire() {
      if (!solved) return print('warn', "permission denied — earn it. run <b class='cmd'>deploy</b> and keep prod alive first.");
      printLines([
        { c: 'ok', t: '$ sudo hire shohag --role "DevSecOps / Cloud / SRE"' },
        { c: 'info', t: '▸ location: Sydney, NSW · full working rights, no restrictions' },
        { c: 'ok', t: "✓ let's talk →  <a class='tlink' href='mailto:" + EMAIL + "'>" + EMAIL + "</a>  ·  <a class='tlink' target='_blank' rel='noopener' href='https://www.linkedin.com/in/shohagrana64/'>linkedin</a>" }
      ]);
    }
    function cmdBanner() {
      printLines([
        { c: 'pmt', t: "  ___ _  _  ___  _  _   _   ___ " },
        { c: 'pmt', t: " / __| || |/ _ \\| || | /_\\ / __|" },
        { c: 'pmt', t: " \\__ \\ __ | (_) | __ |/ _ \\ (_ |" },
        { c: 'pmt', t: " |___/_||_|\\___/|_||_/_/ \\_\\___|" },
        { c: 'dim', t: " DevSecOps · Cloud · SRE — Sydney" }
      ]);
    }

    /* ----- dispatcher ----- */
    function handle(raw) {
      var cmd = raw.trim();
      if (!cmd) return;
      var parts = cmd.split(/\s+/);
      var name = parts[0].toLowerCase();
      var args = parts.slice(1);
      var rest = cmd.slice(parts[0].length).trim();

      // "wget resume" / "curl resume" / "wget resume.pdf"
      if ((name === 'wget' || name === 'curl') && /resume/i.test(rest)) return cmdDownload();

      switch (name) {
        case 'help': case '?': case 'man': return cmdHelp();
        case 'ls': case 'dir': return cmdLs(args);
        case 'cat': case 'less': case 'more': case 'open': return cmdCat(args[0]);
        case 'resume': case 'download': case 'cv': return cmdDownload();
        case 'whoami': return print('', "shohag — DevSecOps &amp; Cloud Engineer. secure, observable, self-healing infra. 99.99% uptime · ↓50% cost · 50k+ TPS.");
        case 'experience': case 'exp': return cmdExperience();
        case 'projects': case 'work': return cmdProjects();
        case 'skills': case 'stack': return cmdCat('skills.json');
        case 'about': return cmdCat('about.txt');
        case 'contact': case 'hello': case 'hi': return cmdContact();
        case 'suggest': case 'feedback': case 'msg': return cmdSuggest(rest);
        case 'deploy': case 'ship': return cmdDeploy();
        case 'fix': return awaitingFix ? tryFix(rest) : print('dim', 'nothing to fix — run `deploy` first.');
        case 'hint': return cmdHint();
        case 'hire': return cmdHire();
        case 'banner': return cmdBanner();
        case 'clear': case 'cls': return clearScreen();
        case 'echo': return print('', esc(rest));
        case 'pwd': return print('', '/home/shohag/portfolio');
        case 'date': return print('', new Date().toString());
        case 'uptime': return print('', ' up 99.99%,  load average: cool, calm, collected');
        case 'history': return history.forEach(function (h, n) { print('dim', '  ' + (n + 1) + '  ' + esc(h)); });
        case 'github': window.open('https://github.com/shohagrana64', '_blank', 'noopener'); return print('info', '▸ opening github.com/shohagrana64');
        case 'linkedin': window.open('https://www.linkedin.com/in/shohagrana64/', '_blank', 'noopener'); return print('info', '▸ opening linkedin/shohagrana64');
        case 'sudo': return print('warn', 'we run least-privilege here. this incident has been logged. ;)');
        case 'rm': return print('warn', "i can't let you do that. (nice instinct though — always confirm before rm -rf)");
        case 'coffee': return print('ok', '  c[_]  brewing… deploys go better with caffeine.');
        case 'exit': case 'quit': case 'logout': return print('dim', "there's no exit — but you can always reach me: try `contact`.");
        default:
          return print('warn', 'command not found: ' + esc(name) + " — type <b class='ok'>help</b>");
      }
    }

    /* boot the prompt */
    print('dim', "tip: this is a <b class='ok'>real</b> shell — type <b class='ok'>help</b> and explore. ↵");
    prompt();

    /* click anywhere in the terminal to focus the prompt (ignore text selection) */
    var termEl = document.getElementById('terminal');
    if (termEl) termEl.addEventListener('click', function () {
      var sel = window.getSelection && window.getSelection().toString();
      if (activeEdit && !sel) activeEdit.focus();
    });
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
