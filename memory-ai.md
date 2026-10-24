# MEMÓRIA DO PROJETO — GAME 2D - ARUAN

> **LEIA PRIMEIRO.** Este é o handoff entre IAs e pessoas. Se você é uma IA (Codex, Antigravity, OpenCode, Claude etc.), atualize o bloco **“ÚLTIMA SESSÃO”** e acrescente uma linha no **“REGISTRO DE IAs”** antes de terminar. Nunca apague o histórico.
>
> **Arquivo canônico:** `memory-ai.md` — renomeado de `memory-ai.md.txt` em 23/10/2026 (a extensão dupla era acidente).
> **Projeto:** `D:\.GITHUB\games\game-2d-aruan`
> **Servidor local:** `http://localhost:5317`

---

## 0. ÚLTIMA SESSÃO (checkpoint autônomo)

| Campo | Valor |
|---|---|
| Data | 2026-10-24 (UTC−3) |
| Ferramenta | Codex, único agente de implementação |
| Modelo / IA | GPT-6 (identificação disponível; variante não informada) |
| Base | 02c7a74; master sincronizado por pull --ff-only |
| Issue | #16 |
| Resultado | Etapa7 concluída com #5: transições sem giro reverso, entrada/saída de dodge contínuas, giros na antecipação e movimentos secundários/expressão. 9.880poses, apoio em24ataques~1,7e-14; capturas014 e progressão004. |
| Testes | npm test OK: rig, IK/grip/apoios e integração ampliada; quantidade/evidências no checkpoint |
| Navegador | Chrome headless: index.html e inspecao.html, console sem erros, 8 direções e 7 animações |
| Limitações | Sem validação física de celular/Xbox; sem benchmark de FPS em janela real. Nenhuma janela visível aberta. |
| Próximo passo | #17: joystick flutuante, ataque/dodge multitouch e HUD responsivo |

