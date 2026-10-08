/* Cenários desenhados proceduralmente (sem imagens). Cada um tem draw(ctx, t) e drawFloor(ctx). */
const STAGES = [
  {
    id: 'templo', theme: 'ar', name: 'Templo do Ar do Sul', floor: '#cfc3ad', shadow: 'rgba(60,50,40,.35)',
    draw(ctx, t) {
      const W = CFG.W, H = CFG.H, G = CFG.GROUND;
      let g = ctx.createLinearGradient(0, 0, 0, G);
      g.addColorStop(0, '#5aa7e6'); g.addColorStop(0.6, '#bfe3fb'); g.addColorStop(1, '#f3ead7');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, G);
      // sol
      ctx.fillStyle = 'rgba(255,245,200,.9)'; ctx.beginPath(); ctx.arc(1050, 120, 48, 0, Math.PI * 2); ctx.fill();
      // nuvens
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 260 + t * 0.25) % (W + 300)) - 150, cy = 90 + (i % 3) * 70;
        cloud(ctx, cx, cy, 1 + (i % 2) * 0.4);
      }
      // montanhas distantes
      ctx.fillStyle = '#7b8fc0'; mountains(ctx, 0, 420, 9, 160, 1);
      ctx.fillStyle = '#5c6f9e'; mountains(ctx, 120, 470, 7, 130, 2);
      // torres do templo
      tower(ctx, 180, 500, 80, 300, '#d8d0bd', '#3f6fb5');
      tower(ctx, 290, 540, 50, 200, '#d8d0bd', '#3f6fb5');
      tower(ctx, 1100, 500, 90, 320, '#d8d0bd', '#3f6fb5');
      tower(ctx, 990, 545, 50, 210, '#d8d0bd', '#3f6fb5');
      // plataforma de pedra
      ctx.fillStyle = '#b9ad95'; ctx.fillRect(0, G - 26, W, 26);
      ctx.fillStyle = '#d6cbb3'; ctx.fillRect(0, G - 30, W, 8);
    },
    drawFloor(ctx) {
      const W = CFG.W, H = CFG.H, G = CFG.GROUND;
      ctx.fillStyle = '#cfc3ad'; ctx.fillRect(0, G, W, H - G);
      ctx.strokeStyle = 'rgba(80,70,55,.35)'; ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 128) { ctx.beginPath(); ctx.moveTo(x, G); ctx.lineTo(x - 40, H); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0, G + 40); ctx.lineTo(W, G + 40); ctx.stroke();
    },
  },
  {
    id: 'basingse', theme: 'terra', name: 'Ba Sing Se', floor: '#8c9a63', shadow: 'rgba(30,40,20,.4)',
    draw(ctx, t) {
      const W = CFG.W, G = CFG.GROUND;
      let g = ctx.createLinearGradient(0, 0, 0, G);
      g.addColorStop(0, '#e8c266'); g.addColorStop(0.5, '#f1dea1'); g.addColorStop(1, '#c6d29a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, G);
      // muralha
      ctx.fillStyle = '#9a8f6a'; ctx.fillRect(0, 300, W, 180);
      ctx.fillStyle = '#857a58';
      for (let x = 0; x < W; x += 80) ctx.fillRect(x, 300, 40, 24);
      ctx.strokeStyle = 'rgba(60,50,30,.3)'; ctx.lineWidth = 2;
      for (let y = 330; y < 480; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      // telhados verdes
      for (let i = 0; i < 7; i++) {
        const x = 60 + i * 190, w = 150, y = 480;
        ctx.fillStyle = '#3f6b3a'; ctx.beginPath(); ctx.moveTo(x - 20, y); ctx.lineTo(x + w / 2, y - 70); ctx.lineTo(x + w + 20, y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#c9a56b'; ctx.fillRect(x, y, w, 130);
        ctx.fillStyle = '#6b4a2a'; ctx.fillRect(x + w / 2 - 20, y + 60, 40, 70);
        ctx.fillStyle = '#f0d9a3'; ctx.fillRect(x + 15, y + 20, 30, 30); ctx.fillRect(x + w - 45, y + 20, 30, 30);
      }
      // lanternas
      for (let i = 0; i < 5; i++) {
        const x = 130 + i * 260, y = 420 + Math.sin(t * 0.03 + i) * 4;
        ctx.fillStyle = '#e0453a'; ctx.beginPath(); ctx.ellipse(x, y, 14, 20, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd36b'; ctx.fillRect(x - 4, y + 18, 8, 10);
      }
      ctx.fillStyle = '#7d8a55'; ctx.fillRect(0, G - 24, W, 24);
    },
    drawFloor(ctx) {
      const W = CFG.W, H = CFG.H, G = CFG.GROUND;
      ctx.fillStyle = '#8c9a63'; ctx.fillRect(0, G, W, H - G);
      ctx.strokeStyle = 'rgba(30,40,20,.35)'; ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 96) { ctx.beginPath(); ctx.moveTo(x, G); ctx.lineTo(x - 30, H); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0, G + 36); ctx.lineTo(W, G + 36); ctx.stroke();
    },
  },
  {
    id: 'palacio', theme: 'fogo', name: 'Palácio da Nação do Fogo', floor: '#3a1a16', shadow: 'rgba(0,0,0,.5)',
    draw(ctx, t) {
      const W = CFG.W, G = CFG.GROUND;
      let g = ctx.createLinearGradient(0, 0, 0, G);
      g.addColorStop(0, '#1a0806'); g.addColorStop(1, '#5a1f18');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, G);
      // colunas
      for (let i = 0; i < 6; i++) {
        const x = 90 + i * 220;
        ctx.fillStyle = '#4a1b16'; ctx.fillRect(x, 120, 60, G - 120);
        ctx.fillStyle = '#7a2d22'; ctx.fillRect(x + 8, 120, 14, G - 120);
        ctx.fillStyle = '#c99a3a'; ctx.fillRect(x - 10, 110, 80, 18); ctx.fillRect(x - 10, G - 40, 80, 18);
      }
      // estandartes com a chama
      for (let i = 0; i < 5; i++) {
        const x = 200 + i * 220;
        ctx.fillStyle = '#8e1b1b'; ctx.fillRect(x, 140, 60, 220);
        ctx.fillStyle = '#c99a3a';
        ctx.beginPath(); ctx.moveTo(x + 30, 200); ctx.quadraticCurveTo(x + 55, 240, x + 30, 290); ctx.quadraticCurveTo(x + 5, 240, x + 30, 200); ctx.fill();
        ctx.fillStyle = '#1a0806'; ctx.beginPath(); ctx.moveTo(x, 360); ctx.lineTo(x + 30, 380); ctx.lineTo(x + 60, 360); ctx.closePath(); ctx.fill();
      }
      // braseiros com fogo animado
      for (let i = 0; i < 2; i++) {
        const x = i === 0 ? 60 : W - 60;
        ctx.fillStyle = '#2b0d0d'; ctx.fillRect(x - 30, G - 110, 60, 80);
        ctx.fillStyle = '#c99a3a'; ctx.fillRect(x - 36, G - 116, 72, 10);
        for (let k = 0; k < 6; k++) {
          const fy = Math.sin(t * 0.25 + k * 1.3) * 10;
          ctx.fillStyle = k % 2 ? 'rgba(255,120,30,.8)' : 'rgba(255,210,80,.9)';
          ctx.beginPath(); ctx.ellipse(x + (k - 2.5) * 8, G - 130 + fy, 8, 18 + fy, 0, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = '#2b0d0d'; ctx.fillRect(0, G - 20, W, 20);
      ctx.fillStyle = '#c99a3a'; ctx.fillRect(0, G - 24, W, 4);
    },
    drawFloor(ctx) {
      const W = CFG.W, H = CFG.H, G = CFG.GROUND;
      ctx.fillStyle = '#3a1a16'; ctx.fillRect(0, G, W, H - G);
      ctx.strokeStyle = 'rgba(201,154,58,.25)'; ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 160) { ctx.beginPath(); ctx.moveTo(x, G); ctx.lineTo(x - 50, H); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0, G + 44); ctx.lineTo(W, G + 44); ctx.stroke();
    },
  },
  {
    id: 'agua', theme: 'agua', name: 'Tribo da Água do Norte', floor: '#bfe3f2', shadow: 'rgba(20,60,90,.35)',
    draw(ctx, t) {
      const W = CFG.W, G = CFG.GROUND;
      let g = ctx.createLinearGradient(0, 0, 0, G);
      g.addColorStop(0, '#06122b'); g.addColorStop(0.7, '#17365c'); g.addColorStop(1, '#5b8fb8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, G);
      // aurora
      for (let b = 0; b < 3; b++) {
        ctx.strokeStyle = ['rgba(90,255,190,.25)', 'rgba(120,180,255,.22)', 'rgba(200,120,255,.18)'][b];
        ctx.lineWidth = 26;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 40) {
          const y = 120 + b * 40 + Math.sin(x * 0.006 + t * 0.02 + b) * 40 + Math.sin(x * 0.013 - t * 0.015) * 20;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // lua
      ctx.fillStyle = '#f1f6ff'; ctx.beginPath(); ctx.arc(220, 130, 44, 0, Math.PI * 2); ctx.fill();
      // estrelas
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      for (let i = 0; i < 40; i++) { const sx = (i * 173) % W, sy = (i * 97) % 300; ctx.fillRect(sx, sy, 2, 2); }
      // construções de gelo
      for (let i = 0; i < 6; i++) {
        const x = 40 + i * 230, h = 140 + (i % 3) * 60, w = 150;
        ctx.fillStyle = '#9ecbe6'; ctx.fillRect(x, G - 30 - h, w, h);
        ctx.fillStyle = '#d7eefa'; ctx.beginPath(); ctx.moveTo(x - 10, G - 30 - h); ctx.lineTo(x + w / 2, G - 70 - h); ctx.lineTo(x + w + 10, G - 30 - h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2b5a85'; ctx.fillRect(x + w / 2 - 18, G - 30 - h + 40, 36, 50);
      }
      // canal
      ctx.fillStyle = '#2f6f9f'; ctx.fillRect(0, G - 30, W, 30);
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 90) { ctx.beginPath(); ctx.moveTo(x + Math.sin(t * 0.05 + x) * 10, G - 15); ctx.lineTo(x + 40, G - 15); ctx.stroke(); }
    },
    drawFloor(ctx) {
      const W = CFG.W, H = CFG.H, G = CFG.GROUND;
      ctx.fillStyle = '#bfe3f2'; ctx.fillRect(0, G, W, H - G);
      ctx.strokeStyle = 'rgba(20,60,90,.3)'; ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 110) { ctx.beginPath(); ctx.moveTo(x, G); ctx.lineTo(x - 35, H); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(0, G, W, 6);
    },
  },
  {
    id: 'ember', theme: 'agua', name: 'Ilha Ember', floor: '#e2c58f', shadow: 'rgba(90,60,30,.35)',
    draw(ctx, t) {
      const W = CFG.W, G = CFG.GROUND;
      let g = ctx.createLinearGradient(0, 0, 0, G);
      g.addColorStop(0, '#3b1f52'); g.addColorStop(0.45, '#e2603f'); g.addColorStop(0.75, '#f7b267'); g.addColorStop(1, '#ffe2a8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, G);
      ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(900, 380, 70, 0, Math.PI * 2); ctx.fill();
      // mar
      ctx.fillStyle = '#2d6f8f'; ctx.fillRect(0, 400, W, 180);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.25)' : 'rgba(255,200,120,.25)';
        const y = 420 + i * 20;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 30) { const yy = y + Math.sin(x * 0.02 + t * 0.04 + i) * 4; if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
        ctx.lineTo(W, y + 8); ctx.lineTo(0, y + 8); ctx.closePath(); ctx.fill();
      }
      // palmeiras
      palm(ctx, 120, G - 20, t); palm(ctx, 1160, G - 20, t + 40);
      ctx.fillStyle = '#d9b77d'; ctx.fillRect(0, G - 50, W, 50);
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(0, G - 52, W, 6);
    },
    drawFloor(ctx) {
      const W = CFG.W, H = CFG.H, G = CFG.GROUND;
      ctx.fillStyle = '#e2c58f'; ctx.fillRect(0, G, W, H - G);
      ctx.fillStyle = 'rgba(120,80,40,.15)';
      for (let i = 0; i < 60; i++) ctx.fillRect((i * 211) % W, G + (i * 53) % (H - G), 3, 3);
    },
  },
  /* ---------- Fase 2: cenários novos ---------- */
  {
    id: 'deserto', theme: 'terra', name: 'Deserto Si Wong', floor: '#e0c18a', shadow: 'rgba(120,80,30,.35)',
    draw(ctx, t) {
      const W = CFG.W, G = CFG.GROUND;
      let g = ctx.createLinearGradient(0, 0, 0, G);
      g.addColorStop(0, '#f6b26b'); g.addColorStop(0.55, '#fbe0a6'); g.addColorStop(1, '#f1d28a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, G);
      ctx.fillStyle = 'rgba(255,250,220,.95)'; ctx.beginPath(); ctx.arc(980, 110, 58, 0, Math.PI * 2); ctx.fill();
      // dunas em camadas
      for (const [y, h, col, k] of [[420, 90, '#e8c383', 0.6], [480, 80, '#d9b06a', 0.9], [540, 70, '#c99a55', 1.2]]) {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, G);
        for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.004 * k + k) * h * 0.5 + Math.sin(x * 0.011 * k) * h * 0.2);
        ctx.lineTo(W, G); ctx.closePath(); ctx.fill();
      }
      // tempestade de areia ao longe
      ctx.fillStyle = 'rgba(230,200,140,.35)';
      for (let i = 0; i < 5; i++) { const cx = ((i * 330 + t * 1.2) % (W + 400)) - 200; ctx.beginPath(); ctx.ellipse(cx, 380 + (i % 2) * 40, 180, 50, 0, 0, Math.PI * 2); ctx.fill(); }
      // ruínas
      ctx.fillStyle = '#b48a52'; ctx.fillRect(160, 470, 40, 150); ctx.fillRect(240, 500, 30, 120); ctx.fillRect(1040, 480, 46, 140);
      ctx.fillRect(150, 462, 130, 14);
      ctx.fillStyle = '#d4b07a'; ctx.fillRect(0, G - 22, W, 22);
    },
    drawFloor(ctx) {
      const W = CFG.W, H = CFG.H, G = CFG.GROUND;
      ctx.fillStyle = '#e0c18a'; ctx.fillRect(0, G, W, H - G);
      ctx.strokeStyle = 'rgba(120,80,30,.18)'; ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); for (let x = 0; x <= W; x += 30) { const y = G + 12 + i * 14 + Math.sin(x * 0.02 + i) * 4; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }
    },
  },
  {
    id: 'pantano', theme: 'agua', name: 'Pântano Nebuloso', floor: '#5a6b3a', shadow: 'rgba(10,30,10,.5)',
    draw(ctx, t) {
      const W = CFG.W, G = CFG.GROUND;
      let g = ctx.createLinearGradient(0, 0, 0, G);
      g.addColorStop(0, '#15301c'); g.addColorStop(0.6, '#2e5a33'); g.addColorStop(1, '#6b8a4a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, G);
      // árvore gigante
      ctx.fillStyle = '#2b1d12';
      ctx.beginPath(); ctx.moveTo(520, G); ctx.lineTo(560, 300); ctx.lineTo(600, 120); ctx.lineTo(700, 120); ctx.lineTo(740, 300); ctx.lineTo(780, G); ctx.closePath(); ctx.fill();
      for (const [x0, x1] of [[520, 380], [780, 920], [560, 300], [740, 1000]]) { ctx.beginPath(); ctx.moveTo(x0, G); ctx.quadraticCurveTo((x0 + x1) / 2, G - 60, x1, G); ctx.lineTo(x1 + 20, G); ctx.quadraticCurveTo((x0 + x1) / 2, G - 30, x0 + 30, G); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#1f4a28';
      for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(380 + i * 90, 110 + (i % 2) * 40, 120, 60, 0, 0, Math.PI * 2); ctx.fill(); }
      // cipós balançando
      ctx.strokeStyle = '#3f6b2f'; ctx.lineWidth = 5;
      for (let i = 0; i < 9; i++) { const x = 300 + i * 90, sway = Math.sin(t * 0.02 + i) * 14; ctx.beginPath(); ctx.moveTo(x, 150); ctx.quadraticCurveTo(x + sway, 300, x + sway * 1.5, 320 + (i % 3) * 60); ctx.stroke(); }
      // névoa
      ctx.fillStyle = 'rgba(180,220,170,.18)';
      for (let i = 0; i < 6; i++) { const cx = ((i * 280 + t * 0.5) % (W + 300)) - 150; ctx.beginPath(); ctx.ellipse(cx, 560 + (i % 2) * 30, 200, 36, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#3a5a2a'; ctx.fillRect(0, G - 24, W, 24);
      ctx.fillStyle = 'rgba(90,140,80,.6)'; for (let i = 0; i < 12; i++) ctx.fillRect(i * 110 + 20, G - 30, 40, 6);
    },
    drawFloor(ctx) {
      const W = CFG.W, H = CFG.H, G = CFG.GROUND;
      ctx.fillStyle = '#5a6b3a'; ctx.fillRect(0, G, W, H - G);
      ctx.fillStyle = 'rgba(30,60,30,.35)'; for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.ellipse((i * 173) % W, G + 20 + (i * 37) % 50, 40, 8, 0, 0, Math.PI * 2); ctx.fill(); }
    },
  },
  {
    id: 'omashu', theme: 'ar', name: 'Omashu', floor: '#cbb892', shadow: 'rgba(60,50,30,.35)',
    draw(ctx, t) {
      const W = CFG.W, G = CFG.GROUND;
      let g = ctx.createLinearGradient(0, 0, 0, G);
      g.addColorStop(0, '#7fb6e6'); g.addColorStop(0.7, '#cfe4f3'); g.addColorStop(1, '#e9e0c8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, G);
      // cidade em degraus na montanha
      for (let i = 0; i < 7; i++) {
        const w = 1000 - i * 120, h = 60, y = G - 30 - (i + 1) * h, x = 640 - w / 2;
        ctx.fillStyle = i % 2 ? '#cdbb95' : '#bfa97f'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#3f6b3a'; for (let k = 0; k < w / 120; k++) { const bx = x + 20 + k * 120; ctx.beginPath(); ctx.moveTo(bx, y + 8); ctx.lineTo(bx + 40, y - 18); ctx.lineTo(bx + 80, y + 8); ctx.closePath(); ctx.fill(); }
        ctx.fillStyle = 'rgba(60,40,20,.5)'; for (let k = 0; k < w / 60; k++) ctx.fillRect(x + 30 + k * 60, y + 24, 14, 20);
      }
      // calhas de entrega
      ctx.strokeStyle = '#8d7a55'; ctx.lineWidth = 8;
      for (const [x0, y0, x1, y1] of [[200, 200, 60, G - 40], [1080, 220, 1220, G - 40], [640, 150, 900, 420]]) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
      ctx.fillStyle = '#6b4a2a'; const cx = 200 + ((t * 2) % 140) * -1 + 140, cy = 200 + ((t * 2) % 140) * 2.5; ctx.fillRect(cx - 10, cy - 10, 20, 16);
      ctx.fillStyle = '#b7a67d'; ctx.fillRect(0, G - 30, W, 30);
    },
    drawFloor(ctx) {
      const W = CFG.W, H = CFG.H, G = CFG.GROUND;
      ctx.fillStyle = '#cbb892'; ctx.fillRect(0, G, W, H - G);
      ctx.strokeStyle = 'rgba(60,50,30,.3)'; ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 100) { ctx.beginPath(); ctx.moveTo(x, G); ctx.lineTo(x - 30, H); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0, G + 38); ctx.lineTo(W, G + 38); ctx.stroke();
    },
  },
];

function cloud(ctx, x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, 26 * s, 0, Math.PI * 2); ctx.arc(x + 30 * s, y - 10 * s, 32 * s, 0, Math.PI * 2);
  ctx.arc(x + 65 * s, y, 24 * s, 0, Math.PI * 2); ctx.arc(x + 30 * s, y + 12 * s, 26 * s, 0, Math.PI * 2);
  ctx.fill();
}
function mountains(ctx, offset, base, n, h, seed) {
  ctx.beginPath(); ctx.moveTo(0, base);
  for (let i = 0; i <= n; i++) {
    const x = offset + (i * CFG.W) / (n - 1) - 60;
    const y = base - h * (0.5 + 0.5 * Math.abs(Math.sin(i * 1.7 + seed)));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(CFG.W, base); ctx.lineTo(CFG.W, CFG.GROUND); ctx.lineTo(0, CFG.GROUND); ctx.closePath(); ctx.fill();
}
function tower(ctx, x, base, w, h, wall, roof) {
  ctx.fillStyle = wall; ctx.fillRect(x - w / 2, base - h, w, h);
  ctx.fillStyle = roof;
  ctx.beginPath(); ctx.moveTo(x - w / 2 - 12, base - h); ctx.lineTo(x, base - h - w * 1.1); ctx.lineTo(x + w / 2 + 12, base - h); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - w / 2 - 12, base - h * 0.55); ctx.lineTo(x, base - h * 0.55 - w * 0.6); ctx.lineTo(x + w / 2 + 12, base - h * 0.55); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(40,40,60,.6)';
  ctx.fillRect(x - 8, base - h * 0.4, 16, 28); ctx.fillRect(x - 8, base - h * 0.85, 16, 22);
}
function palm(ctx, x, y, t) {
  ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 20, y - 150, x + 10, y - 260); ctx.stroke();
  ctx.strokeStyle = '#2f7a3a'; ctx.lineWidth = 8;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.sin(t * 0.03) * 0.1;
    ctx.beginPath(); ctx.moveTo(x + 10, y - 260);
    ctx.quadraticCurveTo(x + 10 + Math.cos(a) * 60, y - 260 + Math.sin(a) * 30 - 20, x + 10 + Math.cos(a) * 110, y - 260 + Math.sin(a) * 40 + 30);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
}
