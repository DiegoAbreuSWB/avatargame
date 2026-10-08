/* Elenco: atributos, cores e lista de golpes de cada personagem.
   Hitboxes são relativas ao centro dos pés do lutador, olhando para a direita (x positivo = frente). */

// Golpes básicos compartilhados (cada personagem pode sobrescrever)
const BASE_MOVES = {
  punch: { name: 'Soco', startup: 4, active: 4, recovery: 9, damage: 5, chi: 6,
    hitbox: { x: 15, y: -145, w: 75, h: 45 }, hitstun: 14, blockstun: 8, knockback: 3, height: 'mid', pose: 'punch', sound: 'whoosh' },
  kick: { name: 'Chute', startup: 8, active: 5, recovery: 16, damage: 9, chi: 8,
    hitbox: { x: 15, y: -120, w: 100, h: 55 }, hitstun: 20, blockstun: 12, knockback: 8, height: 'mid', pose: 'kick', sound: 'whoosh' },
  cpunch: { name: 'Soco Baixo', startup: 4, active: 4, recovery: 9, damage: 4, chi: 5,
    hitbox: { x: 15, y: -80, w: 75, h: 40 }, hitstun: 13, blockstun: 8, knockback: 3, height: 'low', pose: 'cpunch', crouch: true, sound: 'whoosh' },
  sweep: { name: 'Rasteira', startup: 9, active: 5, recovery: 20, damage: 8, chi: 8,
    hitbox: { x: 5, y: -45, w: 115, h: 45 }, hitstun: 24, blockstun: 12, knockback: 5, height: 'low', pose: 'sweep', crouch: true, knockdown: true, sound: 'whoosh' },
  jpunch: { name: 'Soco Aéreo', startup: 4, active: 10, recovery: 6, damage: 6, chi: 6,
    hitbox: { x: 5, y: -130, w: 80, h: 70 }, hitstun: 16, blockstun: 10, knockback: 3, height: 'high', pose: 'jpunch', air: true, sound: 'whoosh' },
  jkick: { name: 'Chute Aéreo', startup: 6, active: 12, recovery: 8, damage: 9, chi: 8,
    hitbox: { x: 5, y: -120, w: 95, h: 80 }, hitstun: 20, blockstun: 12, knockback: 6, height: 'high', pose: 'jkick', air: true, sound: 'whoosh' },
};

// Projetil padrão (sobrescrito por cada especial)
const PROJ_DEFAULT = {
  w: 50, h: 40, vx: 9, vy: 0, damage: 10, chip: 2, hitstun: 20, blockstun: 12, knockback: 7,
  life: 120, gravity: 0, launcher: false, knockdown: false, exclusive: true, cancels: true,
};

