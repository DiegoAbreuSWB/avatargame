/* Modificadores de luta ("regras especiais"): eventos ambientais e regras de festa.
   Decisão: cada regra é um conjunto de ganchos chamados pelo Game (início da partida/round, a cada frame,
   multiplicadores de dano e chi, ajuste de projéteis). Tudo determinístico: sorteios usam Rng e contadores de round,
   para que o Online e o Desafio Diário reproduzam a mesma luta. Nada aqui toca Fighter diretamente além de flags. */
const MODIFIERS = [
  { id: 'eclipse', name: 'Eclipse Solar', desc: 'Dobradores de fogo perdem a dobra: sem especiais nem super.' },
  { id: 'luaCheia', name: 'Lua Cheia', desc: 'Dobradores de água causam 30% a mais de dano e ganham chi 50% mais rápido.' },
  { id: 'cometa', name: 'Cometa de Sozin', desc: 'Dobradores de fogo causam 40% a mais de dano; projéteis de fogo maiores e mais rápidos.' },
  { id: 'tempestade', name: 'Tempestade', desc: 'Raios caem em posições sorteadas e o vento empurra os lutadores.' },
  { id: 'vidaContinua', name: 'Vida contínua', desc: 'A vida não se recupera entre os rounds.' },
  { id: 'tempoCurto', name: 'Round de 30 segundos', desc: 'Rounds curtos: quem tiver mais vida vence.' },
  { id: 'superInfinito', name: 'Super infinito', desc: 'A barra de CHI fica sempre cheia.' },
];

const Modifiers = (() => {
  const has = (game, id) => !!(game.modifiers && game.modifiers.includes(id));
  const isFire = (f) => f.char.element === 'fogo';
  const isWater = (f) => f.char.element === 'agua';

  function onMatchStart(game) {
    game.roundTimeOverride = has(game, 'tempoCurto') ? 30 : null;
    game.carryHp = null; game.wind = null; game.nextBolt = 0;
  }
  function onRoundStart(game) {
    if (has(game, 'vidaContinua') && game.carryHp) {
      game.fighters.forEach((f, i) => { f.hp = Math.max(1, game.carryHp[i]); f.hpGhost = f.hp; });
    }
    game.wind = null; game.nextBolt = 240;
    for (const f of game.fighters) f.noBending = has(game, 'eclipse') && isFire(f);
  }
  function onRoundEnd(game) {
    if (has(game, 'vidaContinua')) game.carryHp = game.fighters.map((f) => f.hp);
  }
  /* chamado a cada frame simulado da luta (depois dos updates dos lutadores) */
  function onFrame(game) {
    if (!game.modifiers || !game.modifiers.length) return;
    for (const f of game.fighters) {
      f.noBending = has(game, 'eclipse') && isFire(f);
      if (has(game, 'superInfinito')) f.chi = CFG.MAX_CHI;
    }
    if (has(game, 'tempestade') && game.phase === 'play') {
      const t = game.roundFrame;
      if (!game.wind || t >= game.wind.until) game.wind = { dir: Rng.pick([-1, 0, 1, 1, -1]), until: t + Rng.int(240, 480) };
      if (game.wind.dir) for (const f of game.fighters) if (f.grounded && ['idle', 'walk', 'crouch', 'block', 'hit'].includes(f.state)) f.x = clamp(f.x + game.wind.dir * 0.45, CFG.WALL_PAD, CFG.W - CFG.WALL_PAD);
      if (t >= game.nextBolt) {
        game.nextBolt = t + Rng.int(150, 280);
        const target = Rng.chance(0.6) ? Rng.pick(game.fighters).x + Rng.range(-60, 60) : Rng.range(120, CFG.W - 120);
        game.spawnHazard({ type: 'bolt', absX: clamp(target, 80, CFG.W - 80), y: -360, vx: 0, w: 44, h: 720, damage: 12, chip: 3, hitstun: 26, blockstun: 14, knockback: 8,
          delay: 36, life: 12, knockdown: true, exclusive: false, cancels: false, pierce: true, hazard: true });
      }
    }
  }
  function damageMult(game, attacker) {
    let m = 1;
    if (has(game, 'luaCheia') && isWater(attacker)) m *= 1.3;
    if (has(game, 'cometa') && isFire(attacker)) m *= 1.4;
    return m;
  }
  function chiMult(game, attacker) { return has(game, 'luaCheia') && isWater(attacker) ? 1.5 : 1; }
  /* projéteis de fogo maiores e mais rápidos com o cometa */
  function projectileSpec(game, owner, spec) {
    if (!has(game, 'cometa') || !isFire(owner) || spec.hazard) return spec;
    if (!['fire', 'bluefire', 'breath', 'firewave', 'firepillar'].includes(spec.type) && !(spec.type === 'beam' && spec.color === 'fire')) return spec;
    return Object.assign({}, spec, { w: Math.round((spec.w || 50) * 1.35), h: Math.round((spec.h || 40) * 1.35), vx: (spec.vx || 0) * 1.2 });
  }
  function labels(game) { return (game.modifiers || []).map((id) => { const m = MODIFIERS.find((x) => x.id === id); return m ? T(m.name) : id; }); }
  return { has, onMatchStart, onRoundStart, onRoundEnd, onFrame, damageMult, chiMult, projectileSpec, labels };
})();

