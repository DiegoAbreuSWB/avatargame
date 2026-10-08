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
      const x = 180 + i * 185;
      drawFigureAt(ctx, ch, x, CFG.GROUND + 40, 0.8, 'idle', game.t + i * 17, i < 3 ? 1 : -1);
    });
  }
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, CFG.W, 300);
  txt(ctx, 'AVATAR', CFG.W / 2, 105, { font: FONT_DISPLAY, size: 104, weight: 900, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 10 });
  txt(ctx, 'ARENA', CFG.W / 2, 185, { font: FONT_DISPLAY, size: 60, weight: 900, color: '#fff', stroke: '#1a2a44', strokeWidth: 8 });
  txt(ctx, 'A Lenda de Aang · Luta 1x1', CFG.W / 2, 240, { size: 22, color: '#dfe7f2', stroke: 'rgba(0,0,0,.8)' });

  const opts = game.titleOptions();
  opts.forEach((o, i) => {
    const sel = i === game.menuIndex;
    const y = 322 + i * 48;
    if (sel) { ctx.fillStyle = 'rgba(255,213,79,.18)'; roundRect(ctx, CFG.W / 2 - 230, y - 21, 460, 42, 8); ctx.fill(); }
    txt(ctx, o, CFG.W / 2, y, { font: FONT_DISPLAY, size: 26, color: sel ? '#ffd54f' : '#cfd8dc', stroke: 'rgba(0,0,0,.9)' });
  });
  txt(ctx, 'W/S ou ↑/↓ para navegar · Enter para confirmar', CFG.W / 2, 322 + opts.length * 48 + 4, { size: 16, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
  if (!game.r3d) txt(ctx, 'Modo 3D indisponível neste navegador (WebGL ou Three.js não carregou)', CFG.W / 2, CFG.H - 24, { size: 13, color: '#8a93a3', stroke: 'rgba(0,0,0,.8)' });
}

function drawControls(ctx, game) {
  drawMenuBackdrop(ctx, game, 3);
  txt(ctx, 'CONTROLES', CFG.W / 2, 70, { font: FONT_DISPLAY, size: 56, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  const cols = [[KEYMAPS.p1, 'JOGADOR 1', '#f2a93b', 330], [KEYMAPS.p2, 'JOGADOR 2', '#4fc3f7', 950]];
  for (const [m, title, col, cx] of cols) {
    ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, cx - 260, 120, 520, 420, 12); ctx.fill();
    txt(ctx, title, cx, 155, { font: FONT_DISPLAY, size: 28, color: col });
    const arrows = m.labels.move === 'SETAS';
    const rows = [
      ['Mover', m.labels.move], ['Pular', arrows ? '↑' : 'W'], ['Agachar', arrows ? '↓' : 'S'],
      ['Bloquear', 'segurar para trás'], ['Soco', m.labels.punch], ['Chute', m.labels.kick],
      ['Especial (dobra)', m.labels.special], ['Especial 2', '↓ + ' + m.labels.special], ['Super (chi cheio)', m.labels.super],
      ['Rasteira', '↓ + ' + m.labels.kick], ['Golpes aéreos', 'pulo + soco/chute'],
    ];
    rows.forEach(([k, v], i) => {
      const y = 195 + i * 31;
      txt(ctx, k, cx - 230, y, { size: 18, align: 'left', color: '#dfe7f2', weight: 400 });
      txt(ctx, v, cx + 230, y, { size: 18, align: 'right', color: '#fff' });
    });
  }
  txt(ctx, 'Melhor de 3 rounds · 99 segundos · Golpes acertados enchem o CHI para o Super', CFG.W / 2, 575, { size: 16, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
  txt(ctx, 'Esc ou Enter para voltar', CFG.W / 2, 610, { size: 16, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}

function drawSelect(ctx, game) {
  drawMenuBackdrop(ctx, game, 1);
  const s = game.select;
  txt(ctx, 'ESCOLHA SEU LUTADOR', CFG.W / 2, 56, { font: FONT_DISPLAY, size: 40, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });

  // grade central 3x2
  const cols = 3, cw = 150, chh = 170, gx = CFG.W / 2 - (cols * cw) / 2, gy = 150;
  CHARACTERS.forEach((ch, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const x = gx + c * cw, y = gy + r * chh;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, x + 6, y + 6, cw - 12, chh - 12, 10); ctx.fill();
    ctx.save(); ctx.beginPath(); roundRect(ctx, x + 6, y + 6, cw - 12, chh - 12, 10); ctx.clip();
    if (game.is3D) {
      // emblema do elemento
      ctx.fillStyle = ELEMENT_COLORS[ch.element]; ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.arc(x + cw / 2, y + chh / 2 + 12, 46, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      txt(ctx, ELEMENT_NAMES[ch.element].toUpperCase(), x + cw / 2, y + chh / 2 + 12, { font: FONT_DISPLAY, size: 15, color: '#fff', stroke: 'rgba(0,0,0,.8)' });
      txt(ctx, ch.title, x + cw / 2, y + chh - 24, { size: 11, color: '#cfd8dc', weight: 400 });
    } else {
      drawFigureAt(ctx, ch, x + cw / 2, y + chh - 18, 0.62, 'idle', game.t + i * 13, 1, { staff: false });
    }
    ctx.restore();
    txt(ctx, ch.name.toUpperCase(), x + cw / 2, y + 24, { font: FONT_DISPLAY, size: 16, color: ELEMENT_COLORS[ch.element], stroke: 'rgba(0,0,0,.9)' });
    const p1Here = s.p1 === i, p2Here = s.p2 === i;
    if (p1Here) { ctx.strokeStyle = '#f2a93b'; ctx.lineWidth = 4; roundRect(ctx, x + 4, y + 4, cw - 8, chh - 8, 10); ctx.stroke(); txt(ctx, 'P1', x + 24, y + 20, { size: 14, color: '#f2a93b', stroke: '#000' }); }
    if (p2Here) { ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 4; roundRect(ctx, x + (p1Here ? 10 : 4), y + (p1Here ? 10 : 4), cw - (p1Here ? 20 : 8), chh - (p1Here ? 20 : 8), 10); ctx.stroke(); txt(ctx, game.mode === 'cpu' ? 'CPU' : 'P2', x + cw - 26, y + 20, { size: 14, color: '#4fc3f7', stroke: '#000' }); }
  });

  // painéis laterais com o lutador escolhido
  const panels = [[CHARACTERS[s.p1], 0, '#f2a93b', s.p1Done, 'JOGADOR 1'], [CHARACTERS[s.p2], 1, '#4fc3f7', s.p2Done, game.mode === 'cpu' ? 'CPU' : 'JOGADOR 2']];
  for (const [ch, side, col, done, label] of panels) {
    const px = side === 0 ? 40 : CFG.W - 360, pw = 320;
    if (!game.is3D) { ctx.fillStyle = 'rgba(0,0,0,.5)'; roundRect(ctx, px, 120, pw, 470, 12); ctx.fill(); }
    ctx.strokeStyle = done ? col : 'rgba(255,255,255,.25)'; ctx.lineWidth = 3; roundRect(ctx, px, 120, pw, 470, 12); ctx.stroke();
    txt(ctx, label, px + pw / 2, 148, { size: 16, color: col, stroke: 'rgba(0,0,0,.8)' });
    if (!game.is3D) drawFigureAt(ctx, ch, px + pw / 2, 420, 1.15, done ? 'win' : 'idle', game.t, side === 0 ? 1 : -1, { staff: false });
    ctx.fillStyle = 'rgba(0,0,0,.45)'; roundRect(ctx, px + 8, 436, pw - 16, 146, 10); ctx.fill();
    txt(ctx, ch.name.toUpperCase(), px + pw / 2, 460, { font: FONT_DISPLAY, size: 30, color: '#fff', stroke: 'rgba(0,0,0,.9)' });
    txt(ctx, ch.title, px + pw / 2, 486, { size: 15, color: ELEMENT_COLORS[ch.element], weight: 400 });
    const stats = [['Força', ch.stats.forca], ['Velocidade', ch.stats.velocidade], ['Alcance', ch.stats.alcance]];
    stats.forEach(([n, v], i) => {
      const y = 514 + i * 22;
      txt(ctx, n, px + 24, y, { size: 13, align: 'left', color: '#cfd8dc', weight: 400 });
      for (let k = 0; k < 5; k++) { ctx.fillStyle = k < v ? col : 'rgba(255,255,255,.15)'; ctx.fillRect(px + 130 + k * 34, y - 5, 28, 10); }
    });
    if (done) txt(ctx, 'PRONTO!', px + pw / 2, 600, { font: FONT_DISPLAY, size: 18, color: col, stroke: 'rgba(0,0,0,.9)' });
  }
  const hint = game.mode === 'cpu'
    ? (s.p1Done ? 'Escolha o adversário: W A S D move · F confirma · G aleatório · Esc volta' : 'W A S D move · F confirma · Esc volta')
    : 'P1: W A S D move, F confirma  ·  P2: setas movem, J confirma  ·  Esc volta';
  txt(ctx, hint, CFG.W / 2, 650, { size: 16, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
  if (s.p1Done && s.p2Done) txt(ctx, 'LUTADORES ESCOLHIDOS!', CFG.W / 2, 118, { font: FONT_DISPLAY, size: 22, color: '#fff', stroke: 'rgba(0,0,0,.9)' });
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
  txt(ctx, 'ESCOLHA O CENÁRIO', CFG.W / 2, 60, { font: FONT_DISPLAY, size: 40, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  txt(ctx, '◀', 70, CFG.H / 2, { size: 48, color: '#fff', stroke: '#000' });
  txt(ctx, '▶', CFG.W - 70, CFG.H / 2, { size: 48, color: '#fff', stroke: '#000' });
  txt(ctx, st.name.toUpperCase(), CFG.W / 2, CFG.H - 85, { font: FONT_DISPLAY, size: 32, color: '#fff', stroke: 'rgba(0,0,0,.9)', strokeWidth: 6 });
  txt(ctx, `${game.stageIndex + 1} / ${STAGES.length}   ·   ← → troca · Enter confirma · Esc volta`, CFG.W / 2, CFG.H - 45, { size: 16, color: '#dfe7f2', stroke: 'rgba(0,0,0,.8)' });
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
  txt(ctx, w.char.name.toUpperCase(), CFG.W / 2 + 120, 150, { font: FONT_DISPLAY, size: 80, weight: 900, color: ELEMENT_COLORS[w.char.element], stroke: '#000', strokeWidth: 8 });
  txt(ctx, 'VENCE!', CFG.W / 2 + 120, 230, { font: FONT_DISPLAY, size: 56, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 8 });
  const label = w.isCPU ? 'A CPU venceu desta vez.' : `Vitória do ${w.side === 0 ? 'Jogador 1' : 'Jogador 2'}  ·  ${w.rounds} x ${l.rounds}`;
  txt(ctx, label, CFG.W / 2 + 120, 285, { size: 22, color: '#fff', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, 'Enter = Revanche   ·   Esc = Escolher lutadores', CFG.W / 2, 690, { size: 18, color: '#dfe7f2', stroke: 'rgba(0,0,0,.8)' });
}
