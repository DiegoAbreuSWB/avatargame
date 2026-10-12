# Changelog

Todas as versões são de 2026-10-08. Decisões por trás de cada item em `docs/DECISOES.md`.

## 1.1.0 — Crônicas completas
- Campanhas de Aang (O Peso do Mundo), Katara (A Água Encontra um Caminho), Toph (A Bandida Cega), Azula (Perfeita) e Sokka (O Plano), cada uma com escolhas e dois finais.
- Avatar Roku: personagem desbloqueável (concluir qualquer campanha) que troca de elemento durante a luta.
- Galeria com biografias, golpes, trajes, estatísticas e finais vistos.
- Testes: todas as campanhas percorridas automaticamente; postura e desbloqueio do Roku. ADR-043 e 044.
- Simulação longa de balanceamento (6 lutas por par): 15 dos 16 lutadores entre 42% e 58%; Ozai (chefe) em 66%, mantido.

## 1.0.0 — Crônicas das Quatro Nações: campanha piloto do Zuko
- Motor de campanha (capítulos, diálogos com retratos, escolhas com reputação, lutas com regras, recompensas, ramificações, finais) com progresso salvo a cada passo.
- Campanha "O Caminho da Honra": 6 capítulos, 8 lutas por rota, 3 escolhas, 2 finais, trajes Espírito Azul e de treino como recompensa.
- Correção no salvamento: a migração descartava chaves novas (progresso de campanha).
- Passada de balanceamento com 16 lutadores (Suki, Ty Lee e Bumi para cima; Sokka, Zuko e Ozai para baixo).
- Testes: duas rotas da campanha, retomada do save; ADR-041 e 042.

## 0.9.0 — Novos guerreiros
- Homem Combustão (explosões de longo alcance com carga vulnerável), Jet (gancho que puxa, investida, super multi-hit), Mestre Pakku (chicotes longos, muralha de gelo que absorve projéteis, tempestade polar) e Hama (armadilha de água e Prisão da Lua Cheia, chefe).
- Cenário Prisão da Rocha Fervente. Título e seleção adaptados a 16 lutadores.
- Testes dos quatro kits; ADR-039 e 040.

## 0.8.0 — Companheiros
- Momo (Distração Aérea), Appa (Investida do Bisão) e Nyla (Língua Paralisante) como assistências: barra de apoio própria, tecla R/U (LT/RT no controle, botão A no toque), escolha na seleção com a tecla de super.
- CPU usa companheiros; opção "Companheiros: desligados (competitivo)"; companheiros viajam no cfg do Online.
- Correção: overlay "Pressione Enter" não sumia fora do artefato (CSS do atributo hidden).
- Testes: 4 verificações de companheiros; ADR-037 e 038.

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
