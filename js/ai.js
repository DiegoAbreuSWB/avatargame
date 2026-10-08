/* IA simples para o oponente controlado pelo computador. Produz um "pad" virtual a cada frame. */
const AI = (() => {
  function update(f, opp, game) {
    const m = f.ai || (f.ai = { hold: 0, action: null, think: 0, airAttacked: false });
    const pad = Input.emptyPad();
    const dx = opp.x - f.x, dist = Math.abs(dx), dir = dx >= 0 ? 1 : -1;
    const fwd = dir === 1 ? 'right' : 'left', back = dir === 1 ? 'left' : 'right';

    // ataque aéreo quando estiver pulando perto do oponente
    if (f.state === 'jump') {
      if (!m.airAttacked && dist < 170 && f.vy > -6) { m.airAttacked = true; pad.kick = Math.random() < 0.6; pad.punch = !pad.kick; }
      pad[fwd] = true;
      return pad;
    }
    m.airAttacked = false;
    if (!f.canAct) return pad;

    const incoming = game.projectiles.find((p) => p.owner !== f && p.active && !GROUND_TYPES.has(p.type) && p.type !== 'vortex' &&
      Math.abs(p.x - f.x) < 360 && Math.sign(p.vx) === -dir && Math.sign(p.vx) !== 0);
    const oppAttacking = opp.state === 'attack' && opp.attackFrame <= opp.attack.startup + opp.attack.active;

    if (m.hold > 0) { m.hold--; apply(pad, m.action, fwd, back); return pad; }
    if (m.think > 0) { m.think--; return pad; }

    const r = Math.random();
    let action = 'wait', hold = 1;
    if (opp.state === 'knockdown' || opp.state === 'getup') {
      action = dist > 140 ? 'approach' : 'back'; hold = 8;
    } else if (incoming) {
      if (incoming.y > CFG.GROUND - 70 && r < 0.5) { action = 'jumpFwd'; hold = 1; }
      else if (r < 0.75) { action = incoming.y > CFG.GROUND - 60 ? 'blockLow' : 'block'; hold = 24; }
      else { action = 'jumpFwd'; hold = 1; }
    } else if (oppAttacking && dist < 200) {
      if (r < 0.55) { action = opp.attack.height === 'low' ? 'blockLow' : 'block'; hold = 18; }
      else if (r < 0.75) { action = 'punch'; }
      else { action = 'back'; hold = 10; }
    } else if (dist < 115) {
      if (r < 0.3) action = 'punch';
      else if (r < 0.55) action = 'kick';
      else if (r < 0.68) action = 'sweep';
      else if (r < 0.8) action = 'special2';
      else if (r < 0.9) { action = 'back'; hold = 10; }
      else { action = 'block'; hold = 14; }
    } else if (dist < 260) {
      if (r < 0.38) { action = 'approach'; hold = randInt(8, 18); }
      else if (r < 0.55) action = 'kick';
      else if (r < 0.7) action = 'special2';
      else if (r < 0.85) action = 'jumpFwd';
      else action = 'special';
    } else {
      if (r < 0.42) action = 'special';
      else if (r < 0.8) { action = 'approach'; hold = randInt(12, 28); }
      else if (r < 0.9) action = 'jumpFwd';
      else { action = 'wait'; hold = 10; }
    }
    if (f.chi >= CFG.MAX_CHI && dist < 420 && Math.random() < 0.35) action = 'super';

    m.action = action; m.hold = hold; m.think = randInt(4, 12);
    apply(pad, action, fwd, back);
    return pad;
  }

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
      case 'wait': default: break;
    }
  }
  return { update };
})();
