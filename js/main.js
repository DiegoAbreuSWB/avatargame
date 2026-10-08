/* Inicialização: canvas, loop de atualização com passo fixo (60 fps) e overlay de início. */
(function boot() {
  const canvas = document.getElementById('game');
  const overlay = document.getElementById('overlay');
  Settings.load();
  const game = new Game(canvas);
  window.game = game;

  // Modo 3D (Three.js); se a biblioteca não carregar ou não houver WebGL, fica no 2D clássico
  try {
    const gl = document.getElementById('gl');
    if (window.THREE && gl) game.r3d = new Renderer3D(gl);
  } catch (e) { console.warn('Modo 3D indisponível:', e); game.r3d = null; }
  game.applySettingsSideEffects();

  let started = false;
  function start() {
    if (started) return;
    started = true;
    overlay.hidden = true;
    Audio_.resume();
  }
  overlay.hidden = false;
  overlay.addEventListener('click', start);
  window.addEventListener('keydown', (e) => { if (!started && (e.code === 'Enter' || e.code === 'Space')) start(); }, { once: false });

  const STEP = 1000 / CFG.FPS;
  let last = performance.now(), acc = 0;
  function loop(now) {
    acc += Math.min(100, now - last); last = now;
    let steps = 0;
    while (acc >= STEP && steps < 4) {
      if (started) game.update(); else Input.beginFrame();
      acc -= STEP; steps++;
    }
    if (acc >= STEP) acc = 0;
    game.draw();
    requestAnimationFrame(loop);
  }
  game.draw();
  requestAnimationFrame(loop);

  // pausa automática se a aba perder o foco durante a luta
  window.addEventListener('blur', () => { if (game.scene === 'fight' && game.phase === 'play') game.paused = true; });
})();
