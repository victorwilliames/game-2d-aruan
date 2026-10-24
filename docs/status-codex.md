# Status da execução autônoma Codex

As Etapas 1–11 estão concluídas. Movimento, combo, câmera, animação, três inputs e personalização procedural funcionam. A Sprint1 foi concluída; a Sprint2#22 está ativa, com Etapas12–14 e tarefas#24/#26/#28 em cadeia. O trabalho continua no polimento visual e de animação.

Para rodar: `npm start` → http://localhost:5317. Para verificar: `npm test` e `npm run test:browser`. Evidências: 10.552 poses, cinco hashes LF, cópia limpa no portão10, 150 JPEGs técnicos, sete pares curados e zero erro de console/rede no smoke. Consulte [a certificação](aruan-certificacao.md).

Limitações: celular/Xbox físicos, notch real, sensação dos controles e FPS de display não foram verificados. Nenhuma janela visível foi aberta. Não há bug P0/P1 conhecido no ambiente testado.

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

### #14 — 2026-10-24

Etapa5 concluída com #6; buffer de duas intenções adicionais com direção/expiração, três cliques rápidos=três golpes; dodge cancel após ativo; regressões Node/DOM verdes, capturas011.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #15 impacto/rastro: corrigir faixa frontal e preservar leitura do rosto. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #15 — 2026-10-24

Etapa6: rastro descendente legível sem faixa opaca; efeitos limitados/reset completo e shake respeita movimento reduzido. SHA effects atualizado; custo p95 4,1/4,3ms com pacing (não FPS); capturas012 e progressão002.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #5 equipamento: afastar arco/aljava do volume da cabeça e auditar grip. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #5 — 2026-10-24

Equipamento apoiado e inclinado fora da cabeça; poses/rota de equipar corrigidas. Clearance do arco e3flechas em5.816amostras; capturas013 e progressão003. #21 criada para hashes em checkout limpo na Etapa10.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #16: continuidade de dodge/ataque/locomoção e movimentos secundários. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

Commits já enviados nesta execução até a Etapa6: 854d7bf (#4), 7306470 (#8), 0474a04 (#10), b3a2d6d (#11), e5a55ac (#7), 443c432 (#12), 96a13f3 (#13), a1f4707 (#6), db9f7f4 (#14), 6ffce5c (#15).

### #16 — 2026-10-24

Etapa7 concluída com #5: transições sem giro reverso, entrada/saída de dodge contínuas, giros na antecipação e movimentos secundários/expressão. 9.880poses, apoio em24ataques~1,7e-14; capturas014 e progressão004.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #17: joystick flutuante, ataque/dodge multitouch e HUD responsivo. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #17 — 2026-10-24

Etapa8: joystick flutuante analógico, mira por arrasto, combo/dodge multitouch e HUD com safe areas. DOM e multitouch nativo em3viewports verdes;9.880poses; capturas015/progressão005. Sem aparelho físico; reset pausado corrigido.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #18 gamepad Xbox: sticks, botões por borda, desconexão e input híbrido. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #18 — 2026-10-24

Etapa9: Gamepad API standard com sticks analógicos, A/B/Menu/View por borda, foco/neutralização/hot-plug e alternância entre3inputs. Testes Node/Chrome simulados verdes; capturas016. Nenhum Xbox físico validado.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #21 hashes LF em cópia limpa; depois #9 regressão final e #19 portão. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #21 — 2026-10-24

Corrigida regressão em clone novo: manifesto agora descreve os5blobs LF; nenhuma mudança semântica. npm test/9.880poses, modo--git e smoke completo verdes em cópia isolada limpa (eea306b). Conjunto preservado protegido contra remoção.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #9 regressão final: robustez do harness, matriz completa e evidências finais. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #9 — 2026-10-24

Regressão final e clone limpo23fbfe2 verdes:9.880poses,3inputs,teclado/toque nativos,7loops,8direções,cadências30/60/144Hz,acessibilidade e0erros/referências.113JPEGs técnicos e5pares curados; harness isolado/limpo e sem sobrescrita.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #19: consolidar portão técnico com Etapas1–9 e filhas#9/#21 fechadas. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #19 — 2026-10-24

Etapa10: blockers1–9 e filhas#9/#21 fechados ao vivo. npm test9.880poses/5hashes/113JPEGs verde, evidências em clone limpo e capturas017 revisadas. Portão técnico cumprido sem bugP0/P1 conhecido; hardware físico/FPS de display não certificados.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #20: painel e variações procedurais, presets/reset e salvar/carregar JSON. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #20 — 2026-10-24

Personalização procedural: roupa/cabelo/faixa e quatro cores; presets Original/Mata/Terra, random/reset, JSON atômico e persistência opcional. Commit 030a910; npm test10.552poses/5hashes/142JPEGs; Chrome headless3×7×8renders, arquivos JSON e toque3telas sem erros. Capturas018 e par006 revisados; preview visível em landscape.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: Fechar Sprint1#3 após confirmar todas as filhas; criar Sprint2 de polimento seguro. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #3 — 2026-10-24

Sprint1: Etapas0–11 e todas as filhas fechadas ao vivo. Etapa0 mantida; implementação até030a910/checkpointacad83c em origin/master. Testes10.552poses,5hashesLF,142JPEGs/6pares; Chrome headless sem erros, inputs e personalização. Portão e limites documentados; sem validação física/FPS de display.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: Criar Sprint2 e Etapas12–14 para leitura visual, continuidade e custo do estúdio. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #22 — 2026-10-24

Sprint2 criada no Project2:guarda-chuva#22, Etapas12#23/13#25/14#27 e filhas#24/#26/#28, parents e blockers nativos em cadeia. Opções Sprint2/Etapas12–14 preservam as anteriores; labels reutilizadas e nenhuma view nova. Plano em docs/aruan-sprint-2.md; Sprint1 fechada em0f37f50. Sem mudança de runtime neste checkpoint.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #24: pele/mãos/pés/tecido, comparação e marco019. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #24 — 2026-10-24

Pele com contorno castanho leve e extremidades arredondadas; marcas de dedos aderem à superfície/profundidade e pano usa vincos curvos. a7ea846; npm test antes/depois10.552poses,5hashesLF,150JPEGs/7pares. Chrome headless completo e3×7×8renders verdes. Capturas019 revisadas e par007 inicia progressãoSprint2.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #23: consolidar Etapa12 e desbloquear Etapa13#25/filha#26. O commit deste checkpoint é rastreável pelo histórico deste arquivo.

### #23 — 2026-10-24

Etapa12 consolidada após filha#24 fechada; a7ea846/345432b em master, npm test10.552poses e Chrome headless completo verdes. Refinamento das extremidades/tecido,150JPEGs técnicos/7pares. Mesmo rig/grip/apoios e nenhum arquivo preservado alterado. Dependentes#25/#26 serão desbloqueados ao fechar este portão.

Validação: npm test e Chrome headless (jogo/estúdio), sem erros. Sem hardware físico nem benchmark headed. Próximo: #26: auditar continuidade em giros e assentamento dos detalhes. O commit deste checkpoint é rastreável pelo histórico deste arquivo.
