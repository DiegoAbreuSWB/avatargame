/* Lutador: física, máquina de estados, golpes, dano e bloqueio. */
class Fighter {
  constructor(char, side, game) {
    this.char = char;
    this.moves = buildMoveset(char);
    this.side = side;
    this.game = game;
    this.rounds = 0;
    this.isCPU = false;
    this.ai = null;
    this.reset(side === 0 ? 380 : CFG.W - 380, side === 0 ? 1 : -1);
  }

  reset(x, facing) {
    this.x = x; this.y = CFG.GROUND; this.vx = 0; this.vy = 0; this.facing = facing;
    this.hp = CFG.MAX_HP; this.chi = this.chi || 0;
    this.state = 'idle'; this.pose = 'idle'; this.poseT = 0; this.frame = 0; this.poseSmooth = 0.5;
    this.attack = null; this.attackFrame = 0; this.attackPhase = 0; this.hitsLeft = 0; this.hitCooldown = 0; this.volleyFired = 0;
    this.stun = 0; this.airborne = false; this.crouching = false; this.blocking = false;
    this.invulnFrames = 0; this.flash = 0; this.launched = false; this.superActive = false;
    this.pad = Input.emptyPad();
    this.combo = 0; this.comboTimer = 0; this.ai = null;
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
    return ['knockdown', 'getup', 'ko', 'win'].includes(this.state);
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

  setPose(p) { if (this.pose !== p) { this.pose = p; this.poseT = 0; } }

  update(pad, controlEnabled) {
    this.pad = pad; this.frame++; this.poseT++;
    if (this.flash > 0) this.flash--;
    if (this.invulnFrames > 0) this.invulnFrames--;
    if (this.hitCooldown > 0) this.hitCooldown--;
    if (this.comboTimer > 0) { this.comboTimer--; if (this.comboTimer === 0) this.combo = 0; }
    const opp = this.opponent;

    // física vertical
    if (this.airborne) {
      this.vy += CFG.GRAVITY * (this.launched ? 0.85 : 1);
      this.y += this.vy;
      if (this.y >= CFG.GROUND) { this.y = CFG.GROUND; this.vy = 0; this.airborne = false; this.onLand(); }
    }
    // empurrão horizontal residual (knockback)
    if (['hit', 'block', 'knockdown'].includes(this.state) || (this.airborne && this.launched)) {
      this.x += this.vx; this.vx *= this.airborne ? 0.99 : 0.82;
    } else if (this.state === 'jump' || (this.state === 'attack' && this.attack.air)) {
      this.x += this.vx;
    } else { this.vx = 0; }

    switch (this.state) {
      case 'hit': case 'block':
        if (!this.airborne) { this.stun--; if (this.stun <= 0) this.toNeutral(); }
        break;
      case 'knockdown':
        this.stun--; if (this.stun <= 0) { this.state = 'getup'; this.stun = 24; this.invulnFrames = 40; this.setPose('getup'); }
        break;
      case 'getup':
        this.stun--; if (this.stun <= 0) this.toNeutral();
        break;
      case 'attack': this.updateAttack(); break;
      case 'ko': case 'win': case 'intro': break;
      default: if (controlEnabled) this.control(pad);
    }

    // orientação: sempre encara o oponente quando está no chão e livre
    if (this.grounded && ['idle', 'walk', 'crouch'].includes(this.state)) this.facing = opp.x >= this.x ? 1 : -1;
    this.x = clamp(this.x, CFG.WALL_PAD, CFG.W - CFG.WALL_PAD);
    this.choosePose();
    updateJoints(this);
  }

  control(pad) {
    const opp = this.opponent;
    const dirToOpp = opp.x >= this.x ? 1 : -1;
    const fwd = dirToOpp === 1 ? pad.right : pad.left;
    const back = dirToOpp === 1 ? pad.left : pad.right;

    if (this.state === 'jump') {
      if (pad.punch) return this.startAttack(this.moves.jpunch);
      if (pad.kick) return this.startAttack(this.moves.jkick);
      return;
    }
    this.crouching = pad.down;
    this.blocking = back && !pad.punch && !pad.kick;

    // ataques (prioridade: super > especial 2 > especial > chute > soco)
    if (pad.super && this.chi >= CFG.MAX_CHI) return this.startAttack(this.moves.super);
    if (pad.special) return this.startAttack(pad.down ? this.moves.special2 : this.moves.special);
    if (pad.kick) return this.startAttack(pad.down ? this.moves.sweep : this.moves.kick);
    if (pad.punch) return this.startAttack(pad.down ? this.moves.cpunch : this.moves.punch);

    if (pad.down) { this.state = 'crouch'; return; }
    if (pad.upPressed) {
      this.airborne = true; this.vy = -this.char.jump; this.state = 'jump';
      this.vx = (pad.right ? 1 : pad.left ? -1 : 0) * this.char.speed * 0.95;
      Audio_.play('jump'); this.setPose('jump');
      return;
    }
    if (pad.left || pad.right) {
      const dir = pad.right ? 1 : -1;
      const speed = dir === dirToOpp ? this.char.speed : this.char.speed * 0.75;
      this.x += dir * speed; this.state = 'walk';
    } else this.state = 'idle';
  }

  startAttack(m) {
    if (!m) return;
    if (m.cost) { if (this.chi < m.cost) return; this.chi = 0; this.game.onSuper(this, m); }
    this.state = 'attack'; this.attack = m; this.attackFrame = 0; this.attackPhase = 0;
    this.hitsLeft = m.multi || 1; this.hitCooldown = 0; this.volleyFired = 0;
    this.blocking = false;
    if (!m.air) this.crouching = !!m.crouch;
    this.setPose(m.pose); this.poseSmooth = 0.6;
    if (!m.projectile && !m.projectiles && !m.volley) Audio_.play('whoosh');
  }

  updateAttack() {
    const m = this.attack; const af = ++this.attackFrame;
    const total = m.startup + m.active + m.recovery;
    if (af <= m.startup) this.attackPhase = af / m.startup;
    else if (af <= m.startup + m.active) this.attackPhase = 1;
    else this.attackPhase = 1 - (af - m.startup - m.active) / m.recovery;
    const active = af > m.startup && af <= m.startup + m.active;

    if (m.chargeFx && af < m.startup && af % 2 === 0) {
      Particles.element(m.chargeFx, this.x + this.facing * 40 + rand(-20, 20), this.y - 120 + rand(-30, 30), 2, { maxSpeed: 3 });
    }
    if (af === m.startup + 1) {
      if (m.projectile) this.game.spawnProjectile(this, m.projectile);
      if (m.projectiles) m.projectiles.forEach((p) => this.game.spawnProjectile(this, p));
      if (m.sound && (m.projectile || m.projectiles || m.volley || m.dash)) Audio_.play(m.sound);
      if (m.dash && m.dash.vy) { this.vy = m.dash.vy; this.airborne = true; }
      if (m.key === 'super') this.superActive = true;
    }
    if (m.volley && active && this.volleyFired < m.volley.count && (af - m.startup - 1) % m.volley.every === 0) {
      this.volleyFired++;
      const p = Object.assign({}, m.volley.projectile, { vy: (this.volleyFired % 3 - 1) * 1.5, y: m.volley.projectile.y - (this.volleyFired % 2) * 30 });
      this.game.spawnProjectile(this, p);
      Audio_.play('fire');
    }
    if (m.dash && active) {
      this.x += m.dash.vx * this.facing;
      if (m.trail && af % 2 === 0) Particles.element(m.trail, this.x - this.facing * 20, this.y - 80 + rand(-40, 40), 2, { maxSpeed: 3 });
    }
    if (m.key === 'super' && active && af % 4 === 0) Particles.element(this.char.element === 'nao' ? 'hit' : this.char.element, this.x + rand(-40, 40), this.y - rand(20, 160), 2, { maxSpeed: 4 });

    if (af >= total) this.endAttack();
  }

  endAttack() {
    this.attack = null; this.superActive = false; this.poseSmooth = 0.5;
    if (this.airborne) { this.state = 'jump'; this.launched = false; }
    else this.toNeutral();
  }

  toNeutral() {
    this.state = this.pad.down ? 'crouch' : 'idle';
    this.crouching = this.pad.down; this.launched = false; this.stun = 0;
  }

  onLand() {
    if (this.state === 'ko') return;
    if (this.launched || this.state === 'knockdown') {
      this.state = 'knockdown'; this.stun = 36; this.launched = false; this.vx *= 0.3;
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
    if (this.canBlock(data)) {
      const chip = fromProjectile ? (data.chip || 0) : 0;
      this.hp = Math.max(0, this.hp - chip);
      this.state = 'block'; this.stun = data.blockstun || 10; this.vx = dir * (data.knockback || 4) * 0.5;
      this.chi = Math.min(CFG.MAX_CHI, this.chi + 2);
      Audio_.play('block'); Particles.element('block', cx, cy, 8);
      this.game.hitstop = 2;
      if (this.hp <= 0) this.game.onKO(this, attacker);
      return 'block';
    }
    const dmg = data.damage || 0;
    this.hp = Math.max(0, this.hp - dmg);
    this.lastHitAt = this.game.t;
    this.flash = 5; this.stun = data.hitstun || 14; this.state = 'hit'; this.attack = null; this.superActive = false; this.blocking = false;
    const kb = (data.knockback || 4) / this.char.weight;
    this.vx = dir * kb * 0.9;
    const wasAirborne = this.airborne;
    if (data.launcher || data.knockdown || wasAirborne || (data.lastKnockdown && opts.isLast)) {
      this.airborne = true; this.launched = true;
      this.vy = data.launcher ? -15 : (wasAirborne && data.multi) ? -5 : wasAirborne ? -7 : -9;
      if (this.y >= CFG.GROUND - 1) this.y = CFG.GROUND - 1;
      this.crouching = false;
    }
    if (data.pull) this.vx = -dir * data.pull;
    this.chi = Math.min(CFG.MAX_CHI, this.chi + 3);
    attacker.chi = Math.min(CFG.MAX_CHI, attacker.chi + (data.chi || 5));
    attacker.combo = (this.comboTimer > 0 || this.stun > 0) ? attacker.combo + 1 : 1;
    this.comboTimer = 45;
    attacker.comboTimer = 45;
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
      case 'ko': this.setPose(this.airborne ? 'launched' : 'ko'); break;
      case 'win': this.setPose('win'); break;
      case 'intro': this.setPose('idle'); break;
    }
  }

  setKO() {
    this.state = 'ko'; this.attack = null; this.superActive = false; this.stun = 0;
    this.airborne = true; this.launched = true; this.vy = -11; this.y = Math.min(this.y, CFG.GROUND - 1);
    this.vx = -this.facing * 7;
  }
  setWin() { this.state = 'win'; this.attack = null; this.superActive = false; this.airborne = false; this.y = CFG.GROUND; }
}
