/* Torneio local de 4 ou 8 participantes (teclado compartilhado, vagas podem ser CPU).
   Chave eliminatória sorteada com Rng; lutas entre duas CPUs são simuladas na hora, sem desenhar. */
Game.prototype.startTournamentSetup = function () {
  this.tournament = { size: 8, slots: Array.from({ length: 8 }, (_, i) => ({ char: i % CHARACTERS.length, cpu: i > 1, name: T('Jogador {0}', i + 1) })), cursor: 0, bracket: null, round: 0, match: 0, champion: null };
  this.scene = 'tournamentSetup';
};
Game.prototype.updateTournamentSetup = function () {
  const t = this.tournament, rows = 1 + t.size + 1;   // tamanho, vagas, COMEÇAR
  if (this.backPressed()) { Audio_.play('back'); this.scene = 'title'; return; }
  if (this.menuUp()) { t.cursor = (t.cursor + rows - 1) % rows; Audio_.play('menu'); }
  if (this.menuDown()) { t.cursor = (t.cursor + 1) % rows; Audio_.play('menu'); }
  const left = this.menuLeft(), right = this.menuRight();
  if (t.cursor === 0 && (left || right)) { t.size = t.size === 8 ? 4 : 8; t.cursor = 0; Audio_.play('menu'); return; }
  if (t.cursor >= 1 && t.cursor <= t.size) {
    const s = t.slots[t.cursor - 1];
    if (left) { s.char = (s.char + CHARACTERS.length - 1) % CHARACTERS.length; Audio_.play('menu'); }
    if (right) { s.char = (s.char + 1) % CHARACTERS.length; Audio_.play('menu'); }
    if (this.anyPad('kick') || Input.pressed('Space')) { s.cpu = !s.cpu; Audio_.play('menu'); }
    if (this.anyPad('punch') || Input.pressed('Enter')) { t.cursor = Math.min(t.cursor + 1, rows - 1); Audio_.play('menu'); }
    return;
  }
  if (t.cursor === rows - 1 && this.confirmPressed()) { Audio_.play('confirm'); this.buildBracket(); }
};
Game.prototype.buildBracket = function () {
  const t = this.tournament;
  Rng.set((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
  const ids = t.slots.slice(0, t.size).map((_, i) => i);
  for (let i = ids.length - 1; i > 0; i--) { const j = Rng.int(0, i); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  const first = []; for (let i = 0; i < ids.length; i += 2) first.push({ a: ids[i], b: ids[i + 1], winner: null });
  t.bracket = [first]; t.round = 0; t.match = 0; t.champion = null;
  this.scene = 'bracket'; this.bracketT = 0;
};
Game.prototype.currentTournamentMatch = function () { const t = this.tournament; return t.bracket[t.round] && t.bracket[t.round][t.match]; };
Game.prototype.updateBracket = function () {
  this.bracketT = (this.bracketT || 0) + 1;
  const t = this.tournament;
  if (this.backPressed()) { Audio_.play('back'); this.scene = 'title'; return; }
  if (this.bracketT < 20 || !this.confirmPressed()) return;
  if (t.champion !== null) { Audio_.play('confirm'); this.scene = 'title'; return; }
  Audio_.play('confirm');
  this.startNextTournamentMatch();
};
Game.prototype.startNextTournamentMatch = function () {
  const t = this.tournament, m = this.currentTournamentMatch(); if (!m) return;
  const A = t.slots[m.a], B = t.slots[m.b];
  this.mode = 'tournament';
  this.select.p1 = A.char; this.select.p2 = B.char; this.select.skin1 = 0; this.select.skin2 = 0;
  this.stageIndex = Rng.int(0, STAGES.length - 1);
  this.modifiers = [];
  this.startMatch();
  this.fighters[0].isCPU = A.cpu; this.fighters[1].isCPU = B.cpu;
  this.fighters[0].aiLevel = this.fighters[1].aiLevel = 'normal';
  if (A.cpu && B.cpu) this.simulateCurrentMatch();
};
/* duas CPUs: resolve a luta sem desenhar */
Game.prototype.simulateCurrentMatch = function () {
  let guard = 0;
  while (this.scene === 'fight' && guard++ < 60000) { this.updateFight(); }
};
Game.prototype.onTournamentEnd = function (winner) {
  const t = this.tournament, m = this.currentTournamentMatch();
  m.winner = winner === this.fighters[0] ? m.a : m.b;
  t.match++;
  const roundMatches = t.bracket[t.round];
  if (t.match >= roundMatches.length) {
    const winners = roundMatches.map((x) => x.winner);
    if (winners.length === 1) {
      t.champion = winners[0];
      Save.data.tournament.champions.push({ date: dailyKey(), char: CHARACTERS[t.slots[t.champion].char].id, size: t.size }); Save.save();
    } else {
      const next = []; for (let i = 0; i < winners.length; i += 2) next.push({ a: winners[i], b: winners[i + 1], winner: null });
      t.bracket.push(next); t.round++; t.match = 0;
    }
  }
  this.mode = '2p'; this.scene = 'bracket'; this.bracketT = 0;
};

function drawTournamentSetup(ctx, game) {
  drawMenuBackdrop(ctx, game, 1);
  const t = game.tournament;
  txt(ctx, T('TORNEIO DAS QUATRO NAÇÕES'), CFG.W / 2, 56, { font: FONT_DISPLAY, size: 40, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  const x0 = 240, w = 800, y0 = 96, rh = 44;
  ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, x0 - 20, y0 - 10, w + 40, (t.size + 2) * rh + 20, 12); ctx.fill();
  const row = (i, label, value, sel, color) => {
    const y = y0 + i * rh + rh / 2;
    if (sel) { ctx.fillStyle = 'rgba(255,213,79,.16)'; roundRect(ctx, x0 - 8, y - rh / 2 + 3, w + 16, rh - 6, 6); ctx.fill(); }
    txt(ctx, label, x0, y, { size: 19, align: 'left', color: sel ? '#fff' : '#dfe7f2', weight: sel ? 700 : 400 });
    if (value) txt(ctx, (sel ? '◀  ' : '') + value + (sel ? '  ▶' : ''), x0 + w, y, { size: 19, align: 'right', color: color || (sel ? '#ffd54f' : '#dfe7f2') });
  };
  row(0, T('Participantes'), String(t.size), t.cursor === 0);
  for (let i = 0; i < t.size; i++) {
    const s = t.slots[i], ch = CHARACTERS[s.char];
    row(1 + i, `${s.name}  ${s.cpu ? '(' + T('CPU') + ')' : '(' + T('humano') + ')'}`, ch.name, t.cursor === 1 + i, ELEMENT_COLORS[ch.element]);
  }
  row(1 + t.size, '', '', false);
  txt(ctx, T('COMEÇAR'), x0 + w / 2, y0 + (1 + t.size) * rh + rh / 2, { font: FONT_DISPLAY, size: 26, color: t.cursor === 1 + t.size ? '#ffd54f' : '#cfd8dc' });
  txt(ctx, T('←/→ troca lutador ou tamanho · Espaço ou chute alterna humano/CPU · Enter avança · Esc volta'), CFG.W / 2, CFG.H - 36, { size: 15, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}

function drawBracket(ctx, game) {
  drawMenuBackdrop(ctx, game, 2);
  const t = game.tournament, rounds = Math.log2(t.size);
  txt(ctx, t.champion !== null ? T('CAMPEÃO!') : T('CHAVE DO TORNEIO'), CFG.W / 2, 56, { font: FONT_DISPLAY, size: 40, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  const colW = CFG.W / (rounds + 1), boxW = colW - 40;
  for (let r = 0; r <= rounds; r++) {
    const matches = r < rounds ? (t.bracket[r] || []) : [];
    const count = r < rounds ? t.size / Math.pow(2, r + 1) : 1;
    for (let i = 0; i < count; i++) {
      const cx = colW * r + colW / 2, slotH = 520 / count, cy = 120 + slotH * i + slotH / 2;
      const m = matches[i];
      const current = r === t.round && i === t.match && t.champion === null;
      if (r === rounds) {
        const champ = t.champion !== null ? t.slots[t.champion] : null;
        ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, cx - boxW / 2, cy - 36, boxW, 72, 8); ctx.fill();
        txt(ctx, champ ? `${champ.name} · ${CHARACTERS[champ.char].name}` : T('Campeão'), cx, cy, { size: 16, color: champ ? '#ffd54f' : '#9fb0bb' });
        continue;
      }
      ctx.fillStyle = current ? 'rgba(255,213,79,.18)' : 'rgba(0,0,0,.55)'; roundRect(ctx, cx - boxW / 2, cy - 36, boxW, 72, 8); ctx.fill();
      if (current) { ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2; roundRect(ctx, cx - boxW / 2, cy - 36, boxW, 72, 8); ctx.stroke(); }
      const line = (slot, y) => { if (slot === undefined || slot === null) { txt(ctx, '?', cx, y, { size: 14, color: '#9fb0bb' }); return; } const s = t.slots[slot], won = m && m.winner === slot, lost = m && m.winner !== null && m.winner !== slot;
        txt(ctx, `${s.name} · ${CHARACTERS[s.char].name}${s.cpu ? ' (CPU)' : ''}`, cx, y, { size: 14, color: won ? '#ffd54f' : lost ? '#777' : '#fff' }); };
      line(m ? m.a : null, cy - 15); line(m ? m.b : null, cy + 15);
    }
  }
  const m = game.currentTournamentMatch();
  const hint = t.champion !== null ? T('Enter para voltar ao menu') : m ? T('Enter inicia a próxima luta ({0} x {1}) · Esc abandona', t.slots[m.a].name, t.slots[m.b].name) : '';
  txt(ctx, hint, CFG.W / 2, CFG.H - 36, { size: 16, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}
