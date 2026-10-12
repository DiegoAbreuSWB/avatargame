/* Motor de campanha ("Crônicas das Quatro Nações"): capítulos como grafo de nós.
   Tipos de nó: chapter (abre capítulo), dialogue (falas com retratos), choice (escolha com flags/reputação),
   fight (luta com regras: rounds, noHeal, survive, time, mods, level), reward (traje), ending (final).
   Decisão: conteúdo em arquivos JS globais (content/campaigns/<id>.js → CAMPAIGNS[id]) porque JSON não carrega
   em file://. Progresso em Save.data.campaigns[id] = { chapter, node, flags, rep, endings, done }. */
const CAMPAIGNS = window.CAMPAIGNS || (window.CAMPAIGNS = {});

Game.prototype.campaignProgress = function (id) {
  const def = CAMPAIGNS[id];
  const all = Save.data.campaigns || (Save.data.campaigns = {});
  if (!all[id]) all[id] = { chapter: 0, node: def.start, flags: {}, rep: 0, endings: [], done: false };
  return all[id];
};
Game.prototype.campaignReset = function (id) { const def = CAMPAIGNS[id]; Save.data.campaigns[id] = { chapter: 0, node: def.start, flags: {}, rep: 0, endings: (Save.data.campaigns[id] || {}).endings || [], done: false }; Save.save(); };

/* ----- seleção de campanha ----- */
Game.prototype.startCampaignSelect = function () { this.campSel = { index: 0 }; this.scene = 'campaignSelect'; };
Game.prototype.updateCampaignSelect = function () {
  const ids = Object.keys(CAMPAIGNS), n = ids.length + 1;
  if (this.backPressed()) { Audio_.play('back'); this.scene = 'title'; return; }
  if (this.menuUp()) { this.campSel.index = (this.campSel.index + n - 1) % n; Audio_.play('menu'); }
  if (this.menuDown()) { this.campSel.index = (this.campSel.index + 1) % n; Audio_.play('menu'); }
  if (this.confirmPressed()) {
    Audio_.play('confirm');
    if (this.campSel.index === ids.length) { this.scene = 'title'; return; }
    this.campaignLoad(ids[this.campSel.index]);
  }
};
Game.prototype.campaignLoad = function (id) {
  this.camp = { id, def: CAMPAIGNS[id], prog: this.campaignProgress(id) };
  this.scene = 'campaignMap'; this.mapT = 0;
};

/* ----- mapa de capítulos ----- */
Game.prototype.updateCampaignMap = function () {
  this.mapT++;
  if (this.backPressed()) { Audio_.play('back'); this.scene = 'title'; return; }
  if (this.mapT < 15) return;
  if (this.anyPad('kick') && this.camp.prog.done) { Audio_.play('confirm'); this.campaignReset(this.camp.id); this.camp.prog = this.campaignProgress(this.camp.id); return; }
  if (this.confirmPressed()) { Audio_.play('confirm'); if (this.camp.prog.done) { this.campaignReset(this.camp.id); this.camp.prog = this.campaignProgress(this.camp.id); } this.campaignGoto(this.camp.prog.node); }
};

