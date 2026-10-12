/* Campanha: Aang — O Peso do Mundo. Cenários alternativos são hipotéticos. */
(window.CAMPAIGNS = window.CAMPAIGNS || {}).aang = {
  title: 'O Peso do Mundo', subtitle: 'Um menino que fugiu do dever e precisa decidir como voltar a ele.', endingsCount: 2,
  endingName: (p) => (p.rep > 0 ? 'Equilíbrio' : 'Estado Avatar'), start: 'ch1',
  chapters: [
    { title: 'Cem anos de gelo', place: 'Tribo da Água do Sul', stage: 'agua', summary: 'Aang acorda num mundo em guerra e descobre que é o último do seu povo.' },
    { title: 'O templo vazio', place: 'Templo do Ar do Sul', stage: 'templo', summary: 'O Estado Avatar desperta pela primeira vez, e assusta até os amigos.' },
    { title: 'Mestres e provas', place: 'Omashu', stage: 'omashu', summary: 'Bumi e Toph ensinam que a terra exige esperar e enfrentar de frente.' },
    { title: 'O dia do sol negro', place: 'Palácio da Nação do Fogo', stage: 'palacio', summary: 'A invasão falha. Azula espera por ele.' },
    { title: 'O cometa', place: 'Prisão da Rocha Fervente', stage: 'fervente', summary: 'Ozai, o cometa e a escolha que define o Avatar.' },
  ],
  nodes: {
    ch1: { t: 'chapter', chapter: 0, next: 'c1_d1' },
    c1_d1: { t: 'dialogue', bg: 'agua', with: 'katara', caption: 'Cem anos depois', next: 'c1_f1', lines: [
      { who: 'katara', text: 'Você estava dentro do gelo. Por cem anos. A guerra... ela nunca acabou, Aang.' },
      { who: 'aang', text: 'Cem anos? Então o Avatar que o mundo esperava era eu. E eu fugi.' },
      { who: 'sokka', text: 'Fugiu ou não, tem um navio da Nação do Fogo vindo para cá. Mostra o que esse "mestre do ar" sabe fazer.' },
    ] },
    c1_f1: { t: 'fight', opp: 'sokka', stage: 'agua', level: 'easy', rounds: 1, win: 'c1_d2', intro: 'Treino com Sokka' },
    c1_d2: { t: 'dialogue', bg: 'agua', with: 'zuko', next: 'c1_f2', lines: [
      { who: 'zuko', text: 'Entregue o Avatar e ninguém da vila se machuca.' },
      { who: 'aang', text: 'Se eu for com você, você deixa todo mundo em paz?' },
    ] },
    c1_f2: { t: 'fight', opp: 'zuko', stage: 'agua', level: 'normal', rounds: 1, win: 'ch2' },
    ch2: { t: 'chapter', chapter: 1, next: 'c2_d1' },
    c2_d1: { t: 'dialogue', bg: 'templo', with: 'katara', caption: 'O templo vazio', next: 'c2_f1', lines: [
      { who: 'aang', text: 'Gyatso... eles mataram todos. Eu deveria estar aqui.' },
      { who: 'katara', text: 'Aang, seus olhos... Aang! Volte para nós!' },
      { who: 'aang', text: 'Eu não consigo controlar. Quando a dor vem, ele toma conta.' },
    ] },
    c2_f1: { t: 'fight', opp: 'zuko', stage: 'templo', level: 'normal', rounds: 1, mods: ['superInfinito'], win: 'c2_c1', intro: 'Estado Avatar fora de controle' },
    c2_c1: { t: 'choice', id: 'estado', bg: 'templo', prompt: 'O Estado Avatar deu a vitória, mas quase feriu Katara. Como Aang lida com esse poder?', options: [
      { text: 'Aprender a dominá-lo com calma', hint: 'Mais lento, mais seguro. Rota: equilíbrio.', flag: 'calma', rep: 1, next: 'ch3' },
      { text: 'Usá-lo sempre que for preciso', hint: 'Poder agora, consequências depois. Rota: Estado Avatar.', flag: 'poder', rep: -1, next: 'ch3' },
    ] },
    ch3: { t: 'chapter', chapter: 2, next: 'c3_d1' },
    c3_d1: { t: 'dialogue', bg: 'omashu', with: 'bumi', caption: 'Mestres e provas', next: 'c3_f1', lines: [
      { who: 'bumi', text: 'Hehehe! Para dobrar terra, você precisa parar de fugir das pedras, Aang. Encare uma.' },
      { who: 'aang', text: 'Eu sou um mestre do ar, Bumi. Ar desvia.' },
      { who: 'bumi', text: 'E por isso você vai perder. Pense fora da caixa!' },
    ] },
    c3_f1: { t: 'fight', opp: 'bumi', stage: 'omashu', level: 'normal', rounds: 1, win: 'c3_d2' },
    c3_d2: { t: 'dialogue', bg: 'omashu', with: 'toph', next: 'c3_f2', lines: [
      { who: 'toph', text: 'Pés Leves, você ainda pula demais. Terra é esperar. Agora me acerta, se conseguir.' },
    ] },
    c3_f2: { t: 'fight', opp: 'toph', stage: 'omashu', level: 'normal', rounds: 1, noHeal: true, win: 'c3_r1' },
    c3_r1: { t: 'reward', skin: 'nacaoFogo', text: 'Um disfarce para entrar na Nação do Fogo', next: 'ch4' },
    ch4: { t: 'chapter', chapter: 3, next: 'c4_d1' },
    c4_d1: { t: 'dialogue', bg: 'palacio', with: 'azula', caption: 'O dia do sol negro', next: 'c4_f1', lines: [
      { who: 'azula', text: 'Meu pai não está aqui, Avatar. Mas eu estou. E o eclipse acaba em poucos minutos.' },
      { who: 'aang', text: 'Então eu tenho poucos minutos.' },
    ] },
    c4_f1: { t: 'fight', opp: 'azula', stage: 'palacio', level: 'hard', rounds: 1, mods: ['eclipse'], win: 'c4_c1', intro: 'Azula sem fogo, por enquanto' },
    c4_c1: { t: 'choice', id: 'ozai', bg: 'palacio', prompt: 'O eclipse acabou e a invasão falhou. Os monges ensinaram que toda vida é sagrada. O que Aang fará com Ozai?', options: [
      { text: 'Buscar outro caminho que não matar', hint: 'Mesmo sem saber qual. Rota: equilíbrio.', flag: 'vida', rep: 1, next: 'ch5' },
      { text: 'Fazer o que o mundo pede', hint: 'Acabar com Ozai de vez. Rota: Estado Avatar.', flag: 'fim', rep: -1, next: 'ch5' },
    ] },
    ch5: { t: 'chapter', chapter: 4, next: 'c5_f1' },
    c5_f1: { t: 'fight', opp: 'combustao', stage: 'fervente', level: 'hard', rounds: 1, win: 'c5_f2', intro: 'O assassino contratado' },
    c5_f2: { t: 'fight', opp: 'ozai', stage: 'fervente', level: 'hard', rounds: 2, mods: ['cometa'], bossHp: 130, win: 'c5_e' },
    c5_e: { t: 'branch', when: (p) => (p.rep > 0 ? 'end_eq' : 'end_av') },
    end_eq: { t: 'ending', id: 'equilibrio', name: 'Equilíbrio', bg: 'fervente', lines: [
      'Aang tirou a dobra de Ozai sem tirar sua vida. O mundo queria vingança; o Avatar devolveu equilíbrio.',
      'No fim, o menino que fugiu do dever foi o único que o entendeu por completo.',
    ] },
    end_av: { t: 'ending', id: 'estadoAvatar', name: 'Estado Avatar', bg: 'fervente', lines: [
      'O Estado Avatar fez o que Aang não conseguia. Ozai caiu, e com ele o Senhor do Fogo.',
      'Aang venceu, mas passou o resto da vida se perguntando quem estava no comando naquele momento. (Cenário alternativo.)',
    ] },
  },
};
