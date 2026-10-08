# Registro de decisões (ADRs)

Cada decisão tem contexto, opções consideradas, escolha e consequências. Numeração cronológica.
Datas em 2026-10-08, salvo indicação. Formato inspirado em *Architecture Decision Records*.

---

## ADR-001 · Canvas 2D e JavaScript puro, sem engine nem build

**Contexto.** Pedido: jogo de luta 2D estilo Street Fighter com personagens de Avatar, 1x1 no teclado.
**Opções.** (a) Phaser ou outra engine; (b) React/Vite com bundler; (c) HTML5 Canvas + JS puro com `<script>` globais.
**Escolha.** (c).
**Por quê.** Abre por duplo clique em `index.html` (file://), sem instalar nada; o jogo cabe em ~20 arquivos; módulos ES falhariam em file:// por CORS.
**Consequências.** Ordem dos `<script>` importa (ver ADR-013); quando o projeto passar de ~30 arquivos, migrar para módulos ES com Vite está previsto no plano (dívida técnica).

## ADR-002 · Arte procedural (bonecos articulados desenhados em código)

**Contexto.** Não há sprites oficiais nem licença para usar imagens da série.
**Opções.** (a) sprites desenhados à mão; (b) imagens de terceiros; (c) figuras desenhadas com primitivas do Canvas a partir de "juntas" (poses).
**Escolha.** (c). Cada personagem é um conjunto de juntas 2D (`draw.js`), com traços próprios (flecha do Aang, cicatriz do Zuko, coque da Toph...).
**Por quê.** Personagens novos em horas; zero assets; o mesmo sistema de poses alimenta o modo 3D (ADR-010).
**Consequências.** Expressividade limitada; sem rostos detalhados. Documentado no README que são figuras estilizadas, não arte oficial.

## ADR-003 · Lógica em passo fixo de 60 quadros por segundo

**Contexto.** Jogo de luta depende de frame data (startup/ativo/recuperação) previsível.
**Escolha.** Loop com acumulador e passo fixo de 1/60 s; no máximo 4 passos por quadro de tela para não "explodir" após uma aba em segundo plano.
**Consequências.** Frame data em frames inteiros; a simulação é determinística dado o mesmo input (pré-requisito do ADR-016 e da Fase 5).

## ADR-004 · Dois jogadores no mesmo teclado com zonas separadas

**Contexto.** 1x1 local sem gamepad.
**Escolha.** P1: WASD + F G H T; P2: setas + J K L I. Leitura por `e.code` (posição física), não por caractere, para funcionar em ABNT2 e outros layouts.
**Consequências.** Teclados comuns não registram 6+ teclas simultâneas (ghosting); a mitigação definitiva é gamepad (Fase 4). As teclas são remapeáveis (ADR-012).

## ADR-005 · Som sintetizado com Web Audio

**Escolha.** Efeitos gerados em código (ruído filtrado, osciladores) em vez de arquivos de áudio.
**Por quê.** Zero assets, sem problemas de licença, carregamento instantâneo. Som só inicia após interação do usuário (exigência dos navegadores): há um overlay "Pressione Enter".

## ADR-006 · Bloqueio segurando para trás, com altura (alto/baixo)

**Escolha.** Como em Street Fighter: segurar a direção contrária bloqueia; rasteiras exigem bloqueio agachado; golpes aéreos exigem bloqueio em pé; projéteis causam dano residual (chip).
**Consequências.** Precisa de uma forma de abrir a guarda: o agarrão (ADR-015).

## ADR-007 · Barra de CHI e Super por personagem

**Escolha.** Golpes acertados ou recebidos enchem o CHI; com 100 o Super fica disponível numa tecla própria.
**Por quê.** Tecla própria evita comandos de meia-lua, que no teclado são pouco confiáveis.

## ADR-008 · Projéteis como "especiais de dados"

**Escolha.** Cada especial é um objeto de dados em `characters.js` (startup, hitbox, projétil, multi-hit, lançador, etc.). Novos personagens são, em grande parte, novos dados.
**Consequências.** A ferramenta `tools/frame-data.js` lê esses dados e gera a tabela em `docs/frame-data.md`.

## ADR-009 · Testes por harness em Chrome headless

**Contexto.** Não há framework de testes nem DOM em Node; o jogo depende de Canvas.
**Opções.** (a) jsdom + stubs de canvas; (b) Playwright/Puppeteer; (c) uma página de harness que carrega os scripts reais e é executada pelo Chrome headless com `--dump-dom`.
**Escolha.** (c), em `tests/harness.html` + `tests/run.js`. Sem dependências npm. Testa cenas, todos os golpes (dano > 0), mecânicas, uma luta CPU x CPU completa e simulação de matchups; também tira capturas de tela (`--screenshot`).
**Consequências.** Depende de um Chrome/Edge instalado (variável `CHROME` para outro caminho). O WebGL no headless usa SwiftShader (software), bom para validar, ruim para medir desempenho.

## ADR-010 · Modo 2.5D com Three.js mantendo a lógica 2D

**Contexto.** Pergunta do usuário: "é possível fazer 3D e adicionar efeitos, animações?".
**Opções.** (a) 2.5D: cena 3D, luta num plano (SF IV/V); (b) 3D de arena com desvio lateral (Tekken); (c) falso 3D (parallax).
**Escolha.** (a). `rig3d.js` monta bonecos low-poly (esferas e cilindros) a partir das mesmas juntas 2D; `render3d.js` cuida de cenário, projéteis, partículas, câmera e bloom. A física, as hitboxes e a IA não mudaram.
**Por quê.** Mantém todo o balanceamento e os testes; personagens 3D novos continuam custando horas; o 2D clássico fica como fallback.
**Consequências.** Depende de WebGL e do Three.js r147 via CDN (jsdelivr, permitido pela CSP do artefato). Offline o jogo cai no 2D. Modelos glTF podem substituir o rig no futuro sem tocar a lógica.

## ADR-011 · Three.js r147 UMD em vez de módulos ES

**Escolha.** Versão r147 (última com `examples/js` em UMD) carregada por `<script>` tags, inclusive EffectComposer/UnrealBloomPass.
**Por quê.** Módulos ES não funcionam em file://; UMD mantém "abrir o HTML e jogar".
**Consequências.** Preso a r147 até migrar para bundler. Modo de cor legado: intensidades de luz somadas acima de ~1,3 estouram o toon shading para branco e o bloom espalha (lição registrada na memória do projeto).

## ADR-012 · Configurações em um único JSON no localStorage

**Contexto.** Pedido de tela de configurações e remapeamento.
**Escolha.** `Settings` guarda um objeto único (`avatarArena.settings`) com mesclagem sobre padrões ao carregar; mudanças salvam na hora. Teclas reservadas (Enter, Esc, M, F1–F12) não podem ser mapeadas; conflitos entre ações ou entre jogadores são recusados com mensagem.
**Consequências.** Novas opções entram sem invalidar o que já foi salvo; em janela privada tudo funciona com padrões (try/catch em volta do storage).

## ADR-013 · Scripts globais com ordem explícita; métodos de cena em arquivos separados

**Escolha.** `settings-ui.js` adiciona métodos a `Game.prototype` e por isso é carregado **depois** de `game.js`. O harness tem a mesma ordem.
**Por quê.** Evita que `game.js` cresça sem limite; mantém arquivos globais simples.
**Consequências.** Qualquer arquivo que estenda `Game` deve vir depois de `game.js` no `index.html` e no harness (erro encontrado e corrigido na Fase 0).

## ADR-014 · Gerador aleatório com semente só para a lógica

**Contexto.** Replays, testes determinísticos e jogo online exigem que a mesma semente produza a mesma luta.
**Escolha.** `Rng` (mulberry32) para IA e sorteios de jogo; `Math.random` continua nos visuais (partículas, tremor de tela).
**Por quê.** O número de chamadas de visual varia entre 2D e 3D; se compartilhassem o gerador, dois clientes em modos diferentes dessincronizariam.
**Consequências.** A semente da partida aparece no overlay F1; o harness usa `--seed`.

## ADR-015 · Mecânicas de game feel (Fase 1)

| Mecânica | Decisão | Motivo |
|---|---|---|
| Buffer de entrada | 8 frames; botões apertados durante recuperação/stun saem no primeiro frame livre | Evita "comi o input"; permite reversal |
| Soco e chute esperam 2 frames | Para detectar soco+chute = agarrão | Latência de 33 ms, imperceptível; evita comando dedicado |
| Cancelamento | Normal que conectou cancela em especial (janela: ativos + 6 frames); especial cancela em super | Combos básicos como em SF; sem cancel de rasteira/aéreos para não virar loop |
| Dash | Toque duplo em 12 frames; dash para frente 14 frames; recuo 16 frames com 8 de invulnerabilidade | Mobilidade e escape |
| Agarrão | Alcance 95 px, 12 de dano, ignora bloqueio; escape apertando soco+chute até o frame 10 | Abre a guarda (ADR-006) |
| Escalonamento de dano | Cada golpe do combo vale 10% a menos, mínimo 40% | Limita combos de vida inteira (vórtice, rajada de fogo) |
| Levantar rápido / ficar no chão | Qualquer botão encurta o knockdown para 12 frames; segurar baixo estende 30 | Mind game no wake-up |
| Empurrão no canto | Atacante é empurrado quando o defensor está na parede | Evita pressão infinita no canto |
| Armadura / contra-postura / bloqueio de chi | Flags `armor`, `counter`, `applies.chiBlock` nos dados do golpe | Preparam os kits da Fase 2 sem código novo por personagem |

## ADR-016 · Balanceamento por simulação, não por intuição

**Escolha.** `node tests/run.js matchups --pairs N` roda N lutas CPU x CPU por par com sementes fixas e aponta quem está fora de 40–60% de vitórias.
**Resultados da Fase 1.** Passada 1 (6 por par): Aang 30%, Katara/Zuko/Toph 63%. Ajustes: Aang (+dano na rajada e no patinete, chute mais rápido, peso 0,95), Toph (-1 no chute e na rocha), Katara (estilhaços 3x4). Passada 2 (8 por par, outra semente): Aang 50%, Toph 63%, Azula 33%. Ajustes: Toph -1 no chute; Azula +1 no soco e no fogo azul, relâmpago 6 frames mais rápido. Resultado final registrado no commit da Fase 1.
**Consequências.** A IA é a mesma para todos; a simulação mede o kit, não a habilidade humana. Com 40 lutas por personagem a margem é de ±15 pontos, então só desvios grandes justificam mudança.
