/* Lutador: física, máquina de estados, golpes, dano e bloqueio.
   Mecânicas de "game feel" (Fase 1): buffer de entrada, cancelamento, dash, agarrão com escape,
   escalonamento de dano em combos, levantar rápido e empurrão no canto. */
const THROW_RANGE = 95, THROW_DAMAGE = 12, BUFFER_FRAMES = 8, DOUBLE_TAP_FRAMES = 12;
const THROW_WHIFF = { key: 'throwWhiff', name: 'Agarrão (erro)', startup: 4, active: 2, recovery: 22, pose: 'grab' };

class Fighter {
  constructor(char, side, game) {
    this.char = char;
    this.moves = buildMoveset(char);
    this.side = side;
    this.game = game;
    this.rounds = 0;
    this.isCPU = false;
    this.aiLevel = 'normal';
    this.ai = null;
    this.stats = { hits: 0, maxCombo: 0, damage: 0, throws: 0 };
    this.maxHp = CFG.MAX_HP;
    this.reset(side === 0 ? 380 : CFG.W - 380, side === 0 ? 1 : -1);
  }

  reset(x, facing) {
    this.x = x; this.y = CFG.GROUND; this.vx = 0; this.vy = 0; this.facing = facing;
    this.hp = this.maxHp || CFG.MAX_HP; this.chi = this.chi || 0;
    this.state = 'idle'; this.pose = 'idle'; this.poseT = 0; this.frame = 0; this.poseSmooth = 0.5;
    this.attack = null; this.attackFrame = 0; this.attackPhase = 0; this.hitsLeft = 0; this.hitCooldown = 0; this.volleyFired = 0;
    this.attackConnected = false;
    this.stun = 0; this.airborne = false; this.crouching = false; this.blocking = false;
    this.invulnFrames = 0; this.flash = 0; this.launched = false; this.superActive = false;
    this.pad = Input.emptyPad(); this.prevPad = Input.emptyPad();
    this.buf = { punch: 0, kick: 0, special: 0, super: 0 };
    this.pending = null;                      // soco/chute aguardando 2 frames para virar agarrão
    this.tap = { dir: 0, frame: -99 };        // toque duplo para dash
    this.dashT = 0; this.dashVx = 0; this.pushVx = 0;
    this.throwT = 0; this.thrownBy = null; this.stayedDown = false;
    this.chiBlocked = 0;
    this.combo = 0; this.comboTimer = 0; this.ai = null; this.lastHitAt = -999;
    this.joints = null; updateJoints(this, true);
  }

  get opponent() { return this.game.fighters[1 - this.side]; }
  get grounded() { return !this.airborne; }
  get canAct() { return ['idle', 'walk', 'crouch'].includes(this.state); }
  get hurtbox() {
    const lying = ['knockdown', 'ko'].includes(this.state);
    const h = lying ? 40 : this.crouching ? 105 : 165;
    const w = lying ? 120 : 60;
    return { x: this.x - w / 2, y: this.y - h, w, h };
  }
  get pushbox() { return { x: this.x - 28, y: this.y - 150, w: 56, h: 150 }; }
  get isInvulnerable() {
    if (this.invulnFrames > 0) return true;
    if (this.state === 'attack' && this.attack.invuln) {
      const [a, b] = this.attack.invuln; return this.attackFrame >= a && this.attackFrame <= b;
    }
    return ['knockdown', 'getup', 'ko', 'win', 'thrown', 'throw'].includes(this.state);
  }
  get throwable() {
    return this.grounded && !this.isInvulnerable && ['idle', 'walk', 'crouch', 'block', 'attack'].includes(this.state) && this.state !== 'thrown';
  }
  get hitbox() {
    const m = this.attack;
    if (this.state !== 'attack' || !m || !m.hitbox) return null;
    if (this.hitsLeft <= 0 || this.hitCooldown > 0) return null;
    const af = this.attackFrame;
    if (af <= m.startup || af > m.startup + m.active) return null;
    const hb = m.hitbox;
    const x = this.facing === 1 ? this.x + hb.x : this.x - hb.x - hb.w;
    return { x, y: this.y + hb.y, w: hb.w, h: hb.h };
  }
  get counterStance() {
    const m = this.attack;
    if (this.state !== 'attack' || !m || !m.counter) return null;
    return this.attackFrame > m.startup && this.attackFrame <= m.startup + m.active ? m.counter : null;
  }

