/* Campanha: Toph — A Bandida Cega. */
(window.CAMPAIGNS = window.CAMPAIGNS || {}).toph = {
  title: 'A Bandida Cega', subtitle: 'A menina que os pais escondiam do mundo e que o mundo não conseguiu esconder.', endingsCount: 2,
  endingName: (p) => (p.rep > 0 ? 'A mestra de metal' : 'A campeã da arena'), start: 'ch1',
  chapters: [
    { title: 'A arena', place: 'Omashu', stage: 'omashu', summary: 'Toph luta escondida como a Bandida Cega. Um careca com uma flecha aparece na plateia.' },
    { title: 'Pés leves', place: 'Deserto Si Wong', stage: 'deserto', summary: 'Na areia, Toph não enxerga nada. Aang aprende a esperar; ela aprende a pedir ajuda.' },
    { title: 'A cidade de muros', place: 'Ba Sing Se', stage: 'basingse', summary: 'Azula, Mai e Ty Lee caçam o grupo pela cidade.' },
    { title: 'A caixa de metal', place: 'Prisão da Rocha Fervente', stage: 'fervente', summary: 'Presa numa cela de metal, Toph descobre a terra dentro do ferro.' },
  ],
  nodes: {
    ch1: { t: 'chapter', chapter: 0, next: 'c1_d1' },
    c1_d1: { t: 'dialogue', bg: 'omashu', with: 'bumi', caption: 'Torneio de Dobra de Terra', next: 'c1_f1', lines: [
      { who: 'bumi', text: 'A campeã invicta! Hoje enfrenta um velho rei que ninguém convidou. Hehehe!' },
      { who: 'toph', text: 'Pode ser rei de onde for, vovô. Aqui o chão é meu.' },
    ] },
    c1_f1: { t: 'fight', opp: 'bumi', stage: 'omashu', level: 'normal', rounds: 1, win: 'c1_d2' },
    c1_d2: { t: 'dialogue', bg: 'omashu', with: 'aang', next: 'c1_f2', lines: [
      { who: 'aang', text: 'Você é a mestra que eu vi na visão! Eu preciso aprender dobra de terra. Me ensina?' },
      { who: 'toph', text: 'Eu não ensino quem flutua, Pés Leves. Prova que aguenta uma pedra.' },
    ] },
    c1_f2: { t: 'fight', opp: 'aang', stage: 'omashu', level: 'normal', rounds: 1, noHeal: true, win: 'ch2' },
    ch2: { t: 'chapter', chapter: 1, next: 'c2_d1' },
    c2_d1: { t: 'dialogue', bg: 'deserto', with: 'sokka', caption: 'Pés leves', next: 'c2_f1', lines: [
      { who: 'toph', text: 'Areia. Tudo se mexe. Eu não vejo nada aqui, Sokka. Nada.' },
      { who: 'sokka', text: 'Então hoje eu sou os seus olhos. Tem alguém vindo. Grande. Com um terceiro olho.' },
    ] },
    c2_f1: { t: 'fight', opp: 'combustao', stage: 'deserto', level: 'normal', rounds: 1, win: 'c2_c1' },
    c2_c1: { t: 'choice', id: 'ajuda', bg: 'deserto', prompt: 'Depois da luta, Toph admite que precisou de Sokka para vencer. O que ela faz com isso?', options: [
      { text: 'Aceitar que precisa dos outros', hint: 'A força também é dividir. Rota: mestra de metal.', flag: 'equipe', rep: 1, next: 'ch3' },
      { text: 'Treinar até nunca mais precisar', hint: 'Só ela e o chão. Rota: campeã da arena.', flag: 'sozinha', rep: -1, next: 'ch3' },
    ] },
    ch3: { t: 'chapter', chapter: 2, next: 'c3_d1' },
    c3_d1: { t: 'dialogue', bg: 'basingse', with: 'tylee', caption: 'A cidade de muros', next: 'c3_f1', lines: [
      { who: 'tylee', text: 'Oi! Sua aura é bem cinzenta, mas de um jeito legal! Eu vou ter que desligar o seu chi, tá?' },
      { who: 'toph', text: 'Tenta. Eu sinto cada passinho seu.' },
    ] },
    c3_f1: { t: 'fight', opp: 'tylee', stage: 'basingse', level: 'normal', rounds: 1, win: 'c3_f2' },
    c3_f2: { t: 'fight', opp: 'azula', stage: 'basingse', level: 'hard', rounds: 1, noHeal: true, win: 'c3_r1', intro: 'Azula não dá descanso' },
    c3_r1: { t: 'reward', skin: 'bandida', text: 'O traje da campeã', next: 'ch4' },
    ch4: { t: 'chapter', chapter: 3, next: 'c4_d1' },
    c4_d1: { t: 'dialogue', bg: 'fervente', caption: 'A caixa de metal', next: 'c4_c1', lines: [
      { who: 'toph', text: 'Metal. Eles acham que metal não é terra. Mas tem terra aqui dentro, pequenina, se eu escutar com cuidado...' },
    ] },
    c4_c1: { t: 'choice', id: 'metal', bg: 'fervente', prompt: 'Toph sente a terra dentro do metal. Como sair da cela?', options: [
      { text: 'Dobrar o metal pela primeira vez', hint: 'Ninguém fez isso antes. Rota: mestra de metal.', flag: 'metal', rep: 1, next: 'c4_f1' },
      { text: 'Esperar os guardas e lutar', hint: 'Do jeito de sempre. Rota: campeã da arena.', flag: 'guardas', rep: -1, next: 'c4_f1' },
    ] },
    c4_f1: { t: 'fight', opp: 'mai', stage: 'fervente', level: 'hard', rounds: 1, win: 'c4_f2' },
    c4_f2: { t: 'fight', opp: 'ozai', stage: 'fervente', level: 'hard', rounds: 2, mods: ['cometa'], bossHp: 120, win: 'c4_e', intro: 'O Senhor do Fogo passa pela prisão' },
    c4_e: { t: 'branch', when: (p) => (p.rep > 0 ? 'end_metal' : 'end_arena') },
    end_metal: { t: 'ending', id: 'metal', name: 'A mestra de metal', bg: 'fervente', lines: [
      'Toph saiu da cela dobrando a porta. Décadas depois, a polícia de uma cidade inteira usaria o que ela inventou ali.',
      'Primeira regra da academia: ninguém me chama de senhorita.',
    ] },
    end_arena: { t: 'ending', id: 'arena', name: 'A campeã da arena', bg: 'fervente', lines: [
      'Toph venceu todos sozinha, do jeito que sempre quis. Voltou para a arena e nunca mais perdeu.',
      'Nunca mais precisou de ninguém. E nunca descobriu o metal. (Cenário alternativo.)',
    ] },
  },
};
