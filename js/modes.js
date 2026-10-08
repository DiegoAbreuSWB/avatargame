/* Modos Arcade e Sobrevivência (métodos adicionados à classe Game).
   Arcade: escada de 6 oponentes + chefe, dificuldade crescente, pontuação e final por personagem.
   Sobrevivência: oponentes sem fim, vida recupera só em parte, recorde salvo no navegador. */
const ARCADE_FIGHTS = 7;

Game.prototype.startArcade = function () {
  const me = CHARACTERS[this.select.p1];
  Rng.set((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
  const pool = CHARACTERS.filter((c) => c.id !== me.id && !c.boss);
  for (let i = pool.length - 1; i > 0; i--) { const j = Rng.int(0, i); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const boss = me.id === 'ozai' ? getCharacter('azula') : getCharacter('ozai');
  const ladder = pool.slice(0, ARCADE_FIGHTS - 1).concat([boss]);
  this.arcade = { ladder: ladder.map((c) => c.id), index: 0, score: 0, continues: 0 };
  this.gotoLadder();
};

Game.prototype.startSurvival = function () {
  Rng.set((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
  this.survival = { wins: 0, hpCarry: CFG.MAX_HP, chiCarry: 0, best: parseInt(loadSetting('survivalBest') || '0', 10) };
  this.gotoLadder();
};

Game.prototype.currentOpponentId = function () {
  if (this.mode === 'arcade') return this.arcade.ladder[this.arcade.index];
  const me = CHARACTERS[this.select.p1];
  if (!this.survival.nextId) {
    const pool = CHARACTERS.filter((c) => c.id !== me.id && c.id !== this.survival.lastId);
    this.survival.nextId = Rng.pick(pool).id;
  }
  return this.survival.nextId;
};

Game.prototype.gotoLadder = function () {
  const oppId = this.currentOpponentId();
  this.select.p2 = CHARACTERS.findIndex((c) => c.id === oppId);
  this.stageIndex = Rng.int(0, STAGES.length - 1);
  const n = this.mode === 'arcade' ? this.arcade.index : this.survival.wins;
  this.aiLevelOverride = n < 2 ? 'easy' : n < 4 ? 'normal' : 'hard';
  if (this.mode === 'arcade' && this.arcade.index === ARCADE_FIGHTS - 1) this.aiLevelOverride = 'hard';
  this.ladderT = 0;
  this.scene = 'ladder';
};

Game.prototype.updateLadder = function () {
  this.ladderT++;
  if (Input.pressed('Escape')) { Audio_.play('back'); this.aiLevelOverride = null; this.scene = 'title'; return; }
  if (this.ladderT > 20 && (this.confirmPressed() || this.ladderT > 300)) {
    Audio_.play('confirm');
    this.startMatch();
    if (this.mode === 'survival') { const a = this.fighters[0]; a.hp = this.survival.hpCarry; a.hpGhost = a.hp; a.chi = this.survival.chiCarry; }
    if (this.mode === 'arcade' && this.arcade.index === ARCADE_FIGHTS - 1) { const b = this.fighters[1]; b.maxHp = 130; b.hp = 130; b.hpGhost = 130; }
  }
};

/* chamado por nextRound quando a partida termina em Arcade/Sobrevivência */
Game.prototype.onMatchEnd = function (winner) {
  const me = this.fighters[0], won = winner === me;
  if (this.mode === 'arcade') {
    if (won) {
      this.arcade.score += 1000 + me.hp * 10 + (this.infiniteTime ? 0 : this.timer * 5) + (me.rounds - this.fighters[1].rounds) * 300;
      this.arcade.index++;
      if (this.arcade.index >= ARCADE_FIGHTS) { this.scene = 'ending'; this.endingT = 0; this.aiLevelOverride = null; Audio_.play('win'); return; }
      this.gotoLadder();
    } else { this.scene = 'continue'; this.continueT = 0; this.continueIndex = 0; }
    return;
  }
  if (this.mode === 'survival') {
    if (won) {
      this.survival.wins++;
      this.survival.hpCarry = Math.min(me.maxHp, me.hp + 30);
      this.survival.chiCarry = me.chi;
      this.survival.lastId = this.survival.nextId; this.survival.nextId = null;
      if (this.survival.wins > this.survival.best) { this.survival.best = this.survival.wins; saveSetting('survivalBest', String(this.survival.wins)); }
      this.gotoLadder();
    } else { this.scene = 'survivalEnd'; this.endingT = 0; this.aiLevelOverride = null; }
  }
};

Game.prototype.updateContinue = function () {
  this.continueT++;
  if (this.menuUp() || this.menuDown()) { this.continueIndex = 1 - this.continueIndex; Audio_.play('menu'); }
  if (this.continueT > 20 && this.confirmPressed()) {
    Audio_.play('confirm');
    if (this.continueIndex === 0) { this.arcade.continues++; this.arcade.score = Math.floor(this.arcade.score * 0.5); this.gotoLadder(); }
    else { this.aiLevelOverride = null; this.scene = 'title'; }
  }
  if (Input.pressed('Escape')) { Audio_.play('back'); this.aiLevelOverride = null; this.scene = 'title'; }
};

Game.prototype.updateEnding = function () {
  this.endingT++;
  if (this.endingT > 40 && (this.confirmPressed() || Input.pressed('Escape'))) { Audio_.play('confirm'); this.scene = 'title'; }
};

/* ----- desenho ----- */
function drawLadder(ctx, game) {
  const opp = CHARACTERS[game.select.p2], me = CHARACTERS[game.select.p1];
  drawMenuBackdrop(ctx, game, game.stageIndex);
  const arcade = game.mode === 'arcade';
  const n = arcade ? game.arcade.index + 1 : game.survival.wins + 1;
  const title = arcade ? (game.arcade.index === ARCADE_FIGHTS - 1 ? T('LUTA FINAL') : T('LUTA {0} DE {1}', n, ARCADE_FIGHTS)) : T('OPONENTE {0}', n);
  txt(ctx, title, CFG.W / 2, 70, { font: FONT_DISPLAY, size: 44, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  if (!game.is3D) {
    drawFigureAt(ctx, me, 360, 520, 1.2, 'idle', game.t, 1, { staff: false });
    drawFigureAt(ctx, opp, CFG.W - 360, 520, 1.2, 'idle', game.t + 20, -1, { staff: false });
  }
  txt(ctx, 'VS', CFG.W / 2, 330, { font: FONT_DISPLAY, size: 80, weight: 900, color: '#fff', stroke: '#000', strokeWidth: 8 });
  txt(ctx, me.name.toUpperCase(), 360, 580, { font: FONT_DISPLAY, size: 30, color: '#f2a93b', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, opp.name.toUpperCase(), CFG.W - 360, 580, { font: FONT_DISPLAY, size: 30, color: opp.boss ? '#ff5252' : '#4fc3f7', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, T(opp.title), CFG.W - 360, 608, { size: 16, color: '#dfe7f2', stroke: 'rgba(0,0,0,.9)', weight: 400 });
  const diff = T({ easy: 'Fácil', normal: 'Normal', hard: 'Difícil' }[game.aiLevelOverride] || 'Normal');
  txt(ctx, `${T(STAGES[game.stageIndex].name)}  ·  CPU ${diff}`, CFG.W / 2, 400, { size: 18, color: '#dfe7f2', stroke: 'rgba(0,0,0,.9)' });
  if (arcade) txt(ctx, T('Pontuação: {0}', game.arcade.score), CFG.W / 2, 430, { size: 18, color: '#ffd54f', stroke: 'rgba(0,0,0,.9)' });
  else txt(ctx, T('Vitórias: {0}  ·  Recorde: {1}  ·  Vida: {2}', game.survival.wins, game.survival.best, game.survival.hpCarry), CFG.W / 2, 430, { size: 18, color: '#ffd54f', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, T('Enter para lutar · Esc para desistir'), CFG.W / 2, CFG.H - 40, { size: 16, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}

function drawContinue(ctx, game) {
  drawMenuBackdrop(ctx, game, game.stageIndex);
  txt(ctx, T('CONTINUAR?'), CFG.W / 2, 220, { font: FONT_DISPLAY, size: 72, color: '#ff5252', stroke: '#3b0000', strokeWidth: 8 });
  const opts = [T('Sim (a pontuação cai pela metade)'), T('Não, voltar ao menu')];
  opts.forEach((o, i) => { const sel = i === game.continueIndex; txt(ctx, (sel ? '▶  ' : '') + o, CFG.W / 2, 330 + i * 50, { size: 26, color: sel ? '#fff' : '#aaa' }); });
  txt(ctx, T('Pontuação atual: {0}  ·  Continues usados: {1}', game.arcade.score, game.arcade.continues), CFG.W / 2, 470, { size: 16, color: '#dfe7f2' });
}

function drawEnding(ctx, game) {
  const me = CHARACTERS[game.select.p1];
  drawMenuBackdrop(ctx, game, game.stageIndex);
  if (!game.is3D) drawFigureAt(ctx, me, 300, 600, 1.5, 'win', game.t, 1, { staff: false });
  txt(ctx, T('ARCADE CONCLUÍDO'), CFG.W / 2 + 120, 90, { font: FONT_DISPLAY, size: 44, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  const lines = ENDINGS[me.id] || ['Fim.'];
  const shown = Math.min(lines.length, Math.floor(game.endingT / 90) + 1);
  ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, 480, 150, 740, 60 + lines.length * 44, 12); ctx.fill();
  for (let i = 0; i < shown; i++) {
    const alpha = Math.min(1, (game.endingT - i * 90) / 30);
    wrapText(ctx, lines[i], 850, 190 + i * 44, 700, 19, '#fff', alpha);
  }
  txt(ctx, T('{0} · Pontuação final: {1}', me.name, game.arcade.score) + (game.arcade.continues ? T(' · continues: {0}', game.arcade.continues) : ''), CFG.W / 2 + 120, 150 + 60 + lines.length * 44 + 30, { size: 18, color: '#ffd54f', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, T('Enter para voltar ao menu'), CFG.W / 2, CFG.H - 40, { size: 16, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}

function drawSurvivalEnd(ctx, game) {
  drawMenuBackdrop(ctx, game, game.stageIndex);
  const s = game.survival;
  txt(ctx, T('FIM DA SOBREVIVÊNCIA'), CFG.W / 2, 200, { font: FONT_DISPLAY, size: 56, color: '#ff5252', stroke: '#3b0000', strokeWidth: 8 });
  txt(ctx, T('{0} vitória{1} seguida{1}', s.wins, s.wins === 1 ? '' : 's'), CFG.W / 2, 300, { font: FONT_DISPLAY, size: 40, color: '#fff', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, s.wins >= s.best && s.wins > 0 ? T('NOVO RECORDE!') : T('Recorde: {0}', s.best), CFG.W / 2, 360, { size: 24, color: '#ffd54f', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, T('Enter para voltar ao menu'), CFG.W / 2, CFG.H - 40, { size: 16, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}

function wrapText(ctx, text, cx, y, maxW, size, color, alpha = 1) {
  ctx.save(); ctx.font = `400 ${size}px ${FONT_BODY}`;
  const words = text.split(' '); const lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  ctx.restore();
  lines.forEach((l, i) => txt(ctx, l, cx, y + i * (size + 6), { size, color, weight: 400, alpha, stroke: 'rgba(0,0,0,.8)' }));
}
