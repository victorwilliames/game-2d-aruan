# Sprint 4 — Cabelo procedural e leitura da identidade

Guarda-chuva #37, blocker técnico #29 fechado. Continuação segura de arte procedural; não certifica os gates físicos pendentes3/17/18/19/22 e não altera suas relações.

| Etapa | Issue | Tarefa | Blockers nativos | Estado inicial |
|---|---|---|---|---|
| 18 — Mechas e continuidade do cabelo | #38 | #39 | Tarefa39 depende29; etapa38 depende29/39 | Tarefa A Fazer, etapa Bloqueada pela filha |
| 19 — Regressão da identidade procedural | #40 | #41 | Tarefa41 depende38; etapa40 depende38/41 | Bloqueada |

Referência estudada: turnaround aprovado do Aruan em referencias/hero-aruan/sprites-2-5d-ref/01_VISTAS/pedacos/referencia_turnaround_aruan.png. A franja tem mechas largas; o render021 mostra nervuras escuras contínuas do topo às pontas. A proposta é reduzir essas linhas mantendo geometria, identidade, face, laterais e pena. Não carregar a imagem em runtime. Não copiar o conceito de arco em disparo como nova mecânica.

Aceitar somente ganho perceptível em comparação controlada nas oito direções, incluindo leitura em tamanho de jogo e presets classic/cropped. Reverter experimento que piore face, silhueta ou profundidade. Se houver marco, captura técnica023+ e par009 antes/depois1600×900 na progressao/sprint-4; sem prints de ajustes intermediários.

Regressão final em três presets, sete animações, oito direções, DPR1/1,25/2 e cópia limpa. npm test antes/depois de head.js, hashes/blobs preservados, console/rede sem erros. Canvas2D, simulação1/120s, IK, grip, apoios, três flechas e mundo em cache permanecem invariantes. Sem dependências, build, engine, WebGL, sprites ou novas mecânicas.

Project2 recebeu a opção Sprint4 e Etapas18/19 preservando IDs das opções anteriores. Issues com labels existentes, Sprint/Etapa/PrioridadeP2, parent e dependências nativas; nenhuma view nova.

## Etapa18 / tarefa39

cdaa265 reduz os sulcos do cabelo mantendo franja, massa e identidade. npm test antes/depois e Chrome headless completo verdes; 211JPEGs técnicos/9pares, par009 daSprint4 e conjunto023 revisados. Sem clipping novo. Estudo posterior: pequena faceta triangular no topo do finalizador já aparece na021, não introduzida nesta mudança. Próxima tarefa41: cópia limpa após38 consolidada.

Etapa18 concluída após filha39 fechada. Próxima tarefa41 para certificar caa1f24 em cópia limpa;40 aguarda38/41. Evidências em aruan-mechas-cabelo.md e conjunto023.

## Etapa19 concluída

Filha41 fechada antes da etapa; blockers38/41 fechados. Cópia limpa9c633c8 aprovada, relatório884c7e5 em aruan-certificacao-sprint-4.md: npm test,5hashesLF/blobs e Chrome headless completo,0erros/referênciasruntime.211JPEGs/9pares preservados. Etapas18/19 tecnicamente concluídas; gates físicos permanecem pendentes.

Sprint4 técnica concluída após38/40 e respectivas filhas39/41. O par009 preserva o antes/depois; certificação limpa em aruan-certificacao-sprint-4.md. Próxima frente: isolar faceta antiga do topo durante finalizador antes de propor correção. Gates físicos Sprint1/2 conservam relações e pendências.
