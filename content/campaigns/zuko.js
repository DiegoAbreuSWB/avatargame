/* Campanha piloto: Zuko — O Caminho da Honra. Conteúdo em JS (não JSON) para funcionar em file://.
   Rota: escolhas somam reputação (rep > 0 = honra verdadeira; rep < 0 = honra pelo poder) e flags.
   Os finais alternativos são cenários hipotéticos dentro do jogo, não a história da série. */
(window.CAMPAIGNS = window.CAMPAIGNS || {}).zuko = {
  title: 'O Caminho da Honra',
  subtitle: 'De caçador obcecado pela aprovação do pai a senhor do próprio destino.',
  endingsCount: 2,
  endingName: (prog) => (prog.rep > 0 ? 'Honra verdadeira' : 'Honra pelo poder'),
  start: 'ch1',
  chapters: [
    { title: 'O príncipe banido', place: 'Mar do Norte', stage: 'agua', summary: 'No navio do exílio, Iroh tenta ensinar a Zuko que a raiva não é combustível para sempre.' },
    { title: 'A caça ao Avatar', place: 'Templo do Ar do Sul', stage: 'templo', summary: 'O Avatar voltou. Zuko vê nele a chance de voltar para casa.' },
    { title: 'O preço da aprovação', place: 'Omashu', stage: 'omashu', summary: 'Príncipe da Nação do Fogo ou Espírito Azul? Duas lutas seguidas, sem descanso.' },
    { title: 'Traição em Ba Sing Se', place: 'Ba Sing Se', stage: 'basingse', summary: 'Azula oferece tudo o que Zuko sempre quis. Iroh oferece a verdade.' },
    { title: 'O verdadeiro fogo', place: 'Ruínas dos Guerreiros do Sol', stage: 'deserto', summary: 'Zuko descobre que o fogo é vida, não raiva. E alguém foi contratado para caçar o Avatar.' },
    { title: 'A redenção', place: 'Palácio da Nação do Fogo', stage: 'palacio', summary: 'O confronto final, sob o cometa de Sozin.' },
  ],
  nodes: {
    /* ---------- capítulo 1 ---------- */
    ch1: { t: 'chapter', chapter: 0, next: 'c1_d1' },
    c1_d1: { t: 'dialogue', bg: 'agua', with: 'iroh', caption: 'Três anos de exílio', next: 'c1_f1', lines: [
      { who: 'iroh', text: 'Príncipe Zuko, o chá vai esfriar. E o Avatar não vai aparecer só porque você olha para o horizonte com mais raiva.' },
      { who: 'zuko', text: 'Eu não tenho tempo para chá, tio. Meu pai só vai me receber de volta com o Avatar acorrentado.' },
      { who: 'iroh', text: 'Então pelo menos treine com cabeça fria. A raiva deixa seu fogo grande e burro. Mostre o que aprendeu.' },
    ] },
    c1_f1: { t: 'fight', opp: 'iroh', stage: 'agua', level: 'easy', rounds: 1, win: 'c1_d2', intro: 'Treino com Iroh' },
    c1_d2: { t: 'dialogue', bg: 'agua', with: 'iroh', next: 'ch2', lines: [
      { who: 'iroh', text: 'Melhor. Agora, uma luz no céu, perto do Polo Sul... Os relatórios dizem que algo acordou no gelo.' },
      { who: 'zuko', text: 'O Avatar. Mudem o curso. Agora.' },
    ] },
    /* ---------- capítulo 2 ---------- */
    ch2: { t: 'chapter', chapter: 1, next: 'c2_d1' },
    c2_d1: { t: 'dialogue', bg: 'templo', with: 'aang', caption: 'O último mestre do ar', next: 'c2_f1', lines: [
      { who: 'zuko', text: 'Você é o Avatar? Uma criança?' },
      { who: 'aang', text: 'Aang. E você deve ser o cara zangado do navio. Podemos conversar antes de você tentar me prender?' },
      { who: 'zuko', text: 'Não.' },
    ] },
    c2_f1: { t: 'fight', opp: 'aang', stage: 'templo', level: 'normal', rounds: 1, win: 'c2_d2' },
    c2_d2: { t: 'dialogue', bg: 'templo', with: 'aang', next: 'ch3', lines: [
      { who: 'aang', text: 'Você é bom. Mas eu não vou com você. Appa, yip yip!' },
      { who: 'zuko', text: 'Ele escapou... de novo. Mas agora eu sei para onde está indo: o Reino da Terra.' },
    ] },
    /* ---------- capítulo 3 ---------- */
    ch3: { t: 'chapter', chapter: 2, next: 'c3_d1' },
    c3_d1: { t: 'dialogue', bg: 'omashu', with: 'jet', caption: 'Duas lutas, sem descanso', next: 'c3_f1', lines: [
      { who: 'jet', text: 'Nação do Fogo. Eu sinto o cheiro de longe. Os Combatentes da Liberdade não deixam gente como você passar.' },
      { who: 'zuko', text: 'Eu não tenho nada contra você. Saia do caminho.' },
      { who: 'jet', text: 'Todo mundo da Nação do Fogo diz isso antes de queimar uma vila.' },
    ] },
    c3_f1: { t: 'fight', opp: 'jet', stage: 'omashu', level: 'normal', rounds: 1, win: 'c3_c1' },
    c3_c1: { t: 'choice', id: 'aang', bg: 'omashu', prompt: 'Depois da luta, Zuko encontra Aang ferido e sozinho, sem defesa. Ninguém está olhando.', options: [
      { text: 'Capturar Aang', hint: 'Ganha prestígio junto à Nação do Fogo, mas Iroh vai saber o que você fez. Rota: honra pelo poder.', flag: 'capturou', rep: -1, next: 'c3_f2' },
      { text: 'Ajudar Aang', hint: 'Perde a chance de voltar para casa, mas começa algo novo. Rota: honra verdadeira.', flag: 'ajudou', rep: 1, next: 'c3_f2' },
    ] },
    c3_f2: { t: 'fight', opp: 'katara', stage: 'omashu', level: 'normal', rounds: 1, noHeal: true, win: 'c3_r1', intro: 'Katara chega antes da vida se recuperar' },
    c3_r1: { t: 'reward', skin: 'espiritoAzul', text: 'A máscara do Espírito Azul', next: 'ch4' },
    /* ---------- capítulo 4 ---------- */
    ch4: { t: 'chapter', chapter: 3, next: 'c4_d1' },
    c4_d1: { t: 'dialogue', bg: 'basingse', with: 'azula', caption: 'Debaixo do lago Laogai', next: 'c4_c1', lines: [
      { who: 'azula', text: 'Zuzu. Nosso pai está disposto a esquecer tudo. Basta você ficar do lado certo hoje.' },
      { who: 'iroh', text: 'Zuko, olhe para ela. Ela nunca precisou de você, só de um instrumento. Você já sabe quem você é.' },
      { who: 'azula', text: 'Que comovente. Escolha, irmão.' },
    ] },
    c4_c1: { t: 'choice', id: 'azula', bg: 'basingse', prompt: 'Azula oferece a volta para casa. Iroh pede que Zuko escolha o próprio caminho.', options: [
      { text: 'Ficar com Azula', hint: 'O caminho mais curto para casa. Iroh fica para trás. Rota: honra pelo poder.', flag: 'comAzula', rep: -1, next: 'c4_f_iroh' },
      { text: 'Ficar com Iroh', hint: 'Enfrentar a irmã aqui e agora. Rota: honra verdadeira.', flag: 'comIroh', rep: 1, next: 'c4_f_azula' },
    ] },
    c4_f_azula: { t: 'fight', opp: 'azula', stage: 'basingse', level: 'normal', rounds: 2, win: 'c4_d2' },
    c4_f_iroh: { t: 'fight', opp: 'iroh', stage: 'basingse', level: 'normal', rounds: 2, win: 'c4_d2' },
    c4_d2: { t: 'dialogue', bg: 'basingse', next: 'ch5', lines: [
      { who: 'zuko', text: 'Acabou. Ba Sing Se caiu, e eu ainda não sei se escolhi certo.' },
      { who: 'zuko', text: 'Dizem que os Guerreiros do Sol ainda guardam a origem da dobra de fogo. Preciso entender o que é o meu fogo.' },
    ] },
    /* ---------- capítulo 5 ---------- */
    ch5: { t: 'chapter', chapter: 4, next: 'c5_d1' },
    c5_d1: { t: 'dialogue', bg: 'deserto', with: 'combustao', caption: 'Nas ruínas dos Guerreiros do Sol', next: 'c5_f1', lines: [
      { who: 'zuko', text: 'Fogo não é raiva. É vida, é o sol dentro do peito. Eu demorei demais para entender.' },
      { who: 'zuko', text: 'Mas aquele homem... eu o contratei para caçar o Avatar, num dia em que eu queria ser outra pessoa. Ele não aceita cancelamentos.' },
    ] },
    c5_f1: { t: 'fight', opp: 'combustao', stage: 'deserto', level: 'hard', rounds: 1, win: 'c5_d2', intro: 'O assassino de longo alcance' },
    c5_d2: { t: 'dialogue', bg: 'deserto', next: 'c5_c1', lines: [
      { who: 'zuko', text: 'O cometa de Sozin chega em poucos dias. Quem estiver no trono quando ele passar vai decidir o destino do mundo.' },
    ] },
    c5_c1: { t: 'choice', id: 'final', bg: 'deserto', prompt: 'O cometa se aproxima. Quem Zuko vai enfrentar no palácio?', options: [
      { text: 'Enfrentar Azula pelo trono', hint: 'Um Agni Kai entre irmãos, para impedir que ela seja coroada.', flag: 'finalAzula', next: 'c5_r1' },
      { text: 'Enfrentar Ozai', hint: 'O confronto que Zuko evitou a vida inteira (cenário alternativo).', flag: 'finalOzai', next: 'c5_r1' },
    ] },
    c5_r1: { t: 'reward', skin: 'treino', text: 'O fogo que vem do propósito', next: 'ch6' },
    /* ---------- capítulo 6 ---------- */
    ch6: { t: 'chapter', chapter: 5, next: 'c6_b' },
    c6_b: { t: 'branch', when: (prog) => (prog.flags.finalOzai ? 'c6_f_ozai' : 'c6_f_azula') },
    c6_f_azula: { t: 'fight', opp: 'azula', stage: 'palacio', level: 'hard', rounds: 2, mods: ['cometa'], win: 'c6_e' },
    c6_f_ozai: { t: 'fight', opp: 'ozai', stage: 'palacio', level: 'hard', rounds: 2, mods: ['cometa'], bossHp: 130, win: 'c6_e' },
    c6_e: { t: 'branch', when: (prog) => (prog.rep > 0 ? 'end_true' : 'end_power') },
    end_true: { t: 'ending', id: 'honraVerdadeira', name: 'Honra verdadeira', bg: 'palacio', lines: [
      'Zuko venceu sem usar o cometa como desculpa. O fogo que o carregou não era raiva: era propósito.',
      'Diante do palácio, não pediu a aprovação de ninguém. "Eu escolhi meu destino. Agora vou consertar o que minha família quebrou."',
      'Iroh, do lado de fora, só sorriu e serviu mais chá.',
    ] },
    end_power: { t: 'ending', id: 'honraPeloPoder', name: 'Honra pelo poder', bg: 'palacio', lines: [
      'Zuko venceu e tomou o trono. A Nação do Fogo o aclamou; ele finalmente tinha tudo o que pediu.',
      'Mas na sala vazia, o espelho mostrou os mesmos olhos do pai. A honra que ele comprou não tinha o seu nome.',
      'Em algum lugar, um velho de chá frio esperava que o sobrinho ainda voltasse. (Cenário alternativo, fora da história da série.)',
    ] },
  },
};
