# Avatar Arena

Jogo de luta 1x1 no estilo Street Fighter com os personagens de *Avatar: A Lenda de Aang*.
HTML5 Canvas + JavaScript puro, sem build. O modo 3D usa Three.js carregado de CDN; o modo 2D clássico não depende de nada.

Versão atual: **0.6.0**. Histórico em [CHANGELOG.md](CHANGELOG.md); decisões em [docs/DECISOES.md](docs/DECISOES.md); plano em [PLANO-DE-DESENVOLVIMENTO.md](PLANO-DE-DESENVOLVIMENTO.md).

## Como jogar

Abra `index.html` no navegador (Chrome, Edge ou Firefox) e pressione **Enter**. Para jogar offline/instalado como aplicativo (PWA), sirva a pasta por http (`npx serve .`) ou publique (ver [docs/PUBLICACAO.md](docs/PUBLICACAO.md)).

**Modos:** 2 jogadores · 1 jogador vs CPU · Arcade (7 lutas com chefe, continue e finais) · Sobrevivência (recorde salvo) · Treino (boneco, vida e chi infinitos, histórico de inputs, hitboxes) · Online experimental (sem servidor, troca de código de sala).

**Gráficos:** 3D (lutadores low-poly com cel shading, cenários em 3D, câmera dinâmica, sombras, bloom) ou 2D clássico (câmera com zoom e parallax). Alterna em Configurações; sem WebGL o jogo cai no 2D sozinho.

**Regras:** melhor de 3 rounds (configurável), 99 s por round (configurável). Golpes acertados enchem o **CHI**; cheio, libera o **Super**. Bloqueia-se segurando para trás: rasteiras exigem bloqueio agachado, golpes aéreos exigem bloqueio em pé; o agarrão ignora bloqueio.

### Controles

| Ação | Jogador 1 | Jogador 2 | Gamepad |
|---|---|---|---|
| Mover / pular / agachar | W A S D | Setas | Direcional ou analógico |
| Soco | F | J | X |
| Chute | G | K | A |
| Especial (dobra) | H | L | B |
| Especial 2 | S + H | ↓ + L | ↓ + B |
| Super (chi cheio) | T | I | Y |
| Agarrão | F + G juntos | J + K juntos | RB |
| Dash / recuo | toque duplo ← ou → | toque duplo ← ou → | LB (dash) |
| Rasteira | S + G | ↓ + K | ↓ + A |

Teclas remapeáveis em **Configurações → Controles do Jogador 1/2**. Em telas sensíveis ao toque aparecem controles virtuais para o Jogador 1.
Enter confirma, Esc pausa ou volta, M liga/desliga o som, F1 mostra hitboxes. No Treino: F2 muda o boneco, F3 reposiciona, F4 chi infinito.

### Mecânicas de luta

Buffer de entrada (8 frames), cancelamento normal → especial → super, dash e recuo invulnerável, agarrão com escape (soco+chute até o 10º frame), escalonamento de dano em combos (mínimo 40%), levantar rápido ou ficar no chão, empurrão no canto, armadura, contra-posturas (Suki, Iroh) e bloqueio de chi (Ty Lee). Frame data completa em [docs/frame-data.md](docs/frame-data.md).

## Personagens

| Lutador | Elemento | Especial | Especial 2 | Super |
|---|---|---|---|---|
| Aang | Ar | Rajada de Ar | Patinete de Ar | Estado Avatar |
| Katara | Água | Chicote de Água | Estilhaços de Gelo | Onda Gigante |
| Zuko | Fogo | Bola de Fogo | Chute Flamejante | Tempestade de Fogo |
| Toph | Terra | Arremesso de Rocha | Pilar de Terra | Terremoto |
| Azula | Fogo | Fogo Azul | Relâmpago | Dança do Fogo Azul |
| Sokka | Guerreiro | Bumerangue | Golpe de Espada | O Plano do Sokka |
| Ty Lee | Guerreira | Bloqueio de Chi | Salto Acrobático | Dança das Pressões |
| Iroh | Fogo | Sopro do Dragão | Redirecionamento | Fogo do Dragão |
| Mai | Guerreira | Facas | Agulhas de Fixação | Chuva de Lâminas |
| Ozai (chefe) | Fogo | Fogo do Cometa | Onda de Fogo | Fênix |
| Suki | Guerreira | Leque Cortante | Postura Kyoshi | Dança dos Leques |
| Bumi | Terra | Arremesso de Pedra | Abraço de Pedra | Avalanche |

Cenários: Templo do Ar do Sul, Ba Sing Se, Palácio da Nação do Fogo, Tribo da Água do Norte, Ilha Ember, Deserto Si Wong, Pântano Nebuloso e Omashu.

## Desenvolvimento

```
node tests/run.js all            # cenas, 108 golpes, mecânicas, modos, lockstep e uma luta CPU x CPU (2D)
node tests/run.js all --3d       # o mesmo no renderizador 3D (WebGL por software no headless)
node tests/run.js matchups --pairs 8   # simulação de balanceamento (taxa de vitória por personagem)
node tests/run.js shot --3d --p1 2 --p2 3 --move special --frame 22 --out tests/out/x.png   # captura de tela
node tools/frame-data.js         # regenera docs/frame-data.md
.\tools\package.ps1              # zip para publicação em dist/
```

Os testes rodam o jogo de verdade no Chrome/Edge headless (variável `CHROME` para outro caminho); não há dependências npm.

## Estrutura

```
index.html               página do jogo (dois canvases: WebGL atrás, 2D/HUD na frente)
css/style.css            layout
js/config.js             constantes, mapa de teclas, Rng com semente
js/settings.js           configurações persistentes, nomes de teclas
js/i18n.js               tradução (pt-BR / en)
js/audio.js, music.js    efeitos e música sintetizados (Web Audio)
js/input.js, gamepad.js, touch.js   teclado, controles, toque
js/particles.js          partículas
js/characters.js         elenco, atributos e golpes (dados)
js/draw.js               bonecos 2D (poses por juntas)
js/stages.js             cenários 2D (também viram o fundo do 3D)
js/projectiles.js        projéteis e ataques de área
js/fighter.js            física, estados, dano, mecânicas
js/ai.js                 CPU com níveis
js/hud.js, menus.js      HUD, falas, overlay F1, telas
js/rig3d.js, render3d.js renderizador Three.js
js/game.js               cenas, rounds, colisões
js/settings-ui.js, modes.js, online.js, netplay.js, content.js   configurações, arcade/sobrevivência, online, textos
js/main.js               inicialização, loop, PWA
tests/                   harness e runner;  tools/  frame data, ícone, pacote;  docs/  decisões, frame data, publicação
```

Os personagens são figuras estilizadas desenhadas em código, não arte oficial da série.
