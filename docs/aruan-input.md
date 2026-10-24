# Etapa 2 — Input teclado/mouse (#11)

- WASD/setas preservam oito direções normalizadas e projeção isométrica. Eventos entram no próximo passo fixo (8,333 ms de simulação, sem alegação de latência física).
- Blur, ocultar documento e pointercancel limpam teclas, cliques, retícula e intenção pendente. Sair do canvas esconde a retícula; não cancela teclado legitimamente segurado.
- Pausar/resumir limpa intenções e suspende movimento/ataque/dodge; atalhos de pausa continuam disponíveis. Reset também limpa input.
- input/select/button/textarea/contenteditable recebem teclado sem movimentar o herói. Repeat não dispara ações repetidas. Clique secundário é ignorado, context menu bloqueado.
- Fila limitada a 16 eventos como proteção contra acúmulo; a semântica de encadeamento continua para #14 (o booleano de intenção existente ainda colapsa spam). Ações durante dodge continuam bloqueadas nesta etapa.
- Debug mostra origem, vetor, fila e idade do último evento. Sem API externa ou assets.

Verificação: npm test cobre direções, oposição, campo editável, blur, documento oculto, pointercancel, limite da fila, pausa e o combo existente. tests/browser-input.js repete casos no DOM real, confirma mira/projeção e ataque após um passo. Chrome headless: jogo/estúdio, oito direções/sete animações sem erros. Sem janela real nem hardware físico; transições visuais mais amplas pertencem às próximas etapas. Não foi criado marco de progressão para mudança de input.
