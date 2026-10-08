/* Projéteis e ataques de área (dobra): bolas de fogo, chicotes de água, rochas, pilares, raios... */
const GROUND_TYPES = new Set(['pillar', 'firepillar', 'quake']);

class Projectile {
  constructor(owner, target, spec) {
    Object.assign(this, PROJ_DEFAULT, spec);
    this.spec = spec;
    this.owner = owner;
    this.target = target;
    this.facing = owner.facing;
    this.frame = 0;
    this.dead = false;
    this.hitCooldown = 0;
    this.hitsLeft = spec.multi || 1;
    this.returnPhase = false;
    this.delay = spec.delay || 0;
    this.maxLife = this.life;
    this.vx = (spec.vx || 0) * this.facing;
    this.vy = spec.vy || 0;
    this.rot = 0;
    this.height = spec.height || 'mid';

    if (GROUND_TYPES.has(this.type)) {
      this.y = CFG.GROUND - this.h / 2;
      this.x = spec.atTarget ? target.x : owner.x + (spec.x || 0) * this.facing;
      if (this.type === 'quake') this.x = CFG.W / 2;
    } else if (this.type === 'beam') {
      this.y = owner.y + spec.y;
      this.x = owner.x + this.facing * (this.w / 2 + 30);
    } else {
      this.x = owner.x + (spec.x || 0) * this.facing;
      this.y = owner.y + (spec.y || 0);
    }
    this.startX = this.x;
  }

