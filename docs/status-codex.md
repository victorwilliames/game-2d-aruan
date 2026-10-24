# Status da execução autônoma Codex

Como rodar: npm start (http://localhost:5317); testes: npm test. Canvas 2D procedural, passo fixo 1/120 s, sem dependências novas. Etapa 0 permanece concluída. Os checkpoints abaixo registram trabalho verificado; não representam conclusão antecipada da sprint.

### #4 — 2026-10-24

Auditoria das 8 direções e ajuste de olhos/sobrancelhas/cabelo; capturas 005 antes/depois e primeiro par da progressão.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #8, registro técnico reproduzível; depois #10 baseline. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #8 — 2026-10-24

Smoke CDP nativo versionado, capturas 006 de campo/estúdio/8 direções e 7 tiras de 6 frames; JPEG real e MIME image/jpeg verificados.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #10, consolidar diagnóstico e metas mensuráveis. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #10 — 2026-10-24

Baseline consolidada com velocidades, janelas de ataques, evidências 005/006, problemas priorizados e critérios mensuráveis por etapa; #4/#8 concluídas.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #11 input mouse/teclado; foco, cancelamento e diagnóstico. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #11 — 2026-10-24

Input com limpeza de foco/aba/ponteiro/pausa/reset, proteção de campos editáveis, fila limitada e diagnóstico; regressão de 8 direções e DOM real do Chrome verde.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #7 e #12: locomoção, frenagem, reversão e apoios. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #7 — 2026-10-24

Corrigidos impulso residual no pouso e apoio fora do alcance na reversão; regressão real em 8 direções/bordas: slip ~2e-14, clamp ~1e-14; capturas 007.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #12: ajustar resposta de aceleração, frenagem e reversão. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #12 — 2026-10-24

Etapa 3 concluída com #7; aceleração/frenagem distintas, reversão no próximo passo, parada exata; 150ms até 1,31u/s; capturas 008, IK/apoios verdes.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #13 câmera: deadzone, antecipação de movimento, reset e viewports. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #13 — 2026-10-24

Câmera com deadzone3px, antecipação de movimento e influência adaptada a telas estreitas; reset estabilizado; matriz 8 bordas×2 viewports×DPR1/2 Node/Chrome verde; capturas009.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #6 e #14: combo, buffer e cancelamento. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #6 — 2026-10-24

Matriz 3 golpes×8 direções e grades010; corrigido acerto traseiro do finalizador; rastro descendente frontal anotado para Etapa6, sem alegar polimento final.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #14 buffer de intenções e dodge cancel da recuperação. O commit deste checkpoint é rastreável pelo histórico deste arquivo.
