# Avatar Arena — Plano de Desenvolvimento

Estado atual (v0.1, 2026-10-08): protótipo jogável com 6 lutadores, 5 cenários, 2 jogadores ou CPU,
arte e som 100% procedurais, harness de testes em Chrome headless. Nenhum asset externo, nenhum build.

Esforço estimado por item: **P** (horas), **M** (1 a 2 dias), **G** (3 dias ou mais).
Cada fase termina com um "pronto quando" verificável e um release numerado.

---

## Fase 0 — Fundações (antes de qualquer feature nova)

Objetivo: tornar o projeto seguro de evoluir.

| # | Tarefa | Esforço | Detalhes |
|---|--------|---------|----------|
| 0.1 | Versionamento | P | `git init`, `.gitignore`, commit da v0.1, tags por release. |
| 0.2 | Harness de testes no repositório | P | Mover o harness do scratchpad para `tests/harness.html` e criar `tests/run.ps1` que roda o Chrome headless e falha se houver erro de JS ou golpe com dano 0. |
| 0.3 | Overlay de depuração (F1) | P | Desenhar hurtbox, hitbox, pushbox, estado, frame do golpe e vx/vy de cada lutador. Essencial para balancear. |
| 0.4 | RNG com semente | P | Trocar `Math.random` da lógica (IA, cenário aleatório) por um PRNG com semente (`mulberry32`). Partículas podem continuar aleatórias. Pré-requisito para replays, testes determinísticos e online. |
| 0.5 | Configurações persistentes | P | `localStorage` (com try/catch) para som, dificuldade e teclas. |
| 0.6 | Modo Treino | M | Vida infinita, barra de CHI travada, reset com uma tecla, histórico de inputs na tela, dano do último combo. |

**Pronto quando:** `tests/run.ps1` passa; F1 mostra as caixas; duas execuções com a mesma semente geram a mesma luta.
**Release:** v0.1.1

---

## Fase 1 — Sensação de jogo e balanceamento

Objetivo: fazer a luta "parecer Street Fighter" nas mãos, não só na aparência.

| # | Tarefa | Esforço | Detalhes |
|---|--------|---------|----------|
| 1.1 | Buffer de entrada | P | Guardar ataques pressionados nos últimos 6 frames e executá-los assim que o lutador ficar livre. Hoje um botão apertado 1 frame cedo é perdido. |
| 1.2 | Cancelamento de golpes | M | Soco/chute que acertam podem ser cancelados em especial; especial em super. Janela de cancel definida por golpe em `characters.js`. |
| 1.3 | Dash e recuo | P | Toque duplo para frente/trás. Recuo com invulnerabilidade curta. |
| 1.4 | Agarrão (throw) e escape | M | Soco+chute juntos a curta distância; ignora bloqueio; escape apertando o mesmo comando em 8 frames. Resolve o problema de "bloqueio infinito". |
| 1.5 | Escalonamento de dano | P | Cada golpe de um combo causa 10% a menos (mínimo 40%). Evita combos de vida inteira com o vórtice ou a volley. |
| 1.6 | Recuperação no ar e quick rise | P | Direção + botão ao cair para levantar rápido; segurar para ficar no chão mais tempo. |
| 1.7 | Empurrão no canto | P | Quando o defensor está na parede, o atacante é empurrado para trás. |
| 1.8 | Tabela de frame data | P | Gerar `docs/frame-data.md` a partir de `characters.js` com script Node (startup/active/recovery, vantagem no bloqueio). |
| 1.9 | Simulação de matchups | M | Script no harness: 50 lutas CPU x CPU por par (36 pares), imprime taxa de vitória. Alvo: todo personagem entre 40% e 60%. |
| 1.10 | IA com níveis | M | Fácil / Normal / Difícil variando tempo de reação, chance de bloquear e uso de punições (punir golpe bloqueado, pular projétil). |

**Pronto quando:** nenhum matchup fora de 35%–65% na simulação; combos básicos (soco → especial) funcionam para os 6 personagens.
**Release:** v0.2 "Game Feel"

---

## Fase 2 — Conteúdo

Objetivo: elenco e cenários que justifiquem voltar a jogar.

### 2.1 Novos lutadores (G cada, ~1 dia por personagem com o rig atual)

