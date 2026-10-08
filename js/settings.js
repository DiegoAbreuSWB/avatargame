/* Configurações persistentes (localStorage) e nomes amigáveis das teclas.
   Decisão: um único objeto JSON salvo sob a chave "avatarArena.settings"; valores ausentes caem nos padrões,
   para que novas opções possam ser adicionadas sem invalidar o que o jogador já salvou. */
const Settings = (() => {
  const DEFAULT_KEYS = {
    p1: { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', punch: 'KeyF', kick: 'KeyG', special: 'KeyH', super: 'KeyT' },
    p2: { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', punch: 'KeyJ', kick: 'KeyK', special: 'KeyL', super: 'KeyI' },
  };
  const DEFAULTS = {
    graphics: '3d', sound: true, music: true, difficulty: 'normal', roundTime: 99, roundsToWin: 2,
    lang: 'pt', touch: 'auto', debug: false, keys: DEFAULT_KEYS,
  };
  const KEY = 'avatarArena.settings';
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let data = clone(DEFAULTS);
  const listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        data = clone(DEFAULTS);
        for (const k in saved) {
          if (k === 'keys') { for (const p of ['p1', 'p2']) Object.assign(data.keys[p], (saved.keys && saved.keys[p]) || {}); }
          else if (k in DEFAULTS) data[k] = saved[k];
        }
      }
    } catch (e) { /* armazenamento indisponível: fica nos padrões */ }
    apply();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignora */ } apply(); }
  function reset() { data = clone(DEFAULTS); save(); }
  function resetKeys(player) { data.keys[player] = clone(DEFAULT_KEYS[player]); save(); }
  function apply() {
    for (const p of ['p1', 'p2']) {
      Object.assign(KEYMAPS[p], data.keys[p]);
      KEYMAPS[p].labels = labelsFor(KEYMAPS[p]);
    }
    for (const fn of listeners) fn(data);
  }
  function onChange(fn) { listeners.push(fn); }
  function labelsFor(m) {
    return {
      move: `${keyLabel(m.up)} ${keyLabel(m.left)} ${keyLabel(m.down)} ${keyLabel(m.right)}`,
      up: keyLabel(m.up), down: keyLabel(m.down), left: keyLabel(m.left), right: keyLabel(m.right),
      punch: keyLabel(m.punch), kick: keyLabel(m.kick), special: keyLabel(m.special), super: keyLabel(m.super),
    };
  }
  return { load, save, reset, resetKeys, onChange, get data() { return data; }, DEFAULTS, DEFAULT_KEYS };
})();

// Valores avulsos (recordes etc.) fora do objeto de configurações
function saveSetting(key, value) { try { localStorage.setItem('avatarArena.' + key, String(value)); } catch (e) { /* ignora */ } }
function loadSetting(key) { try { return localStorage.getItem('avatarArena.' + key); } catch (e) { return null; } }

// Nome amigável de um e.code (teclado ABNT2 em mente)
const KEY_NAMES = {
  ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Space: 'ESPAÇO', Enter: 'ENTER', Tab: 'TAB', Backspace: 'BACKSPACE',
  ShiftLeft: 'SHIFT ESQ', ShiftRight: 'SHIFT DIR', ControlLeft: 'CTRL ESQ', ControlRight: 'CTRL DIR', AltLeft: 'ALT ESQ', AltRight: 'ALT DIR',
  CapsLock: 'CAPS', Semicolon: 'Ç', Quote: '~', Comma: ',', Period: '.', Slash: ';', Backslash: ']', BracketLeft: '´', BracketRight: '[',
  Backquote: "'", Minus: '-', Equal: '=', IntlBackslash: '\\', IntlRo: '/', NumpadAdd: 'NUM +', NumpadSubtract: 'NUM -', NumpadMultiply: 'NUM *',
  NumpadDivide: 'NUM /', NumpadEnter: 'NUM ENTER', NumpadDecimal: 'NUM ,', Insert: 'INS', Delete: 'DEL', Home: 'HOME', End: 'END', PageUp: 'PG UP', PageDown: 'PG DN',
};
function keyLabel(code) {
  if (!code) return '?';
  if (KEY_NAMES[code]) return KEY_NAMES[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return 'NUM ' + code.slice(6);
  return code.toUpperCase();
}
// Teclas que o jogo reserva para o sistema (não podem ser mapeadas)
const RESERVED_KEYS = new Set(['Escape', 'Enter', 'KeyM', 'F1', 'F2', 'F3', 'F4', 'F5', 'F11', 'F12']);
