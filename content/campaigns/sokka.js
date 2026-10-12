/* Campanha: Sokka — O Plano. */
(window.CAMPAIGNS = window.CAMPAIGNS || {}).sokka = {
  title: 'O Plano', subtitle: 'O único sem dobra num grupo de lendas, e o único com um plano.', endingsCount: 2,
  endingName: (p) => (p.rep > 0 ? 'O estrategista' : 'O guerreiro'), start: 'ch1',
  chapters: [
    { title: 'Os guerreiros Kyoshi', place: 'Ilha Kyoshi', stage: 'ember', summary: 'Sokka ri das guerreiras. Suki responde com um leque na cara.' },
    { title: 'A espada', place: 'Palácio da Nação do Fogo', stage: 'palacio', summary: 'Mestre Piandao não está aqui, mas um teste existe: Sokka precisa provar que vale uma espada.' },
    { title: 'O dia da invasão', place: 'Prisão da Rocha Fervente', stage: 'fervente', summary: 'O plano era perfeito. O eclipse, não.' },
    { title: 'Os dirigíveis', place: 'Deserto Si Wong', stage: 'deserto', summary: 'Sem dobra, no céu, com um bumerangue e uma espada.' },
  ],
  nodes: {
    ch1: { t: 'chapter', chapter: 0, next: 'c1_d1' },
    c1_d1: { t: 'dialogue', bg: 'ember', with: 'suki', caption: 'Os guerreiros Kyoshi', next: 'c1_f1', lines: [
      { who: 'sokka', text: 'Então vocês são... as guerreiras? Com maquiagem e vestido? Sem ofensa.' },
      { who: 'suki', text: 'Com ofensa. Pega o leque. Vamos ver quanto tempo o guerreiro aguenta.' },
    ] },
    c1_f1: { t: 'fight', opp: 'suki', stage: 'ember', level: 'easy', rounds: 1, win: 'c1_d2' },
    c1_d2: { t: 'dialogue', bg: 'ember', with: 'suki', next: 'ch2', lines: [
      { who: 'suki', text: 'Nada mal, para quem acha que vestido não luta.' },
      { who: 'sokka', text: 'Eu tenho uma teoria nova: a roupa não importa. A pessoa dentro dela, sim. E, se você ensinar, eu visto o vestido.' },
    ] },
    ch2: { t: 'chapter', chapter: 1, next: 'c2_d1' },
    c2_d1: { t: 'dialogue', bg: 'palacio', with: 'jet', caption: 'A espada', next: 'c2_f1', lines: [
      { who: 'jet', text: 'Ouvi dizer que você quer uma espada, tribo da água. Espadas se ganham. Duas, no meu caso.' },
      { who: 'sokka', text: 'Então eu começo com uma. Depois a gente conversa sobre a segunda.' },
    ] },
    c2_f1: { t: 'fight', opp: 'jet', stage: 'palacio', level: 'normal', rounds: 1, win: 'c2_c1' },
    c2_c1: { t: 'choice', id: 'espada', bg: 'palacio', prompt: 'Sokka venceu e tem um meteorito nas mãos: pode forjar uma espada preta como nenhuma outra. Ou vendê-la e equipar o grupo inteiro.', options: [
      { text: 'Forjar a espada', hint: 'Uma arma só dele. Rota: o guerreiro.', flag: 'espada', rep: -1, next: 'c2_r1' },
      { text: 'Equipar o grupo', hint: 'O plano vale mais que a arma. Rota: o estrategista.', flag: 'grupo', rep: 1, next: 'c2_r1' },
    ] },
    c2_r1: { t: 'reward', skin: 'kyoshi', text: 'A pintura dos guerreiros Kyoshi', next: 'ch3' },
    ch3: { t: 'chapter', chapter: 2, next: 'c3_d1' },
    c3_d1: { t: 'dialogue', bg: 'fervente', with: 'azula', caption: 'O dia da invasão', next: 'c3_f1', lines: [
      { who: 'azula', text: 'A invasão falhou, ideia-de-jerico. Seu pai está preso aqui. E você veio sozinho.' },
      { who: 'sokka', text: 'Não vim sozinho. Vim com um plano. Ele só ainda não apareceu.' },
    ] },
    c3_f1: { t: 'fight', opp: 'azula', stage: 'fervente', level: 'hard', rounds: 1, mods: ['eclipse'], win: 'c3_f2', intro: 'Enquanto o eclipse durar' },
    c3_f2: { t: 'fight', opp: 'tylee', stage: 'fervente', level: 'normal', rounds: 1, noHeal: true, win: 'c3_c1' },
    c3_c1: { t: 'choice', id: 'resgate', bg: 'fervente', prompt: 'A gôndola está partindo. Dá para salvar o pai ou Suki. Não os dois, não agora.', options: [
      { text: 'Salvar o pai', hint: 'O chefe da tribo. Rota: o guerreiro.', flag: 'pai', rep: -1, next: 'ch4' },
      { text: 'Confiar no plano e esperar', hint: 'Zuko está na outra gôndola. Rota: o estrategista.', flag: 'plano', rep: 1, next: 'ch4' },
    ] },
    ch4: { t: 'chapter', chapter: 3, next: 'c4_f1' },
    c4_f1: { t: 'fight', opp: 'combustao', stage: 'deserto', level: 'hard', rounds: 1, win: 'c4_f2', intro: 'Nos dirigíveis' },
    c4_f2: { t: 'fight', opp: 'ozai', stage: 'deserto', level: 'hard', rounds: 2, mods: ['cometa'], bossHp: 120, win: 'c4_e', intro: 'O cometa, sem dobra nenhuma' },
    c4_e: { t: 'branch', when: (p) => (p.rep > 0 ? 'end_est' : 'end_gue') },
    end_est: { t: 'ending', id: 'estrategista', name: 'O estrategista', bg: 'deserto', lines: [
      'A frota de dirigíveis caiu porque Sokka sabia onde cada um estaria. Sem dobra, só o plano. E o plano funcionou.',
      '"Anotem aí: o bumerangue SEMPRE volta."',
    ] },
    end_gue: { t: 'ending', id: 'guerreiro', name: 'O guerreiro', bg: 'deserto', lines: [
      'Sokka enfrentou o Senhor do Fogo com uma espada preta e venceu. Os bardos cantaram o guerreiro; ninguém lembrou do plano.',
      'Ele ficou com a estátua que sempre desenhou. E com a sensação de que faltava alguém na foto. (Cenário alternativo.)',
    ] },
  },
};
