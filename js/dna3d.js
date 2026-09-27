/* ------------------------------------------------------------------
   dna3d.js  -  the signature, given a third dimension.

   The second and last place Three.js touches this piece. dna.js already draws the
   signature as a flat harmonograph, driven by its own ten loci; this does not replace
   that, it is what stands behind the ghost door once forced (memories.js still draws
   its own flat version in the counter - this is the same figure, seen with depth).

   Nothing here invents a shape. "Branching" is the harmonograph itself, sampled again
   with a few of its own genes very slightly mutated - dna.js's own sampleWith(), which
   already exists for exactly this ("the figure a different set of genes would draw").
   How many such branches appear is DNA.complexity() (what has been discovered); how far
   each strays from the true line is the mutation locus (how out of tune the pendulums
   are) - the same meaning that locus already has everywhere else. The slow turn of the
   camera is the same precession (DNA.st.phase) the flat figure already turns by, not a
   second animation. No colour, no lighting, no shape invented that DNA.js does not
   already compute.

   If Three.js is unavailable this is silently absent (see webgl-shared.js and
   archive3d.js's own note); nothing else in the piece knows or cares.
   ------------------------------------------------------------------ */
(function () {
  'use strict';
  var SID = window.SID;
  if (!window.THREE || !SID.GL) { SID.DNA3D = null; return; }
  var THREE = window.THREE, M = SID.M, DNA = SID.DNA, sm = M.smooth, clamp = M.clamp;

  var BW = 360, BH = 360, N = 220;              /* fixed internal size; points per branch */
  var THRESH = 0.02;

  var canvas = null, renderer = null, scene = null, camera = null, group = null, strands = [];
  var built = false, disabled = false, branchN = -1;

  function rng(seed) { return M.rng(seed >>> 0); }

  function ensure() {
    if (canvas || disabled) return !disabled;
    var r = SID.GL.makeRenderer('dna3d', BW, BH);
    if (!r) { disabled = true; return false; }
    canvas = r.canvas; renderer = r.renderer;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, BW / BH, 0.1, 20);
    camera.position.set(0, 0, 4.4);
    group = new THREE.Group(); scene.add(group);
    built = true;
    return true;
  }

  function makeStrand() {
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((N - 1) * 6), 3));
    var mat = new THREE.LineBasicMaterial({ color: SID.GL.paper(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    var ln = new THREE.LineSegments(geo, mat); ln.frustumCulled = false;
    group.add(ln);
    return { line: ln, yaw: 0, z: 0, seedArr: null };
  }

  /* rebuild the branch set only when the number of branches actually changes (complexity moves slowly) */
  function ensureBranches(n) {
    if (n === branchN) return;
    while (strands.length < n) strands.push(makeStrand());
    for (var i = 0; i < strands.length; i++) strands[i].line.visible = i < n;
    branchN = n;
  }

  function fillFromSample(strand, np, X, Y, z0, spread) {
    var pos = strand.line.geometry.attributes.position.array, m = Math.min(np - 1, N - 1);
    for (var i = 0; i < N - 1; i++) {
      var i0 = Math.min(i, m), i1 = Math.min(i + 1, m);
      pos[i * 6] = X[i0]; pos[i * 6 + 1] = Y[i0]; pos[i * 6 + 2] = z0 + i0 / (m || 1) * spread;
      pos[i * 6 + 3] = X[i1]; pos[i * 6 + 4] = Y[i1]; pos[i * 6 + 5] = z0 + i1 / (m || 1) * spread;
    }
    strand.line.geometry.attributes.position.needsUpdate = true;
  }

  function frame(o) {
    var Mind = SID.Mind; if (!Mind || !Mind.built) return;
    var forb = Mind.forb, k = forb ? forb.k : 0;
    if (!forb || !forb.open || k < THRESH) { if (canvas) canvas.style.opacity = '0'; return; }
    if (!ensure()) return;

    var host = null, hosts = Mind.hosts;
    for (var i = 0; i < hosts.length; i++) if (hosts[i].mem === 'ghost') { host = hosts[i]; break; }
    if (!host || host.czc <= 0) { canvas.style.opacity = '0'; return; }

    var dpr = o.dpr || SID.Render.dpr || 1;
    var rad = (host.node.gl && host.node.gl.cc ? host.node.gl.cc[2] : 0.3) * host.capPx;
    var vw = (SID.input && SID.input.w) || BW, vh = (SID.input && SID.input.h) || BH;
    var size = Math.min(Math.min(vw, vh) * 0.5, Math.max(50, rad * 2.1 / dpr));
    var cx = host.csx / dpr, cy = host.csy / dpr;
    SID.GL.place(canvas, cx, cy, size, BW, BH);
    canvas.style.opacity = (sm(0, 0.08, k) * 0.95).toFixed(3);

    /* how many branches: what has been discovered. how far they stray: how out of tune the pendulums are (mutation) */
    var complexity = DNA.complexity(), mutation = DNA.get('mutation');
    var n = 1 + Math.round(4 * complexity);
    ensureBranches(n);

    var frac = Math.max(0.12, DNA.st.prog), genes = DNA.dump();
    for (i = 0; i < n; i++) {
      var s = strands[i], np;
      if (i === 0) { np = DNA.sample(N, frac); fillFromSample(s, np, DNA.px, DNA.py, 0, 0.02); s.line.material.opacity = k * 0.8; }
      else {
        if (!s.seedArr) {
          var r = rng(i * 7919 + 13); s.seedArr = genes.map(function (v) { return clamp(v + (r() - 0.5) * (0.12 + 0.5 * mutation), 0, 1); });
          s.yaw = (r() - 0.5) * 1.1; s.z = (r() - 0.5) * 0.5 - 0.15 * i;
        }
        var res = DNA.sampleWith(s.seedArr, N, frac);
        fillFromSample(s, res.n, res.x, res.y, s.z, 0.16 + 0.1 * i);
        s.line.rotation.y = s.yaw;
        s.line.material.opacity = k * (0.42 - 0.055 * i);
      }
    }
    var reduced = SID.env.reduced;
    group.rotation.y = reduced ? 0 : DNA.st.phase * 0.6;             /* the same slow precession the flat figure already turns by */
    camera.position.x = reduced ? 0 : 0.1 * Math.sin(o.t * 0.11);
    camera.lookAt(0, 0, -0.3);

    renderer.render(scene, camera);
  }

  SID.DNA3D = { frame: frame };
})();
