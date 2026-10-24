# Registro visual do desenvolvimento

As capturas 000 são capturas reais já existentes do piloto anterior, feitas antes da troca para Aruan. Não representam o arquivo rig.js atual.

Os próximos registros são numerados e capturados no navegador após cada marco visual. A página do estúdio oferece uma vista fixa para comparação e aproximação do rosto. Datas e commits ficam no histórico Git; as capturas fazem parte dos commits.

| Sprint / Etapa | Registro | Estado |
|---|---|---|
| Pré-Aruan / — | piloto-campo / piloto-inspecao | Piloto anterior com cavaleiro; capturas preservadas de 23/10/2026, 01:48 |
| Sprint 1 / Etapa 0 | aruan-primeiro-estudio | Primeira reconstrução procedural do Aruan, com arco e aljava articulados |
| Sprint 1 / Etapa 0 | aruan-rosto / aruan-rig-golpe / aruan-cambalhota | Correção do rosto/pena e da pegada articulada; regressão com 5.816 poses |
| Sprint 1 / Etapa 0 | aruan-campo / aruan-combo-campo | Campo de treino e combo em execução, após o checkpoint de 23/10/2026 |
| Sprint 1 / — | game-2d-aruan / game-2d-aruan-estudio | Identidade **Game 2D - Aruan** no campo e no estúdio; sem mudança de arte |

Observação: as capturas 003 e o teste `tests/game.cjs` foram versionados nos commits `9bd1c73` e `e48f87b`.

Nota técnica: os arquivos desta pasta usam a extensão **`.jpg`** e conteúdo JPEG real (bytes iniciais `FF D8 FF E0`). Em 23/10/2026 as capturas antigas foram renomeadas de `.png` para `.jpg` para corrigir a extensão. Novas capturas devem seguir o mesmo padrão.

| Sprint 1 / Etapa 1 / #4 | 005-antes/depois-campo, 005-antes/depois-estudio, 005-antes/depois-direcoes | Auditoria das oito direções; olhos, sobrancelhas e massas do cabelo. JPEG real, headless 1600×900; detalhes em docs/aruan-auditoria-direcoes.md |
| Sprint 1 / Etapa 1 / #8 | 006-baseline-campo, estudio, direcoes e idle/walk/run/dodge/0/1/2-sequencia | Baseline reproduzível; sete tiras de seis frames, 1600×900; JPEG e MIME verificados. Rodar node tests/headless.cjs <sequencia-slug> |
| Sprint 1 / Etapa 3 / #7 | 007-apoios-campo, estudio, direcoes, live-reversal e live-dodge | Pouso sem impulso residual e transferência de apoio antes do limite do IK; tiras live do jogo real em 1600×900 |
| Sprint 1 / Etapa 3 / #12 | 008-resposta-campo, estudio, direcoes, live-reversal e live-dodge | Reversão no próximo passo, frenagem em 150 ms e parada estável; velocidades máximas preservadas |
