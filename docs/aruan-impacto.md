# Etapa 6 — Impacto e leitura (#15)

Rastro agora dura 120ms (antes170) e começa na metade externa do arco. Projeções com largura inferior a5u usam brilho afilado, evitando a faixa vertical opaca. O passe frontal preserva uma região de leitura da cabeça; os segmentos ainda alternam frente/trás por profundidade. As grades012 dos três golpes foram comparadas com010 nas oito direções. O descendente permanece forte pelo anel, rachaduras, KRAK, hitstop65ms e shake6; os outros mantêm hitstop40ms e shake3. Movimento reduzido do sistema desliga shake, inclusive se alterado durante a sessão.

Efeitos limitados:192 partículas,8 anéis e8 palavras. Reset limpa as três coleções (antes deixava anéis/palavras vivos). Teste de estresse com100 impactos confirma os limites. O mundo continua pintado uma vez; nenhum PNG entra no runtime. effects.js foi alterado conscientemente e normalizado para LF antes de atualizar seu SHA-256 no manifesto. Outros arquivos preservados não foram editados.

## Evidências

- npm test verde:5.816 poses, IK/grip/apoios,24 golpes direcionais, combo rápido/cancel e testes de limites/reset/movimento reduzido.
- Chrome headless: index/inspecao sem erros, oito direções e sete animações; câmera em duas resoluções/DPR1/2.
- Custo controlado de update+render no Chrome headless1600×900,DPR1,120 amostras após30 de aquecimento, espaçadas por requestAnimationFrame: baseline mediana3,1ms/p954,1ms;192 partículas mediana3,5ms/p954,3ms. É custo do trabalho, não FPS de display ou certificação em hardware móvel. O laço sem pacing gerava backpressure com picos~400ms e foi descartado como método de comparação.
- Capturas012 técnicas e par curado002 de progressão,1600×900. Sem benchmark headed nem validação física.
