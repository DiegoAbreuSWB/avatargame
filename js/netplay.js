/* Jogo online (experimental): lockstep com atraso fixo sobre WebRTC DataChannel.
   - NetSession: protocolo de inputs por frame, independente do transporte (WebRTC ou loopback nos testes).
   - Netplay: fluxo de conexão sem servidor (troca manual de "códigos de sala" = SDP em base64) e painel na tela.
   Decisão: os dois lados simulam a mesma luta a partir dos mesmos inputs e da mesma semente (ADR-014);
   cada frame só avança quando o input remoto daquele frame chegou. Atraso de 3 frames (50 ms). */
const NET_DELAY = 3;
const PAD_BITS = ['left', 'right', 'up', 'down', 'upPressed', 'punch', 'kick', 'special', 'super', 'throw', 'dashF', 'dashB'];
function packPad(p) { let n = 0; PAD_BITS.forEach((k, i) => { if (p && p[k]) n |= 1 << i; }); return n; }
function unpackPad(n) { const p = Input.emptyPad(); PAD_BITS.forEach((k, i) => { p[k] = !!(n & (1 << i)); }); return p; }

class NetSession {
  constructor(role, transport) {
    this.role = role;                 // 'host' = Jogador 1, 'guest' = Jogador 2
    this.transport = transport;       // { send(obj), onMessage(fn), close() }
    this.local = new Map(); this.remote = new Map();
    this.frame = 0; this.pending = 0; this.sentUpTo = -1;
    this.onStart = null; this.onEnd = null; this.stalled = 0;
    transport.onMessage((m) => this.receive(m));
  }
  get localSlot() { return this.role === 'host' ? 0 : 1; }
  send(obj) { this.transport.send(obj); }
  receive(m) {
    if (m.t === 'i') { for (const [f, b] of m.v) this.remote.set(f, b); }
    else if (m.t === 'start' && this.onStart) this.onStart(m.cfg);
    else if (m.t === 'bye' && this.onEnd) this.onEnd();
  }
  resetFrames() { this.local.clear(); this.remote.clear(); this.frame = 0; this.pending = 0; this.sentUpTo = -1; this.stalled = 0; }
  /* acumula o pad local deste quadro de tela (edges em OR, para não perder toques durante uma espera) */
  sample(pad) { this.pending |= packPad(pad); }
  /* tenta liberar o frame atual: envia o input local para frame+DELAY e verifica se o remoto chegou */
  tick() {
    const target = this.frame + NET_DELAY;
    if (this.sentUpTo < target) {
      this.local.set(target, this.pending); this.pending = 0;
      const batch = []; for (let f = Math.max(0, target - 4); f <= target; f++) if (this.local.has(f)) batch.push([f, this.local.get(f)]);
      this.send({ t: 'i', v: batch }); this.sentUpTo = target;
    }
    const ok = this.frame < NET_DELAY || (this.remote.has(this.frame) && this.local.has(this.frame));
    this.stalled = ok ? 0 : this.stalled + 1;
    return ok;
  }
  padFor(slot) {
    const f = this.frame;
    if (f < NET_DELAY) return Input.emptyPad();
    const bits = slot === this.localSlot ? this.local.get(f) : this.remote.get(f);
    return unpackPad(bits || 0);
  }
  advance() { this.frame++; if (this.frame % 600 === 0) { for (const m of [this.local, this.remote]) for (const k of m.keys()) if (k < this.frame - 60) m.delete(k); } }
  close() { try { this.send({ t: 'bye' }); } catch (e) { /* ignora */ } this.transport.close(); }
}

/* transporte em memória para testes: duas pontas ligadas com atraso em quadros */
function loopbackPair(delayFrames = 2) {
  const q = [[], []], handlers = [null, null];
  const make = (i) => ({
    send: (obj) => q[1 - i].push({ at: delayFrames, obj: JSON.parse(JSON.stringify(obj)) }),
    onMessage: (fn) => { handlers[i] = fn; },
    close: () => {},
  });
  const pump = () => { for (let i = 0; i < 2; i++) { for (const m of q[i]) m.at--; while (q[i].length && q[i][0].at <= 0) { const m = q[i].shift(); if (handlers[i]) handlers[i](m.obj); } } };
  return { a: make(0), b: make(1), pump };
}