  setPose(p) { if (this.pose !== p) { this.pose = p; this.poseT = 0; } }

  update(pad, controlEnabled) {
    this.prevPad = this.pad; this.pad = pad; this.frame++; this.poseT++;
    for (const k in this.buf) { if (pad[k]) this.buf[k] = BUFFER_FRAMES; else if (this.buf[k] > 0) this.buf[k]--; }
    if (this.flash > 0) this.flash--;
    if (this.invulnFrames > 0) this.invulnFrames--;
    if (this.hitCooldown > 0) this.hitCooldown--;
    if (this.chiBlocked > 0) this.chiBlocked--;
    if (this.comboTimer > 0) { this.comboTimer--; if (this.comboTimer === 0) this.combo = 0; }
    const opp = this.opponent;

    // física vertical
    if (this.airborne) {
      this.vy += CFG.GRAVITY * (this.launched ? 0.85 : 1);
      this.y += this.vy;
      if (this.y >= CFG.GROUND) { this.y = CFG.GROUND; this.vy = 0; this.airborne = false; this.onLand(); }
    }
    // empurrão horizontal residual (knockback) e empurrão de canto
    if (['hit', 'block', 'knockdown'].includes(this.state) || (this.airborne && this.launched)) {
      this.x += this.vx; this.vx *= this.airborne ? 0.99 : 0.82;
    } else if (this.state === 'jump' || (this.state === 'attack' && this.attack.air)) {
      this.x += this.vx;
    } else { this.vx = 0; }
    if (this.pushVx) { this.x += this.pushVx; this.pushVx *= 0.8; if (Math.abs(this.pushVx) < 0.2) this.pushVx = 0; }

    switch (this.state) {
      case 'hit': case 'block':
        if (!this.airborne) { this.stun--; if (this.stun <= 0) this.toNeutral(); }
        break;
      case 'knockdown':
        this.stun--;
        if (controlEnabled && this.stun > 12 && this.stun < 30 && (pad.punch || pad.kick || pad.up || pad.left || pad.right)) this.stun = 12;   // levantar rápido
        if (controlEnabled && pad.down && this.stun <= 1 && !this.stayedDown) { this.stun = 30; this.stayedDown = true; }                 // ficar no chão
        if (this.stun <= 0) { this.state = 'getup'; this.stun = 24; this.invulnFrames = 40; this.stayedDown = false; this.setPose('getup'); }
        break;
      case 'getup':
        this.stun--; if (this.stun <= 0) this.toNeutral();
        break;
      case 'dash':
        this.x += this.dashVx; this.dashT--;
        if (this.dashT <= 0) this.toNeutral();
        break;
      case 'throw': this.updateThrow(); break;
      case 'thrown':
        if (this.thrownBy) { this.x = this.thrownBy.x + this.thrownBy.facing * 52; this.y = CFG.GROUND; this.facing = -this.thrownBy.facing; }
        if (controlEnabled && this.throwT < 10 && this.buf.punch > 0 && this.buf.kick > 0) this.thrownBy.throwEscaped();
        this.throwT++;
        break;
      case 'attack': this.updateAttack(); break;
      case 'ko': case 'win': case 'intro': break;
      default: if (controlEnabled) this.control(pad);
    }

    if (this.grounded && ['idle', 'walk', 'crouch'].includes(this.state)) this.facing = opp.x >= this.x ? 1 : -1;
    this.x = clamp(this.x, CFG.WALL_PAD, CFG.W - CFG.WALL_PAD);
    this.choosePose();
    updateJoints(this);
  }

