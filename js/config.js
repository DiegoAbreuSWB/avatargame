/* Constantes globais do jogo e mapeamento de teclas (por posição física: e.code). */
const CFG = {
  W: 1280,
  H: 720,
  GROUND: 640,
  GRAVITY: 0.95,
  FPS: 60,
  ROUND_TIME: 99,
  ROUNDS_TO_WIN: 2,
  MAX_HP: 100,
  MAX_CHI: 100,
  WALL_PAD: 40,
};

// Jogador 1: WASD + F (soco) G (chute) H (especial) T (super)
// Jogador 2: Setas + J (soco) K (chute) L (especial) I (super)
const KEYMAPS = {
  p1: {
    left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS',
    punch: 'KeyF', kick: 'KeyG', special: 'KeyH', super: 'KeyT',
    labels: { move: 'W A S D', punch: 'F', kick: 'G', special: 'H', super: 'T' },
  },
  p2: {
    left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown',
    punch: 'KeyJ', kick: 'KeyK', special: 'KeyL', super: 'KeyI',
    labels: { move: 'SETAS', punch: 'J', kick: 'K', special: 'L', super: 'I' },
  },
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rectsOverlap = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// Gerador pseudoaleatório com semente (mulberry32) para TUDO que afeta a lógica da luta (IA, sorteios).
// Decisão: visuais (partículas, tremor de tela) continuam com Math.random, porque o número de chamadas
// varia entre o modo 2D e o 3D e isso dessincronizaria replays e partidas online.
const Rng = (() => {
  let s = 1;
  function set(seed) { s = (seed >>> 0) || 1; }
  function next() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    set, next,
    range: (a, b) => a + next() * (b - a),
    int: (a, b) => Math.floor(a + next() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    get seed() { return s; },
  };
})();
