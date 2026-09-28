/* ------------------------------------------------------------------
   ledger.js  -  what stands above the wall.

   Scroll in the wall used to do nothing unless a door was chosen. Now, with nothing chosen, it lifts you: the
   camera rises out of the middle of the crossword toward the top of the wall and into the space above it, and
   comes back down before the ending begins (mind.js: `rise`). Up there, level with your eyes, are fifteen rings
   round the room, one for each tool the record names. Each is a circle at the wall's own radius, hairline, and
   almost nothing until it is asked.

   Rest your attention on a concept below and the rings of the tools that concept is made with light up, and the
   name of each tool is written on its ring, directly above the concept it belongs to. A tool used by several
   concepts is one ring with several names on it, so the ring is what connects them: attend to CODE and PYTHON
   and JAVASCRIPT are lit, and so are the places on those rings where AI, TECHNOLOGY, WEB and MOTION also stand.
   The connection was there before you looked; you have only made it visible.

   The names obey the same law as everything else: up among the rings they are quietly there, and resting on
   one - not only on its concept down at the wall, which you cannot look at in the same moment - brings it, and
   its ring, up to full light. Where two concepts that use a tool stand closer together than the name is long
   (CODE and TECHNOLOGY), the name is written once between them, not twice over itself.

   Concepts the record names no tool for (CURIOSITY, INTUITION, IMAGINATION, SYSTEMS, STRUCTURE... ) have nothing above
   them. That is not a gap: they are frames, not claims. It is the same honesty as the evidence ceilings.

   What has been lit is remembered. On a later visit those rings are faintly there before anything is asked.
   ------------------------------------------------------------------ */
