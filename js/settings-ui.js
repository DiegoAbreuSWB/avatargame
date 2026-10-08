/* Telas de Configurações e de remapeamento de controles (métodos adicionados à classe Game). */
const REMAP_ACTIONS = [
  ['up', 'Pular / Cima'], ['down', 'Agachar / Baixo'], ['left', 'Esquerda'], ['right', 'Direita'],
  ['punch', 'Soco'], ['kick', 'Chute'], ['special', 'Especial (dobra)'], ['super', 'Super'],
];

Game.prototype.settingsRows = function () {
  const d = Settings.data;
  const lbl = (m) => `${m.labels.move} · ${m.labels.punch} ${m.labels.kick} ${m.labels.special} ${m.labels.super}`;
  return [
    { key: 'lang', label: 'Idioma', values: ['pt', 'en'], names: { pt: 'Português', en: 'Inglês' } },
    { key: 'graphics', label: 'Gráficos', values: ['3d', '2d'], names: { '3d': '3D', '2d': '2D clássico' }, disabled: !this.r3d, note: this.r3d ? '' : 'WebGL indisponível' },
    { key: 'sound', label: 'Efeitos sonoros', values: [true, false], names: { true: 'Ligados', false: 'Desligados' } },
    { key: 'music', label: 'Música', values: [true, false], names: { true: 'Ligada', false: 'Desligada' } },
    { key: 'difficulty', label: 'Dificuldade da CPU', values: ['easy', 'normal', 'hard'], names: { easy: 'Fácil', normal: 'Normal', hard: 'Difícil' } },
    { key: 'roundTime', label: 'Tempo do round', values: [60, 99, 0], names: { 60: '60 s', 99: '99 s', 0: 'Sem limite' } },
    { key: 'roundsToWin', label: 'Rounds para vencer', values: [1, 2, 3], names: { 1: '1', 2: '2 (melhor de 3)', 3: '3 (melhor de 5)' } },
    { key: 'touch', label: 'Controles de toque', values: ['auto', 'on', 'off'], names: { auto: 'Automático', on: 'Sempre', off: 'Nunca' } },
    { key: 'debug', label: 'Mostrar hitboxes (F1)', values: [false, true], names: { false: 'Não', true: 'Sim' } },
    { action: 'remap', player: 'p1', label: 'Controles do Jogador 1', value: lbl(KEYMAPS.p1) },
    { action: 'remap', player: 'p2', label: 'Controles do Jogador 2', value: lbl(KEYMAPS.p2) },
    { action: 'reset', label: 'Restaurar padrões', value: '' },
    { action: 'back', label: 'Voltar', value: '' },
  ].map((r) => { if (r.key) { const n = r.names[d[r.key]]; r.value = T(n !== undefined ? n : String(d[r.key])); } r.label = T(r.label); if (r.note) r.note = T(r.note); return r; });
};

Game.prototype.applySettingsSideEffects = function () {
  const d = Settings.data;
  this.use3D = !!this.r3d && d.graphics === '3d';
  Audio_.setMuted(!d.sound);
  this.debug = !!d.debug;
};

Game.prototype.updateSettings = function () {
  const rows = this.settingsRows(), n = rows.length;
  if (Input.pressed('Escape')) { Audio_.play('back'); this.scene = 'title'; return; }
  if (this.menuUp()) { this.settingsIndex = (this.settingsIndex + n - 1) % n; Audio_.play('menu'); }
  if (this.menuDown()) { this.settingsIndex = (this.settingsIndex + 1) % n; Audio_.play('menu'); }
  const row = rows[this.settingsIndex];
  const left = this.menuLeft(), right = this.menuRight(), confirm = this.confirmPressed();
  if (row.key && !row.disabled && (left || right || confirm)) {
    const i = row.values.indexOf(Settings.data[row.key]);
    const j = (i + (left ? -1 : 1) + row.values.length) % row.values.length;
    Settings.data[row.key] = row.values[j];
    Settings.save(); this.applySettingsSideEffects(); Audio_.play('menu');
  } else if (row.action && confirm) {
    Audio_.play('confirm');
    if (row.action === 'remap') { this.remap = { player: row.player, index: 0, listening: false, message: '' }; this.scene = 'remap'; }
    else if (row.action === 'reset') { Settings.reset(); this.applySettingsSideEffects(); }
    else if (row.action === 'back') this.scene = 'title';
  }
};

