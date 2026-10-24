# Etapa 3 — Locomoção e apoios

## #7 — Pés, pouso e borda

A nova regressão percorre oito direções com corrida, reversão, parada, dodge e borda, inspecionando o pé resolvido no jogo real. Ela encontrou dois defeitos ausentes no teste de poses isoladas:

1. Ao encerrar dodge, o mesmo passo executava move e transformava o deslocamento da esquiva em velocidade residual. Corrigido: o último passo de dodge não executa deslocamento de move. Sem comando segurado, pousa e fica parado.
2. Em reversão, o apoio podia ultrapassar o alcance das pernas antes de a transferência começar. Erros observados: 1,94 u de deslizamento e 6,49 u de clamp. FootPlant agora mede quadril-pé, inicia swing antes de atingir o alcance e atualiza o destino durante a transferência aérea de 80 ms. Apoio em chão permanece fixo em coordenadas de mundo; nenhum comprimento de osso mudou.

Resultado: maxLiveSlip ≈2,01e-14; maxLiveClamp ≈1,07e-14. 5.816 poses e integração continuam verdes, incluindo pouso, oito bordas, combo e cache=1. Capturas técnicas 007: campo, estúdio, direções e seis frames do jogo real em reversão/dodge; sem marco curado extra para correção localizada. Chrome headless sem erros; capturas revisadas. Não foi validado hardware físico ou FPS de display.

As tiras live usam o jogo e FootPlant efetivos; as tiras do estúdio são poses independentes e não demonstram apoio em coordenadas de mundo.
