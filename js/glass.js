/* ------------------------------------------------------------------
   glass.js  -  the piece is not inside the window.

   The name is only legible from one place. A browser window was never
   that place: it is a hole cut in front of it. Press, pull the piece past
   the edge of its window, and let go out there. A second window opens
   where you let go, and it looks into the same world - at the part of it
   that lies there, continuous across the gap between the two windows, as
   if both were cut in one sheet of glass. Move the second window and it
   slides over the world like a lens; move the first and the world goes
   with it. The pointer and the ember cross from one to the other; a letter
   in the second window is looked at, and chosen, as in the first.

   There is one world and it is drawn once. The first window draws a
   larger surface than it shows (render.js, camera.js: L/T/R/B), and every
   frame copies the part under each other window into it. The other windows
   run nothing of their own: what they show, and everything done in them,
   belongs to the first. Nothing here but window.open, where each window
   sits on the screen, and a canvas drawn by a script that lives in another
   window. Up to three; closing them all gives the piece back to its frame.
   A phone has no windows to arrange, so there this file does nothing.
   ------------------------------------------------------------------ */
(function () {
  'use strict';
  var SID = window.SID, M = SID.M, inp = SID.input;
  if (SID.env.coarse || typeof window.open !== 'function') { SID.Glass = null; return; }

  var MAXP = 3, PAD = 48, SNAP = 64, FAR = 6000, PULL = 24;
  var panes = [], reg = null, on = false;
  var self = { bx: NaN, by: NaN, x: 0, y: 0, w: 0, h: 0 };            /* where this window's page sits on the screen */
  var frameEl = null, marks = null, tear = null, pulled = false;
  var was = { x: NaN, y: NaN, w: 0, h: 0 };                           /* where this window was a frame ago */
  var GROUND = SID.C.GROUND;

  /* ---------------- where a window's page is, on the screen ----------------
     screenX/Y is the outside of the window; the page sits inside its frame and toolbars. Any mouse event gives the
     exact offset (screenX - clientX); until one has arrived, the difference of the outer and inner sizes is a guess. */
  function calib(o, e, win) {
    if (e.pointerType !== 'mouse' || e.__pane) return;
    o.bx = e.screenX - e.clientX - win.screenX; o.by = e.screenY - e.clientY - win.screenY;
  }
  function where(o, win) {
    if (win.screenX < -20000 || win.screenY < -20000) return;          /* minimised: it stays where it was last seen */
    if (isNaN(o.bx)) { var side = Math.max(0, (win.outerWidth - win.innerWidth) / 2); o.bx = side; o.by = Math.max(0, win.outerHeight - win.innerHeight - side); }
    o.x = win.screenX + o.bx; o.y = win.screenY + o.by; o.w = win.innerWidth; o.h = win.innerHeight;
  }

  /* ---------------- the window carried across the screen ----------------
     Moving the window is moving (core.js: energy; camera.js: the world is left behind for a moment). Only a real
     slide counts: not a resize, not a jump (maximising, another screen, coming back from minimised). */
  function carried(dt) {
    var x = window.screenX, y = window.screenY, w = window.innerWidth, h = window.innerHeight, vx = 0, vy = 0;
    var ok = document.visibilityState !== 'hidden' && x > -20000 && y > -20000;
    if (ok && !isNaN(was.x) && w === was.w && h === was.h) {
      var dx = x - was.x, dy = y - was.y;
      if (Math.abs(dx) + Math.abs(dy) < 360) { vx = M.clamp(dx / h / dt, -6, 6); vy = M.clamp(dy / h / dt, -6, 6); }
    }
    was.x = ok ? x : NaN; was.y = y; was.w = w; was.h = h;
    /* a window reports where it is less often than it is drawn: follow, don't copy (and let go when it stops) */
    var k = 1 - Math.exp(-dt * (vx || vy ? 18 : 9));
    inp.wvx += (vx - inp.wvx) * k; inp.wvy += (vy - inp.wvy) * k;
    if (Math.abs(inp.wvx) < 1e-3) inp.wvx = 0;
    if (Math.abs(inp.wvy) < 1e-3) inp.wvy = 0;
  }

  /* ---------------- how much of the world to draw: this window and every other one, a little more, never less ---------------- */
  function wanted() {
    var x0 = 0, y0 = 0, x1 = inp.w, y1 = inp.h;
    for (var i = 0; i < panes.length; i++) {
      var p = panes[i], qx = p.x - self.x, qy = p.y - self.y;
      x0 = Math.min(x0, qx); y0 = Math.min(y0, qy); x1 = Math.max(x1, qx + p.w); y1 = Math.max(y1, qy + p.h);
    }
    return { x0: Math.floor((Math.max(x0, -FAR) - PAD) / SNAP) * SNAP, y0: Math.floor((Math.max(y0, -FAR) - PAD) / SNAP) * SNAP,
             x1: Math.ceil((Math.min(x1, inp.w + FAR) + PAD) / SNAP) * SNAP, y1: Math.ceil((Math.min(y1, inp.h + FAR) + PAD) / SNAP) * SNAP };
  }
  function grow() {
    var w = wanted();
    if (reg && w.x0 >= reg.x0 && w.y0 >= reg.y0 && w.x1 <= reg.x1 && w.y1 <= reg.y1) return false;
    reg = reg ? { x0: Math.min(reg.x0, w.x0), y0: Math.min(reg.y0, w.y0), x1: Math.max(reg.x1, w.x1), y1: Math.max(reg.y1, w.y1) } : w;
    return true;
  }

  /* ---------------- the pull: press, drag past the edge of a window, let go out there ---------------- */
  function beyond(e, win) {
    var x = e.clientX, y = e.clientY;
    return Math.max(-x, x - win.innerWidth, -y, y - win.innerHeight, 0);
  }
  function onDown(e, win) {
    if (e.__pane || e.pointerType !== 'mouse' || e.button !== 0) return;
    tear = { win: win };
    try { if (e.target && e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId); } catch (err) { /* (the drag still usually arrives) */ }
  }
  function onMoveT(e, win) {
    if (!tear || tear.win !== win || e.__pane) return;
    if (!(e.buttons & 1)) { tear = null; pull(0, 0, 0); return; }
    if (win === window) pull(e.clientX, e.clientY, beyond(e, win));
  }
  function onUp(e, win) {
    if (!tear || tear.win !== win || e.__pane) return;
    var far = beyond(e, win) > PULL;
    tear = null; pull(0, 0, 0);
    if (far && !overPiece(e.screenX, e.screenY)) open(e.screenX, e.screenY, win);
  }
  /* let go over one of the piece's own windows, a drag was only a crossing from one to the other */
  function overPiece(sx, sy) {
    where(self, window);
    if (sx >= self.x && sx <= self.x + inp.w && sy >= self.y && sy <= self.y + inp.h) return true;
    for (var i = 0; i < panes.length; i++) { var p = panes[i]; if (sx >= p.x && sx <= p.x + p.w && sy >= p.y && sy <= p.y + p.h) return true; }
    return false;
  }
  /* the frame gives a little toward the hand that pulls it (the crop marks nearest it move out; they spring back) */
  function pull(x, y, out) {
    if (!frameEl) { frameEl = document.getElementById('frame'); marks = frameEl ? frameEl.querySelectorAll('.mark') : []; }
    var k = M.smooth(0, 90, out), prev = pulled;
    pulled = k > 0.001;
    if (!pulled && !prev) return;
    var W = inp.w, H = inp.h, cx = M.clamp(x, 0, W), cy = M.clamp(y, 0, H);
    for (var i = 0; i < marks.length; i++) {
      var m = marks[i], c = m.classList, mx = c.contains('tr') || c.contains('br') ? W : 0, my = c.contains('bl') || c.contains('br') ? H : 0;
      var near = 1 - M.clamp(Math.hypot(mx - cx, my - cy) / Math.max(W, H), 0, 1);
      var d = 26 * k * near * near;
      m.style.transition = pulled ? 'opacity 2.4s var(--ease) 2s' : 'opacity 2.4s var(--ease) 2s, transform .6s var(--ease)';
      m.style.transform = pulled ? 'translate(' + ((x - mx) / Math.max(1, Math.hypot(x - mx, y - my)) * d).toFixed(1) + 'px,' + ((y - my) / Math.max(1, Math.hypot(x - mx, y - my)) * d).toFixed(1) + 'px)' : '';
    }
  }

  /* ---------------- another window ---------------- */
  var PAGE = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>SIDDHARTHA</title><meta name="color-scheme" content="dark">' +
    '<style>html,body{margin:0;height:100%;overflow:hidden;background:' + GROUND + ';cursor:crosshair}' +
    'canvas{position:fixed;left:0;top:0;width:100%;height:100%;display:block}' +
    '#b{mix-blend-mode:screen;filter:blur(9px) saturate(1.15);opacity:0}' +
    '.m{width:auto;height:auto;transform-origin:0 0;opacity:0}' +
    '#g{position:fixed;inset:-60px;pointer-events:none;opacity:.13;mix-blend-mode:overlay;background-size:180px 180px;animation:g 1.1s steps(1) infinite}' +
    '@keyframes g{0%{transform:translate(0,0)}12%{transform:translate(-31px,14px)}25%{transform:translate(22px,-37px)}37%{transform:translate(-14px,41px)}' +
    '50%{transform:translate(38px,9px)}62%{transform:translate(-42px,-18px)}75%{transform:translate(11px,33px)}87%{transform:translate(-27px,-40px)}}' +
    '#v{position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse 120% 100% at 50% 50%,transparent 55%,rgba(0,0,0,.55) 100%)}' +
    '@media (prefers-reduced-motion:reduce){#g{animation:none}}</style></head>' +
    '<body aria-hidden="true"><canvas id="w"></canvas><canvas id="b"></canvas><canvas class="m" id="m0"></canvas><canvas class="m" id="m1"></canvas><div id="g"></div><div id="v"></div>' +
    /* if the first window is gone, so is this one (it has nothing of its own to show) */
    '<script>setInterval(function(){var o=null;try{o=window.__root||window.opener}catch(e){}if(!o||o.closed)window.close()},700)<\/script></body></html>';
  var MIRROR = ['arc3d', 'dna3d'];                                   /* the two things drawn in depth by their own canvases */

  /* from: the window that was pulled (a pull out of another window opens from that one: the right to open a
     window belongs to the window that was pressed) */
  function open(sx, sy, from) {
    prune();
    if (panes.length >= MAXP) return null;
    var w = Math.round(M.clamp(inp.w * 0.42, 320, 720)), h = Math.round(w * 0.64);
    var feat = 'popup=yes,left=' + Math.round(sx - w / 2) + ',top=' + Math.round(sy - h / 2) + ',width=' + w + ',height=' + h;
    var win = null;
    try { win = (from || window).open('', 'siddhartha-' + Date.now().toString(36) + panes.length, feat); } catch (err) { win = null; }
    if (!win) return null;                                           /* (blocked: the pull simply did not take) */
    var p;
    try { win.__root = window; p = build(win); } catch (err) { try { win.close(); } catch (e2) { /* nothing */ } return null; }
    panes.push(p);
    where(p, win);
    if (!on) { on = true; document.body.classList.add('glass'); SID.announce('The piece is now in two windows. Close the second to bring it back.'); }
    where(self, window);
    grow(); SID.applySize();
    return p;
  }

  function build(win) {
    var d = win.document;
    d.open(); d.write(PAGE); d.close();
    var icon = document.querySelector('link[rel="icon"]');
    if (icon) { var li = d.createElement('link'); li.rel = 'icon'; li.href = icon.href; d.head.appendChild(li); }
    var g = document.getElementById('grain');
    if (g) d.getElementById('g').style.backgroundImage = g.style.backgroundImage;
    var p = { win: win, doc: d, bx: NaN, by: NaN, x: 0, y: 0, w: 0, h: 0, cur: '',
              cv: d.getElementById('w'), bl: d.getElementById('b'), m: [d.getElementById('m0'), d.getElementById('m1')] };
    p.ctx = p.cv.getContext('2d', { alpha: false });
    p.bctx = p.bl.getContext('2d', { alpha: false });
    listen(p);
    /* if this window is hidden (minimised, covered), the world goes on being drawn from the one that is still seen */
    var drive = function () {
      if (p.win.closed) return;
      p.win.requestAnimationFrame(drive);
      if (document.visibilityState === 'hidden' && SID.tick && performance.now() - SID.tickAt > 12) SID.tick();
    };
    win.requestAnimationFrame(drive);
    return p;
  }

  /* everything done in another window is done here: its pointer, wheel and keys arrive as if this window were
     as large as the glass (the same page coordinates, only past the edge), so nothing else has to know */
  function listen(p) {
    var w = p.win, d = p.doc;
    ['pointermove', 'pointerdown', 'pointerup', 'pointercancel'].forEach(function (type) {
      w.addEventListener(type, function (e) {
        calib(p, e, w);
        if (type === 'pointerdown') onDown(e, w); else if (type === 'pointermove') onMoveT(e, w); else if (type === 'pointerup') onUp(e, w);
        where(p, w);
        var ev = new PointerEvent(type, {
          clientX: e.clientX + p.x - self.x, clientY: e.clientY + p.y - self.y, screenX: e.screenX, screenY: e.screenY,
          pointerId: e.pointerId, pointerType: e.pointerType, isPrimary: e.isPrimary, button: e.button, buttons: e.buttons, bubbles: true
        });
        ev.__pane = true;
        window.dispatchEvent(ev);
      }, { passive: true });
    });
    d.documentElement.addEventListener('pointerleave', function () {
      var ev = new PointerEvent('pointerleave'); ev.__pane = true;
      document.documentElement.dispatchEvent(ev);
    });
    w.addEventListener('wheel', function (e) {
      e.preventDefault();
      var k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      window.scrollBy(0, e.deltaY * k);
      var ev = new WheelEvent('wheel', { deltaX: e.deltaX, deltaY: e.deltaY, deltaMode: e.deltaMode }); ev.__pane = true;
      window.dispatchEvent(ev);                                       /* (the well listens for a push past the end) */
    }, { passive: false });
    var PAGING = { PageDown: 0.85, PageUp: -0.85, ' ': 0.85, ArrowDown: 0.06, ArrowUp: -0.06 };
    ['keydown', 'keyup'].forEach(function (type) {
      w.addEventListener(type, function (e) {
        var ev = new KeyboardEvent(type, { key: e.key, code: e.code, repeat: e.repeat, shiftKey: e.shiftKey, altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, bubbles: true, cancelable: true });
        ev.__pane = true;
        window.dispatchEvent(ev);
        if (ev.defaultPrevented) { e.preventDefault(); return; }
        if (type !== 'keydown' || e.altKey || e.ctrlKey || e.metaKey) return;
        var se = document.scrollingElement || document.documentElement;
        if (e.key in PAGING) { e.preventDefault(); window.scrollBy(0, PAGING[e.key] * (e.shiftKey && e.key === ' ' ? -1 : 1) * window.innerHeight); }
        else if (e.key === 'Home') { e.preventDefault(); window.scrollTo(0, 0); }
        else if (e.key === 'End') { e.preventDefault(); window.scrollTo(0, se.scrollHeight); }
      });
    });
  }

  function prune() {
    for (var i = panes.length - 1; i >= 0; i--) { var c = true; try { c = panes[i].win.closed; } catch (err) { c = true; } if (c) panes.splice(i, 1); }
    if (on && !panes.length) {
      on = false; reg = null; document.body.classList.remove('glass');
      SID.applySize();
      SID.announce('Back in one window.');
    }
  }

  /* copy a rectangle of the surface into a pane, clipped to what exists (outside it is only ground) */
  function blit(c, src, sx, sy, w, h, cw, ch) {
    var x0 = Math.max(0, sx), y0 = Math.max(0, sy), x1 = Math.min(cw, sx + w), y1 = Math.min(ch, sy + h);
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = GROUND; c.fillRect(0, 0, w, h);
    if (x1 > x0 && y1 > y0) c.drawImage(src, x0, y0, x1 - x0, y1 - y0, x0 - sx, y0 - sy, x1 - x0, y1 - y0);
  }

  window.addEventListener('pointerdown', function (e) { onDown(e, window); }, { passive: true });
  window.addEventListener('pointermove', function (e) { calib(self, e, window); onMoveT(e, window); }, { passive: true });
  window.addEventListener('pointerup', function (e) { onUp(e, window); }, { passive: true });
  window.addEventListener('pointercancel', function () { tear = null; pull(0, 0, 0); }, { passive: true });
  window.addEventListener('pagehide', function () { panes.forEach(function (p) { try { p.win.close(); } catch (err) { /* already gone */ } }); });

  SID.Glass = {
    get on() { return on; },
    get panes() { return panes; },
    open: open,
    /* the drawn region, in css px relative to this window's page (null: just the window) */
    region: function () {
      if (!on) return null;
      grow();
      return reg;
    },

    /* before anything else in a frame: where everything is now */
    pre: function (dt) {
      carried(dt);
      if (!on) return;
      prune();
      if (!on) return;
      if (document.visibilityState !== 'hidden') where(self, window);
      for (var i = 0; i < panes.length; i++) { try { where(panes[i], panes[i].win); } catch (err) { /* closing */ } }
      if (grow()) SID.applySize();
    },

    /* after the frame is drawn: each other window gets the part of it that lies under it */
    post: function (bloomOp) {
      if (!on) return;
      var S = SID.Render.surface, src = S.canvas, dpr = S.dpr, cur = document.body.classList.contains('at-edge') ? 'default' : 'crosshair';
      for (var i = 0; i < panes.length; i++) {
        var p = panes[i];
        try {
          if (p.win.closed || !p.w || !p.h) continue;
          var cw = Math.max(1, Math.round(p.w * dpr)), ch = Math.max(1, Math.round(p.h * dpr));
          if (p.cv.width !== cw || p.cv.height !== ch) { p.cv.width = cw; p.cv.height = ch; }
          var bw = Math.max(32, Math.round(cw / 5)), bh = Math.max(32, Math.round(ch / 5));
          if (p.bl.width !== bw || p.bl.height !== bh) { p.bl.width = bw; p.bl.height = bh; }
          var qx = p.x - self.x, qy = p.y - self.y;                 /* where that window's page is, from this one's */
          blit(p.ctx, src, Math.round(S.ox + qx * dpr), Math.round(S.oy + qy * dpr), cw, ch, S.cw, S.ch);
          p.bctx.globalCompositeOperation = 'copy';
          p.bctx.drawImage(p.cv, 0, 0, bw, bh);
          var bo = bloomOp;
          if (bo !== p.bo) { p.bo = bo; p.bl.style.opacity = bo; }
          if (cur !== p.cur) { p.cur = cur; p.doc.body.style.cursor = cur; }
          for (var k = 0; k < MIRROR.length; k++) {
            var el = document.getElementById(MIRROR[k]), m = p.m[k], op = el ? parseFloat(el.style.opacity) || 0 : 0;
            if (op < 0.004 || !el.width) { if (m.style.opacity !== '0') m.style.opacity = '0'; continue; }
            if (m.width !== el.width || m.height !== el.height) { m.width = el.width; m.height = el.height; }
            m.style.width = el.style.width; m.style.height = el.style.height;
            var mc = m.getContext('2d');
            mc.globalCompositeOperation = 'copy'; mc.drawImage(el, 0, 0);
            m.style.transform = 'translate(' + (-qx).toFixed(1) + 'px,' + (-qy).toFixed(1) + 'px) ' + el.style.transform;
            m.style.opacity = el.style.opacity;
          }
        } catch (err) { /* a window closing mid-frame */ }
      }
    }
  };
})();
