# Sprint 6 — Certificação da expressão de idle

Base: `3bcb6c5`, cópia limpa destacada. Código em `83c78c6`, evidências e par curado em `d143e5e`. Escopo: piscada procedural curta, continuidade de idle e abertura dos olhos nas transições. Os gates físicos continuam pendentes.

## Verificação

- npm test: 10.552 poses, IK, grip, apoios, integração em agendas de 30/60/144, aparência, continuidade e capturas.
- Cinco hashes SHA-256 canônicos LF e blobs de HEAD preservados; nenhum arquivo protegido foi alterado nesta sprint.
- Animator real: duas piscadas em 9,6 s, pico de fechamento 1, exposição amostrada de 0,2333 s e variação máxima de 0,3208 por passo de 1/120 s. Cinco transições sem salto: três ataques, movimento e esquiva; olhos abertos antes do trecho ativo.
- Canvas real: 144 renders em três presets, oito direções, dois estados de pálpebra e três DPRs. Nenhuma esclera visível no fechamento completo; vistas posteriores idênticas entre aberto/fechado. Campo e estúdio compartilham o momento do fechamento.
- Regressão do rastro: 216 casos mantêm a região central da cabeça intacta e efeitos externos visíveis; transformação, alpha e clip restaurados.
- Chrome headless completo: duas páginas, três presets, sete animações e oito direções; teclado/foco, toque CDP em três layouts, Gamepad API standard simulada, JSON por download/arquivo e persistência.
- Campo e estúdio pausados sem repinturas estáveis; controles/Menu, resize/DPR e retícula respondem. Buffers retido/forçado/restaurado iguais em DPR 1/1,25/2.
- 272 JPEGs técnicos; 22 JPEGs curados em 11 pares. O conjunto 025 contém 31 imagens. O par 011 usa o renderer anterior do checkout 00dfb35 e o atual nos mesmos tempos, pose, câmera e resolução de 1600×900.

A tira facial de seis frames e a sequência idle foram revisadas. A piscada foi mantida por melhorar a naturalidade sem trocar expressão, identidade ou pintura facial. O ciclo de inspeção de 4,8 s contém duas respirações de 2,4 s e uma piscada de 120 ms, mantendo a emenda limpa.

## Limitações

Não certificados: celular/Xbox físicos, notch real, sensação dos controles, perda física de GPU e FPS de display. Nenhuma janela visível foi aberta. A simulação continua em 1/120 s, com IK, grip, apoios, aljava/três flechas e mundo em cache preservados. Sem novas mecânicas, dependências, build, engine, WebGL ou referência PNG em runtime.

Cards #17/#18 em revisão física, #19 bloqueado, #3 em revisão e #22 bloqueado conservam suas relações. Esta certificação técnica não substitui esse aceite.

Trabalho de pintura nesta execução headless, 120 amostras desktop: mediana 8,3 ms/p95 11,2 ms; estresse de 192 partículas, 8,6/10,9 ms. Valores instrumentados e variáveis, sem equivalência a FPS de dispositivo físico.

Resultado final da cópia limpa 3bcb6c5: OK; duas páginas, três presets, sete animações e oito direções; 144 renders de pálpebras e 216 casos de rastro; console/rede sem erros, nenhuma referência PNG em runtime e 272 JPEGs com MIME correto. Nenhuma nova captura nesta rodada.
