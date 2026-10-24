# Sprint2 / Etapa14 — Estúdio pausado econômico

O estúdio repintava o preview e as oito direções em cada requestAnimationFrame mesmo pausado. A regressão nova reproduziu12pinturas em12frames, somando318,8ms de trabalho de pintura naquele ensaio headless. Depois da invalidação, a mesma janela ficou com0pinturas e0ms dentro do painter. O loop leve continua observando DPR; isso não é uma afirmação de CPU total zero nem de FPS de display.

A reprodução continua pintando a cada frame. Pausa, passos, restart, scrub, motion/rate, direção, enquadramento, zoom, ossos/juntas/apoios/deslocamento e aparência atualizam o preview. ResizeObserver acompanha os canvases, resize acompanha a janela, e a troca de DPR é detectada mesmo sem mudança do tamanho CSS. Aparência já usa a atualização imediata do painel. A função renderStudio continua disponível para inspeção/QA e limpa a invalidação quando desenha.

O teste real do navegador verificou15atualizações de controles, reprodução avançando tempo, retorno à pausa estável, três tamanhos e DPR1/2. Mudanças de layout consumiram2pinturas para acomodar o observer; DPR isolado consumiu1; todas assentaram em0pinturas nos5frames seguintes. O caso de DPR isolado usa1600×900 antes/depois para não confundir densidade com resize.

npm test passa com10.552poses, continuidade óptica/expressão, aparência,5hashesLF e151JPEGs/7pares. O smoke focal do estúdio também renderiza3presets×7animações×8direções, JSON e toque em3telas, com campo e estúdio sem erros. Não há captura nova porque não houve mudança visual:019/020 continuam como evidências de arte. A certificação final da Sprint2 registra o checkout limpo e o smoke completo.

Nenhum valor da simulação, rig, pose, catálogo ou material foi alterado. Sem engine, dependência, WebGL ou asset runtime. Hardware físico/FPS de display permanecem limitações explícitas.
