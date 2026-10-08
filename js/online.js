/* Cena "Online (experimental)": criar/entrar em sala, espera do convidado e integração do lockstep com a classe Game. */
Game.prototype.updateOnline = function () {
  const o = this.online || (this.online = { step: 'menu', index: 0, msg: '' });
  if (o.step === 'menu') {
    const n = 3;
    if (this.menuUp()) { o.index = (o.index + n - 1) % n; Audio_.play('menu'); }
    if (this.menuDown()) { o.index = (o.index + 1) % n; Audio_.play('menu'); }
    if (this.backPressed()) { Audio_.play('back'); this.scene = 'title'; return; }
    if (this.confirmPressed()) {
      Audio_.play('confirm');
      if (o.index === 2) { this.scene = 'title'; return; }
      if (!Netplay.supported()) { o.msg = T('Este navegador não suporta WebRTC.'); return; }
      const cb = { connected: (s) => this.netConnected(s), cancel: () => { o.step = 'menu'; } };
      o.step = o.index === 0 ? 'host' : 'guest';
      if (o.index === 0) Netplay.startHost(cb); else Netplay.startGuest(cb);
    }
  } else if (o.step === 'wait') {
    if (this.backPressed()) { Audio_.play('back'); this.netLeave(false); }
  } else if (this.backPressed()) { Netplay.leave(); o.step = 'menu'; }
};

Game.prototype.netConnected = function (session) {
  this.net = session; this.netStalled = 0;
  session.onStart = (cfg) => this.netStartMatch(cfg);
  session.onEnd = () => this.netLeave(true);
  Netplay.hide();
  this.mode = 'online';
  if (session.role === 'host') this.gotoSelect();
  else { this.online.step = 'wait'; this.scene = 'online'; }
};

Game.prototype.netHostStart = function () {
  const cfg = { p1: this.select.p1, p2: this.select.p2, stage: this.stageIndex, seed: (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, mods: this.modifiers.slice(), skin1: this.select.skin1 || 0, skin2: this.select.skin2 || 0 };
  this.net.send({ t: 'start', cfg });
  this.netStartMatch(cfg);
};

Game.prototype.netStartMatch = function (cfg) {
  this.mode = 'online';
  this.select.p1 = cfg.p1; this.select.p2 = cfg.p2; this.stageIndex = cfg.stage; this.modifiers = (cfg.mods || []).slice();
  this.select.skin1 = cfg.skin1 || 0; this.select.skin2 = cfg.skin2 || 0;
  this.seed = cfg.seed; this.startMatch(); this.seed = null;
  this.net.resetFrames(); this.netStalled = 0;
};

Game.prototype.netLeave = function (remote) {
  Netplay.leave();
  this.net = null; this.netStalled = 0;
  if (this.mode === 'online') this.mode = '2p';
  this.online = { step: 'menu', index: 0, msg: remote ? T('O outro jogador saiu.') : '' };
  this.scene = 'title';
};

function drawOnline(ctx, game) {
  drawMenuBackdrop(ctx, game, 4);
  const o = game.online || { step: 'menu', index: 0, msg: '' };
  txt(ctx, T('ONLINE (EXPERIMENTAL)'), CFG.W / 2, 70, { font: FONT_DISPLAY, size: 44, color: '#ffd54f', stroke: '#3b1d00', strokeWidth: 6 });
  if (o.step === 'menu') {
    const opts = [T('Criar sala (você será o Jogador 1)'), T('Entrar na sala (você será o Jogador 2)'), T('Voltar')];
    opts.forEach((s, i) => { const sel = i === o.index; txt(ctx, (sel ? '▶  ' : '') + s, CFG.W / 2, 220 + i * 50, { size: 26, color: sel ? '#fff' : '#aaa' }); });
    const help = [T('Sem servidor: os dois jogadores trocam um código de sala por qualquer canal (mensagem, e-mail).'),
      T('Lockstep com 3 frames de atraso: a luta só avança quando o input do outro lado chega.'),
      T('O anfitrião escolhe os dois lutadores e o cenário. Esc sai da partida.'),
      T('Funciona melhor na mesma rede ou com NAT aberto; sem servidor TURN, algumas redes não conectam.')];
    help.forEach((l, i) => txt(ctx, l, CFG.W / 2, 420 + i * 26, { size: 15, color: '#cfd8dc', weight: 400, stroke: 'rgba(0,0,0,.8)' }));
    if (o.msg) txt(ctx, o.msg, CFG.W / 2, 560, { size: 18, color: '#ff8a65', stroke: 'rgba(0,0,0,.9)' });
  } else if (o.step === 'wait') {
    txt(ctx, T('Conectado! Aguardando o anfitrião escolher os lutadores...'), CFG.W / 2, 300, { size: 24, color: '#bfe9ff', stroke: 'rgba(0,0,0,.9)' });
    txt(ctx, T('Esc para sair'), CFG.W / 2, 350, { size: 16, color: '#b0bec5' });
  } else {
    txt(ctx, Netplay.status || '', CFG.W / 2, CFG.H - 40, { size: 16, color: '#bfe9ff', stroke: 'rgba(0,0,0,.9)' });
  }
}

function drawNetStatus(ctx, game) {
  if (!game.net) return;
  const who = game.net.role === 'host' ? T('Você: Jogador 1') : T('Você: Jogador 2');
  txt(ctx, `${T('ONLINE')} · ${who} · ${T('frame')} ${game.net.frame}`, CFG.W / 2, CFG.H - 14, { size: 12, color: '#bfe9ff', stroke: 'rgba(0,0,0,.9)', weight: 400 });
  if (game.netStalled > 10) {
    ctx.fillStyle = 'rgba(0,0,0,.45)'; roundRect(ctx, CFG.W / 2 - 220, 120, 440, 44, 8); ctx.fill();
    txt(ctx, T('Aguardando o outro jogador...'), CFG.W / 2, 142, { size: 20, color: '#ffd54f' });
  }
}
