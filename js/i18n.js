/* Tradução: as chaves são o próprio texto em português; T(texto) devolve a tradução quando o idioma é "en".
   Decisão: usar o texto pt-BR como chave evita inventar identificadores e permite envolver literais existentes com T(). */
const I18N = {
  en: {
    // título e menus
    '2 JOGADORES': '2 PLAYERS', '1 JOGADOR  vs  CPU': '1 PLAYER  vs  CPU', 'ARCADE': 'ARCADE', 'SOBREVIVÊNCIA': 'SURVIVAL', 'TREINO': 'TRAINING',
    'CONTROLES': 'CONTROLS', 'CONFIGURAÇÕES': 'SETTINGS', 'A Lenda de Aang · Luta 1x1': 'The Last Airbender · 1v1 fighting',
    'W/S ou ↑/↓ para navegar · Enter para confirmar': 'W/S or ↑/↓ to navigate · Enter to confirm',
    'Modo 3D indisponível neste navegador (WebGL ou Three.js não carregou)': '3D mode unavailable in this browser (WebGL or Three.js failed to load)',
    'JOGADOR 1': 'PLAYER 1', 'JOGADOR 2': 'PLAYER 2', 'Mover': 'Move', 'Pular': 'Jump', 'Agachar': 'Crouch', 'Bloquear': 'Block', 'segurar para trás': 'hold back',
    'Soco': 'Punch', 'Chute': 'Kick', 'Especial (dobra)': 'Special (bending)', 'Especial 2': 'Special 2', 'Super (chi cheio)': 'Super (full chi)', 'Rasteira': 'Sweep',
    'Golpes aéreos': 'Air attacks', 'pulo + soco/chute': 'jump + punch/kick', 'Agarrão': 'Throw', 'soco + chute juntos': 'punch + kick together', 'Dash': 'Dash', 'toque duplo ← ou →': 'double tap ← or →',
    'Melhor de 3 rounds · 99 segundos · Golpes acertados enchem o CHI para o Super': 'Best of 3 rounds · 99 seconds · Landing hits fills CHI for the Super',
    'Esc ou Enter para voltar · As teclas podem ser alteradas em Configurações': 'Esc or Enter to go back · Keys can be changed in Settings',
    // configurações
    'Gráficos': 'Graphics', '3D': '3D', '2D clássico': 'Classic 2D', 'WebGL indisponível': 'WebGL unavailable', 'Efeitos sonoros': 'Sound effects', 'Ligados': 'On', 'Desligados': 'Off',
    'Música': 'Music', 'Ligada': 'On', 'Desligada': 'Off', 'Dificuldade da CPU': 'CPU difficulty', 'Fácil': 'Easy', 'Normal': 'Normal', 'Difícil': 'Hard',
    'Tempo do round': 'Round time', '60 s': '60 s', '99 s': '99 s', 'Sem limite': 'No limit', 'Rounds para vencer': 'Rounds to win', '2 (melhor de 3)': '2 (best of 3)', '3 (melhor de 5)': '3 (best of 5)',
    'Controles de toque': 'Touch controls', 'Automático': 'Automatic', 'Sempre': 'Always', 'Nunca': 'Never', 'Mostrar hitboxes (F1)': 'Show hitboxes (F1)', 'Não': 'No', 'Sim': 'Yes',
    'Idioma': 'Language', 'Português': 'Portuguese', 'Inglês': 'English',
    'Controles do Jogador 1': 'Player 1 controls', 'Controles do Jogador 2': 'Player 2 controls', 'Restaurar padrões': 'Restore defaults', 'Voltar': 'Back',
    '↑/↓ escolhe · ←/→ ou Enter altera · Esc volta · As mudanças são salvas na hora': '↑/↓ select · ←/→ or Enter change · Esc back · Changes are saved immediately',
    'CONTROLES DO JOGADOR 1': 'PLAYER 1 CONTROLS', 'CONTROLES DO JOGADOR 2': 'PLAYER 2 CONTROLS', 'Pular / Cima': 'Jump / Up', 'Agachar / Baixo': 'Crouch / Down', 'Esquerda': 'Left', 'Direita': 'Right', 'Super': 'Super',
    'PRESSIONE UMA TECLA...': 'PRESS A KEY...', 'Restaurar padrões deste jogador': "Restore this player's defaults", 'Esc cancela': 'Esc cancels',
    'Enter para redefinir a tecla · Esc volta · Teclas reservadas: Enter, Esc, M, F1 a F12': 'Enter to rebind · Esc back · Reserved keys: Enter, Esc, M, F1 to F12',
    '{0} é reservada pelo jogo.': '{0} is reserved by the game.', '{0} já está em uso {1}.': '{0} is already used {1}.', 'por "{0}"': 'by "{0}"', 'pelo Jogador 1': 'by Player 1', 'pelo Jogador 2': 'by Player 2',
    // seleção
    'ESCOLHA SEU LUTADOR': 'CHOOSE YOUR FIGHTER', 'CPU': 'CPU', 'BONECO': 'DUMMY', 'Força': 'Power', 'Velocidade': 'Speed', 'Alcance': 'Range', 'PRONTO!': 'READY!', 'LUTADORES ESCOLHIDOS!': 'FIGHTERS CHOSEN!', 'CHEFE': 'BOSS',
    'Escolha o {0}: {1} move · {2} confirma · {3} aleatório · Esc volta': 'Choose the {0}: {1} move · {2} confirm · {3} random · Esc back', 'boneco de treino': 'training dummy', 'adversário': 'opponent',
    '{0} move · {1} confirma · Esc volta': '{0} move · {1} confirm · Esc back', 'P1: {0} move, {1} confirma  ·  P2: {2} move, {3} confirma  ·  Esc volta': 'P1: {0} move, {1} confirm  ·  P2: {2} move, {3} confirm  ·  Esc back',
    'ESCOLHA O CENÁRIO': 'CHOOSE THE STAGE', '{0} / {1}   ·   ← → troca · Enter confirma · Esc volta': '{0} / {1}   ·   ← → change · Enter confirm · Esc back',
    'Ar': 'Air', 'Água': 'Water', 'Fogo': 'Fire', 'Terra': 'Earth', 'Guerreiro': 'Warrior',
    // HUD e luta
    'CHI': 'CHI', 'SUPER PRONTO  ({0})': 'SUPER READY  ({0})', 'MUDO (M)': 'MUTED (M)', '{0} HITS!': '{0} HITS!', 'CHI BLOQUEADO {0}s': 'CHI BLOCKED {0}s', '  (CPU)': '  (CPU)', '  (BONECO)': '  (DUMMY)',
    'ROUND {0}': 'ROUND {0}', 'ROUND FINAL': 'FINAL ROUND', 'LUTEM!': 'FIGHT!', 'K.O.': 'K.O.', 'TEMPO!': 'TIME!', 'ESCAPOU!': 'ESCAPED!', 'CONTRA-ATAQUE!': 'COUNTER!', 'REDIRECIONADO!': 'REDIRECTED!', 'CHI BLOQUEADO!': 'CHI BLOCKED!',
    'PAUSA': 'PAUSED', 'Continuar': 'Resume', 'Reiniciar luta': 'Restart match', 'Voltar ao menu': 'Back to menu', 'W/S ou ↑/↓ para escolher · Enter para confirmar · Esc para continuar': 'W/S or ↑/↓ to choose · Enter to confirm · Esc to resume',
    'TREINO  ·  Boneco: {0} (F2)  ·  Reposicionar (F3)  ·  Chi infinito: {1} (F4)  ·  Hitboxes (F1)': 'TRAINING  ·  Dummy: {0} (F2)  ·  Reset (F3)  ·  Infinite chi: {1} (F4)  ·  Hitboxes (F1)',
    'Parado': 'Standing', 'Bloqueando': 'Blocking', 'Agachado': 'Crouching', 'Pulando': 'Jumping', 'sim': 'yes', 'não': 'no', 'Último combo: {0} hit{1}': 'Last combo: {0} hit{1}',
    // resultado
    'VENCE!': 'WINS!', 'A CPU venceu desta vez.': 'The CPU won this time.', 'Vitória do {0}  ·  {1} x {2}': '{0} wins  ·  {1} x {2}', 'Jogador 1': 'Player 1', 'Jogador 2': 'Player 2',
    'Enter = Revanche   ·   Esc = Escolher lutadores': 'Enter = Rematch   ·   Esc = Choose fighters', 'Golpes acertados': 'Hits landed', 'Maior combo': 'Best combo', 'Dano causado': 'Damage dealt', 'Agarrões': 'Throws',
    // arcade / sobrevivência
    'LUTA {0} DE {1}': 'FIGHT {0} OF {1}', 'LUTA FINAL': 'FINAL FIGHT', 'OPONENTE {0}': 'OPPONENT {0}', 'Pontuação: {0}': 'Score: {0}', 'Vitórias: {0}  ·  Recorde: {1}  ·  Vida: {2}': 'Wins: {0}  ·  Best: {1}  ·  Health: {2}',
    'Enter para lutar · Esc para desistir': 'Enter to fight · Esc to quit', 'CONTINUAR?': 'CONTINUE?', 'Sim (a pontuação cai pela metade)': 'Yes (score is halved)', 'Não, voltar ao menu': 'No, back to menu',
    'Pontuação atual: {0}  ·  Continues usados: {1}': 'Current score: {0}  ·  Continues used: {1}', 'ARCADE CONCLUÍDO': 'ARCADE COMPLETE', '{0} · Pontuação final: {1}': '{0} · Final score: {1}', ' · continues: {0}': ' · continues: {0}',
    'Enter para voltar ao menu': 'Enter to return to the menu', 'FIM DA SOBREVIVÊNCIA': 'SURVIVAL OVER', '{0} vitória{1} seguida{1}': '{0} win{1} in a row', 'NOVO RECORDE!': 'NEW RECORD!', 'Recorde: {0}': 'Best: {0}',
    'ONLINE (EXPERIMENTAL)': 'ONLINE (EXPERIMENTAL)', 'ONLINE': 'ONLINE', 'Criar sala (você será o Jogador 1)': 'Create room (you will be Player 1)', 'Entrar na sala (você será o Jogador 2)': 'Join room (you will be Player 2)',
    'Sem servidor: os dois jogadores trocam um código de sala por qualquer canal (mensagem, e-mail).': 'No server: both players exchange a room code through any channel (chat, e-mail).',
    'Lockstep com 3 frames de atraso: a luta só avança quando o input do outro lado chega.': 'Lockstep with 3 frames of delay: the fight only advances when the other side\'s input arrives.',
    'O anfitrião escolhe os dois lutadores e o cenário. Esc sai da partida.': 'The host picks both fighters and the stage. Esc leaves the match.',
    'Funciona melhor na mesma rede ou com NAT aberto; sem servidor TURN, algumas redes não conectam.': 'Works best on the same network or with open NAT; without a TURN server some networks cannot connect.',
    'Este navegador não suporta WebRTC.': 'This browser does not support WebRTC.', 'O outro jogador saiu.': 'The other player left.', 'Conectado! Aguardando o anfitrião escolher os lutadores...': 'Connected! Waiting for the host to choose the fighters...', 'Esc para sair': 'Esc to leave',
    'Você: Jogador 1': 'You: Player 1', 'Você: Jogador 2': 'You: Player 2', 'frame': 'frame', 'Aguardando o outro jogador...': 'Waiting for the other player...', 'Criar sala': 'Create room', 'Entrar na sala': 'Join room',
    'Gerando o código da sala...': 'Generating the room code...', 'Seu código (envie ao amigo):': 'Your code (send it to your friend):', 'Código de resposta do amigo:': 'Your friend\'s answer code:', 'Conectar': 'Connect', 'Conectando...': 'Connecting...', 'Código inválido.': 'Invalid code.',
    'Envie seu código e cole aqui a resposta do amigo.': 'Send your code and paste your friend\'s answer here.', 'Erro: {0}': 'Error: {0}', 'Cole o código recebido do anfitrião e gere sua resposta.': 'Paste the code received from the host and generate your answer.',
    'Sua resposta (envie ao anfitrião):': 'Your answer (send it to the host):', 'Código do anfitrião:': 'Host code:', 'Gerar resposta': 'Generate answer', 'Gerando resposta...': 'Generating answer...', 'Envie sua resposta ao anfitrião e aguarde a conexão.': 'Send your answer to the host and wait for the connection.',
    'Copiar código': 'Copy code', 'Cancelar': 'Cancel', 'Código copiado.': 'Code copied.', 'Conectado!': 'Connected!', 'Conexão encerrada.': 'Connection closed.',
    // v0.7: regras, trajes, desafio diário, torneio
    'DESAFIO DIÁRIO': 'DAILY CHALLENGE', 'TORNEIO': 'TOURNAMENT', 'REGRAS ESPECIAIS': 'SPECIAL RULES', 'Limpar tudo': 'Clear all', 'LUTAR!': 'FIGHT!',
    'Opcional. Eventos do mundo de Avatar e regras de festa. Nada disso vale para a simulação de balanceamento.': 'Optional. Events from the Avatar world and party rules. None of this applies to balance simulations.',
    '↑/↓ escolhe · Enter ou ←/→ marca · Esc volta ao cenário': '↑/↓ select · Enter or ←/→ toggle · Esc back to the stage',
    'Eclipse Solar': 'Solar Eclipse', 'Dobradores de fogo perdem a dobra: sem especiais nem super.': 'Firebenders lose their bending: no specials or super.',
    'Lua Cheia': 'Full Moon', 'Dobradores de água causam 30% a mais de dano e ganham chi 50% mais rápido.': 'Waterbenders deal 30% more damage and gain chi 50% faster.',
    'Cometa de Sozin': "Sozin's Comet", 'Dobradores de fogo causam 40% a mais de dano; projéteis de fogo maiores e mais rápidos.': 'Firebenders deal 40% more damage; bigger, faster fire projectiles.',
    'Tempestade': 'Storm', 'Raios caem em posições sorteadas e o vento empurra os lutadores.': 'Lightning strikes random spots and the wind pushes the fighters.',
    'Vida contínua': 'Continuous health', 'A vida não se recupera entre os rounds.': 'Health does not recover between rounds.',
    'Round de 30 segundos': '30-second rounds', 'Rounds curtos: quem tiver mais vida vence.': 'Short rounds: the one with more health wins.',
    'Super infinito': 'Infinite super', 'A barra de CHI fica sempre cheia.': 'The CHI bar is always full.', 'SEM DOBRA (ECLIPSE)': 'NO BENDING (ECLIPSE)',
    'Traje: {0}': 'Outfit: {0}', 'Padrão': 'Default', 'Roupa de treino': 'Training clothes', 'Traje bloqueado: {0}': 'Outfit locked: {0}', 'Novo traje desbloqueado: {0}': 'New outfit unlocked: {0}',
    'Termine o Arcade com este personagem': 'Finish Arcade with this character', 'Vença {0} lutas com este personagem': 'Win {0} matches with this character',
    'Disfarce da Nação do Fogo': 'Fire Nation disguise', 'Espírito Azul': 'Blue Spirit', 'A Bandida Cega (arena)': 'The Blind Bandit (arena)', 'Traje branco': 'White outfit', 'Guerreiro Kyoshi': 'Kyoshi Warrior', 'Guerreira Kyoshi': 'Kyoshi Warrior',
    'Lótus Branco': 'White Lotus', 'Férias na Ilha Ember': 'Ember Island vacation', 'Rei Fênix': 'Phoenix King', 'Rei de Pedra': 'Stone King',
    'Desafio de {0}: o mesmo para todo mundo hoje': "Challenge for {0}: the same for everyone today", 'Você: {0}': 'You: {0}', 'Melhor placar de hoje: {0}  ·  Tentativas: {1}': "Today's best score: {0}  ·  Attempts: {1}", 'Vencido!': 'Cleared!',
    'Vitória! Placar: {0}': 'Victory! Score: {0}', 'Derrota. Placar: {0}': 'Defeat. Score: {0}', 'Enter para lutar · Esc para voltar': 'Enter to fight · Esc to go back',
    'TORNEIO DAS QUATRO NAÇÕES': 'FOUR NATIONS TOURNAMENT', 'Participantes': 'Participants', 'Jogador {0}': 'Player {0}', 'humano': 'human', 'COMEÇAR': 'START',
    '←/→ troca lutador ou tamanho · Espaço ou chute alterna humano/CPU · Enter avança · Esc volta': '←/→ change fighter or size · Space or kick toggles human/CPU · Enter next · Esc back',
    'CAMPEÃO!': 'CHAMPION!', 'CHAVE DO TORNEIO': 'TOURNAMENT BRACKET', 'Campeão': 'Champion', 'Enter inicia a próxima luta ({0} x {1}) · Esc abandona': 'Enter starts the next match ({0} vs {1}) · Esc quits',
    // cenários
    'Templo do Ar do Sul': 'Southern Air Temple', 'Ba Sing Se': 'Ba Sing Se', 'Palácio da Nação do Fogo': 'Fire Nation Palace', 'Tribo da Água do Norte': 'Northern Water Tribe', 'Ilha Ember': 'Ember Island',
    'Deserto Si Wong': 'Si Wong Desert', 'Pântano Nebuloso': 'Foggy Swamp', 'Omashu': 'Omashu',
    // títulos dos personagens
    'O Último Mestre do Ar': 'The Last Airbender', 'Mestra da Água': 'Waterbending Master', 'Príncipe Banido': 'The Banished Prince', 'A Bandida Cega': 'The Blind Bandit', 'Princesa do Fogo': 'Fire Nation Princess',
    'O Estrategista': 'The Strategist', 'A Acrobata': 'The Acrobat', 'O Dragão do Oeste': 'The Dragon of the West', 'Lâminas Silenciosas': 'Silent Blades', 'Senhor do Fogo': 'Fire Lord', 'Guerreira Kyoshi': 'Kyoshi Warrior', 'O Rei Louco de Omashu': 'The Mad King of Omashu',
    // golpes (nome mostrado no Super)
    'Estado Avatar': 'Avatar State', 'Onda Gigante': 'Tidal Wave', 'Tempestade de Fogo': 'Fire Storm', 'Terremoto': 'Earthquake', 'Dança do Fogo Azul': 'Blue Fire Dance', 'O Plano do Sokka': "Sokka's Plan",
    'Dança das Pressões': 'Pressure Point Dance', 'Fogo do Dragão': 'Dragon Fire', 'Chuva de Lâminas': 'Blade Rain', 'Fênix': 'Phoenix', 'Dança dos Leques': 'Fan Dance', 'Avalanche': 'Avalanche',
  },
};
function T(key, ...args) {
  const lang = (typeof Settings !== 'undefined' && Settings.data.lang) || 'pt';
  let s = (lang !== 'pt' && I18N[lang] && I18N[lang][key]) || key;
  for (let i = 0; i < args.length; i++) s = s.split('{' + i + '}').join(String(args[i]));
  return s;
}