Os checkpoints, commits e evidências desta execução estão em docs/status-codex.md. Etapa 0 auditada e mantida fechada. Board consultado ao vivo via API (Project #2).

---

## 1. REGISTRO DE IAs (append-only)

| # | Data | Ferramenta | Modelo | O que fez | Evidência |
|---|---|---|---|---|---|
| 1 | 17–18/10/2026 | **Claude** (Anthropic) | não registrado | Criou o piloto original do cavaleiro (pré-Aruan), com IK, combo, cenário e agente crítico. | extratos históricos locais em `docs/` |
| 2 | 23/10/2026 20:39–20:52 | **não registrado** | não registrado | Migrou do cavaleiro para o **Aruan procedural**, criou o estúdio, corrigiu rosto/pena/pegada e registrou as capturas 001–002. | commits `d49497d`, `20ebb0c`, `2b3fcf6` |
| 3 | 23/10/2026 23:09 | **OpenCode** | DeepSeek V4.1 Flash Free | Primeira auditoria; reconstruiu a memória zerada, atualizou README do timelapse e `npm test`; validou testes e páginas. | esta sessão |
| 4 | 23/10/2026 23:17–23:35 | **OpenCode** | DeepSeek V4.1 Flash Free | Segunda auditoria; guard do teclado; renomeação das capturas para `.jpg`; README/AGENTS; versionamento das referências; commits `9bd1c73`, `1c8a0ac`, `e48f87b`; sincronização com o GitHub. | esta sessão |
| 5 | 24/10/2026 00:00–00:10 | **OpenCode** | DeepSeek V4.1 Flash Free | Criou o Project #2 (hoje **Game 2D - Aruan**); configurou as Etapas 0–2, issues #1–#9, labels, campos, views, sub-issues e README do board. | <https://github.com/users/victorwilliames/projects/2> |
| 6 | 24/10/2026 00:26 | **OpenCode** | DeepSeek V4.1 Flash Free | Renomeou o board para **Game 2D - Aruan**; adotou **Sprint 1** + Etapas 0–11; criou #10–#20; redistribuiu #4–#9; adicionou travas nativas `blocked by`/`blocking`, status `Bloqueado`, labels e views; criou `docs/aruan-11-etapas.md`; atualizou nomes e hash do servidor; registrou a preferência por headless/mínimo de janelas. | issues #1–#20, Project #2, commit `f1d7da1` |

| 7 | 24/10/2026 | **Codex** | Modelo exato não verificado; troca para Luna informada pelo autor | Verificou permissões de repositório e Project #2, push dry-run e fetch sem novidades; npm test OK. Sem mudança visual ou mutação de cards/issues. | API: admin/push e viewerCanUpdate; base `4cad2d5` |

| Codex-4 | 24/10/2026 | **Codex** | GPT-6 | #4: Auditoria das 8 direções e ajuste de olhos/sobrancelhas/cabelo; capturas 005 antes/depois e primeiro par da progressão. | docs/status-codex.md; capturas/timelapse/ |

| Codex-8 | 24/10/2026 | **Codex** | GPT-6 | #8: Smoke CDP nativo versionado, capturas 006 de campo/estúdio/8 direções e 7 tiras de 6 frames; JPEG real e MIME image/jpeg verificados. | docs/status-codex.md; capturas/timelapse/ |

| Codex-10 | 24/10/2026 | **Codex** | GPT-6 | #10: Baseline consolidada com velocidades, janelas de ataques, evidências 005/006, problemas priorizados e critérios mensuráveis por etapa; #4/#8 concluídas. | docs/status-codex.md; capturas/timelapse/ |

| Codex-11 | 24/10/2026 | **Codex** | GPT-6 | #11: Input com limpeza de foco/aba/ponteiro/pausa/reset, proteção de campos editáveis, fila limitada e diagnóstico; regressão de 8 direções e DOM real do Chrome verde. | docs/status-codex.md; capturas/timelapse/ |

| Codex-7 | 24/10/2026 | **Codex** | GPT-6 | #7: Corrigidos impulso residual no pouso e apoio fora do alcance na reversão; regressão real em 8 direções/bordas: slip ~2e-14, clamp ~1e-14; capturas 007. | docs/status-codex.md; capturas/timelapse/ |

| Codex-12 | 24/10/2026 | **Codex** | GPT-6 | #12: Etapa 3 concluída com #7; aceleração/frenagem distintas, reversão no próximo passo, parada exata; 150ms até 1,31u/s; capturas 008, IK/apoios verdes. | docs/status-codex.md; capturas/timelapse/ |

| Codex-13 | 24/10/2026 | **Codex** | GPT-6 | #13: Câmera com deadzone3px, antecipação de movimento e influência adaptada a telas estreitas; reset estabilizado; matriz 8 bordas×2 viewports×DPR1/2 Node/Chrome verde; capturas009. | docs/status-codex.md; capturas/timelapse/ |

| Codex-6 | 24/10/2026 | **Codex** | GPT-6 | #6: Matriz 3 golpes×8 direções e grades010; corrigido acerto traseiro do finalizador; rastro descendente frontal anotado para Etapa6, sem alegar polimento final. | docs/status-codex.md; capturas/timelapse/ |

| Codex-14 | 24/10/2026 | **Codex** | GPT-6 | #14: Etapa5 concluída com #6; buffer de duas intenções adicionais com direção/expiração, três cliques rápidos=três golpes; dodge cancel após ativo; regressões Node/DOM verdes, capturas011. | docs/status-codex.md; capturas/timelapse/ |

| Codex-15 | 24/10/2026 | **Codex** | GPT-6 | #15: Etapa6: rastro descendente legível sem faixa opaca; efeitos limitados/reset completo e shake respeita movimento reduzido. SHA effects atualizado; custo p95 4,1/4,3ms com pacing (não FPS); capturas012 e progressão002. | docs/status-codex.md; capturas/timelapse/ |

| Codex-5 | 24/10/2026 | **Codex** | GPT-6 | #5: Equipamento apoiado e inclinado fora da cabeça; poses/rota de equipar corrigidas. Clearance do arco e3flechas em5.816amostras; capturas013 e progressão003. #21 criada para hashes em checkout limpo na Etapa10. | docs/status-codex.md; capturas/timelapse/ |

| Codex-16 | 24/10/2026 | **Codex** | GPT-6 | #16: Etapa7 concluída com #5: transições sem giro reverso, entrada/saída de dodge contínuas, giros na antecipação e movimentos secundários/expressão. 9.880poses, apoio em24ataques~1,7e-14; capturas014 e progressão004. | docs/status-codex.md; capturas/timelapse/ |

**Importante:** os commits têm autor humano `Victor Williames`; a ferramenta de IA da sessão 2 não foi registrada em lugar nenhum. Não atribua a Codex, Antigravity ou OpenCode sem evidência. Se a sessão 2 foi sua, corrija esta tabela.

---

## 2. RESUMO EXECUTIVO

- **O que é:** piloto de RPG de ação 2.5D em **Canvas 2D puro**, sem engine, sem WebGL, sem dependências e sem imagens em runtime.
- **Herói:** Aruan, menino arqueiro indígena, desenhado **proceduralmente** (esqueleto 3D invisível + IK + pintura em facetas).
- **Combate:** o arco é usado como **porrete** em um combo de 3 golpes. Não há tiro de flecha.
- **Cenário:** campo de treino isométrico com praça de pedras, ruínas, vegetação e dois bonecos.
- **Sprint atual:** **Sprint 1 — Aruan**. O foco é o personagem: input, locomoção, câmera, combate, impacto, animação, toque e gamepad. A **Etapa 10** é o portão **Aruan 100% polido**; a **Etapa 11** é a personalização/evolução visual, depois da 10.
- **O que ainda não existe:** inimigos com IA, vida/dano, morte, ondas, áudio, menu inicial, save, controles mobile/gamepad implementados, personalização e deploy.

---

## 3. ESTADO ATUAL VERIFICADO

### 3.1 Git
- Branch: `master`.
- Remoto oficial: `origin` → <https://github.com/victorwilliames/game-2d-aruan> (privado).
- Base desta sessão: `91249d4` — board e issues anteriores à Sprint 1.
- Commits desta sessão: **`f1d7da1`** (principal) + commit de registro desta memória.
- Alterações desta sessão:
  - Project #2 renomeado para **Game 2D - Aruan**;
  - **Sprint 1 — Aruan** com Etapas 0–11 (issues #1–#20);
  - dependências nativas `blocked by`/`blocking`, status `Bloqueado`;
  - `docs/aruan-11-etapas.md`, README, AGENTS, `memory-ai.md`, `package.json`, `index.html`, `inspecao.html` e `server.cjs`;
  - capturas 004 de identidade e renomeação dos extratos históricos para `pre-aruan-*`;
  - preferência do autor por **headless e mínimo de janelas** registrada em memória/AGENTS;
  - hash de `server.cjs` atualizado em `docs/aruan-preservacao.json`.
- Ignorados pelo `.gitignore` e presentes só localmente:
  - `referencias/rafaxlab/` (11,3 MB);
  - extratos de mensagens/ações do piloto original em `docs/` (texto/JSON).
- Versionado: `docs/pre-aruan-imagens.json` (catálogo histórico de imagens do piloto original).
- O repositório oficial estava vazio; o histórico completo foi publicado no primeiro push em 23/10/2026. Branch padrão: `master`.
- Estado no fim da sessão: `git status` limpo; `master` rastreando `origin/master`.

### 3.2 Testes (executados em 24/10/2026)
`npm test` → **OK** (Node v24.16.0 / npm 11.13.0).

- `tests/rig.cjs`
  - **5.816** amostras de poses.
  - `maxBoneError` ≈ **7,1e-14**.
  - `maxGripGap` ≈ **2,9e-14**.
  - `maxFootClamp` / `maxStanceSlip` ≈ **2,9e-14**.
  - 80 braços clampeados (limite de alcance esperado).
  - Hashes de `docs/aruan-preservacao.json` conferem.
- `tests/game.cjs`
  - Caminhada ≈ **66,6 u**; corrida ≈ **154,5 u** (corrida > 1,8× caminhada).
  - Cambalhota volta a `move` e limpa `anim.dodge`.
  - Combo por cliques: **3 acertos**, retorno ao idle, `equip` volta a 0.
  - `WorldScene.cacheBuilds === 1`.
  - Estado do rig finito.
  - Novo teste: `keydown` sem `.matches` não lança exceção.

### 3.3 Navegador (smoke real, 24/10/2026)
- `index.html` abriu com o título **Game 2D - Aruan** e `inspecao.html` com o estúdio; console sem erros (só o log “Piloto pronto: Canvas 2D. Cache inicial: 36 ms”).
- **Capturas 004** geradas em Chrome headless 1600×900: `004-game-2d-aruan.jpg` e `004-game-2d-aruan-estudio.jpg`, JPEG real (`FF D8 FF E0`). A identidade **Game 2D - Aruan** aparece no campo e no estúdio.
- A ferramenta de screenshot do navegador embutido falhou por a janela não estar visível; a captura foi feita via Chrome headless. O console foi conferido no navegador embutido.
- **Preferência do autor (24/10/2026):** abrir o mínimo de janelas; usar navegador headless para smoke/capturas. O Chrome visível foi fechado pelo autor, e o agente crítico também foi orientado a usar headless.
- Verificação anterior (23/10/2026): `index.html` carrega sem erros no console.
- Loop rodou de verdade com a aba visível: `Game.frames` avançou.
- Tecla real `KeyD` moveu o jogador ≈ **72,8 u** no tempo medido.
- Cliques reais (`PointerEvent`) encadearam o combo: **3 golpes, 3 acertos**, fim em `move`, arco de volta às costas (simulação avançada em passos manuais de 1/120 s por causa do throttling da automação).
- `Pilot.render()` executou sem exceção; rig finito; 8 árvores; cache = 1.
- `inspecao.html` renderizou **todas as 6 animações**: idle, walk, run, dodge, golpes 0/1/2. Turnaround com 8 direções; close do rosto renderizou.
- DPR do teste: 1,25; canvas do jogo 1250×875; estúdio 859×688 e turnaround 1161×825.
- **Ressalva:** o navegador de automação estrangula `requestAnimationFrame` quando a aba está oculta. `Game.frameMs` (~5–6 ms) é tempo de trabalho auto-medido, **não** é benchmark de FPS. Medir desempenho manualmente numa janela real.

### 3.4 Auditoria estática
- `node --check` em todos os `js/*.js`, testes e servidor: **OK**.
- Todos os `src`/`href` locais de `index.html` e `inspecao.html` existem: **OK**.
- Manifesto do pack: **37/37 assets presentes**, 0 ausentes.
- Nenhum arquivo vazio fora do `.git`.
- Nenhum `TODO/FIXME/HACK` no código.
- Hashes de preservação: **5/5 OK**.
- HTTP local: `index.html`, `inspecao.html`, `turnaround.html`, `README.md`, `memory-ai.md`, capturas `.jpg` e referências `.png` retornam **200** com MIME correto.

### 3.5 GitHub Issues e Projects (Sprint 1)
- Repositório oficial: <https://github.com/victorwilliames/game-2d-aruan> (privado).
- Board oficial: **Game 2D - Aruan** — <https://github.com/users/victorwilliames/projects/2> (Project #2, vinculado ao repositório).
- **Não usar o PlanW (#1):** ele pertence ao repositório `victorwilliames/planw` e é outro produto.
- Nomenclatura: **Sprint** (bloco maior) → **Etapa** (passo) → **Tarefa** (issue filha). Sprint atual: **Sprint 1 — Aruan**.
- **Etapa 0 — Start + Aruan base** (concluída): issues **#1** e **#2** (fechadas, `Concluído`).
- **Sprint 1 — Aruan** — umbrella **#3** (aberta, `A Fazer`), com Etapas 0–11:
  - **#10** Etapa 1 — baseline e diagnóstico — P0 — `A Fazer`; filhas #4 e #8.
  - **#11** Etapa 2 — input mouse + teclado — P0 — `Bloqueado`.
  - **#12** Etapa 3 — locomoção — P0 — `Bloqueado`; filha #7.
  - **#13** Etapa 4 — câmera — P1 — `Bloqueado`.
  - **#14** Etapa 5 — combate/buffer/cancelamento — P0 — `Bloqueado`; filha #6.
  - **#15** Etapa 6 — impacto e feedback visual — P1 — `Bloqueado`.
  - **#16** Etapa 7 — animação profissional — P1 — `Bloqueado`; filha #5.
  - **#17** Etapa 8 — toque mobile — P1 — `Bloqueado`.
  - **#18** Etapa 9 — gamepad Xbox — P1 — `Bloqueado`.
  - **#19** Etapa 10 — certificação Aruan 100% polido — P0 — `Bloqueado`; filha #9.
  - **#20** Etapa 11 — personalização e evolução visual — P2 — `Bloqueado`, depois da Etapa 10.
- Tarefas redistribuídas: **#4/#8** → Etapa 1; **#7** → Etapa 3; **#6** → Etapa 5; **#5** → Etapa 7; **#9** → Etapa 10.
- Campos do Project: `Status` (Backlog, A Fazer, Em Andamento, Em Revisão, Bloqueado, Concluído), `Sprint` (Sprint 1), `Etapa` (0–11) e `Prioridade` (P0–P3).
- Views: apenas **Kanban** e **Tabela**. Não criar novas views sem pedido do autor.
- Labels: `sprint-1`, `etapa`, `pp`, `tarefa`, `epic`, `visual`, `animacao`, `tecnico`.
- **Travas nativas:** cada etapa/tarefa tem `blocked by`/`blocking` nas Relationships do GitHub. Além disso, issue bloqueada fica com `Status = Bloqueado`.
- Regra de uso:
  - Só pegar issue com **todos os blockers fechados** e `Status` diferente de `Bloqueado`.
  - Assumir antes de editar: mover para **Em Andamento** e registrar quem assumiu (assignee ou comentário).
  - Usar **branch/worktree por issue**; não compartilhar a mesma working tree entre agentes.
  - Não editar arquivos de outra issue ativa; combinar antes ou abrir dependência.
  - Ao fechar um blocker, verificar dependentes diretos: se todos fecharam, mover de `Bloqueado` para `A Fazer`.
  - A Etapa 10 só começa com as Etapas 1–9 concluídas; a Etapa 11 só depois da 10.
  - Só mover para **Concluído** após `npm test` + verificação visual.
  - Toda tarefa nova deve entrar no board com `gh project item-add 2 --owner victorwilliames --url <issue>`.
  - `gh issue create --project` falha por causa da depreciação de Projects clássicos; criar a issue e adicionar depois.
- O grafo completo, sugestão de paralelismo e arquivos por área estão em `docs/aruan-11-etapas.md`.
- O board é privado e **não substitui** o `memory-ai.md`.

---

## 4. O QUE JÁ FUNCIONA

- Andar, correr, cambalhota e colisão com borda/props.
- Câmera isométrica elevada acompanhando o herói, com shake e câmera lenta.
- Combo de 3 porretadas com buffer de clique, antecipação, golpe, recuperação, hitstop e rastro.
- Acerto nos bonecos com flash, recuo, faísca, poeira, anel de impacto e “KRAK!”.
- IK de braços/pernas, pé plantado no mundo, empunhadura do arco pela extremidade.
- Arco guardado nas costas que vai para a mão durante o golpe; aljava com 3 flechas sempre nas costas.
- Rosto com faixa vermelha, faixas pretas nas bochechas, olhos, cabelo em painéis e pena.
- Estúdio com 8 direções, timeline, close do rosto, inspeção de ossos/juntas/pés e deslocamento.
- HUD de combo, contador de acertos, botões de debug, pausa, reset e link do estúdio.
- Mundo pintado uma vez em canvas offscreen; só personagem, rastro, vento e efeitos são redesenhados.

---

## 5. LINHA DO TEMPO

### Pré-Aruan — cavaleiro (17–18/10/2026)
- Pedido original: piloto isométrico Canvas 2D, sem imagens, com esqueleto 3D invisível, IK e combo de espada.
- Executado pelo **Claude**, com duas rodadas de um agente crítico.
- Correções históricas: projeção espelhada, capa voando, pés deslizando, rastro degenerado, 23 árvores em vez de 8, ordem de profundidade, tassets etc.
- Limitações aceitas: rastro vertical no finalizador de frente/para longe; cabelo carregado de costas; `file://` não testado.
- Todo o material está em `docs/`, inclusive `revisao-referencia.md` com checklist de 20 pontos.

### Sprint 1 — Aruan (23/10/2026 em diante)
- `20:39` `d49497d`: versiona o piloto existente e as capturas 000.
- `20:46` `20ebb0c`: substitui o cavaleiro por Aruan procedural; cria o estúdio; captura 001.
- `20:52` `2b3fcf6`: corrige rosto/pena e pegada articulada; amplia a regressão para 5.816 poses; capturas 002.
- Depois: capturas 003 (campo e combo), `tests/game.cjs`, pacote de referências e a memória (que nasceu zerada).
- Em 23/10 23:09–23:17: auditoria, memória reconstruída, pequenos fixes e roadmap.
- Em 24/10: board renomeado para **Game 2D - Aruan**; **Sprint 1** com Etapas 0–11; travas nativas de dependência; `docs/aruan-11-etapas.md`; Etapa 11 de personalização.

---

## 6. ARQUITETURA

| Arquivo | Papel |
|---|---|
| `index.html` | Jogo: canvas, HUD, controles. |
| `inspecao.html` | Estúdio: 8 direções, timeline, close, inspeção do rig. |
| `style.css` / `studio.css` | Estilo do jogo / estúdio. |
| `js/math.js` | Vetores, referenciais, easing, RNG, ruído, projeção, câmera. **Hash preservado.** |
| `js/paint.js` | Pinceladas, polígonos, contorno, cel-shading, textura. **Hash preservado.** |
| `js/rig.js` | Corpo, poses, ataques, `solveIK`, `solveRig`, `FootPlant`, `Animator`. |
| `js/character.js` | Corpo, roupa, membros, arco, aljava, `drawSkeleton`. |
| `js/head.js` | Cabeça, rosto, cabelo e pena. |
| `js/world.js` | Campo, praça, props, colisão, oclusão, chão em cache. **Hash preservado.** |
| `js/effects.js` | `SwordTrail`, partículas, impacto, poeira, vento. **Hash preservado.** |
| `js/controls.js` | Teclado/mouse, fila de cliques, movimento isométrico. |
| `js/main.js` | Loop fixo 1/120 s, estados, combo, colisão, câmera, HUD, render. |
| `js/inspection.js` | Loop e desenho do estúdio/turnaround. |
| `server.cjs` | HTTP local sem dependências, `Cache-Control: no-store`. **Hash preservado.** |
| `tests/rig.cjs` | Regressão de IK, arma, apoios, combo e hashes. |
| `tests/game.cjs` | Integração de teclas, corrida, cambalhota, combo e cache. |
| `docs/aruan-preservacao.json` | SHA-256 dos arquivos preservados. |
| `capturas/timelapse/` | Registro visual numerado. |

### Fluxo por quadro
1. `Controls` acumula teclas/cliques.
2. `main.update` resolve `move`/`attack`/`dodge`, movimento, colisão e lunge.
3. `Animator` escolhe a pose; `FootPlant` fixa os pés; `solveRig` resolve o IK.
4. `characterParts` monta facetas e ordena por profundidade de câmera.
5. `render` ordena mundo, props, efeitos, rastro e personagem.
6. Simulação em passo fixo de 1/120 s; render independente do refresh.

### Coordenadas
- Mundo: `x/y` no chão, `z` para cima; unidade ≈ 1 cm.
- Local dos ossos: `x` = frente, `y` = esquerda, `z` = cima.
- Projeção isométrica de 45°, inclinação de 34° (`Cam.sinP`).
- Profundidade sempre por câmera (`proj`), nunca só por Y de tela.

---

## 7. INVARIANTES — NÃO QUEBRAR

1. **Canvas 2D puro**, sem engine, WebGL ou dependências externas.
2. **Passo fixo de 1/120 s**; render separado.
3. **Comprimentos de osso invariantes** no IK (teste falha acima de 1e-6).
4. **Arco pela extremidade**: `bowGrip` coincide com a mão direita (erro < 1e-6). Não mover a pegada para o centro.
5. **Pé de apoio no mundo**, não em coordenada local; levantar antes de reposicionar; sem patinar.
6. **Cache do chão = 1**: não repintar o mundo por quadro.
7. **8 árvores reais** (`oak`/`cypress`), não 23. Não usar `count('tree')`.
8. **Um único arco**: alterna costas ↔ mão via `pose.equip`; aljava e 3 flechas ficam sempre nas costas.
9. **Rosto nunca aparece nas costas**; pena e franja preservam o lado correto.
10. **Rastro separa frente/trás** e mantém largura mínima perpendicular à trajetória.
11. **Arquivos de referência não são runtime**: nenhum PNG é carregado pelo jogo.
12. **Hashes**: alterar `world.js`, `math.js`, `paint.js`, `effects.js` ou `server.cjs` exige atualizar `docs/aruan-preservacao.json` conscientemente.
13. **Determinismo**: nada de `Math.random()` na pintura do mundo; usar RNG com semente. Efeitos podem usar `Math.random()`.

---

## 8. COMO RODAR E TESTAR

```powershell
# na pasta do projeto
npm start                 # http://localhost:5317
npm test                  # rig + integração
node tests/rig.cjs
node tests/game.cjs
```

- Porta padrão 5317; `PORT` sobrescreve.
- `server.cjs` serve só este workspace e desativa cache.
- Testes rodam em Node com DOM/canvas simulados.
- Verificação visual é manual, em `index.html` e `inspecao.html`.

### Controles
- `WASD` / setas: andar.
- `Shift`: correr.
- `Espaço`: cambalhota.
- Clique: atacar/mirar; clicar de novo durante o golpe encadeia.
- `B`: esqueleto; `T`: câmera lenta; `P`: pausa; `R`: reset.
- Link “Estúdio Aruan ↗”: página de inspeção.

### Checklist de sessão (Definition of Done)
- [ ] `npm test` passa antes e depois.
- [ ] `index.html` e `inspecao.html` abrem sem erro de console.
- [ ] Se mudou visual, gerar captura numerada e atualizar `capturas/timelapse/README.md`.
- [ ] Se mudou arquivo preservado, atualizar os hashes.
- [ ] Atualizar este `memory-ai.md` (última sessão + registro de IAs).
- [ ] Commitar com mensagem no padrão `feat:`, `fix:` ou `chore:`.

---

## 9. IDENTIDADE VISUAL DO ARUAN

Referência que prevalece: `referencias/hero-aruan/sprites-2-5d-ref/01_VISTAS/pedacos/referencia_rosto_aruan.png`.

Preservar:
- Cabeça grande, corpo pequeno (chibi), pele acobreada, pés descalços, roupa vermelha simples.
- Olhos estreitos e horizontais.
- Faixa vermelha sobre os olhos; faixas geométricas pretas nas bochechas com chevrons de pele.
- Cabelo preto/castanho muito escuro, franja em blocos, mechas laterais e uma pena azul/ocre.
- Contorno escuro, sombras em blocos, textura pintada discreta (HQ/cel-shading inspirado em Hades 1).
- Câmera elevada: topo da cabeça, ombros e pés visíveis.
- Arco: madeira clara, vermelho gasto no meio, pontas pretas, corda clara grossa com nós.
- Aljava fixa com três flechas; bandoleira cruzando o peito.

Cuidados:
- Não espelhar cegamente equipamento, pena e bandoleira.
- Não reintroduzir a capa do cavaleiro.
- Evitar close que pareça “círculos/cápsulas sobrepostas”: facetas e silhueta precisam de intenção.

---

## 10. MATERIAL DE REFERÊNCIA (fora do runtime)

- `referencias/hero-aruan/concept-art/` — 2 fichas conceituais (3,8 MB).
- `referencias/hero-aruan/sprites-2-5d-ref/` — **37 PNGs** (8 vistas, 2 idle, 4 caminhada, 4 corrida, 9 combate, 4 esquiva, 3 props, 3 efeitos) + 3 imagens auxiliares em `01_VISTAS/pedacos`. ~37,8 MB, 40 PNGs no total.
  - `manifesto_assets.json` — caminhos/dimensões; 37/37 conferem.
  - `CATALOGO.html` — galeria local.
  - `GUIA_PARA_O_CODEX.md` — regras de reconstrução.
  - `CHECKLIST_PACK.md`, `PROMPTS_DA_COMPLEMENTACAO.json`.
  - São poses-chave independentes: não formam rig, animação ou turnaround calibrado.
- `referencias/pesquisas/` — 5 imagens de pesquisa (0,33 MB).
- `referencias/rafaxlab/` — código/conversa históricos (11,3 MB), **ignorado pelo Git**; módulos truncados, não executar como jogo atual.
- `docs/revisao-referencia.md` — checklist histórico de 20 pontos; guia de QA, não aprovação do estado atual.
- Extratos históricos locais em `docs/` — mensagens, ações e imagens do piloto original, ignorados pelo Git.

---

## 11. COMO VAMOS CONTINUAR (direção definida)

> **Decisões do autor em 23–24/10/2026.** O foco é o personagem e suas animações; cenário, arena e novos sistemas ficam para depois.

### Decisões fechadas
1. **Foco atual:** Aruan, rosto, corpo, equipamento, animações e os três inputs. **Não** priorizar cenário/arena por enquanto.
2. **Arco:** continua como **porrete**. Tiro com flecha pode existir no futuro, mas **não no Sprint 1**.
3. **Cenário:** manter o campo de treino como está até nova ordem.
4. **Referências:** `referencias/hero-aruan` e `referencias/pesquisas` entram no Git/GitHub. `referencias/rafaxlab` e os extratos de mensagens/ações em `docs/` continuam fora do Git; o catálogo `docs/pre-aruan-imagens.json` é versionado.
5. **Sincronização:** o repositório oficial é <https://github.com/victorwilliames/game-2d-aruan> (privado). Commitar e enviar para `origin`.
6. **Memória:** o arquivo canônico é `memory-ai.md`.
7. **Nomenclatura:** **Sprint** (bloco) → **Etapa** (passo) → **Tarefa** (issue filha). Sprint atual: **Sprint 1 — Aruan**.
8. **Travas:** cada etapa/tarefa tem `blocked by`/`blocking` nativo no GitHub e `Status = Bloqueado` enquanto houver blocker aberto.
9. **Janelas:** abrir o mínimo possível. Verificação visual e capturas devem usar navegador headless; janela visível só quando indispensável, com aviso e fechamento imediato. O agente crítico também segue essa regra.

### Sprint 1 — Aruan (agora, P0)
Objetivo: chegar à **Etapa 10 — Aruan 100% polido** e, depois, à **Etapa 11 — personalização e evolução visual**.
- **Etapa 1:** baseline e diagnóstico; capturas 005+.
- **Etapa 2:** mouse + teclado com resposta imediata.
- **Etapa 3:** locomoção com peso, pé plantado e dodge.
- **Etapa 4:** câmera e leitura espacial.
- **Etapa 5:** combate, buffer e cancelamento.
- **Etapa 6:** impacto e feedback visual.
- **Etapa 7:** animação profissional e movimentos secundários.
- **Etapa 8:** toque mobile estilo Wild Rift.
- **Etapa 9:** gamepad Xbox e input híbrido.
- **Etapa 10:** certificação Aruan 100% polido.
- **Etapa 11:** painel de personalização (roupas, cabelo, acessórios), inspirado na organização do LPC, mas procedural.
- Grafo completo, dependências e paralelismo: `docs/aruan-11-etapas.md`.

### Depois da Etapa 10 — Mundo e combate (P1)
Objetivo: deixar de ser campo de treino e virar loop de jogo.
- Substituir os bonecos por inimigos simples (idle, perseguir, atacar, levar dano, morrer).
- Vida do jogador, invulnerabilidade curta, knockback, morte/respawn.
- Ondas ou arena com condição de vitória/derrota.
- Medidor de combo/score e feedback de dano.
- Arco continua porrete; tiro fica fora do Sprint 1.

### Depois — Vertical slice (P2)
- Mundo maior, oclusão, câmera e limites.
- Menu inicial, pausa, opções, HUD final.
- Áudio (WebAudio procedural ou assets).
- Progressão/save se o rumo for roguelite (a inspiração declarada é Hades).
- Gamepad e layout mobile já devem estar cobertos pelas Etapas 8 e 9.

### Depois — Produção (P3)
- Build/deploy estático, cache, domínio.
- Performance em DPR 2, telas grandes e máquinas modestas.
- QA cross-browser, acessibilidade, localização, licença.

### Ainda em aberto
- Estrutura de longo prazo (arena de ondas, roguelite ou aventura) — decidir só depois do personagem.
- Se e quando o tiro com arco entra.
- Se a personalização da Etapa 11 será só procedural ou se o autor aprovará spritesheets.
- Licença do projeto.

---

## 12. BACKLOG PRIORIZADO

### Sprint 1 — agora (P0)
- [x] Renomear o board para **Game 2D - Aruan**.
- [x] Consolidar **Sprint 1 — Aruan** e as Etapas 0–11.
- [x] Criar as issues #10–#20 e redistribuir #4–#9.
- [x] Adicionar travas nativas `blocked by`/`blocking` e `Status = Bloqueado`.
- [x] Criar `docs/aruan-11-etapas.md`.
- [ ] Etapa 1 — baseline, capturas 005+ e priorização.
- [ ] Etapa 2 — input mouse + teclado.
- [ ] Etapa 3 — locomoção, pés e dodge.
- [ ] Etapa 4 — câmera.
- [ ] Etapa 5 — combate, buffer e cancelamento.
- [ ] Etapa 6 — impacto visual.
- [ ] Etapa 7 — animação profissional.
- [ ] Etapa 8 — toque mobile.
- [ ] Etapa 9 — gamepad Xbox.
- [ ] Etapa 10 — certificação Aruan 100% polido.
- [ ] Etapa 11 — personalização (P2, depois da 10).
- [ ] Testar `index.html` e `inspecao.html` manualmente numa janela real, DPR 1 e 2.
- [ ] Medir desempenho real (sem automação) e registrar números.
- [ ] Teste de fumaça automatizado do estúdio (`inspection.js`).

### Depois da Etapa 10 (P1)
- [ ] Inimigos com IA simples e vida.
- [ ] Vida/dano/morte/respawn do jogador.
- [ ] Loop de arena/ondas + score.
- [ ] Áudio.

### Depois (P2)
- [ ] Tiro com arco (se aprovado).
- [ ] Menu/título/pausa/opções.
- [ ] Progressão/save.
- [ ] Deploy e QA cross-browser.
- [x] Re-encodar as capturas para PNG real ou renomear para `.jpg` (feito: renomeadas para `.jpg`).

---

## 13. RISCOS E ARMADILHAS CONHECIDAS

1. **Hashes de preservação**: editar `world.js`, `math.js`, `paint.js`, `effects.js` ou `server.cjs` sem atualizar o JSON quebra o teste.
2. **Regressão visual invisível**: os testes não enxergam arte. Sempre olhar as capturas e verificar no navegador, de preferência em modo headless.
3. **Automação de navegador**: `requestAnimationFrame` é estrangulado em aba oculta; `Game.frameMs` não é FPS real.
4. **Capturas**: os arquivos eram **JPEG com extensão `.png`**; em 23/10/2026 foram renomeados para **`.jpg`**, refletindo o formato real. Se novas capturas forem geradas, salvar já com a extensão correta.
5. **Referências grandes**: ~42 MB de `hero-aruan` + `pesquisas` entram no repositório. `rafaxlab` (11,3 MB) fica local. Evitar adicionar mais binários sem necessidade.
6. **Código histórico truncado**: `referencias/rafaxlab` não é executável nem fonte de verdade.
7. **Nomes legados**: `SwordTrail` e `swordDir` vêm do cavaleiro; são internos e inofensivos. Não renomear sem necessidade (um deles está em arquivo preservado).
8. **Texto legado**: “a lâmina desperta” foi corrigido nesta sessão; procurar outras referências ao cavaleiro antes de publicar.
9. **Deriva entre IAs**: cada ferramenta tem contexto próprio. Se não atualizar este arquivo, a próxima sessão vai repetir trabalho ou desfazer decisões.
10. **Memória zerada**: já aconteceu uma vez. Se ocorrer de novo, reconstruir a partir do Git, `docs/` e capturas; não inventar estado.
11. **Dependência ignorada**: começar uma issue com `Status = Bloqueado` ou com blocker aberto quebra a ordem e faz dois agentes mexerem no mesmo arquivo. Sempre conferir as Relationships antes de assumir.
12. **Paralelismo sem isolamento**: dois agentes na mesma working tree se atropelam. Usar branch/worktree por issue e combinar arquivos compartilhados.
13. **Janelas visíveis**: o autor não quer janelas abrindo sozinhas. Preferir navegador headless para smoke e capturas; abrir janela visível só se indispensável, avisar e fechar em seguida. O agente crítico também foi orientado a fazer o mesmo.

---

## 14. REGRAS PARA A PRÓXIMA IA

1. Leia este arquivo inteiro, `docs/aruan-11-etapas.md`, `docs/revisao-referencia.md` e `capturas/timelapse/README.md` antes de mexer no visual.
2. Rode `npm test` antes e depois de qualquer mudança.
3. Não troque arte procedural por sprites PNG nem adicione dependências sem pedido explícito.
4. Não edite arquivos preservados por hash sem atualizar `docs/aruan-preservacao.json`.
5. Preserve a proporção chibi, o rosto, a pena, o arco como porrete e a aljava nas costas.
6. Registre todo marco visual em `capturas/timelapse/` com número sequencial.
7. Atualize o bloco “ÚLTIMA SESSÃO” e o “REGISTRO DE IAs”. Diga o que verificou e o que não verificou.
8. Use mensagens de commit no padrão existente (`feat:`, `fix:`, `chore:`) e descreva a verificação.
9. Se uma decisão for do Victor, pergunte; não invente rumo de produto.
10. Deixe o projeto melhor do que encontrou — mas sem reescrever o que já funciona.
11. Antes de começar, confira `blocked by` e `Status` no board. Se estiver `Bloqueado`, não comece. Assuma a issue e use branch/worktree própria.
12. Ao fechar uma issue, verifique os dependentes diretos e desbloqueie os que não têm mais blockers.
13. **Navegador:** use Chrome/Edge headless para smoke e capturas. Não abra janela visível sem necessidade; se precisar, avise o autor e feche ao terminar. O autor não quer janelas aparecendo durante o trabalho.

---

## 15. CHANGELOG DESTA MEMÓRIA

| Data | Autor | Mudança |
|---|---|---|
| 23/10/2026 (após 20:52) | não registrado | Arquivo criado, mas salvo com **0 byte**. |
| 23/10/2026 23:09 | OpenCode / DeepSeek V4.1 Flash Free | Primeira reconstrução: estado, linha do tempo, arquitetura, invariantes, pendências. |
| 23/10/2026 23:17 | OpenCode / DeepSeek V4.1 Flash Free | Segunda versão: registro de IAs, auditoria profunda, achados de PNG, roadmap por etapas, decisões pendentes, correções e renomeação para `memory-ai.md`. |
| 23/10/2026 23:35 | OpenCode / DeepSeek V4.1 Flash Free | Terceira versão: decisões do autor, organização do repositório, referências versionadas, README/AGENTS, sincronização com o GitHub e registro dos commits. |
| 24/10/2026 00:10 | OpenCode / DeepSeek V4.1 Flash Free | Quarta versão: Project #2, Etapas 0–2, issues #1–#9, labels, campos, views, sub-issues e regras de uso do board. |
| 24/10/2026 00:26 | OpenCode / DeepSeek V4.1 Flash Free | Quinta versão: board **Game 2D - Aruan**, Sprint 1, Etapas 0–11, Etapa 11 de personalização, travas nativas, redistribuição #4–#9, `docs/aruan-11-etapas.md` e a preferência por headless/mínimo de janelas. |

---

**Fim da memória.** Se você chegou até aqui e vai trabalhar no projeto: atualize este arquivo antes de sair.
