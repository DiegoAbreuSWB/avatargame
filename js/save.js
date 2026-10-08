/* Salvamento versionado (progresso, estatísticas, desbloqueios, desafio diário, torneios).
   Decisão: um único objeto com "schema"; ao carregar, migra esquemas antigos passo a passo; JSON corrompido vai para
   uma chave de backup e o jogo segue com os padrões. Dados mais antigos (recorde de sobrevivência em chave avulsa)
   são importados na migração. Separado de Settings porque preferências e progresso têm ciclos de vida diferentes. */
const Save = (() => {
  const KEY = 'avatarArena.save', SCHEMA = 1;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const DEFAULTS = {
    schema: SCHEMA,
    unlocks: { skins: {} },                                     // { aang: ['nacaoFogo', 'treino'] }
    stats: { matches: 0, wins: {}, arcadeWins: {}, survivalBest: 0 },   // wins/arcadeWins por id de personagem
    daily: {},                                                   // { '20261008': { best: 1234, won: true, tries: 2 } }
    tournament: { champions: [] },                               // [{ date, char, size }]
  };
  let data = clone(DEFAULTS);

  function migrate(obj) {
    if (!obj || typeof obj !== 'object') return clone(DEFAULTS);
    let s = obj.schema || 0;
    // esquema 0 -> 1: estrutura inicial; importa o recorde antigo de sobrevivência (chave avulsa)
    if (s < 1) {
      const base = clone(DEFAULTS);
      for (const k of Object.keys(base)) if (obj[k] && typeof obj[k] === 'object') base[k] = Object.assign(base[k], obj[k]);
      obj = base; s = 1;
    }
    // (futuras migrações: if (s < 2) { ... s = 2; })
    const out = clone(DEFAULTS);
    for (const k of Object.keys(out)) if (obj[k] !== undefined) out[k] = typeof out[k] === 'object' ? Object.assign(out[k], obj[k]) : obj[k];
    out.schema = SCHEMA;
    return out;
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        try { data = migrate(JSON.parse(raw)); }
        catch (e) { try { localStorage.setItem(KEY + '.bak', raw); } catch (e2) { /* */ } data = clone(DEFAULTS); }
      } else data = clone(DEFAULTS);
      const legacy = parseInt(localStorage.getItem('avatarArena.survivalBest') || '0', 10);
      if (legacy > (data.stats.survivalBest || 0)) data.stats.survivalBest = legacy;
    } catch (e) { data = clone(DEFAULTS); }
    return data;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* armazenamento indisponível */ } }
  function reset() { data = clone(DEFAULTS); save(); }
  function importRaw(raw) { data = migrate(typeof raw === 'string' ? JSON.parse(raw) : raw); save(); return data; }

  /* estatísticas */
  function recordMatch(winnerId, loserId, mode) {
    data.stats.matches++;
    if (winnerId) data.stats.wins[winnerId] = (data.stats.wins[winnerId] || 0) + 1;
    if (mode === 'arcadeComplete' && winnerId) data.stats.arcadeWins[winnerId] = (data.stats.arcadeWins[winnerId] || 0) + 1;
    save();
  }
  function hasSkin(charId, skinId) { return (data.unlocks.skins[charId] || []).includes(skinId); }
  function unlockSkin(charId, skinId) {
    const list = data.unlocks.skins[charId] || (data.unlocks.skins[charId] = []);
    if (list.includes(skinId)) return false;
    list.push(skinId); save(); return true;
  }
  return { load, save, reset, importRaw, migrate, recordMatch, hasSkin, unlockSkin, get data() { return data; }, SCHEMA, DEFAULTS };
})();
