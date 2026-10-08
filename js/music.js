/* Música: sequenciador em Web Audio, um tema curto por "clima" de cenário (sem arquivos de áudio).
   Cada tema é um loop de 32 semicolcheias com baixo, melodia e percussão; a melodia é gerada de forma
   determinística a partir de uma semente própria, então toca sempre igual. */
const Music = (() => {
  const THEMES = {
    menu:  { bpm: 92,  root: 57, scale: [0, 2, 4, 7, 9], lead: 'sine', bassEvery: 8, kick: [0, 8], hat: 4, seed: 11, vol: 0.5 },
    ar:    { bpm: 118, root: 62, scale: [0, 2, 4, 7, 9, 12], lead: 'triangle', bassEvery: 4, kick: [0, 8, 10], hat: 2, seed: 7, vol: 0.7 },
    agua:  { bpm: 96,  root: 55, scale: [0, 3, 5, 7, 10, 12], lead: 'sine', bassEvery: 8, kick: [0, 10], hat: 4, seed: 21, vol: 0.6 },
    fogo:  { bpm: 140, root: 52, scale: [0, 2, 3, 7, 8, 12], lead: 'square', bassEvery: 2, kick: [0, 4, 8, 12, 14], hat: 1, seed: 33, vol: 0.75 },
    terra: { bpm: 108, root: 48, scale: [0, 3, 5, 7, 10], lead: 'triangle', bassEvery: 4, kick: [0, 6, 8], hat: 2, seed: 5, vol: 0.7 },
  };
  let current = null, timer = null, nextTime = 0, step = 0, gain = null, pattern = null;

  function seeded(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function buildPattern(th) {
    const r = seeded(th.seed); const lead = [];
    let deg = 0;
    for (let i = 0; i < 32; i++) {
      if (r() < 0.62) { deg = Math.max(0, Math.min(th.scale.length - 1, deg + (r() < 0.5 ? -1 : 1) * (r() < 0.3 ? 2 : 1))); lead.push(th.scale[deg] + (r() < 0.15 ? 12 : 0)); }
      else lead.push(null);
    }
    const bass = [0, 0, 5, 5, 3, 3, 7, 7].map((d) => d);
    return { lead, bass };
  }
  const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  function note(ctx, time, midi, dur, type, vol, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq(midi);
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(vol, time + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g); g.connect(dest); o.start(time); o.stop(time + dur + 0.02);
  }
  function drum(ctx, time, kind, dest) {
    if (kind === 'kick') { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(140, time); o.frequency.exponentialRampToValueAtTime(40, time + 0.12); g.gain.setValueAtTime(0.5, time); g.gain.exponentialRampToValueAtTime(0.001, time + 0.14); o.connect(g); g.connect(dest); o.start(time); o.stop(time + 0.16); return; }
    const len = Math.floor(ctx.sampleRate * 0.05), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000;
    const g = ctx.createGain(); g.gain.value = 0.12; src.connect(f); f.connect(g); g.connect(dest); src.start(time);
  }

  function schedule() {
    const ctx = Audio_.context(); if (!ctx || !current) return;
    const th = THEMES[current], stepDur = 60 / th.bpm / 4;
    while (nextTime < ctx.currentTime + 0.15) {
      const i = step % 32, bar = Math.floor(step / 32) % 4;
      if (th.kick.includes(i % 16)) drum(ctx, nextTime, 'kick', gain);
      if (i % th.hat === 0 && (i % 4 !== 0 || th.hat === 1)) drum(ctx, nextTime, 'hat', gain);
      if (i % th.bassEvery === 0) note(ctx, nextTime, th.root - 12 + th.scale[pattern.bass[(Math.floor(i / 4) + bar * 2) % 8] % th.scale.length], stepDur * th.bassEvery * 0.9, 'triangle', 0.22, gain);
      const l = pattern.lead[i];
      if (l !== null && (bar !== 1 || i % 2 === 0)) note(ctx, nextTime, th.root + 12 + l + (bar === 3 ? 12 : 0), stepDur * 1.8, th.lead, th.lead === 'square' ? 0.08 : 0.14, gain);
      nextTime += stepDur; step++;
    }
  }

  function play(themeId) {
    if (!THEMES[themeId]) themeId = 'menu';
    if (current === themeId && timer) return;
    stop();
    const ctx = Audio_.context(); if (!ctx) return;
    if (!gain) { gain = ctx.createGain(); gain.connect(Audio_.master()); }
    gain.gain.value = THEMES[themeId].vol * 0.5;
    current = themeId; pattern = buildPattern(THEMES[themeId]); step = 0; nextTime = ctx.currentTime + 0.05;
    timer = setInterval(schedule, 50);
  }
  function stop() { if (timer) clearInterval(timer); timer = null; current = null; }
  function ensure(themeId, enabled) {
    if (!enabled || !themeId) { if (timer) stop(); return; }
    const ctx = Audio_.context();
    if (!ctx || ctx.state !== 'running') return;   // só depois da primeira interação do usuário
    play(themeId);
  }
  return { play, stop, ensure, current: () => current, THEMES };
})();