/* ----- execução dos nós ----- */
Game.prototype.campaignGoto = function (nodeId) {
  const def = this.camp.def, prog = this.camp.prog, node = def.nodes[nodeId];
  if (!node) { this.scene = 'campaignMap'; return; }
  prog.node = nodeId; Save.save();
  this.campNode = node;
  switch (node.t) {
    case 'chapter': prog.chapter = node.chapter; Save.save(); this.campMsg = { title: T('Capítulo {0}', node.chapter + 1), text: def.chapters[node.chapter].title, sub: def.chapters[node.chapter].place, next: node.next }; this.scene = 'campaignMsg'; this.msgT = 0; break;
    case 'dialogue': this.dlg = { node, i: 0, chars: 0 }; this.scene = 'dialogue'; break;
    case 'choice': this.choice = { node, index: 0 }; this.scene = 'choice'; break;
    case 'fight': this.campaignFight(node); break;
    case 'reward': { const ch = getCharacter(this.camp.id); const skin = skinList(ch).find((s) => s.id === node.skin); const fresh = skin && Save.unlockSkin(ch.id, skin.id); this.campMsg = { title: T('Recompensa'), text: node.text, sub: skin ? T('Traje desbloqueado: {0}', T(skin.name)) + (fresh ? '' : ' (' + T('já desbloqueado') + ')') : '', next: node.next }; this.scene = 'campaignMsg'; this.msgT = 0; break; }
    case 'ending': if (!prog.endings.includes(node.id)) prog.endings.push(node.id); prog.done = true; Save.save(); this.campEnding = node; this.endingT = 0; this.scene = 'campaignEnding'; Audio_.play('win'); break;
    case 'branch': this.campaignGoto(node.when(prog)); break;
    default: this.scene = 'campaignMap';
  }
};
Game.prototype.campaignFight = function (node) {
  this.mode = 'campaign';
  this.select.p1 = CHARACTERS.findIndex((c) => c.id === this.camp.id);
  this.select.p2 = CHARACTERS.findIndex((c) => c.id === node.opp);
  this.select.skin2 = 0; this.select.comp2 = 'none';
  this.stageIndex = Math.max(0, STAGES.findIndex((s) => s.id === node.stage));
  this.modifiers = (node.mods || []).slice();
  this.aiLevelOverride = node.level || 'normal';
  this.campaignRounds = node.rounds || 1;
  this.startMatch();
  if (node.noHeal && this.campaignHp != null) { const a = this.fighters[0]; a.hp = Math.max(1, this.campaignHp); a.hpGhost = a.hp; }
  if (node.bossHp) { const b = this.fighters[1]; b.maxHp = node.bossHp; b.hp = node.bossHp; b.hpGhost = node.bossHp; }
};
Game.prototype.onCampaignFightEnd = function (winner) {
  const node = this.campNode, won = winner === this.fighters[0];
  this.aiLevelOverride = null; this.modifiers = [];
  if (won) { this.campaignHp = this.fighters[0].hp; this.camp.prog.flags['won_' + this.camp.prog.node] = true; this.campaignGoto(node.win); }
  else { this.campaignHp = null; this.retryT = 0; this.scene = 'campaignRetry'; }
};
Game.prototype.updateCampaignRetry = function () {
  this.retryT++;
  if (this.backPressed()) { Audio_.play('back'); this.mode = '2p'; this.scene = 'campaignMap'; return; }
  if (this.retryT > 20 && this.confirmPressed()) { Audio_.play('confirm'); this.campaignGoto(this.camp.prog.node); }
};
Game.prototype.updateDialogue = function () {
  const d = this.dlg, line = d.node.lines[d.i];
  d.chars += 1.2;
  if (this.backPressed()) { Audio_.play('back'); this.scene = 'campaignMap'; return; }
  if (this.confirmPressed()) {
    if (d.chars < line.text.length) { d.chars = line.text.length; return; }
    Audio_.play('menu'); d.i++; d.chars = 0;
    if (d.i >= d.node.lines.length) this.campaignGoto(d.node.next);
  }
};
Game.prototype.updateChoice = function () {
  const c = this.choice, n = c.node.options.length;
  if (this.menuUp()) { c.index = (c.index + n - 1) % n; Audio_.play('menu'); }
  if (this.menuDown()) { c.index = (c.index + 1) % n; Audio_.play('menu'); }
  if (this.confirmPressed()) {
    Audio_.play('confirm');
    const opt = c.node.options[c.index], prog = this.camp.prog;
    if (opt.flag) prog.flags[opt.flag] = true;
    if (opt.rep) prog.rep += opt.rep;
    prog.flags['choice_' + c.node.id] = c.index; Save.save();
    this.campaignGoto(opt.next);
  }
};
Game.prototype.updateCampaignMsg = function () {
  this.msgT++;
  if (this.msgT > 15 && (this.confirmPressed() || this.backPressed())) { Audio_.play('confirm'); this.campaignGoto(this.campMsg.next); }
};
Game.prototype.updateCampaignEnding = function () {
  this.endingT++;
  if (this.endingT > 40 && (this.confirmPressed() || this.backPressed())) { Audio_.play('confirm'); this.mode = '2p'; this.newUnlocks = checkUnlocks(); this.scene = 'campaignMap'; this.mapT = 0; }
};

