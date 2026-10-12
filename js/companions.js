/* Companheiros (v0.8): animais como assistências, no estilo "assist" de jogos de luta em equipe.
   Decisão: um companheiro é uma invocação = golpe sintético (pose de chamado) que lança um projétil especial;
   nada novo em Fighter além da barra de apoio. Barra própria (separada do CHI) que enche com o tempo e com golpes;
   invocar gasta a barra inteira. Só é possível invocar quando o lutador está livre (não em hitstun).
   Determinístico: sem Math.random na lógica; a CPU escolhe o companheiro com Rng na partida. */
const COMPANIONS = [
  { id: 'none', name: 'Nenhum', desc: 'Lutar sem companheiro.' },
  { id: 'momo', name: 'Momo', title: 'Distração Aérea', desc: 'Voa até o adversário e o atordoa por um instante. Pouco dano, ótimo para abrir combos. Recarga rápida.',
    rate: 0.14, color: '#d7ccc8',
    projectile: { type: 'momo', x: 40, y: -150, vx: 11, w: 46, h: 34, damage: 4, chip: 1, hitstun: 24, blockstun: 10, knockback: 2, life: 110, exclusive: false, cancels: false } },
  { id: 'appa', name: 'Appa', title: 'Investida do Bisão', desc: 'Surge ao fundo e investe pela arena, empurrando e derrubando quem estiver no caminho. Grande impacto, recarga longa.',
    rate: 0.06, color: '#eceff1',
    projectile: { type: 'appa', x: -260, y: -90, vx: 7, w: 230, h: 160, damage: 14, chip: 3, hitstun: 30, blockstun: 16, knockback: 18, life: 240, knockdown: true, pierce: true, exclusive: false, cancels: false, delay: 20 } },
  { id: 'nyla', name: 'Nyla', title: 'Língua Paralisante', desc: 'O shirshu de June dispara a língua em linha reta: quem é atingido fica paralisado por um segundo.',
    rate: 0.09, color: '#f48fb1',
    projectile: { type: 'nyla', x: 40, y: -110, vx: 0, w: 420, h: 34, damage: 6, chip: 1, hitstun: 60, blockstun: 14, knockback: 0, life: 14, delay: 12, pierce: true, exclusive: false, cancels: false } },
];
const ASSIST_MAX = 100;
const ASSIST_MOVE = { key: 'assist', name: 'Companheiro', startup: 6, active: 2, recovery: 12, pose: 'cast', sound: 'whoosh', chi: 0 };

const Companions = (() => {
  const enabled = () => Settings.data.companions !== false;
  const get = (id) => COMPANIONS.find((c) => c.id === id) || COMPANIONS[0];
  /* chamado em startMatch: define o companheiro de cada lutador e zera a barra */
  function setup(game) {
    game.fighters.forEach((f, i) => {
      let id = enabled() && (game.usesCompanions === undefined || game.usesCompanions) ? (i === 0 ? game.select.comp1 : game.select.comp2) || 'none' : 'none';
      if (enabled() && f.isCPU && (!id || id === 'none') && game.mode !== 'training') id = Rng.pick(COMPANIONS.slice(1)).id;
      f.companion = get(id); f.assist = 0;
    });
  }
  /* a cada frame simulado (fase de jogo) */
  function onFrame(game) {
    for (const f of game.fighters) {
      if (!f.companion || f.companion.id === 'none') continue;
      f.assist = Math.min(ASSIST_MAX, f.assist + f.companion.rate);
    }
  }
  function onHit(attacker, defender) {
    if (attacker.companion && attacker.companion.id !== 'none') attacker.assist = Math.min(ASSIST_MAX, attacker.assist + 6);
    if (defender.companion && defender.companion.id !== 'none') defender.assist = Math.min(ASSIST_MAX, defender.assist + 4);
  }
  /* tenta invocar; devolve true se começou */
  function invoke(f) {
    const c = f.companion;
    if (!c || c.id === 'none' || f.assist < ASSIST_MAX || !f.canAct || f.chiBlocked > 0) return false;
    f.assist = 0;
    f.startAttack(Object.assign({}, ASSIST_MOVE, { projectile: Object.assign({}, c.projectile, { companion: c.id }) }));
    f.game.setAnnounce(`${c.name} · ${T(c.title)}`, 40, { size: 30, color: c.color, y: 240 });
    return true;
  }
  return { enabled, get, setup, onFrame, onHit, invoke };
})();

