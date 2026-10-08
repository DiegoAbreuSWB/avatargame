/* Efeitos sonoros sintetizados com Web Audio (sem arquivos externos). */
const Audio_ = (() => {
  let ctx = null;
  let master = null;
  let muted = false;

  function ensure() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    } catch (e) { return false; }
    return true;
  }
  function resume() { if (ensure() && ctx.state === 'suspended') ctx.resume(); }
  function toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : 0.35; return muted; }
  function isMuted() { return muted; }

  function noise(duration, { freq = 1200, q = 1, type = 'lowpass', vol = 0.6, decay = duration } = {}) {
    if (!ensure() || muted) return;
    const len = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + decay);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + duration);
  }
  function tone(freqA, freqB, duration, { type = 'sine', vol = 0.4 } = {}) {
    if (!ensure() || muted) return;
    const o = ctx.createOscillator(); o.type = type;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    o.frequency.setValueAtTime(freqA, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, freqB), t + duration);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + duration);
  }

  const sfx = {
    menu: () => tone(660, 880, 0.08, { type: 'square', vol: 0.15 }),
    confirm: () => { tone(520, 1040, 0.15, { type: 'square', vol: 0.18 }); setTimeout(() => tone(780, 1560, 0.15, { type: 'square', vol: 0.15 }), 80); },
    back: () => tone(500, 250, 0.12, { type: 'square', vol: 0.15 }),
    whoosh: () => noise(0.12, { freq: 900, type: 'bandpass', q: 0.8, vol: 0.25 }),
    hit: () => { noise(0.12, { freq: 500, vol: 0.7 }); tone(180, 60, 0.12, { type: 'triangle', vol: 0.5 }); },
    hitHeavy: () => { noise(0.2, { freq: 400, vol: 0.9 }); tone(140, 40, 0.22, { type: 'triangle', vol: 0.7 }); },
    block: () => { noise(0.06, { freq: 2500, type: 'highpass', vol: 0.4 }); tone(900, 700, 0.06, { type: 'square', vol: 0.15 }); },
    jump: () => tone(300, 600, 0.12, { type: 'sine', vol: 0.15 }),
    fire: () => noise(0.35, { freq: 700, type: 'lowpass', q: 2, vol: 0.5 }),
    water: () => { tone(400, 900, 0.3, { type: 'sine', vol: 0.25 }); noise(0.3, { freq: 1800, type: 'bandpass', q: 3, vol: 0.2 }); },
    air: () => noise(0.4, { freq: 1500, type: 'bandpass', q: 1.5, vol: 0.35 }),
    earth: () => { noise(0.4, { freq: 180, type: 'lowpass', q: 1, vol: 0.9 }); tone(90, 30, 0.4, { type: 'triangle', vol: 0.5 }); },
    lightning: () => { noise(0.5, { freq: 4000, type: 'highpass', vol: 0.6 }); tone(1200, 80, 0.4, { type: 'sawtooth', vol: 0.25 }); },
    boomerang: () => { tone(500, 700, 0.25, { type: 'triangle', vol: 0.2 }); },
    super: () => { tone(200, 1200, 0.6, { type: 'sawtooth', vol: 0.3 }); noise(0.6, { freq: 1000, type: 'bandpass', q: 1, vol: 0.4 }); },
    ko: () => { tone(400, 50, 0.9, { type: 'sawtooth', vol: 0.4 }); noise(0.6, { freq: 300, vol: 0.9 }); },
    round: () => { tone(440, 440, 0.2, { type: 'square', vol: 0.2 }); setTimeout(() => tone(660, 660, 0.3, { type: 'square', vol: 0.2 }), 180); },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, f, 0.25, { type: 'square', vol: 0.18 }), i * 120)); },
    chi: () => tone(900, 1800, 0.25, { type: 'sine', vol: 0.2 }),
  };
  function play(name) { try { if (sfx[name]) sfx[name](); } catch (e) { /* ignora */ } }
  function element(el) {
    play({ ar: 'air', agua: 'water', fogo: 'fire', terra: 'earth', nao: 'boomerang' }[el] || 'whoosh');
  }

  return { resume, toggleMute, isMuted, play, element };
})();
