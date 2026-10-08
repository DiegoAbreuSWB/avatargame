# Avatar Arena

Jogo de luta 2D no estilo Street Fighter com os personagens de *Avatar: A Lenda de Aang*.
Feito em HTML5 Canvas + JavaScript puro, sem build. O modo 3D usa Three.js carregado de CDN; o modo 2D clássico não depende de nada.

## Como jogar

Abra o arquivo `index.html` no navegador (Chrome, Edge ou Firefox) e pressione **Enter**.

**Modos gráficos:** o jogo abre em **3D** (lutadores low-poly com cel shading, cenários em 3D, câmera dinâmica, sombras e bloom). No menu inicial, a opção **Gráficos** alterna para o **2D clássico**, que também é usado automaticamente quando não há WebGL ou quando o Three.js não carrega (sem internet). A escolha fica salva no navegador.

- **Melhor de 3 rounds**, 99 segundos por round.
- Golpes acertados enchem a barra de **CHI**. Com ela cheia, use o **Super**.
- Para **bloquear**, segure a direção contrária ao oponente. Rasteiras precisam ser bloqueadas agachado; golpes aéreos, em pé.

### Controles

| Ação              | Jogador 1 | Jogador 2 |
|-------------------|-----------|-----------|
| Mover / pular / agachar | W A S D | Setas |
| Soco              | F         | J         |
| Chute             | G         | K         |
| Especial (dobra)  | H         | L         |
| Especial 2        | S + H     | ↓ + L     |
| Super (chi cheio) | T         | I         |
| Rasteira          | S + G     | ↓ + K     |

Enter confirma, Esc pausa ou volta, M liga/desliga o som.

## Personagens

| Lutador | Elemento | Especial | Especial 2 | Super |
|---------|----------|----------|------------|-------|
| Aang    | Ar       | Rajada de Ar | Patinete de Ar | Estado Avatar |
| Katara  | Água     | Chicote de Água | Estilhaços de Gelo | Onda Gigante |
| Zuko    | Fogo     | Bola de Fogo | Chute Flamejante | Tempestade de Fogo |
| Toph    | Terra    | Arremesso de Rocha | Pilar de Terra | Terremoto |
| Azula   | Fogo     | Fogo Azul | Relâmpago | Dança do Fogo Azul |
| Sokka   | Guerreiro | Bumerangue | Golpe de Espada | O Plano do Sokka |

Cenários: Templo do Ar do Sul, Ba Sing Se, Palácio da Nação do Fogo, Tribo da Água do Norte e Ilha Ember.

## Estrutura

```
index.html        página do jogo
css/style.css     layout da página
js/config.js      constantes e mapa de teclas
js/audio.js       efeitos sonoros sintetizados (Web Audio)
js/input.js       leitura do teclado
js/particles.js   partículas
js/characters.js  elenco, atributos e golpes
js/draw.js        desenho dos lutadores (bonecos articulados)
js/stages.js      cenários
js/projectiles.js projéteis e ataques de área
js/fighter.js     física, estados e dano
js/ai.js          oponente controlado pela CPU
js/hud.js         barras, cronômetro e anúncios
js/menus.js       telas de menu
js/rig3d.js       rig 3D dos lutadores (reusa as poses 2D de draw.js)
js/render3d.js    renderizador Three.js: cenários 3D, projéteis, partículas, câmera, bloom
js/game.js        cenas, rounds e colisões
js/main.js        inicialização e loop
```
