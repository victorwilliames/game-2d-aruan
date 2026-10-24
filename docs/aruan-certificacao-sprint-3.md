# Sprint 3 — Certificação técnica

Base certificada: `ffa1c33`, checkout limpo destacado em clone local próprio, sem instalar dependências. Escopo: junções de pele, campo/estúdio econômicos e recuperação dos buffers. A certificação física de celular/Xbox continua pendente em #17/#18; #19 e #22 conservam seus blockers.

## Evidência

- `npm test`: 10.552 poses; erro máximo de osso 2,14e−14, grip 2,05e−14 e apoio 2,93e−14; integração em agendas 30/60/144, aparência/importação atômica, continuidade e capturas.
- `node tests/preservation.cjs --git`: cinco SHA-256 canônicos LF e blobs de HEAD iguais ao manifesto.
- `npm run test:browser`: Chrome headless, duas páginas, três presets, sete animações e oito direções; teclado/foco, toque CDP em três viewports, API standard de controle simulada, JSON por download/arquivo e persistência.
- Pausa estável: campo e estúdio com zero pinturas em 12 callbacks; controles, Menu por RAF, resize/DPR e movimento reduzido invalidam corretamente. Simulação mantém passo 1/120s.
- Buffers retido/forçado/restaurado com conteúdo RGBA igual dentro da execução; preview/turnaround em DPR1/1,25/2. Perda simulada por apagamento + evento, sem teste de perda física de GPU.
- Pele: tinta interna removida, contorno externo e junção preservados; espaço interno de dobra vazio. Não houve alteração de rig/comprimentos.
- 181 JPEGs técnicos com assinatura e MIME conferidos; 16 JPEGs curados, oito pares, incluindo par008 da Sprint3. Sem nova imagem nesta certificação documental.

Custo de trabalho de pintura desta execução: campo desktop120amostras, mediana8,3ms/p95 11ms; estresse192partículas mediana8,4ms/p95 10,5ms. Mobile40amostras:360×740 mediana8,1/p95 10,4ms, estresse9,3/14,5ms;740×360 mediana8,8/p95 10,5ms, estresse10/14,1ms. Estes valores são trabalho sob Chrome headless com instrumentação, não FPS de display ou benchmark de dispositivo físico. Variações entre execuções não demonstram regressão isoladamente.

## Limites e continuidade

Sem hardware físico, notch real ou sensação dos controles. Nenhuma janela visível aberta. Fontes usam Canvas2D procedural, sem referência PNG em runtime, engine, WebGL, build ou dependência nova. Mundo permanece em cache; equipamento, apoios e passo fixo cobertos pelos testes.

A auditoria ao vivo do Project2 confirmou Sprint/Etapa/Prioridade e relações nativas:36 fechada;35 depende32/36 fechadas;34 aguarda35;29 aguarda suas três etapas. Gates3/17/18/19/22 mantidos. O próximo polimento seguro é a leitura do cabelo: a referência tem mechas largas e contornos discretos, enquanto o render021 ainda mostra nervuras escuras contínuas do topo à franja. Qualquer experimento deve preservar a identidade e ser aceito somente com comparação controlada nas oito direções.

Resultado final do harness: OK; console/rede0erros, referenciaRequests0, jpegMIMEs181, capturesWritten0. Clone permaneceu limpo.
