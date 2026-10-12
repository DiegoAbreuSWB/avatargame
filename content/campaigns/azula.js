/* Campanha: Azula — Perfeita. */
(window.CAMPAIGNS = window.CAMPAIGNS || {}).azula = {
  title: 'Perfeita', subtitle: 'A princesa que nunca podia errar, e o preço de não errar nunca.', endingsCount: 2,
  endingName: (p) => (p.rep > 0 ? 'A princesa que parou' : 'A Senhora do Fogo'), start: 'ch1',
  chapters: [
    { title: 'A missão', place: 'Palácio da Nação do Fogo', stage: 'palacio', summary: 'Ozai manda a filha trazer o irmão e o tio de volta, vivos ou não.' },
    { title: 'As amigas', place: 'Omashu', stage: 'omashu', summary: 'Mai e Ty Lee se juntam à caçada. Azula testa se são leais ou úteis.' },
    { title: 'A queda de Ba Sing Se', place: 'Ba Sing Se', stage: 'basingse', summary: 'Long Feng pensa que manda. Azula o deixa pensar por um dia.' },
    { title: 'A Rocha Fervente', place: 'Prisão da Rocha Fervente', stage: 'fervente', summary: 'Mai e Ty Lee a traem. Pela primeira vez, Azula fica sozinha.' },
    { title: 'A coroação', place: 'Palácio da Nação do Fogo', stage: 'palacio', summary: 'O cometa, o trono e um irmão que voltou.' },
  ],
  nodes: {
    ch1: { t: 'chapter', chapter: 0, next: 'c1_d1' },
    c1_d1: { t: 'dialogue', bg: 'palacio', with: 'ozai', caption: 'A missão', next: 'c1_f1', lines: [
      { who: 'ozai', text: 'Seu irmão falhou. Seu tio é um traidor. Traga os dois. Vivos de preferência; de qualquer jeito, se necessário.' },
      { who: 'azula', text: 'Considere feito, pai. Primeiro vou precisar de uma demonstração para a tripulação.' },
    ] },
    c1_f1: { t: 'fight', opp: 'iroh', stage: 'palacio', level: 'normal', rounds: 1, win: 'ch2', intro: 'O tio não vai sem lutar' },
    ch2: { t: 'chapter', chapter: 1, next: 'c2_d1' },
    c2_d1: { t: 'dialogue', bg: 'omashu', with: 'mai', caption: 'As amigas', next: 'c2_f1', lines: [
      { who: 'mai', text: 'Você apareceu do nada e quer que a gente largue tudo. Por quê?' },
      { who: 'azula', text: 'Porque vocês são as únicas que não me entediam. E porque eu não aceito não. Quer testar?' },
    ] },
    c2_f1: { t: 'fight', opp: 'mai', stage: 'omashu', level: 'normal', rounds: 1, win: 'c2_f2' },
    c2_f2: { t: 'fight', opp: 'tylee', stage: 'omashu', level: 'normal', rounds: 1, noHeal: true, win: 'c2_c1' },
    c2_c1: { t: 'choice', id: 'amigas', bg: 'omashu', prompt: 'Mai e Ty Lee aceitam ir. Azula sabe por quê: medo. Como mantê-las?', options: [
      { text: 'Pelo medo, como sempre', hint: 'Funciona. Até não funcionar. Rota: Senhora do Fogo.', flag: 'medo', rep: -1, next: 'ch3' },
      { text: 'Tentar, uma vez, ser amiga', hint: 'Ela não sabe como. Rota: a princesa que parou.', flag: 'amiga', rep: 1, next: 'ch3' },
    ] },
    ch3: { t: 'chapter', chapter: 2, next: 'c3_d1' },
    c3_d1: { t: 'dialogue', bg: 'basingse', with: 'zuko', caption: 'A queda de Ba Sing Se', next: 'c3_f1', lines: [
      { who: 'azula', text: 'Zuzu, a cidade é nossa. Você só precisa escolher o lado certo. O Avatar está logo ali.' },
      { who: 'zuko', text: 'E se eu escolher errado?' },
      { who: 'azula', text: 'Então eu escolho por você.' },
    ] },
    c3_f1: { t: 'fight', opp: 'aang', stage: 'basingse', level: 'normal', rounds: 1, win: 'c3_f2' },
    c3_f2: { t: 'fight', opp: 'katara', stage: 'basingse', level: 'hard', rounds: 1, noHeal: true, win: 'c3_r1' },
    c3_r1: { t: 'reward', skin: 'branco', text: 'As vestes da conquistadora', next: 'ch4' },
    ch4: { t: 'chapter', chapter: 3, next: 'c4_d1' },
    c4_d1: { t: 'dialogue', bg: 'fervente', with: 'mai', caption: 'A Rocha Fervente', next: 'c4_f1', lines: [
      { who: 'mai', text: 'Eu amo o Zuko mais do que tenho medo de você.' },
      { who: 'azula', text: 'Errou. A única coisa que você devia ter é medo de mim.' },
    ] },
    c4_f1: { t: 'fight', opp: 'mai', stage: 'fervente', level: 'hard', rounds: 1, win: 'c4_f2' },
    c4_f2: { t: 'fight', opp: 'tylee', stage: 'fervente', level: 'hard', rounds: 1, noHeal: true, win: 'c4_c1' },
    c4_c1: { t: 'choice', id: 'sozinha', bg: 'fervente', prompt: 'As duas estão presas. Azula venceu de novo. E, pela primeira vez, não tem ninguém para contar.', options: [
      { text: 'Não precisa de ninguém', hint: 'Perfeição não tem amigos. Rota: Senhora do Fogo.', flag: 'ninguem', rep: -1, next: 'ch5' },
      { text: 'Admitir que isso doeu', hint: 'Só para si mesma. Rota: a princesa que parou.', flag: 'doeu', rep: 1, next: 'ch5' },
    ] },
    ch5: { t: 'chapter', chapter: 4, next: 'c5_f1' },
    c5_f1: { t: 'fight', opp: 'zuko', stage: 'palacio', level: 'hard', rounds: 2, mods: ['cometa'], win: 'c5_e', intro: 'Agni Kai pela coroa' },
    c5_e: { t: 'branch', when: (p) => (p.rep > 0 ? 'end_parou' : 'end_senhora') },
    end_parou: { t: 'ending', id: 'parou', name: 'A princesa que parou', bg: 'palacio', lines: [
      'Azula venceu o Agni Kai e, com a coroa a um passo, parou. Olhou para o irmão caído e não viu um rival. Viu alguém que tinha amigos.',
      'Não aceitou o trono naquele dia. Pela primeira vez, errar não a destruiu. (Cenário alternativo.)',
    ] },
    end_senhora: { t: 'ending', id: 'senhora', name: 'A Senhora do Fogo', bg: 'palacio', lines: [
      'Azula foi coroada sob o cometa. Perfeita, como planejado. O espelho do palácio vazio foi a única plateia.',
      'Ela apagou as chamas azuis e ficou em silêncio. (Cenário alternativo.)',
    ] },
  },
};
