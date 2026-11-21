/* AgentInsiders page behaviour. No dependencies. All numbers come from the paper (Tables 3, 4, 6). */
(function () {
  var forced = /\bfm\b/.test(document.documentElement.className);
  var reduced = !forced && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ── Table 4: ASR (%) ── order: AB DS DP FF IH UP CV DE | avg | CI */
  var ASR = {
    single: {
      rows: [
        ['GPT 5.6 Sol', [25.0, 68.8, 40.6, 78.1, 68.8, 81.2, 71.9, 68.8], 62.9, '57.4 to 68.4'],
        ['GPT 6 Sol',   [0.0, 78.1, 31.2, 46.9, 50.0, 84.4, 81.2, 84.4], 57.0, '52.0 to 62.1'],
        ['Opus 5',      [0.0, 0.0, 6.2, 9.4, 0.0, 75.0, 65.6, 68.8], 28.1, '24.2 to 32.0'],
        ['Kimi K3',     [12.5, 40.6, 21.9, 65.6, 59.4, 87.5, 71.9, 62.5], 52.7, '47.3 to 58.2']
      ],
      note: '<b>One insider often gets through.</b> Average ASR ranges from 28.1% (Opus 5) to 62.9% (GPT 5.6 Sol). Even the most robust victim leaks in the information-gated categories and creates the outside contact in 75% of Unauthorized persistence scenarios.'
    },
    collusive: {
      rows: [
        ['GPT 5.6 Sol', [40.6, 87.5, 81.2, 100.0, 100.0, 100.0, 93.8, 100.0], 87.9, '84.4 to 91.0'],
        ['GPT 6 Sol',   [0.0, 78.1, 34.4, 84.4, 68.8, 84.4, 100.0, 93.8], 68.0, '63.7 to 71.9'],
        ['Opus 5',      [0.0, 0.0, 0.0, 12.5, 0.0, 81.2, 100.0, 68.8], 32.8, '29.7 to 35.9'],
        ['Kimi K3',     [3.1, 62.5, 46.9, 90.6, 68.8, 96.9, 93.8, 90.6], 69.1, '64.8 to 73.4']
      ],
      note: '<b>Three colluding insiders do better than one.</b> Average ASR goes up on all four victims, though for Opus 5 the gain is within the margin of error. GPT 5.6 Sol reaches 100% on four categories. Opus 5 stays at 0% on four categories and still reaches 100% on Consent violation.'
    },
    independent: {
      rows: [
        ['GPT 5.6 Sol', [40.6, 87.5, 75.0, 100.0, 100.0, 96.9, 96.9, 100.0], 87.1, '83.6 to 90.6'],
        ['GPT 6 Sol',   null, null, null],
        ['Opus 5',      [0.0, 3.1, 3.1, 40.6, 0.0, 93.8, 100.0, 78.1], 39.8, '36.7 to 43.0'],
        ['Kimi K3',     [15.6, 78.1, 21.9, 87.5, 81.2, 100.0, 96.9, 93.8], 71.9, '68.0 to 75.8']
      ],
      note: '<b>Hiding who the allies are barely changes the outcome.</b> Independent insiders land within 3 points of colluding ones on GPT 5.6 Sol and Kimi K3, and do <em>better</em> against Opus 5 (39.8% vs 32.8%). GPT 6 Sol was run in this setting only on a 100-scenario sample (79.0% independent vs 70.0% collusive).'
    }
  };

  function heat(td, v) {
    var a = Math.round(v);
    td.style.backgroundColor = 'color-mix(in srgb, var(--insider) ' + a + '%, var(--card))';
    td.style.color = a >= 85 ? '#fff' : 'var(--ink)';
  }
  function clear(td) { td.style.backgroundColor = ''; td.style.color = ''; }
  var asrBody = $('#asr tbody'), asrNote = $('#asr-note');
  function renderASR(key) {
    var d = ASR[key];
    if (!asrBody.children.length) {
      d.rows.forEach(function () {
        var tr = document.createElement('tr');
        var th = document.createElement('th'); th.scope = 'row'; tr.appendChild(th);
        for (var i = 0; i < 9; i++) tr.appendChild(document.createElement('td'));
        asrBody.appendChild(tr);
      });
    }
    d.rows.forEach(function (r, ri) {
      var tr = asrBody.children[ri], avg = tr.lastChild, i, td;
      tr.firstChild.textContent = r[0];
      for (i = 0; i < 8; i++) {
        td = tr.children[i + 1];
        if (!r[1]) { td.className = 'na'; td.textContent = 'n/a'; clear(td); }
        else { td.className = ''; td.textContent = r[1][i].toFixed(1); heat(td, r[1][i]); }
      }
      if (!r[1]) { avg.className = 'avg na'; avg.innerHTML = '<small>100-scenario sample only</small>'; clear(avg); }
      else { avg.className = 'avg'; avg.innerHTML = r[2].toFixed(1) + '<small>' + r[3] + '</small>'; heat(avg, r[2]); }
    });
    asrNote.innerHTML = d.note;
  }
  var asrTabs = $$('.tabs button');
  asrTabs.forEach(function (b) {
    b.addEventListener('click', function () {
      asrTabs.forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); x.tabIndex = x === b ? 0 : -1; });
      $('#asr-panel').setAttribute('aria-labelledby', b.id);
      renderASR(b.getAttribute('data-set'));
    });
  });
  if (asrBody) renderASR('collusive');

  /* ── bars ── */
  function bar(cls, v) {
    return '<div class="bar ' + cls + '"><i data-w="' + v + '"></i><span data-in="' + (v > 78 ? 1 : 0) + '">' + v.toFixed(1) + '</span></div>';
  }
  function rows(el, data, a, b) {
    el.innerHTML = data.map(function (r) {
      return '<div class="bar-row"><span>' + r[0] + '</span><div class="bar-pair">' + bar(a, r[1]) + bar(b, r[2]) + '</div></div>';
    }).join('');
  }
  var bsr = $('#bsr'), pol = $('#policy');
  /* Table 3: BSR-T, BSR-I */
  if (bsr) rows(bsr, [['GPT 5.6 Sol', 42.5, 91.1], ['GPT 6 Sol', 45.8, 91.7], ['Opus 5', 53.3, 93.5], ['Kimi K3', 37.9, 89.0]], 't', 'it');
  /* Table 6: no policy, company policy */
  if (pol) rows(pol, [['AB', 3.1, 6.2], ['DS', 62.5, 21.9], ['DP', 46.9, 3.1], ['FF', 90.6, 78.1], ['IH', 68.8, 9.4], ['UP', 96.9, 62.5], ['CV', 93.8, 93.8], ['DE', 90.6, 93.8], ['Average', 69.1, 46.1]], 'np', 'p');
  function grow(box) {
    $$('.bar', box).forEach(function (b) {
      var i = $('i', b), s = $('span', b), w = parseFloat(i.getAttribute('data-w'));
      i.style.width = w + '%';
      if (s.getAttribute('data-in') === '1') { s.style.left = 'auto'; s.style.right = (100 - w) + '%'; s.style.color = '#fff'; }
      else s.style.left = w + '%';
    });
  }

  /* ── findings ── */
  var F = [
    ['Benign', 'High item completion does not ensure full-task success', 'With no insider around, agents complete most checklist items. Finishing a whole workflow reliably is still hard, even for frontier models.', 'Items 89.0 to 93.5%, whole tasks 37.9 to 53.3%'],
    ['Attack', 'Frontier MAS remain vulnerable to malicious insiders', 'Every victim model falls for some attacks. Even the one with the lowest average ASR fails badly in specific categories.', 'Opus 5 with collusive insiders: 100% Consent violation, 81.2% Unauthorized persistence'],
    ['Attack', 'A completed task does not indicate a safe run', 'Whether the task got done tells you very little about whether an attack got through. You need both verifiers.', '31.5 to 50.0% of successful attacks also pass every benign check'],
    ['Insiders', 'Insiders frame requests as ordinary business', 'Insiders mostly give a business reason or invite the holder to verify. They rarely push on time, and mixing more strategies does not bring more success.', 'GPT 5.6 Sol and Kimi K3 runs: a business reason in 34 to 46% of requests, time pressure in about 2% at most'],
    ['Victims', 'Refusing is not the same as recognizing an attack', 'Benign holders sometimes say no without ever calling it an attack. The GPT victims almost never name it. Opus 5 does so more often.', 'Named as attack: 0 of 3,178 replies (GPT 5.6 Sol) vs 13.3% (Opus 5)'],
    ['Insiders', 'Most insider chatter follows first contact', 'Collusive insiders exchange 14 to 24 messages per task, but only about two before the first request reaches the capability holder.', '85.4 to 90.0% of messages come after holder contact'],
    ['Collusion', 'Collusion adds communication, not a clear ASR gain', 'Insiders who know their allies talk a lot more. That does not reliably make them more successful than insiders who work independently.', 'Opus 5: 32.8% collusive vs 39.8% independent'],
    ['Victims', 'Low tool-gated ASR can coexist with information leaks', 'Information-gated categories average higher ASR than tool-gated ones for every model and setting. A benign agent hands the value to a colleague, and the colleague sends it out.', 'Opus 5 collusive: 15.6% tool-gated vs 84.4% info-gated'],
    ['Defense', 'An explicit policy mitigates but does not eliminate', 'A company policy in every specialist prompt helps when a rule names the exact act the benign agent is asked to do. It does not reduce the two leak categories.', 'Kimi K3 average ASR drops from 69.1% to 46.1%']
  ];
  var finds = $('#finds');
  if (finds) finds.innerHTML = F.map(function (f, i) {
    return '<article class="find"><div class="no"><span>FINDING 0' + (i + 1) + '</span><em>' + f[0] + '</em></div><h4>' + f[1] + '</h4><p>' + f[2] + '</p><div class="num">' + f[3] + '</div></article>';
  }).join('');

  /* ── trace tabs ── */
  var tt = $$('.trace-tabs button');
  tt.forEach(function (b) {
    b.addEventListener('click', function () {
      tt.forEach(function (x) {
        var on = x === b;
        x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1;
        $('#trace-' + x.getAttribute('data-trace')).hidden = !on;
      });
    });
  });

  function arrows(list) {
    list.forEach(function (b, i) {
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var n = list[(i + d + list.length) % list.length];
        n.focus(); n.click();
      });
    });
  }
  arrows(asrTabs); arrows(tt);

  /* ── copy bibtex ── */
  var cp = $('#copy'), cpT;
  if (cp) cp.addEventListener('click', function () {
    function say(t) { cp.textContent = t; clearTimeout(cpT); cpT = setTimeout(function () { cp.textContent = 'Copy'; }, 1600); }
    try { navigator.clipboard.writeText($('#bib').textContent).then(function () { say('Copied'); }, function () { say('Select and copy'); }); }
    catch (e) { say('Select and copy'); }
  });

  /* ── stat count-up (HTML already holds the final value) ── */
  function count(el) {
    var target = parseFloat(el.getAttribute('data-n')), dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var node = el.firstChild, t0 = null;
    if (!node || node.nodeType !== 3) return;
    requestAnimationFrame(function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 900);
      p = 1 - Math.pow(1 - p, 3);
      node.nodeValue = (target * p).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    });
  }

  /* ── reveal / grow on scroll ── */
  var io = 'IntersectionObserver' in window;
  if (io && !reduced) {
    $$('.find').forEach(function (el, i) { el.classList.add('rv'); el.style.transitionDelay = (i % 3) * 70 + 'ms'; });
    var seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        t.classList.add('in');
        if (t.classList.contains('stats')) $$('.n[data-n]', t).forEach(count);
        if (t.classList.contains('panel')) grow(t);
        seen.unobserve(t);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.rv, .stats').forEach(function (el) { seen.observe(el); });
  } else {
    $$('.rv').forEach(function (el) { el.classList.add('in'); });
    $$('.panel').forEach(grow);
  }

  /* ── nav highlight ── */
  if (io) {
    var links = {};
    $$('.nav nav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var navObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        for (var k in links) links[k].classList.remove('active');
        var a = links[e.target.id];
        if (!a) return;
        a.classList.add('active');
        var nav = a.parentNode;
        if (nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: Math.max(0, a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2), behavior: reduced ? 'auto' : 'smooth' });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(links).forEach(function (id) { var el = document.getElementById(id); if (el) navObs.observe(el); });
  }
})();