/* ----- desenho 2D dos companheiros (chamado pelo Projectile.draw) ----- */
function drawCompanion2D(ctx, p) {
  const { x, y, w, h } = p;
  ctx.save();
  switch (p.type) {
    case 'momo': {
      ctx.translate(x, y + Math.sin(p.frame * 0.4) * 4); ctx.scale(p.facing, 1);
      ctx.fillStyle = '#a1887f'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2); ctx.fill();          // corpo
      ctx.fillStyle = '#d7ccc8'; ctx.beginPath(); ctx.ellipse(-2, 3, 10, 6, 0, 0, Math.PI * 2); ctx.fill();           // barriga
      ctx.fillStyle = '#a1887f'; ctx.beginPath(); ctx.arc(16, -4, 9, 0, Math.PI * 2); ctx.fill();                      // cabeça
      ctx.beginPath(); ctx.ellipse(12, -16, 5, 9, -0.3, 0, Math.PI * 2); ctx.ellipse(21, -16, 5, 9, 0.3, 0, Math.PI * 2); ctx.fill();  // orelhas
      ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(19, -5, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-16, 2); ctx.quadraticCurveTo(-34, -6 + Math.sin(p.frame * 0.5) * 10, -40, 8); ctx.stroke();  // cauda
      ctx.strokeStyle = 'rgba(161,136,127,.8)'; ctx.lineWidth = 3; const wing = Math.sin(p.frame * 0.8) * 10;         // membranas
      ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(-18, -22 + wing); ctx.lineTo(8, -8); ctx.closePath(); ctx.stroke();
      break;
    }
    case 'appa': {
      if (p.delay > 0) { ctx.globalAlpha = 0.5; }
      ctx.translate(x, y); ctx.scale(p.facing, 1);
      const bob = Math.sin(p.frame * 0.3) * 4;
      ctx.fillStyle = '#eceff1'; ctx.beginPath(); ctx.ellipse(0, bob, w * 0.5, h * 0.42, 0, 0, Math.PI * 2); ctx.fill();    // corpo
      ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.moveTo(-w * 0.5, bob - 10); ctx.quadraticCurveTo(0, bob - h * 0.46, w * 0.46, bob - 12); ctx.lineTo(w * 0.46, bob + 2); ctx.quadraticCurveTo(0, bob - h * 0.3, -w * 0.5, bob + 4); ctx.closePath(); ctx.fill(); // flecha nas costas
      ctx.fillStyle = '#eceff1'; ctx.beginPath(); ctx.ellipse(w * 0.46, bob + 10, 46, 36, 0, 0, Math.PI * 2); ctx.fill();   // cabeça
      ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.moveTo(w * 0.36, bob - 26); ctx.lineTo(w * 0.52, bob - 60); ctx.lineTo(w * 0.5, bob - 22); ctx.closePath(); ctx.fill();   // chifre
      ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(w * 0.58, bob + 2, 4, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 6; i++) { const lx = -w * 0.4 + i * w * 0.14, ly = bob + h * 0.36 + Math.sin(p.frame * 0.5 + i) * 6; ctx.fillStyle = '#cfd8dc'; ctx.fillRect(lx - 8, ly, 16, 22); }  // seis patas
      break;
    }
    case 'nyla': {
      const x0 = p.owner.x + p.facing * 30, x1 = x0 + p.facing * w;
      if (p.delay > 0) {
        ctx.translate(x0 - p.facing * 70, CFG.GROUND); ctx.scale(p.facing, 1);
        ctx.fillStyle = '#4e342e'; ctx.beginPath(); ctx.ellipse(0, -40, 60, 34, 0, 0, Math.PI * 2); ctx.fill();   // corpo do shirshu
        ctx.beginPath(); ctx.ellipse(56, -58, 26, 18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f48fb1'; ctx.fillRect(70, -62, 14, 6);
        break;
      }
      ctx.translate(0, 0); ctx.strokeStyle = '#f48fb1'; ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y); for (let i = 1; i <= 8; i++) ctx.lineTo(lerp(x0, x1, i / 8), y + Math.sin(i * 1.3 + p.frame) * 6); ctx.stroke();
      ctx.fillStyle = '#f8bbd0'; ctx.beginPath(); ctx.arc(x1, y, 12, 0, Math.PI * 2); ctx.fill();
      break;
    }
  }
  ctx.restore();
}

