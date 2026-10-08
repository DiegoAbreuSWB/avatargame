/* Leitura do teclado: teclas seguradas e "pressionadas neste frame", por e.code. */
const Input = (() => {
  const down = new Set();
  const pressedThisFrame = new Set();
  const queue = [];       // pressionamentos acumulados até o próximo frame lógico
  const blockedCodes = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab']);

  window.addEventListener('keydown', (e) => {
    if (blockedCodes.has(e.code)) e.preventDefault();
    if (!e.repeat) queue.push(e.code);
    down.add(e.code);
    Audio_.resume();
  });
  window.addEventListener('keyup', (e) => { down.delete(e.code); });
  window.addEventListener('blur', () => { down.clear(); });

  function beginFrame() {
    pressedThisFrame.clear();
    while (queue.length) pressedThisFrame.add(queue.shift());
  }
  const held = (code) => down.has(code);
  const pressed = (code) => pressedThisFrame.has(code);
  const anyPressed = () => pressedThisFrame.size > 0;
  const pressedCodes = () => [...pressedThisFrame];

  // Estado de controle de um lutador a partir de um keymap
  function readPad(map) {
    return {
      left: held(map.left), right: held(map.right), up: held(map.up), down: held(map.down),
      upPressed: pressed(map.up),
      punch: pressed(map.punch), kick: pressed(map.kick),
      special: pressed(map.special), super: pressed(map.super),
    };
  }
  const emptyPad = () => ({ left: false, right: false, up: false, down: false, upPressed: false, punch: false, kick: false, special: false, super: false, dashF: false, dashB: false });

  return { beginFrame, held, pressed, anyPressed, pressedCodes, readPad, emptyPad };
})();