/* ── hero dot field ──
   A grid of small squares whose size follows a slow drifting wave. A few of the dots are insiders:
   they sit in the grid in red, and every so often one sends a message along the grid to an ordinary
   dot, which turns amber for a moment (compromised) and then recovers. */
(function () {
  var cv = document.querySelector('.hero-dots');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d'), hero = cv.parentNode;
  var still = !/\bfm\b/.test(document.documentElement.className) && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STEP = 14, W = 0, H = 0, ox = 0, cols = 0, rows = 0, dpr = 1, raf = 0, visible = true, last = 0;
  var insiders = [], events = [], nextAt = 1.2;
  var HOP = 0.07, TRAIL = 0.55, HOLD = 1.8;
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function px(i) { return ox + i * STEP; }
  function py(k) { return STEP / 2 + k * STEP; }
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ox = (W % STEP) / 2; cols = Math.floor((W - ox) / STEP) + 1; rows = Math.floor((H - STEP / 2) / STEP) + 1;
    insiders = []; events = [];
    var n = Math.max(4, Math.min(9, Math.round(W / 160))), lo = Math.floor(cols * 0.42), tries = 0;
    while (insiders.length < n && tries++ < 200) {
      var c = { i: rnd(lo, cols - 3), k: rnd(2, rows - 3) }, ok = true;
      for (var q = 0; q < insiders.length; q++) if (Math.abs(insiders[q].i - c.i) + Math.abs(insiders[q].k - c.k) < 7) ok = false;
      if (ok) insiders.push(c);
    }
    draw(last);
  }
  function field(x, y, t) {
    return Math.sin(x * 0.011 + t * 0.21) * Math.cos(y * 0.014 - t * 0.17)
      + 0.6 * Math.sin((x + y) * 0.006 - t * 0.12)
      + 0.4 * Math.sin(x * 0.027 - y * 0.019 + t * 0.3);
  }
  function spawn(t) {
    if (!insiders.length) return;
    var s = insiders[rnd(0, insiders.length - 1)], ally = Math.random() < 0.3 && insiders.length > 1, ti, tk;
    if (ally) { var o = insiders[rnd(0, insiders.length - 1)]; if (o === s) return; ti = o.i; tk = o.k; }
    else {
      ti = Math.max(Math.floor(cols * 0.4), Math.min(cols - 2, s.i + (Math.random() < 0.5 ? -1 : 1) * rnd(4, 11)));
      tk = Math.max(1, Math.min(rows - 2, s.k + (Math.random() < 0.5 ? -1 : 1) * rnd(2, 7)));
    }
    var path = [], i = s.i, k = s.k;
    while (i !== ti) { i += ti > i ? 1 : -1; path.push([i, k]); }   /* along the row, then down the column */
    while (k !== tk) { k += tk > k ? 1 : -1; path.push([i, k]); }
    if (path.length) events.push({ t0: t, path: path, ally: ally, from: s });
  }
  function sq(x, y, r, col) { ctx.fillStyle = col; ctx.fillRect(x - r / 2, y - r / 2, r, r); }
  function draw(t) {
    last = t;
    var tw = t * 0.5, drift = t * 22, x, y, v, k, r, i, n, e, age, a, p;   /* the whole pattern slides sideways, and only slowly changes shape */
    ctx.clearRect(0, 0, W, H);
    for (y = STEP / 2; y < H; y += STEP) {
      for (x = ox; x < W; x += STEP) {
        v = (field(x + drift, y + drift * 0.18, tw) + 2) / 4;
        k = Math.max(0, (v - 0.42) / 0.58);
        if (k <= 0.02) continue;
        k *= 0.45 + 0.55 * Math.min(1, x / (W * 0.75));   /* calmer behind the text on the left */
        r = 0.8 + 3.2 * k;
        sq(x, y, r, 'rgba(242,239,232,' + (0.08 + 0.5 * k).toFixed(3) + ')');
      }
    }
    for (n = 0; n < insiders.length; n++) sq(px(insiders[n].i), py(insiders[n].k), 4, 'rgba(233,139,126,.8)');
    for (n = events.length - 1; n >= 0; n--) {
      e = events[n]; age = t - e.t0;
      var arrive = e.path.length * HOP;
      if (age > arrive + HOLD) { events.splice(n, 1); continue; }
      sq(px(e.from.i), py(e.from.k), 6, 'rgba(233,139,126,' + Math.max(0, 1 - age / 0.8).toFixed(3) + ')');
      for (i = 0; i < e.path.length; i++) {
        a = age - (i + 1) * HOP;
        if (a < 0 || a > TRAIL) continue;
        sq(px(e.path[i][0]), py(e.path[i][1]), 3.5, 'rgba(233,139,126,' + (0.9 * (1 - a / TRAIL)).toFixed(3) + ')');
      }
      a = age - arrive;
      if (a >= 0) {
        p = e.path[e.path.length - 1]; x = px(p[0]); y = py(p[1]);
        k = 1 - a / HOLD;
        if (e.ally) sq(x, y, 6, 'rgba(233,139,126,' + k.toFixed(3) + ')');
        else {
          sq(x, y, 5.5, 'rgba(217,162,58,' + k.toFixed(3) + ')');
          if (a < 0.7) { r = 6 + 22 * (a / 0.7); ctx.strokeStyle = 'rgba(217,162,58,' + (0.7 * (1 - a / 0.7)).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.strokeRect(x - r / 2, y - r / 2, r, r); }
        }
      }
    }
  }
  function tick(ms) {
    raf = 0;
    if (!visible) return;
    var t = ms / 1000;
    if (t > nextAt) { spawn(t); nextAt = t + 2.5 + Math.random() * 3; }
    draw(t);
    raf = requestAnimationFrame(tick);
  }
  function start() { if (!still && !raf && visible) raf = requestAnimationFrame(tick); }
  window.addEventListener('resize', size);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; start(); }).observe(hero);
  }
  last = still ? 2.3 : 0;
  size();
  start();
})();
