#!/usr/bin/env node
/* Gera docs/frame-data.md a partir de js/characters.js (startup / ativo / recuperação, dano, vantagem).
   Vantagem no acerto = hitstun - (ativo - 1 + recuperação), supondo que o primeiro frame ativo conecta.
   Uso: node tools/frame-data.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const ctx = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(root, 'js/characters.js'), 'utf8'), ctx);
const { CHARACTERS, buildMoveset } = vm.runInContext('({ CHARACTERS, buildMoveset })', ctx);

const KEYS = ['punch', 'kick', 'cpunch', 'sweep', 'jpunch', 'jkick', 'special', 'special2', 'super'];
const lines = ['# Frame data', '', 'Gerado por `node tools/frame-data.js` a partir de `js/characters.js`. Valores em frames (60 por segundo).',
  'Vantagem = quantos frames o atacante fica livre antes do defensor, supondo acerto no primeiro frame ativo (negativo = desvantagem).', ''];
for (const ch of CHARACTERS) {
  const m = buildMoveset(ch);
  lines.push(`## ${ch.name} (${ch.element})`, '', '| Golpe | Nome | Startup | Ativo | Recuperação | Total | Dano | Hitstun | Blockstun | Vant. acerto | Vant. bloqueio | Altura | Obs. |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const k of KEYS) {
    const mv = m[k]; if (!mv) continue;
    const total = mv.startup + mv.active + mv.recovery;
    const onHit = mv.hitbox ? mv.hitstun - (mv.active - 1 + mv.recovery) : '';
    const onBlock = mv.hitbox ? (mv.blockstun || 10) - (mv.active - 1 + mv.recovery) : '';
    const dmg = mv.damage || (mv.projectile && mv.projectile.damage) || (mv.projectiles && mv.projectiles.map((p) => p.damage).join('+')) || (mv.volley && `${mv.volley.count}x${mv.volley.projectile.damage}`) || '';
    const obs = [mv.multi ? `${mv.multi} hits` : '', mv.launcher ? 'lança' : '', mv.knockdown ? 'derruba' : '', mv.invuln ? `invul. ${mv.invuln[0]}-${mv.invuln[1]}` : '',
      mv.projectile ? `projétil ${mv.projectile.type}` : '', mv.dash ? 'avança' : '', mv.cost ? `custa ${mv.cost} chi` : '', mv.armor ? 'armadura' : '', mv.counter ? `contra ${mv.counter}` : '', mv.cancel ? `cancela em ${mv.cancel}` : ''].filter(Boolean).join(', ');
    lines.push(`| ${k} | ${mv.name} | ${mv.startup} | ${mv.active} | ${mv.recovery} | ${total} | ${dmg} | ${mv.hitstun || ''} | ${mv.blockstun || ''} | ${onHit} | ${onBlock} | ${mv.height || ''} | ${obs} |`);
  }
  lines.push('');
}
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/frame-data.md'), lines.join('\n'));
console.log('docs/frame-data.md gerado com', CHARACTERS.length, 'personagens');
