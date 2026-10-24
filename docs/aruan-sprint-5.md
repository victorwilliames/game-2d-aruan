# Sprint 5 — Profundidade da cabeça em combate

Guarda-chuva42, blocker técnico37 fechado. Gates físicos3/17/18/19/22 preservados. Nenhuma mecânica, dependência, engine, build, WebGL ou asset externo em runtime.

| Etapa | Issue | Tarefa | Blockers nativos |
|---|---|---|---|
| 20 — Profundidade da cabeça no finalizador | #43 | #44 | 44 depende37;43 depende37/44 |
| 21 — Regressão da profundidade em poses | #45 | #46 | 46 depende43;45 depende43/46 |

A pequena faceta clara no topo do cabelo durante finalizador frontal já aparece nas capturas021 e023. A causa ainda não foi atribuída: isolar cabeça, personagem sem rastro e personagem completo na mesma pose antes de editar. Corrigir somente um defeito demonstrado, sem hull sobre a face ou ocultação arbitrária de equipamento/camadas.

Critérios: ganho observável em comparação controlada, face/franja/pena/equipamento legíveis em oito direções, sem alteração de rig/IK/grip/apoios/1/120s/cache. Reverter experimento sem ganho. Conjunto024+ técnico e par010curado1600×900 somente se houver marco perceptível; sem imagens transitórias no histórico curado.

Regressão final: três presets, sete animações, oito direções, DPR1/1,25/2, cópia limpa, npm test antes/depois dos módulos indicados, cinco hashesLF/blobs e Chrome headless completo. Nenhuma janela visível. Sem alegar hardware físico, notch real, sensação de controles ou FPS de display.

Project2 recebeu Sprint5 e Etapas20/21 preservando IDs anteriores, labels existentes, parents e blockedBy/blocking nativos. Nenhuma view criada. Etapas43/45 ficam Bloqueadas até suas filhas fecharem; tarefa44 é a próxima A Fazer.
