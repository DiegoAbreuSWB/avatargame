/* Renderização dos lutadores: bonecos articulados desenhados com Canvas.
   Juntas em coordenadas locais (pés no 0,0; olhando para a direita; y negativo = para cima). */

const BASE_JOINTS = {
  head: [0, -150], neck: [0, -128], hip: [0, -78],
  sb: [-8, -120], eb: [-22, -96], hb: [-14, -74],      // braço de trás
  sf: [8, -120], ef: [22, -96], hf: [28, -74],         // braço da frente
  hpb: [-9, -78], kb: [-12, -40], fb: [-18, 0],        // perna de trás
  hpf: [9, -78], kf: [12, -40], ff: [18, 0],           // perna da frente
};
const P = (o) => Object.assign({}, BASE_JOINTS, o);

const CROUCH = { head: [6, -104], neck: [4, -86], hip: [0, -46], sb: [-6, -80], sf: [6, -80], eb: [-10, -62], hb: [8, -66],
  ef: [24, -64], hf: [34, -70], hpb: [-8, -46], kb: [-26, -36], fb: [-22, 0], hpf: [8, -46], kf: [30, -36], ff: [28, 0] };
const LYING = { head: [-78, -16], neck: [-58, -14], hip: [-8, -12], sb: [-56, -24], sf: [-52, -6], eb: [-70, -44], hb: [-90, -40],
  ef: [-30, -2], hf: [-10, -4], hpb: [-10, -16], kb: [26, -22], fb: [60, -14], hpf: [-6, -8], kf: [30, -8], ff: [66, -4] };

