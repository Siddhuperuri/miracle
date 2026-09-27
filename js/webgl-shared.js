/* ------------------------------------------------------------------
   webgl-shared.js  -  the small shared scaffold for the Three.js scenes.

   archive3d.js, dna3d.js and lucent3d.js each need a small, transparent WebGL canvas
   tracking a projected screen position, at a fixed cheap internal resolution. That
   plumbing - not what each scene draws, which is its own - lives here once, so none
   file duplicates it (see the brief's own "avoid duplicated logic" and "build reusable
   primitives"). If Three.js is not present, SID.GL is null and so, in turn, are both of
   the modules that check for it: the same one graceful fallback, from one place.
   ------------------------------------------------------------------ */
(function () {
  'use strict';
  var SID = window.SID;
  if (!window.THREE) { SID.GL = null; return; }
  var THREE = window.THREE, paperCol = null;

  SID.GL = {
    /* device pixel ratio, capped the same way the rest of the piece caps it */
    cap: function () { return Math.min(window.devicePixelRatio || 1, 2); },
    /* the piece's one paper colour (SID.C.PAPER), as a shared THREE.Color */
    paper: function () { return paperCol || (paperCol = new THREE.Color(0.913, 0.886, 0.827)); },
    /* a small, fixed-resolution, alpha renderer on an existing <canvas id="...">.
       Returns {renderer, canvas}, or null for no canvas / no WebGL / anything else
       that throws - callers treat null exactly like "Three.js itself failed to load". */
    makeRenderer: function (canvasId, w, h, options) {
      try {
        options = options || {};
        var scale = options.scale == null ? SID.GL.cap() : options.scale;
        var canvas = document.getElementById(canvasId);
        if (!canvas || !window.WebGLRenderingContext) return null;
        canvas.style.width = w + 'px'; canvas.style.height = h + 'px';   /* the CSS box stays fixed; a transform: scale() resizes it visually, below */
        var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: options.antialias !== false, powerPreference: 'low-power' });
        renderer.setPixelRatio(1);                                      /* setSize already accounts for device pixels */
        renderer.setSize(Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale)), false);
        renderer.setClearColor(0x000000, 0);
        return { renderer: renderer, canvas: canvas, scale: scale };
      } catch (e) { return null; }
    },
    /* Resize a full-view renderer without changing its CSS footprint. `scale` is its internal pixel density. */
    resizeRenderer: function (target, w, h, scale) {
      if (!target || !target.renderer || !target.canvas) return;
      target.scale = scale;
      target.canvas.style.width = w + 'px'; target.canvas.style.height = h + 'px';
      target.renderer.setSize(Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale)), false);
    },
    /* position/scale a tracking canvas (top-left origin, transform-origin: 0 0) so its centre
       lands on (cx,cy) CSS px at `size` CSS px wide, keeping the canvas's own aspect ratio */
    place: function (canvas, cx, cy, size, boxW, boxH) {
      var s = size / boxW;
      canvas.style.transform = 'translate(' + (cx - size / 2).toFixed(1) + 'px,' + (cy - size * boxH / boxW / 2).toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
    }
  };
})();
