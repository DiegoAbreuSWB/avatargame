/* Gerenciador do jogo: cenas (título, seleção, cenário, luta, resultado, configurações), rounds e resolução de golpes.
   Modos de jogo: '2p' (dois jogadores), 'cpu' (contra a IA), 'training' (treino com boneco). */
const DUMMY_MODES = ['Parado', 'Bloqueando', 'Agachado', 'Pulando', 'CPU'];

class Game {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.scene = 'title'; this.t = 0;
    this.menuIndex = 0; this.mode = '2p';
    this.select = { p1: 0, p2: 2, p1Done: false, p2Done: false, timer: 0 };
    this.stageIndex = 0;
    this.fighters = []; this.projectiles = [];
    this.hitstop = 0; this.shake = 0; this.shakeX = 0; this.shakeY = 0;
    this.announce = null; this.paused = false; this.pauseIndex = 0;
    this.superFlash = 0; this.superUser = null; this.superName = '';
    this.round = 1; this.timer = CFG.ROUND_TIME; this.timerFrames = 0; this.infiniteTime = false;
    this.roundsToWin = CFG.ROUNDS_TO_WIN;
    this.phase = 'intro'; this.phaseT = 0; this.winner = null;
    this.r3d = null; this.use3D = false;
    this.seed = null; this.matchSeed = 0;           // seed fixa (testes/replays) ou sorteada por partida
    this.debug = false;                              // overlay de hitboxes (F1)
    this.training = { dummy: 0, chiInf: true, history: [], lastCombo: 0 };
    this.settingsIndex = 0; this.remap = null;
    this.prevPadA = Input.emptyPad();
  }
  get is3D() { return !!(this.r3d && this.use3D); }
  get p1PicksBoth() { return this.mode !== '2p'; }
  titleOptions() { return ['2 JOGADORES', '1 JOGADOR  vs  CPU', 'TREINO', 'CONTROLES', 'CONFIGURAÇÕES']; }

  /* ---------- utilidades ---------- */
  get stage() { return STAGES[this.stageIndex]; }
  anyPad(key) { return Input.pressed(KEYMAPS.p1[key]) || Input.pressed(KEYMAPS.p2[key]); }
  menuUp() { return this.anyPad('up') || Input.pressed('ArrowUp'); }
  menuDown() { return this.anyPad('down') || Input.pressed('ArrowDown'); }
  menuLeft() { return this.anyPad('left') || Input.pressed('ArrowLeft'); }
  menuRight() { return this.anyPad('right') || Input.pressed('ArrowRight'); }
  confirmPressed() { return Input.pressed('Enter') || Input.pressed('Space') || this.anyPad('punch'); }
  setAnnounce(text, frames, extra = {}) { this.announce = Object.assign({ text, timer: frames, max: frames }, extra); }
  shakeScreen(n) { this.shake = Math.max(this.shake, n); }
  spawnProjectile(owner, spec) {
    if (spec.exclusive !== false && this.projectiles.some((p) => p.owner === owner && p.exclusive && !p.dead)) return;
    const p = new Projectile(owner, owner.opponent, spec);
    this.projectiles.push(p);
    if (spec.type !== 'beam') Audio_.element(owner.char.element);
  }
  onSuper(f, m) {
    this.superFlash = 40; this.superUser = f; this.superName = m.name; this.hitstop = 14;
    Audio_.play('super'); Particles.element(f.char.element === 'nao' ? 'hit' : f.char.element, f.x, f.y - 90, 30, { maxSpeed: 9 });
  }
  onKO(loser, winner) {
    if (this.phase !== 'play') return;
    if (this.mode === 'training') { loser.hp = CFG.MAX_HP; loser.hpGhost = CFG.MAX_HP; return; }
    this.phase = 'ko'; this.phaseT = 0; this.winner = winner;
    loser.setKO();
    this.setAnnounce('K.O.', 130, { color: '#ff5252', size: 120 });
    Audio_.play('ko'); this.shakeScreen(12);
  }
  isThreatened(f) {
    const o = f.opponent;
    if (o.state === 'attack' && o.attack && o.attackFrame <= o.attack.startup + o.attack.active + 2 && Math.abs(o.x - f.x) < 280) return true;
    return this.projectiles.some((p) => p.owner !== f && p.active && Math.abs(p.x - f.x) < 320);
  }

  /* ---------- loop ---------- */
  update() {
    Input.beginFrame(); this.t++;
    if (Input.pressed('KeyM')) { Settings.data.sound = !Audio_.toggleMute(); Settings.save(); }
    if (Input.pressed('F1')) { this.debug = !this.debug; Settings.data.debug = this.debug; Settings.save(); }
    switch (this.scene) {
      case 'title': this.updateTitle(); break;
      case 'controls': if (Input.pressed('Escape') || Input.pressed('Enter')) { Audio_.play('back'); this.scene = 'title'; } break;
      case 'settings': this.updateSettings(); break;
      case 'remap': this.updateRemap(); break;
      case 'select': this.updateSelect(); break;
      case 'stage': this.updateStage(); break;
      case 'fight': this.updateFight(); break;
      case 'result': this.updateResult(); break;
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CFG.W, CFG.H);
    if (this.is3D) {
      try { this.r3d.render(this); }
      catch (e) { console.error('Falha no modo 3D, voltando ao 2D:', e); this.use3D = false; }
    }
    switch (this.scene) {
      case 'title': drawTitle(ctx, this); break;
      case 'controls': drawControls(ctx, this); break;
      case 'settings': drawSettings(ctx, this); break;
      case 'remap': drawRemap(ctx, this); break;
      case 'select': drawSelect(ctx, this); break;
      case 'stage': drawStageSelect(ctx, this); break;
      case 'fight': this.drawFight(ctx); break;
      case 'result': drawResult(ctx, this); break;
    }
    ctx.restore();
  }

  /* ---------- título ---------- */
  updateTitle() {
    const n = this.titleOptions().length;
    if (this.menuUp()) { this.menuIndex = (this.menuIndex + n - 1) % n; Audio_.play('menu'); }
    if (this.menuDown()) { this.menuIndex = (this.menuIndex + 1) % n; Audio_.play('menu'); }
    if (this.confirmPressed()) {
      Audio_.play('confirm');
      switch (this.menuIndex) {
        case 0: this.mode = '2p'; this.gotoSelect(); break;
        case 1: this.mode = 'cpu'; this.gotoSelect(); break;
        case 2: this.mode = 'training'; this.gotoSelect(); break;
        case 3: this.scene = 'controls'; break;
        case 4: this.scene = 'settings'; this.settingsIndex = 0; break;
      }
    }
  }
  gotoSelect() {
    this.select = { p1: 0, p2: 2, p1Done: false, p2Done: false, timer: 0 };
    this.scene = 'select';
  }

  /* ---------- seleção de personagem ---------- */
  moveCursor(key, map) {
    const cols = 3, n = CHARACTERS.length, rows = Math.ceil(n / cols);
    let i = this.select[key];
    if (Input.pressed(map.left)) i = i % cols === 0 ? Math.min(i + cols - 1, n - 1) : i - 1;
    if (Input.pressed(map.right)) i = (i % cols === cols - 1 || i === n - 1) ? i - (i % cols) : i + 1;
    if (Input.pressed(map.up)) i = i - cols < 0 ? Math.min(i + cols * (rows - 1), n - 1) : i - cols;
    if (Input.pressed(map.down)) i = i + cols >= n ? i % cols : i + cols;
    if (i !== this.select[key]) { this.select[key] = clamp(i, 0, n - 1); Audio_.play('menu'); }
  }
  updateSelect() {
    const s = this.select;
    if (Input.pressed('Escape')) {
      Audio_.play('back');
      if (s.p2Done) s.p2Done = false;
      else if (s.p1Done) s.p1Done = false;
      else this.scene = 'title';
      return;
    }
    if (s.p1Done && s.p2Done) { if (++s.timer > 40) this.scene = 'stage'; return; }
    if (!s.p1Done) {
      this.moveCursor('p1', KEYMAPS.p1);
      if (Input.pressed(KEYMAPS.p1.punch) || Input.pressed('Enter')) { s.p1Done = true; Audio_.play('confirm'); }
    } else if (this.p1PicksBoth && !s.p2Done) {
      this.moveCursor('p2', KEYMAPS.p1);
      if (Input.pressed(KEYMAPS.p1.kick)) s.p2 = Rng.int(0, CHARACTERS.length - 1);
      if (Input.pressed(KEYMAPS.p1.punch) || Input.pressed('Enter') || Input.pressed(KEYMAPS.p1.kick)) { s.p2Done = true; Audio_.play('confirm'); }
    }
    if (!this.p1PicksBoth && !s.p2Done) {
      this.moveCursor('p2', KEYMAPS.p2);
      if (Input.pressed(KEYMAPS.p2.punch) || (s.p1Done && Input.pressed('Enter') && !Input.pressed(KEYMAPS.p1.punch))) { s.p2Done = true; Audio_.play('confirm'); }
    }
  }

  /* ---------- seleção de cenário ---------- */
  updateStage() {
    if (Input.pressed('Escape')) { Audio_.play('back'); this.select.p2Done = false; this.select.timer = 0; this.scene = 'select'; return; }
    const n = STAGES.length;
    if (this.menuLeft()) { this.stageIndex = (this.stageIndex + n - 1) % n; Audio_.play('menu'); }
    if (this.menuRight()) { this.stageIndex = (this.stageIndex + 1) % n; Audio_.play('menu'); }
    if (this.confirmPressed()) { Audio_.play('confirm'); this.startMatch(); }
  }

  /* ---------- luta ---------- */
  startMatch() {
    const c1 = CHARACTERS[this.select.p1], c2 = CHARACTERS[this.select.p2];
    this.matchSeed = this.seed != null ? this.seed : ((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
    Rng.set(this.matchSeed);
    this.fighters = [new Fighter(c1, 0, this), new Fighter(c2, 1, this)];
    const cpu = this.fighters[1];
    cpu.isCPU = this.mode !== '2p';
    cpu.aiLevel = this.aiLevelOverride || Settings.data.difficulty;
    this.fighters[0].aiLevel = cpu.aiLevel;
    this.fighters.forEach((f) => { f.rounds = 0; f.chi = 0; f.hpGhost = CFG.MAX_HP; });
    this.roundsToWin = this.mode === 'training' ? 99 : Settings.data.roundsToWin;
    this.infiniteTime = this.mode === 'training' || Settings.data.roundTime === 0;
    this.round = 1; this.winner = null; this.paused = false;
    this.training.history = []; this.training.lastCombo = 0;
    this.scene = 'fight';
    this.startRound();
  }
  startRound() {
    const [a, b] = this.fighters;
    a.reset(380, 1); b.reset(CFG.W - 380, -1);
    a.hpGhost = b.hpGhost = CFG.MAX_HP;
    a.state = b.state = 'intro';
    this.projectiles = []; Particles.clear();
    this.timer = this.infiniteTime ? 0 : Settings.data.roundTime; this.timerFrames = 0;
    this.phase = 'intro'; this.phaseT = 0; this.hitstop = 0; this.shake = 0; this.superFlash = 0;
    const final = a.rounds === this.roundsToWin - 1 && b.rounds === this.roundsToWin - 1;
    const label = this.mode === 'training' ? 'TREINO' : final ? 'ROUND FINAL' : `ROUND ${this.round}`;
    this.setAnnounce(label, 70, { sub: this.stage.name });
    Audio_.play('round');
  }

  dummyPad(dummy, me) {
    const pad = Input.emptyPad();
    const opp = me.opponent, back = opp.x >= me.x ? 'left' : 'right';
    switch (DUMMY_MODES[this.training.dummy]) {
      case 'Bloqueando': pad[back] = true; break;
      case 'Agachado': pad.down = true; pad[back] = true; break;
      case 'Pulando': if (me.grounded && this.t % 40 === 0) { pad.upPressed = true; pad.up = true; } break;
      case 'CPU': return AI.update(dummy, me, this);
    }
    return pad;
  }
  recordInput(pad) {
    const prev = this.prevPadA, h = this.training.history;
    const push = (sym) => { h.push({ sym, t: this.t }); if (h.length > 16) h.shift(); };
    for (const [k, sym] of [['left', '←'], ['right', '→'], ['up', '↑'], ['down', '↓']]) if (pad[k] && !prev[k]) push(sym);
    for (const [k, sym] of [['punch', 'S'], ['kick', 'C'], ['special', 'E'], ['super', 'U']]) if (pad[k]) push(sym);
    this.prevPadA = pad;
  }

  updateFight() {
    if (this.paused) return this.updatePause();
    if (Input.pressed('Escape') && this.phase === 'play') { this.paused = true; this.pauseIndex = 0; Audio_.play('menu'); return; }
    const training = this.mode === 'training';
    if (training) {
      if (Input.pressed('F2')) { this.training.dummy = (this.training.dummy + 1) % DUMMY_MODES.length; Audio_.play('menu'); }
      if (Input.pressed('F3')) { const [a, b] = this.fighters; a.reset(380, 1); b.reset(CFG.W - 380, -1); a.hp = b.hp = a.hpGhost = b.hpGhost = CFG.MAX_HP; this.projectiles = []; Audio_.play('menu'); }
      if (Input.pressed('F4')) { this.training.chiInf = !this.training.chiInf; Audio_.play('menu'); }
    }

    if (this.announce && --this.announce.timer <= 0) this.announce = null;
    if (this.superFlash > 0) this.superFlash--;
    if (this.shake > 0) { this.shake *= 0.85; if (this.shake < 0.5) this.shake = 0; }
    this.shakeX = rand(-this.shake, this.shake); this.shakeY = rand(-this.shake, this.shake);
    for (const f of this.fighters) f.hpGhost = f.hpGhost > f.hp ? Math.max(f.hp, f.hpGhost - 0.6) : f.hp;

    // fases do round
    this.phaseT++;
    if (this.phase === 'intro') {
      if (this.phaseT === 70) this.setAnnounce('LUTEM!', 45, { color: '#ff7043' });
      if (this.phaseT >= 100) { this.phase = 'play'; this.fighters.forEach((f) => { f.state = 'idle'; }); }
    } else if (this.phase === 'play') {
      if (!this.infiniteTime && ++this.timerFrames >= CFG.FPS) { this.timerFrames = 0; this.timer--; if (this.timer <= 0) this.onTimeout(); }
    } else if (this.phase === 'ko' || this.phase === 'timeout') {
      if (this.phaseT === 80 && this.winner) { this.winner.setWin(); Audio_.play('win'); }
      if (this.phaseT === 81 && this.winner) this.winner.rounds++;
      if (this.phaseT >= 190) this.nextRound();
    }

    if (this.hitstop > 0) { this.hitstop--; Particles.update(); return; }
    const slow = this.phase === 'ko' && this.phaseT < 60 && this.t % 3 !== 0;
    if (slow) { Particles.update(); return; }

    const [a, b] = this.fighters;
    const control = this.phase === 'play';
    // fontes de entrada: teclado por padrão; padSourceA/B permitem injetar entradas (testes, toque, online)
    const padA = control ? (a.isCPU ? AI.update(a, b, this) : this.padSourceA ? this.padSourceA() : Input.readPad(KEYMAPS.p1)) : Input.emptyPad();
    let padB;
    if (!control) padB = Input.emptyPad();
    else if (training) padB = this.dummyPad(b, a);
    else padB = b.isCPU ? AI.update(b, a, this) : this.padSourceB ? this.padSourceB() : Input.readPad(KEYMAPS.p2);
    if (training && control) {
      this.recordInput(padA);
      if (this.training.chiInf) a.chi = CFG.MAX_CHI;
      for (const f of this.fighters) if (f.hp < CFG.MAX_HP && this.t - (f.lastHitAt || 0) > 100 && f.canAct) { f.hp = CFG.MAX_HP; f.hpGhost = CFG.MAX_HP; }
      if (a.combo > this.training.lastCombo) this.training.lastCombo = a.combo;
      if (a.combo === 0 && b.canAct) this.training.lastCombo = this.training.lastCombo; // mantém o último até o próximo combo
    }
    a.update(padA, control); b.update(padB, control);
    this.separate(a, b);

    for (const p of this.projectiles) p.update();
    if (control || this.phase === 'ko') this.resolveHits();
    this.projectiles = this.projectiles.filter((p) => !p.dead);
    Particles.update();
  }

  separate(a, b) {
    if (['knockdown', 'ko'].includes(a.state) || ['knockdown', 'ko'].includes(b.state)) return;
    if (!rectsOverlap(a.pushbox, b.pushbox)) return;
    const left = a.x <= b.x ? a : b, right = left === a ? b : a;
    const d = 56 - (right.x - left.x);
    if (d <= 0) return;
    left.x -= d / 2; right.x += d / 2;
    if (left.x < CFG.WALL_PAD) { right.x += CFG.WALL_PAD - left.x; left.x = CFG.WALL_PAD; }
    if (right.x > CFG.W - CFG.WALL_PAD) { left.x -= right.x - (CFG.W - CFG.WALL_PAD); right.x = CFG.W - CFG.WALL_PAD; }
  }

  resolveHits() {
    // golpes corpo a corpo
    for (const f of this.fighters) {
      const hb = f.hitbox; if (!hb) continue;
      const o = f.opponent;
      if (o.isInvulnerable || o.state === 'ko') continue;
      const ob = o.hurtbox;
      if (!rectsOverlap(hb, ob)) continue;
      const cx = (Math.max(hb.x, ob.x) + Math.min(hb.x + hb.w, ob.x + ob.w)) / 2;
      const cy = (Math.max(hb.y, ob.y) + Math.min(hb.y + hb.h, ob.y + ob.h)) / 2;
      const isLast = f.hitsLeft <= 1;
      f.hitsLeft--; f.hitCooldown = f.attack.hitInterval || 8;
      // postura de contra-ataque (parry): o defensor devolve o golpe
      if (o.counterStance === 'melee') {
        f.hitsLeft = 0;
        f.receiveHit(o, { damage: o.attack.counterDamage || 10, hitstun: 30, knockback: 9, knockdown: true, chi: 10 }, cx, cy, {});
        o.endAttack(); this.setAnnounce('CONTRA-ATAQUE!', 45, { size: 44, color: '#ffd54f', y: 240 });
        continue;
      }
      const res = o.receiveHit(f, f.attack, cx, cy, { isLast });
      if (res === 'hit' || res === 'block') f.attackConnected = true;
    }
    // projéteis contra lutadores
    for (const p of this.projectiles) {
      if (!p.active || p.hitsLeft <= 0 || p.hitCooldown > 0) continue;
      const o = p.target;
      if (o.isInvulnerable || o.state === 'ko') continue;
      if (p.groundOnly && o.airborne) continue;
      const pb = p.box, ob = o.hurtbox;
      if (!rectsOverlap(pb, ob)) continue;
      const cx = (Math.max(pb.x, ob.x) + Math.min(pb.x + pb.w, ob.x + ob.w)) / 2;
      const cy = (Math.max(pb.y, ob.y) + Math.min(pb.y + pb.h, ob.y + ob.h)) / 2;
      // postura de redirecionamento: o projétil volta contra quem o lançou
      if (o.counterStance === 'projectile' && !GROUND_TYPES.has(p.type) && p.type !== 'vortex' && p.type !== 'beam') {
        const old = p.owner; p.owner = o; p.target = old; p.facing = -p.facing; p.vx = -p.vx * 1.15; p.damage = Math.round(p.damage * 1.5);
        p.hitsLeft = 1; p.hitCooldown = 6; p.life = Math.max(p.life, 90); p.returning = false;
        Particles.element('raio', p.x, p.y, 14); Audio_.play('lightning');
        this.setAnnounce('REDIRECIONADO!', 45, { size: 44, color: '#9be7ff', y: 240 });
        continue;
      }
      const isLast = p.hitsLeft <= 1;
      p.hitsLeft--; p.hitCooldown = p.multi ? 8 : 9999;
      const res = o.receiveHit(p.owner, p, cx, cy, { fromProjectile: true, isLast });
      if (p.owner.state === 'attack') p.owner.attackConnected = true;
      Particles.element(p.type === 'ice' ? 'gelo' : p.type === 'beam' ? 'raio' : p.owner.char.element, cx, cy, res === 'hit' ? 12 : 6);
      if (!p.pierce && !p.multi) p.dead = true;
      if (p.returning && !p.returnPhase) { p.returnPhase = true; p.hitsLeft = 1; p.hitCooldown = 20; }
    }
    // golpes corpo a corpo destroem projéteis que podem ser cancelados
    for (const f of this.fighters) {
      const hb = f.hitbox; if (!hb) continue;
      for (const p of this.projectiles) {
        if (p.owner === f || !p.active || !p.cancels || p.dead) continue;
        if (rectsOverlap(hb, p.box)) { p.dead = true; Particles.element('hit', p.x, p.y, 10); Audio_.play('block'); }
      }
    }
    // projétil contra projétil
    for (let i = 0; i < this.projectiles.length; i++) for (let j = i + 1; j < this.projectiles.length; j++) {
      const p = this.projectiles[i], q = this.projectiles[j];
      if (p.owner === q.owner || !p.active || !q.active || p.dead || q.dead) continue;
      if (!p.cancels && !q.cancels) continue;
      if (rectsOverlap(p.box, q.box)) {
        if (p.cancels) p.dead = true; if (q.cancels) q.dead = true;
        Particles.element('hit', (p.x + q.x) / 2, (p.y + q.y) / 2, 16); Audio_.play('hitHeavy');
      }
    }
  }

  onTimeout() {
    if (this.phase !== 'play') return;
    const [a, b] = this.fighters;
    this.phase = 'timeout'; this.phaseT = 0;
    this.winner = a.hp > b.hp ? a : b.hp > a.hp ? b : null;
    this.setAnnounce('TEMPO!', 120, { color: '#ffd54f' });
    if (this.winner) { const l = this.fighters[1 - this.winner.side]; l.state = 'knockdown'; l.stun = 9999; l.airborne = false; l.y = CFG.GROUND; }
    Audio_.play('ko');
  }

  nextRound() {
    const w = this.fighters.find((f) => f.rounds >= this.roundsToWin);
    if (w) { this.winner = w; this.scene = 'result'; this.resultT = 0; Audio_.play('win'); return; }
    this.round++;
    this.startRound();
  }

  updatePause() {
    if (this.menuUp()) { this.pauseIndex = (this.pauseIndex + 2) % 3; Audio_.play('menu'); }
    if (this.menuDown()) { this.pauseIndex = (this.pauseIndex + 1) % 3; Audio_.play('menu'); }
    if (Input.pressed('Escape')) { this.paused = false; return; }
    if (Input.pressed('Enter') || this.anyPad('punch')) {
      Audio_.play('confirm');
      if (this.pauseIndex === 0) this.paused = false;
      else if (this.pauseIndex === 1) this.startMatch();
      else { this.paused = false; this.scene = 'title'; }
    }
  }

  updateResult() {
    this.resultT = (this.resultT || 0) + 1;
    if (this.resultT < 30) return;
    if (Input.pressed('Enter') || this.anyPad('punch')) { Audio_.play('confirm'); this.startMatch(); }
    if (Input.pressed('Escape')) { Audio_.play('back'); this.select.p1Done = this.select.p2Done = false; this.select.timer = 0; this.scene = 'select'; }
  }

  drawFight(ctx) {
    const st = this.stage;
    if (!this.is3D) {
      ctx.save();
      ctx.translate(this.shakeX, this.shakeY);
      st.draw(ctx, this.t); st.drawFloor(ctx);
      for (const p of this.projectiles) if (GROUND_TYPES.has(p.type) || p.type === 'wave') p.draw(ctx);
      const order = this.fighters.slice().sort((a, b) => (a.state === 'attack' ? 1 : 0) - (b.state === 'attack' ? 1 : 0));
      for (const f of order) drawFighter(ctx, f, st);
      for (const p of this.projectiles) if (!GROUND_TYPES.has(p.type) && p.type !== 'wave') p.draw(ctx);
      Particles.draw(ctx);
      ctx.restore();
    }
    if (this.debug) drawDebug(ctx, this);
    drawSuperFlash(ctx, this);
    drawHUD(ctx, this);
    if (this.mode === 'training') drawTraining(ctx, this);
    drawAnnouncement(ctx, this);
    if (this.paused) drawPauseMenu(ctx, this);
  }
}
