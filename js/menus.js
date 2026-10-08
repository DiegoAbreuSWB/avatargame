/* Telas de menu: título, seleção de personagem, seleção de cenário, resultado e controles.
   No modo 3D o cenário e os lutadores são renderizados pelo Renderer3D; aqui só desenhamos textos e molduras. */

function drawMenuBackdrop(ctx, game, stageIdx) {
  if (game.is3D) { ctx.fillStyle = 'rgba(8,10,18,.5)'; ctx.fillRect(0, 0, CFG.W, CFG.H); return; }
  const st = STAGES[stageIdx % STAGES.length];
  st.draw(ctx, game.t); st.drawFloor(ctx);
  ctx.fillStyle = 'rgba(8,10,18,.72)'; ctx.fillRect(0, 0, CFG.W, CFG.H);
}

function drawTitle(ctx, game) {
  drawMenuBackdrop(ctx, game, 0);
  if (!game.is3D) {
    CHARACTERS.forEach((ch, i) => {
      const x = 70 + i * 104;
      drawFigureAt(ctx, ch, x, CFG.GROUND + 60, 0.7, 'idle', game.t + i * 17, i < 6 ? 1 : -1, { staff: false });
    });
  }
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, CFG.W, 300);
  txt(ctx, 'AVATAR', CFG.W / 2, 100, { font: FONT_DISPLAY, size: 100, weight: 900, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 10 });
  txt(ctx, 'ARENA', CFG.W / 2, 176, { font: FONT_DISPLAY, size: 58, weight: 900, color: '#fff', stroke: '#1a2a44', strokeWidth: 8 });
  txt(ctx, T('A Lenda de Aang · Luta 1x1'), CFG.W / 2, 228, { size: 20, color: '#dfe7f2', stroke: 'rgba(0,0,0,.8)' });

  const opts = game.titleOptions().map((o) => T(o));
  opts.forEach((o, i) => {
    const sel = i === game.menuIndex;
    const y = 282 + i * 36;
    if (sel) { ctx.fillStyle = 'rgba(255,213,79,.18)'; roundRect(ctx, CFG.W / 2 - 230, y - 16, 460, 32, 8); ctx.fill(); }
    txt(ctx, o, CFG.W / 2, y, { font: FONT_DISPLAY, size: 22, color: sel ? '#ffd54f' : '#cfd8dc', stroke: 'rgba(0,0,0,.9)' });
  });
  txt(ctx, T('W/S ou ↑/↓ para navegar · Enter para confirmar'), CFG.W / 2, 282 + opts.length * 36 + 2, { size: 15, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
  if (!game.r3d) txt(ctx, T('Modo 3D indisponível neste navegador (WebGL ou Three.js não carregou)'), CFG.W / 2, CFG.H - 24, { size: 13, color: '#8a93a3', stroke: 'rgba(0,0,0,.8)' });
}

function drawControls(ctx, game) {
  drawMenuBackdrop(ctx, game, 3);
  txt(ctx, T('CONTROLES'), CFG.W / 2, 60, { font: FONT_DISPLAY, size: 52, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  const cols = [[KEYMAPS.p1, T('JOGADOR 1'), '#f2a93b', 330], [KEYMAPS.p2, T('JOGADOR 2'), '#4fc3f7', 950]];
  for (const [m, title, col, cx] of cols) {
    ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, cx - 260, 100, 520, 470, 12); ctx.fill();
    txt(ctx, title, cx, 130, { font: FONT_DISPLAY, size: 26, color: col });
    const L = m.labels;
    const rows = [
      [T('Mover'), `${L.left} / ${L.right}`], [T('Pular'), L.up], [T('Agachar'), L.down], [T('Bloquear'), T('segurar para trás')],
      [T('Soco'), L.punch], [T('Chute'), L.kick], [T('Especial (dobra)'), L.special], [T('Especial 2'), `${L.down} + ${L.special}`], [T('Super (chi cheio)'), L.super],
      [T('Rasteira'), `${L.down} + ${L.kick}`], [T('Golpes aéreos'), T('pulo + soco/chute')], [T('Agarrão'), T('soco + chute juntos')], [T('Dash'), T('toque duplo ← ou →')],
    ];
    rows.forEach(([k, v], i) => {
      const y = 166 + i * 30;
      txt(ctx, k, cx - 230, y, { size: 17, align: 'left', color: '#dfe7f2', weight: 400 });
      txt(ctx, v, cx + 230, y, { size: 17, align: 'right', color: '#fff' });
    });
  }
  txt(ctx, T('Melhor de 3 rounds · 99 segundos · Golpes acertados enchem o CHI para o Super'), CFG.W / 2, 600, { size: 15, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
  txt(ctx, T('Esc ou Enter para voltar · As teclas podem ser alteradas em Configurações'), CFG.W / 2, 630, { size: 15, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}

function drawSelect(ctx, game) {
  drawMenuBackdrop(ctx, game, 1);
  const s = game.select;
  txt(ctx, T('ESCOLHA SEU LUTADOR'), CFG.W / 2, 56, { font: FONT_DISPLAY, size: 40, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });

  // grade central (4 x 3)
  const cols = SELECT_COLS, cw = 122, chh = 140, gx = CFG.W / 2 - (cols * cw) / 2, gy = 140;
  CHARACTERS.forEach((ch, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const x = gx + c * cw, y = gy + r * chh;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, x + 5, y + 5, cw - 10, chh - 10, 9); ctx.fill();
    ctx.save(); ctx.beginPath(); roundRect(ctx, x + 5, y + 5, cw - 10, chh - 10, 9); ctx.clip();
    if (game.is3D) {
      ctx.fillStyle = ELEMENT_COLORS[ch.element]; ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.arc(x + cw / 2, y + chh / 2 + 10, 36, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      txt(ctx, T(ELEMENT_NAMES[ch.element]).toUpperCase(), x + cw / 2, y + chh / 2 + 10, { font: FONT_DISPLAY, size: 12, color: '#fff', stroke: 'rgba(0,0,0,.8)' });
    } else {
      drawFigureAt(ctx, ch, x + cw / 2, y + chh - 14, 0.5, 'idle', game.t + i * 13, 1, { staff: false });
    }
    ctx.restore();
    txt(ctx, ch.name.toUpperCase(), x + cw / 2, y + 20, { font: FONT_DISPLAY, size: 13, color: ELEMENT_COLORS[ch.element], stroke: 'rgba(0,0,0,.9)' });
    if (ch.boss) txt(ctx, T('CHEFE'), x + cw / 2, y + chh - 14, { size: 10, color: '#ff8a65', stroke: 'rgba(0,0,0,.9)' });
    const p1Here = s.p1 === i, p2Here = s.p2 === i;
    if (p1Here) { ctx.strokeStyle = '#f2a93b'; ctx.lineWidth = 4; roundRect(ctx, x + 3, y + 3, cw - 6, chh - 6, 9); ctx.stroke(); txt(ctx, 'P1', x + 18, y + 16, { size: 12, color: '#f2a93b', stroke: '#000' }); }
    if (p2Here && !game.soloMode) { ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 4; roundRect(ctx, x + (p1Here ? 9 : 3), y + (p1Here ? 9 : 3), cw - (p1Here ? 18 : 6), chh - (p1Here ? 18 : 6), 9); ctx.stroke(); txt(ctx, game.mode === 'cpu' ? 'CPU' : game.mode === 'training' ? 'BON' : 'P2', x + cw - 20, y + 16, { size: 12, color: '#4fc3f7', stroke: '#000' }); }
  });

  // painéis laterais com o lutador escolhido
  const p2Label = game.mode === 'cpu' ? T('CPU') : game.mode === 'training' ? T('BONECO') : T('JOGADOR 2');
  const panels = [[CHARACTERS[s.p1], 0, '#f2a93b', s.p1Done, T('JOGADOR 1')]];
  if (!game.soloMode) panels.push([CHARACTERS[s.p2], 1, '#4fc3f7', s.p2Done, p2Label]);
  for (const [ch, side, col, done, label] of panels) {
    const px = side === 0 ? 40 : CFG.W - 360, pw = 320;
    if (!game.is3D) { ctx.fillStyle = 'rgba(0,0,0,.5)'; roundRect(ctx, px, 120, pw, 470, 12); ctx.fill(); }
    ctx.strokeStyle = done ? col : 'rgba(255,255,255,.25)'; ctx.lineWidth = 3; roundRect(ctx, px, 120, pw, 470, 12); ctx.stroke();
    txt(ctx, label, px + pw / 2, 148, { size: 16, color: col, stroke: 'rgba(0,0,0,.8)' });
    const skinIdx = side === 0 ? s.skin1 : s.skin2;
    drawSkinLabel(ctx, ch, skinIdx, px + pw / 2, 170, side === 0 || game.p1PicksBoth ? KEYMAPS.p1.labels.special : KEYMAPS.p2.labels.special);
    if (!game.is3D) drawFigureAt(ctx, skinnedChar(ch, skinIdx), px + pw / 2, 420, 1.15, done ? 'win' : 'idle', game.t, side === 0 ? 1 : -1, { staff: false });
    ctx.fillStyle = 'rgba(0,0,0,.45)'; roundRect(ctx, px + 8, 436, pw - 16, 146, 10); ctx.fill();
    txt(ctx, ch.name.toUpperCase(), px + pw / 2, 460, { font: FONT_DISPLAY, size: 30, color: '#fff', stroke: 'rgba(0,0,0,.9)' });
    txt(ctx, T(ch.title), px + pw / 2, 486, { size: 15, color: ELEMENT_COLORS[ch.element], weight: 400 });
    const stats = [[T('Força'), ch.stats.forca], [T('Velocidade'), ch.stats.velocidade], [T('Alcance'), ch.stats.alcance]];
    stats.forEach(([n, v], i) => {
      const y = 514 + i * 22;
      txt(ctx, n, px + 24, y, { size: 13, align: 'left', color: '#cfd8dc', weight: 400 });
      for (let k = 0; k < 5; k++) { ctx.fillStyle = k < v ? col : 'rgba(255,255,255,.15)'; ctx.fillRect(px + 130 + k * 34, y - 5, 28, 10); }
    });
    if (done) txt(ctx, T('PRONTO!'), px + pw / 2, 600, { font: FONT_DISPLAY, size: 18, color: col, stroke: 'rgba(0,0,0,.9)' });
  }
  if (game.soloMode) {
    const px = CFG.W - 360, pw = 320;
    ctx.fillStyle = 'rgba(0,0,0,.45)'; roundRect(ctx, px, 120, pw, 470, 12); ctx.fill();
    txt(ctx, game.mode === 'arcade' ? T('ARCADE') : T('SOBREVIVÊNCIA'), px + pw / 2, 160, { font: FONT_DISPLAY, size: 26, color: '#ffd54f', stroke: 'rgba(0,0,0,.9)' });
    const d = { pt: game.mode === 'arcade' ? ['7 lutas contra oponentes', 'sorteados, com dificuldade', 'crescente e um chefe no final.', '', 'Perdeu? Use um continue', '(a pontuação cai pela metade).'] : ['Oponentes sem fim.', 'A vida só recupera +30', 'entre as lutas.', '', 'Quantas vitórias seguidas', 'você consegue?'],
      en: game.mode === 'arcade' ? ['7 fights against random', 'opponents with rising', 'difficulty and a final boss.', '', 'Lost? Use a continue', '(score is halved).'] : ['Endless opponents.', 'Health only recovers +30', 'between fights.', '', 'How many wins in a row', 'can you get?'] };
    (d[Settings.data.lang] || d.pt).forEach((l, i) => txt(ctx, l, px + pw / 2, 210 + i * 26, { size: 16, color: '#dfe7f2', weight: 400 }));
  }
  const L1 = KEYMAPS.p1.labels, L2 = KEYMAPS.p2.labels;
  const hint = game.p1PicksBoth
    ? (s.p1Done ? T('Escolha o {0}: {1} move · {2} confirma · {3} aleatório · Esc volta', T(game.mode === 'training' ? 'boneco de treino' : 'adversário'), L1.move, L1.punch, L1.kick) : T('{0} move · {1} confirma · Esc volta', L1.move, L1.punch))
    : game.soloMode ? T('{0} move · {1} confirma · Esc volta', L1.move, L1.punch)
    : T('P1: {0} move, {1} confirma  ·  P2: {2} move, {3} confirma  ·  Esc volta', L1.move, L1.punch, L2.move, L2.punch);
  txt(ctx, hint, CFG.W / 2, 650, { size: 16, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
  if (s.msg) txt(ctx, s.msg, CFG.W / 2, 676, { size: 15, color: '#ff8a65', stroke: 'rgba(0,0,0,.9)' });
  if (s.p1Done && s.p2Done) txt(ctx, T('LUTADORES ESCOLHIDOS!'), CFG.W / 2, 118, { font: FONT_DISPLAY, size: 22, color: '#fff', stroke: 'rgba(0,0,0,.9)' });
}

function drawStageSelect(ctx, game) {
  const st = STAGES[game.stageIndex];
  if (game.is3D) {
    ctx.fillStyle = 'rgba(8,10,18,.55)'; ctx.fillRect(0, 0, CFG.W, 110); ctx.fillRect(0, CFG.H - 130, CFG.W, 130);
  } else {
    st.draw(ctx, game.t); st.drawFloor(ctx);
    ctx.fillStyle = 'rgba(8,10,18,.45)'; ctx.fillRect(0, 0, CFG.W, CFG.H);
    const pw = 720, ph = 405, px = CFG.W / 2 - pw / 2, py = 150;
    ctx.fillStyle = '#000'; ctx.fillRect(px - 6, py - 6, pw + 12, ph + 12);
    ctx.save(); ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
    ctx.translate(px, py); ctx.scale(pw / CFG.W, ph / CFG.H);
    st.draw(ctx, game.t); st.drawFloor(ctx);
    drawFigureAt(ctx, CHARACTERS[game.select.p1], 380, CFG.GROUND, 1, 'idle', game.t, 1);
    drawFigureAt(ctx, CHARACTERS[game.select.p2], CFG.W - 380, CFG.GROUND, 1, 'idle', game.t + 30, -1);
    ctx.restore();
  }
  txt(ctx, T('ESCOLHA O CENÁRIO'), CFG.W / 2, 60, { font: FONT_DISPLAY, size: 40, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  txt(ctx, '◀', 70, CFG.H / 2, { size: 48, color: '#fff', stroke: '#000' });
  txt(ctx, '▶', CFG.W - 70, CFG.H / 2, { size: 48, color: '#fff', stroke: '#000' });
  txt(ctx, T(st.name).toUpperCase(), CFG.W / 2, CFG.H - 85, { font: FONT_DISPLAY, size: 32, color: '#fff', stroke: 'rgba(0,0,0,.9)', strokeWidth: 6 });
  txt(ctx, T('{0} / {1}   ·   ← → troca · Enter confirma · Esc volta', game.stageIndex + 1, STAGES.length), CFG.W / 2, CFG.H - 45, { size: 16, color: '#dfe7f2', stroke: 'rgba(0,0,0,.8)' });
}

function drawResult(ctx, game) {
  const w = game.winner, l = game.fighters[1 - w.side];
  if (game.is3D) {
    ctx.fillStyle = 'rgba(8,10,18,.35)'; ctx.fillRect(0, 0, CFG.W, CFG.H);
  } else {
    const st = STAGES[game.stageIndex];
    st.draw(ctx, game.t); st.drawFloor(ctx);
    ctx.fillStyle = 'rgba(8,10,18,.6)'; ctx.fillRect(0, 0, CFG.W, CFG.H);
    drawFigureAt(ctx, w.char, CFG.W / 2 - 200, CFG.GROUND - 10, 1.4, 'win', game.t, 1);
    drawFigureAt(ctx, l.char, CFG.W / 2 + 260, CFG.GROUND - 10, 1.1, 'ko', game.t, -1);
  }
  txt(ctx, w.char.name.toUpperCase(), CFG.W / 2 + 120, 130, { font: FONT_DISPLAY, size: 76, weight: 900, color: ELEMENT_COLORS[w.char.element], stroke: '#000', strokeWidth: 8 });
  txt(ctx, T('VENCE!'), CFG.W / 2 + 120, 205, { font: FONT_DISPLAY, size: 52, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 8 });
  const label = w.isCPU ? T('A CPU venceu desta vez.') : T('Vitória do {0}  ·  {1} x {2}', T(w.side === 0 ? 'Jogador 1' : 'Jogador 2'), w.rounds, l.rounds);
  txt(ctx, label, CFG.W / 2 + 120, 255, { size: 22, color: '#fff', stroke: 'rgba(0,0,0,.9)' });
  // estatísticas da partida
  const [a, b] = game.fighters;
  const rows = [[T('Golpes acertados'), a.stats.hits, b.stats.hits], [T('Maior combo'), a.stats.maxCombo, b.stats.maxCombo], [T('Dano causado'), a.stats.damage, b.stats.damage], [T('Agarrões'), a.stats.throws, b.stats.throws]];
  const tx = CFG.W / 2 + 120, ty = 300;
  ctx.fillStyle = 'rgba(0,0,0,.5)'; roundRect(ctx, tx - 230, ty - 16, 460, rows.length * 28 + 44, 10); ctx.fill();
  txt(ctx, a.char.name.toUpperCase(), tx - 150, ty + 4, { size: 14, color: '#f2a93b' }); txt(ctx, b.char.name.toUpperCase(), tx + 150, ty + 4, { size: 14, color: '#4fc3f7' });
  rows.forEach(([n, va, vb], i) => {
    const y = ty + 32 + i * 28;
    txt(ctx, n, tx, y, { size: 15, color: '#cfd8dc', weight: 400 });
    txt(ctx, String(va), tx - 150, y, { size: 17, color: va >= vb ? '#fff' : '#aaa' }); txt(ctx, String(vb), tx + 150, y, { size: 17, color: vb >= va ? '#fff' : '#aaa' });
  });
  if (game.newUnlocks && game.newUnlocks.length) txt(ctx, T('Novo traje desbloqueado: {0}', game.newUnlocks.map((u) => `${u.char.name} · ${T(u.skin.name)}`).join(', ')), CFG.W / 2, 655, { size: 18, color: '#80deea', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, T('Enter = Revanche   ·   Esc = Escolher lutadores'), CFG.W / 2, 690, { size: 18, color: '#dfe7f2', stroke: 'rgba(0,0,0,.8)' });
}
