/* ------------------------------------------------------------------
   lucent3d.js  -  attention briefly parts the five sheets.

   This is not another scene laid over the work. It samples the existing bloom, then lets
   that light refract through five close depths around the visitor's pointer. The five
   hairline tori use the same five becoming-stages as letters.js: stillness makes them
   share one radius; motion opens a small, springy gap between them. Their precession
   borrows the signature's phase.
   The lens is present only at the vantage, inside a chosen memory, or while attending to
   an archive drawing.

   The camera copies SID.cam's position and basis each frame. The pointer ray and the
   ordinary canvas therefore occupy the same space. If WebGL is unavailable, this module
   disappears and the 2D piece remains complete.
   ------------------------------------------------------------------ */
(function () {
  'use strict';
  var SID = window.SID;
  if (!window.THREE || !SID.GL) { SID.Lucent3D = null; return; }

  var THREE = window.THREE, M = SID.M, clamp = M.clamp, sm = M.smooth;
  var renderer = null, scene = null, camera = null, plane = null, planeMat = null, map = null;
  var sheets = [], disabled = false, fade = 0, prevW = 0, prevH = 0;
  var fwd = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3(), back = new THREE.Vector3();
  var aim = new THREE.Vector3(), basis = new THREE.Matrix4(), scatterSpring = [0, 0], scatter = 0, scatterV = 0;
  var weights = [1, 1, 1, 1, 1];

  function pixelScale() { return Math.max(0.62, Math.min((SID.Render.dpr || SID.GL.cap()) * 0.82, 1.25)); }

  var planeVertex = [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n');

  var planeFragment = [
    'precision mediump float;',
    'uniform sampler2D uMap;',
    'uniform vec2 uPointer;',
    'uniform vec2 uResolution;',
    'uniform vec2 uVelocity;',
    'uniform float uTime;',
    'uniform float uStrength;',
    'uniform float uStillness;',
    'uniform float uMotion;',
    'uniform float uMisalign;',
    'uniform float uPressure;',
    'uniform float uRadius;',
    'uniform float uReduced;',
    'varying vec2 vUv;',
    'void main() {',
    '  float aspect = uResolution.x / max(1.0, uResolution.y);',
    '  vec2 q = (vUv - uPointer) * vec2(aspect, 1.0);',
    '  float r = length(q);',
    '  if (r > uRadius * 1.38) discard;',
    '  float field = 1.0 - smoothstep(uRadius * 0.72, uRadius * 1.38, r);',
    '  vec2 radial = q / max(r, 0.0001);',
    '  vec2 tangent = vec2(-radial.y, radial.x);',
    '  vec2 travel = vec2(uVelocity.x / max(0.2, aspect), uVelocity.y);',
    '  travel = normalize(travel + vec2(0.00001, 0.00002));',
    '  float breath = uReduced > 0.5 ? 0.0 : sin(uTime * 0.62 - r * 30.0) * 0.0009 * uMotion;',
    '  float bend = (0.0006 + uMotion * 0.0045 + uPressure * 0.0012 + abs(uMisalign) * 0.0015 + breath) * field;',
    '  vec2 refract = radial * bend + tangent * sin(r * 36.0 - uTime * 0.42) * uMotion * 0.0011 * field;',
    '  float spread = (0.00018 + uMotion * 0.0038 + uMisalign * 0.0016) * field;',
    '  vec3 gathered = vec3(0.0);',
    '  float total = 0.0;',
    '  for (int i = 0; i < 5; i++) {',
    '    float layer = float(i) - 2.0;',
    '    vec2 offset = travel * layer * spread + tangent * layer * spread * 0.22;',
    '    vec2 uv = clamp(vUv + refract + offset, vec2(0.001), vec2(0.999));',
    '    vec3 sampleLight = texture2D(uMap, uv).rgb;',
    '    float weight = i == 2 ? 0.28 : 0.18;',
    '    gathered += sampleLight * weight;',
    '    total += weight;',
    '  }',
    '  gathered /= total;',
    '  float light = max(max(gathered.r, gathered.g), gathered.b);',
    '  float visible = smoothstep(0.012, 0.19, light);',
    '  float edge = exp(-pow((r - uRadius * 0.91) * 62.0, 2.0));',
    '  float stillForm = 0.15 + 0.48 * uStillness + 0.12 * uPressure;',
    '  float alpha = uStrength * visible * (field * stillForm * 0.62 + edge * 0.14);',
    '  gl_FragColor = vec4(gathered, alpha);',
    '}'
  ].join('\n');

  var sheetVertex = [
    'attribute float aPhase;',
    'uniform float uTime;',
    'uniform float uMotion;',
    'uniform float uPressure;',
    'uniform float uLayer;',
    'varying float vWave;',
    'void main() {',
    '  vec3 p = position;',
    '  float wave = sin(aPhase * 3.0 + uTime * 0.52 + uLayer * 1.7);',
    '  float fine = sin(aPhase * 9.0 - uTime * 0.31 + uLayer);',
    '  float amount = uMotion * 0.032 + uPressure * 0.012;',
    '  p += normal * (wave * amount + fine * amount * 0.18);',
    '  p.z += sin(aPhase * 5.0 + uTime * 0.38 + uLayer) * uMotion * 0.018;',
    '  vWave = 1.0 - uMotion * 0.28 * (0.5 - 0.5 * wave);',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
    '}'
  ].join('\n');

  var sheetFragment = [
    'precision mediump float;',
    'uniform vec3 uColor;',
    'uniform float uOpacity;',
    'varying float vWave;',
    'void main() {',
    '  gl_FragColor = vec4(uColor, uOpacity * vWave);',
    '}'
  ].join('\n');

  function makeRenderer(w, h) {
    var scale = pixelScale();
    var target = SID.GL.makeRenderer('lucent3d', w, h, { scale: scale, antialias: true });
    if (!target) return false;
    renderer = target.renderer;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(46, w / h, 0.08, 120);
    camera.matrixAutoUpdate = true;

    map = new THREE.CanvasTexture(document.getElementById('bloom'));
    map.minFilter = THREE.LinearFilter;
    map.magFilter = THREE.LinearFilter;
    map.generateMipmaps = false;

    planeMat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: map }, uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(w, h) }, uVelocity: { value: new THREE.Vector2() },
        uTime: { value: 0 }, uStrength: { value: 0 }, uStillness: { value: 0 },
        uMotion: { value: 0 }, uMisalign: { value: 0 }, uPressure: { value: 0 },
        uRadius: { value: 0.12 }, uReduced: { value: 0 }
      }, vertexShader: planeVertex, fragmentShader: planeFragment,
      transparent: true, depthWrite: false, side: THREE.DoubleSide
    });
    plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), planeMat);
    plane.renderOrder = 0;
    scene.add(plane);

    var geometry = new THREE.TorusGeometry(1, 0.012, 5, 112);
    var uv = geometry.getAttribute('uv'), phase = new Float32Array(uv.count);
    for (var v = 0; v < phase.length; v++) phase[v] = uv.getX(v) * Math.PI * 2 + uv.getY(v) * 0.71;
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    for (var i = 0; i < 5; i++) {
      var mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 }, uMotion: { value: 0 }, uPressure: { value: 0 },
          uLayer: { value: i }, uColor: { value: SID.GL.paper() }, uOpacity: { value: 0 }
        }, vertexShader: sheetVertex, fragmentShader: sheetFragment,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      var ring = new THREE.Mesh(geometry, mat);
      ring.renderOrder = i + 1;
      scene.add(ring);
      sheets.push(ring);
    }
    prevW = w; prevH = h;
    return true;
  }

  function resize(w, h) {
    if (!renderer || w < 1 || h < 1 || (w === prevW && h === prevH)) return;
    var scale = pixelScale();
    SID.GL.resizeRenderer({ renderer: renderer, canvas: document.getElementById('lucent3d') }, w, h, scale);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    planeMat.uniforms.uResolution.value.set(w, h);
    prevW = w; prevH = h;
  }

  function stageWeights(o, context) {
    var i, rho = null;
    if (context.memory > context.vantage && context.memory >= context.archive) {
      var host = SID.Mind.hosts[SID.Mind.st.door];
      if (host && host.node) rho = host.node.rho;
    } else if (context.archive > context.vantage && context.archive >= context.memory) {
      var attended = SID.Strata && SID.Strata.attended;
      if (attended) rho = attended.rho;
    }
    if (rho != null && SID.Letters) return SID.Letters.stagesOf(rho);
    for (i = 0; i < 5; i++) weights[i] = o.fs.layerAlpha[i] || 0;
    return weights;
  }

  function contextOf(o) {
    var vantage = sm(0.285, 0.335, o.S) * (1 - sm(0.47, 0.535, o.S));
    var mind = SID.Mind, memory = mind && mind.st.door >= 0 ? sm(0.08, 0.82, mind.st.inside) : 0;
    var archive = 0, attended = SID.Strata && SID.Strata.attended;
    if (SID.Deep && SID.Deep.active && attended && attended.art && !attended.art.unlit) {
      archive = sm(0.12, 0.7, attended.vis || 0) * sm(0.05, 0.58, attended.rho || 0);
    }
    return { vantage: vantage, memory: memory, archive: archive, value: Math.max(vantage, memory, archive) };
  }

  function alignCamera(cam) {
    camera.fov = cam.fov;
    camera.aspect = cam.W / cam.H;
    camera.position.set(cam.x, cam.y, cam.z);
    right.set(cam.rx, cam.ry, cam.rz);
    up.set(cam.ux, cam.uy, cam.uz);
    back.set(-cam.fx, -cam.fy, -cam.fz);
    basis.makeBasis(right, up, back);
    camera.quaternion.setFromRotationMatrix(basis);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    fwd.set(cam.fx, cam.fy, cam.fz);
  }

  function frame(o) {
    var inp = SID.input, cam = o.cam, context = contextOf(o), hasPointer = o.mo.present && !inp.out;   /* (a pointer over another window of the piece, js/glass.js, is not over this lens) */
    var target = context.value * (hasPointer ? 1 : 0);
    fade = M.damp(fade, target, target > fade ? 5.5 : 3.2, o.dt);
    var canvas = document.getElementById('lucent3d');
    if (Math.abs(fade - (frame.lastOpacity || 0)) > 0.003) {
      frame.lastOpacity = fade;
      canvas.style.opacity = fade.toFixed(3);
    }
    if (fade < 0.006) return;
    if (disabled) return;
    if (!renderer && !makeRenderer(inp.w, inp.h)) { disabled = true; return; }
    resize(inp.w, inp.h);

    alignCamera(cam);
    var u = planeMat.uniforms, reduced = SID.env.reduced;
    var stillness = reduced ? 1 : o.en.still;
    var speed = reduced ? 0 : inp.speed;
    var rawMotion = reduced ? 0 : clamp(speed * 0.62 + Math.abs(o.mo.sVel) * 0.09 + sm(0.02, 0.9, cam.err) * 0.24, 0, 1);
    M.crit(scatter, scatterV, rawMotion, reduced ? 15 : 5.4, o.dt, scatterSpring);
    scatter = clamp(scatterSpring[0], 0, 1); scatterV = scatterSpring[1];
    var motion = scatter;
    var misalign = sm(0.015, 0.8, cam.err);
    var press = reduced ? 0 : SID.Director.press;
    var ptrX = clamp(o.mo.x / cam.W, 0, 1), ptrY = clamp(1 - o.mo.y / cam.H, 0, 1);
    u.uPointer.value.set(ptrX, ptrY);
    u.uResolution.value.set(inp.w, inp.h);
    u.uVelocity.value.set(reduced ? 0 : inp.vx, reduced ? 0 : -inp.vy);
    u.uTime.value = reduced ? 0 : o.t;
    u.uStrength.value = fade * (0.68 + stillness * 0.32);
    u.uStillness.value = stillness;
    u.uMotion.value = motion;
    u.uMisalign.value = misalign;
    u.uPressure.value = press;
    u.uRadius.value = 0.105 + press * 0.018;
    u.uReduced.value = reduced ? 1 : 0;
    map.needsUpdate = true;

    var depth = 4.1, tangentX = reduced ? 0 : -inp.vy, tangentY = reduced ? 0 : inp.vx;
    var tl = Math.sqrt(tangentX * tangentX + tangentY * tangentY) || 1;
    tangentX /= tl; tangentY /= tl;
    var nx = (o.mo.x - cam.cx) / cam.F, ny = -(o.mo.y - cam.cy) / cam.F;
    var stage = stageWeights(o, context);
    for (var i = 0; i < 5; i++) {
      var ring = sheets[i], d = depth + i * 0.52, layer = i - 2;
      var radius = d * Math.tan(cam.fov * Math.PI / 360) * 0.205;
      var separation = motion * layer * 0.055;
      var screenSlide = motion * layer * radius * 0.075;
      aim.set(cam.x, cam.y, cam.z)
        .addScaledVector(fwd, d)
        .addScaledVector(right, nx * d + tangentX * screenSlide)
        .addScaledVector(up, ny * d + tangentY * screenSlide);
      ring.position.copy(aim);
      ring.quaternion.copy(camera.quaternion);
      ring.rotateZ(reduced ? 0 : o.t * (0.018 + i * 0.003) * motion + o.mo.sVel * 0.12 * layer);
      ring.scale.setScalar(radius * (1 + separation));
      ring.material.uniforms.uTime.value = reduced ? 0 : o.t;
      ring.material.uniforms.uMotion.value = motion;
      ring.material.uniforms.uPressure.value = press;
      ring.material.uniforms.uOpacity.value = fade * (0.045 + 0.19 * stillness + 0.035 * press) * (stage[i] || 0);
    }
    var genePhase = (SID.DNA && SID.DNA.st ? SID.DNA.st.phase : 0) * (1 - stillness);
    for (var j = 0; j < 5; j++) sheets[j].rotateZ(reduced ? 0 : genePhase * 0.018 * (j - 2));
    renderer.render(scene, camera);
  }

  SID.Lucent3D = { frame: frame, resize: function () { resize(SID.input.w, SID.input.h); } };
})();
