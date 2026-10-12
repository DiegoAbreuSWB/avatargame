/* Sistema simples de partículas para impactos e efeitos de dobra. */
const Particles = (() => {
  const list = [];

  function spawn(o) {
    list.push({
      x: o.x, y: o.y,
      vx: o.vx || 0, vy: o.vy || 0,
      life: o.life || 30, maxLife: o.life || 30,
      size: o.size || 4,
      color: o.color || '#fff',
      gravity: o.gravity || 0,
      drag: o.drag || 1,
      shape: o.shape || 'circle',   // circle | spark | ring | rock | leaf
      shrink: o.shrink !== undefined ? o.shrink : true,
      rot: o.rot || Math.random() * Math.PI * 2,
      vrot: o.vrot || 0,
      alpha: o.alpha || 1,
    });
  }

  function burst(x, y, n, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = o.angle !== undefined ? o.angle + rand(-(o.spread || 0.6), o.spread || 0.6) : rand(0, Math.PI * 2);
      const sp = rand(o.minSpeed || 1, o.maxSpeed || 6);
      spawn({
        x: x + rand(-(o.jitter || 0), o.jitter || 0), y: y + rand(-(o.jitter || 0), o.jitter || 0),
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: randInt(o.minLife || 14, o.maxLife || 32),
        size: rand(o.minSize || 2, o.maxSize || 6),
        color: Array.isArray(o.color) ? pick(o.color) : (o.color || '#fff'),
        gravity: o.gravity || 0, drag: o.drag || 0.96, shape: o.shape || 'circle',
        shrink: o.shrink, vrot: rand(-0.2, 0.2),
      });
    }
  }

  // Efeitos por elemento (cor/forma características)
  function element(el, x, y, n = 12, extra = {}) {
    const presets = {
      fogo: { color: ['#ff6a00', '#ffb300', '#ff2d00', '#fff1a8'], gravity: -0.12, shape: 'circle', maxSpeed: 5 },
      agua: { color: ['#4fc3f7', '#0288d1', '#b3e5fc', '#e1f5fe'], gravity: 0.25, shape: 'circle', maxSpeed: 7 },
      ar: { color: ['#ffffff', '#e0e7ff', '#cfd8dc'], gravity: 0, shape: 'ring', maxSpeed: 6, drag: 0.9 },
      terra: { color: ['#8d6e63', '#5d4037', '#a1887f', '#3e2723'], gravity: 0.5, shape: 'rock', maxSpeed: 8 },
      gelo: { color: ['#e0f7fa', '#80deea', '#ffffff'], gravity: 0.3, shape: 'spark', maxSpeed: 7 },
      raio: { color: ['#9be7ff', '#ffffff', '#4fd5ff'], gravity: 0, shape: 'spark', maxSpeed: 12, drag: 0.85 },
      nao: { color: ['#b0bec5', '#ffffff'], gravity: 0.2, shape: 'spark', maxSpeed: 5 },
      hit: { color: ['#ffffff', '#ffe082', '#ff8a65'], gravity: 0.15, shape: 'spark', maxSpeed: 9 },
      block: { color: ['#90caf9', '#ffffff'], gravity: 0.1, shape: 'spark', maxSpeed: 5 },
    };
    burst(x, y, n, Object.assign({}, presets[el] || presets.hit, extra));
  }

  function update() {
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag; p.vy *= p.drag;
      p.rot += p.vrot;
      p.life--;
      if (p.life <= 0) list.splice(i, 1);
    }
  }

  function draw(ctx) {
    for (const p of list) {
      const t = p.life / p.maxLife;
      const s = p.shrink ? p.size * (0.3 + 0.7 * t) : p.size;
      ctx.globalAlpha = Math.min(1, t * 1.5) * p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, Math.PI * 2); ctx.fill();
      } else if (p.shape === 'spark') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx));
        ctx.fillRect(-s * 1.6, -s * 0.35, s * 3.2, s * 0.7); ctx.restore();
      } else if (p.shape === 'ring') {
        ctx.lineWidth = Math.max(1, s * 0.4);
        ctx.beginPath(); ctx.arc(p.x, p.y, s * 2 * (1.4 - t), 0, Math.PI * 2); ctx.stroke();
      } else if (p.shape === 'rock') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.beginPath(); ctx.moveTo(-s, -s * 0.6); ctx.lineTo(s * 0.8, -s); ctx.lineTo(s, s * 0.5); ctx.lineTo(-s * 0.5, s); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }

  function clear() { list.length = 0; }
  return { spawn, burst, element, update, draw, clear, list };
})();
