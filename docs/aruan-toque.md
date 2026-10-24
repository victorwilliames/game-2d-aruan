# Etapa 8 — Toque (#17)

Joystick flutuante à esquerda, deadzone15%, oito direções e força analógica. A velocidade passa continuamente de andar para correr na região externa do joystick; não há degrau de velocidade. À direita, ataque80px e dodge60px. Ataque dispara ao soltar: um toque segue a última direção; arrastar define a mira antes de soltar. Três toques preservam três intenções do mesmo combo. Dodge responde ao pressionar, usando a direção do joystick.

Ponteiros independentes e captura permitem mover/atacar juntos; cancelar um dedo não solta o outro. Blur, ocultar documento, pausa e reset limpam ações. Teclado/mouse retomam sem manter joystick preso; mouse e teclado compartilham a mesma família para permitir mirar enquanto anda. Cliques secundários são ignorados. Botões também aceitam ativação de teclado. HUD usa safe-area-inset e viewport-fit=cover; touch-action/overscroll bloqueiam scroll/zoom/seleção acidental apenas na página do jogo. Instruções mudam para toque.

A captura revelou um bug anterior: reset durante pausa deixava o rig desenhado na posição antiga até a simulação avançar. Reset agora recalcula o rig imediatamente, com teste de regressão.

## Evidências

- npm test verde:9.880 poses mais integração de joystick/deadzone, mira, multitouch, cancelamento, troca de input, pausa e velocidade analógica contínua.
- DOM real: toque sozinho move, acerta o combo3 vezes e esquiva; layout e alvos>=48px, sem scroll. Viewports360×740(DPR2),740×360(DPR2),320×568(DPR1).
- Multitouch nativo CDP nas três telas: segurar joystick, pressionar/arrastar/soltar ataque mantendo o primeiro dedo ativo. A primeira falha era do protocolo de teste encerrando o dedo errado, não foi contornada retirando a verificação.
- Custo de update+render por viewport,40 amostras após10 de aquecimento com pacing: baseline mediana3,0–3,2ms/p953,8–4,0ms;192partículas mediana3,2–3,4ms/p954,2–4,7ms. Não éFPS de display ou medida em celular físico.
- Chrome headless: jogo/estúdio sem erros,7loops e câmera/DPR verdes. Capturas015 técnicas e par curado0051600×900.
- Celular físico, notch real e sensação dos gestos não foram verificados. Vibração opcional não foi ativada. Os critérios da issue permitem registrar a ausência do aparelho físico; não se declara certificação física.
