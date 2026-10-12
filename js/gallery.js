/* Galeria: biografias, atributos, trajes, estatísticas e finais vistos de cada personagem. */
Game.prototype.startGallery = function () { this.gallery = { index: 0 }; this.scene = 'gallery'; };
Game.prototype.updateGallery = function () {
  const g = this.gallery, n = CHARACTERS.length;
  if (this.backPressed()) { Audio_.play('back'); this.scene = 'title'; return; }
  if (this.menuLeft() || this.menuUp()) { g.index = (g.index + n - 1) % n; Audio_.play('menu'); }
  if (this.menuRight() || this.menuDown()) { g.index = (g.index + 1) % n; Audio_.play('menu'); }
};
function drawGallery(ctx, game) {
  const ch = CHARACTERS[game.gallery.index], locked = !charUnlocked(ch);
  drawMenuBackdrop(ctx, game, game.gallery.index % STAGES.length);
  txt(ctx, T('GALERIA'), CFG.W / 2, 50, { font: FONT_DISPLAY, size: 40, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  if (!game.is3D) drawFigureAt(ctx, ch, 300, 560, 1.5, locked ? 'idle' : 'win', game.t, 1, { staff: false });
  const x = 560, w = 660;
  ctx.fillStyle = 'rgba(0,0,0,.6)'; roundRect(ctx, x - 20, 90, w + 40, 540, 14); ctx.fill();
  txt(ctx, ch.name.toUpperCase(), x, 125, { font: FONT_DISPLAY, size: 34, align: 'left', color: ELEMENT_COLORS[ch.element] });
  txt(ctx, `${T(ch.title)}  ·  ${ch.nation}  ·  ${T(ELEMENT_NAMES[ch.element])}${ch.boss ? '  ·  ' + T('CHEFE') : ''}`, x, 158, { size: 15, align: 'left', color: '#dfe7f2', weight: 400 });
  wrapTextLeft(ctx, ch.desc, x, 195, w, 16, '#f2ebdc');
  const stats = [[T('Força'), ch.stats.forca], [T('Velocidade'), ch.stats.velocidade], [T('Alcance'), ch.stats.alcance]];
  stats.forEach(([n, v], i) => { const y = 270 + i * 24; txt(ctx, n, x, y, { size: 14, align: 'left', color: '#cfd8dc', weight: 400 }); for (let k = 0; k < 5; k++) { ctx.fillStyle = k < v ? ELEMENT_COLORS[ch.element] : 'rgba(255,255,255,.15)'; ctx.fillRect(x + 110 + k * 34, y - 5, 28, 10); } });
  const m = buildMoveset(ch);
  txt(ctx, `${T('Especial')}: ${m.special.name}   ·   ${T('Especial 2')}: ${m.special2.name}   ·   ${T('Super')}: ${m.super.name}`, x, 360, { size: 14, align: 'left', color: '#ffd54f', weight: 400 });
  if (ch.stances) txt(ctx, T('Troca de elemento (↓ + especial): {0}', ch.stances.map((s) => T(ELEMENT_NAMES[s])).join(' → ')), x, 384, { size: 13, align: 'left', color: '#bfe9ff', weight: 400 });
  const wins = Save.data.stats.wins[ch.id] || 0, arc = Save.data.stats.arcadeWins[ch.id] || 0;
  const skins = skinList(ch), owned = skins.filter((s) => skinUnlocked(ch, s)).length;
  txt(ctx, T('Vitórias: {0}  ·  Arcades concluídos: {1}  ·  Trajes: {2}/{3}', wins, arc, owned, skins.length), x, 420, { size: 14, align: 'left', color: '#dfe7f2', weight: 400 });
  const camp = CAMPAIGNS[ch.id];
  if (camp) {
    const prog = game.campaignProgress(ch.id);
    txt(ctx, T('Campanha "{0}": {1}', camp.title, prog.done ? T('concluída') : prog.chapter > 0 || prog.node !== camp.start ? T('capítulo {0}', prog.chapter + 1) : T('não iniciada')), x, 450, { size: 14, align: 'left', color: '#dfe7f2', weight: 400 });
    txt(ctx, T('Finais vistos: {0}', prog.endings.length ? prog.endings.map((e) => camp.nodes[Object.keys(camp.nodes).find((k) => camp.nodes[k].id === e)] ? camp.nodes[Object.keys(camp.nodes).find((k) => camp.nodes[k].id === e)].name : e).join(', ') : T('nenhum')), x, 474, { size: 14, align: 'left', color: '#dfe7f2', weight: 400 });
  }
  if (locked) txt(ctx, '🔒 ' + T('Bloqueado: conclua qualquer campanha para liberar'), x, 520, { size: 15, align: 'left', color: '#ff8a65' });
  txt(ctx, `${game.gallery.index + 1} / ${CHARACTERS.length}   ·   ← → ${T('troca')}   ·   Esc ${T('volta')}`, CFG.W / 2, CFG.H - 36, { size: 15, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}
