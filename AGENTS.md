# Instruções para agentes de IA

## Prioridade operacional — Sprint 9 / GOAL #75 (25/10/2026)

O contrato mais recente do autor está integralmente em `docs/sprints/aruan-sprint-9-contrato-autoral.md`. Sprint 9 prevalece sobre prioridades antigas: biblioteca seletiva Mixamo (2.317 movimentos e os 19 personagens escolhidos), RigContract real, Aruan Proxy existente sem Blender, hierarquia completa no Canvas, catálogo MovaLab/DEV e integração gradual à Sprint 8. Preservar mecânicas, cenário, identidade chibi, fallback V1 e gates humanos. #68 fica em revisão humana.

Teto de transferência E novo armazenamento: 10.000.000.000 bytes, com pelo menos 2 GB livres. Dry-run/snapshot/tamanhos antes de baixar; sem packs com skin, vídeos, cópias GLB ou conversão massiva sem piloto. Fontes brutas e credenciais fora do Git. Project #2 com Sprint 9, Etapas 32–39 e relações nativas; não inferir estado a partir de documentos antigos. Ver `docs/sprints/SPRINT-9-RESUME.md` para continuidade.

## 0. PRIORIDADE ABSOLUTA — overhaul de gameplay Sprint 8 (25/10/2026)

Direção mais recente do autor substitui a ordem antiga de Sprint 7/MovaLab para planejar trabalho: GOAL #68, Etapas #69–#74. **Animação, movimentação 360°, controle responsivo e combate soulslike funcional** acima de fidelidade visual, cenário e UI cosmética. Ler `docs/sprints/aruan-sprint-8-gameplay-feel.md` e `docs/tecnico/aruan-gameplay-feel-criterios.md`; fonte detalhada: `ARUAN_OVERHAUL_WICKED_ARGON_V3_SOULSLIKE.md` fornecida pelo autor. Nova autorização inclui um inimigo de treino dentro do campo existente, block/parry/stamina/riposte e HUD ligado à mecânica; **não** autoriza troca de engine, redesign de cenário ou tiro de flecha. Conflito com seções antigas de escopo/prioridade: esta direção mais recente prevalece. Board Project #2: conferir associação dos cards novos e relações antes de executar, sem alegar atualização de campos feita só porque criou a issue. Manter histórico e gates físicos sem encerramento fictício.


Este projeto é usado por várias ferramentas (OpenCode, Codex, Antigravity, Claude etc.). Leia estas regras antes de alterar qualquer coisa.

## 1. Leia a memória primeiro

Abra **`docs/memory-ai.md`** inteiro. Ele contém:

- quem foi a última IA e o que ela fez;
- estado verificado do projeto;
- arquitetura e invariantes;
- decisões já tomadas e decisões pendentes;
- roadmap e backlog.

## 2. Registre sua sessão

Antes de terminar, atualize em `docs/memory-ai.md`:

1. o bloco **“ÚLTIMA SESSÃO”** (data, ferramenta, modelo, o que fez);
2. uma linha no **“REGISTRO DE IAs”** (append-only, nunca apague).

Diga o que verificou e o que **não** conseguiu verificar.

## 3. Rode os testes

```powershell
npm test
```

Antes e depois de mudanças em `rig.js`, `character.js`, `head.js`, `main.js` ou `controls.js`.

## 4. Respeite os invariantes

- Canvas 2D puro; sem engine, WebGL ou dependências novas sem pedido explícito.
- Simulação em passo fixo de 1/120 s.
- IK com comprimentos de osso invariantes.
- Arco segurado pela extremidade; aljava e três flechas sempre nas costas.
- Pé de apoio em coordenadas de mundo, sem patinar.
- Mundo pintado uma vez em cache.
- Nenhum PNG de referência é carregado em runtime.

## 5. Cuidado com os hashes

Estes arquivos são preservados por SHA-256 em `docs/aruan-preservacao.json`:

- `js/world.js`
- `js/math.js`
- `js/paint.js`
- `js/effects.js`
- `server.cjs`

