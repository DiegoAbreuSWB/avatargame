# Roadmap de expansão (v0.7 em diante)

Análise técnica da proposta "Companheiros, novos guerreiros e Crônicas das Quatro Nações" feita sobre o código real
de v0.6.0 (2026-10-08). Esforço: **P** (horas), **M** (1 a 2 dias), **G** (3 dias ou mais). Decisões aqui são propostas;
viram ADR em `DECISOES.md` quando forem implementadas.

## 1. O que a proposta acerta

- O combate está pronto para receber conteúdo: golpes são dados (`characters.js`), modos estendem `Game.prototype` em arquivos próprios (`modes.js`, `online.js`), e a suíte (`tests/run.js`) cobre cenas, golpes, mecânicas, modos e determinismo.
- Companheiros como *assists* (não lutadores) é a escolha certa: um companheiro é, em termos de motor, um **projétil/invocação com dono**, exatamente o que `Projectile` já modela (`follow`, `delay`, `multi`, `pull`, `groundOnly`). Entra sem tocar em `Fighter`.
- Campanha reusando o motor de luta com condições especiais (duas lutas sem cura, duelo de chefe, treino, sobrevivência) é viável: Arcade e Sobrevivência já fazem variações disso.
- Separar progressão narrativa de progressão competitiva evita quebrar o balanceamento que a simulação de matchups mantém.

## 2. Três ressalvas que mudam a ordem

1. **Conteúdo em JSON não funciona em file://.** O jogo abre por duplo clique (ADR-001). `fetch('content/campaigns/zuko.json')` falha por CORS sem servidor. O conteúdo da campanha deve ser **JS com um objeto global** (`content/campaigns/zuko.js` definindo `CAMPAIGNS.zuko`), carregado por `<script>`, como `content.js` já faz. Mesmo formato de dados, outro contêiner.
2. **A campanha depende de três sistemas que ainda não existem**: condições de luta (modificadores), salvamento versionado e desbloqueios. Construí-los primeiro, em um release pequeno, reduz o risco do piloto. Esses mesmos sistemas entregam de graça eventos ambientais, desafio diário e trajes.
3. **Companheiros tocam o input, o HUD, a IA, o 3D e o online** ao mesmo tempo (nova tecla, nova barra, nova decisão da CPU, novos modelos, mais um bit no pacote de lockstep). É um release inteiro, não um item. Deve vir depois das fundações, não antes.

## 3. Itens, encaixe no código e esforço

| Item | Como entra no código atual | Esforço | Dependências |
|---|---|---|---|
| Modificadores de luta (eclipse, lua cheia, cometa, tempestade, sem cura entre lutas, tempo curto) | `js/modifiers.js`: lista de regras aplicadas em `startMatch` e em `receiveHit` (multiplicador de dano por elemento, `chiBlocked` permanente para fogo no eclipse, perigo periódico via `spawnProjectile`). Tela "Regras especiais" no Versus; fora do Online por padrão | M | nenhuma |
| Salvamento versionado | `js/save.js`: `{ schema: 1, campaigns, unlocks, stats }` em localStorage com migração por versão e `try/catch` (padrão de `Settings`) | P | nenhuma |
| Desbloqueios e trajes | `skins` por personagem em `characters.js` (paletas; 2D e 3D já derivam das cores); `unlocks` no save; seleção de traje com ←/→ na tela de seleção | M | salvamento |
| Desafio diário | semente = data (YYYYMMDD) + regras sorteadas com `Rng`; placar local | P | modificadores, salvamento |
| Torneio local (8 ou 16) | `js/tournament.js` estendendo `Game.prototype` como `modes.js`; chaveamento sorteado por `Rng`; cada luta usa o fluxo de 2 jogadores | M | nenhuma |
| Companheiros (3 iniciais: Momo, Appa, Nyla) | `js/companions.js` (dados, como `moves`) + `companion-system.js` (barra própria, recarga, invocação só em `canAct`); tecla `assist` nos keymaps/remap, botão no gamepad (RB vira assist, agarrão passa para LB+RB ou X+A) e no toque; desenho 2D e meshes 3D procedurais; bit extra no `PAD_BITS` do online; ação `assist` na IA; opção "Companheiros: ligado/desligado" (desligado no Online e na simulação de balanceamento por padrão) | G | nenhuma, mas idealmente depois dos modificadores (compartilham o hook de regras) |
| Novos lutadores (Homem Combustão, Jet, Pakku, Hama) | Dados em `characters.js` + aparência em `draw.js`/`rig3d.js`, como os seis da Fase 2. Mecânicas novas necessárias: **carga vulnerável** (startup longo com `hurtbox` ampliada), **puxão** (`pull` já existe), **parede de gelo** (projétil parado que cancela projéteis: `cancels` + `vx: 0`), **controle de sangue** (hitstun longo + `pull`, custo de chi; "Super da lua cheia" só com o modificador lua cheia ativo) | M cada | modificadores (para Hama) |
| Avatar Roku (quatro elementos) | Nova mecânica `stance`: especial 2 em pé troca o elemento ativo e `special`/`super` leem `moves[stance]`. Desbloqueável de campanha | G | desbloqueios |
| Motor de campanha | `js/campaign.js` (estado, capítulo atual, escolhas, reputação), `js/dialogue.js` (caixa de texto com retrato 2D, avanço por tecla), `js/campaign-ui.js` (mapa das nações com nós, tela de capítulo), nós do tipo `dialogue`, `fight` (com modificadores e condição de vitória), `choice`, `reward`, `ending`. Finais marcados na tela como cenários hipotéticos | G | modificadores, salvamento, desbloqueios |
| Campanha piloto: Zuko | `content/campaigns/zuko.js`: 6 capítulos, 8–10 lutas, 3 escolhas, 2 finais, companheiro Dragão no capítulo 5, traje Espírito Azul; reusa Iroh, Aang, Jet (novo), Azula, Ozai | G | motor de campanha |
| Demais campanhas | Um arquivo por personagem; depois do piloto validar o formato | G cada | piloto |
| Co-op e 2×2 | Exigem dois lutadores por lado ou 2×1: o motor é estritamente 1×1 (`fighters[0]` vs `fighters[1]`, `opponent` = o outro). É o item mais caro da lista e o de menor retorno; deixar para depois da v1.0 | G+ | reestruturação do motor |

