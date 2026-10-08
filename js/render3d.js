/* Renderizador 2.5D com Three.js: cenários em 3D, lutadores low-poly, projéteis, partículas,
   câmera dinâmica e bloom. A lógica do jogo continua em 2D (x, y); aqui só convertemos para o espaço 3D
   com y3 = GROUND - y e z = profundidade. */
class Renderer3D {
  constructor(canvas) {
    if (!window.THREE) throw new Error('Three.js não carregado');
    this.canvas = canvas;
    const renderer = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(CFG.W, CFG.H, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, CFG.W / CFG.H, 10, 9000);
    this.camPos = new THREE.Vector3(640, 210, 1300);
    this.camLook = new THREE.Vector3(640, 120, 0);
    this.camera.position.copy(this.camPos); this.camera.lookAt(this.camLook);

    this.stageGroup = null; this.stageId = null; this.stageLights = [];
    this.rigs = new Map(); this.showRigs = new Map(); this.projVisuals = new Map();
    this.frame = 0; this.colorCache = new Map();
    this.initLights(); this.initParticles(); this.initPost();
  }

  /* ---------- luzes e pós-processamento ---------- */
  initLights() {
    this.hemi = new THREE.HemisphereLight(0xcfe8ff, 0x8a7a66, 0.5);
    this.sun = new THREE.DirectionalLight(0xfff2d6, 0.75);
    this.sun.position.set(1040, 900, 700);
    this.sun.target.position.set(640, 0, 0);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.left = -1000; sc.right = 1000; sc.top = 700; sc.bottom = -500; sc.near = 100; sc.far = 3500;
    this.sun.shadow.bias = -0.0005;
    this.fill = new THREE.DirectionalLight(0xffffff, 0.18); this.fill.position.set(-500, 300, 900);
    this.scene.add(this.hemi, this.sun, this.sun.target, this.fill);
  }
  initPost() {
    this.composer = null;
    try {
      if (THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass) {
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        this.bloom = new THREE.UnrealBloomPass(new THREE.Vector2(CFG.W, CFG.H), 0.6, 0.45, 0.975);
        this.composer.addPass(this.bloom);
      }
    } catch (e) { this.composer = null; }
  }