/* ----- fluxo WebRTC sem servidor ----- */
const Netplay = (() => {
  const ICE = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }];
  let pc = null, dc = null, role = null, session = null, panel = null, status = '';
  let onConnected = null;

  const encode = (desc) => btoa(unescape(encodeURIComponent(JSON.stringify({ type: desc.type, sdp: desc.sdp }))));
  const decode = (code) => JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
  const iceDone = (pc) => new Promise((res) => { if (pc.iceGatheringState === 'complete') return res(); const t = setTimeout(res, 4000); pc.onicegatheringstatechange = () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } }; });
  function transportFor(channel) {
    let handler = null;
    channel.onmessage = (e) => { try { if (handler) handler(JSON.parse(e.data)); } catch (err) { /* ignora */ } };
    return { send: (obj) => { if (channel.readyState === 'open') channel.send(JSON.stringify(obj)); }, onMessage: (fn) => { handler = fn; }, close: () => { try { channel.close(); } catch (e) { /* */ } try { pc && pc.close(); } catch (e) { /* */ } } };
  }
  function wire(channel) {
    dc = channel;
    channel.onopen = () => { session = new NetSession(role, transportFor(channel)); setStatus(T('Conectado!')); if (onConnected) onConnected(session); };
    channel.onclose = () => { setStatus(T('Conexão encerrada.')); if (session && session.onEnd) session.onEnd(); };
  }
  async function host() {
    role = 'host'; pc = new RTCPeerConnection({ iceServers: ICE });
    wire(pc.createDataChannel('inputs', { ordered: true }));
    await pc.setLocalDescription(await pc.createOffer()); await iceDone(pc);
    return encode(pc.localDescription);
  }
  async function join(code) {
    role = 'guest'; pc = new RTCPeerConnection({ iceServers: ICE });
    pc.ondatachannel = (e) => wire(e.channel);
    await pc.setRemoteDescription(decode(code));
    await pc.setLocalDescription(await pc.createAnswer()); await iceDone(pc);
    return encode(pc.localDescription);
  }
  async function accept(code) { await pc.setRemoteDescription(decode(code)); }
  function setStatus(s) { status = s; if (panel) panel.querySelector('.net-status').textContent = s; }
  function leave() { if (session) session.close(); session = null; dc = null; if (pc) { try { pc.close(); } catch (e) { /* */ } } pc = null; role = null; hide(); }

  /* painel DOM (textarea para copiar/colar o código da sala) */
  function ensurePanel() {
    if (panel) return panel;
    const frame = document.getElementById('frame'); if (!frame) return null;
    panel = document.createElement('div'); panel.id = 'netpanel'; panel.hidden = true;
    panel.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92%,640px);background:#151a24;color:#f2ebdc;border:1px solid rgba(232,163,61,.5);border-radius:10px;padding:18px 22px;font:14px "Noto Sans",system-ui,sans-serif;z-index:5;box-shadow:0 20px 60px rgba(0,0,0,.6)';
    panel.innerHTML = '<h3 class="net-title" style="margin:0 0 8px;font-family:Cinzel,serif;color:#e8a33d;letter-spacing:.06em"></h3>'
      + '<p class="net-help" style="margin:0 0 10px;color:#9aa3b5"></p>'
      + '<label class="net-l1" style="display:block;margin:6px 0 4px"></label><textarea class="net-mine" readonly rows="3" style="width:100%;box-sizing:border-box;background:#0b0d12;color:#dfe7f2;border:1px solid #2a2f3a;border-radius:6px;padding:6px;font:12px monospace"></textarea>'
      + '<div style="display:flex;gap:8px;margin:6px 0 10px"><button class="net-copy" type="button"></button></div>'
      + '<label class="net-l2" style="display:block;margin:6px 0 4px"></label><textarea class="net-theirs" rows="3" style="width:100%;box-sizing:border-box;background:#0b0d12;color:#dfe7f2;border:1px solid #2a2f3a;border-radius:6px;padding:6px;font:12px monospace"></textarea>'
      + '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="net-ok" type="button"></button><button class="net-cancel" type="button"></button></div>'
      + '<p class="net-status" style="margin:10px 0 0;color:#bfe9ff"></p>';
    for (const b of panel.querySelectorAll('button')) b.style.cssText = 'padding:8px 14px;border-radius:6px;border:1px solid rgba(232,163,61,.6);background:#1f2633;color:#fff;cursor:pointer;font:600 14px "Noto Sans",system-ui,sans-serif';
    frame.appendChild(panel);
    panel.addEventListener('keydown', (e) => e.stopPropagation());   // digitar no painel não controla o jogo
    return panel;
  }
  function hide() { if (panel) panel.hidden = true; }
  function show(opts) {
    const p = ensurePanel(); if (!p) return;
    p.hidden = false;
    p.querySelector('.net-title').textContent = opts.title; p.querySelector('.net-help').textContent = opts.help;
    p.querySelector('.net-l1').textContent = opts.mineLabel; p.querySelector('.net-mine').value = opts.mine || '';
    p.querySelector('.net-l2').textContent = opts.theirsLabel; p.querySelector('.net-theirs').value = '';
    const row2 = p.querySelector('.net-l2').style.display = opts.theirsLabel ? 'block' : 'none'; p.querySelector('.net-theirs').style.display = opts.theirsLabel ? 'block' : 'none';
    p.querySelector('.net-copy').textContent = T('Copiar código'); p.querySelector('.net-ok').textContent = opts.okLabel || T('Conectar'); p.querySelector('.net-cancel').textContent = T('Cancelar');
    p.querySelector('.net-ok').style.display = opts.okLabel === null ? 'none' : 'inline-block';
    p.querySelector('.net-copy').onclick = () => { const ta = p.querySelector('.net-mine'); ta.select(); try { navigator.clipboard.writeText(ta.value).then(() => setStatus(T('Código copiado.'))).catch(() => document.execCommand('copy')); } catch (e) { document.execCommand('copy'); } };
    p.querySelector('.net-ok').onclick = () => opts.onOk && opts.onOk(p.querySelector('.net-theirs').value);
    p.querySelector('.net-cancel').onclick = () => { leave(); if (opts.onCancel) opts.onCancel(); };
    setStatus(opts.status || '');
  }

  /* fluxos de alto nível usados pela cena "online" */
  async function startHost(cb) {
    onConnected = cb.connected;
    try {
      show({ title: T('Criar sala'), help: T('Gerando o código da sala...'), mineLabel: T('Seu código (envie ao amigo):'), theirsLabel: T('Código de resposta do amigo:'), okLabel: T('Conectar'), onCancel: cb.cancel,
        onOk: async (code) => { try { setStatus(T('Conectando...')); await accept(code); } catch (e) { setStatus(T('Código inválido.')); } } });
      const mine = await host();
      panel.querySelector('.net-mine').value = mine; setStatus(T('Envie seu código e cole aqui a resposta do amigo.'));
    } catch (e) { setStatus(T('Erro: {0}', e.message)); }
  }
  function startGuest(cb) {
    onConnected = cb.connected;
    show({ title: T('Entrar na sala'), help: T('Cole o código recebido do anfitrião e gere sua resposta.'), mineLabel: T('Sua resposta (envie ao anfitrião):'), theirsLabel: T('Código do anfitrião:'), okLabel: T('Gerar resposta'), onCancel: cb.cancel,
      onOk: async (code) => { try { setStatus(T('Gerando resposta...')); const ans = await join(code); panel.querySelector('.net-mine').value = ans; setStatus(T('Envie sua resposta ao anfitrião e aguarde a conexão.')); } catch (e) { setStatus(T('Código inválido.')); } } });
  }
  return { startHost, startGuest, leave, hide, get session() { return session; }, get role() { return role; }, get status() { return status; }, supported: () => typeof RTCPeerConnection !== 'undefined' };
})();