  get box() { return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h }; }
  get active() { return this.delay <= 0 && !this.dead; }

  update() {
    this.frame++;
    if (this.delay > 0) { this.delay--; return; }
    if (this.hitCooldown > 0) this.hitCooldown--;

    if (this.follow) {
      this.x = this.owner.x + (this.spec.x || 0) * this.owner.facing;
      this.y = this.owner.y + (this.spec.y || 0);
      // sucção: puxa o oponente para dentro do vórtice
      const t = this.target;
      if (this.suction && !['knockdown', 'ko', 'getup'].includes(t.state) && !t.isInvulnerable) {
        const dx = t.x - this.x;
        if (Math.abs(dx) < this.suction.radius && Math.abs(dx) > 50) t.x -= Math.sign(dx) * this.suction.force;
        if (this.frame % 3 === 0) Particles.element('ar', t.x + rand(-30, 30), t.y - rand(20, 150), 1, { maxSpeed: 2 });
      }
    } else if (this.type !== 'beam' && !GROUND_TYPES.has(this.type)) {
      if (this.returning) {
        const dist = Math.abs(this.x - this.owner.x);
        if (!this.returnPhase && (this.frame > 40 || this.x < 30 || this.x > CFG.W - 30)) this.returnPhase = true;
        if (this.returnPhase) {
          const dir = Math.sign(this.owner.x - this.x) || 1;
          this.vx = lerp(this.vx, dir * Math.abs(this.spec.vx), 0.12);
          this.y = lerp(this.y, this.owner.y - 120, 0.05);
          if (dist < 36 && this.frame > 50) this.dead = true;
        }
      }
      this.x += this.vx; this.y += this.vy; this.vy += this.gravity;
      if (this.y > CFG.GROUND - 8 && this.gravity) { this.dead = true; Particles.element(this.type === 'ice' ? 'gelo' : this.type === 'rock' ? 'terra' : 'hit', this.x, CFG.GROUND, 8); if (this.type === 'rock') this.owner.game.shakeScreen(4); }
      if (!this.returning && (this.x < -150 || this.x > CFG.W + 150)) this.dead = true;
      if (this.maxDist && Math.abs(this.x - this.startX) > this.maxDist) { this.dead = true; Particles.element('nao', this.x, this.y, 5); }
    }
    this.rot += 0.25;
    this.life--;
    if (this.life <= 0) this.dead = true;
    this.emit();
  }

  emit() {
    const f = this.frame;
    switch (this.type) {
      case 'fire': if (f % 2 === 0) Particles.element('fogo', this.x - this.vx * 1.5, this.y, 2, { maxSpeed: 2, minLife: 8, maxLife: 18 }); break;
      case 'bluefire': if (f % 2 === 0) Particles.burst(this.x - this.vx * 1.5, this.y, 2, { color: ['#4fb3ff', '#bfe9ff', '#1e6fff'], maxSpeed: 2, minLife: 8, maxLife: 18, gravity: -0.1 }); break;
      case 'water': if (f % 3 === 0) Particles.element('agua', this.x, this.y + rand(-15, 15), 2, { maxSpeed: 3, minLife: 8, maxLife: 16 }); break;
      case 'wave': if (f % 2 === 0) Particles.element('agua', this.x + rand(-60, 60), this.y - this.h / 2 + rand(0, 40), 3, { maxSpeed: 4 }); break;
      case 'air': if (f % 3 === 0) Particles.element('ar', this.x, this.y, 1, { maxSpeed: 1 }); break;
      case 'vortex': if (f % 2 === 0) { const a = rand(0, Math.PI * 2); Particles.spawn({ x: this.x + Math.cos(a) * 140, y: this.y + Math.sin(a) * 120, vx: -Math.sin(a) * 6, vy: Math.cos(a) * 5, life: 20, size: 5, color: '#ffffff', shape: 'ring', drag: 0.95 }); } break;
      case 'rock': if (f % 4 === 0) Particles.element('terra', this.x, this.y, 1, { maxSpeed: 2 }); break;
      case 'pillar': case 'quake': if (this.delay <= 0 && f % 2 === 0) Particles.element('terra', this.x + rand(-this.w / 2, this.w / 2), CFG.GROUND, 2, { maxSpeed: 7, angle: -Math.PI / 2, spread: 0.7 }); break;
      case 'firepillar': if (f % 2 === 0) Particles.burst(this.x + rand(-25, 25), CFG.GROUND - rand(0, this.h), 2, { color: ['#4fb3ff', '#bfe9ff', '#1e6fff'], maxSpeed: 2, gravity: -0.2 }); break;
      case 'beam': if (f % 1 === 0) Particles.element('raio', this.x + rand(-this.w / 2, this.w / 2) * 0.9, this.y + rand(-10, 10), 2, { maxSpeed: 6, minLife: 6, maxLife: 14 }); break;
      case 'boomerang': if (f % 4 === 0) Particles.element('nao', this.x, this.y, 1, { maxSpeed: 1 }); break;
      case 'ice': if (f % 5 === 0) Particles.element('gelo', this.x, this.y, 1, { maxSpeed: 1 }); break;
      case 'breath': Particles.element('fogo', this.x + rand(-this.w / 2, this.w / 2), this.y + rand(-this.h / 3, this.h / 3), 2, { maxSpeed: 3, minLife: 6, maxLife: 14 }); break;
      case 'firewave': if (f % 2 === 0) Particles.element('fogo', this.x + rand(-30, 30), CFG.GROUND - rand(0, 40), 2, { maxSpeed: 2 }); break;
      case 'fan': case 'fanspin': if (f % 4 === 0) Particles.burst(this.x, this.y, 1, { color: ['#e3b23c', '#fff'], maxSpeed: 2, shape: 'spark' }); break;
    }
  }

  draw(ctx) {
    const { x, y, w, h } = this;
    ctx.save();
    switch (this.type) {
      case 'fire': case 'bluefire': {
        const blue = this.type === 'bluefire';
        const col = blue ? ['#1e6fff', '#4fb3ff', '#e3f6ff'] : ['#ff3d00', '#ffb300', '#fff3b0'];
        ctx.translate(x, y); ctx.scale(this.facing, 1);
        for (let i = 0; i < 3; i++) {
          const r = (w / 2) * (1 - i * 0.28) + Math.sin(this.frame * 0.6 + i) * 3;
          ctx.fillStyle = col[i];
          ctx.beginPath(); ctx.moveTo(-w * 0.9 + i * 10, 0); ctx.quadraticCurveTo(0, -r, r, 0); ctx.quadraticCurveTo(0, r, -w * 0.9 + i * 10, 0); ctx.fill();
        }
        break;
      }
      case 'water': {
        ctx.translate(x, y); ctx.scale(this.facing, 1);
        ctx.fillStyle = '#1e88e5';
        ctx.beginPath(); ctx.moveTo(-w / 2, 0);
        for (let i = -w / 2; i <= w / 2; i += 8) ctx.lineTo(i, Math.sin(i * 0.15 + this.frame * 0.4) * 8 - h * 0.3);
        ctx.lineTo(w / 2, h * 0.3); ctx.lineTo(-w / 2, h * 0.2); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#e1f5fe'; ctx.lineWidth = 3; ctx.beginPath();
        for (let i = -w / 2; i <= w / 2; i += 8) { const yy = Math.sin(i * 0.15 + this.frame * 0.4) * 8 - h * 0.3 + 4; if (i === -w / 2) ctx.moveTo(i, yy); else ctx.lineTo(i, yy); }
        ctx.stroke();
        break;
      }
      case 'wave': {
        ctx.fillStyle = 'rgba(21,101,192,.85)';
        ctx.beginPath(); ctx.moveTo(x - w / 2, CFG.GROUND);
        ctx.quadraticCurveTo(x - w / 2, y - h / 2, x + this.facing * w * 0.3, y - h / 2 + Math.sin(this.frame * 0.3) * 8);
        ctx.quadraticCurveTo(x + this.facing * w * 0.6, y - h / 2 + 30, x + this.facing * w * 0.2, y - h * 0.1);
        ctx.lineTo(x + w / 2 * this.facing, CFG.GROUND); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        ctx.beginPath(); ctx.arc(x + this.facing * w * 0.3, y - h / 2 + 10, 22, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + this.facing * w * 0.05, y - h / 2 + 30, 14, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'ice': {
        ctx.translate(x, y); ctx.rotate(this.rot);
        ctx.fillStyle = '#e0f7fa'; ctx.strokeStyle = '#4dd0e1'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(w / 3, 0); ctx.lineTo(0, h / 2); ctx.lineTo(-w / 3, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      }
      case 'air': {
        ctx.translate(x, y);
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 4;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, (w / 2) * (0.4 + i * 0.3), this.rot + i, this.rot + i + Math.PI * 1.3); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(200,220,255,.5)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, w / 2, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'vortex': {
        ctx.translate(x, y);
        ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 6;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath(); ctx.ellipse(0, 0, (w / 2) * (0.3 + i * 0.17), (h / 2) * (0.3 + i * 0.17), 0, this.rot * (1 + i * 0.2), this.rot * (1 + i * 0.2) + Math.PI * 1.2); ctx.stroke();
        }
        break;
      }
      case 'rock': {
        ctx.translate(x, y); ctx.rotate(this.rot * 0.6);
        ctx.fillStyle = '#6d4c41'; ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-w / 2, -h * 0.2); ctx.lineTo(-w * 0.2, -h / 2); ctx.lineTo(w * 0.35, -h * 0.4); ctx.lineTo(w / 2, h * 0.1); ctx.lineTo(w * 0.15, h / 2); ctx.lineTo(-w * 0.35, h * 0.35); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.arc(-w * 0.1, -h * 0.1, 8, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'boomerang': {
        ctx.translate(x, y); ctx.rotate(this.rot * 1.4);
        ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 9; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-w / 2, h / 3); ctx.lineTo(0, -h / 2); ctx.lineTo(w / 2, h / 3); ctx.stroke();
        ctx.strokeStyle = '#546e7a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-w / 2, h / 3); ctx.lineTo(0, -h / 2); ctx.lineTo(w / 2, h / 3); ctx.stroke();
        break;
      }
      case 'breath': {
        ctx.translate(x - this.facing * w / 2, y); ctx.scale(this.facing, 1);
        for (const [k, col] of [[1, 'rgba(255,61,0,.55)'], [0.7, 'rgba(255,179,0,.8)'], [0.4, 'rgba(255,243,176,.95)']]) {
          ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0);
          for (let i = 0; i <= 8; i++) { const px = (w * i) / 8, amp = (h / 2) * k * (0.3 + 0.7 * i / 8); ctx.lineTo(px, -amp + Math.sin(this.frame * 0.7 + i) * 6); }
          for (let i = 8; i >= 0; i--) { const px = (w * i) / 8, amp = (h / 2) * k * (0.3 + 0.7 * i / 8); ctx.lineTo(px, amp + Math.cos(this.frame * 0.7 + i) * 6); }
          ctx.closePath(); ctx.fill();
        }
        break;
      }
      case 'firewave': {
        ctx.translate(x, CFG.GROUND); ctx.scale(this.facing, 1);
        for (let i = 0; i < 6; i++) {
          const fx = (i - 2.5) * (w / 6), fh = h * (0.5 + 0.5 * Math.abs(Math.sin(this.frame * 0.5 + i)));
          ctx.fillStyle = i % 2 ? 'rgba(255,120,30,.9)' : 'rgba(255,210,80,.95)';
          ctx.beginPath(); ctx.moveTo(fx - 10, 0); ctx.quadraticCurveTo(fx, -fh * 1.4, fx + 10, 0); ctx.fill();
        }
        break;
      }
      case 'knife': {
        ctx.translate(x, y); ctx.rotate(Math.atan2(this.vy, this.vx));
        ctx.fillStyle = '#cfd8dc'; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 6, -h / 2); ctx.lineTo(w / 2, 0); ctx.lineTo(w / 6, h / 2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#5a1a1a'; ctx.fillRect(-w / 2, -h / 3, w / 4, h * 0.66);
        break;
      }
      case 'fan': {
        ctx.translate(x, y); ctx.rotate(this.rot * 1.2);
        ctx.fillStyle = '#e3b23c'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, w / 2, -0.9, 0.9); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, w / 2, Math.PI - 0.9, Math.PI + 0.9); ctx.closePath(); ctx.fill();
        break;
      }
      case 'fanspin': {
        ctx.translate(x, y);
        for (let i = 0; i < 4; i++) {
          const a = this.rot * 1.5 + (i * Math.PI) / 2, rx = (w / 2) * 0.85, ry = (h / 2) * 0.85;
          const px = Math.cos(a) * rx, py = Math.sin(a) * ry;
          ctx.save(); ctx.translate(px, py); ctx.rotate(a + Math.PI / 2);
          ctx.fillStyle = i % 2 ? '#e3b23c' : '#2e7d32'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 28, -0.9, 0.9); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
        ctx.strokeStyle = 'rgba(227,178,60,.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, w / 2 * 0.85, h / 2 * 0.85, 0, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'beam': {
        const x0 = this.owner.x + this.facing * 40, x1 = x0 + this.facing * this.w;
        ctx.lineCap = 'round';
        const fire = this.color === 'fire';
        for (const [lw, col] of fire ? [[Math.max(22, h * 0.9), 'rgba(255,90,0,.45)'], [h * 0.45, '#ff9800'], [h * 0.18, '#fff3b0']] : [[22, 'rgba(79,213,255,.35)'], [10, '#4fd5ff'], [4, '#ffffff']]) {
          ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y);
          for (let i = 1; i <= 14; i++) { const px = lerp(x0, x1, i / 14); ctx.lineTo(px, y + (i < 14 ? rand(-(fire ? 8 : 18), fire ? 8 : 18) : 0)); }
          ctx.stroke();
        }
        if (fire) { ctx.fillStyle = 'rgba(255,200,80,.9)'; ctx.beginPath(); ctx.arc(x0, y, h * 0.7, 0, Math.PI * 2); ctx.fill(); }
        break;
      }
      case 'pillar': {
        if (this.delay > 0) {
          ctx.strokeStyle = 'rgba(62,39,35,.8)'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(x - 40, CFG.GROUND + 2); ctx.lineTo(x - 10, CFG.GROUND + 14); ctx.lineTo(x + 12, CFG.GROUND + 4); ctx.lineTo(x + 42, CFG.GROUND + 16); ctx.stroke();
        } else {
          const p = Math.min(1, (this.maxLife - this.life + 1) / 6), hh = h * p;
          ctx.fillStyle = '#6d4c41'; ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(x - w / 2, CFG.GROUND); ctx.lineTo(x - w * 0.3, CFG.GROUND - hh); ctx.lineTo(x, CFG.GROUND - hh - 20); ctx.lineTo(x + w * 0.3, CFG.GROUND - hh); ctx.lineTo(x + w / 2, CFG.GROUND); ctx.closePath(); ctx.fill(); ctx.stroke();
        }
        break;
      }
      case 'firepillar': {
        if (this.delay > 0) {
          ctx.fillStyle = 'rgba(79,179,255,.4)'; ctx.beginPath(); ctx.ellipse(x, CFG.GROUND, w / 2, 10, 0, 0, Math.PI * 2); ctx.fill();
        } else {
          const p = Math.min(1, (this.maxLife - this.life + 1) / 5), hh = h * p;
          for (const [col, k] of [['rgba(30,111,255,.7)', 1], ['rgba(79,179,255,.85)', 0.7], ['rgba(227,246,255,.9)', 0.35]]) {
            ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - (w / 2) * k, CFG.GROUND);
            ctx.quadraticCurveTo(x - (w / 2) * k, CFG.GROUND - hh * 0.6, x + Math.sin(this.frame * 0.7) * 8, CFG.GROUND - hh * k - 10);
            ctx.quadraticCurveTo(x + (w / 2) * k, CFG.GROUND - hh * 0.6, x + (w / 2) * k, CFG.GROUND); ctx.closePath(); ctx.fill();
          }
        }
        break;
      }
      case 'quake': {
        ctx.strokeStyle = 'rgba(62,39,35,.9)'; ctx.lineWidth = 4;
        for (let i = 0; i < 12; i++) {
          const sx = i * 110 + 20;
          ctx.beginPath(); ctx.moveTo(sx, CFG.GROUND + 2); ctx.lineTo(sx + 30, CFG.GROUND + 18); ctx.lineTo(sx + 55, CFG.GROUND + 6); ctx.lineTo(sx + 90, CFG.GROUND + 22); ctx.stroke();
          if (this.delay <= 0) {
            const hh = 40 + Math.sin(this.frame * 0.5 + i) * 12;
            ctx.fillStyle = '#6d4c41'; ctx.beginPath(); ctx.moveTo(sx + 20, CFG.GROUND); ctx.lineTo(sx + 45, CFG.GROUND - hh); ctx.lineTo(sx + 70, CFG.GROUND); ctx.closePath(); ctx.fill();
          }
        }
        break;
      }
    }
    ctx.restore();
  }
}
