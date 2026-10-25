# Aruan — Sprint 1 e as Etapas 0–11

## PRIORIDADE ATUAL — SPRINT 8 GAME FEEL SOULSLIKE (decisão autor, 25/10/2026)

**Esta seção prevalece sobre prioridades anteriores de Sprint 7/MovaLab quando houver conflito de ordem de trabalho.** O autor definiu foco total em animação, movimentação, combate e controle responsivo, com núcleo soulslike verdadeiro inspirado em No Rest for the Wicked e Dark Souls. Não é só revisão visual: i-frames reais, stamina, block direcional, parry, guard break, inimigo telegráfico e riposte fazem parte do P0.

- GOAL: [#68](https://github.com/victorwilliames/game-2d-aruan/issues/68). Execução por etapas: [#69](https://github.com/victorwilliames/game-2d-aruan/issues/69) baseline, [#70](https://github.com/victorwilliames/game-2d-aruan/issues/70) movimento/esquiva, [#71](https://github.com/victorwilliames/game-2d-aruan/issues/71) combo/hitbox, [#72](https://github.com/victorwilliames/game-2d-aruan/issues/72) defesa/parry/recursos, [#73](https://github.com/victorwilliames/game-2d-aruan/issues/73) inimigo, [#74](https://github.com/victorwilliames/game-2d-aruan/issues/74) integração e QA.
- Plano: [docs/sprints/aruan-sprint-8-gameplay-feel.md](sprints/aruan-sprint-8-gameplay-feel.md); critérios [docs/tecnico/aruan-gameplay-feel-criterios.md](tecnico/aruan-gameplay-feel-criterios.md). Contrato fonte enviado pelo autor: `ARUAN_OVERHAUL_WICKED_ARGON_V3_SOULSLIKE.md`, especialmente 4.6–4.14, 6, 7A, 13 e 14.
- Reaproveitar #58/#53, #59/#55, #61/#66/#67 sem duplicar escopo. Sprint 7 (#52) e fidelidade de silhueta (#56) perdem prioridade operacional para o GOAL; não fechar nem apagar pendências. Gates físicos #3/#17/#18/#19/#22 permanecem pendentes.
- Preservar Canvas2D, 1/120s, IK, pé plantado, pegada do arco pela ponta, aljava/três flechas, assets/fallback V1 e mundo em cache. MovaLab e Mixamo via JSON offline, sem Three/FBX no runtime. Inimigo de treino novo no cenário atual é permitido; redesign de mapa, sprites/engine/tiro não.
- Situação factual: plano e issues organizados; **overhaul V3 ainda não implementado**. Uma entrega P0 precisa ser um corte jogável verificado e aceito, não lista de arquivos/critérios verdes. O prazo de 30 minutos no MD é timebox inicial, não prazo garantido.


> **Nomenclatura oficial:** **Sprint** é o bloco maior; **Etapa** é o passo dentro da sprint; **Tarefa** é a issue filha de uma etapa.
> **Sprint 1 — Aruan** é o bloco atual. O portão de qualidade **Aruan 100% polido** é a Etapa 10. A Etapa 11 é a evolução visual, depois desse portão.
> **PP** significa proposta provisória; o escopo pode mudar.

## Objetivo

Levar o Aruan a um nível profissional de **movimento, input, combate, câmera, animação e apresentação**, sem sair do Canvas 2D puro e sem depender de sprites em runtime. Só depois disso o projeto avança para mapa, arena, inimigos e progressão.

## Etapas

| Etapa | Issue | Foco | Bloqueada por | Status |
|---|---|---|---|---|
| 0 | #1, #2 | Start + Aruan base | — | Concluída |
| 1 | #10 | Baseline e diagnóstico | Etapa 0 (concluída) | Concluída |
| 2 | #11 | Input mouse + teclado | Etapa 1 | Concluída |
| 3 | #12 | Locomoção | Etapa 2 | Concluída |
| 4 | #13 | Câmera | Etapas 2 e 3 | Concluída |
| 5 | #14 | Combate: buffer e cancelamento | Etapas 2 e 3 | Concluída |
| 6 | #15 | Impacto e feedback visual | Etapa 5 | Concluída |
| 7 | #16 | Animação profissional | Etapas 3, 5 e 6 | Concluída |
| 8 | #17 | Toque mobile | Etapas 2, 3, 5 e 7 | Em Revisão física |
| 9 | #18 | Gamepad Xbox | Etapas 2, 3, 5 e 7 | Em Revisão física |
| 10 | #19 | Certificação Aruan 100% polido | Etapas 1–9 | Bloqueada pelo aceite físico |
| 11 | #20 | Personalização e evolução visual | Etapa 10 | Concluída |

### Tarefas já existentes

| Tarefa | Issue | Etapa | Bloqueada por | Status |
|---|---|---|---|---|
| Auditar as 8 direções | #4 | 1 | — | Concluída |
| Capturas 005+ | #8 | 1 | #4 | Concluída |
| Pés, cambalhota e borda | #7 | 3 | Etapa 2 (#11) | Concluída |
| 3 golpes × 8 direções | #6 | 5 | Etapas 2 e 3 (#11, #12) | Concluída |
| Arco, aljava e empunhadura | #5 | 7 | Etapas 3, 5 e 6 (#12, #14, #15) | Concluída |
| Regressão final | #9 | 10 | Etapas 8 e 9 (#17, #18) | Concluída |

Tarefa adicional da Etapa10: **#21 — hashes LF em checkout limpo**, concluída; parent e blockers nativos registrados no Project#2.

## Trava de dependência

Cada ligação está registrada nas **Relationships** do GitHub como `blocked by` / `blocking`. Além disso, a issue bloqueada fica com `Status = Bloqueado` no Project #2.

Regras para humanos e agentes:

1. **Só pegar** issue com todos os blockers fechados e `Status` diferente de `Bloqueado`.
2. **Assumir antes de editar:** mover para `Em Andamento` e registrar no comentário/assignee quem está trabalhando.
3. **Uma issue, uma branch/worktree.** Não compartilhar a mesma working tree entre dois agentes.
4. **Não editar arquivos de outra issue ativa.** Se precisar, combine antes ou abra uma dependência.
5. **Ao fechar um blocker:** verificar os dependentes diretos. Se todos os blockers fecharam, mover de `Bloqueado` para `A Fazer`.
6. **Etapa 10** é um portão: não começa enquanto as Etapas 1–9 não estiverem concluídas.
7. **Etapa 11** só começa depois da Etapa 10.

### Sugestão de paralelismo

- Podem rodar em paralelo quando não houver blocker entre si:
  - Etapas 4 (câmera) e 5 (combate), depois das Etapas 2 e 3.
  - Etapas 8 (toque) e 9 (gamepad), depois das Etapas 2, 3, 5 e 7.
- Não podem rodar em paralelo:
  - Etapa 10 com qualquer etapa anterior.
  - Etapa 11 com qualquer etapa anterior.
  - Duas tarefas que tocam o mesmo arquivo sem coordenação.

### Arquivos por área (evitar conflito)

| Área | Arquivos principais |
|---|---|
| Input | `js/controls.js`, `tests/game.cjs` |
| Locomoção/IK | `js/rig.js`, `js/main.js`, `tests/rig.cjs` |
| Câmera | `js/main.js`, `js/math.js` (hash preservado) |
| Combate | `js/main.js`, `js/rig.js`, `js/effects.js` (hash preservado) |
| Impacto | `js/effects.js` (hash preservado), `js/main.js` |
| Animação/visual | `js/rig.js`, `js/character.js`, `js/head.js` |
| Toque | `index.html`, `style.css`, `js/controls.js` |
| Gamepad | `js/controls.js`, `js/main.js` |
| Personalização | novo painel/estúdio, `js/character.js`, `js/head.js` |

> Arquivos com hash preservado exigem atualizar `docs/aruan-preservacao.json` e rodar `npm test`.

## Etapa 11 — Personalização e evolução

A referência de organização é o [Universal LPC Spritesheet Character Generator](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/), mas a proposta inicial é **procedural**:

- painel com preview do Aruan em tempo real;
- roupas, cabelo, pena, faixas, arco, aljava e acessórios;
- paletas, materiais e camadas;
- presets, aleatorizar, reset e salvar/carregar JSON;
- preview nas 8 direções e nas animações.

Importar spritesheets ou trocar a arte procedural por sprites **não** faz parte da proposta; isso é decisão explícita do autor.

## Fora de escopo

- Mapa, arena, inimigos, ondas, progressão e tiro com flecha.
- Engine, WebGL, dependências novas ou build.
- Substituir a arte procedural por sprites sem decisão do autor.
- Publicar material histórico/privado.

## Verificação e limitações

- `npm test` cobre rig, IK, arma, apoios, combo, cache e hashes.
- As capturas 004 registram a identidade **Game 2D - Aruan**; a Etapa 1 recomeça a numeração em 005.
- A verificação visual é manual em `index.html` e `inspecao.html`, preferindo navegador **headless**.
- Regra desta execução: nunca abrir janela visível. Smoke/capturas exclusivamente headless.
- Ainda não há validação em celular físico nem em controle Xbox físico; isso deve ser registrado nas Etapas 8 e 9.
- Headless mede custo de update/render com pacing; não certifica FPS de display ou sensação em hardware físico. Essas limitações ficam documentadas.

## Definition of Done de uma etapa

- [ ] `npm test` passando.
- [ ] `index.html` e `inspecao.html` sem erro de console.
- [ ] Captura atualizada se mudou visual.
- [ ] Hashes atualizados se algum arquivo preservado mudou.
- [ ] Checklist e critérios de aceite da issue atendidos.
- [ ] Dependências fechadas e dependentes desbloqueados.
- [ ] `memory-ai.md` atualizado.
- [ ] Commit enviado ao `origin/master`.

## Links

- Board: <https://github.com/users/victorwilliames/projects/2>
- Sprint 1: #3
- Repositório: <https://github.com/victorwilliames/game-2d-aruan>
- Memória: `memory-ai.md`

## Auditoria de completude física

A implementação e a certificação automatizada passaram; a instrução mais recente exige manter17/18 Em Revisão quando não há hardware. Foram reabertas, com19 Bloqueada eSprint1#3 Em Revisão. Ver docs/aruan-validacao-fisica.md. Etapa0 não foi reaberta; personalização20 segue implementada, sem alegar certificação física.