  /* ----- controle ----- */
  control(pad) {
    const opp = this.opponent;
    const dirToOpp = opp.x >= this.x ? 1 : -1;
    const back = dirToOpp === 1 ? pad.left : pad.right;

    if (this.state === 'jump') {
      if (this.buf.punch > 0) { this.buf.punch = 0; return this.startAttack(this.moves.jpunch); }
      if (this.buf.kick > 0) { this.buf.kick = 0; return this.startAttack(this.moves.jkick); }
      return;
    }
    this.crouching = pad.down;
    this.blocking = back && !pad.punch && !pad.kick;

    // dash por toque duplo (ou comando direto da IA / toque)
    const edgeL = pad.left && !this.prevPad.left, edgeR = pad.right && !this.prevPad.right;
    const dir = edgeR ? 1 : edgeL ? -1 : 0;
    if (dir) {
      if (this.tap.dir === dir && this.frame - this.tap.frame <= DOUBLE_TAP_FRAMES) { this.tap.frame = -99; return this.startDash(dir); }
      this.tap = { dir, frame: this.frame };
    }
    if (pad.dashF) return this.startDash(dirToOpp);
    if (pad.dashB) return this.startDash(-dirToOpp);

    // agarrão: soco+chute juntos (ou pad.throw da IA)
    if (pad.throw) return this.startThrow();
    if (this.pending) {
      const other = this.pending.key === 'punch' ? 'kick' : 'punch';
      if (this.buf[other] > 0) { this.pending = null; this.buf.punch = this.buf.kick = 0; return this.startThrow(); }
      if (--this.pending.frames <= 0) { const k = this.pending.key; this.pending = null; this.buf[k] = 0; return this.startNormal(k, pad); }
      return;
    }
    // ataques (prioridade: super > especial 2 > especial > chute > soco)
    const noBend = this.chiBlocked > 0 || this.noBending;
    if (this.buf.super > 0 && this.chi >= CFG.MAX_CHI) { this.buf.super = 0; if (noBend) return this.chiBlockedFx(); return this.startAttack(this.moves.super); }
    if (this.buf.special > 0) { this.buf.special = 0; if (noBend) return this.chiBlockedFx(); return this.startAttack(pad.down ? this.moves.special2 : this.moves.special); }
    if (this.buf.punch > 0 && this.buf.kick > 0) { this.buf.punch = this.buf.kick = 0; return this.startThrow(); }
    if (this.buf.kick > 0) { this.buf.kick = 0; this.pending = { key: 'kick', frames: 2 }; return; }
    if (this.buf.punch > 0) { this.buf.punch = 0; this.pending = { key: 'punch', frames: 2 }; return; }

    if (pad.down) { this.state = 'crouch'; return; }
    if (pad.upPressed) {
      this.airborne = true; this.vy = -this.char.jump; this.state = 'jump';
      this.vx = (pad.right ? 1 : pad.left ? -1 : 0) * this.char.speed * 0.95;
      Audio_.play('jump'); this.setPose('jump');
      return;
    }
    if (pad.left || pad.right) {
      const d = pad.right ? 1 : -1;
      const speed = d === dirToOpp ? this.char.speed : this.char.speed * 0.75;
      this.x += d * speed; this.state = 'walk';
    } else this.state = 'idle';
  }
  startNormal(key, pad) {
    if (key === 'punch') return this.startAttack(pad.down ? this.moves.cpunch : this.moves.punch);
    return this.startAttack(pad.down ? this.moves.sweep : this.moves.kick);
  }
  chiBlockedFx() {
    Particles.burst(this.x + this.facing * 30, this.y - 120, 6, { color: ['#f48fb1', '#fff'], maxSpeed: 3, shape: 'spark' });
    Audio_.play('block');
  }

  startDash(dir) {
    const forward = dir === (this.opponent.x >= this.x ? 1 : -1);
    this.state = 'dash'; this.crouching = false; this.blocking = false; this.pending = null;
    this.facing = this.opponent.x >= this.x ? 1 : -1;
    if (forward) { this.dashT = 14; this.dashVx = dir * this.char.speed * 2.3; this.setPose('dash'); }
    else { this.dashT = 16; this.dashVx = dir * this.char.speed * 1.7; this.invulnFrames = 8; this.setPose('dashB'); }
    Audio_.play('whoosh');
    Particles.element('hit', this.x, this.y - 10, 5, { maxSpeed: 3, color: ['#fff', '#ccc'] });
  }

