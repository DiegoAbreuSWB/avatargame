/* Gamepad API: até dois controles no layout "standard" (Xbox/PlayStation/genéricos).
   Slot 0 = Jogador 1, slot 1 = Jogador 2. Botões: X = soco, A = chute, B = especial, Y = super,
   RB = agarrão, LB = dash, Start = pausa/Esc, direcional ou analógico esquerdo = mover.
   Decisão: sem remapeamento de gamepad por enquanto; o layout padrão cobre a grande maioria dos controles. */
const Gamepad_ = (() => {
  const prev = [null, null];
  const pads = [null, null];
  let menuState = { up: false, down: false, left: false, right: false, confirm: false, back: false, start: false };
  let anyConnected = false;

  function readRaw(gp) {
    const b = (i) => !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.5));
    const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    return {
      left: b(14) || ax < -0.5, right: b(15) || ax > 0.5, up: b(12) || ay < -0.5, down: b(13) || ay > 0.5,
      punch: b(2), kick: b(0), special: b(1), super: b(3), throw: b(5), dash: b(4), start: b(9), back: b(8),
    };
  }

  function poll() {
    let list = [];
    try { list = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : []; } catch (e) { list = []; }
    anyConnected = list.length > 0;
    const menu = { up: false, down: false, left: false, right: false, confirm: false, back: false, start: false };
    for (let slot = 0; slot < 2; slot++) {
      const gp = list[slot];
      if (!gp) { pads[slot] = null; prev[slot] = null; continue; }
      const raw = readRaw(gp), p = prev[slot] || {};
      const edge = (k) => raw[k] && !p[k];
      pads[slot] = {
        left: raw.left, right: raw.right, up: raw.up, down: raw.down, upPressed: edge('up'),
        punch: edge('punch'), kick: edge('kick'), special: edge('special'), super: edge('super'),
        throw: edge('throw'), dashF: edge('dash'), dashB: false,
      };
      menu.up = menu.up || edge('up'); menu.down = menu.down || edge('down'); menu.left = menu.left || edge('left'); menu.right = menu.right || edge('right');
      menu.confirm = menu.confirm || edge('kick') || edge('start'); menu.back = menu.back || edge('special') || edge('back'); menu.start = menu.start || edge('start');
      prev[slot] = raw;
    }
    menuState = menu;
  }
  function pad(slot) { return pads[slot]; }
  function menu() { return menuState; }
  function connected() { return anyConnected; }
  // mescla um pad de gamepad em um pad de teclado (OR lógico)
  function merge(base, extra) {
    if (!extra) return base;
    for (const k in extra) if (extra[k]) base[k] = true;
    return base;
  }
  return { poll, pad, menu, connected, merge };
})();