/* ----- tela "Regras especiais" (entre o cenário e a luta) ----- */
Game.prototype.gotoRules = function () {
  this.rules = { index: 0 };
  this.modifiers = (Settings.data.rules || []).filter((id) => MODIFIERS.some((m) => m.id === id));
  this.scene = 'rules';
};
Game.prototype.afterRules = function () {
  Settings.data.rules = this.modifiers.slice(); Settings.save();
  if (this.mode === 'online' && this.net) return this.netHostStart();
  this.startMatch();
};
Game.prototype.updateRules = function () {
  const r = this.rules, n = MODIFIERS.length + 2;   // regras + "limpar" + "LUTAR!"
  if (this.backPressed()) { Audio_.play('back'); this.scene = 'stage'; return; }
  if (this.menuUp()) { r.index = (r.index + n - 1) % n; Audio_.play('menu'); }
  if (this.menuDown()) { r.index = (r.index + 1) % n; Audio_.play('menu'); }
  const toggle = this.confirmPressed() || this.menuLeft() || this.menuRight();
  if (!toggle) return;
  if (r.index < MODIFIERS.length) {
    const id = MODIFIERS[r.index].id;
    this.modifiers = this.modifiers.includes(id) ? this.modifiers.filter((x) => x !== id) : this.modifiers.concat([id]);
    Audio_.play('menu');
  } else if (r.index === MODIFIERS.length) { this.modifiers = []; Audio_.play('menu'); }
  else if (this.confirmPressed()) { Audio_.play('confirm'); this.afterRules(); }
};
function drawRules(ctx, game) {
  if (!game.rules) game.rules = { index: 0 }; if (!game.modifiers) game.modifiers = [];
  drawMenuBackdrop(ctx, game, game.stageIndex);
  txt(ctx, T('REGRAS ESPECIAIS'), CFG.W / 2, 60, { font: FONT_DISPLAY, size: 44, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  txt(ctx, T('Opcional. Eventos do mundo de Avatar e regras de festa. Nada disso vale para a simulação de balanceamento.'), CFG.W / 2, 100, { size: 15, color: '#cfd8dc', weight: 400, stroke: 'rgba(0,0,0,.8)' });
  const x0 = 230, w = 820, y0 = 130, rh = 52;
  ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, x0 - 20, y0 - 10, w + 40, (MODIFIERS.length + 2) * rh + 20, 12); ctx.fill();
  MODIFIERS.forEach((m, i) => {
    const y = y0 + i * rh + rh / 2, sel = i === game.rules.index, on = game.modifiers.includes(m.id);
    if (sel) { ctx.fillStyle = 'rgba(255,213,79,.16)'; roundRect(ctx, x0 - 8, y - rh / 2 + 3, w + 16, rh - 6, 6); ctx.fill(); }
    ctx.fillStyle = on ? '#ffd54f' : 'rgba(255,255,255,.12)'; roundRect(ctx, x0, y - 11, 22, 22, 5); ctx.fill();
    if (on) txt(ctx, '✓', x0 + 11, y + 1, { size: 16, color: '#1b1b1b' });
    txt(ctx, T(m.name), x0 + 36, y - 9, { size: 19, align: 'left', color: sel ? '#fff' : '#dfe7f2', weight: sel ? 700 : 400 });
    txt(ctx, T(m.desc), x0 + 36, y + 13, { size: 13, align: 'left', color: '#9fb0bb', weight: 400 });
  });
  for (let k = 0; k < 2; k++) {
    const i = MODIFIERS.length + k, y = y0 + i * rh + rh / 2, sel = i === game.rules.index;
    if (sel) { ctx.fillStyle = 'rgba(255,213,79,.16)'; roundRect(ctx, x0 - 8, y - rh / 2 + 3, w + 16, rh - 6, 6); ctx.fill(); }
    txt(ctx, k === 0 ? T('Limpar tudo') : T('LUTAR!'), x0 + w / 2, y, { font: k ? FONT_DISPLAY : FONT_BODY, size: k ? 26 : 19, color: sel ? (k ? '#ffd54f' : '#fff') : '#cfd8dc' });
  }
  txt(ctx, T('↑/↓ escolhe · Enter ou ←/→ marca · Esc volta ao cenário'), CFG.W / 2, CFG.H - 36, { size: 15, color: '#b0bec5', stroke: 'rgba(0,0,0,.8)' });
}
