# Changelog

Todas as versões são de 2026-10-08. Decisões por trás de cada item em `docs/DECISOES.md`.

## 0.7.0 — Regras e progressão (v0.7 do roadmap de expansão)
- Regras especiais antes da luta: Eclipse Solar, Lua Cheia, Cometa de Sozin, Tempestade (raios e vento), vida contínua, round de 30 s, super infinito; valem no Versus, CPU e Online.
- Salvamento versionado (estatísticas, desbloqueios, desafio diário, torneios) com migração e recuperação de dados corrompidos.
- Trajes: um traje temático por personagem (terminar o Arcade com ele) e roupa de treino (5 vitórias); troca na seleção com a tecla de especial.
- Desafio diário: luta fixa por data, com regras, CPU difícil e melhor placar salvo.
- Torneio local de 4 ou 8 participantes (humanos ou CPU), chave sorteada, lutas CPU x CPU simuladas na hora.
- Testes: 14 verificações novas (regras, save, trajes, diário, torneio); ADR-032 a 036.

## 0.6.0 — Fase 5: online experimental
- Lockstep com atraso de 3 frames sobre WebRTC DataChannel, sem servidor (troca de código de sala).
- Cena "Online (experimental)": criar sala / entrar na sala; anfitrião escolhe lutadores e cenário; revanche pelo anfitrião.
- Teste de determinismo com duas instâncias do jogo em loopback; correção do câmera lenta do K.O. (usava o contador de tela).

## 0.5.0 — Fase 4: plataformas
- Gamepad (2 controles, layout standard), controles de toque para o Jogador 1.
- PWA (manifest + service worker), ícones, pacote zip e guia de publicação.

## 0.4.0 — Fase 3: apresentação
- Câmera 2D com zoom e parallax; música sequenciada por clima de cenário.
- Retratos no HUD, balões de fala de apresentação e vitória, estatísticas no resultado.
- Interface traduzida para inglês (opção Idioma).

## 0.3.0 — Fase 2: conteúdo
- Ty Lee, Iroh, Mai, Ozai (chefe), Suki e Bumi, com mecânicas próprias.
- Deserto Si Wong, Pântano Nebuloso e Omashu.
- Modos Arcade (escada de 7 lutas, continue, pontuação, finais) e Sobrevivência (recorde).

## 0.2.0 — Fase 1: sensação de jogo
- Buffer de entrada, cancelamentos, dash/recuo, agarrão com escape, escalonamento de dano, levantar rápido, empurrão no canto.
- IA com níveis; ferramenta de frame data; simulação de matchups e duas passadas de balanceamento.

## 0.1.3 — Fase 0: fundações
- Git, harness e runner de testes no repositório, overlay de hitboxes (F1), Rng com semente, modo Treino.
- Tela de Configurações e remapeamento de controles.

## 0.1.2 — Modo 3D
- Renderizador 2.5D com Three.js: bonecos low-poly com cel shading, cenários 3D, câmera dinâmica, bloom. 2D mantido.

## 0.1.0 — Protótipo
- 6 lutadores, 5 cenários, 2 jogadores ou CPU, melhor de 3, CHI e Super, som sintetizado.