(function () {
  'use strict';
  var SID = window.SID, M = SID.M, G = SID.Glyphs, SP = SID.Sprites, Mind = SID.Mind, Visit = SID.Visit, DNA = SID.DNA;
  var CEN = SID.Cam.CENTER, R = Mind.R, CELL = Mind.CELL, sm = M.smooth, clamp = M.clamp, TAU = M.TAU;

  var ROW0 = -6.6, DROW = 0.58;           /* the first ring, and the gap between rings, in rows of the wall (up is negative) */

  /* tool -> the concepts it is evidence for, as the record has it. A concept's column is where its word is centred on the wall. */
  var TOOLS = [
    ['FIGMA', ['DESIGN', 'STRUCTURE']], ['FRAMER', ['DESIGN', 'MOTION']], ['ILLUSTRATOR', ['ART', 'DESIGN']], ['PHOTOSHOP', ['ART', 'DESIGN']],
    ['CANVA', ['ART']], ['LIGHTROOM', ['CAMERA']],
    ['HTML', ['WEB', 'CODE']], ['CSS', ['WEB', 'CODE']], ['JAVASCRIPT', ['WEB', 'CODE', 'MOTION', 'GAMES', 'EXPERIMENTS', 'TECHNOLOGY']], ['REACT', ['WEB']],
    ['PYTHON', ['AI', 'CODE', 'TECHNOLOGY']], ['JAVA', ['CODE', 'TECHNOLOGY']], ['PYTORCH', ['AI']],
    ['WEBGL', ['3D', 'EXPERIMENTS']], ['GSAP', ['MOTION']]
  ];
  /* nudges (in columns) so that two concepts standing on one ring do not write over each other */
  var NUDGE = { WEB: -1.0, EXPERIMENTS: 1.3, CODE: 1.0, TECHNOLOGY: -0.9, ART: -0.9, DESIGN: 0.6, MOTION: 0.4, AI: -0.2, CAMERA: 0.9, STRUCTURE: -0.6, '3D': -0.4 };

  var rings = [], byConcept = {}, built = false, force = null;
  /* Above the last ring, one more, that says nothing about the work: how the piece itself is made. It is only ever seen by someone who has
     gone up to the top of the room and looked straight up, and stayed. It is true, and it is the constraint the whole piece was made under. */
  var COLO = 'MADE OF HTML CSS AND JAVASCRIPT AND NOTHING ELSE', colo = { on: 0, hold: 0, seen: !!(Visit.rec.tl >> 20 & 1), mem: Visit.mem.tl >> 20 & 1 };
  /* how strongly a concept is being attended; `force` lets a test say so.
     Not the word's own averaged act: that average is taken across every letter of the word, so resting
     on one letter of an eleven-letter word like ENGINEERING could never average high enough to cross the
     threshold below, however long you held still - short words lit easily, long ones almost never did.
     The ledger only needs to know whether the visitor is asking about this concept at all, so it reads
     the single most-attended letter of the word instead: resting on any one letter is then enough,
     regardless of how long the word is. */
  function actOf(mk) {
    if (force && force[mk.c] != null) return force[mk.c];
    var cells = mk.w.cells, best = 0;
    for (var i = 0; i < cells.length; i++) if (cells[i].A > best) best = cells[i].A;
    return best;
  }

  var HT = CELL * 0.3, DOOR = 15, ALPHA = TAU / 32;       /* the names' cap height; the door's column and one column's angle */
  var TC = {};
  function strokesOf(str) { return TC[str] || (TC[str] = G.textStrokes(str, { track: 0.28, ticks: false })); }

  function build() {
    var words = {}; Mind.words.forEach(function (w) { words[w.text] = w; });
    TOOLS.forEach(function (t, i) {
      var rg = { name: t[0], row: ROW0 - i * DROW, y: CEN[1] - (ROW0 - i * DROW) * CELL, marks: [], labels: [], on: 0, mem: (Visit.mem.tl >> i & 1) ? 1 : 0, seen: !!(Visit.rec.tl >> i & 1), hold: 0, i: i };
      t[1].forEach(function (c) {
        var w = words[c]; if (!w) return;
        var col = (w.dir === 'A' ? w.c + (w.text.length - 1) / 2 : w.c) + (NUDGE[c] || 0);
        rg.marks.push({ c: c, col: col, w: w });
        (byConcept[c] = byConcept[c] || []).push(rg);
      });
      /* one name per place: marks nearer each other than the name is long (plus a gap, so the same word never
         stands twice side by side, as JAVA did over TECHNOLOGY and CODE, which cross) share one label, written
         once at their middle */
      var wWorld = strokesOf(rg.name).width * HT, wCols = wWorld / (R * ALPHA);
      rg.marks.slice().sort(function (a, b) { return a.col - b.col; }).forEach(function (mk) {
        var lb = rg.labels[rg.labels.length - 1];
        if (lb && mk.col - lb.col < wCols + 1.5) { lb.marks.push(mk); lb.hi = mk.col; lb.col = (lb.lo + lb.hi) / 2; }
        else rg.labels.push({ marks: [mk], lo: mk.col, hi: mk.col, col: mk.col, w: wWorld, lv: 0 });
      });
      rings.push(rg);
    });
    built = true;
  }

  /* how strongly a concept's own letters are asking, 0..1 */
  function askOf(mk) { return clamp((actOf(mk) - 0.1) * 3.4, 0, 1); }

  /* how strongly each ring is being asked: the attention on the concepts that use it, or on its names themselves
     (and, through it, on the ring's other names) */
  var P = [0, 0, 0], cam = SID.cam;
  function update(o) {
    if (!built) build();
    var dt = Math.min(o.dt, 1 / 30), i, j, st = Mind.st;
    var reach = sm(0.3, 0.75, st.rise) * 0.6 + 0.4;                    /* asked from the middle of the room it is fainter than from up there */
    /* where attention is: the pointer, or without one the middle of the view (as in strata.js) */
    var ptr = o.ptr, has = !!(ptr && ptr.present), ax = has ? ptr.x : cam.cx, ay = has ? ptr.y : cam.cy, aS = (has ? 1 : 0.7) * st.wallA;
    var dpr = o.dpr || 1, az0 = Mind.wallAz;
    for (i = 0; i < rings.length; i++) {
      var rg = rings[i], want = 0, lw = 0;
      for (j = 0; j < rg.marks.length; j++) want = Math.max(want, askOf(rg.marks[j]));
      /* a name rested on: an ellipse the length of the word and a little taller than it, on screen */
      for (j = 0; j < rg.labels.length; j++) {
        var lb = rg.labels[j], ang = az0 + (lb.col - DOOR) * ALPHA, lp = 0;
        if (aS > 0.01 && SID.Cam.project(CEN[0] + R * Math.sin(ang), rg.y, CEN[2] - R * Math.cos(ang), P) && P[2] > 0.3) {
          var inv = cam.F / P[2];
          var ex = (P[0] - ax) / Math.max(30 * dpr, 0.55 * lb.w * inv), ey = (P[1] - ay) / Math.max(22 * dpr, 1.3 * HT * inv);
          lp = Math.exp(-0.5 * (ex * ex + ey * ey)) * aS;
        }
        lb.lv = M.damp(lb.lv, lp, lp > lb.lv ? 4 : 0.6, dt);
        if (lb.lv > lw) lw = lb.lv;
      }
      /* the concept it lights is down at the wall and the ring is up here: you cannot look at both at once, so
         a ring must stay lit for several seconds after you look up to read it, not fade with the letter's own
         (much faster) attention - the same "rises while you stay, falls slowly when you leave" as reactions.js */
      var target = Math.max(want * reach, lw);
      rg.on = M.damp(rg.on, target, target > rg.on ? 3.2 : 0.3, dt);
      if (rg.on > 0.45) { rg.hold += dt; if (rg.hold > 1.6 && !rg.seen) { rg.seen = true; Visit.rec.tl = (Visit.rec.tl | 0) | (1 << rg.i); DNA.express('ideas', 0.02); } }
      else rg.hold = Math.max(0, rg.hold - dt * 0.3);
    }
    /* the top: readable at a soft baseline for as long as you have risen into the room (through the whole
       scroll up, not only once you arrive), and brought to full light when you look up there and hold still */
    var upFull = st.rise > 0.7 && st.pitch > 0.75 && o.en.stillT > 0.5;
    var upTarget = upFull ? 1 : (st.rise > 0.2 ? 0.55 : 0);
    colo.on = M.damp(colo.on, upTarget, upFull ? 1.4 : 0.8, dt);
    if (colo.on > 0.6) { colo.hold += dt; if (colo.hold > 2 && !colo.seen) { colo.seen = true; Visit.rec.tl = (Visit.rec.tl | 0) | (1 << 20); SID.announce('At the top of the room, a line: made of HTML, CSS and JavaScript, and nothing else.'); } }
    else colo.hold = Math.max(0, colo.hold - dt * 0.3);
  }
  /* text bent round the ring, letter by letter, centred on an azimuth */
  function ringTextCurve(str, angC, y, h, a, wc, col) {
    var w = 0, i, gd, x, sn, cs, tx, tz, bx, bz, k, j, p;
    for (i = 0; i < str.length; i++) { gd = G.defs[str[i]] || G.defs[' ']; w += (gd.w + 0.3) * h; }
    x = -w / 2;
    for (i = 0; i < str.length; i++) {
      gd = G.defs[str[i]] || G.defs[' '];
      var ang = angC + (x + gd.w * h / 2) / R; sn = Math.sin(ang); cs = Math.cos(ang); tx = cs; tz = sn; bx = CEN[0] + R * sn; bz = CEN[2] - R * cs;
      for (k = 0; k < gd.s.length; k++) {
        p = gd.s[k];
        for (j = 1; j < p.length; j++) {
          var a0 = (p[j - 1][0] - gd.w / 2) * h, b0 = p[j - 1][1] * h, a1 = (p[j][0] - gd.w / 2) * h, b1 = p[j][1] * h;
          SP.seg(bx + tx * a0, y + b0 - h * 0.5, bz + tz * a0, bx + tx * a1, y + b1 - h * 0.5, bz + tz * a1, a, wc || 0, col || 0);
        }
      }
      x += (gd.w + 0.3) * h;
    }
  }

  /* micro-type on the ring, standing on the wall's radius and turned to face the middle of the room */
  function ringText(str, ang, y, h, a) {
    var s = strokesOf(str), w = s.width * h;
    var sn = Math.sin(ang), cs = Math.cos(ang), tx = cs, tz = sn, bx = CEN[0] + R * sn, bz = CEN[2] - R * cs;
    for (var i = 0; i < s.strokes.length; i++) {
      var p = s.strokes[i];
      for (var j = 1; j < p.length; j++) {
        var a0 = p[j - 1][0] * h - w / 2, b0 = p[j - 1][1] * h, a1 = p[j][0] * h - w / 2, b1 = p[j][1] * h;
        SP.seg(bx + tx * a0, y + b0 - h * 0.5, bz + tz * a0, bx + tx * a1, y + b1 - h * 0.5, bz + tz * a1, a, 0, 0);
      }
    }
  }

  function emit(o) {
    if (!built) return;
    var st = Mind.st, wallA = st.wallA, rise = st.rise;
    if (wallA < 0.02) return;
    /* it exists at the top of the room even before you go up, only more faintly - but attention, not
       exactly how risen you are, is meant to be what makes a ring legible: three separate reports of
       "empty"/"too faint" turned out to be visitors who had rested on a word correctly but were not
       precisely far enough into the rise window, so the old 0.3 floor was starving an otherwise fully
       "on" ring. Raised so rise only ever adds a modest finishing brightness, never gates legibility. */
    var vis = wallA * (0.6 + 0.4 * sm(0.05, 0.5, rise)) * (1 - Mind.ext.fade);
    if (vis < 0.01) return;
    var az0 = Mind.wallAz, i, j, k;
    /* up among the rings every name is quietly there, legible if you look for it (and a ring lit on an earlier
       visit is there from anywhere); asked - its concept attended, or the name itself rested on - it is at full
       light, and brightest where it is being asked. A resting level that is neither readable nor absent read as
       broken, so the quiet level is kept clearly readable and the lit level clearly brighter than it. */
    var up = sm(0.2, 0.75, rise);
    var ca = vis * (0.3 * colo.mem + 0.85 * colo.on);
    if (ca > 0.01) { var cy = CEN[1] - (ROW0 - TOOLS.length * DROW - 0.4) * CELL; SP.ring(CEN[0], cy, CEN[2], 1, 0, 0, 0, 0, 1, R, 120, ca * 0.5, 0, 0); ringTextCurve(COLO, az0, cy, HT, ca, 1, 1); }
    for (i = 0; i < rings.length; i++) {
      var rg = rings[i], on = rg.on, base = 0.05 + 0.1 * rg.mem;
      var a = vis * (base + 0.34 * on);
      if (a > 0.006) SP.ring(CEN[0], rg.y, CEN[2], 1, 0, 0, 0, 0, 1, R, 120, a, 0, 0);
      var quiet = Math.min(0.34, 0.3 * up + 0.14 * rg.mem);
      for (j = 0; j < rg.labels.length; j++) {
        var lb = rg.labels[j], ang = az0 + (lb.col - DOOR) * ALPHA, focus = lb.lv;
        for (k = 0; k < lb.marks.length; k++) focus = Math.max(focus, askOf(lb.marks[k]));
        var aa = vis * (quiet + on * (0.8 + 0.4 * focus));
        if (aa < 0.02) continue;
        ringText(rg.name, ang, rg.y, HT, aa);
        /* a short plumb line from the name toward each concept below that is asking for it */
        for (k = 0; k < lb.marks.length; k++) {
          var mk = lb.marks[k], mine = askOf(mk);
          if (mine < 0.02) continue;
          var ma = az0 + (mk.col - DOOR) * ALPHA, px = CEN[0] + R * Math.sin(ma), pz = CEN[2] - R * Math.cos(ma);
          SP.seg(px, rg.y - CELL * 0.26, pz, px, rg.y - CELL * 0.26 - CELL * 0.7 * mine, pz, aa * 0.9, 0, 0);
        }
      }
    }
  }

  SID.Ledger = { update: update, emit: emit, rings: rings, get built() { return built; }, set force(v) { force = v; } };
})();