const CHARACTERS = [
  {
    id: 'aang', name: 'Aang', title: 'O Último Mestre do Ar', element: 'ar', nation: 'Nômades do Ar',
    colors: { skin: '#f3cfae', primary: '#f2a93b', secondary: '#d9742b', accent: '#2f6fc4', hair: null },
    speed: 6.2, jump: 21, weight: 0.9,
    stats: { forca: 2, velocidade: 5, alcance: 4 },
    desc: 'Rápido e evasivo. Suas rajadas de ar empurram o oponente para longe.',
    moves: {
      special: { name: 'Rajada de Ar', startup: 10, active: 2, recovery: 18, chi: 5, pose: 'cast', sound: 'air',
        projectile: { type: 'air', x: 60, y: -115, vx: 13, w: 70, h: 50, damage: 8, chip: 1, knockback: 16, hitstun: 18, life: 100 } },
      special2: { name: 'Patinete de Ar', startup: 6, active: 22, recovery: 12, damage: 10, chi: 8, pose: 'dash', sound: 'air',
        hitbox: { x: -10, y: -120, w: 90, h: 110 }, hitstun: 22, blockstun: 12, knockback: 10, height: 'mid', knockdown: true,
        dash: { vx: 13 }, invuln: [0, 8], trail: 'ar' },
      super: { name: 'Estado Avatar', startup: 14, active: 70, recovery: 24, chi: 0, cost: 100, pose: 'super', sound: 'super',
        projectile: { type: 'vortex', x: 0, y: -90, vx: 0, w: 520, h: 320, damage: 4, chip: 1, hitstun: 10, blockstun: 6, knockback: 0,
          life: 70, follow: true, multi: 9, pull: 3, suction: { radius: 560, force: 5 }, exclusive: false, cancels: false, lastKnockdown: true } },
    },
  },
  {
    id: 'katara', name: 'Katara', title: 'Mestra da Água', element: 'agua', nation: 'Tribo da Água do Sul',
    colors: { skin: '#c68a5a', primary: '#2d5fa3', secondary: '#1b3b6b', accent: '#9fd3ff', hair: '#3b2416' },
    speed: 5.4, jump: 19, weight: 1,
    stats: { forca: 3, velocidade: 4, alcance: 5 },
    desc: 'Equilibrada e versátil. Controla o meio da arena com chicotes de água.',
    moves: {
      kick: Object.assign({}, BASE_MOVES.kick, { name: 'Chicote', hitbox: { x: 15, y: -125, w: 130, h: 50 }, damage: 8, startup: 9 }),
      special: { name: 'Chicote de Água', startup: 11, active: 2, recovery: 18, chi: 5, pose: 'cast', sound: 'water',
        projectile: { type: 'water', x: 55, y: -110, vx: 9, w: 80, h: 44, damage: 11, chip: 2, knockback: 8, hitstun: 22, life: 110 } },
      special2: { name: 'Estilhaços de Gelo', startup: 12, active: 2, recovery: 22, chi: 6, pose: 'castLow', sound: 'water',
        projectiles: [
          { type: 'ice', x: 40, y: -90, vx: 10, vy: -7, w: 30, h: 30, damage: 5, chip: 1, knockback: 6, hitstun: 18, gravity: 0.35, life: 90, exclusive: false, cancels: false },
          { type: 'ice', x: 40, y: -90, vx: 11, vy: -3, w: 30, h: 30, damage: 5, chip: 1, knockback: 6, hitstun: 18, gravity: 0.35, life: 90, exclusive: false, cancels: false },
          { type: 'ice', x: 40, y: -90, vx: 12, vy: 1, w: 30, h: 30, damage: 5, chip: 1, knockback: 6, hitstun: 18, gravity: 0.35, life: 90, exclusive: false, cancels: false },
        ] },
      super: { name: 'Onda Gigante', startup: 22, active: 2, recovery: 30, chi: 0, cost: 100, pose: 'super', sound: 'super',
        projectile: { type: 'wave', x: 40, y: -120, vx: 8, w: 150, h: 240, damage: 28, chip: 6, knockback: 14, hitstun: 30, blockstun: 20,
          life: 200, knockdown: true, exclusive: false, cancels: false, pierce: true } },
    },
  },
  {
    id: 'zuko', name: 'Zuko', title: 'Príncipe Banido', element: 'fogo', nation: 'Nação do Fogo',
    colors: { skin: '#f0cfa8', primary: '#b3261e', secondary: '#3a1512', accent: '#f5b942', hair: '#1b1b1b' },
    speed: 5.6, jump: 19, weight: 1,
    stats: { forca: 4, velocidade: 4, alcance: 3 },
    desc: 'Agressivo. Bolas de fogo rápidas e um chute flamejante que lança o oponente.',
    moves: {
      kick: Object.assign({}, BASE_MOVES.kick, { damage: 10 }),
      special: { name: 'Bola de Fogo', startup: 9, active: 2, recovery: 17, chi: 5, pose: 'cast', sound: 'fire',
        projectile: { type: 'fire', x: 55, y: -115, vx: 11, w: 56, h: 44, damage: 11, chip: 2, knockback: 7, hitstun: 20, life: 110 } },
      special2: { name: 'Chute Flamejante', startup: 5, active: 14, recovery: 22, damage: 14, chi: 8, pose: 'uppercut', sound: 'fire',
        hitbox: { x: 0, y: -190, w: 85, h: 150 }, hitstun: 28, blockstun: 14, knockback: 6, height: 'mid', launcher: true,
        dash: { vx: 4, vy: -16 }, invuln: [0, 6], trail: 'fogo' },
      super: { name: 'Tempestade de Fogo', startup: 12, active: 40, recovery: 24, chi: 0, cost: 100, pose: 'super', sound: 'super',
        volley: { every: 7, count: 6, projectile: { type: 'fire', x: 55, y: -120, vx: 12, w: 60, h: 48, damage: 5, chip: 2, knockback: 5, hitstun: 16, life: 110, exclusive: false, cancels: false } } },
    },
  },
  {
    id: 'toph', name: 'Toph', title: 'A Bandida Cega', element: 'terra', nation: 'Reino da Terra',
    colors: { skin: '#f4dcc3', primary: '#6b8e4e', secondary: '#c9b96b', accent: '#2e4a1e', hair: '#1b1b1b' },
    speed: 4.6, jump: 17, weight: 1.2,
    stats: { forca: 5, velocidade: 2, alcance: 4 },
    desc: 'Pesada e poderosa. Rochas lentas, mas devastadoras, e pilares que surgem sob o inimigo.',
    moves: {
      punch: Object.assign({}, BASE_MOVES.punch, { damage: 6 }),
      kick: Object.assign({}, BASE_MOVES.kick, { damage: 12, startup: 10, knockback: 10 }),
      special: { name: 'Arremesso de Rocha', startup: 14, active: 2, recovery: 22, chi: 6, pose: 'cast', sound: 'earth',
        projectile: { type: 'rock', x: 50, y: -125, vx: 7.5, w: 56, h: 52, damage: 14, chip: 3, knockback: 9, hitstun: 26, life: 130, knockdown: true } },
      special2: { name: 'Pilar de Terra', startup: 16, active: 2, recovery: 26, chi: 8, pose: 'castLow', sound: 'earth',
        projectile: { type: 'pillar', atTarget: true, y: 0, vx: 0, w: 70, h: 150, damage: 12, chip: 3, knockback: 4, hitstun: 26, blockstun: 14,
          delay: 10, life: 30, launcher: true, exclusive: false, cancels: false, groundOnly: false, pierce: true } },
      super: { name: 'Terremoto', startup: 20, active: 2, recovery: 34, chi: 0, cost: 100, pose: 'super', sound: 'super',
        projectile: { type: 'quake', x: 0, y: 0, vx: 0, w: 2000, h: 60, damage: 26, chip: 5, knockback: 12, hitstun: 34, blockstun: 20,
          delay: 6, life: 24, knockdown: true, groundOnly: true, exclusive: false, cancels: false, unblockable: false, pierce: true } },
    },
  },
  {
    id: 'azula', name: 'Azula', title: 'Princesa do Fogo', element: 'fogo', nation: 'Nação do Fogo',
    colors: { skin: '#f3d5b5', primary: '#8e1b1b', secondary: '#2b0d0d', accent: '#e3b23c', hair: '#141414', fire: '#2f9bff' },
    speed: 6.0, jump: 20, weight: 0.9,
    stats: { forca: 4, velocidade: 5, alcance: 5 },
    desc: 'Precisa e letal. Fogo azul veloz e um raio que atravessa a arena inteira.',
    moves: {
      punch: Object.assign({}, BASE_MOVES.punch, { startup: 3 }),
      special: { name: 'Fogo Azul', startup: 8, active: 2, recovery: 16, chi: 5, pose: 'cast', sound: 'fire',
        projectile: { type: 'bluefire', x: 55, y: -115, vx: 13, w: 54, h: 40, damage: 10, chip: 2, knockback: 6, hitstun: 18, life: 100 } },
      special2: { name: 'Relâmpago', startup: 30, active: 2, recovery: 30, chi: 8, pose: 'charge', sound: 'lightning', chargeFx: 'raio',
        projectile: { type: 'beam', x: 40, y: -125, vx: 0, w: 1300, h: 36, damage: 18, chip: 4, knockback: 14, hitstun: 30, blockstun: 18,
          life: 12, knockdown: true, exclusive: false, cancels: false, pierce: true } },
      super: { name: 'Dança do Fogo Azul', startup: 16, active: 2, recovery: 30, chi: 0, cost: 100, pose: 'super', sound: 'super',
        projectiles: [
          { type: 'firepillar', x: 110, y: 0, vx: 0, w: 70, h: 190, damage: 10, chip: 2, knockback: 4, hitstun: 26, delay: 4, life: 26, launcher: true, exclusive: false, cancels: false, pierce: true },
          { type: 'firepillar', x: 240, y: 0, vx: 0, w: 70, h: 190, damage: 10, chip: 2, knockback: 4, hitstun: 26, delay: 14, life: 26, launcher: true, exclusive: false, cancels: false, pierce: true },
          { type: 'firepillar', x: 370, y: 0, vx: 0, w: 70, h: 190, damage: 10, chip: 2, knockback: 4, hitstun: 26, delay: 24, life: 26, launcher: true, exclusive: false, cancels: false, pierce: true },
          { type: 'firepillar', x: 500, y: 0, vx: 0, w: 70, h: 190, damage: 10, chip: 2, knockback: 4, hitstun: 26, delay: 34, life: 26, launcher: true, exclusive: false, cancels: false, pierce: true },
        ] },
    },
  },
  {
    id: 'sokka', name: 'Sokka', title: 'O Estrategista', element: 'nao', nation: 'Tribo da Água do Sul',
    colors: { skin: '#c68a5a', primary: '#2f5f9e', secondary: '#1f3f6b', accent: '#dfe7f2', hair: '#3b2416' },
    speed: 5.8, jump: 19, weight: 1,
    stats: { forca: 3, velocidade: 4, alcance: 3 },
    desc: 'Sem dobra, só talento. Bumerangue que sempre volta e golpes de espada rápidos.',
    moves: {
      punch: Object.assign({}, BASE_MOVES.punch, { name: 'Clava', damage: 6, hitbox: { x: 15, y: -145, w: 85, h: 45 } }),
      special: { name: 'Bumerangue', startup: 10, active: 2, recovery: 16, chi: 5, pose: 'cast', sound: 'boomerang',
        projectile: { type: 'boomerang', x: 50, y: -120, vx: 12, w: 44, h: 36, damage: 8, chip: 1, knockback: 6, hitstun: 18, life: 150, returning: true, pierce: true, cancels: false } },
      special2: { name: 'Golpe de Espada', startup: 7, active: 12, recovery: 18, damage: 13, chi: 8, pose: 'dash', sound: 'whoosh',
        hitbox: { x: 10, y: -140, w: 110, h: 90 }, hitstun: 24, blockstun: 12, knockback: 9, height: 'mid', dash: { vx: 11 }, trail: 'nao' },
      super: { name: 'O Plano do Sokka', startup: 10, active: 48, recovery: 20, damage: 6, chi: 0, cost: 100, pose: 'super', sound: 'super',
        hitbox: { x: -30, y: -150, w: 170, h: 140 }, hitstun: 14, blockstun: 8, knockback: 1, height: 'mid', multi: 6, hitInterval: 7,
        dash: { vx: 5 }, lastKnockdown: true, invuln: [0, 10], trail: 'nao' },
    },
  },
];

function getCharacter(id) { return CHARACTERS.find((c) => c.id === id); }

// Monta a lista completa de golpes de um personagem (base + específicos)
function buildMoveset(ch) {
  const m = Object.assign({}, BASE_MOVES, ch.moves);
  for (const k in m) m[k] = Object.assign({ key: k }, m[k]);
  return m;
}

const ELEMENT_NAMES = { ar: 'Ar', agua: 'Água', fogo: 'Fogo', terra: 'Terra', nao: 'Guerreiro' };
const ELEMENT_COLORS = { ar: '#ffd36b', agua: '#4fc3f7', fogo: '#ff6a2b', terra: '#8bc34a', nao: '#b0bec5' };
