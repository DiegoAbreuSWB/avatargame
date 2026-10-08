/* HUD da luta: barras de vida com retratos, chi, cronômetro, rounds, anúncios, falas, pausa,
   overlay de depuração (F1) e painel de treino. Todos os textos passam por T() (tradução). */
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

/* retrato circular: a cabeça do boneco 2D ampliada e recortada */
function drawPortrait(ctx, ch, cx, cy, r, facing) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill(); ctx.clip();
  drawFigureAt(ctx, ch, cx - facing * 2, cy + 150 * 1.25, 1.25, 'idle', 0, facing, { staff: false });
  ctx.restore();
  ctx.strokeStyle = ELEMENT_COLORS[ch.element]; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
}

function drawHUD(ctx, game) {
  const [a, b] = game.fighters;
  const W = CFG.W;
  const barW = 440, barH = 26, y = 34;

  for (const [f, side] of [[a, 0], [b, 1]]) {
    const x0 = side === 0 ? 90 : W - 90 - barW;
    drawPortrait(ctx, f.char, side === 0 ? 48 : W - 48, 52, 30, side === 0 ? 1 : -1);
    ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, x0 - 3, y - 3, barW + 6, barH + 6, 6); ctx.fill();
    ctx.fillStyle = '#3a0f0f'; ctx.fillRect(x0, y, barW, barH);
    const ghostW = barW * (f.hpGhost / f.maxHp);
    ctx.fillStyle = '#e53935';
    if (side === 0) ctx.fillRect(x0, y, ghostW, barH); else ctx.fillRect(x0 + barW - ghostW, y, ghostW, barH);
    const hpW = barW * (f.hp / f.maxHp);
    const g = ctx.createLinearGradient(0, y, 0, y + barH);
    g.addColorStop(0, f.hp > 30 ? '#ffe36b' : '#ff8a65'); g.addColorStop(1, f.hp > 30 ? '#f2a93b' : '#e53935');
    ctx.fillStyle = g;
    if (side === 0) ctx.fillRect(x0, y, hpW, barH); else ctx.fillRect(x0 + barW - hpW, y, hpW, barH);
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.strokeRect(x0, y, barW, barH);
    const nameX = side === 0 ? x0 : x0 + barW;
    const tag = f.isCPU ? (game.mode === 'training' ? T('  (BONECO)') : T('  (CPU)')) : '';
    txt(ctx, f.char.name.toUpperCase() + tag, nameX, y + barH + 18, { font: FONT_DISPLAY, size: 20, align: side === 0 ? 'left' : 'right', color: '#fff', stroke: 'rgba(0,0,0,.8)' });
    txt(ctx, T(ELEMENT_NAMES[f.char.element]).toUpperCase(), nameX, y + barH + 38, { size: 12, align: side === 0 ? 'left' : 'right', color: ELEMENT_COLORS[f.char.element], stroke: 'rgba(0,0,0,.8)' });
    if (f.chiBlocked > 0) txt(ctx, T('CHI BLOQUEADO {0}s', Math.ceil(f.chiBlocked / 60)), nameX, y + barH + 58, { size: 13, align: side === 0 ? 'left' : 'right', color: '#f48fb1', stroke: 'rgba(0,0,0,.9)' });
    const rtw = Math.min(game.roundsToWin, 5);
    for (let i = 0; i < rtw; i++) {
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
    const superKey = side === 0 ? KEYMAPS.p1.labels.super : KEYMAPS.p2.labels.super;
    txt(ctx, full ? T('SUPER PRONTO  ({0})', superKey) : T('CHI'), side === 0 ? cx : cx + cw, cy - 12, { size: 12, align: side === 0 ? 'left' : 'right', color: full ? '#bfe9ff' : '#ddd', stroke: 'rgba(0,0,0,.8)' });
    if (f.combo >= 2 && f.comboTimer > 0) {
      txt(ctx, T('{0} HITS!', f.combo), side === 0 ? 120 : W - 120, 150, { font: FONT_DISPLAY, size: 34, color: '#ffd54f', stroke: '#5a2d00', strokeWidth: 5 });
    }
  }
  // cronômetro
  ctx.fillStyle = 'rgba(0,0,0,.6)'; roundRect(ctx, W / 2 - 52, 18, 104, 62, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; roundRect(ctx, W / 2 - 52, 18, 104, 62, 8); ctx.stroke();
  const tstr = game.infiniteTime ? '∞' : String(game.timer).padStart(2, '0');
  txt(ctx, tstr, W / 2, 50, { font: FONT_DISPLAY, size: 44, color: !game.infiniteTime && game.timer <= 10 ? '#ff5252' : '#fff' });
  if (Audio_.isMuted()) txt(ctx, T('MUDO (M)'), W / 2, 96, { size: 12, color: '#bbb', stroke: 'rgba(0,0,0,.8)' });
  drawQuotes(ctx, game);
}

/* balões de fala: apresentação no round 1 e vitória no K.O. */
function drawBubble(ctx, text, x, y, color) {
  ctx.save(); ctx.font = `700 15px ${FONT_BODY}`;
  const w = Math.min(300, ctx.measureText(text).width + 24), h = 34;
  const bx = clamp(x - w / 2, 10, CFG.W - w - 10), by = y - h;
  ctx.fillStyle = 'rgba(255,255,255,.95)'; roundRect(ctx, bx, by, w, h, 10); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 8, by + h); ctx.lineTo(x, by + h + 10); ctx.lineTo(x + 8, by + h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2; roundRect(ctx, bx, by, w, h, 10); ctx.stroke();
  ctx.restore();
  txt(ctx, text, bx + w / 2, by + h / 2, { size: 15, color: '#1b1b1b', weight: 700 });
}
function drawQuotes(ctx, game) {
  if (!game.quotes) return;
  const show = [];
  if (game.phase === 'intro' && game.round === 1 && game.phaseT > 52 && game.phaseT < 100) game.fighters.forEach((f, i) => show.push([f, game.quotes[i].intro]));
  else if ((game.phase === 'ko' || game.phase === 'timeout') && game.phaseT > 85 && game.phaseT < 185 && game.winner) show.push([game.winner, game.quotes[game.winner.side].win]);
  for (const [f, q] of show) {
    if (!q) continue;
    const [sx, sy] = projectPoint(game, f.x, f.y - 185);
    drawBubble(ctx, q, sx, sy, ELEMENT_COLORS[f.char.element]);
  }
}

function drawAnnouncement(ctx, game) {
  const an = game.announce; if (!an) return;
  const scale = an.timer > an.max - 10 ? lerp(2.2, 1, (an.max - an.timer) / 10) : 1;
  const alpha = an.timer < 12 ? an.timer / 12 : 1;
  ctx.save(); ctx.translate(CFG.W / 2, an.y || 300); ctx.scale(scale, scale); ctx.globalAlpha = alpha;
  txt(ctx, an.text, 0, 0, { font: FONT_DISPLAY, size: an.size || 96, color: an.color || '#ffd54f', stroke: '#3b1d00', strokeWidth: 8 });
  if (an.sub) txt(ctx, an.sub, 0, (an.size || 96) * 0.7, { size: 24, color: '#fff', stroke: 'rgba(0,0,0,.8)' });
  ctx.restore();
}

function drawPauseMenu(ctx, game) {
  ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(0, 0, CFG.W, CFG.H);
  txt(ctx, T('PAUSA'), CFG.W / 2, 220, { font: FONT_DISPLAY, size: 64, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  const opts = [T('Continuar'), T('Reiniciar luta'), T('Voltar ao menu')];
  opts.forEach((o, i) => {
    const sel = i === game.pauseIndex;
    txt(ctx, (sel ? '▶  ' : '') + o, CFG.W / 2, 320 + i * 50, { size: 28, color: sel ? '#fff' : '#aaa' });
  });
  txt(ctx, T('W/S ou ↑/↓ para escolher · Enter para confirmar · Esc para continuar'), CFG.W / 2, 520, { size: 16, color: '#999' });
}

function drawSuperFlash(ctx, game) {
  if (game.superFlash <= 0) return;
  const t = game.superFlash / 40;
  ctx.fillStyle = `rgba(0,0,0,${0.6 * Math.min(1, t * 2)})`; ctx.fillRect(0, 0, CFG.W, CFG.H);
  const f = game.superUser;
  if (f) {
    const col = f.char.id === 'azula' ? '#4fb3ff' : ELEMENT_COLORS[f.char.element];
    txt(ctx, T(game.superName).toUpperCase(), f.side === 0 ? 330 : CFG.W - 330, 200, { font: FONT_DISPLAY, size: 40, color: col, stroke: '#000', strokeWidth: 6 });
  }
}

/* ----- Overlay de depuração (F1): hurtbox azul, pushbox verde, hitbox vermelha, projéteis magenta ----- */
function projectPoint(game, x, y) {
  if (game.is3D && game.r3d.project) return game.r3d.project(x, y);
  if (game.cam2d) { const c = game.cam2d; return [(x - c.x) * c.zoom + CFG.W / 2, (y - c.y) * c.zoom + CFG.H / 2]; }
  return [x, y];
}
function drawDebugBox(ctx, game, b, stroke, fill) {
  const pts = [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]].map(([x, y]) => projectPoint(game, x, y));
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
}
function drawDebug(ctx, game) {
  for (const f of game.fighters) {
    drawDebugBox(ctx, game, f.pushbox, 'rgba(80,220,120,.9)', 'rgba(80,220,120,.08)');
    drawDebugBox(ctx, game, f.hurtbox, 'rgba(80,160,255,.9)', 'rgba(80,160,255,.12)');
    const hb = f.hitbox; if (hb) drawDebugBox(ctx, game, hb, 'rgba(255,60,60,1)', 'rgba(255,60,60,.25)');
    const [sx, sy] = projectPoint(game, f.x, f.y - 190);
    const m = f.attack ? `${f.attack.name} f${f.attackFrame}/${f.attack.startup}+${f.attack.active}+${f.attack.recovery}` : '';
    const lines = [`${f.state}${f.pose !== f.state ? ' (' + f.pose + ')' : ''}`, m, `x ${Math.round(f.x)}  y ${Math.round(CFG.GROUND - f.y)}  vx ${f.vx.toFixed(1)}`, `hp ${f.hp}  chi ${f.chi}  stun ${f.stun}${f.invulnFrames > 0 ? '  inv ' + f.invulnFrames : ''}`].filter(Boolean);
    lines.forEach((l, i) => txt(ctx, l, sx, sy - 14 * (lines.length - i), { size: 12, color: '#fff', stroke: 'rgba(0,0,0,.9)', weight: 400 }));
  }
  for (const p of game.projectiles) if (p.active) drawDebugBox(ctx, game, p.box, 'rgba(255,80,255,.9)', 'rgba(255,80,255,.12)');
  txt(ctx, `F1 hitboxes · frame ${game.t} · seed ${game.matchSeed} · ${game.phase}${game.cam2d ? ' · zoom ' + game.cam2d.zoom.toFixed(2) : ''}`, CFG.W / 2, CFG.H - 14, { size: 12, color: '#ddd', stroke: 'rgba(0,0,0,.9)', weight: 400 });
}

/* ----- Painel do modo Treino ----- */
function drawTraining(ctx, game) {
  const tr = game.training;
  ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, CFG.W / 2 - 340, 104, 680, 30, 8); ctx.fill();
  txt(ctx, T('TREINO  ·  Boneco: {0} (F2)  ·  Reposicionar (F3)  ·  Chi infinito: {1} (F4)  ·  Hitboxes (F1)', T(DUMMY_MODES[tr.dummy]), T(tr.chiInf ? 'sim' : 'não')), CFG.W / 2, 119, { size: 14, color: '#dfe7f2', weight: 400 });
  const x0 = 60, y0 = CFG.H - 80;
  ctx.fillStyle = 'rgba(0,0,0,.5)'; roundRect(ctx, x0 - 6, y0 - 16, 16 * 24 + 12, 32, 6); ctx.fill();
  tr.history.forEach((h, i) => {
    const age = game.t - h.t, alpha = clamp(1 - age / 240, 0.25, 1);
    const isBtn = 'SCEU'.includes(h.sym);
    txt(ctx, h.sym, x0 + i * 24 + 8, y0, { size: 16, color: isBtn ? '#ffd54f' : '#fff', alpha, weight: 700 });
  });
  txt(ctx, T('Último combo: {0} hit{1}', tr.lastCombo, tr.lastCombo === 1 ? '' : 's'), x0 + 16 * 24 + 30, y0, { size: 14, align: 'left', color: '#dfe7f2', weight: 400, stroke: 'rgba(0,0,0,.8)' });
}
