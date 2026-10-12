/* Campanha: Katara — A Água Encontra um Caminho. */
(window.CAMPAIGNS = window.CAMPAIGNS || {}).katara = {
  title: 'A Água Encontra um Caminho', subtitle: 'De única dobradora do Polo Sul a mestra que escolhe entre curar e vingar.', endingsCount: 2,
  endingName: (p) => (p.rep > 0 ? 'A curandeira' : 'A marionetista'), start: 'ch1',
  chapters: [
    { title: 'A última do Sul', place: 'Tribo da Água do Sul', stage: 'agua', summary: 'Katara treina sozinha; Sokka duvida, Aang acredita.' },
    { title: 'Apenas curandeiras', place: 'Tribo da Água do Norte', stage: 'agua', summary: 'Pakku se recusa a ensinar mulheres. Katara responde com um desafio.' },
    { title: 'A vila da lua cheia', place: 'Pântano Nebuloso', stage: 'pantano', summary: 'Hama ensina um segredo que Katara não queria aprender.' },
    { title: 'A vingança', place: 'Ilha Ember', stage: 'ember', summary: 'O homem que matou sua mãe está ao alcance. Zuko segura a lanterna.' },
    { title: 'O Agni Kai', place: 'Palácio da Nação do Fogo', stage: 'palacio', summary: 'Azula contra Zuko. E contra Katara.' },
  ],
  nodes: {
    ch1: { t: 'chapter', chapter: 0, next: 'c1_d1' },
    c1_d1: { t: 'dialogue', bg: 'agua', with: 'sokka', caption: 'A última do Sul', next: 'c1_f1', lines: [
      { who: 'sokka', text: 'Katara, a água está congelando o barco de novo. Dá para treinar longe das coisas úteis?' },
      { who: 'katara', text: 'Eu sou a única dobradora deste polo inteiro, Sokka. Se eu não treinar com o que tem, treino com você.' },
    ] },
    c1_f1: { t: 'fight', opp: 'sokka', stage: 'agua', level: 'easy', rounds: 1, win: 'ch2' },
    ch2: { t: 'chapter', chapter: 1, next: 'c2_d1' },
    c2_d1: { t: 'dialogue', bg: 'agua', with: 'pakku', caption: 'Apenas curandeiras', next: 'c2_f1', lines: [
      { who: 'pakku', text: 'Na Tribo do Norte, mulheres aprendem a curar. Combate é para os homens. É a tradição.' },
      { who: 'katara', text: 'Então eu desafio a tradição. Aqui, agora.' },
      { who: 'pakku', text: 'Você vai se arrepender. Mas que seja.' },
    ] },
    c2_f1: { t: 'fight', opp: 'pakku', stage: 'agua', level: 'normal', rounds: 2, mods: ['luaCheia'], win: 'c2_d2' },
    c2_d2: { t: 'dialogue', bg: 'agua', with: 'pakku', next: 'ch3', lines: [
      { who: 'pakku', text: 'Esse colar... Kanna. Minha noiva fugiu para o Sul para não viver essa tradição. Eu vou ensinar você, Katara.' },
    ] },
    ch3: { t: 'chapter', chapter: 2, next: 'c3_d1' },
    c3_d1: { t: 'dialogue', bg: 'pantano', with: 'hama', caption: 'A vila da lua cheia', next: 'c3_f1', lines: [
      { who: 'hama', text: 'Uma dobradora do Sul! Querida, deixe uma velha ensinar o que a Nação do Fogo me obrigou a descobrir: há água em todo lugar. Até nas pessoas.' },
      { who: 'katara', text: 'Isso é... controlar o corpo de alguém? Não. Nunca.' },
      { who: 'hama', text: 'Então eu te obrigo a aprender.' },
    ] },
    c3_f1: { t: 'fight', opp: 'hama', stage: 'pantano', level: 'hard', rounds: 1, mods: ['luaCheia'], win: 'c3_c1', intro: 'A marionetista' },
    c3_c1: { t: 'choice', id: 'sangue', bg: 'pantano', prompt: 'Katara venceu Hama usando a dobra de sangue pela primeira vez. O que fazer com esse conhecimento?', options: [
      { text: 'Jurar nunca mais usar', hint: 'A água cura. Rota: a curandeira.', flag: 'jura', rep: 1, next: 'c3_r1' },
      { text: 'Guardar como última arma', hint: 'Contra quem merecer. Rota: a marionetista.', flag: 'arma', rep: -1, next: 'c3_r1' },
    ] },
    c3_r1: { t: 'reward', skin: 'nacaoFogo', text: 'Um disfarce para a Nação do Fogo', next: 'ch4' },
    ch4: { t: 'chapter', chapter: 3, next: 'c4_d1' },
    c4_d1: { t: 'dialogue', bg: 'ember', with: 'zuko', caption: 'A vingança', next: 'c4_f1', lines: [
      { who: 'zuko', text: 'Eu sei quem matou sua mãe. Eu posso te levar até ele. O que você vai fazer é com você.' },
      { who: 'katara', text: 'Então me leva. Mas antes, eu preciso saber se confio em você.' },
    ] },
    c4_f1: { t: 'fight', opp: 'zuko', stage: 'ember', level: 'normal', rounds: 1, win: 'c4_f2' },
    c4_f2: { t: 'fight', opp: 'combustao', stage: 'ember', level: 'hard', rounds: 1, noHeal: true, win: 'c4_c1', intro: 'O homem que ela procurava' },
    c4_c1: { t: 'choice', id: 'perdao', bg: 'ember', prompt: 'Ele está caído e indefeso. A chuva para. Katara tem a água, a lua e a raiva.', options: [
      { text: 'Deixá-lo viver', hint: 'Não por ele. Por ela. Rota: a curandeira.', flag: 'perdoou', rep: 1, next: 'ch5' },
      { text: 'Acabar com ele', hint: 'Como ele fez com Kya. Rota: a marionetista.', flag: 'vingou', rep: -1, next: 'ch5' },
    ] },
    ch5: { t: 'chapter', chapter: 4, next: 'c5_f1' },
    c5_f1: { t: 'fight', opp: 'azula', stage: 'palacio', level: 'hard', rounds: 2, mods: ['cometa'], win: 'c5_e', intro: 'O Agni Kai' },
    c5_e: { t: 'branch', when: (p) => (p.rep > 0 ? 'end_cura' : 'end_mar') },
    end_cura: { t: 'ending', id: 'curandeira', name: 'A curandeira', bg: 'palacio', lines: [
      'Katara prendeu Azula no gelo e correu para o irmão de Azula, não para a vencida. Curou Zuko com a mesma água que acabara de usar para lutar.',
      'Força e cura são a mesma arte. Ela ensinaria isso a uma geração inteira do Sul.',
    ] },
    end_mar: { t: 'ending', id: 'marionetista', name: 'A marionetista', bg: 'palacio', lines: [
      'Sob o cometa, Katara não precisou da lua: dominou Azula como Hama ensinou e encerrou o Agni Kai em segundos.',
      'Ninguém a chamou de monstro. Ela mesma se chamou, em silêncio, toda noite de lua cheia. (Cenário alternativo.)',
    ] },
  },
};