  /* ---------- partículas (reusa a simulação de particles.js) ---------- */
  initParticles() {
    const N = this.maxParticles = 3000;
    const geo = this.pGeo = new THREE.BufferGeometry();
    this.pPos = new Float32Array(N * 3); this.pCol = new Float32Array(N * 3); this.pSize = new Float32Array(N); this.pAlpha = new Float32Array(N);
    geo.setAttribute('position', new THREE.BufferAttribute(this.pPos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('pcolor', new THREE.BufferAttribute(this.pCol, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('psize', new THREE.BufferAttribute(this.pSize, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('palpha', new THREE.BufferAttribute(this.pAlpha, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setDrawRange(0, 0);
    const mat = new THREE.ShaderMaterial({
      uniforms: { tex: { value: Rig3D.glowTexture() } },
      vertexShader: `attribute vec3 pcolor; attribute float psize; attribute float palpha; varying vec3 vC; varying float vA;
        void main(){ vC = pcolor; vA = palpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = psize * (1100.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D tex; varying vec3 vC; varying float vA;
        void main(){ vec4 t = texture2D(tex, gl_PointCoord); gl_FragColor = vec4(vC * t.rgb, t.a) * vA; }`,
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    });
    this.points = new THREE.Points(geo, mat); this.points.frustumCulled = false;
    this.scene.add(this.points);
  }
  color(str) {
    let c = this.colorCache.get(str);
    if (!c) { c = new THREE.Color(); try { c.set(str.startsWith('rgba') ? str.replace('rgba', 'rgb').replace(/,[^,]*\)$/, ')') : str); } catch (e) { c.set('#ffffff'); } this.colorCache.set(str, c); }
    return c;
  }
  syncParticles() {
    let n = 0; const N = this.maxParticles;
    for (const p of Particles.list) {
      if (n >= N) break;
      if (p.z === undefined) p.z = rand(-40, 40);
      const t = p.life / p.maxLife;
      const c = this.color(p.color);
      this.pPos[n * 3] = p.x; this.pPos[n * 3 + 1] = CFG.GROUND - p.y; this.pPos[n * 3 + 2] = p.z;
      this.pCol[n * 3] = c.r; this.pCol[n * 3 + 1] = c.g; this.pCol[n * 3 + 2] = c.b;
      const base = p.shape === 'ring' ? 3.2 : p.shape === 'spark' ? 2.4 : 2.6;
      this.pSize[n] = p.size * base * (p.shrink ? 0.3 + 0.7 * t : 1) * 2.2;
      this.pAlpha[n] = Math.min(1, t * 1.5) * (p.alpha || 1);
      n++;
    }
    this.pGeo.setDrawRange(0, n);
    for (const k of ['position', 'pcolor', 'psize', 'palpha']) this.pGeo.attributes[k].needsUpdate = true;
  }

  /* ---------- cenário ---------- */
  setStage(stage) {
    if (this.stageId === stage.id) return;
    if (this.stageGroup) { this.scene.remove(this.stageGroup); this.stageGroup.traverse((m) => { if (m.material && m.material.map && m.userData.ownTex) m.material.map.dispose(); if (m.material && m.userData.ownMat) m.material.dispose(); }); }
    this.stageId = stage.id;
    const g = this.stageGroup = new THREE.Group();
    const S = STAGE3D[stage.id] || STAGE3D.templo;

    // pano de fundo: a arte 2D do cenário vira textura de um plano distante
    const bd = this.bdCanvas = document.createElement('canvas'); bd.width = 1280; bd.height = CFG.GROUND;
    this.bdCtx = bd.getContext('2d'); this.bdStage = stage;
    stage.draw(this.bdCtx, 0);
    this.bdTex = new THREE.CanvasTexture(bd);
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(4200, 2100), new THREE.MeshBasicMaterial({ map: this.bdTex, fog: false }));
    backdrop.position.set(640, 1050, -1400); backdrop.userData.ownTex = true; backdrop.userData.ownMat = true;
    g.add(backdrop);

    // chão
    const floorTex = makeFloorTexture(stage);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(6400, 2300), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.95, metalness: 0 }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(640, 0, -250); floor.receiveShadow = true; floor.userData.ownTex = true; floor.userData.ownMat = true;
    g.add(floor);

    // adereços 3D e luzes específicas
    for (const l of this.stageLights) this.scene.remove(l);
    this.stageLights = [];
    S.build(g, this);
    this.scene.background = new THREE.Color(S.bg);
    this.scene.fog = new THREE.Fog(new THREE.Color(S.fog || S.bg), 1700, 3600);
    this.hemi.color.set(S.hemi[0]); this.hemi.groundColor.set(S.hemi[1]); this.hemi.intensity = (S.hemi[2] || 0.9) * 0.55;
    this.sun.color.set(S.sun[0]); this.sun.intensity = S.sun[1] * 0.68;
    if (S.sunPos) this.sun.position.set(S.sunPos[0], S.sunPos[1], S.sunPos[2]);
    this.scene.add(g);
  }
  updateBackdrop(t) {
    if (!this.bdTex || this.frame % 5 !== 0) return;
    this.bdStage.draw(this.bdCtx, t); this.bdTex.needsUpdate = true;
  }
  addStageLight(light) { this.scene.add(light); this.stageLights.push(light); return light; }

  /* ---------- lutadores ---------- */
  rigFor(map, key, ch) {
    let r = map.get(key);
    if (r && r.char !== ch) { this.scene.remove(r.group); r.dispose(); r = null; }
    if (!r) { r = Rig3D.create(ch); this.scene.add(r.group); map.set(key, r); }
    r.group.visible = true; r.used = this.frame;
    return r;
  }
  hideUnused(map) { for (const [k, r] of map) if (r.used !== this.frame) r.group.visible = false; }

  syncFighters(game) {
    for (const f of game.fighters) {
      const r = this.rigFor(this.rigs, f, f.char);
      r.group.position.set(f.x, CFG.GROUND - f.y, 0);
      r.group.scale.x = f.facing;
      const blink = f.invulnFrames > 0 && Math.floor(f.frame / 3) % 2 === 0;
      r.group.visible = !blink;
      r.used = this.frame;
      r.update(f.joints, { pose: f.pose, avatarState: f.char.id === 'aang' && (f.pose === 'super' || f.superActive), flash: f.flash > 0 });
    }
    for (const [f, r] of this.rigs) if (!game.fighters.includes(f)) { this.scene.remove(r.group); r.dispose(); this.rigs.delete(f); }
  }

  /* ---------- projéteis ---------- */
  syncProjectiles(list) {
    for (const p of list) {
      if (p.dead) continue;
      let v = this.projVisuals.get(p);
      if (!v) { v = makeProjectileVisual(p, this); this.scene.add(v.group); this.projVisuals.set(p, v); }
      v.update(p);
    }
    for (const [p, v] of this.projVisuals) if (p.dead || !list.includes(p)) { this.scene.remove(v.group); if (v.dispose) v.dispose(); this.projVisuals.delete(p); }
  }

  /* ---------- câmera ---------- */
  updateCamera(target, look, k, shake) {
    this.camPos.lerp(target, k); this.camLook.lerp(look, k);
    this.camera.position.copy(this.camPos);
    if (shake) this.camera.position.x += shake[0], this.camera.position.y += shake[1];
    this.camera.lookAt(this.camLook);
  }
  fightCamera(game) {
    const [a, b] = game.fighters;
    const mid = (a.x + b.x) / 2, spread = Math.abs(a.x - b.x);
    let dist = clamp(650 + spread * 0.95, 950, 1750), tx = clamp(mid, 300, 980), ty = 120, k = 0.07;
    if (game.phase === 'ko' && game.winner) { const l = game.fighters[1 - game.winner.side]; tx = lerp(tx, clamp(l.x, 250, 1030), 0.6); dist = 780; ty = 100; k = 0.05; }
    else if (game.superFlash > 0 && game.superUser) { tx = clamp(game.superUser.x, 250, 1030); dist = 720; ty = 110; k = 0.12; }
    this.updateCamera(new THREE.Vector3(tx, ty + 90, dist), new THREE.Vector3(tx, ty, 0), k, [game.shakeX, game.shakeY]);
  }

  /* projeta um ponto do plano lógico (x, y com y para baixo) para a tela (usado pelo overlay de hitboxes) */
  project(x, y) {
    const v = new THREE.Vector3(x, CFG.GROUND - y, 0).project(this.camera);
    return [((v.x + 1) / 2) * CFG.W, ((1 - v.y) / 2) * CFG.H];
  }

  /* ---------- render ---------- */
  draw() {
    if (this.composer) this.composer.render(); else this.renderer.render(this.scene, this.camera);
  }
  render(game) {
    this.frame++;
    switch (game.scene) {
      case 'fight': return this.renderFight(game);
      case 'title': { const xs = [40, 230, 420, 860, 1050, 1240];
        return this.renderShowcase(game, STAGES[0],
          CHARACTERS.map((ch, i) => ({ key: 't' + i, char: ch, x: xs[i], pose: 'idle', t: game.t + i * 17, facing: i < 3 ? 1 : -1 })),
          [640, 330, 1500], [640, 230, 0]); }
      case 'controls': case 'settings': case 'remap': case 'tournamentSetup': case 'bracket': return this.renderShowcase(game, STAGES[3], [], [640, 330, 1500], [640, 230, 0]);
      case 'rules': return this.renderShowcase(game, STAGES[game.stageIndex], [], [640, 330, 1500], [640, 230, 0]);
      case 'daily': { const d = game.dailyChallenge(); return this.renderShowcase(game, STAGES[d.stage], [
        { key: 'L', char: CHARACTERS[d.p1], x: 330, pose: 'idle', t: game.t, facing: 1 }, { key: 'R', char: CHARACTERS[d.p2], x: 950, pose: 'idle', t: game.t + 20, facing: -1 },
      ], [640, 250, 1250], [640, 110, 0]); }
      case 'ladder': return this.renderShowcase(game, STAGES[game.stageIndex], [
        { key: 'L', char: CHARACTERS[game.select.p1], x: 330, pose: 'idle', t: game.t, facing: 1 },
        { key: 'R', char: CHARACTERS[game.select.p2], x: 950, pose: 'idle', t: game.t + 20, facing: -1 },
      ], [640, 250, 1250], [640, 110, 0]);
      case 'continue': return this.renderShowcase(game, STAGES[game.stageIndex], [{ key: 'L', char: CHARACTERS[game.select.p1], x: 640, pose: 'ko', t: game.t, facing: 1 }], [640, 250, 1250], [640, 110, 0]);
      case 'ending': return this.renderShowcase(game, STAGES[game.stageIndex], [{ key: 'L', char: CHARACTERS[game.select.p1], x: 300, pose: 'win', t: game.t, facing: 1 }], [500, 250, 1100], [640, 110, 0]);
      case 'survivalEnd': return this.renderShowcase(game, STAGES[game.stageIndex], [{ key: 'L', char: CHARACTERS[game.select.p1], x: 640, pose: 'ko', t: game.t, facing: 1 }], [640, 250, 1250], [640, 110, 0]);
      case 'select': { const s = game.select;
        return this.renderShowcase(game, STAGES[1], [
          { key: 'L', char: skinnedChar(CHARACTERS[s.p1], s.skin1), x: 250, pose: s.p1Done ? 'win' : 'idle', t: game.t, facing: 1 },
          { key: 'R', char: skinnedChar(CHARACTERS[s.p2], s.skin2), x: 1030, pose: s.p2Done ? 'win' : 'idle', t: game.t + 30, facing: -1 },
        ], [640, 230, 1180], [640, 95, 0]); }
      case 'stage': return this.renderShowcase(game, STAGES[game.stageIndex], [
        { key: 'L', char: CHARACTERS[game.select.p1], x: 380, pose: 'idle', t: game.t, facing: 1 },
        { key: 'R', char: CHARACTERS[game.select.p2], x: 900, pose: 'idle', t: game.t + 30, facing: -1 },
      ], [640, 240, 1350], [640, 130, 0]);
      case 'result': { const w = game.winner, l = game.fighters[1 - w.side];
        return this.renderShowcase(game, game.stage, [
          { key: 'L', char: w.char, x: 430, pose: 'win', t: game.t, facing: 1 },
          { key: 'R', char: l.char, x: 880, pose: 'ko', t: game.t, facing: -1 },
        ], [600, 230, 950], [640, 100, 0]); }
    }
  }
  flicker() { for (const l of this.stageLights) if (l.userData.flicker) l.intensity = 1.3 + Math.random() * 0.6; }
  renderFight(game) {
    this.setStage(game.stage);
    this.updateBackdrop(game.t); this.flicker();
    this.hideUnused(this.showRigs);
    this.syncFighters(game);
    this.syncProjectiles(game.projectiles);
    this.syncParticles();
    this.fightCamera(game);
    this.draw();
  }
  renderShowcase(game, stage, figures, camPos, camLook) {
    this.setStage(stage);
    this.updateBackdrop(game.t); this.flicker();
    for (const [, r] of this.rigs) r.group.visible = false;
    for (const fg of figures) {
      const r = this.rigFor(this.showRigs, fg.key, fg.char);
      const fake = { pose: fg.pose, poseT: fg.t, attackPhase: 1, joints: null, char: fg.char };
      updateJoints(fake, true);
      r.group.position.set(fg.x, 0, fg.z || 0); r.group.scale.x = fg.facing;
      r.update(fake.joints, { pose: fg.pose, staff: false });
    }
    this.hideUnused(this.showRigs);
    this.syncProjectiles([]);
    this.syncParticles();
    this.updateCamera(new THREE.Vector3(camPos[0], camPos[1], camPos[2]), new THREE.Vector3(camLook[0], camLook[1], camLook[2]), 0.1, null);
    this.draw();
  }
}

/* ---------- textura do chão ---------- */
function makeFloorTexture(stage) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = stage.floor; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = stage.shadow; g.lineWidth = 4; g.strokeRect(2, 2, 252, 252);
  g.globalAlpha = 0.18; g.fillStyle = '#000';
  for (let i = 0; i < 60; i++) g.fillRect((i * 97) % 256, (i * 61) % 256, 3 + (i % 3), 3 + (i % 2));
  g.globalAlpha = 0.12; g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 4);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(26, 9); t.anisotropy = 4;
  return t;
}

/* ---------- adereços e luzes por cenário ---------- */
function toon(color, extra) { return new THREE.MeshToonMaterial(Object.assign({ color: new THREE.Color(color), gradientMap: Rig3D.gradient() }, extra || {})); }
function prop(g, geo, mat, pos, scale, rot) {
  const m = new THREE.Mesh(geo, mat); m.position.set(pos[0], pos[1], pos[2]);
  if (scale) m.scale.set(scale[0], scale[1], scale[2]);
  if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = true; m.receiveShadow = true; m.userData.ownMat = false; g.add(m); return m;
}
const STAGE3D = {
  templo: { bg: '#8fc3ec', hemi: ['#cfe3f7', '#8a7a66', 0.7], sun: ['#fff2d6', 0.8],
    build(g) { const G = Rig3D.geos(); const stone = toon('#b9ad95'), roof = toon('#3f6fb5');
      for (const [x, h] of [[-120, 520], [1400, 560]]) { prop(g, G.cyl, stone, [x, h / 2, -760], [70, h, 70]); prop(g, G.cone, roof, [x, h + 70, -760], [95, 140, 95]); }
      for (let i = 0; i < 9; i++) prop(g, G.box, toon('#a89b82'), [-80 + i * 180, 14, 330], [60, 28, 40]);
      prop(g, G.box, toon('#a89b82'), [640, 6, -420], [2400, 12, 120]);
    } },
  basingse: { bg: '#e8c266', hemi: ['#ffe9b0', '#6b7a45', 0.75], sun: ['#fff0c0', 0.85],
    build(g) { const G = Rig3D.geos(); const wall = toon('#9a8f6a'), roofM = toon('#3f6b3a'), house = toon('#c9a56b');
      prop(g, G.box, wall, [640, 110, -700], [3400, 220, 120]);
      for (let i = 0; i < 24; i++) prop(g, G.box, wall, [-900 + i * 150, 240, -700], [70, 40, 120]);
      for (let i = 0; i < 5; i++) { const x = 100 + i * 290; prop(g, G.box, house, [x, 65, -420], [170, 130, 140]); prop(g, G.cone, roofM, [x, 170, -420], [150, 90, 150], [0, Math.PI / 4, 0]); }
      for (let i = 0; i < 4; i++) prop(g, G.sphere, toon('#e0453a', { emissive: new THREE.Color('#5a1010') }), [160 + i * 320, 150, -300], [14, 20, 14]);
    } },
  palacio: { bg: '#1a0806', fog: '#2a0c0a', hemi: ['#7a2d22', '#1a0806', 0.9], sun: ['#ffb080', 0.75], sunPos: [640, 900, 900],
    build(g, r) { const G = Rig3D.geos(); const col = toon('#4a1b16'), gold = toon('#c99a3a'), banner = toon('#8e1b1b');
      for (let i = 0; i < 6; i++) { const x = 90 + i * 220; prop(g, G.cyl, col, [x, 260, -330], [30, 520, 30]); prop(g, G.box, gold, [x, 525, -330], [80, 18, 80]); prop(g, G.box, gold, [x, 9, -330], [80, 18, 80]); }
      for (let i = 0; i < 5; i++) prop(g, G.box, banner, [200 + i * 220, 330, -400], [60, 220, 4]);
      for (const x of [60, 1220]) {
        prop(g, G.box, toon('#2b0d0d'), [x, 40, -150], [60, 80, 60]);
        prop(g, G.sphere, toon('#ff8a30', { emissive: new THREE.Color('#ff5a00'), emissiveIntensity: 1.5 }), [x, 95, -150], [18, 26, 18]);
        const l = r.addStageLight(new THREE.PointLight(0xff8a30, 1.6, 700, 2)); l.position.set(x, 120, -120); l.userData.flicker = true;
      }
      prop(g, G.box, toon('#5a1f18'), [640, 300, -900], [3400, 600, 40]);
    } },
  agua: { bg: '#06122b', fog: '#0b2240', hemi: ['#7fb0e0', '#12304a', 0.65], sun: ['#bcd8ff', 0.7], sunPos: [200, 900, 500],
    build(g, r) { const G = Rig3D.geos(); const ice = toon('#86b8d8'), iceLight = toon('#b4d6ea');
      for (let i = 0; i < 6; i++) { const x = 60 + i * 240, h = 150 + (i % 3) * 70; prop(g, G.box, ice, [x, h / 2, -560], [160, h, 160]); prop(g, G.cone, iceLight, [x, h + 45, -560], [120, 90, 120], [0, Math.PI / 4, 0]); }
      prop(g, G.box, toon('#2f6f9f'), [640, 4, -330], [3400, 8, 120]);
      for (let i = 0; i < 7; i++) prop(g, G.box, ice, [-100 + i * 240, 25, 340], [60, 50, 40]);
      const l = r.addStageLight(new THREE.PointLight(0x9fd3ff, 1.2, 1500, 1.5)); l.position.set(220, 500, -700);
    } },
  deserto: { bg: '#f6b26b', fog: '#f1d28a', hemi: ['#ffe6b0', '#8a6a3a', 0.8], sun: ['#fff0c0', 0.9], sunPos: [900, 900, 500],
    build(g) { const G = Rig3D.geos(); const sand = toon('#d9b06a'), stone = toon('#b48a52');
      for (const [x, z, s] of [[-300, -700, 500], [500, -900, 700], [1300, -650, 450], [900, -400, 260]]) prop(g, G.sphere, sand, [x, -s * 0.72, z], [s, s * 0.35, s * 0.8]);
      prop(g, G.box, stone, [180, 75, -380], [40, 150, 40]); prop(g, G.box, stone, [255, 60, -380], [30, 120, 30]); prop(g, G.box, stone, [215, 158, -380], [130, 14, 50]);
      prop(g, G.box, stone, [1060, 70, -300], [46, 140, 46]);
      for (let i = 0; i < 6; i++) prop(g, G.sphere, stone, [-100 + i * 260, 10, 330], [34, 18, 26]);
    } },
  pantano: { bg: '#15301c', fog: '#2e5a33', hemi: ['#9fd3a0', '#1a2e14', 0.75], sun: ['#cfe8b0', 0.6], sunPos: [640, 900, 300],
    build(g, r) { const G = Rig3D.geos(); const bark = toon('#2b1d12'), leaf = toon('#1f4a28');
      prop(g, G.cyl, bark, [650, 300, -520], [110, 600, 110]);
      for (const [x, tilt] of [[420, 0.5], [880, -0.5], [560, 0.25], [760, -0.25]]) prop(g, G.cyl, bark, [x, 30, -420], [22, 220, 22], [0, 0, tilt]);
      for (let i = 0; i < 6; i++) prop(g, G.sphere, leaf, [350 + i * 120, 560, -520], [150, 70, 150]);
      for (let i = 0; i < 8; i++) prop(g, G.cyl, toon('#3f6b2f'), [300 + i * 100, 420, -300], [3, 240 + (i % 3) * 60, 3]);
      for (let i = 0; i < 5; i++) prop(g, G.sphere, bark, [-60 + i * 330, 8, 340], [60, 16, 40]);
      const l = r.addStageLight(new THREE.PointLight(0x9fd3a0, 0.8, 1200, 1.5)); l.position.set(640, 300, 200);
    } },
  omashu: { bg: '#7fb6e6', fog: '#cfe4f3', hemi: ['#dceeff', '#8a7a66', 0.85], sun: ['#fff2d6', 0.95],
    build(g) { const G = Rig3D.geos(); const a = toon('#cdbb95'), b = toon('#bfa97f'), roof = toon('#3f6b3a'), chute = toon('#8d7a55');
      for (let i = 0; i < 6; i++) { const w = 1100 - i * 150, h = 70, y = i * h + h / 2; prop(g, G.box, i % 2 ? a : b, [640, y, -620 - i * 60], [w, h, 240]);
        for (let k = 0; k < Math.floor(w / 140); k++) prop(g, G.cone, roof, [640 - w / 2 + 70 + k * 140, y + h / 2 + 20, -620 - i * 60 + 60], [40, 40, 40], [0, Math.PI / 4, 0]); }
      prop(g, G.box, chute, [130, 220, -300], [12, 520, 30], [0, 0, 0.5]); prop(g, G.box, chute, [1150, 220, -300], [12, 520, 30], [0, 0, -0.5]);
      for (let i = 0; i < 6; i++) prop(g, G.box, a, [-80 + i * 260, 14, 330], [70, 28, 40]);
    } },
  ember: { bg: '#3b1f52', fog: '#7a3a4a', hemi: ['#f7b267', '#6b4a2a', 1.0], sun: ['#ffb070', 1.2], sunPos: [-200, 350, 700],
    build(g) { const G = Rig3D.geos(); const trunk = toon('#6b4a2a'), leaf = toon('#2f7a3a');
      for (const [x, tilt] of [[80, 0.12], [1200, -0.12], [-250, 0.2], [1500, -0.18]]) {
        prop(g, G.cyl, trunk, [x, 130, -300], [16, 270, 16], [0, 0, tilt]);
        for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; prop(g, G.sphere, leaf, [x + Math.cos(a) * 55 - tilt * 240, 275 + Math.sin(a) * 15, -300 + Math.sin(a) * 50], [34, 14, 34]); }
      }
      prop(g, G.box, toon('#2d6f8f'), [640, -2, -900], [4000, 4, 800]);
    } },
};

/* ---------- visuais dos projéteis ---------- */
function makeProjectileVisual(p, r) {
  const G = Rig3D.geos();
  const group = new THREE.Group();
  const v = { group, meshes: [], update: () => {}, dispose() { for (const m of v.meshes) if (m.material) m.material.dispose(); } };
  const pos = (p) => group.position.set(p.x, CFG.GROUND - p.y, 0);
  const emissive = (col, i) => new THREE.MeshToonMaterial({ color: new THREE.Color(col), emissive: new THREE.Color(col), emissiveIntensity: i || 1, gradientMap: Rig3D.gradient() });
  const glow = (col, size) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: Rig3D.glowTexture(), color: new THREE.Color(col), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); s.scale.set(size, size, 1); group.add(s); v.meshes.push(s); return s; };
  const add = (geo, mat, scale) => { const m = new THREE.Mesh(geo, mat); if (scale) m.scale.set(scale[0], scale[1], scale[2]); m.castShadow = true; group.add(m); v.meshes.push(m); return m; };

