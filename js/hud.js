/* HUD da luta: barras de vida, chi, cronômetro, rounds, anúncios e menu de pausa. */
const FONT_DISPLAY = '"Cinzel", Georgia, serif';
const FONT_BODY = '"Noto Sans", "Segoe UI", system-ui, sans-serif';

function txt(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.weight || 700} ${o.size || 20}px ${o.font || FONT_BODY}`;
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.baseline || 'middle';
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  if (o.stroke) { ctx.lineWidth = o.strokeWidth || Math.max(2, (o.size || 20) / 8); ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.fillStyle = o.color || '#fff';
  ctx.fillText(s, x, y);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function drawHUD(ctx, game) {
  const [a, b] = game.fighters;
  const W = CFG.W;
  const barW = 470, barH = 26, y = 34;

  for (const [f, side] of [[a, 0], [b, 1]]) {
    const x0 = side === 0 ? 60 : W - 60 - barW;
    // fundo
    ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, x0 - 3, y - 3, barW + 6, barH + 6, 6); ctx.fill();
    ctx.fillStyle = '#3a0f0f'; ctx.fillRect(x0, y, barW, barH);
    // barra "fantasma" (dano recente)
    const ghostW = barW * (f.hpGhost / CFG.MAX_HP);
    ctx.fillStyle = '#e53935';
    if (side === 0) ctx.fillRect(x0, y, ghostW, barH); else ctx.fillRect(x0 + barW - ghostW, y, ghostW, barH);
    // vida atual
    const hpW = barW * (f.hp / CFG.MAX_HP);
    const g = ctx.createLinearGradient(0, y, 0, y + barH);
    g.addColorStop(0, f.hp > 30 ? '#ffe36b' : '#ff8a65'); g.addColorStop(1, f.hp > 30 ? '#f2a93b' : '#e53935');
    ctx.fillStyle = g;
    if (side === 0) ctx.fillRect(x0, y, hpW, barH); else ctx.fillRect(x0 + barW - hpW, y, hpW, barH);
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.strokeRect(x0, y, barW, barH);
    // nome
    const nameX = side === 0 ? x0 : x0 + barW;
    txt(ctx, f.char.name.toUpperCase() + (f.isCPU ? '  (CPU)' : ''), nameX, y + barH + 18, { font: FONT_DISPLAY, size: 20, align: side === 0 ? 'left' : 'right', color: '#fff', stroke: 'rgba(0,0,0,.8)' });
    txt(ctx, ELEMENT_NAMES[f.char.element].toUpperCase(), nameX, y + barH + 38, { size: 12, align: side === 0 ? 'left' : 'right', color: ELEMENT_COLORS[f.char.element], stroke: 'rgba(0,0,0,.8)' });
    // rounds vencidos
    for (let i = 0; i < CFG.ROUNDS_TO_WIN; i++) {
      const dx = side === 0 ? x0 + barW - 16 - i * 26 : x0 + 16 + i * 26;
      ctx.beginPath(); ctx.arc(dx, y + barH + 22, 8, 0, Math.PI * 2);
      ctx.fillStyle = i < f.rounds ? '#ffd54f' : 'rgba(0,0,0,.5)'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    }
    // barra de chi
    const cw = 320, ch = 12, cy = CFG.H - 42, cx = side === 0 ? 60 : W - 60 - cw;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, cx - 3, cy - 3, cw + 6, ch + 6, 5); ctx.fill();
    const full = f.chi >= CFG.MAX_CHI;
    const pulse = full ? 0.6 + Math.sin(game.t * 0.2) * 0.4 : 1;
    ctx.fillStyle = full ? `rgba(120,230,255,${pulse})` : ELEMENT_COLORS[f.char.element];
    const chiW = cw * (f.chi / CFG.MAX_CHI);
    if (side === 0) ctx.fillRect(cx, cy, chiW, ch); else ctx.fillRect(cx + cw - chiW, cy, chiW, ch);
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.strokeRect(cx, cy, cw, ch);
    txt(ctx, full ? 'SUPER PRONTO  (' + (side === 0 ? KEYMAPS.p1.labels.super : KEYMAPS.p2.labels.super) + ')' : 'CHI', side === 0 ? cx : cx + cw, cy - 12, { size: 12, align: side === 0 ? 'left' : 'right', color: full ? '#bfe9ff' : '#ddd', stroke: 'rgba(0,0,0,.8)' });
    // combo
    if (f.combo >= 2 && f.comboTimer > 0) {
      txt(ctx, `${f.combo} HITS!`, side === 0 ? 120 : W - 120, 150, { font: FONT_DISPLAY, size: 34, color: '#ffd54f', stroke: '#5a2d00', strokeWidth: 5 });
    }
  }
  // cronômetro
  ctx.fillStyle = 'rgba(0,0,0,.6)'; roundRect(ctx, W / 2 - 52, 18, 104, 62, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; roundRect(ctx, W / 2 - 52, 18, 104, 62, 8); ctx.stroke();
  txt(ctx, String(game.timer).padStart(2, '0'), W / 2, 50, { font: FONT_DISPLAY, size: 44, color: game.timer <= 10 ? '#ff5252' : '#fff' });
  // mudo
  if (Audio_.isMuted()) txt(ctx, 'MUDO (M)', W / 2, 96, { size: 12, color: '#bbb', stroke: 'rgba(0,0,0,.8)' });
}

function drawAnnouncement(ctx, game) {
  const an = game.announce; if (!an) return;
  const p = 1 - an.timer / an.max;
  const scale = an.timer > an.max - 10 ? lerp(2.2, 1, (an.max - an.timer) / 10) : 1;
  const alpha = an.timer < 12 ? an.timer / 12 : 1;
  ctx.save(); ctx.translate(CFG.W / 2, an.y || 300); ctx.scale(scale, scale); ctx.globalAlpha = alpha;
  txt(ctx, an.text, 0, 0, { font: FONT_DISPLAY, size: an.size || 96, color: an.color || '#ffd54f', stroke: '#3b1d00', strokeWidth: 8 });
  if (an.sub) txt(ctx, an.sub, 0, (an.size || 96) * 0.7, { size: 24, color: '#fff', stroke: 'rgba(0,0,0,.8)' });
  ctx.restore();
}

function drawPauseMenu(ctx, game) {
  ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(0, 0, CFG.W, CFG.H);
  txt(ctx, 'PAUSA', CFG.W / 2, 220, { font: FONT_DISPLAY, size: 64, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  const opts = ['Continuar', 'Reiniciar luta', 'Voltar ao menu'];
  opts.forEach((o, i) => {
    const sel = i === game.pauseIndex;
    txt(ctx, (sel ? '▶  ' : '') + o, CFG.W / 2, 320 + i * 50, { size: 28, color: sel ? '#fff' : '#aaa' });
  });
  txt(ctx, 'W/S ou ↑/↓ para escolher · Enter para confirmar · Esc para continuar', CFG.W / 2, 520, { size: 16, color: '#999' });
}

function drawSuperFlash(ctx, game) {
  if (game.superFlash <= 0) return;
  const t = game.superFlash / 40;
  ctx.fillStyle = `rgba(0,0,0,${0.6 * Math.min(1, t * 2)})`; ctx.fillRect(0, 0, CFG.W, CFG.H);
  const f = game.superUser;
  if (f) {
    const col = f.char.id === 'azula' ? '#4fb3ff' : ELEMENT_COLORS[f.char.element];
    txt(ctx, game.superName.toUpperCase(), f.side === 0 ? 330 : CFG.W - 330, 200, { font: FONT_DISPLAY, size: 40, color: col, stroke: '#000', strokeWidth: 6 });
  }
}
