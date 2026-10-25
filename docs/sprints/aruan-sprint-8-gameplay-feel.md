# Sprint 8 — ARUAN: overhaul de animação, combate, movimentação e game feel

> **GOAL oficial em 25/10/2026.** O Aruan agora prioriza jogabilidade e combate soulslike, buscando o peso, fluidez e responsividade de *No Rest for the Wicked*, sem copiar assets. Esta frente **substitui a prioridade operacional anterior** de polimento visual/Sprint 7; não elimina histórico, issues nem gates de hardware.

## Fonte da decisão
`ARUAN_OVERHAUL_WICKED_ARGON_V3_SOULSLIKE.md` enviado pelo autor em 25/10/2026 (V3). É o contrato detalhado: sobretudo seções 4.6–4.14 (controle contínuo/arbitragem), 6 (arco-porrete), 7A (soulslike), 8 (matriz clip), 13 (testes) e 14 (priorização). **O texto de 30 minutos é timebox do primeiro vertical slice, não prazo para finalizar o overhaul.** Preservar a cópia do arquivo original recebida na conversa ao transpor a fonte para o repositório, sem reduzir o sentido do V3.

## Resultado de aceitação
Com controle ou teclado: andar 360°/correr/sprint/inverter direção, atacar com o arco segurado **na ponta**, encadear três golpes distintos, decidir esquivar no segundo golpe e executar no primeiro cancel point legítimo sem esperar o combo todo; defender, aparar no timing, gastar/recuperar stamina e contra-atacar inimigo com dois telegraphs. Movimento e inputs permanecem vivos mesmo durante clips. Hit confirmado tem dano/reação/feedback e hitstop; **whiff não gera impacto falso**. Nunca apresentar estados/recurso/HUD que não funcionem.

## Prioridade e etapas

| Prioridade | Etapa/Issue | Critério mínimo |
|---|---|---|
| P0 | 26 — #69 | baseline + matriz controles/clips + contratos InputRouter/ActionResolver |
| P0 | 27 — #70 | motor 360°, locomotion, pivô, quickstep/roll, i-frames reais |
| P0 | 28 — #71 | combo de 3, hitbox ligada à ponta do arco, cancel e evento de hit |
| P0 | 29 — #72 | HP/stamina/Focus/poise, block direcional, parry justo, guard break/riposte |
| P0 | 30 — #73 | 1 inimigo de treino com 2 ataques, telegraphs, reação e vulnerabilidade |
| P0→P1 | 31 — #74 | registro e integração MovaLab, feedback/HUD, QA e aceite |

**Issue guarda-chuva:** #68; Project oficial: <https://github.com/users/victorwilliames/projects/2>. Reusar e cruzar #58/#53 (locomoção), #59/#55 (movimentos), #61/#66/#67 (rig V2/MovaLab), #64 (preview). Sprint 7 #52 e #56 ficam abertas/históricas mas **não P0**. #17/#18/#19/#3/#22 e revisões artísticas não recebem fechamento automático.

## Contratos de engenharia
1. **InputCapture sempre amostra** sticks, teclado, mouse e botões, mesmo durante ataques/rolagens e hitstop. Ações usam bordas/held/timestamps. Vetor motor é contínuo; intents discretas expiram.
2. **ActionResolver:** validar recurso/contexto → verificar cancel window da fase e ação destino → executar ou bufferizar com TTL → se negar, mostrar motivo. Esquiva pode descartar combo pendente, mas não deve superar death/stagger/lack of stamina. Nunca `if(isAttacking)return` global.
3. **Gameplay é autoridade, clipe apresenta:** action timelines com startup/active/recovery, hitbox/invuln windows, `actionInstanceId` e cleanup atômico. Blends sem `idle` intermediário nem root motion duplo.
4. **Combate verdadeiro:** 3 golpes diferentes (de cima, revés, finalizador), arma segura na extremidade, dano único por alvo/swing com hitbox seguindo trajetória da ponta; miss sem hitstop de impacto. Dodge com i-frames APENAS na janela. Block cone frontal e stamina gasta por hit (dreno passivo zero default); parry cedo/tarde falha e é punido; riposte contextual.
5. **Controle:** preset ARUAN_FLUIDO default (Xbox A dodge, X attack, L3 sprint, LB guard, LT parry; Space dodge, mouse-esq attack, Shift sprint, Q parry) e WICKED_CLASSIC opcional A tap/hold. **Conferir conflito de KeyR reset com runa** e preservar legacy/alternância. MovaLab oferece bindings configuráveis; não sobrepor silenciosamente.
6. **Testabilidade:** um inimigo com slash e overhead distintos, windup/active/recovery, hit reaction, poise, HP e morte, sem IA lendo botões. Matriz G01–G18/T01–T20/S21–S29, com pass/fail/não testado.
7. **Identidade:** Canvas2D puro, simulação 1/120s, IK/comprimentos, pé no mundo, arco de porrete na ponta, aljava e 3 flechas, renderer e cache, personagem chibi, fallback V1 tag `aruan-v1-rig-original`, converter Mixamo via MovaLab JSON OFFLINE; sem engine, Three/FBX no jogo, sprite novo, assets proprietários ou dependência nova sem autorização.
8. **Escopo ambiental:** não refazer cenário/arena. Adaptação de boneco ou um inimigo de treino original dentro do campo existente é autorizada pela V3. Travessia, jumps contextuais, novas armas, backstab e vários inimigos são P2.

## Checklists por marco
- [ ] Baseline concreta, aliases, conflitos e inventário de clipes/licenças.
- [ ] Controle contínuo + buffer/cancel/motor com telemetria de latência.
- [ ] Andar, correr, sprint, direção 90/180°, 2 esquivas com i-frames e colisão.
- [ ] Três ataques diferentes, golpe no vazio e acerto, hitbox honesta, interrupção de combo.
- [ ] Stamina, HP, poise, block cone, guard break, parry e riposte funcionais.
- [ ] Inimigo com 2 telegraphs e morte/recovery/punição.
- [ ] MovaLab→gameplayer, anim registry, fallback seguro, foot-lock/blends, áudio/haptics opcionais.
- [ ] HUD alimentado por recursos reais, debug do ciclo input→ação e motivo de recusa.
- [ ] Suítes npm + MovaLab + headless com provas positivas e negativas.
- [ ] Aceite visual/jogável do autor em tamanho de jogo e, separadamente, hardware físico.

## Execução pelo Codex
Escolher a **próxima issue P0 desbloqueada** no Project #2; marcar Em Andamento e assumir; trabalhar em isolamento para não colidir com outros agentes; mexer no runtime apenas depois da baseline. Fazer um único corte vertical jogável por vez, testes antes/depois (`npm test`, `npm run test:movalab` se tocar MovaLab, `npm run test:browser`), captura headless se visual, atualizar `docs/memory-ai.md` e issue, fazer commit/push em `master` segundo `AGENTS.md`. Registrar números medidos, não alegar 200FPS/60FPS/hardware certificado automaticamente. Não fechar P0 sem gameplay funcionando; evitar micro-sprints, docs repetidos e abstração não executada.