Se precisar alterá-los, mantenha finais de linha **LF**, atualize o JSON conscientemente e rode `npm test`. O manifesto descreve os bytes canônicos do Git, não CRLF locais. Após commit, `node tests/preservation.cjs --git` também confere os blobs de HEAD. Não remova entradas do conjunto preservado.

## 6. Verificação visual

Mudou algo visual? Verifique `index.html` e `inspecao.html`, confira o console e gere uma captura numerada em `capturas/timelapse/`. Atualize a tabela do README do timelapse.

- **NUNCA abra janela visível de navegador.** Use Chrome/Edge exclusivamente headless para smoke e capturas.
- Janela real exige autorização prévia explícita do autor; se autorizada, feche imediatamente após o uso.
- Não use start/open/xdg-open nem automação headed para abrir navegador. Encerre os servidores/processos próprios desnecessários; não mate processos alheios.

## 7. Commits

- Padrão: `feat:`, `fix:`, `chore:`, `docs:`, `test:`.
- Descreva o que foi verificado.
- Não faça commit de segredos.
- `referencias/rafaxlab/` e os extratos históricos locais em `docs/` são ignorados pelo Git.

## 8. GitHub Issues e Projects

- Board oficial: **Game 2D - Aruan** — <https://github.com/users/victorwilliames/projects/2> (Project #2).
- **Não usar o PlanW (#1):** ele é do repositório `victorwilliames/planw`.
- Toda tarefa nova deve virar issue e entrar no Project #2.
- Nomenclatura oficial: **Sprint** (bloco maior) → **Etapa** (passo dentro da sprint) → **Tarefa** (issue filha de uma etapa).
- Sprint1 — Aruan: implementação entregue; aceite físico17/18 em revisão. Sprint2 — Polimento visual e animação: Etapas12–14 tecnicamente entregues; guarda-chuva aguarda o aceite físico deSprint1. Sprint3 — Pintura contínua e eficiência: Etapas15–17, dependência técnica27 já fechada; gates físicos preservados. O portão de qualidade é a **Etapa 10** (Aruan 100% polido); a **Etapa 11** é a personalização, depois da 10.
- Campos do Project: `Status`, `Sprint`, `Etapa` e `Prioridade`.
- Labels: `sprint-1`, `etapa`, `pp`, `tarefa`, `epic`, `visual`, `animacao`, `tecnico`.
- Views permitidas: apenas **Kanban** e **Tabela**. Não criar novas views sem pedido.
- `PP` = **proposta provisória; escopo pode mudar**.

### Trava de dependência (multiagente)

- Cada etapa e tarefa tem relações nativas de **blocked by / blocking** nas Issues do GitHub.
- Só pegar uma issue quando **todos os blockers estiverem fechados** e o `Status` não for `Bloqueado`.
- Antes de editar, mover para `Em Andamento` e registrar quem assumiu (assignee ou comentário).
- Usar **branch/worktree por issue**. Não compartilhar a mesma working tree com outro agente.
- Não editar arquivos de outra issue ativa; se precisar, combinar antes ou abrir uma dependência.
- Ao fechar um blocker, verificar os dependentes diretos: se todos os blockers fecharam, mover de `Bloqueado` para `A Fazer`.
- A Etapa 10 só começa com as Etapas 1–9 concluídas. A Etapa 11 só depois da Etapa 10.
- O grafo completo e a sugestão de paralelismo estão em `docs/roadmap.md` (`docs/sprints/aruan-11-etapas.md`).

### Uso do board

- Atualize o `Status` do card: `Backlog` → `A Fazer` → `Em Andamento` → `Em Revisão` → `Bloqueado` → `Concluído`.
- Só marque `Concluído` após `npm test` + verificação visual.
- Para adicionar uma issue ao board:

```powershell
gh project item-add 2 --owner victorwilliames --url <url-da-issue>
```

- `gh issue create --project` falha por causa da depreciação de Projects clássicos. Crie a issue normalmente e adicione depois.
- Use as **Relationships** da issue para `blocked by`/`blocking`. A CLI local pode ser antiga; nesse caso, use a UI do GitHub ou a API REST de dependências.

## 9. Decisões que são do autor

Não invente rumo de produto. Pergunte antes de:

- adicionar tiro com arco;
- mudar a estrutura de arena/roguelite;
- trocar a arte procedural por sprites/spritesheets ou importar o pack LPC;
- adicionar dependências ou build;
- publicar material histórico/privado.

## 10. Definition of Done

- [ ] `npm test` passa.
- [ ] Páginas abrem sem erro de console (preferencialmente em navegador headless).
- [ ] Captura atualizada, se mudou visual.
- [ ] Hashes atualizados, se mudou arquivo preservado.
- [ ] `docs/memory-ai.md` atualizado.
- [ ] Issue correspondente atualizada no board (status, checklist e dependências).
- [ ] Dependentes diretos verificados: blockers fechados e issues desbloqueadas.
- [ ] Commit criado e enviado ao remoto.

## Revisão física e continuidade do polimento

Hardware físico ausente nesta execução:17/18 ficam Em Revisão, conforme instrução do autor, mesmo com simulação verde. O portão19 e os guarda-chuvas3/22 conservam suas pendências e relações. Não invente certificação física. Melhorias seguras independentes podem usar como blocker o marco técnico27 verificado, mantendo explícito que não encerram os gates físicos.

## Direção atual do autor —24/10/2026

Sprint7 reorganizada: P0 movimentação natural do personagem (#58), P1 repertório/poses (#59) e fidelidade visual estrutural (#56). Não mexer no cenário. Não inflar novas sprints com microajustes; comparação animada em tamanho de jogo é critério de aceite, testes verdes não aprovam arte. Consolidar testes/capturas por marco e evitar repetição sem mudança ou risco novo. Mixamo só pode ser declarado usado após obter/retargetar dados reais; não substituir o renderer ou adicionar dependências sem autorização.

Atualização de prioridade: autor pediu execução visual imediata; #56 agora P0 com blocker técnico47 fechado, independente de53/59. Marco e9b1b49 cobre cabeça/perfil/pena; tarefa continua aberta para volumes do corpo/tecido. Não fechar58/53 para justificar trabalho visual.

## Reorganização oficial — 25/10/2026

### Direção posterior do autor — MovaLab como estúdio principal

Prioridade urgente #67: animação externa natural no jogo, sem polimento de arte nesta entrega. Fluxo no MovaLab: 1 animação/personagem → 2 Canvas → 3 gatilho e conflitos → 4 jogo real. O inspecao.html fica histórico/técnico, fora do fluxo principal; não é necessário passar por ele. O autor autorizou aplicar clipes no jogo por configuração explícita, preservando fallback V1 e sem Three/FBX no gameplay. Modo leve por padrão; melhorias visuais opcionais. 200FPS é meta a medir, não resultado certificado. Ações por tecla inicialmente reproduzem poses: não inventar dano, física de salto ou cadeias de skills.

- **`master` é a única branch principal.** Evitar branches novas; trabalho temporário deve ser integrado e descartado ao final.
- **Aruan V1** está preservado permanentemente pelo commit `1aadd07f4bef562d347f5366b8918f5a1cf559cf` e pela tag anotada `aruan-v1-rig-original`. Não é um ZIP, cópia duplicada nem declaração de jogo finalizado.
- **Aruan V2** é a evolução em desenvolvimento: rig humanoide hierárquico, compatível com retargeting/Mixamo. O jogo ativo continua usando o rig V1 até testes e aprovação visual.
- **MovaLab Procedural** é a ferramenta offline em `tools/movalab/`. Já há catálogo, preview/retarget real, proxy skinned de65ossos, conversão/exportação JSON e playback Canvas experimental opt-in no estúdio. O jogo principal continua V1 e sem dependência3D; a ferramenta não está certificada como1.0. Consulte `docs/aruan-checklist-completo.md` e a última sessão da memória para distinguir o estado atual dos snapshots históricos.
- O PR #62 foi integrado em `master` (`ac8b558`) e os commits `175d220..e2df137` adicionaram o leitor FBX offline. A issue #60 (estrutura MovaLab) foi concluída e a #61 conduz o Rig V2/MovaLab funcional em andamento.
- Preservar Canvas 2D, IK, apoios em mundo, passo 1/120 s, pegada do arco, animações atuais e os arquivos de preservação. Não substituir o renderer ou o rig atual nesta fase.