| Personagem | Elemento | Ideia de kit |
|------------|----------|--------------|
| Iroh | Fogo | Lento e forte; "Respiração do Dragão" (sopro de fogo contínuo) e redirecionamento de raio como contra-golpe. |
| Ty Lee | Nenhum | Rapidíssima; "Bloqueio de Chi" desativa os especiais do oponente por 5 s. Mecânica única. |
| Mai | Nenhum | Zoneadora: facas em três ângulos, prende o oponente na parede. |
| Suki | Nenhum | Leques como projéteis curtos, contra-ataque com parry. |
| Rei Bumi | Terra | Grappler: arremessos com rochas, armadura durante especiais. |
| Ozai | Fogo | Chefe do modo Arcade: fogo do cometa, dano alto, pouca mobilidade. |

Ordem sugerida: Ty Lee (mecânica nova barata), Iroh, Mai, Ozai (chefe), depois os outros.

### 2.2 Novos cenários (M cada)

Deserto Si Wong (tempestade de areia reduz visibilidade), Pântano, Omashu (plataforma inclinada visual), Prisão da Rocha Fervente, Oásis Espiritual (noite, lua). Um deles com perigo de cenário (onda que atinge os dois na Ilha Ember).

### 2.3 Modos

| # | Tarefa | Esforço |
|---|--------|---------|
| 2.3.1 | Modo Arcade: 6 lutas + chefe, com telas de "próximo oponente" e final em texto por personagem | M |
| 2.3.2 | Modo Sobrevivência: vida não regenera totalmente entre lutas, placar | P |
| 2.3.3 | Torneio local para até 8 jogadores alternando no teclado (chaveamento na tela) | M |

**Pronto quando:** 10 lutadores, 8 cenários, Arcade jogável do início ao fim.
**Release:** v0.3 "Elenco"

---

## Fase 3 — Apresentação

**Feito em 2026-10-08 (v0.1.2):** modo 2.5D com Three.js (opção C abaixo). A lógica continua 2D; `rig3d.js` monta bonecos low-poly com cel shading a partir das poses de `draw.js`, e `render3d.js` cuida de cenários 3D (pano de fundo 2D como textura + adereços), projéteis, partículas, câmera dinâmica, sombras e bloom. O 2D clássico ficou como alternativa no menu e como fallback sem WebGL.

Objetivo: parecer um jogo acabado. Aqui há uma decisão de direção de arte a tomar primeiro:

| Opção | Prós | Contras |
|-------|------|---------|
| **A. Evoluir o rig procedural** (recomendado para começar) | Zero assets, personagens novos em horas, visual consistente e próprio | Limite de expressividade; roupas e cabelos simplificados |
| B. Sprites desenhados (Aseprite → atlas JSON) | Animação de qualidade, mais fiel à série | Semanas de arte por personagem; pipeline de atlas; tamanho do jogo cresce |
| **C. 2.5D com Three.js (implementado)** | Profundidade, luz, sombra e bloom reais; câmera dinâmica; lógica intacta | Depende de WebGL e de CDN; modelos glTF dos personagens teriam de ser feitos ou encomendados |

Tarefas da opção A (M cada): movimento secundário (cabelo, xale, rabo de cavalo seguem a física), rosto com expressões por estado (dor, esforço, vitória), silhuetas mais distintas (Toph menor e larga, Iroh robusto), antecipação e "squash and stretch" nos golpes.

Próximos passos no 3D (M cada): movimento secundário (cabelo, xale), expressões faciais por estado, trilhas de movimento nos golpes, cinematográfica de Super com órbita de câmera, troca do rig por modelos glTF animados quando houver arte.

Independente da opção:

| # | Tarefa | Esforço |
|---|--------|---------|
| 3.1 | Câmera dinâmica: acompanha o centro dos lutadores, zoom leve quando se aproximam, zoom e congelamento no Super e no K.O. | M |
| 3.2 | Parallax nos cenários (3 camadas) | P |
| 3.3 | Música: sequenciador Web Audio com um tema curto por cenário, ou arquivos OGG pequenos | M |
| 3.4 | Intro de personagem no round 1 (pose + fala) e pose/fala de vitória | P |
| 3.5 | Retratos no HUD e na seleção | P |
| 3.6 | Tela de resultado com estatísticas (maior combo, golpes acertados, tempo) | P |
| 3.7 | Idiomas: pt-BR e en (tabela de strings) | P |

**Release:** v0.4 "Cinema"

---