/* ----- HUD: barra de apoio ----- */
function drawAssistBars(ctx, game) {
  const W = CFG.W;
  game.fighters.forEach((f, side) => {
    if (!f.companion || f.companion.id === 'none') return;
    const cw = 200, ch = 8, cy = CFG.H - 20, cx = side === 0 ? 60 : W - 60 - cw;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, cx - 3, cy - 3, cw + 6, ch + 6, 4); ctx.fill();
    const full = f.assist >= ASSIST_MAX, pulse = full ? 0.6 + Math.sin(game.t * 0.25) * 0.4 : 1;
    ctx.fillStyle = full ? `rgba(255,255,255,${pulse})` : f.companion.color;
    const aw = cw * (f.assist / ASSIST_MAX);
    if (side === 0) ctx.fillRect(cx, cy, aw, ch); else ctx.fillRect(cx + cw - aw, cy, aw, ch);
    const key = side === 0 ? KEYMAPS.p1.labels.assist : KEYMAPS.p2.labels.assist;
    txt(ctx, full ? T('{0} PRONTO ({1})', f.companion.name, key) : f.companion.name, side === 0 ? cx + cw + 10 : cx - 10, cy + 4, { size: 11, align: side === 0 ? 'left' : 'right', color: full ? '#fff' : '#cfd8dc', stroke: 'rgba(0,0,0,.8)' });
  });
}

/* ----- visuais 3D ----- */
function makeCompanionVisual(p, add, glow, G) {
  const v = { meshes: [] };
  switch (p.type) {
    case 'momo': {
      const body = add(G.sphere, toon('#a1887f'), [18, 12, 12]);
      const head = add(G.sphere, toon('#a1887f'), [9, 9, 9]); head.position.x = 16; head.position.y = 4;
      const e1 = add(G.cone, toon('#d7ccc8'), [4, 12, 3]); e1.position.set(12, 16, 4); const e2 = add(G.cone, toon('#d7ccc8'), [4, 12, 3]); e2.position.set(20, 16, -4);
      const tail = add(G.cyl, toon('#8d6e63'), [2.5, 36, 2.5]); tail.position.set(-28, 4, 0); tail.rotation.z = 1.2;
      v.update = (p, group) => { group.position.set(p.x, CFG.GROUND - p.y + Math.sin(p.frame * 0.4) * 4, 0); group.scale.x = p.facing; tail.rotation.z = 1.2 + Math.sin(p.frame * 0.5) * 0.4; };
      break;
    }
    case 'appa': {
      const body = add(G.sphere, toon('#eceff1'), [p.w * 0.5, p.h * 0.42, 70]);
      const stripe = add(G.box, toon('#8d6e63'), [p.w * 0.9, 10, 30]); stripe.position.y = p.h * 0.38;
      const head = add(G.sphere, toon('#eceff1'), [46, 36, 40]); head.position.set(p.w * 0.46, -6, 0);
      const horn1 = add(G.cone, toon('#8d6e63'), [6, 34, 6]); horn1.position.set(p.w * 0.42, 34, 18); const horn2 = add(G.cone, toon('#8d6e63'), [6, 34, 6]); horn2.position.set(p.w * 0.42, 34, -18);
      const legs = []; for (let i = 0; i < 6; i++) { const l = add(G.cyl, toon('#cfd8dc'), [8, 30, 8]); l.position.set(-p.w * 0.4 + i * p.w * 0.14, -p.h * 0.42, (i % 2) * 40 - 20); legs.push(l); }
      v.update = (p, group) => { group.position.set(p.x, CFG.GROUND - p.y + Math.sin(p.frame * 0.3) * 4, -40); group.scale.x = p.facing; group.visible = true; legs.forEach((l, i) => { l.rotation.z = Math.sin(p.frame * 0.5 + i) * 0.5; }); body.material.opacity = p.delay > 0 ? 0.5 : 1; body.material.transparent = p.delay > 0; };
      break;
    }
    case 'nyla': {
      const bodyM = add(G.sphere, toon('#4e342e'), [60, 34, 40]);
      const headM = add(G.sphere, toon('#4e342e'), [26, 18, 22]); headM.position.set(56, 18, 0);
      const tongue = add(G.cyl, new THREE.MeshToonMaterial({ color: new THREE.Color('#f48fb1'), gradientMap: Rig3D.gradient() }), [7, p.w, 7]); tongue.rotation.z = Math.PI / 2;
      const tip = add(G.sphere, toon('#f8bbd0'), [12, 12, 12]);
      v.update = (p, group) => {
        const x0 = p.owner.x + p.facing * 30;
        group.position.set(x0 - p.facing * 70, 40, -20); group.scale.x = p.facing;
        const on = p.delay <= 0; tongue.visible = tip.visible = on;
        tongue.position.set(70 + p.w / 2, CFG.GROUND - p.y - 40, 0); tip.position.set(70 + p.w, CFG.GROUND - p.y - 40, 0);
      };
      break;
    }
  }
  return v;
}
