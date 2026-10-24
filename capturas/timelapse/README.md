# Registro visual do desenvolvimento

As capturas 000 são capturas reais já existentes do piloto anterior, feitas antes da troca para Aruan. Não representam o arquivo rig.js atual.

Os próximos registros são numerados e capturados no navegador após cada marco visual. A página do estúdio oferece uma vista fixa para comparação e aproximação do rosto. Datas e commits ficam no histórico Git; as capturas fazem parte dos commits.

| Etapa | Registro | Estado |
|---|---|---|
| 000 | piloto-campo / piloto-inspecao | Piloto anterior com cavaleiro; capturas preservadas de 23/10/2026, 01:48 |
| 001 | aruan-primeiro-estudio | Primeira reconstrução procedural do Aruan, com arco e aljava articulados |
| 002 | aruan-rosto / aruan-rig-golpe / aruan-cambalhota | Correção do rosto/pena e da pegada articulada; regressão com 5.816 poses |
| 003 | aruan-campo / aruan-combo-campo | Campo de treino e combo em execução, após o checkpoint de 23/10/2026 |

Observação: os arquivos 003 e o teste `tests/game.cjs` foram produzidos depois do commit `2b3fcf6` e ainda não estavam versionados quando este registro foi atualizado.

Nota técnica: os arquivos desta pasta usam a extensão **`.jpg`** e conteúdo JPEG real (bytes iniciais `FF D8 FF E0`). Em 23/10/2026 as capturas antigas foram renomeadas de `.png` para `.jpg` para corrigir a extensão. Novas capturas devem seguir o mesmo padrão.