const POSES = {
  idle(t) { const b = Math.sin(t * 0.08) * 2;
    return P({ head: [2, -150 + b], neck: [0, -128 + b], hip: [0, -78 + b * 0.5], sb: [-8, -120 + b], sf: [8, -120 + b],
      eb: [-14, -100 + b], hb: [10, -112 + b], ef: [26, -100 + b], hf: [36, -108 + b] }); },
  walk(t) { const s = Math.sin(t * 0.22), c = Math.cos(t * 0.22);
    return P({ head: [3, -150], kf: [12 + s * 16, -42], ff: [16 + s * 30, -Math.max(0, c) * 12], kb: [-12 - s * 16, -42],
      fb: [-16 - s * 30, -Math.max(0, -c) * 12], eb: [-14, -100], hb: [8 + s * 8, -110], ef: [24, -100], hf: [32 - s * 8, -106] }); },
  jump() { return P({ head: [4, -152], kf: [18, -62], ff: [8, -38], kb: [-6, -60], fb: [-14, -36], ef: [28, -130], hf: [36, -150], eb: [-24, -130], hb: [-30, -150] }); },
  crouch() { return P(CROUCH); },
  punch(t, f) { const p = f.attackPhase;
    return P({ head: [4 + p * 8, -150], neck: [2 + p * 6, -128], sf: [8 + p * 6, -120], ef: [lerp(26, 52, p), lerp(-100, -130, p)],
      hf: [lerp(36, 96, p), lerp(-108, -134, p)], eb: [-14, -100], hb: [10, -112], kf: [14 + p * 6, -42], ff: [20 + p * 12, 0], fb: [-20 - p * 6, 0] }); },
  kick(t, f) { const p = f.attackPhase;
    return P({ head: [-6 * p + 2, -150], neck: [-4 * p, -128], hip: [0, -80], kf: [lerp(12, 52, p), lerp(-42, -104, p)], ff: [lerp(18, 106, p), lerp(0, -112, p)],
      kb: [-10, -40], fb: [-14, 0], ef: [-10 * p + 24, -100], hf: [-14 * p + 34, -108], eb: [-24, -100], hb: [-30, -112] }); },
  cpunch(t, f) { const p = f.attackPhase;
    return P(Object.assign({}, CROUCH, { ef: [lerp(24, 48, p), -72], hf: [lerp(34, 92, p), lerp(-70, -78, p)], head: [8 + p * 6, -104] })); },
  sweep(t, f) { const p = f.attackPhase;
    return P(Object.assign({}, CROUCH, { head: [-2, -96], neck: [-4, -80], hip: [-6, -40], kf: [lerp(30, 60, p), lerp(-36, -14, p)], ff: [lerp(28, 112, p), lerp(0, -6, p)],
      hf: [-20, -30], ef: [-12, -46], hb: [-40, -20], eb: [-28, -40] })); },
  jpunch(t, f) { const p = f.attackPhase;
    return P({ head: [6, -150], kf: [18, -62], ff: [8, -38], kb: [-6, -60], fb: [-14, -36], ef: [lerp(28, 44, p), -112], hf: [lerp(36, 82, p), lerp(-120, -90, p)], eb: [-24, -130], hb: [-30, -150] }); },
  jkick(t, f) { const p = f.attackPhase;
    return P({ head: [0, -150], neck: [-2, -128], kf: [lerp(18, 46, p), lerp(-62, -84, p)], ff: [lerp(8, 96, p), lerp(-38, -72, p)], kb: [-8, -60], fb: [-16, -36],
      ef: [-10, -126], hf: [-14, -148], eb: [-28, -124], hb: [-40, -140] }); },
  cast(t, f) { const p = f.attackPhase;
    return P({ head: [6 + p * 6, -150], neck: [4 + p * 4, -128], sf: [10, -120], sb: [-6, -120], ef: [lerp(20, 42, p), lerp(-110, -118, p)], hf: [lerp(30, 76, p), lerp(-116, -118, p)],
      eb: [lerp(-20, 30, p), lerp(-120, -126, p)], hb: [lerp(-30, 66, p), lerp(-140, -128, p)], kf: [16, -42], ff: [26, 0], fb: [-26, 0], kb: [-18, -40] }); },
  castLow(t, f) { const p = f.attackPhase;
    return P(Object.assign({}, CROUCH, { ef: [lerp(24, 40, p), -60], hf: [lerp(34, 70, p), lerp(-70, -40, p)], eb: [lerp(-10, 30, p), -66], hb: [lerp(8, 60, p), lerp(-66, -50, p)],
      kf: [30, lerp(-36, -60, 1 - p)], ff: [28, lerp(0, -30, 1 - p)] })); },
  charge(t) { const a = t * 0.35;
    return P({ head: [4, -150], ef: [26 + Math.cos(a) * 20, -112 + Math.sin(a) * 18], hf: [40 + Math.cos(a) * 36, -116 + Math.sin(a) * 34],
      eb: [-10 + Math.cos(a + Math.PI) * 20, -112 + Math.sin(a + Math.PI) * 18], hb: [4 + Math.cos(a + Math.PI) * 36, -118 + Math.sin(a + Math.PI) * 34],
      kf: [22, -42], ff: [34, 0], kb: [-22, -40], fb: [-34, 0] }); },
  uppercut(t, f) { const p = f.attackPhase;
    return P({ head: [4, -156], neck: [2, -132], sf: [8, -122], ef: [lerp(26, 36, p), lerp(-100, -150, p)], hf: [lerp(36, 32, p), lerp(-108, -206, p)],
      eb: [-20, -100], hb: [-26, -80], kf: [26, -60], ff: [14, -30], kb: [-14, -46], fb: [-24, -8] }); },
  dash() { return P({ head: [34, -140], neck: [28, -120], hip: [6, -78], sb: [20, -114], sf: [30, -112], ef: [44, -96], hf: [86, -110],
      eb: [0, -96], hb: [-24, -84], kf: [26, -44], ff: [44, -10], kb: [-20, -44], fb: [-50, -6] }); },
  dashB() { return P({ head: [-22, -146], neck: [-16, -126], hip: [-4, -80], sb: [-24, -118], sf: [-10, -118], ef: [10, -104], hf: [26, -118],
      eb: [-34, -100], hb: [-44, -84], kf: [20, -50], ff: [40, -14], kb: [-16, -46], fb: [-30, -8] }); },
  grab(t, f) { const p = Math.min(1, (f.poseT || 0) / 6);
    return P({ head: [8, -150], neck: [6, -128], sf: [10, -120], sb: [-6, -120], ef: [lerp(26, 50, p), -118], hf: [lerp(36, 80, p), lerp(-108, -124, p)],
      eb: [lerp(-14, 36, p), -114], hb: [lerp(10, 76, p), lerp(-112, -104, p)], kf: [18, -42], ff: [28, 0], fb: [-24, 0], kb: [-16, -40] }); },
  super(t) { const a = Math.sin(t * 0.2) * 6;
    return P({ head: [2, -156], neck: [0, -132], hip: [0, -80], sf: [12, -124], sb: [-12, -124], ef: [40, -150 + a], hf: [66, -180 - a],
      eb: [-40, -150 + a], hb: [-66, -180 - a], kf: [24, -42], ff: [36, 0], kb: [-24, -40], fb: [-36, 0] }); },
  hit() { return P({ head: [-16, -148], neck: [-8, -126], hip: [2, -78], sb: [-14, -118], sf: [0, -118], ef: [26, -118], hf: [42, -112],
      eb: [-8, -98], hb: [14, -84], kf: [18, -42], ff: [30, 0], kb: [-14, -40], fb: [-30, 0] }); },
  hitLow() { return P(Object.assign({}, CROUCH, { head: [-8, -102], neck: [-4, -86], ef: [22, -72], hf: [40, -62], eb: [-6, -60], hb: [14, -50] })); },
  launched() { return P({ head: [-26, -130], neck: [-16, -112], hip: [8, -74], sb: [-24, -104], sf: [-8, -104], ef: [-30, -140], hf: [-46, -160],
      eb: [-20, -130], hb: [-40, -150], hpf: [12, -74], kf: [40, -90], ff: [60, -60], hpb: [4, -74], kb: [36, -60], fb: [50, -24] }); },
  knockdown() { return P(LYING); },
  ko(t) { return P(Object.assign({}, LYING, { head: [-80, -14 + Math.sin(t * 0.1)], })); },
  getup(t, f) { const p = clamp(f.poseT / 24, 0, 1); const a = P(LYING), b = P(CROUCH), o = {};
    for (const k in a) o[k] = [lerp(a[k][0], b[k][0], p), lerp(a[k][1], b[k][1], p)]; return o; },
  block() { return P({ head: [-4, -150], neck: [-2, -128], sf: [6, -120], ef: [26, -110], hf: [26, -140], eb: [-10, -104], hb: [18, -118], kf: [10, -42], ff: [14, 0], kb: [-16, -40], fb: [-24, 0] }); },
  blockLow() { return P(Object.assign({}, CROUCH, { head: [2, -104], ef: [24, -62], hf: [26, -90], eb: [-6, -62], hb: [16, -76] })); },
  win(t) { const b = Math.abs(Math.sin(t * 0.12)) * 10;
    return P({ head: [0, -152 - b], neck: [0, -130 - b], hip: [0, -78 - b * 0.6], sf: [8, -122 - b], sb: [-8, -122 - b], ef: [30, -150 - b], hf: [34, -200 - b],
      eb: [-30, -150 - b], hb: [-34, -200 - b], kf: [14, -42 - b * 0.4], ff: [18, -b * 0.6], kb: [-14, -40 - b * 0.4], fb: [-18, -b * 0.6] }); },
};

