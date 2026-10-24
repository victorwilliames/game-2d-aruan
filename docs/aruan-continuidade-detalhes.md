# Sprint2 / Etapa13 — Continuidade dos detalhes

A auditoria percorreu um giro completo de1° em1° com o painter real e registrou a soma de opacidade dos traços de dedos. Antes, o culling booleano fazia quatro traços de pé aparecerem juntos (salto máximo4). Agora a opacidade cresce suavemente com a orientação da superfície; o máximo caiu para0,5404 por grau, redução de86,5%. A leitura frontal continua com soma14 e a face oculta com0: o detalhe não foi removido para passar no teste.

O teste não repete a fórmula de visibilidade: executa characterParts/drawCharacter e observa os strokes do renderer com save/restore de contexto. O limite de regressão é0,65 por grau. A seleção da tinta dos vincos é explícita no teste e deve acompanhar uma mudança consciente de paleta desses traços.

Também foram amostrados corrida, ataque→dodge, retorno ao idle e caminhada em1/120s. A maior mudança por passo foi0,0491 em secondary e0,0440 em effort, sem salto observado; a expressão assentou abaixo de1e-4. Esses tempos/poses não foram alterados. A correção se limita ao aparecimento óptico de detalhes em giros, sem mudar alvo físico, câmera, hitTime ou IK.

A tira020 contém seis ângulos controlados110°–150° para inspeção, com apoios/debug ocultos. Os timestamps indicam amostras nominais de um giro; não alegam uma gravação do input real. É registro técnico, sem novo par curado para este refinamento pequeno. O par007 permanece como marco visual da Sprint2.

npm test inclui tests/continuity.cjs,10.552poses, integração, aparência,5hashesLF e151JPEGs técnicos/7pares. O smoke em Chrome headless verifica campo/estúdio e as sete animações/oito direções. Nenhum PNG de referência em runtime, dependência ou mudança de produto. Hardware físico e FPS de display permanecem não certificados.
