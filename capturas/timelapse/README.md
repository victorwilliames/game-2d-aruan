# Registro visual do desenvolvimento

As capturas 000 são capturas reais já existentes do piloto anterior, feitas antes da troca para Aruan. Não representam o arquivo rig.js atual.

Os próximos registros são numerados e capturados no navegador após cada marco visual. A página do estúdio oferece uma vista fixa para comparação e aproximação do rosto. Datas e commits ficam no histórico Git; as capturas fazem parte dos commits.

| Sprint / Etapa | Registro | Estado |
|---|---|---|
| Sprint 6 / Etapa 22 / #49 | 025-piscada: tira facial, campo, estúdio, 3 presets, 7 sequências, golpes e transições | Piscada120ms/4,8s integrada à pose;144renders de olhos/costas e5transições reais. Ciclo idle do estúdio4,8s contém duas respirações2,4s; par011 curado |
| Sprint 5 / Etapa 20 / #44 | 024-rastro-cabeca: campo, estúdio, 3 presets, 7 sequências, golpes e transições | Exclusão da cabeça também protege contra brilho estreito; regressão real de pixels944→0 no caso frontal,216casos; par010 curado |
| Sprint 4 / Etapa 18 / #39 | 023-mechas: campo, estúdio, 3 presets, 7 sequências, golpes e transições | Cabelo com menos sulcos entre painéis e franja preservada; 30 JPEGs novos, Chrome headless completo sem erros; par009 em progressao/sprint-4 |
| Sprint 3 / Etapa 16 / #33 | 022-pausa-campo-pausa-dpr | Campo pausado0repinturas estáveis; Menu porRAF ativo e retícula conserva200×150CSS emDPR1/2. Registro técnico, sem novo par curado/arte |
| Sprint 3 / Etapa 15 / #31 | 021-juncoes:campo,estudio,3presets,7sequencias,combate e3telas de toque | Tinta interna recortada entre ossos adjacentes, preenchimentos/profundidades separados; Canvas real prova dobra vazia e junção contínua;180JPEGs/8pares curados |
| Sprint 2 / Etapa 13 / #26 | 020-continuidade-giro-sequencia | Seis ângulos controlados sem debug; detalhes surgem gradualmente ao girar, opacidade máxima por grau4→0,54; sem novo par curado para microajuste |
| Sprint 2 / Etapa 12 / #24 | 019-pele-tecido:3grades de aparência,3layouts do painel,preview e campo personalizado | Pele com contorno castanho mais leve, mãos arredondadas, marcas aderentes à superfície e vincos curvos;150JPEGs técnicos e primeiro par daSprint2 |
| Sprint 1 / Etapa 11 / #20 | 018-personalizacao:campo/estudio,3presets,3telas do painel,JSON e campo personalizado | 3×7×8 renders, download/importação/persistência e toque nativo;142JPEGs técnicos,6pares curados;preview fixo durante edição |
| Sprint 1 / Etapa 10 / #9 | 017-regressao:campo,estudio,grades,sequencias,transicoes,controle e3telas de toque | Marco técnico de regressão:113JPEGs/5pares curados,7loops,3inputs,zero erros/referências em runtime |
| Sprint 1 / Etapa 9 / #18 | 016-gamepad-campo, estudio e com-controle | Gamepad API standard simulada no Chrome:8direções/combos/foco/hot-plug/handoff; HUD VIEW/MENU e retícula; sem Xbox físico |
| Sprint 1 / Etapa 8 / #17 | 015-toque-campo, estudio, toque-360x740/740x360/320x568 e toque-tablet | Joystick/mira/combo/dodge multitouch nativo; alvos e três layouts verificados; par curado005 |
| Sprint 1 / Etapa 7 / #16 | 014-animacao-campo, estudio, direcoes, sete sequencias, tres grades de golpes e live-reversal/dodge/cancel | Continuidade, giros na antecipação, rolagem com peso e movimentos secundários;9.880poses e par curado004 |
| Sprint 1 / Etapa 7 / #5 | 013-equipamento-campo, estudio, direcoes, golpe-1/2/3-direcoes, run/dodge/0/2-sequencia | Suporte posterior com clearance; antecipações sem atravessar cabeça; par curado003 |
| Sprint 1 / Etapa 6 / #15 | 012-impacto-campo, estudio e golpe-1/2/3-direcoes | Rastro curto/afilado preserva rosto; efeitos limitados e movimento reduzido; par curado002 |
| Sprint 1 / Etapa 5 / #14 | 011-cancel-campo, estudio e live-cancel | Três intenções rápidas preservadas e cancelamento após ativo; seis frames da transição para dodge |
| Sprint 1 / Etapa 5 / #6 | 010-combo-campo, estudio, direcoes, golpe-1/2/3-direcoes, live-reversal/dodge | 24 contatos direcionais e auditoria dos rastros; finalizador não acerta alvo atrás. Faixa frontal do rastro será refinada na Etapa 6 |
| Sprint 1 / Etapa 4 / #13 | 009-camera-campo, estudio, direcoes, live-reversal e live-dodge | Câmera com deadzone e antecipação pelo movimento; oito bordas em duas resoluções e DPR 1/2 |
| Pré-Aruan / — | piloto-campo / piloto-inspecao | Piloto anterior com cavaleiro; capturas preservadas de 23/10/2026, 01:48 |
| Sprint 1 / Etapa 0 | aruan-primeiro-estudio | Primeira reconstrução procedural do Aruan, com arco e aljava articulados |
| Sprint 1 / Etapa 0 | aruan-rosto / aruan-rig-golpe / aruan-cambalhota | Correção do rosto/pena e da pegada articulada; regressão com 5.816 poses |
| Sprint 1 / Etapa 0 | aruan-campo / aruan-combo-campo | Campo de treino e combo em execução, após o checkpoint de 23/10/2026 |
| Sprint 1 / — | game-2d-aruan / game-2d-aruan-estudio | Identidade **Game 2D - Aruan** no campo e no estúdio; sem mudança de arte |
| Sprint 1 / Etapa 1 / #4 | 005-antes/depois-campo, 005-antes/depois-estudio, 005-antes/depois-direcoes | Auditoria das oito direções; olhos, sobrancelhas e massas do cabelo. JPEG real, headless 1600×900; detalhes em docs/aruan-auditoria-direcoes.md |
| Sprint 1 / Etapa 1 / #8 | 006-baseline-campo, estudio, direcoes e idle/walk/run/dodge/0/1/2-sequencia | Baseline reproduzível; sete tiras de seis frames, 1600×900; JPEG e MIME verificados. Rodar node tests/headless.cjs <sequencia-slug> |
| Sprint 1 / Etapa 3 / #7 | 007-apoios-campo, estudio, direcoes, live-reversal e live-dodge | Pouso sem impulso residual e transferência de apoio antes do limite do IK; tiras live do jogo real em 1600×900 |
| Sprint 1 / Etapa 3 / #12 | 008-resposta-campo, estudio, direcoes, live-reversal e live-dodge | Reversão no próximo passo, frenagem em 150 ms e parada estável; velocidades máximas preservadas |

Observação: as capturas 003 e o teste `tests/game.cjs` foram versionados nos commits `9bd1c73` e `e48f87b`.

Nota técnica: os arquivos desta pasta usam a extensão **`.jpg`** e conteúdo JPEG real (bytes iniciais `FF D8 FF E0`). Em 23/10/2026 as capturas antigas foram renomeadas de `.png` para `.jpg` para corrigir a extensão. Novas capturas devem seguir o mesmo padrão.



