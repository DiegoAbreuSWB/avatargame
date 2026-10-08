/* IA do oponente controlado pelo computador. Produz um "pad" virtual a cada frame.
   Usa o gerador com semente (Rng) para que a mesma semente reproduza a mesma luta.
   Níveis: a dificuldade muda tempo de reação, chance de bloquear, uso de especiais e punições. */
const AI = (() => {
  const LEVELS = {
    easy:   { think: [12, 26], block: 0.45, special: 0.6, punish: 0.0, jumpProj: 0.3, superChance: 0.15, dash: 0.0 },
    normal: { think: [4, 12],  block: 1.0,  special: 1.0, punish: 0.35, jumpProj: 0.5, superChance: 0.35, dash: 0.15 },
    hard:   { think: [1, 5],   block: 1.35, special: 1.2, punish: 0.8, jumpProj: 0.7, superChance: 0.6, dash: 0.35 },
  };

  function update(f, opp, game) {
    const L = LEVELS[f.aiLevel] || LEVELS.normal;
    const m = f.ai || (f.ai = { hold: 0, action: null, think: 0, airAttacked: false });
    const pad = Input.emptyPad();
    const dx = opp.x - f.x, dist = Math.abs(dx), dir = dx >= 0 ? 1 : -1;
    const fwd = dir === 1 ? 'right' : 'left', back = dir === 1 ? 'left' : 'right';

    if (f.state === 'jump') {
      if (!m.airAttacked && dist < 170 && f.vy > -6) { m.airAttacked = true; pad.kick = Rng.chance(0.6); pad.punch = !pad.kick; }
      pad[fwd] = true;
      return pad;
    }
    m.airAttacked = false;
    if (!f.canAct) return pad;

    const incoming = game.projectiles.find((p) => p.owner !== f && p.active && !GROUND_TYPES.has(p.type) && p.type !== 'vortex' &&
      Math.abs(p.x - f.x) < 360 && Math.sign(p.vx) === -dir && Math.sign(p.vx) !== 0);
    const oppAttacking = opp.state === 'attack' && opp.attackFrame <= opp.attack.startup + opp.attack.active;
    const oppRecovering = opp.state === 'attack' && opp.attackFrame > opp.attack.startup + opp.attack.active;

    if (m.hold > 0) { m.hold--; apply(pad, m.action, fwd, back); return pad; }
    if (m.think > 0) { m.think--; return pad; }

    const r = Rng.next();
    let action = 'wait', hold = 1;
    if (opp.state === 'knockdown' || opp.state === 'getup') {
      action = dist > 140 ? 'approach' : 'back'; hold = 8;
    } else if (oppRecovering && dist < 160 && Rng.chance(L.punish)) {
      action = Rng.chance(0.5) ? 'kick' : 'special2';
    } else if (incoming) {
      if (incoming.y > CFG.GROUND - 70 && Rng.chance(L.jumpProj)) { action = 'jumpFwd'; hold = 1; }
      else if (r < 0.75 * L.block) { action = incoming.y > CFG.GROUND - 60 ? 'blockLow' : 'block'; hold = 24; }
      else { action = Rng.chance(L.jumpProj) ? 'jumpFwd' : 'wait'; hold = 4; }
    } else if (oppAttacking && dist < 200) {
      if (r < 0.55 * L.block) { action = opp.attack.height === 'low' ? 'blockLow' : 'block'; hold = 18; }
      else if (r < 0.75) { action = 'punch'; }
      else { action = 'back'; hold = 10; }
    } else if (dist < 115) {
      if (r < 0.3) action = 'punch';
      else if (r < 0.42 && opp.blocking && L.punish > 0) action = 'throw';
      else if (r < 0.55) action = 'kick';
      else if (r < 0.68) action = 'sweep';
      else if (r < 0.8 && Rng.chance(L.special)) action = 'special2';
      else if (r < 0.9) { action = 'back'; hold = 10; }
      else { action = 'block'; hold = 14; }
    } else if (dist < 260) {
      if (r < 0.38) { action = Rng.chance(L.dash) ? 'dashFwd' : 'approach'; hold = randIntR(8, 18); }
      else if (r < 0.55) action = 'kick';
      else if (r < 0.7 && Rng.chance(L.special)) action = 'special2';
      else if (r < 0.85) action = 'jumpFwd';
      else action = Rng.chance(L.special) ? 'special' : 'approach';
    } else {
      if (r < 0.42 && Rng.chance(L.special)) action = 'special';
      else if (r < 0.8) { action = Rng.chance(L.dash) ? 'dashFwd' : 'approach'; hold = randIntR(12, 28); }
      else if (r < 0.9) action = 'jumpFwd';
      else { action = 'wait'; hold = 10; }
    }
    if (f.chi >= CFG.MAX_CHI && dist < 420 && Rng.chance(L.superChance)) action = 'super';
    if (f.chiBlocked > 0 && ['special', 'special2', 'super'].includes(action)) action = dist < 120 ? 'kick' : 'approach';

    m.action = action; m.hold = hold; m.think = randIntR(L.think[0], L.think[1]);
    apply(pad, action, fwd, back);
    return pad;
  }
  const randIntR = (a, b) => Rng.int(a, b);

  function apply(pad, action, fwd, back) {
    switch (action) {
      case 'approach': pad[fwd] = true; break;
      case 'back': pad[back] = true; break;
      case 'block': pad[back] = true; break;
      case 'blockLow': pad[back] = true; pad.down = true; break;
      case 'punch': pad.punch = true; break;
      case 'kick': pad.kick = true; break;
      case 'sweep': pad.kick = true; pad.down = true; break;
      case 'special': pad.special = true; break;
      case 'special2': pad.special = true; pad.down = true; break;
      case 'super': pad.super = true; break;
      case 'jumpFwd': pad.upPressed = true; pad.up = true; pad[fwd] = true; break;
      case 'dashFwd': pad.dashF = true; pad[fwd] = true; break;
      case 'throw': pad.throw = true; break;
      case 'wait': default: break;
    }
  }
  return { update, LEVELS };
})();
