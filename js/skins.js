/* Trajes (paletas alternativas) e desbloqueios.
   Decisão: um traje é só um conjunto de cores; 2D e 3D já derivam tudo das cores, então nenhum desenho novo é necessário.
   Cada personagem tem um traje temático (desbloqueado ao terminar o Arcade com ele) e a "roupa de treino" (5 vitórias). */
const SKINS = {
  aang:   [{ id: 'nacaoFogo', name: 'Disfarce da Nação do Fogo', colors: { primary: '#b3261e', secondary: '#3a1512', accent: '#e3b23c' } }],
  katara: [{ id: 'nacaoFogo', name: 'Disfarce da Nação do Fogo', colors: { primary: '#8e1b1b', secondary: '#2b0d0d', accent: '#e3b23c' } }],
  zuko:   [{ id: 'espiritoAzul', name: 'Espírito Azul', colors: { primary: '#1f2a44', secondary: '#0d1322', accent: '#2f6fc4', skin: '#2f6fc4', hair: '#0d1322' } }],
  toph:   [{ id: 'bandida', name: 'A Bandida Cega (arena)', colors: { primary: '#2e7d32', secondary: '#1b5e20', accent: '#e3b23c' } }],
  azula:  [{ id: 'branco', name: 'Traje branco', colors: { primary: '#eceff1', secondary: '#b0bec5', accent: '#8e1b1b' } }],
  sokka:  [{ id: 'kyoshi', name: 'Guerreiro Kyoshi', colors: { primary: '#2e7d32', secondary: '#1b5e20', accent: '#e3b23c', skin: '#f5efe8' } }],
  tylee:  [{ id: 'kyoshi', name: 'Guerreira Kyoshi', colors: { primary: '#2e7d32', secondary: '#1b5e20', accent: '#e3b23c', skin: '#f5efe8' } }],
  iroh:   [{ id: 'lotus', name: 'Lótus Branco', colors: { primary: '#eceff1', secondary: '#546e7a', accent: '#4fc3f7' } }],
  mai:    [{ id: 'ember', name: 'Férias na Ilha Ember', colors: { primary: '#c62828', secondary: '#4a1a1a', accent: '#ffd54f' } }],
  ozai:   [{ id: 'fenix', name: 'Rei Fênix', colors: { primary: '#7a0000', secondary: '#000000', accent: '#ffd54f' } }],
  suki:   [{ id: 'nacaoFogo', name: 'Disfarce da Nação do Fogo', colors: { primary: '#8e1b1b', secondary: '#2b0d0d', accent: '#e3b23c', skin: '#f3d5b5' } }],
  bumi:   [{ id: 'pedra', name: 'Rei de Pedra', colors: { primary: '#78909c', secondary: '#cfd8dc', accent: '#e3b23c' } }],
};
const TRAINING_SKIN = { id: 'treino', name: 'Roupa de treino', unlock: { type: 'wins', n: 5 } };

function skinList(ch) {
  const list = [{ id: 'padrao', name: 'Padrão', colors: ch.colors }];
  for (const s of SKINS[ch.id] || []) list.push({ id: s.id, name: s.name, colors: Object.assign({}, ch.colors, s.colors), unlock: { type: 'arcade' } });
  list.push({ id: 'treino', name: TRAINING_SKIN.name, colors: Object.assign({}, ch.colors, { primary: '#eceff1', secondary: '#78909c', accent: ELEMENT_COLORS[ch.element] }), unlock: TRAINING_SKIN.unlock });
  return list;
}
function skinUnlocked(ch, skin) { return skin.id === 'padrao' || Save.hasSkin(ch.id, skin.id); }
function skinUnlockText(skin) {
  if (!skin.unlock) return '';
  return skin.unlock.type === 'arcade' ? T('Termine o Arcade com este personagem') : T('Vença {0} lutas com este personagem', skin.unlock.n);
}
/* personagem com cores do traje; mesma identidade de objeto para o mesmo (personagem, traje) */
const _skinCache = new Map();
function skinnedChar(ch, skinIdx) {
  const list = skinList(ch); const idx = clamp(skinIdx || 0, 0, list.length - 1);
  if (idx === 0) return ch;
  const key = ch.id + ':' + list[idx].id;
  if (!_skinCache.has(key)) _skinCache.set(key, Object.assign({}, ch, { colors: list[idx].colors, skinId: list[idx].id }));
  return _skinCache.get(key);
}
/* verifica condições e desbloqueia; devolve a lista do que acabou de abrir */
function checkUnlocks() {
  const out = [];
  for (const ch of CHARACTERS) {
    const wins = Save.data.stats.wins[ch.id] || 0, arcade = Save.data.stats.arcadeWins[ch.id] || 0;
    for (const s of skinList(ch)) {
      if (!s.unlock || Save.hasSkin(ch.id, s.id)) continue;
      const ok = s.unlock.type === 'arcade' ? arcade > 0 : wins >= s.unlock.n;
      if (ok && Save.unlockSkin(ch.id, s.id)) out.push({ char: ch, skin: s });
    }
  }
  return out;
}
function drawSkinLabel(ctx, ch, skinIdx, x, y, keyLabel) {
  const list = skinList(ch), skin = list[clamp(skinIdx || 0, 0, list.length - 1)];
  const locked = !skinUnlocked(ch, skin);
  txt(ctx, (locked ? '🔒 ' : '') + T('Traje: {0}', T(skin.name)) + (list.length > 1 ? `  (${keyLabel})` : ''), x, y, { size: 13, color: locked ? '#ff8a65' : '#dfe7f2', weight: 400, stroke: 'rgba(0,0,0,.8)' });
  if (locked) txt(ctx, skinUnlockText(skin), x, y + 16, { size: 12, color: '#ff8a65', weight: 400, stroke: 'rgba(0,0,0,.8)' });
}