/* ----- desenho ----- */
function campaignSpeaker(id) { return getCharacter(id) || { id, name: id, colors: { skin: '#f3cfae', primary: '#777', secondary: '#555', accent: '#999' }, element: 'nao' }; }

function drawCampaignSelect(ctx, game) {
  drawMenuBackdrop(ctx, game, 2);
  txt(ctx, T('CRÔNICAS DAS QUATRO NAÇÕES'), CFG.W / 2, 70, { font: FONT_DISPLAY, size: 40, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  txt(ctx, T('Uma jornada própria para cada personagem: lutas, diálogos, escolhas e finais diferentes.'), CFG.W / 2, 112, { size: 16, color: '#cfd8dc', weight: 400, stroke: 'rgba(0,0,0,.8)' });
  const ids = Object.keys(CAMPAIGNS);
  ids.forEach((id, i) => {
    const def = CAMPAIGNS[id], ch = getCharacter(id), prog = game.campaignProgress(id), sel = i === game.campSel.index;
    const y = 190 + i * 70;
    ctx.fillStyle = sel ? 'rgba(255,213,79,.18)' : 'rgba(0,0,0,.5)'; roundRect(ctx, 240, y - 28, 800, 56, 10); ctx.fill();
    if (!game.is3D) drawPortrait(ctx, ch, 280, y, 22, 1);
    txt(ctx, `${ch.name} · ${def.title}`, 320, y - 9, { size: 20, align: 'left', color: sel ? '#fff' : '#dfe7f2' });
    const status = prog.done ? T('Concluída · finais: {0}/{1}', prog.endings.length, def.endingsCount) : prog.chapter > 0 || prog.node !== def.start ? T('Capítulo {0} de {1}', prog.chapter + 1, def.chapters.length) : T('Não iniciada');
    txt(ctx, status, 320, y + 13, { size: 13, align: 'left', color: '#9fb0bb', weight: 400 });
  });
  const y = 190 + ids.length * 70, sel = game.campSel.index === ids.length;
  txt(ctx, (sel ? '▶  ' : '') + T('Voltar'), CFG.W / 2, y, { size: 22, color: sel ? '#fff' : '#aaa' });
  txt(ctx, T('Concluir qualquer campanha desbloqueia o Avatar Roku.'), CFG.W / 2, CFG.H - 40, { size: 14, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}

function drawCampaignMap(ctx, game) {
  const { def, prog } = game.camp, ch = getCharacter(game.camp.id);
  const cur = def.chapters[Math.min(prog.chapter, def.chapters.length - 1)];
  drawMenuBackdrop(ctx, game, Math.max(0, STAGES.findIndex((s) => s.id === cur.stage)));
  txt(ctx, def.title.toUpperCase(), CFG.W / 2, 56, { font: FONT_DISPLAY, size: 36, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  txt(ctx, `${ch.name} · ${def.subtitle}`, CFG.W / 2, 94, { size: 16, color: '#cfd8dc', weight: 400, stroke: 'rgba(0,0,0,.8)' });
  // trilha de capítulos
  const n = def.chapters.length, x0 = 140, x1 = CFG.W - 140, y = 300;
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  def.chapters.forEach((c, i) => {
    const x = x0 + (i * (x1 - x0)) / (n - 1), done = i < prog.chapter || prog.done, current = i === prog.chapter && !prog.done;
    ctx.beginPath(); ctx.arc(x, y, current ? 20 : 15, 0, Math.PI * 2);
    ctx.fillStyle = done ? '#ffd54f' : current ? '#4fc3f7' : 'rgba(0,0,0,.6)'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    txt(ctx, String(i + 1), x, y + 1, { size: 14, color: done || current ? '#1b1b1b' : '#fff' });
    txt(ctx, c.title, x, y + 44 + (i % 2) * 20, { size: 13, color: current ? '#fff' : done ? '#ffd54f' : '#9fb0bb', weight: current ? 700 : 400, stroke: 'rgba(0,0,0,.8)' });
    txt(ctx, c.place, x, y - 34 - (i % 2) * 16, { size: 11, color: '#b0bec5', weight: 400, stroke: 'rgba(0,0,0,.8)' });
  });
  ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, 240, 400, 800, 150, 12); ctx.fill();
  const repTxt = prog.rep > 0 ? T('Honra verdadeira') : prog.rep < 0 ? T('Honra pelo poder') : T('Indefinida');
  txt(ctx, prog.done ? T('Campanha concluída. Final: {0}', T(def.endingName(prog))) : T('Capítulo {0}: {1}', prog.chapter + 1, cur.title), CFG.W / 2, 430, { font: FONT_DISPLAY, size: 22, color: '#fff' });
  txt(ctx, prog.done ? '' : cur.summary, CFG.W / 2, 462, { size: 15, color: '#dfe7f2', weight: 400 });
  txt(ctx, T('Rota: {0}  ·  Finais vistos: {1}/{2}', repTxt, prog.endings.length, def.endingsCount), CFG.W / 2, 495, { size: 14, color: '#ffd54f', weight: 400 });
  txt(ctx, prog.done ? T('Enter recomeça do capítulo 1 (os finais vistos ficam salvos)') : T('O progresso é salvo a cada passo. Esc volta ao menu sem perder nada.'), CFG.W / 2, 525, { size: 13, color: '#9fb0bb', weight: 400 });
  txt(ctx, prog.done ? T('Enter = jogar de novo · Esc = menu') : T('Enter = continuar · Esc = menu'), CFG.W / 2, CFG.H - 40, { size: 16, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}

function drawDialogue(ctx, game) {
  const d = game.dlg, line = d.node.lines[d.i], who = campaignSpeaker(line.who), player = getCharacter(game.camp.id);
  const bgIdx = Math.max(0, STAGES.findIndex((s) => s.id === (d.node.bg || 'templo')));
  if (game.is3D) { ctx.fillStyle = 'rgba(8,10,18,.25)'; ctx.fillRect(0, 0, CFG.W, CFG.H); }
  else { const st = STAGES[bgIdx]; st.draw(ctx, game.t); st.drawFloor(ctx); ctx.fillStyle = 'rgba(8,10,18,.35)'; ctx.fillRect(0, 0, CFG.W, CFG.H);
    drawFigureAt(ctx, player, 330, 560, 1.3, 'idle', game.t, 1, { staff: false });
    if (d.node.with) drawFigureAt(ctx, campaignSpeaker(d.node.with), 950, 560, 1.3, 'idle', game.t + 20, -1, { staff: false }); }
  // caixa de texto
  const bx = 120, by = CFG.H - 190, bw = CFG.W - 240, bh = 150;
  ctx.fillStyle = 'rgba(8,10,18,.88)'; roundRect(ctx, bx, by, bw, bh, 14); ctx.fill();
  ctx.strokeStyle = ELEMENT_COLORS[who.element] || '#ffd54f'; ctx.lineWidth = 2; roundRect(ctx, bx, by, bw, bh, 14); ctx.stroke();
  drawPortrait(ctx, who, bx + 56, by + 60, 40, 1);
  txt(ctx, who.name.toUpperCase(), bx + 120, by + 30, { font: FONT_DISPLAY, size: 18, align: 'left', color: ELEMENT_COLORS[who.element] || '#ffd54f' });
  const shown = line.text.slice(0, Math.floor(d.chars));
  wrapTextLeft(ctx, shown, bx + 120, by + 62, bw - 150, 17, '#f2ebdc');
  txt(ctx, `${d.i + 1}/${d.node.lines.length}  ·  ${T('Enter avança · Esc volta ao mapa')}`, bx + bw - 20, by + bh - 16, { size: 12, align: 'right', color: '#9fb0bb', weight: 400 });
  if (d.node.caption) txt(ctx, d.node.caption, CFG.W / 2, 60, { font: FONT_DISPLAY, size: 26, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 5 });
}
function wrapTextLeft(ctx, text, x, y, maxW, size, color) {
  ctx.save(); ctx.font = `400 ${size}px ${FONT_BODY}`;
  const words = text.split(' '); const lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); ctx.restore();
  lines.forEach((l, i) => txt(ctx, l, x, y + i * (size + 6), { size, align: 'left', color, weight: 400 }));
}

function drawChoice(ctx, game) {
  const c = game.choice;
  drawMenuBackdrop(ctx, game, Math.max(0, STAGES.findIndex((s) => s.id === (c.node.bg || 'templo'))));
  txt(ctx, T('ESCOLHA'), CFG.W / 2, 90, { font: FONT_DISPLAY, size: 40, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, 190, 130, 900, 90, 12); ctx.fill();
  wrapTextLeft(ctx, c.node.prompt, 210, 160, 860, 18, '#f2ebdc');
  c.node.options.forEach((o, i) => {
    const y = 270 + i * 120, sel = i === c.index;
    ctx.fillStyle = sel ? 'rgba(255,213,79,.18)' : 'rgba(0,0,0,.5)'; roundRect(ctx, 190, y - 40, 900, 100, 12); ctx.fill();
    if (sel) { ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2; roundRect(ctx, 190, y - 40, 900, 100, 12); ctx.stroke(); }
    txt(ctx, (sel ? '▶  ' : '') + o.text, 215, y - 14, { size: 20, align: 'left', color: sel ? '#fff' : '#dfe7f2' });
    txt(ctx, o.hint || '', 215, y + 16, { size: 14, align: 'left', color: '#9fb0bb', weight: 400 });
  });
  txt(ctx, T('As escolhas mudam a rota e o final. Cenários alternativos são hipotéticos, não a história da série.'), CFG.W / 2, CFG.H - 40, { size: 13, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}
function drawCampaignMsg(ctx, game) {
  const m = game.campMsg;
  drawMenuBackdrop(ctx, game, Math.max(0, STAGES.findIndex((s) => s.id === (game.camp.def.chapters[game.camp.prog.chapter] || {}).stage)));
  txt(ctx, m.title.toUpperCase(), CFG.W / 2, 240, { font: FONT_DISPLAY, size: 34, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  txt(ctx, m.text, CFG.W / 2, 310, { font: FONT_DISPLAY, size: 44, color: '#fff', stroke: 'rgba(0,0,0,.9)', strokeWidth: 6 });
  if (m.sub) txt(ctx, m.sub, CFG.W / 2, 370, { size: 20, color: '#80deea', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, T('Enter para continuar'), CFG.W / 2, CFG.H - 40, { size: 16, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}
function drawCampaignRetry(ctx, game) {
  drawMenuBackdrop(ctx, game, game.stageIndex);
  txt(ctx, T('DERROTA'), CFG.W / 2, 240, { font: FONT_DISPLAY, size: 64, color: '#ff5252', stroke: '#3b0000', strokeWidth: 8 });
  txt(ctx, T('A história continua de onde parou. Tentar de novo?'), CFG.W / 2, 320, { size: 22, color: '#fff', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, T('Enter = tentar de novo · Esc = voltar ao mapa'), CFG.W / 2, 380, { size: 16, color: '#b0bec5' });
}
function drawCampaignEnding(ctx, game) {
  const e = game.campEnding, ch = getCharacter(game.camp.id);
  drawMenuBackdrop(ctx, game, Math.max(0, STAGES.findIndex((s) => s.id === (e.bg || 'palacio'))));
  if (!game.is3D) drawFigureAt(ctx, ch, 300, 600, 1.5, 'win', game.t, 1, { staff: false });
  txt(ctx, T('FINAL: {0}', e.name).toUpperCase(), CFG.W / 2 + 120, 90, { font: FONT_DISPLAY, size: 36, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  const shown = Math.min(e.lines.length, Math.floor(game.endingT / 90) + 1);
  ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, 480, 140, 740, 60 + e.lines.length * 48, 12); ctx.fill();
  for (let i = 0; i < shown; i++) wrapText(ctx, e.lines[i], 850, 180 + i * 48, 700, 18, '#fff', Math.min(1, (game.endingT - i * 90) / 30));
  txt(ctx, T('Enter para voltar ao mapa'), CFG.W / 2, CFG.H - 40, { size: 16, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}
