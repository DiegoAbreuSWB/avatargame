/* Desafio diário: uma luta fixa por dia (lutadores, cenário, regras e semente derivados da data).
   Todo mundo que jogar no mesmo dia enfrenta exatamente o mesmo desafio; o melhor placar fica salvo. */
function dailyKey(d = new Date()) { return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`; }

Game.prototype.dailyChallenge = function () {
  const key = dailyKey();
  if (this._daily && this._daily.key === key) return this._daily;
  const seed = parseInt(key, 10);
  Rng.set(seed * 7919);
  const n = CHARACTERS.length;
  const p1 = Rng.int(0, n - 1); let p2 = Rng.int(0, n - 2); if (p2 >= p1) p2++;
  const stage = Rng.int(0, STAGES.length - 1);
  const pool = MODIFIERS.filter((m) => !['superInfinito', 'vidaContinua'].includes(m.id)).map((m) => m.id);
  const mods = [Rng.pick(pool)]; if (Rng.chance(0.4)) { const extra = Rng.pick(pool); if (!mods.includes(extra)) mods.push(extra); }
  this._daily = { key, seed, p1, p2, stage, mods };
  return this._daily;
};

Game.prototype.startDaily = function () {
  const d = this.dailyChallenge();
  this.mode = 'daily';
  this.select.p1 = d.p1; this.select.p2 = d.p2; this.select.skin1 = 0; this.select.skin2 = 0; this.stageIndex = d.stage;
  this.modifiers = d.mods.slice();
  this.aiLevelOverride = 'hard';
  this.seed = d.seed; this.startMatch(); this.seed = null;
};

Game.prototype.onDailyEnd = function (winner) {
  const d = this.dailyChallenge(), me = this.fighters[0], won = winner === me;
  const score = won ? 1000 + me.hp * 10 + (this.infiniteTime ? 0 : this.timer * 5) + (me.rounds - this.fighters[1].rounds) * 300 : Math.max(0, me.stats.damage * 3);
  const rec = Save.data.daily[d.key] || { best: 0, won: false, tries: 0 };
  rec.tries++; rec.won = rec.won || won; rec.best = Math.max(rec.best, score);
  Save.data.daily[d.key] = rec; Save.save();
  this.dailyResult = { won, score };
  this.aiLevelOverride = null; this.modifiers = [];
  this.scene = 'daily'; this.dailyT = 0;
};

Game.prototype.updateDaily = function () {
  this.dailyT = (this.dailyT || 0) + 1;
  if (this.backPressed()) { Audio_.play('back'); this.dailyResult = null; this.scene = 'title'; return; }
  if (this.dailyT > 20 && this.confirmPressed()) { Audio_.play('confirm'); this.dailyResult = null; this.startDaily(); }
};

function drawDaily(ctx, game) {
  const d = game.dailyChallenge(), rec = Save.data.daily[d.key] || { best: 0, won: false, tries: 0 };
  const a = CHARACTERS[d.p1], b = CHARACTERS[d.p2];
  drawMenuBackdrop(ctx, game, d.stage);
  txt(ctx, T('DESAFIO DIÁRIO'), CFG.W / 2, 64, { font: FONT_DISPLAY, size: 44, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  const date = `${d.key.slice(6, 8)}/${d.key.slice(4, 6)}/${d.key.slice(0, 4)}`;
  txt(ctx, T('Desafio de {0}: o mesmo para todo mundo hoje', date), CFG.W / 2, 104, { size: 16, color: '#cfd8dc', weight: 400, stroke: 'rgba(0,0,0,.8)' });
  if (!game.is3D) {
    drawFigureAt(ctx, a, 360, 520, 1.2, 'idle', game.t, 1, { staff: false });
    drawFigureAt(ctx, b, CFG.W - 360, 520, 1.2, 'idle', game.t + 20, -1, { staff: false });
  }
  txt(ctx, 'VS', CFG.W / 2, 330, { font: FONT_DISPLAY, size: 80, weight: 900, color: '#fff', stroke: '#000', strokeWidth: 8 });
  txt(ctx, T('Você: {0}', a.name).toUpperCase(), 360, 580, { font: FONT_DISPLAY, size: 26, color: '#f2a93b', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, b.name.toUpperCase(), CFG.W - 360, 580, { font: FONT_DISPLAY, size: 26, color: '#4fc3f7', stroke: 'rgba(0,0,0,.9)' });
  const mods = d.mods.map((id) => T(MODIFIERS.find((m) => m.id === id).name)).join(' + ');
  txt(ctx, `${T(STAGES[d.stage].name)}  ·  CPU ${T('Difícil')}  ·  ${mods}`, CFG.W / 2, 400, { size: 18, color: '#dfe7f2', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, T('Melhor placar de hoje: {0}  ·  Tentativas: {1}', rec.best, rec.tries) + (rec.won ? '  ·  ' + T('Vencido!') : ''), CFG.W / 2, 432, { size: 18, color: '#ffd54f', stroke: 'rgba(0,0,0,.9)' });
  if (game.dailyResult) txt(ctx, game.dailyResult.won ? T('Vitória! Placar: {0}', game.dailyResult.score) : T('Derrota. Placar: {0}', game.dailyResult.score), CFG.W / 2, 470, { font: FONT_DISPLAY, size: 28, color: game.dailyResult.won ? '#80deea' : '#ff8a65', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, T('Enter para lutar · Esc para voltar'), CFG.W / 2, CFG.H - 40, { size: 16, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}