## 4. Ordem recomendada (difere da proposta na posição das fundações)

| Versão | Conteúdo | Por quê nesta ordem |
|---|---|---|
| **v0.7 Regras e progressão** ✔ feito (2026-10-08) | modificadores de luta, salvamento versionado, trajes/desbloqueios, desafio diário, torneio local | Barato, divertido já no Versus, e são os alicerces da campanha e da Hama |
| **v0.8 Companheiros** | Momo, Appa, Nyla; tecla, HUD, IA, 3D, online; opção competitiva desligada | Release próprio porque toca todos os subsistemas |
| **v0.9 Novos guerreiros** | Homem Combustão, Jet, Pakku, Hama (+ 1 ou 2 cenários) | Jet e Azula são rivais do piloto do Zuko; melhor existirem antes |
| **v1.0 Crônicas: piloto do Zuko** | motor de campanha + diálogos + mapa + campanha completa do Zuko | Valida o formato narrativo com um único personagem |
| **v1.1 Crônicas completas** | Aang, Katara, Toph, Azula, Sokka; Roku desbloqueável; galeria | Replicar o formato validado |

## 5. Cuidados técnicos (confirmados no código)

- **Determinismo**: tudo que afeta a luta usa `Rng` e contadores de round (ADR-014, ADR-030). Companheiros e modificadores não podem usar `Math.random` nem `game.t`; o teste `netplay` pega regressões.
- **Online**: cada novo input (assist) é um bit em `PAD_BITS`; o `cfg` de início precisa carregar modificadores e companheiros escolhidos.
- **IA**: nova ação `assist` em `ai.js` com chance por nível; a IA também deve reconhecer a invocação adversária como projétil (já acontece se for `Projectile`).
- **Balanceamento**: `node tests/run.js matchups` deve rodar com companheiros desligados (base) e ligados (relatório separado).
- **Testes**: adicionar ao harness um modo `campaign` que percorre um capítulo com escolhas roteirizadas, e `save` (gravar, recarregar, migrar esquema antigo).
- **Dívida em `Fighter.update`**: separar `readInput` / `stepState` / `applyPhysics` antes da v1.0; a campanha vai adicionar condições de vitória e isso fica mais simples com estados isolados.
- **Celular**: limitar partículas por quadro e evitar luzes pontuais extras nas invocações grandes (Appa, dragão) no modo 3D.
- **Propriedade intelectual**: projeto de fã, sem arte oficial; distribuição comercial exigiria licença. Manter gratuito e com aviso no README.

## 6. Primeira entrega sugerida

v0.7 inteira (modificadores, salvamento, trajes, desafio diário, torneio) cabe em uma sessão de trabalho e já muda a experiência do Versus; depois, companheiros. Se a prioridade for "ver a campanha logo", o caminho mais curto ainda passa por modificadores + salvamento (parte da v0.7) antes do piloto do Zuko.
