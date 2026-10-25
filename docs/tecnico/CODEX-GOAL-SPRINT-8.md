# GOAL EXECUTÁVEL — CODEX | ARUAN SPRINT 8

Você é o executor técnico do projeto `D:\.GITHUB\games\game-2d-aruan`, repositório `victorwilliames/game-2d-aruan`. **Execute, não fique apenas planejando.** A direção oficial atual é Sprint 8, GOAL #68: overhaul total de game feel do Aruan em movimentação, animações, combate e sistema soulslike funcional. Referência de sensação: *No Rest for the Wicked* e *Dark Souls*, sem copiar assets proprietários.

## Leitura obrigatória ANTES de editar
1. `AGENTS.md`
2. `docs/memory-ai.md` inteiro, principalmente última sessão e governança multiagente.
3. **CONTRATO FONTE INTEGRAL:** `docs/referencias/ARUAN_OVERHAUL_WICKED_ARGON_V3_SOULSLIKE.md` (V3 do autor, as seções 4.6–4.14 e 7A prevalecem onde o material antigo divergir).
4. `docs/sprints/aruan-sprint-8-gameplay-feel.md` e `docs/tecnico/aruan-gameplay-feel-criterios.md`.
5. `docs/aruan-checklist-completo.md`, `docs/roadmap.md`, issues #68–#74, e relacionadas #58/#53/#59/#55/#61/#66/#67/#64.

## Governança GOAL + issues
- Board oficial **Project #2 — Game 2D - Aruan**: https://github.com/users/victorwilliames/projects/2 . NÃO usar PlanW Project #1.
- **Primeiro confira e adicione ao Project #2 os cards #68–#74** se ainda não estiverem associados. Preencha Sprint 8, Etapas 26–31, Prioridade P0/P1, Status e relacionamentos nativos `blocked by` / sub-issues. Não criar view nova, não recriar cards duplicados. Ajuste o status da issue antes de implementar.
- **GOAL #68** é guarda-chuva, não uma tarefa de código. Etapas:
  - #69 Etapa 26 — baseline + contratos de input e ações; iniciar por aqui.
  - #70 Etapa 27 — movimento 360°, sprint, pivôs, quickstep/roll e i-frames.
  - #71 Etapa 28 — combo 3 golpes, buffer/cancel, hitboxes honestas pela ponta do arco.
  - #72 Etapa 29 — stamina, HP/Focus/poise, block direcional, parry, guard break, riposte.
  - #73 Etapa 30 — inimigo treino com 2 ataques telegrafados, reações, dano e recovery.
  - #74 Etapa 31 — animação MovaLab/Registry, blends/apoios, HUD/feedback, QA e aceite.
- Validar dependências reais e conflitos multiagente; pegar **a próxima issue P0 desbloqueada** e marcá-la Em Andamento antes de editar. Não declarar Issue concluída sem testes reais e critérios preenchidos. Uma issue por vez; manter isolamento de worktree/branch temporário se necessário. `master` é principal, integrar seguindo regras do projeto.

## Objetivo de gameplay (não é apenas mostrar clipes)
Mover analógico 360° sem snap da física, andar→correr→sprint, frear/inverter 180°, atacar com três golpes distintos **segurando o arco por uma EXTREMIDADE como porrete**, variar direção e cancelar em dodge/defesa no primeiro cancel point legal. Capturar sempre input durante ataque/roll/hitstop; não fazer `if(isAttacking)return` global. Não deixar um golpe 3 pendente vencer uma esquiva válida nem voltar para idle no meio de combo. Com stamina real e custos corretos, dodge tem i-frames somente na janela, block cobre cone frontal e gasta recurso por impacto (zero drenagem passiva default), parry cedo/tarde falha e no timing abre riposte. Inimigo tem dois telegraphs antes de causar dano, poise, reação e recuperação punível. Hitbox acompanha a ponta do arco; whiff sem dano/hitstop/rumble de acerto. Feedback e HUD mostram recursos REAIS.

## Arquitetura existente: aproveite, não reescreva
- Runtime Canvas 2D puro em `js/main.js`, `js/rig.js`, `js/controls.js`, `js/clip-player.js`, `js/movalab-game.js`; MovaLab offline em `tools/movalab/`.
- Clipes Mixamo já ativados como idle/walk/run na master (verifique estado no HEAD antes de assumir).
- Controller autoritativo de movimento/hit/cancel; clipe apresenta. Input router contínuo, ActionResolver/Timeline por fase + intenção com TTL, tokens por ação para impedir callbacks/hits fantasma. Registro clip→evento→fallback e fontes.
- Preservar passo fixo 1/120 s, IK e osso invariante, pé no mundo, mão na ponta do arco, aljava e 3 flechas, cache do chão, fallback V1 tag `aruan-v1-rig-original`.
- Sem engine, WebGL, Three/FBX no jogo, spritesheets, assets proprietários, download indiscriminado, reescrita de cenário ou nova dependência sem autorização. O inimigo de treino pode ser adicionado no cenário EXISTENTE porque é parte do P0 V3. Sem tiro com arco.
- Conflitos de gamepad atuais: A ataca, B rola no legado; o preset **ARUAN_FLUIDO** do V3 exige A esquiva, X ataca, L3 sprint, LB defesa e LT parry. Preservar legado/remap com migração explícita. Tecla R hoje reset e no V3 serve habilidade: diagnosticar e resolver conflito sem destruir Reset.
- O timebox de 30min no documento V3 é prioridade de vertical slice, NÃO prazo para concluir a Sprint. Se não couber P0 inteiro, fazer corte funcional + reportar pendências, não placeholders.

## GOAL operacional: iterar automaticamente nas issues sem me perguntar a cada passo
1. Audite a issue atual e código real. Leia todo MD e mapeie clips MovaLab reais, formatos/licenças/fallbacks.
2. Antes/depois de mexer em main/rig/controls/character, rodar `npm test`; em MovaLab `npm run test:movalab`; smoke headless `npm run test:browser` nos marcos e capturas conforme `AGENTS.md`. Não abrir Chrome/Edge headed.
3. Implemente o menor corte **jogável**, com casos negativos (miss, parry cedo/tarde, dodge inválido/stamina, input dentro do hitstop), não apenas testes de nome do estado.
4. Atualize checklist da issue, evidências, docs e `docs/memory-ai.md` ao fechar cada entrega. Crie commit descritivo, push seguindo política local, relate hash/CI real. Não mexa em issues ativas de outro agente.
5. Fechou uma issue? Verifique blockers dependentes e avance à próxima etapa P0 desbloqueada no board, conforme as dependências existentes, até esgotar entregas viáveis nesta execução. Nunca fechar GOAL #68 sem aceite do usuário e funcionalidade P0 completa. Se houver limitação, deixe pendência objetiva e o próximo comando de retomada.

## Definição de pronto: teste como jogador
- Percurso real: move→sprint→vira180°→golpe1→golpe2→dodge para trás→ataca na saída→bloqueia golpe frontal→parry no timing→riposte.
- Verificar G01–G18, T01–T20, S21–S29 do MD e separar `pass`, `fail`, `não executado` (com razão). Testes automatizados NÃO substituem aceite visual/jogável. Não certificar rumble/Xbox físico/FPS real se não mediu.
- Relatório factual em `docs/ARUAN_COMBAT_OVERHAUL_REPORT.md`; lista de clips reais/retarget/fallback/proveniência.

**COMECE PELA ISSUE #69, regularize o Project #2 e siga a trilha de dependências. Não faça polimento do cenário, não se perca em documentação interminável e nunca anuncie combate soulslike concluído só porque a animação toca.**