  switch (p.type) {
    case 'fire': case 'bluefire': {
      const blue = p.type === 'bluefire';
      const core = add(G.sphere, emissive(blue ? '#bfe9ff' : '#fff1a8', 1.2), [p.h * 0.45, p.h * 0.45, p.h * 0.45]);
      const outer = add(G.sphere, new THREE.MeshBasicMaterial({ color: new THREE.Color(blue ? '#1e6fff' : '#ff5a00'), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }), [p.h * 0.62, p.h * 0.62, p.h * 0.62]);
      const gl = glow(blue ? '#4fb3ff' : '#ff8a30', p.h * 1.9); gl.material.opacity = 0.55;
      const light = new THREE.PointLight(blue ? 0x4fb3ff : 0xff8a30, 1.2, 420, 2); group.add(light);
      v.update = (p) => { pos(p); const s = 1 + Math.sin(p.frame * 0.6) * 0.12; core.scale.setScalar(p.h * 0.45 * s); outer.scale.setScalar(p.h * 0.62 / s); outer.rotation.z += 0.2; };
      break;
    }
    case 'water': {
      const body = add(G.sphere, new THREE.MeshToonMaterial({ color: new THREE.Color('#1e88e5'), gradientMap: Rig3D.gradient(), transparent: true, opacity: 0.85 }), [p.w * 0.5, p.h * 0.45, p.h * 0.4]);
      const foam = add(G.sphere, new THREE.MeshBasicMaterial({ color: new THREE.Color('#e1f5fe') }), [p.w * 0.25, p.h * 0.18, p.h * 0.18]); foam.position.set(p.facing * p.w * 0.2, p.h * 0.25, 6);
      glow('#4fc3f7', p.h * 2);
      v.update = (p) => { pos(p); body.rotation.z = Math.sin(p.frame * 0.3) * 0.25 * p.facing; };
      break;
    }
    case 'wave': {
      const body = add(G.sphere, new THREE.MeshToonMaterial({ color: new THREE.Color('#1565c0'), gradientMap: Rig3D.gradient(), transparent: true, opacity: 0.85 }), [p.w * 0.5, p.h * 0.5, 90]);
      const foam = add(G.sphere, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff') }), [40, 26, 30]); foam.position.set(p.facing * p.w * 0.25, p.h * 0.42, 20);
      glow('#4fc3f7', p.h * 1.6);
      v.update = (p) => { pos(p); group.position.y = p.h / 2 - 20; body.rotation.z = Math.sin(p.frame * 0.2) * 0.1; };
      break;
    }
    case 'ice': {
      const m = add(new THREE.OctahedronGeometry(1), new THREE.MeshToonMaterial({ color: new THREE.Color('#e0f7fa'), gradientMap: Rig3D.gradient() }), [p.w * 0.45, p.h * 0.6, p.w * 0.45]);
      v.update = (p) => { pos(p); m.rotation.set(p.rot, p.rot * 0.7, 0); };
      break;
    }
    case 'air': {
      const rings = [0.5, 0.8, 1.1].map((k) => add(G.torus, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff'), transparent: true, opacity: 0.75 }), [p.w * 0.5 * k, p.w * 0.5 * k, p.w * 0.5 * k]));
      glow('#dfe9ff', p.w * 2);
      v.update = (p) => { pos(p); rings.forEach((rg, i) => { rg.rotation.y = p.rot * (1 + i * 0.3); rg.rotation.x = p.rot * 0.6; }); };
      break;
    }
    case 'vortex': {
      const rings = [0.35, 0.55, 0.75, 0.95].map((k, i) => add(G.torus, new THREE.MeshBasicMaterial({ color: new THREE.Color(i % 2 ? '#9fc8ff' : '#e8f3ff'), transparent: true, opacity: 0.45, depthWrite: false }), [p.w * 0.5 * k, p.h * 0.5 * k, p.w * 0.4 * k]));
      const gl = glow('#8fc4ff', p.w * 0.5); gl.material.opacity = 0.3;
      v.update = (p) => { pos(p); rings.forEach((rg, i) => { rg.rotation.y = p.rot * (1.2 + i * 0.25); rg.rotation.x = Math.sin(p.rot * 0.5 + i) * 0.4; }); };
      break;
    }
    case 'rock': {
      const m = add(new THREE.DodecahedronGeometry(1), toon('#6d4c41'), [p.w * 0.5, p.h * 0.5, p.w * 0.5]);
      v.update = (p) => { pos(p); m.rotation.set(p.rot * 0.5, p.rot * 0.6, 0); };
      break;
    }
    case 'boomerang': {
      const a = add(G.box, toon('#cfd8dc'), [p.w, 7, 3]), b = add(G.box, toon('#cfd8dc'), [p.w, 7, 3]);
      a.rotation.z = 0.5; b.rotation.z = -0.5; a.position.x = -p.w * 0.3; b.position.x = p.w * 0.3;
      v.update = (p) => { pos(p); group.rotation.z = p.rot * 1.4; };
      break;
    }
    case 'bolt': {
      const core = add(G.cyl, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff') }), [6, CFG.GROUND, 6]);
      const halo = add(G.cyl, new THREE.MeshBasicMaterial({ color: new THREE.Color('#4fd5ff'), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }), [22, CFG.GROUND, 22]);
      const warn = add(G.cyl, new THREE.MeshBasicMaterial({ color: new THREE.Color('#9be7ff'), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }), [p.w * 1.2, 2, p.w * 1.2]);
      const light = new THREE.PointLight(0x9be7ff, 3, 900, 2); group.add(light); light.position.y = 150;
      v.update = (p) => { group.position.set(p.x, 0, 0); const on = p.delay <= 0; core.visible = halo.visible = on; light.visible = on; warn.visible = !on; core.position.y = halo.position.y = CFG.GROUND / 2; core.position.x = on ? rand(-6, 6) : 0; warn.position.y = 2; };
      break;
    }
    case 'breath': {
      const rot = [0, 0, p.facing === 1 ? Math.PI / 2 : -Math.PI / 2];
      const outer = add(G.cone, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff5a00'), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }), [p.h * 0.5, p.w, p.h * 0.5]);
      const inner = add(G.cone, new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff1a8'), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }), [p.h * 0.28, p.w * 0.9, p.h * 0.28]);
      outer.rotation.set(...rot); inner.rotation.set(...rot);
      glow('#ff8a30', p.h * 2.2);
      const light = new THREE.PointLight(0xff8a30, 1.8, 600, 2); group.add(light);
      v.update = (p) => { pos(p); const s = 1 + Math.sin(p.frame * 0.8) * 0.08; outer.scale.set(p.h * 0.5 * s, p.w, p.h * 0.5 / s); inner.scale.set(p.h * 0.28 / s, p.w * 0.9, p.h * 0.28 * s); };
      break;
    }
    case 'firewave': {
      const flames = [-1, 0, 1].map((k) => add(G.sphere, new THREE.MeshBasicMaterial({ color: new THREE.Color(k ? '#ff6a00' : '#ffd36b'), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }), [p.w * 0.22, p.h * 0.5, 30]));
      flames.forEach((f, i) => { f.position.x = (i - 1) * p.w * 0.3; });
      glow('#ff8a30', p.h * 2.4);
      const light = new THREE.PointLight(0xff8a30, 1.4, 500, 2); group.add(light); light.position.y = 30;
      v.update = (p) => { group.position.set(p.x, p.h * 0.5, 0); flames.forEach((f, i) => { f.scale.y = p.h * (0.4 + 0.3 * Math.abs(Math.sin(p.frame * 0.5 + i))); f.position.y = f.scale.y * 0.3; }); };
      break;
    }
    case 'knife': {
      const blade = add(G.box, new THREE.MeshToonMaterial({ color: new THREE.Color('#cfd8dc'), gradientMap: Rig3D.gradient() }), [p.w, p.h * 0.5, 2.5]);
      const handle = add(G.box, toon('#5a1a1a'), [p.w * 0.3, p.h * 0.7, 3.5]); handle.position.x = -p.w * 0.35;
      v.update = (p) => { pos(p); group.rotation.z = Math.atan2(-p.vy, p.vx); };
      break;
    }
    case 'fan': {
      const disc = add(G.cyl, toon('#e3b23c'), [p.w * 0.5, 3, p.w * 0.5]); disc.rotation.x = Math.PI / 2;
      const half = add(G.cyl, toon('#2e7d32'), [p.w * 0.3, 3.5, p.w * 0.3]); half.rotation.x = Math.PI / 2;
      v.update = (p) => { pos(p); group.rotation.z = p.rot * 1.2; };
      break;
    }
    case 'fanspin': {
      const discs = [0, 1, 2, 3].map((i) => { const d = add(G.cyl, toon(i % 2 ? '#e3b23c' : '#2e7d32'), [26, 3, 26]); d.rotation.x = Math.PI / 2; return d; });
      const ring = add(G.torus, new THREE.MeshBasicMaterial({ color: new THREE.Color('#e3b23c'), transparent: true, opacity: 0.35 }), [p.w * 0.42, p.h * 0.42, p.w * 0.3]);
      glow('#ffe082', p.w * 0.5);
      v.update = (p) => { pos(p); discs.forEach((d, i) => { const a = p.rot * 1.5 + (i * Math.PI) / 2; d.position.set(Math.cos(a) * p.w * 0.42, Math.sin(a) * p.h * 0.42, Math.sin(a * 2) * 20); d.rotation.z = a; }); ring.rotation.y = p.rot; };
      break;
    }
    case 'beam': {
      const fire = p.color === 'fire';
      const core = add(G.cyl, new THREE.MeshBasicMaterial({ color: new THREE.Color(fire ? '#fff1a8' : '#ffffff') }), [fire ? 14 : 5, p.w, fire ? 14 : 5]);
      const halo = add(G.cyl, new THREE.MeshBasicMaterial({ color: new THREE.Color(fire ? '#ff6a00' : '#4fd5ff'), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }), [fire ? 40 : 16, p.w, fire ? 40 : 16]);
      core.rotation.z = halo.rotation.z = Math.PI / 2;
      const light = new THREE.PointLight(fire ? 0xff8a30 : 0x4fd5ff, 2.5, 900, 2); group.add(light);
      v.update = (p) => { const x0 = p.owner.x + p.facing * 40; group.position.set(x0 + p.facing * p.w / 2, CFG.GROUND - p.y, 0); core.position.y = rand(-6, 6); halo.position.y = rand(-4, 4); light.position.set(-p.facing * p.w * 0.3, 0, 40); };
      break;
    }
    case 'pillar': {
      const m = add(G.cone, toon('#6d4c41'), [p.w * 0.5, p.h, p.w * 0.5]);
      v.update = (p) => { group.position.set(p.x, 0, 0); const k = p.delay > 0 ? 0.05 : Math.min(1, (p.maxLife - p.life + 1) / 6); m.scale.y = p.h * k; m.position.y = p.h * k / 2; };
      break;
    }
    case 'firepillar': {
      const m = add(G.cone, new THREE.MeshBasicMaterial({ color: new THREE.Color('#4fb3ff'), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }), [p.w * 0.5, p.h, p.w * 0.5]);
      const core = add(G.cone, new THREE.MeshBasicMaterial({ color: new THREE.Color('#e3f6ff') }), [p.w * 0.2, p.h * 0.9, p.w * 0.2]);
      const gl = glow('#4fb3ff', p.w * 2.5); const light = new THREE.PointLight(0x4fb3ff, 1.5, 500, 2); group.add(light);
      v.update = (p) => { group.position.set(p.x, 0, 0); const k = p.delay > 0 ? 0.02 : Math.min(1, (p.maxLife - p.life + 1) / 5); m.scale.y = p.h * k; m.position.y = p.h * k / 2; core.scale.y = p.h * 0.9 * k; core.position.y = p.h * 0.9 * k / 2; gl.position.y = p.h * k * 0.5; light.position.y = p.h * k * 0.6; };
      break;
    }
    case 'quake': {
      const spikes = [];
      for (let i = 0; i < 12; i++) { const s = add(G.cone, toon('#6d4c41'), [26, 60, 26]); s.position.set(i * 110 + 60, 0, (i % 2) * 60 - 30); spikes.push(s); }
      v.update = (p) => { group.position.set(0, 0, 0); const on = p.delay <= 0; spikes.forEach((s, i) => { const h = on ? 40 + Math.sin(p.frame * 0.5 + i) * 14 : 2; s.scale.y = h; s.position.y = h / 2; }); };
      break;
    }
    default: { const m = add(G.sphere, toon('#ffffff'), [p.w * 0.4, p.h * 0.4, p.w * 0.4]); v.update = (p) => pos(p); }
  }
  return v;
}