  /* ----- agarrão ----- */
  startThrow(damage = THROW_DAMAGE, range = THROW_RANGE) {
    const o = this.opponent;
    this.pending = null; this.crouching = false; this.blocking = false;
    this.facing = o.x >= this.x ? 1 : -1;
    const inRange = Math.abs(o.x - this.x) <= range && o.throwable && this.grounded;
    if (!inRange) return this.startAttack(THROW_WHIFF);
    this.state = 'throw'; this.throwT = 0; this.throwDamage = damage; this.setPose('grab'); this.poseSmooth = 0.6;
    o.state = 'thrown'; o.thrownBy = this; o.throwT = 0; o.attack = null; o.superActive = false; o.airborne = false; o.vx = 0; o.setPose('launched');
    Audio_.play('whoosh');
  }
  updateThrow() {
    this.throwT++;
    const o = this.opponent;
    if (this.throwT === 16 && o.state === 'thrown') {
      o.receiveThrow(this, this.throwDamage);
      this.stats.throws++;
    }
    if (this.throwT >= 28) this.toNeutral();
  }
  throwEscaped() {
    const o = this.opponent;
    this.toNeutral(); o.toNeutral(); o.thrownBy = null;
    this.pushVx = -this.facing * 7; o.pushVx = this.facing * 7;
    this.game.setAnnounce(T('ESCAPOU!'), 40, { size: 44, color: '#80deea', y: 240 });
    Audio_.play('block'); Particles.element('block', (this.x + o.x) / 2, this.y - 100, 10);
  }
  receiveThrow(attacker, damage) {
    this.thrownBy = null;
    this.hp = Math.max(0, this.hp - damage); this.lastHitAt = this.game.t;
    this.state = 'hit'; this.stun = 30; this.flash = 5; this.crouching = false;
    this.airborne = true; this.launched = true; this.y = CFG.GROUND - 1;
    this.vy = -11; this.vx = attacker.facing * 9;
    attacker.chi = Math.min(CFG.MAX_CHI, attacker.chi + 8); this.chi = Math.min(CFG.MAX_CHI, this.chi + 3);
    attacker.combo = 1; attacker.comboTimer = 45; attacker.stats.hits++; attacker.stats.damage += damage;
    Audio_.play('hitHeavy'); Particles.element('hit', this.x, this.y - 100, 14);
    this.game.hitstop = 6; this.game.shakeScreen(6);
    if (this.hp <= 0) this.game.onKO(this, attacker);
  }

  /* ----- ataques ----- */
  startAttack(m) {
    if (!m) return;
    if (m.cost) { if (this.chi < m.cost) return; this.chi = 0; this.game.onSuper(this, m); }
    this.state = 'attack'; this.attack = m; this.attackFrame = 0; this.attackPhase = 0; this.attackConnected = false;
    this.hitsLeft = m.multi || 1; this.hitCooldown = 0; this.volleyFired = 0;
    this.blocking = false; this.pending = null;
    if (!m.air) this.crouching = !!m.crouch;
    this.setPose(m.pose); this.poseSmooth = 0.6;
    if (!m.projectile && !m.projectiles && !m.volley && !m.counter) Audio_.play('whoosh');
  }

  updateAttack() {
    const m = this.attack; const af = ++this.attackFrame;
    const total = m.startup + m.active + m.recovery;
    if (af <= m.startup) this.attackPhase = af / m.startup;
    else if (af <= m.startup + m.active) this.attackPhase = 1;
    else this.attackPhase = 1 - (af - m.startup - m.active) / m.recovery;
    const active = af > m.startup && af <= m.startup + m.active;

    // cancelamento: normal que conectou -> especial; especial que conectou -> super
    if (this.attackConnected && m.cancel && af > m.startup && af <= m.startup + m.active + 6 && this.chiBlocked <= 0 && !this.noBending) {
      if (m.cancel.includes('special') && this.buf.special > 0) { this.buf.special = 0; return this.startAttack(this.pad.down ? this.moves.special2 : this.moves.special); }
      if (m.cancel.includes('super') && this.buf.super > 0 && this.chi >= CFG.MAX_CHI) { this.buf.super = 0; return this.startAttack(this.moves.super); }
    }

    if (m.chargeFx && af < m.startup && af % 2 === 0) {
      Particles.element(m.chargeFx, this.x + this.facing * 40 + rand(-20, 20), this.y - 120 + rand(-30, 30), 2, { maxSpeed: 3 });
    }
    if (af === m.startup + 1) {
      if (m.projectile) this.game.spawnProjectile(this, m.projectile);
      if (m.projectiles) m.projectiles.forEach((p) => this.game.spawnProjectile(this, p));
      if (m.sound && (m.projectile || m.projectiles || m.volley || m.dash)) Audio_.play(m.sound);
      if (m.dash && m.dash.vy) { this.vy = m.dash.vy; this.airborne = true; }
      if (m.key === 'super') this.superActive = true;
      if (m.throw) { const o = this.opponent; if (Math.abs(o.x - this.x) <= m.throw.range && o.throwable) { this.startThrow(m.throw.damage, m.throw.range); return; } }
    }
    if (m.volley && active && this.volleyFired < m.volley.count && (af - m.startup - 1) % m.volley.every === 0) {
      this.volleyFired++;
      const p = Object.assign({}, m.volley.projectile, { vy: (this.volleyFired % 3 - 1) * 1.5, y: m.volley.projectile.y - (this.volleyFired % 2) * 30 });
      this.game.spawnProjectile(this, p);
      Audio_.play(m.volley.sound || 'fire');
    }
    if (m.dash && active) {
      this.x += m.dash.vx * this.facing;
      if (m.trail && af % 2 === 0) Particles.element(m.trail, this.x - this.facing * 20, this.y - 80 + rand(-40, 40), 2, { maxSpeed: 3 });
    }
    if (m.key === 'super' && active && af % 4 === 0) Particles.element(this.char.element === 'nao' ? 'hit' : this.char.element, this.x + rand(-40, 40), this.y - rand(20, 160), 2, { maxSpeed: 4 });
    if (m.counter && active && af % 3 === 0) Particles.burst(this.x + this.facing * 30, this.y - 110 + rand(-30, 30), 2, { color: ['#fff', '#ffd54f'], maxSpeed: 2, shape: 'ring' });

    if (af >= total) this.endAttack();
  }

