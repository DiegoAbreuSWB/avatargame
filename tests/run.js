#!/usr/bin/env node
/* Executa o harness (tests/harness.html) no Chrome headless e resume o resultado.
   Uso:  node tests/run.js [all|scenes|moves|cpu|matchups] [--3d] [--n 12000] [--seed 12345] [--pairs 6] [--level normal]
         node tests/run.js shot --3d --p1 2 --p2 3 --move special --frame 22 --out tests/out/fire.png
   Sai com código 1 se houver erro de JavaScript, golpe sem dano ou cena que não desenhou. */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const mode = args.find((a) => !a.startsWith('--')) || 'all';
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def; };
const flag = (name) => args.includes('--' + name);

const CHROME_CANDIDATES = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const chrome = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!chrome) { console.error('Chrome/Edge não encontrado. Defina a variável CHROME com o caminho do executável.'); process.exit(2); }

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'tests', 'out');
fs.mkdirSync(outDir, { recursive: true });
const profile = path.join(outDir, 'profile-' + process.pid);

const params = { mode, r: flag('3d') ? '3d' : '2d' };
for (const k of ['n', 'seed', 'pairs', 'level', 'p1', 'p2', 'stage', 'move', 'frame', 'ax', 'bx', 'scene', 'debug']) { const v = opt(k); if (v !== undefined) params[k] = v; }
const url = 'file:///' + path.join(root, 'tests', 'harness.html').replace(/\\/g, '/') + '#' + Object.entries(params).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');

const base = ['--headless=new', '--allow-file-access-from-files', '--no-first-run', '--disable-extensions', '--hide-scrollbars',
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--window-size=1280,720',
  '--virtual-time-budget=' + opt('budget', '30000'), '--user-data-dir=' + profile];

if (mode === 'shot') {
  const png = path.resolve(opt('out', path.join(outDir, 'shot.png')));
  const r = spawnSync(chrome, [...base, '--screenshot=' + png, url], { encoding: 'utf8', timeout: 600000 });
  console.log(r.status === 0 && fs.existsSync(png) ? 'captura salva em ' + png : 'falha na captura: ' + (r.stderr || '').slice(-400));
  cleanup(); process.exit(fs.existsSync(png) ? 0 : 1);
}

const r = spawnSync(chrome, [...base, '--dump-dom', url], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 900000 });
const html = r.stdout || '';
const m = html.match(/<pre id="log">([\s\S]*?)<\/pre>/);
if (!m) { console.error('O harness não produziu saída. stderr:', (r.stderr || '').slice(-800)); cleanup(); process.exit(1); }
const j = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'"));
fs.writeFileSync(path.join(outDir, `result-${mode}-${params.r}.json`), JSON.stringify(j, null, 1));

let failed = false;
console.log(`modo ${mode} · renderizador ${params.r}${j.composer !== undefined ? ' · bloom ' + j.composer : ''}`);
if (j.errors.length) { failed = true; console.log('ERROS:'); for (const e of j.errors) console.log('  ' + e.split('\n').slice(0, 3).join('\n  ')); }
if (j.warns && j.warns.length) console.log('avisos:', [...new Set(j.warns)].slice(0, 5).join(' | '));
if (Object.keys(j.scenes).length) console.log('cenas:', Object.entries(j.scenes).map(([k, v]) => k + '=' + v).join(' '));
if (j.moves.length) {
  const zero = j.moves.filter((x) => x.dmg <= 0);
  console.log(`golpes testados: ${j.moves.length}; sem dano: ${zero.length ? zero.map((x) => x.ch + '.' + x.move).join(', ') : 'nenhum'}`);
  if (zero.length) failed = true;
  if (flag('verbose')) for (const x of j.moves) console.log(`  ${x.ch.padEnd(7)} ${x.move.padEnd(9)} ${String(x.dmg).padStart(3)}`);
}
if (j.mechanics) {
  const bad = Object.entries(j.mechanics).filter(([k, v]) => typeof v === 'boolean' && !v).map(([k]) => k);
  console.log('mecânicas:', Object.entries(j.mechanics).map(([k, v]) => `${k}=${Array.isArray(v) ? v.join('/') : v}`).join(' '));
  if (bad.length) { failed = true; console.log('  FALHARAM: ' + bad.join(', ')); }
}
if (j.modes) { console.log('modos:', JSON.stringify(j.modes)); if (j.modes.arcade && !j.modes.arcade.reachedEnding) { failed = true; console.log('  FALHOU: arcade não chegou ao final'); } if (j.modes.survival && !j.modes.survival.ended) { failed = true; console.log('  FALHOU: sobrevivência não terminou'); } }
if (j.cpuFight) console.log('luta CPU:', JSON.stringify(j.cpuFight));
if (j.matchups) {
  console.log(`matchups (${j.matchups.per} lutas por par):`);
  const rates = Object.entries(j.matchups.rates).sort((a, b) => b[1].rate - a[1].rate);
  for (const [id, v] of rates) {
    const pct = Math.round(v.rate * 100);
    console.log(`  ${id.padEnd(8)} ${String(pct).padStart(3)}%  (${v.games} lutas)${pct < 40 || pct > 60 ? '  <-- fora da faixa 40-60%' : ''}`);
  }
  for (const t of j.matchups.table) console.log(`    ${t.a} ${t.aWins} x ${t.bWins} ${t.b}`);
}
cleanup();
console.log(failed ? 'RESULTADO: FALHOU' : 'RESULTADO: OK');
process.exit(failed ? 1 : 0);

function cleanup() { try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) { /* ignora */ } }
