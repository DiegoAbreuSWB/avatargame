/* Controles de toque para o Jogador 1: direcional e quatro botões desenhados sobre o canvas 2D.
   Ativos quando a configuração é "Sempre" ou, em "Automático", quando o aparelho tem tela sensível ao toque.
   Multitoque: soco + chute ao mesmo tempo = agarrão; dois toques rápidos na direção = dash. */
const Touch = (() => {
  const pointers = new Map();     // pointerId -> {x, y} em coordenadas lógicas
  let canvas = null, prevHeld = {}, held = {}, pressed = {}, lastTouch = 0;
  const BTN = [
    { id: 'left', x: 95, y: 560, r: 46, label: '◀' }, { id: 'right', x: 215, y: 560, r: 46, label: '▶' },
    { id: 'up', x: 155, y: 480, r: 46, label: '▲' }, { id: 'down', x: 155, y: 640, r: 46, label: '▼' },
    { id: 'punch', x: 1000, y: 585, r: 44, label: 'S', color: '#f2a93b' }, { id: 'kick', x: 1095, y: 585, r: 44, label: 'C', color: '#4fc3f7' },
    { id: 'special', x: 1000, y: 490, r: 44, label: 'E', color: '#ffd54f' }, { id: 'super', x: 1095, y: 490, r: 44, label: 'U', color: '#bfe9ff' },
    { id: 'pause', x: CFG.W / 2 + 90, y: 48, r: 22, label: 'II' },
  ];

  function enabled() {
    const mode = Settings.data.touch;
    if (mode === 'off') return false;
    if (mode === 'on') return true;
    return (navigator.maxTouchPoints || 0) > 0;
  }
  function toLogical(e) {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * CFG.W, y: ((e.clientY - r.top) / r.height) * CFG.H };
  }
  function attach(cv) {
    canvas = cv;
    const onDown = (e) => { if (e.pointerType === 'mouse' && Settings.data.touch !== 'on') return; lastTouch = Date.now(); pointers.set(e.pointerId, toLogical(e)); e.preventDefault(); Audio_.resume(); };
    const onMove = (e) => { if (pointers.has(e.pointerId)) pointers.set(e.pointerId, toLogical(e)); };
    const onUp = (e) => { pointers.delete(e.pointerId); };
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp); cv.addEventListener('pointerleave', onUp);
    cv.style.touchAction = 'none';
  }
  function poll() {
    prevHeld = held; held = {}; pressed = {};
    if (!enabled()) return;
    for (const p of pointers.values()) for (const b of BTN) {
      const dx = p.x - b.x, dy = p.y - b.y;
      if (dx * dx + dy * dy <= (b.r + 8) * (b.r + 8)) held[b.id] = true;
    }
    for (const k in held) if (!prevHeld[k]) pressed[k] = true;
  }
  function pad() {
    if (!enabled()) return null;
    return { left: !!held.left, right: !!held.right, up: !!held.up, down: !!held.down, upPressed: !!pressed.up,
      punch: !!pressed.punch, kick: !!pressed.kick, special: !!pressed.special, super: !!pressed.super, throw: false, dashF: false, dashB: false };
  }
  function menu() {
    if (!enabled()) return null;
    return { up: !!pressed.up, down: !!pressed.down, left: !!pressed.left, right: !!pressed.right, confirm: !!pressed.punch || !!pressed.kick, back: !!pressed.special || !!pressed.pause, start: !!pressed.pause };
  }
  function draw(ctx, game) {
    if (!enabled()) return;
    const inFight = game.scene === 'fight';
    for (const b of BTN) {
      if (b.id === 'pause' && !inFight) continue;
      const on = held[b.id];
      ctx.globalAlpha = on ? 0.75 : 0.35;
      ctx.fillStyle = b.color || '#ffffff'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = on ? 1 : 0.6; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
      txt(ctx, b.label, b.x, b.y + 1, { size: b.r * 0.8, color: '#1b1b1b', weight: 900 });
    }
    ctx.globalAlpha = 1;
  }
  return { attach, poll, pad, menu, draw, enabled };
})();