  endAttack() {
    this.attack = null; this.superActive = false; this.poseSmooth = 0.5;
    if (this.airborne) { this.state = 'jump'; this.launched = false; }
    else this.toNeutral();
  }

  toNeutral() {
    this.state = this.pad.down ? 'crouch' : 'idle';
    this.crouching = this.pad.down; this.launched = false; this.stun = 0; this.attack = null; this.thrownBy = null;
  }

  onLand() {
    if (this.state === 'ko') return;
    if (this.launched || this.state === 'knockdown') {
      this.state = 'knockdown'; this.stun = 36; this.launched = false; this.vx *= 0.3; this.stayedDown = false;
      this.game.shakeScreen(6); Particles.element('terra', this.x, CFG.GROUND, 8, { maxSpeed: 4, color: ['#c9bba0', '#8d8070'] });
      return;
    }
    if (this.state === 'attack' && this.attack.air) { this.attack = null; }
    if (this.state === 'attack' && this.attack && this.attack.dash && this.attack.dash.vy) return; // continua o chute flamejante
    if (['jump', 'attack', 'hit'].includes(this.state)) this.toNeutral();
  }

  /* ----- Recebendo golpes ----- */
  canBlock(data) {
    if (data.unblockable) return false;
    if (!this.grounded) return false;
    const inBlockState = this.state === 'block';
    if (!(this.blocking || inBlockState) || !['idle', 'walk', 'crouch', 'block'].includes(this.state)) return false;
    if (data.height === 'low' && !this.crouching) return false;
    if (data.height === 'high' && this.crouching) return false;
    return true;
  }