Game.prototype.updateRemap = function () {
  const r = this.remap, keys = Settings.data.keys[r.player], n = REMAP_ACTIONS.length + 2;
  if (r.listening) {
    const codes = Input.pressedCodes();
    if (!codes.length) return;
    const code = codes[0];
    if (code === 'Escape') { r.listening = false; r.message = ''; return; }
    if (RESERVED_KEYS.has(code)) { r.message = T('{0} é reservada pelo jogo.', keyLabel(code)); return; }
    const action = REMAP_ACTIONS[r.index][0];
    for (const p of ['p1', 'p2']) for (const a in Settings.data.keys[p]) {
      if (Settings.data.keys[p][a] === code && !(p === r.player && a === action)) {
        const who = p === r.player ? T('por "{0}"', T(REMAP_ACTIONS.find((x) => x[0] === a)[1])) : T(p === 'p1' ? 'pelo Jogador 1' : 'pelo Jogador 2');
        r.message = T('{0} já está em uso {1}.', keyLabel(code), who); return;
      }
    }
    keys[action] = code; Settings.save(); r.listening = false; r.message = ''; Audio_.play('confirm');
    r.index = Math.min(r.index + 1, REMAP_ACTIONS.length - 1);
    return;
  }
  if (Input.pressed('Escape')) { Audio_.play('back'); this.scene = 'settings'; return; }
  if (this.menuUp()) { r.index = (r.index + n - 1) % n; Audio_.play('menu'); }
  if (this.menuDown()) { r.index = (r.index + 1) % n; Audio_.play('menu'); }
  if (Input.pressed('Enter') || Input.pressed('Space')) {
    if (r.index < REMAP_ACTIONS.length) { r.listening = true; r.message = ''; Audio_.play('menu'); }
    else if (r.index === REMAP_ACTIONS.length) { Settings.resetKeys(r.player); Audio_.play('confirm'); }
    else { Audio_.play('back'); this.scene = 'settings'; }
  }
};

function drawSettings(ctx, game) {
  drawMenuBackdrop(ctx, game, 2);
  txt(ctx, T('CONFIGURAÇÕES'), CFG.W / 2, 58, { font: FONT_DISPLAY, size: 46, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  const rows = game.settingsRows();
  const x0 = 200, w = 880, y0 = 108, rh = 38;
  ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, x0 - 20, y0 - 14, w + 40, rows.length * rh + 28, 12); ctx.fill();
  rows.forEach((r, i) => {
    const y = y0 + i * rh + rh / 2, sel = i === game.settingsIndex;
    if (sel) { ctx.fillStyle = 'rgba(255,213,79,.16)'; roundRect(ctx, x0 - 8, y - rh / 2 + 3, w + 16, rh - 6, 6); ctx.fill(); }
    const col = r.disabled ? '#777' : sel ? '#fff' : '#cfd8dc';
    txt(ctx, r.label, x0, y, { size: 19, align: 'left', color: col, weight: sel ? 700 : 400 });
    const val = r.disabled && r.note ? r.note : r.value;
    if (r.key) txt(ctx, (sel && !r.disabled ? '◀  ' : '') + val + (sel && !r.disabled ? '  ▶' : ''), x0 + w, y, { size: 19, align: 'right', color: sel ? '#ffd54f' : '#dfe7f2' });
    else txt(ctx, val, x0 + w, y, { size: 15, align: 'right', color: '#9fb0bb', weight: 400 });
  });
  txt(ctx, T('↑/↓ escolhe · ←/→ ou Enter altera · Esc volta · As mudanças são salvas na hora'), CFG.W / 2, CFG.H - 36, { size: 15, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}

function drawRemap(ctx, game) {
  drawMenuBackdrop(ctx, game, 2);
  const r = game.remap, keys = Settings.data.keys[r.player];
  const col = r.player === 'p1' ? '#f2a93b' : '#4fc3f7';
  txt(ctx, T(r.player === 'p1' ? 'CONTROLES DO JOGADOR 1' : 'CONTROLES DO JOGADOR 2'), CFG.W / 2, 64, { font: FONT_DISPLAY, size: 40, color: col, stroke: 'rgba(0,0,0,.9)', strokeWidth: 6 });
  const x0 = 300, w = 680, y0 = 125, rh = 42;
  const total = REMAP_ACTIONS.length + 2;
  ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, x0 - 20, y0 - 16, w + 40, total * rh + 32, 12); ctx.fill();
  for (let i = 0; i < total; i++) {
    const y = y0 + i * rh + rh / 2, sel = i === r.index;
    if (sel) { ctx.fillStyle = 'rgba(255,213,79,.16)'; roundRect(ctx, x0 - 8, y - rh / 2 + 3, w + 16, rh - 6, 6); ctx.fill(); }
    if (i < REMAP_ACTIONS.length) {
      const [a, label] = REMAP_ACTIONS[i];
      txt(ctx, T(label), x0, y, { size: 20, align: 'left', color: sel ? '#fff' : '#cfd8dc', weight: sel ? 700 : 400 });
      const listening = sel && r.listening;
      const kt = listening ? T('PRESSIONE UMA TECLA...') : keyLabel(keys[a]);
      ctx.fillStyle = listening ? 'rgba(255,213,79,.35)' : 'rgba(255,255,255,.12)';
      const kw = Math.max(70, kt.length * 12 + 24);
      roundRect(ctx, x0 + w - kw, y - 15, kw, 30, 6); ctx.fill();
      txt(ctx, kt, x0 + w - kw / 2, y, { size: 17, color: listening ? '#ffd54f' : '#fff' });
    } else {
      const label = i === REMAP_ACTIONS.length ? T('Restaurar padrões deste jogador') : T('Voltar');
      txt(ctx, label, x0, y, { size: 20, align: 'left', color: sel ? '#fff' : '#cfd8dc', weight: sel ? 700 : 400 });
    }
  }
  if (r.message) txt(ctx, r.message, CFG.W / 2, CFG.H - 72, { size: 17, color: '#ff8a65', stroke: 'rgba(0,0,0,.9)' });
  txt(ctx, r.listening ? T('Esc cancela') : T('Enter para redefinir a tecla · Esc volta · Teclas reservadas: Enter, Esc, M, F1 a F12'), CFG.W / 2, CFG.H - 40, { size: 15, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}
