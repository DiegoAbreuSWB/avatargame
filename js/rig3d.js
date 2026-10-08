/* Rig 3D dos lutadores: bonecos low-poly (esferas e cilindros) com cel shading,
   posicionados a partir das mesmas juntas 2D usadas pelo modo clássico (draw.js). */
const Rig3D = (() => {
  let G = null;          // geometrias compartilhadas
  let gradientMap = null;
  let outlineMat = null;

  function init() {
    if (G) return;
    _a = new THREE.Vector3(); _b = new THREE.Vector3(); _d = new THREE.Vector3(); _up = new THREE.Vector3(0, 1, 0);
    G = {
      cyl: new THREE.CylinderGeometry(1, 1, 1, 12, 1),
      torso: new THREE.CylinderGeometry(1, 0.78, 1, 14, 1),
      sphere: new THREE.SphereGeometry(1, 16, 12),
      box: new THREE.BoxGeometry(1, 1, 1),
      cone: new THREE.ConeGeometry(1, 1, 12),
      torus: new THREE.TorusGeometry(1, 0.18, 8, 20),
      halfTorus: new THREE.TorusGeometry(1, 0.25, 8, 16, Math.PI),
    };
    const data = new Uint8Array([90, 90, 90, 255, 165, 165, 165, 255, 255, 255, 255, 255]);
    gradientMap = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
    gradientMap.minFilter = gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;
    outlineMat = new THREE.MeshBasicMaterial({ color: 0x15120f, side: THREE.BackSide });
  }

  let _a, _b, _d, _up;   // vetores temporários (criados em init, quando o THREE já existe)

  function create(ch) {
    init();
    const c = ch.colors;
    const mats = {};
    const mat = (color, extra = {}) => {
      const key = color + JSON.stringify(extra);
      if (!mats[key]) mats[key] = new THREE.MeshToonMaterial(Object.assign({ color: new THREE.Color(color), gradientMap }, extra));
      return mats[key];
    };
    const group = new THREE.Group();
    const parts = {};

    function add(name, geo, material, outlineScale) {
      const m = new THREE.Mesh(geo, material);
      m.castShadow = true;
      if (outlineScale) {
        const o = new THREE.Mesh(geo, outlineMat);
        o.scale.set(outlineScale[0], outlineScale[1], outlineScale[2]);
        m.add(o);
      }
      group.add(m);
      parts[name] = m;
      return m;
    }
    const skin = c.skin, shirt = c.primary, pants = c.secondary;
    const shoe = ch.id === 'toph' ? skin : '#2a2320';
    const LIMB_O = [1.2, 1.03, 1.2], BALL_O = [1.14, 1.14, 1.14];

    for (const s of ['B', 'F']) {
      add('thigh' + s, G.cyl, mat(pants), LIMB_O);
      add('shin' + s, G.cyl, mat(pants), LIMB_O);
      add('knee' + s, G.sphere, mat(pants), BALL_O);
      add('foot' + s, G.sphere, mat(shoe), BALL_O);
      add('upper' + s, G.cyl, mat(shirt), LIMB_O);
      add('fore' + s, G.cyl, mat(shirt), LIMB_O);
      add('elbow' + s, G.sphere, mat(shirt), BALL_O);
      add('hand' + s, G.sphere, mat(skin), BALL_O);
      add('shoulder' + s, G.sphere, mat(shirt), BALL_O);
    }
    add('torso', G.torso, mat(shirt), [1.1, 1.03, 1.14]);
    add('belt', G.torus, mat(c.accent || '#333'), null);
    add('neck', G.cyl, mat(skin), LIMB_O);

    // cabeça: grupo sem escala com a esfera e os detalhes
    const headGroup = new THREE.Group(); group.add(headGroup); parts.headGroup = headGroup;
    const headMesh = new THREE.Mesh(G.sphere, mat(skin)); headMesh.scale.setScalar(18); headMesh.castShadow = true;
    const headOutline = new THREE.Mesh(G.sphere, outlineMat); headOutline.scale.setScalar(1.08); headMesh.add(headOutline);
    headGroup.add(headMesh); parts.head = headMesh;

    // rosto: olhos num ângulo de 3/4 (virados para o oponente e para a câmera)
    const dir = new THREE.Vector3(1, 0, 0.9).normalize(), perp = new THREE.Vector3(-0.9, 0, 1).normalize();
    const eyeColor = ch.id === 'toph' ? '#9fb0bb' : '#1b1b1b';
    const eyes = [];
    for (const side of [1, -1]) {
      const e = new THREE.Mesh(G.sphere, new THREE.MeshBasicMaterial({ color: new THREE.Color(eyeColor) }));
      e.position.copy(dir).multiplyScalar(17).addScaledVector(perp, side * 6.5).add(new THREE.Vector3(0, 2, 0));
      e.scale.setScalar(2.6); headGroup.add(e); eyes.push(e);
    }
    parts.eyes = eyes;
    const mouth = new THREE.Mesh(G.box, new THREE.MeshBasicMaterial({ color: 0x5a2a20 }));
    mouth.position.copy(dir).multiplyScalar(17.2).add(new THREE.Vector3(0, -6, 0)); mouth.scale.set(5, 1.5, 1.5);
    mouth.lookAt(mouth.position.clone().multiplyScalar(2)); headGroup.add(mouth);

    buildHair(ch, headGroup, mat, G);

    // adereços
    if (ch.id === 'sokka') {
      parts.boomerang = new THREE.Mesh(G.halfTorus, mat('#cfd8dc')); parts.boomerang.scale.setScalar(13); parts.boomerang.rotation.z = Math.PI * 0.2; group.add(parts.boomerang);
      parts.sword = new THREE.Mesh(G.box, mat('#3a3a3a')); parts.sword.scale.set(72, 3, 1.5); group.add(parts.sword);
      parts.hilt = new THREE.Mesh(G.cyl, mat('#6b4a2a')); parts.hilt.scale.set(2.5, 14, 2.5); parts.hilt.rotation.z = Math.PI / 2; group.add(parts.hilt);
    }
    if (ch.id === 'aang') {
      parts.staff = new THREE.Mesh(G.cyl, mat('#8d6e63')); parts.staff.scale.set(2.4, 175, 2.4); group.add(parts.staff);
      parts.aura = glowSprite('#9fd0ff', 300); parts.aura.material.opacity = 0.45; parts.aura.position.set(0, 95, -30); parts.aura.visible = false; group.add(parts.aura);
    }
    // brilho nas mãos ao dobrar
    const elementColor = ch.id === 'azula' ? c.fire : (ELEMENT_COLORS[ch.element] || '#ffffff');
    parts.glowB = glowSprite(elementColor, 70); parts.glowF = glowSprite(elementColor, 70);
    parts.glowB.visible = parts.glowF.visible = false; group.add(parts.glowB, parts.glowF);

    const rig = { group, parts, mats, char: ch, dispose() { for (const k in mats) mats[k].dispose(); } };
    rig.update = (J, o) => update(rig, J, o || {});
    return rig;
  }

  function glowSprite(color, size) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: Rig3D.glowTexture(), color: new THREE.Color(color), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.85 }));
    sp.scale.set(size, size, 1);
    return sp;
  }
  let _glowTex = null;
  function glowTexture() {
    if (_glowTex) return _glowTex;
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const g = cv.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    _glowTex = new THREE.CanvasTexture(cv); return _glowTex;
  }

  function buildHair(ch, hg, mat, G) {
    const c = ch.colors;
    const hair = (geo, color, pos, scale, rot) => {
      const m = new THREE.Mesh(geo, mat(color)); m.position.set(pos[0], pos[1], pos[2]);
      if (Array.isArray(scale)) m.scale.set(scale[0], scale[1], scale[2]); else m.scale.setScalar(scale);
      if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      m.castShadow = true;
      const o = new THREE.Mesh(geo, outlineMat); o.scale.setScalar(1.07); m.add(o);
      hg.add(m); return m;
    };
    switch (ch.id) {
      case 'aang': {
        const arrow = hair(G.box, c.accent, [0, 16, 0], [26, 2.6, 7], [0, 0, -0.45]);
        const tip = hair(G.cone, c.accent, [15, 9, 0], [6, 11, 6], [0, 0, -Math.PI / 2 - 0.1]);
        arrow.name = 'arrow'; tip.name = 'arrow';
        break;
      }
      case 'katara':
        hair(G.sphere, c.hair, [-4, 3, -1], 19.6);
        hair(G.sphere, c.hair, [-18, 6, 0], 9);
        hair(G.torus, c.hair, [8, -1, 15], 5); hair(G.torus, c.hair, [8, -1, -15], 5);
        break;
      case 'zuko': {
        hair(G.sphere, c.hair, [-3, 6, 0], [19.8, 16.5, 19.8]);
        const scar = new THREE.Mesh(G.sphere, new THREE.MeshBasicMaterial({ color: 0x8e3a2a, transparent: true, opacity: 0.8 }));
        const dir = new THREE.Vector3(1, 0, 0.9).normalize(), perp = new THREE.Vector3(-0.9, 0, 1).normalize();
        scar.position.copy(dir).multiplyScalar(16.6).addScaledVector(perp, 6.5).add(new THREE.Vector3(0, 2, 0));
        scar.scale.set(7, 6, 3); scar.lookAt(scar.position.clone().multiplyScalar(2)); hg.add(scar);
        break;
      }
      case 'toph':
        hair(G.sphere, c.hair, [-2, 4, 0], [19.8, 19, 19.8]);
        hair(G.sphere, c.hair, [-2, 28, 0], 10);
        hair(G.torus, c.secondary, [0, 9, 0], 18.6, [Math.PI / 2, 0, 0]);
        hair(G.box, c.hair, [13, 8, 0], [10, 7, 24]);
        break;
      case 'azula':
        hair(G.sphere, c.hair, [-3, 5, 0], [19.8, 18, 19.8]);
        hair(G.cyl, c.hair, [-3, 26, 0], [5, 12, 5]);
        hair(G.cone, c.accent, [-3, 37, 0], [4.5, 12, 4.5]);
        hair(G.cyl, c.hair, [9, -6, 13], [2.2, 26, 2.2], [0, 0, 0.12]); hair(G.cyl, c.hair, [9, -6, -13], [2.2, 26, 2.2], [0, 0, 0.12]);
        break;
      case 'sokka':
        hair(G.sphere, c.hair, [-4, 11, 0], [14, 9, 14]);
        hair(G.cyl, c.hair, [-20, 2, 0], [4, 20, 4], [0, 0, 0.9]);
        break;
    }
  }

  // Posiciona um cilindro entre duas juntas 2D (x, y para baixo) no plano z
  function seg(m, a, b, z, r, sx, sz) {
    _a.set(a[0], -a[1], z); _b.set(b[0], -b[1], z);
    _d.subVectors(_b, _a); const len = Math.max(1, _d.length());
    m.position.copy(_a).addScaledVector(_d, 0.5);
    m.quaternion.setFromUnitVectors(_up, _d.normalize());
    m.scale.set(sx || r, len, sz || r);
  }
  function ball(m, j, z, r) { m.position.set(j[0], -j[1], z); m.scale.setScalar(r); }

  const GLOW_POSES = ['cast', 'castLow', 'charge', 'super', 'uppercut'];

  function update(rig, J, o) {
    const P = rig.parts, ch = rig.char;
    const zB = -13, zF = 13;
    for (const [s, z] of [['B', zB], ['F', zF]]) {
      const hp = J['hp' + s.toLowerCase()], k = J['k' + s.toLowerCase()], f = J['f' + s.toLowerCase()];
      const sh = J['s' + s.toLowerCase()], e = J['e' + s.toLowerCase()], h = J['h' + s.toLowerCase()];
      seg(P['thigh' + s], hp, k, z, 7.5); seg(P['shin' + s], k, f, z, 6.5); ball(P['knee' + s], k, z, 7.5);
      P['foot' + s].position.set(f[0] + 4, -f[1] + 1, z); P['foot' + s].scale.set(11, 6, 8);
      seg(P['upper' + s], sh, e, z, 6); seg(P['fore' + s], e, h, z, 5.5); ball(P['elbow' + s], e, z, 6); ball(P['hand' + s], h, z, 6.5);
      ball(P['shoulder' + s], sh, z * 0.8, 8.5);
    }
    seg(P.torso, J.neck, J.hip, 0, 1, 16, 11);
    P.belt.position.set(J.hip[0], -J.hip[1] + 4, 0); P.belt.scale.setScalar(15); P.belt.rotation.set(Math.PI / 2, 0, 0);
    seg(P.neck, J.neck, [J.head[0], J.head[1] + 8], 0, 5);
    P.headGroup.position.set(J.head[0], -J.head[1], 0);

    // expressões
    const ko = o.pose === 'ko';
    for (const e of P.eyes) { e.scale.set(2.6, ko ? 0.8 : 2.6, 2.6); }
    if (ch.id === 'aang') {
      const av = !!o.avatarState;
      for (const e of P.eyes) { e.material.color.set(av ? '#bfe9ff' : '#1b1b1b'); e.scale.multiplyScalar(av ? 1.3 : 1); }
      P.headGroup.traverse((m) => { if (m.name === 'arrow' && m.material && m.material.emissive) { m.material.emissive.set(av ? '#9fdcff' : '#000000'); } });
      P.aura.visible = av;
      P.staff.visible = ['idle', 'walk', 'win'].includes(o.pose) && o.staff !== false;
      P.staff.position.set(J.hb[0] - 6, -J.hb[1] - 10, zB); P.staff.rotation.set(0, 0, 0.05);
    }
    if (ch.id === 'sokka') {
      const sword = ['dash', 'super'].includes(o.pose);
      P.sword.visible = P.hilt.visible = sword; P.boomerang.visible = !sword && o.pose !== 'cast';
      P.sword.position.set(J.hf[0] + 38, -J.hf[1] + 4, zF); P.sword.rotation.set(0, 0, 0.12);
      P.hilt.position.set(J.hf[0] + 2, -J.hf[1], zF);
      P.boomerang.position.set(J.sb[0] - 10, -J.sb[1] - 2, -24);
    }
    const glow = GLOW_POSES.includes(o.pose);
    P.glowB.visible = P.glowF.visible = glow;
    if (glow) { P.glowB.position.set(J.hb[0], -J.hb[1], zB + 4); P.glowF.position.set(J.hf[0], -J.hf[1], zF + 4); }

    // flash de dano
    const flash = !!o.flash;
    if (rig._flash !== flash) {
      rig._flash = flash;
      for (const k in rig.mats) rig.mats[k].emissive.setScalar(flash ? 0.85 : 0);
    }
  }

  return { create, glowTexture, outline: () => outlineMat, gradient: () => { init(); return gradientMap; }, geos: () => { init(); return G; } };
})();