  receiveHit(attacker, data, cx, cy, opts = {}) {
    const fromProjectile = !!opts.fromProjectile;
    const dir = Math.sign(this.x - attacker.x) || attacker.facing;
    const atWall = this.x <= CFG.WALL_PAD + 1 || this.x >= CFG.W - CFG.WALL_PAD - 1;
    if (this.canBlock(data)) {
      const chip = fromProjectile ? (data.chip || 0) : 0;
      this.hp = Math.max(0, this.hp - chip);
      this.state = 'block'; this.stun = data.blockstun || 10; this.vx = dir * (data.knockback || 4) * 0.5;
      if (atWall && !fromProjectile) attacker.pushVx = -dir * (data.knockback || 4) * 0.7;
      this.chi = Math.min(CFG.MAX_CHI, this.chi + 2);
      Audio_.play('block'); Particles.element('block', cx, cy, 8);
      this.game.hitstop = 2;
      if (this.hp <= 0) this.game.onKO(this, attacker);
      return 'block';
    }
    // armadura: golpes especiais de alguns personagens não são interrompidos
    if (this.state === 'attack' && this.attack && this.attack.armor && !data.launcher && !data.knockdown) {
      const dmg = Math.max(1, Math.round((data.damage || 0) * 0.8));
      this.hp = Math.max(0, this.hp - dmg); this.flash = 4; this.lastHitAt = this.game.t;
      attacker.stats.hits++; attacker.stats.damage += dmg;
      Audio_.play('block'); Particles.element('terra', cx, cy, 8, { maxSpeed: 4 });
      if (this.hp <= 0) this.game.onKO(this, attacker);
      return 'armor';
    }
    // escalonamento de dano: cada golpe do combo vale 10% a menos, até o mínimo de 40%
    const comboSoFar = attacker.comboTimer > 0 ? attacker.combo : 0;
    const scale = Math.max(0.4, 1 - 0.1 * comboSoFar) * Modifiers.damageMult(this.game, attacker);
    const dmg = data.damage ? Math.max(1, Math.round(data.damage * scale)) : 0;
    this.hp = Math.max(0, this.hp - dmg);
    this.lastHitAt = this.game.t;
    this.flash = 5; this.stun = data.hitstun || 14; this.state = 'hit'; this.attack = null; this.superActive = false; this.blocking = false; this.pending = null;
    const kb = (data.knockback || 4) / this.char.weight;
    this.vx = dir * kb * 0.9;
    if (atWall && !fromProjectile) attacker.pushVx = -dir * kb * 0.9;
    const wasAirborne = this.airborne;
    if (data.launcher || data.knockdown || wasAirborne || (data.lastKnockdown && opts.isLast)) {
      this.airborne = true; this.launched = true;
      this.vy = data.launcher ? -15 : (wasAirborne && data.multi) ? -5 : wasAirborne ? -7 : -9;
      if (this.y >= CFG.GROUND - 1) this.y = CFG.GROUND - 1;
      this.crouching = false;
    }
    if (data.pull) this.vx = -dir * data.pull;
    if (data.applies && data.applies.chiBlock) { this.chiBlocked = Math.max(this.chiBlocked, data.applies.chiBlock); this.game.setAnnounce(T('CHI BLOQUEADO!'), 50, { size: 40, color: '#f48fb1', y: 240 }); }
    this.chi = Math.min(CFG.MAX_CHI, this.chi + 3);
    attacker.chi = Math.min(CFG.MAX_CHI, attacker.chi + Math.round((data.chi || 5) * Modifiers.chiMult(this.game, attacker)));
    attacker.combo = comboSoFar + 1;
    this.comboTimer = 45;
    attacker.comboTimer = 45;
    attacker.stats.hits++; attacker.stats.damage += dmg; attacker.stats.maxCombo = Math.max(attacker.stats.maxCombo, attacker.combo);
    const heavy = dmg >= 9;
    Audio_.play(heavy ? 'hitHeavy' : 'hit');
    Particles.element('hit', cx, cy, heavy ? 16 : 9);
    this.game.hitstop = heavy ? 7 : 4;
    this.game.shakeScreen(heavy ? 7 : 3);
    if (this.hp <= 0) this.game.onKO(this, attacker);
    return 'hit';
  }

  choosePose() {
    const threatened = this.game.isThreatened(this);
    switch (this.state) {
      case 'idle': this.setPose(this.blocking && threatened ? 'block' : 'idle'); break;
      case 'walk': this.setPose(this.blocking && threatened ? 'block' : 'walk'); break;
      case 'crouch': this.setPose(this.blocking && threatened ? 'blockLow' : 'crouch'); break;
      case 'jump': this.setPose('jump'); break;
      case 'attack': this.setPose(this.attack.pose); break;
      case 'hit': this.setPose(this.airborne ? 'launched' : this.crouching ? 'hitLow' : 'hit'); break;
      case 'block': this.setPose(this.crouching ? 'blockLow' : 'block'); break;
      case 'knockdown': this.setPose('knockdown'); break;
      case 'getup': this.setPose('getup'); break;
      case 'dash': break;                       // pose definida em startDash
      case 'throw': this.setPose('grab'); break;
      case 'thrown': this.setPose('launched'); break;
      case 'ko': this.setPose(this.airborne ? 'launched' : 'ko'); break;
      case 'win': this.setPose('win'); break;
      case 'intro': this.setPose('idle'); break;
    }
  }

  setKO() {
    this.state = 'ko'; this.attack = null; this.superActive = false; this.stun = 0; this.thrownBy = null;
    this.airborne = true; this.launched = true; this.vy = -11; this.y = Math.min(this.y, CFG.GROUND - 1);
    this.vx = -this.facing * 7;
  }
  setWin() { this.state = 'win'; this.attack = null; this.superActive = false; this.airborne = false; this.y = CFG.GROUND; }
}