## Fase 4 — Plataformas e distribuição

| # | Tarefa | Esforço | Detalhes |
|---|--------|---------|----------|
| 4.1 | Gamepad API | M | Dois controles. **Prioridade alta:** teclados comuns não registram 6+ teclas ao mesmo tempo (ghosting), o que prejudica o modo 2 jogadores no mesmo teclado. |
| 4.2 | Remapeamento de teclas na tela | P | Com persistência (0.5). |
| 4.3 | Controles de toque | M | Direcional e 4 botões virtuais; só para o modo CPU. |
| 4.4 | PWA | P | `manifest.json` + service worker para jogar offline e instalar. (Não funciona dentro do artefato do claude.ai; vale para hospedagem própria.) |
| 4.5 | Publicação | P | GitHub Pages ou itch.io (zip da pasta). |
| 4.6 | Build desktop | M | Tauri ou Electron, só se houver demanda. |

**Release:** v0.5 "Plataformas"

---

## Fase 5 — Online (opcional, só depois da Fase 4)

Exige simulação determinística (0.4) e passo fixo (já existe).

1. **Lockstep com atraso** via WebRTC DataChannel: cada lado envia seus inputs por frame; o jogo roda com 3 a 5 frames de atraso. Simples, mas sente-se o lag. (G)
2. **Rollback**: guardar snapshots do estado a cada frame e re-simular ao receber inputs atrasados. Muito melhor para jogo de luta, muito mais trabalho. Exige que `Fighter`, `Projectile` e `Game` sejam serializáveis sem referências ao canvas. (G+)
3. Sinalização: servidor mínimo (Node + WebSocket) ou serviço pronto para trocar as ofertas WebRTC.

Recomendação: fazer o item 1 como prova de conceito; só partir para rollback se o jogo tiver público.

---

## Dívida técnica a pagar ao longo do caminho

- **Scripts globais** → módulos ES com um bundler leve (Vite) quando passar de ~20 arquivos. Manter a opção de abrir por `file://` para quem só quer jogar.
- **`Fighter.update`** mistura física, estado e input; separar em `applyPhysics`, `stepState`, `readInput`.
- **Frame data** espalhada em objetos literais; validar com um script (`node tools/validate-moves.js`) que acusa hitbox fora do corpo, startup 0, etc.
- **Desenho** com `ctx.filter` para o flash de dano não funciona no Safari; usar canvas offscreen com `source-atop`.
- **Harness** depende do caminho absoluto do Chrome; parametrizar.

---

## Quick wins para a próxima sessão (todos P)

1. Overlay de hitboxes (0.3).
2. Buffer de entrada (1.1).
3. Dash com toque duplo (1.3).
4. Escalonamento de dano (1.5).
5. Níveis de dificuldade da IA, só o parâmetro de reação (parte de 1.10).
6. Parallax simples nos 5 cenários (3.2).
7. Retratos no HUD (3.5).
8. Remapeamento de teclas (4.2).

---

## Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Ghosting do teclado no modo 2 jogadores | Jogadores não conseguem apertar teclas juntos | Gamepad cedo (4.1); documentar no README; teclas espalhadas em zonas diferentes do teclado (já feito). |
| Elenco crescer sem balanceamento | Personagens inúteis ou apelões | Simulação de matchups (1.9) rodando a cada personagem novo. |
| Arte por sprites virar gargalo | Meses sem release | Começar pela opção A; só migrar para sprites com elenco e mecânicas fechados. |
| Online cedo demais | Reescrita do núcleo | Determinismo (0.4) desde já; online só na Fase 5. |

---

## Resumo das versões

| Versão | Nome | Conteúdo |
|--------|------|----------|
| v0.1 | Protótipo | 2D clássico |
| v0.1.2 | 2.5D | Atual: renderizador Three.js com cel shading, câmera dinâmica e bloom; 2D mantido |
| v0.1.1 | Fundações | Git, testes no repo, debug, semente, treino |
| v0.2 | Game Feel | Buffer, cancels, dash, agarrão, balanceamento, IA por níveis |
| v0.3 | Elenco | +4 a 6 lutadores, +3 cenários, Arcade |
| v0.4 | Cinema | Rig melhorado ou sprites, câmera, música, intros |
| v0.5 | Plataformas | Gamepad, remap, toque, PWA, publicação |
| v1.0 | Lançamento | Polimento geral, online opcional |
