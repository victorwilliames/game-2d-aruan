# Sprint3 / Etapa17 — Buffers pausados e restauração

A regressão reproduziu um preview apagado após clearRect + contextrestored: o estúdio pausado fez0redraws e permaneceu com o hash do buffer vazio. Campo já tinha o listener da33; os dois canvases do estúdio agora também invalidam ao receber o evento. A comparação observa RGBA real, sem consultar o flag interno de cache.

Um segundo caso apareceu emDPR1,25: preview retido e repintura forçada tinham hashes distintos, embora tempo/pose/configuração fossem iguais. O estúdio agora limpa todo o bitmap em coordenadas de dispositivo, com transformação identidade, antes de reaplicar DPR e desenhar. Isso inclui os pixels de arredondamento do tamanho CSS; o turnaround segue a mesma regra. Não alterou desenho, rig, poses, catálogo ou simulação.

| Caso | Resultado |
|---|---|
| Campo retido / forçado | HashRGBA igual na mesma execução |
| Retícula movida / retirada | Pixels mudam ao mover e voltam ao quadro base ao sair |
| Campo apagado + evento | Quadro base recuperado; depois0redraws estáveis |
| Preview e turnaround apagados + evento | Ambos recuperam o quadro base; depois0redraws estáveis |
| EstúdioDPR1 /1,25 /2 | Retido, forçado e restaurado com os mesmos hashes por execução |

Os hashes de comparação não são snapshots portáveis de arte nem substituem os5SHA-256 de preservação. Eles podem mudar com fontes/arte; o requisito é a equivalência dentro da mesma execução. A perda foi simulada apagando o buffer e disparando evento; não se alega teste de perda física deGPU, celular ou Xbox.

O harness mantém leitura extensa de pixels depois das amostras de timing do campo, para não misturar deliberadamente o custo/alocação do readback com o ensaio de pintura. Contagens de redraw e contratos de conteúdo são testes separados. O foco pode ser repetido com node tests/headless.cjs --smoke --recovery-only.

npm test passou:10.552poses, integração, aparência, continuidade e5hashesLF. Chrome headless focal/completo passou: duas páginas, três presets, sete animações, oito direções, inputs, JSON, buffers e console/rede sem erros; nenhuma referênciaPNG em runtime.181JPEGs/8pares preservados, sem nova captura por não haver marco de arte. Os gates físicos3/17/18/19/22 continuam pendentes; esta tarefa é estabilidade de software.
