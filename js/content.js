/* Textos de conteúdo: finais do modo Arcade e falas de apresentação/vitória. */
const ENDINGS = {
  aang: ['Com o Senhor do Fogo derrotado, Aang finalmente pôde descansar.', 'Mas o Avatar sabia: o equilíbrio do mundo é um trabalho que nunca termina.', 'Appa já esperava no pátio. Havia muito mundo para ver.'],
  katara: ['Katara provou que a água corre por onde quiser, até pelas ruínas do palácio.', 'De volta ao Polo Sul, ensinou às crianças que força e cura são a mesma arte.'],
  zuko: ['Zuko encarou o pai nos olhos e não desviou.', '"Eu não preciso da sua aprovação. Eu nunca precisei."', 'A Nação do Fogo teria um novo líder, e desta vez a honra viria de dentro.'],
  toph: ['Toph nem comemorou. Sentiu, pelos pés, que o chão inteiro já sabia quem tinha vencido.', 'Abriu uma academia de dobra de metal. A primeira regra: "Ninguém me chama de senhorita."'],
  azula: ['Azula venceu, como sempre soube que venceria.', 'Mas no espelho do palácio vazio, pela primeira vez, ninguém a aplaudiu.', 'Ela apagou as chamas azuis e ficou em silêncio.'],
  sokka: ['Sem dobra, sem sorte, só o plano. E o plano funcionou.', '"Anotem aí: o bumerangue SEMPRE volta."', 'Sokka passou a semana seguinte desenhando a estátua que, na opinião dele, mereciam erguer.'],
  tylee: ['Ty Lee saiu dando estrelinhas pelo corredor do palácio.', 'O exército de guerreiras Kyoshi ganhou uma recruta de aura muito, muito rosa.'],
  iroh: ['Iroh venceu e, antes de qualquer coisa, pediu uma xícara de chá de jasmim.', '"A vitória é como o chá: melhor quando se tem com quem dividir."', 'O Lótus Branco floresceu outra vez.'],
  mai: ['Mai venceu sem mudar a expressão.', '"Pronto. Podemos ir embora agora?"', 'Zuko sorriu. Ela não admitiu, mas sorriu também.'],
  ozai: ['Ozai ergueu os braços sobre a arena em chamas.', 'Nenhuma voz se opôs. Nenhuma voz restou.', 'Mas, nas sombras, uma criança careca com uma flecha azul abriu os olhos.'],
  suki: ['Suki guardou os leques e ajeitou a pintura do rosto.', 'As guerreiras Kyoshi tinham voltado a ser lenda, e desta vez o mundo inteiro assistiu.'],
  bumi: ['Bumi riu por três minutos seguidos. Depois comeu uma pedra-doce.', '"Omashu está segura. Agora, quem quer ver o sistema de calhas?"', 'Ninguém quis. Ele mostrou mesmo assim.'],
};

const QUOTES = {
  aang: { intro: ['Vamos resolver isso com calma... ou com vento!', 'Eu não quero machucar você.'], win: ['Equilíbrio restaurado!', 'Boa luta! Appa, vamos embora.'] },
  katara: { intro: ['A água encontra sempre um caminho.', 'Eu vou proteger meus amigos.'], win: ['Força e cura são a mesma arte.', 'Isso foi pela minha mãe.'] },
  zuko: { intro: ['Eu preciso recuperar minha honra.', 'Você não sabe do que eu sou capaz.'], win: ['Minha honra... é minha.', 'Eu escolhi meu próprio destino.'] },
  toph: { intro: ['Eu sinto cada passo seu.', 'Pode vir, Pés Leves.'], win: ['Eu nem precisei enxergar.', 'Chão é chão. Eu sou a melhor.'] },
  azula: { intro: ['Que pena. Você vai perder.', 'Meu fogo não falha.'], win: ['Perfeito, como sempre.', 'Fraco. Como todos os outros.'] },
  sokka: { intro: ['Eu tenho um plano!', 'Bumerangue, não me decepcione.'], win: ['Viu? Plano!', 'O bumerangue SEMPRE volta.'] },
  tylee: { intro: ['Sua aura está meio cinza hoje!', 'Isso vai ser divertido!'], win: ['Sem chi, sem dobra!', 'Hihi! Estrelinha de vitória!'] },
  iroh: { intro: ['Você aceita um chá antes?', 'A paciência é uma arma.'], win: ['Agora sim, o chá.', 'O dragão ainda respira.'] },
  mai: { intro: ['Vamos acabar logo com isso.', '...Tanto faz.'], win: ['Previsível.', 'Pronto. Posso ir?'] },
  ozai: { intro: ['Ajoelhe-se diante do Senhor do Fogo.', 'Você não é digno da minha chama.'], win: ['Eu sou a Fênix!', 'O mundo é meu.'] },
  suki: { intro: ['As guerreiras Kyoshi não recuam.', 'Leques prontos.'], win: ['Pela Ilha Kyoshi!', 'Disciplina vence força.'] },
  bumi: { intro: ['Hehehe! Vamos brincar de jogar pedras!', 'Pense fora da caixa, jovem.'], win: ['Que lutinha divertida!', 'Omashu agradece. Hehe!'] },
};
