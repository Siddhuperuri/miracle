/* ------------------------------------------------------------------
   chamber.js  -  the lower strata of the well.

   THE DNA. At the bottom, below you, five sheets of light lie at five depths, each a different rendering of one figure:
   the signature (dna.js). Move and they slide apart. Stand exactly at the axis and hold still and they add up.
   It is Module 1's vantage again, and what they add up to is not the name but the figure that everything you
   found grew: each sheet is exactly as bright as the layer it stands for was passed through, so the figure is
   as complete as the visit.

   THE SHADOW. Around you at the bottom is a band of dust, everywhere the same, except in one place, where there is
   none. That place is the shape of the name. It is the radiolucent picture: nothing of him is ever drawn, only
   what passes through, and he is the outline of where it did not. Move, and the dust scatters into the shape;
   hold still, and the absence is exact. It is behind you when you arrive.
   ------------------------------------------------------------------ */
(function () {
  'use strict';
  var SID = window.SID, M = SID.M, G = SID.Glyphs, SP = SID.Sprites, Deep = SID.Deep, Edge = SID.Edge, DNA = SID.DNA;
  var CEN = SID.Cam.CENTER, sm = M.smooth, clamp = M.clamp, TAU = M.TAU;

  var LEN = Deep.LEN, az0 = 0, ready = false;

  /* ---------------- the DNA: five sheets, one figure ---------------- */
  var DNA_H = 15, DNA_R = 9.6, DNA_DS = 1.15;
  var fig = { n: 0 };
  function emitDNA(o) {
    var D = Deep.D, vis = sm(LEN - 60, LEN - 16, D);
    if (vis < 0.01) return;
    var t = o.t, g = DNA.g, level = CEN[1] - LEN, N = 1100, i, k;
    fig.n = DNA.sample(N, clamp(DNA.st.prog, 0.05, 1));
    var px = DNA.px, py = DNA.py, n = fig.n;
    var rx = Math.cos(az0), rz = Math.sin(az0), fx = Math.sin(az0), fz = -Math.cos(az0);
    var E = clamp(SID.energy.E, 0, 1.2), still = SID.energy.still;
    /* the layers, as Module 1's: instrument, design, lattice, field, trace. Each stands at its own depth and its own scale, so from the axis they coincide. */
    for (k = 0; k < 5; k++) {
      var h = DNA_H + k * DNA_DS, Rk = DNA_R * h / DNA_H, y = level - h, gv = g[k];
      var a = vis * (0.08 + 0.62 * Math.pow(gv, 0.85));
      if (a < 0.01) continue;
      if (k === 0) {                                                        /* instrument: the frame it is drawn in, and marks along its way */
        SP.ring(CEN[0], y, CEN[2], rx, 0, rz, fx, 0, fz, Rk * 1.02, 96, 0.5 * a, 0, 0);
        SP.seg(CEN[0] - rx * Rk * 1.06, y, CEN[2] - rz * Rk * 1.06, CEN[0] + rx * Rk * 1.06, y, CEN[2] + rz * Rk * 1.06, 0.4 * a, 0, 0);
        SP.seg(CEN[0] - fx * Rk * 1.06, y, CEN[2] - fz * Rk * 1.06, CEN[0] + fx * Rk * 1.06, y, CEN[2] + fz * Rk * 1.06, 0.4 * a, 0, 0);
        for (i = 6; i < n; i += 22) {
          var ux = px[i] - px[i - 1], uy = py[i] - py[i - 1], ul = Math.sqrt(ux * ux + uy * uy) || 1; ux /= ul; uy /= ul;
          var cx0 = px[i] * Rk, cy0 = py[i] * Rk, tl = 0.045 * Rk;
          SP.seg(CEN[0] + (cx0 - uy * tl) * rx + (cy0 + ux * tl) * fx, y, CEN[2] + (cx0 - uy * tl) * rz + (cy0 + ux * tl) * fz, CEN[0] + (cx0 + uy * tl) * rx + (cy0 - ux * tl) * fx, y, CEN[2] + (cx0 + uy * tl) * rz + (cy0 - ux * tl) * fz, 0.7 * a, 0, 0);
        }
      } else if (k === 1) {                                                 /* design: the exact line */
        for (i = 1; i < n; i++) SP.seg(CEN[0] + px[i - 1] * Rk * rx + py[i - 1] * Rk * fx, y, CEN[2] + px[i - 1] * Rk * rz + py[i - 1] * Rk * fz, CEN[0] + px[i] * Rk * rx + py[i] * Rk * fx, y, CEN[2] + px[i] * Rk * rz + py[i] * Rk * fz, 0.92 * a, 1, 0);
      } else if (k === 2) {                                                 /* lattice: the same line, quantised into cells */
        var pitch = 0.036, lqx = -9, lqy = -9;
        for (i = 0; i < n; i++) {
          var qx = Math.round(px[i] / pitch) * pitch, qy = Math.round(py[i] / pitch) * pitch;
          if (qx === lqx && qy === lqy) continue; lqx = qx; lqy = qy;
          SP.dot(CEN[0] + qx * Rk * rx + qy * Rk * fx, y, CEN[2] + qx * Rk * rz + qy * Rk * fz, 0.85 * a, Rk * pitch * 0.34, 0);
        }
      } else if (k === 3) {                                                 /* field: dust that collects onto it, as still as you are */
        var sg = (0.02 + 0.09 * (1 - still) + 0.04 * E) * Rk;
        for (i = 0; i < n; i += 2) {
          var j1 = M.hash(i, 3, 5, 91) * 2 - 1, j2 = M.hash(i, 4, 6, 91) * 2 - 1, j3 = M.hash(i + 1, 5, 7, 91) * 2 - 1, j4 = M.hash(i + 1, 6, 8, 91) * 2 - 1;
          SP.dot(CEN[0] + (px[i] * Rk + j1 * sg) * rx + (py[i] * Rk + j2 * sg) * fx, y, CEN[2] + (px[i] * Rk + j1 * sg) * rz + (py[i] * Rk + j2 * sg) * fz, 0.75 * a, 0.02 * Rk, 0);
          SP.dot(CEN[0] + (px[i] * Rk + j3 * sg) * rx + (py[i] * Rk + j4 * sg) * fx, y, CEN[2] + (px[i] * Rk + j3 * sg) * rz + (py[i] * Rk + j4 * sg) * fz, 0.6 * a, 0.02 * Rk, 0);
        }
      } else {                                                              /* trace: a second, looser pass of a hand */
        var pxo = 0, pyo = 0;
        for (i = 0; i < n; i += 3) {
          var wx = M.noise(i * 0.05, 1, t * 0.06, 12) * 0.03 * Rk, wy = M.noise(i * 0.05, 2, t * 0.06, 13) * 0.03 * Rk;
          var X = px[i] * Rk + wx, Y = py[i] * Rk + wy;
          if (i > 0) SP.seg(CEN[0] + pxo * rx + pyo * fx, y, CEN[2] + pxo * rz + pyo * fz, CEN[0] + X * rx + Y * fx, y, CEN[2] + X * rz + Y * fz, 0.7 * a, 0, 0);
          pxo = X; pyo = Y;
        }
      }
    }
  }

  /* ---------------- the shadow: the name, as where the dust is not ---------------- */
  var SH_R = 10.6, SH_SPAN = 1.5, mask = null, mW = 0, mH = 0, nameBox = null, SU = null, SV = null, SH = null, SE = null, SN = 0;
  var LAY = null, BB = null, PAD = 0.45, LIT = new Float32Array(10), litAll = false;
  function buildMask() {
    var lay = G.layout(['SIDDHARTHA']), bb = lay.bbox, PPU = 100, pad = PAD; LAY = lay; BB = bb;
    mW = Math.ceil((bb.x1 - bb.x0 + 2 * pad) * PPU); mH = Math.ceil((bb.y1 - bb.y0 + 2 * pad) * PPU);
    var cv = document.createElement('canvas'); cv.width = mW; cv.height = mH;
    var c = cv.getContext('2d', { willReadFrequently: true });
    c.fillStyle = '#000'; c.fillRect(0, 0, mW, mH);
    c.strokeStyle = '#fff'; c.lineWidth = 0.2 * PPU; c.lineCap = 'round'; c.lineJoin = 'round';
    lay.strokes.forEach(function (s) {
      if (s.kind === 'tick') return;
      c.beginPath(); s.pts.forEach(function (p, i) { var x = (p[0] - bb.x0 + pad) * PPU, y = mH - (p[1] - bb.y0 + pad) * PPU; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
    });
    var d = c.getImageData(0, 0, mW, mH).data, n = mW * mH; mask = new Uint8Array(n);
    for (var i = 0; i < n; i++) mask[i] = d[i * 4] > 100 ? 1 : 0;
    nameBox = { w: mW / PPU, h: mH / PPU };
    /* how far each pixel is from the name (a chamfer distance, in pixels): the dust settles thickest against its edge, as it does against anything */
    var df = new Float32Array(n), x, y, k, BIG = 1e5;
    for (i = 0; i < n; i++) df[i] = mask[i] ? 0 : BIG;
    for (y = 0; y < mH; y++) for (x = 0; x < mW; x++) {
      k = y * mW + x; var v = df[k];
      if (x > 0) v = Math.min(v, df[k - 1] + 1); if (y > 0) v = Math.min(v, df[k - mW] + 1);
      if (x > 0 && y > 0) v = Math.min(v, df[k - mW - 1] + 1.41); if (x < mW - 1 && y > 0) v = Math.min(v, df[k - mW + 1] + 1.41);
      df[k] = v;
    }
    for (y = mH - 1; y >= 0; y--) for (x = mW - 1; x >= 0; x--) {
      k = y * mW + x; var w2 = df[k];
      if (x < mW - 1) w2 = Math.min(w2, df[k + 1] + 1); if (y < mH - 1) w2 = Math.min(w2, df[k + mW] + 1);
      if (x < mW - 1 && y < mH - 1) w2 = Math.min(w2, df[k + mW + 1] + 1.41); if (x > 0 && y < mH - 1) w2 = Math.min(w2, df[k + mW - 1] + 1.41);
      df[k] = w2;
    }
    /* the dust itself: chosen once, by rejection, from a density that is nothing inside the name and high against its edge */
    var TARGET = 9000, r = M.rng(4242), tries = 0; SU = new Float32Array(TARGET); SV = new Float32Array(TARGET); SH = new Float32Array(TARGET); SE = new Float32Array(TARGET); SN = 0;
    while (SN < TARGET && tries++ < 400000) {
      var u = r(), vv = r(), px = Math.min(mW - 1, (u * mW) | 0), py = Math.min(mH - 1, ((1 - vv) * mH) | 0), dd = df[py * mW + px];
      if (dd < 1) continue;                                                   /* inside the name: no dust */
      var edge = Math.exp(-dd / 9), w = 0.16 + 3.4 * edge;
      if (r() * 3.6 > w) continue;
      SU[SN] = u; SV[SN] = vv; SH[SN] = r(); SE[SN] = edge; SN++;
    }
  }
  function emitShadow(o) {
    var D = Deep.D, vis = sm(LEN - 46, LEN - 14, D);
    if (vis < 0.01 || !mask) return;
    var t = o.t, level = CEN[1] - LEN, E = clamp(SID.energy.E, 0, 1.4), still = SID.energy.still, reduced = SID.env.reduced;
    var capW = SH_SPAN * SH_R / nameBox.w * nameBox.h;                    /* the name's height in the world, so its letters are not stretched */
    var a0 = az0 + Math.PI - SH_SPAN / 2, jit = (0.02 + 0.5 * E + 0.28 * (1 - still)) * (reduced ? 0.4 : 1);
    var lamp = Deep.lamp, lk = lamp.k, a = 0.62 * vis * (1 - 0.86 * Deep.final), i;
    for (i = 0; i < SN; i++) {
      /* motion scatters: the dust wanders, and the more it does the less the shape holds */
      var sx = M.noise(SU[i] * 40, SV[i] * 30, t * 0.3, 4) * jit, sy = M.noise(SU[i] * 33 + 7, SV[i] * 27, t * 0.3 + 9, 5) * jit;
      var ang = a0 + SU[i] * SH_SPAN + sx * 0.06, y = level + (SV[i] - 0.5) * capW + sy * 1.4;
      var dx = CEN[0] + Math.sin(ang) * SH_R, dz = CEN[2] - Math.cos(ang) * SH_R, da = a * (0.32 + 0.68 * SH[i]) * (0.55 + 0.45 * SE[i]);
      if (lk > 0.02) da += 1.1 * vis * Deep.beam(dx, y, dz);                      /* in the void the dust is lit by whatever light you carry */
      SP.dot(dx, y, dz, da, 0.017, 0);
    }
    emitLit(o, level, capW, a0);
    /* and the dust that is all round, thinner: the same dust, everywhere that the name is not */
    for (var c = 0; c < 360; c++) {
      var ang2 = az0 + c / 360 * TAU + (M.hash(c, 1, 2, 555) - 0.5) * 0.02;
      if (Math.abs(M.wrapPi(ang2 - az0 - Math.PI)) < SH_SPAN / 2 * 1.04) continue;
      for (var r2 = 0; r2 < 9; r2++) {
        var ho = M.hash(c, r2, 3, 555), yy = level + (ho - 0.5) * capW * 1.6 * (0.5 + r2 * 0.08);
        SP.dot(CEN[0] + Math.sin(ang2) * SH_R, yy, CEN[2] - Math.cos(ang2) * SH_R, a * 0.3 * (0.4 + 0.6 * ho) * (1 - Math.abs(yy - level) / (capW * 0.9)), 0.015, 0);
      }
    }
  }

  /* The last thing in the void. Where the beam passes over a letter of the name, that letter draws itself: the exact strokes of Module 1's word,
     in hairline light. Sweep the whole name and it is whole, and stays. It was only ever the absence; now it is there because you carried the light. */
  function emitLit(o, level, capW, a0) {
    if (Deep.final < 0.3 || !LAY) return;
    var dt = Math.min(o.dt, 1 / 30), i, g, all = true, ub = nameBox.w, vb = nameBox.h;
    for (i = 0; i < LAY.glyphs.length; i++) {
      g = LAY.glyphs[i];
      var u = (g.cx - BB.x0 + PAD) / ub, v = (g.cy - BB.y0 + PAD) / vb, ang = a0 + u * SH_SPAN, y = level + (v - 0.5) * capW;
      var bm = Deep.beam(CEN[0] + Math.sin(ang) * SH_R, y, CEN[2] - Math.cos(ang) * SH_R);
      LIT[i] = Math.min(1, LIT[i] + bm * dt * 0.7);
      if (LIT[i] < 0.98) all = false;
    }
    if (all && !litAll) { litAll = true; SID.announce('The name, drawn in the light you carried.'); }
    var A = 0.9 * sm(0.3, 0.8, Deep.final);
    for (var s = 0; s < LAY.strokes.length; s++) {
      var st = LAY.strokes[s]; if (st.kind === 'tick') continue;
      var la = LIT[st.glyph] * A; if (la < 0.01) continue;
      var pts = st.pts, px = 0, py = 0, pz = 0;
      for (var j = 0; j < pts.length; j++) {
        var uu = (pts[j][0] - BB.x0 + PAD) / ub, vv = (pts[j][1] - BB.y0 + PAD) / vb, an = a0 + uu * SH_SPAN, yy = level + (vv - 0.5) * capW, x = CEN[0] + Math.sin(an) * (SH_R - 0.02), z = CEN[2] - Math.cos(an) * (SH_R - 0.02);
        if (j) SP.seg(px, py, pz, x, yy, z, la, 1, 0);
        px = x; py = yy; pz = z;
      }
    }
  }

  function update(o) {
    if (!ready) {
      az0 = Edge.az3; buildMask(); ready = true;
    }
  }
  function emit(o) {
    if (!ready) return;
    emitDNA(o); emitShadow(o);
  }

  SID.Chamber = { update: update, emit: emit, get ready() { return ready; }, get lit() { return LIT; }, get litAll() { return litAll; } };
})();