function targetJoints(f) {
  const fn = POSES[f.pose] || POSES.idle;
  return fn(f.poseT || 0, f);
}

// Suaviza a transição entre poses
function updateJoints(f, snap) {
  const tgt = targetJoints(f);
  if (!f.joints || snap) { f.joints = {}; for (const k in tgt) f.joints[k] = tgt[k].slice(); return; }
  const s = f.poseSmooth || 0.5;
  for (const k in tgt) {
    const j = f.joints[k];
    j[0] = lerp(j[0], tgt[k][0], s); j[1] = lerp(j[1], tgt[k][1], s);
  }
}

function limb(ctx, pts, width, color) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}
function dot(ctx, p, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fill(); }

/* Desenha a figura em coordenadas locais já transformadas (translate+scale aplicados) */
function drawFigure(ctx, ch, J, opts = {}) {
  const c = ch.colors;
  const pants = c.secondary, shirt = c.primary, skin = c.skin;
  const barefoot = ch.id === 'toph';
  const shoe = barefoot ? skin : '#2a2320';
  const elementColor = ch.id === 'azula' ? c.fire : ELEMENT_COLORS[ch.element];
  const glowHands = ['cast', 'castLow', 'charge', 'super', 'uppercut'].includes(opts.pose);

  // perna de trás
  limb(ctx, [J.hpb, J.kb, J.fb], 15, shade(pants, -12));
  dot(ctx, J.fb, 8, shade(shoe, -10));
  // braço de trás
  limb(ctx, [J.sb, J.eb, J.hb], 12, shade(shirt, -18));
  dot(ctx, J.hb, 7, shade(skin, -14));
  // tronco
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.moveTo(J.sb[0] - 14, J.sb[1] - 6); ctx.lineTo(J.sf[0] + 14, J.sf[1] - 6);
  ctx.lineTo(J.hpf[0] + 9, J.hip[1] + 8); ctx.lineTo(J.hpb[0] - 9, J.hip[1] + 8); ctx.closePath(); ctx.fill();
  // detalhes do traje
  drawOutfit(ctx, ch, J);
  // perna da frente
  limb(ctx, [J.hpf, J.kf, J.ff], 15, pants);
  dot(ctx, J.ff, 8, shoe);
  // pescoço
  limb(ctx, [J.neck, [J.head[0], J.head[1] + 8]], 10, skin);
  // cabeça
  drawHead(ctx, ch, J, opts);
  // braço da frente
  limb(ctx, [J.sf, J.ef, J.hf], 12, shirt);
  dot(ctx, J.hf, 7, skin);
  drawProps(ctx, ch, J, opts);

  if (glowHands) {
    ctx.globalAlpha = 0.75;
    for (const h of [J.hf, J.hb]) {
      const g = ctx.createRadialGradient(h[0], h[1], 2, h[0], h[1], 22);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, elementColor); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(h[0], h[1], 22, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function drawOutfit(ctx, ch, J) {
  const c = ch.colors;
  // cinto
  limb(ctx, [[J.hpb[0] - 10, J.hip[1] + 2], [J.hpf[0] + 10, J.hip[1] + 2]], 6, shade(c.secondary, 20));
  if (ch.id === 'aang') {
    // xale laranja sobre os ombros
    ctx.fillStyle = c.secondary;
    ctx.beginPath(); ctx.moveTo(J.sb[0] - 16, J.sb[1] - 8); ctx.lineTo(J.sf[0] + 16, J.sf[1] - 8); ctx.lineTo(J.sf[0] + 4, J.sf[1] + 26); ctx.lineTo(J.sb[0] - 4, J.sb[1] + 26); ctx.closePath(); ctx.fill();
  } else if (ch.id === 'katara') {
    ctx.fillStyle = c.accent; // gola clara
    ctx.beginPath(); ctx.moveTo(J.sb[0] - 10, J.sb[1] - 6); ctx.lineTo(J.sf[0] + 10, J.sf[1] - 6); ctx.lineTo(J.neck[0], J.neck[1] + 22); ctx.closePath(); ctx.fill();
    dot(ctx, [J.neck[0], J.neck[1] + 10], 4, '#6fd3ff'); // colar da mãe
  } else if (ch.id === 'zuko' || ch.id === 'azula') {
    ctx.fillStyle = c.accent; // ombreiras douradas
    ctx.fillRect(J.sb[0] - 16, J.sb[1] - 8, 16, 8); ctx.fillRect(J.sf[0], J.sf[1] - 8, 16, 8);
    ctx.fillStyle = c.secondary;
    ctx.beginPath(); ctx.moveTo(J.neck[0] - 8, J.neck[1] + 4); ctx.lineTo(J.neck[0] + 8, J.neck[1] + 4); ctx.lineTo(J.hip[0], J.hip[1] - 6); ctx.closePath(); ctx.fill();
  } else if (ch.id === 'toph') {
    ctx.fillStyle = c.secondary; // túnica clara por cima
    ctx.beginPath(); ctx.moveTo(J.sb[0] - 6, J.sb[1] - 2); ctx.lineTo(J.sf[0] + 6, J.sf[1] - 2); ctx.lineTo(J.hpf[0] + 4, J.hip[1] + 4); ctx.lineTo(J.hpb[0] - 4, J.hip[1] + 4); ctx.closePath(); ctx.fill();
  } else if (ch.id === 'sokka') {
    ctx.fillStyle = c.accent; // gola de pele
    ctx.beginPath(); ctx.moveTo(J.sb[0] - 12, J.sb[1] - 8); ctx.lineTo(J.sf[0] + 12, J.sf[1] - 8); ctx.lineTo(J.sf[0] + 2, J.sf[1] + 8); ctx.lineTo(J.sb[0] - 2, J.sb[1] + 8); ctx.closePath(); ctx.fill();
  }
}

function drawHead(ctx, ch, J, opts) {
  const c = ch.colors, hx = J.head[0], hy = J.head[1], r = 18;
  // cabelo atrás da cabeça
  if (ch.id === 'katara') { dot(ctx, [hx - 6, hy - 4], r + 4, c.hair); dot(ctx, [hx - 12, hy + 14], 9, c.hair); }
  if (ch.id === 'toph') { dot(ctx, [hx - 4, hy - 2], r + 5, c.hair); dot(ctx, [hx - 2, hy - 24], 11, c.hair); }
  if (ch.id === 'azula') { dot(ctx, [hx - 4, hy - 2], r + 3, c.hair); limb(ctx, [[hx - 10, hy - 20], [hx - 12, hy + 26]], 5, c.hair); }
  if (ch.id === 'zuko') { dot(ctx, [hx - 5, hy - 3], r + 3, c.hair); }
  if (ch.id === 'sokka') { limb(ctx, [[hx - 14, hy - 8], [hx - 30, hy + 2]], 7, c.hair); }
  // rosto
  dot(ctx, [hx, hy], r, c.skin);
  // olhos
  const ko = opts.pose === 'ko';
  ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 2;
  if (ko) {
    for (const ex of [hx + 7, hx - 2]) { ctx.beginPath(); ctx.moveTo(ex - 3, hy - 6); ctx.lineTo(ex + 3, hy); ctx.moveTo(ex + 3, hy - 6); ctx.lineTo(ex - 3, hy); ctx.stroke(); }
  } else if (ch.id === 'toph') {
    ctx.strokeStyle = '#6f7f8a'; ctx.beginPath(); ctx.moveTo(hx + 4, hy - 3); ctx.lineTo(hx + 10, hy - 3); ctx.moveTo(hx - 5, hy - 3); ctx.lineTo(hx + 1, hy - 3); ctx.stroke();
  } else if (opts.avatarState) {
    dot(ctx, [hx + 7, hy - 3], 3.5, '#bfe9ff'); dot(ctx, [hx - 2, hy - 3], 3.5, '#bfe9ff');
  } else {
    dot(ctx, [hx + 7, hy - 3], 2.4, '#1b1b1b'); dot(ctx, [hx - 2, hy - 3], 2.4, '#1b1b1b');
  }
  // boca
  ctx.strokeStyle = 'rgba(80,40,30,.8)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(hx + 2, hy + 8); ctx.lineTo(hx + 9, hy + 7); ctx.stroke();

  // cabelo / marcas na frente
  if (ch.id === 'aang') {
    ctx.strokeStyle = opts.avatarState ? '#dff6ff' : c.accent; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx - 16, hy - 6); ctx.quadraticCurveTo(hx - 4, hy - 22, hx + 6, hy - 16); ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath(); ctx.moveTo(hx + 2, hy - 22); ctx.lineTo(hx + 16, hy - 12); ctx.lineTo(hx + 4, hy - 8); ctx.closePath(); ctx.fill();
    if (opts.avatarState) { ctx.globalAlpha = 0.6; dot(ctx, [hx, hy - 10], 26, 'rgba(180,230,255,.5)'); ctx.globalAlpha = 1; }
  } else if (ch.id === 'katara') {
    ctx.strokeStyle = c.hair; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(hx + 10, hy + 2, 6, -Math.PI / 2, Math.PI / 2); ctx.stroke();  // "loopie"
    ctx.fillStyle = c.hair; ctx.beginPath(); ctx.arc(hx, hy - 12, 16, Math.PI, 0); ctx.fill();
  } else if (ch.id === 'zuko') {
    ctx.fillStyle = c.hair; ctx.beginPath(); ctx.moveTo(hx - 18, hy - 4); ctx.lineTo(hx - 10, hy - 22); ctx.lineTo(hx + 4, hy - 20); ctx.lineTo(hx + 16, hy - 10); ctx.lineTo(hx + 8, hy - 14); ctx.lineTo(hx + 2, hy - 8); ctx.lineTo(hx - 8, hy - 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(150,60,40,.75)'; ctx.beginPath(); ctx.ellipse(hx + 8, hy - 3, 7, 6, 0, 0, Math.PI * 2); ctx.fill(); // cicatriz
    dot(ctx, [hx + 7, hy - 3], 2, '#1b1b1b');
  } else if (ch.id === 'toph') {
    ctx.fillStyle = c.hair; ctx.beginPath(); ctx.moveTo(hx - 18, hy - 2); ctx.lineTo(hx - 12, hy - 20); ctx.lineTo(hx + 12, hy - 18); ctx.lineTo(hx + 16, hy - 4); ctx.lineTo(hx + 8, hy - 10); ctx.lineTo(hx - 4, hy - 8); ctx.closePath(); ctx.fill();
    limb(ctx, [[hx - 16, hy - 8], [hx + 14, hy - 10]], 4, c.secondary); // faixa
  } else if (ch.id === 'azula') {
    ctx.fillStyle = c.hair; ctx.beginPath(); ctx.arc(hx - 2, hy - 8, 16, Math.PI, 0); ctx.fill();
    limb(ctx, [[hx + 12, hy - 14], [hx + 14, hy + 12]], 4, c.hair);
    ctx.fillStyle = c.hair; ctx.beginPath(); ctx.ellipse(hx - 4, hy - 26, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.accent; ctx.beginPath(); ctx.moveTo(hx - 10, hy - 30); ctx.lineTo(hx - 4, hy - 44); ctx.lineTo(hx + 2, hy - 30); ctx.closePath(); ctx.fill();
  } else if (ch.id === 'sokka') {
    ctx.fillStyle = c.hair; ctx.beginPath(); ctx.arc(hx - 2, hy - 8, 14, Math.PI * 1.1, Math.PI * 1.9); ctx.lineTo(hx - 2, hy - 8); ctx.closePath(); ctx.fill();
  }
}

function drawProps(ctx, ch, J, opts) {
  if (ch.id === 'sokka') {
    const sword = ['dash', 'super'].includes(opts.pose);
    if (sword) { limb(ctx, [J.hf, [J.hf[0] + 70, J.hf[1] - 10]], 5, '#2b2b2b'); limb(ctx, [J.hf, [J.hf[0] + 10, J.hf[1] - 2]], 8, '#6b4a2a'); }
    else if (opts.pose !== 'cast') { // bumerangue nas costas
      ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(J.sb[0] - 10, J.sb[1] + 2, 16, Math.PI * 0.6, Math.PI * 1.6); ctx.stroke();
    }
  }
  if (ch.id === 'aang' && ['idle', 'walk', 'win'].includes(opts.pose) && opts.staff !== false) {
    limb(ctx, [[J.hb[0], J.hb[1] + 70], [J.hb[0] - 10, J.hb[1] - 90]], 5, '#8d6e63');
  }
}

function shade(hex, amt) {
  if (!hex || hex[0] !== '#') return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n >> 16) + amt, 0, 255), g = clamp(((n >> 8) & 255) + amt, 0, 255), b = clamp((n & 255) + amt, 0, 255);
  return `rgb(${r},${g},${b})`;
}

/* Lutador em cena */
function drawFighter(ctx, f, stage) {
  const air = CFG.GROUND - f.y;
  // sombra
  ctx.fillStyle = stage ? stage.shadow : 'rgba(0,0,0,.35)';
  ctx.beginPath(); ctx.ellipse(f.x, CFG.GROUND + 6, Math.max(14, 44 - air * 0.06), 9, 0, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.scale(f.facing, 1);
  if (f.invulnFrames > 0 && Math.floor(f.frame / 3) % 2 === 0) ctx.globalAlpha = 0.55;
  if (f.flash > 0 && ctx.filter !== undefined) ctx.filter = 'brightness(2.4) saturate(.3)';
  const avatarState = f.char.id === 'aang' && (f.pose === 'super' || f.superActive);
  if (avatarState) {
    const g = ctx.createRadialGradient(0, -90, 20, 0, -90, 170);
    g.addColorStop(0, 'rgba(190,235,255,.55)'); g.addColorStop(1, 'rgba(190,235,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -90, 170, 0, Math.PI * 2); ctx.fill();
  }
  drawFigure(ctx, f.char, f.joints, { pose: f.pose, avatarState });
  ctx.restore();
  ctx.filter = 'none';
  ctx.globalAlpha = 1;
}

/* Figura estática para menus */
function drawFigureAt(ctx, ch, x, y, scale, pose, t, facing = 1, opts = {}) {
  const fake = { pose, poseT: t, attackPhase: 1, joints: null, char: ch };
  updateJoints(fake, true);
  ctx.save(); ctx.translate(x, y); ctx.scale(facing * scale, scale);
  drawFigure(ctx, ch, fake.joints, Object.assign({ pose }, opts));
  ctx.restore();
}
