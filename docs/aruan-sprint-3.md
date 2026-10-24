# Sprint3 — Pintura contínua e eficiência do campo

Guarda-chuva#29. Esta é uma frente de polimento seguro independente do aceite físico pendente. O blocker técnico é#27, fechado após npm test, hashes e Chrome headless completos em cópia limpa37dc7e6. Os gates3/17/18/19/22 continuam pendentes, com suas relações intactas; esta sprint não os certifica nem os encerra.

| Etapa | Issue | Filha | Blocker nativo | Status |
|---|---|---|---|---|
| 15 — Pintura contínua dos membros | #30 | #31 | #27 fechada | Concluída |
| 16 — Campo econômico em pausa | #32 | #33 | #30 fechada | A Fazer |
| 17 — Regressão de pintura/eficiência | #34 | #35 | #32 | Bloqueado |

A pintura da pele ainda exibe divisões de volumes com leitura rígida nas junções, enquanto a referência aprovada tem superfícies contínuas. A Etapa15 deve preservar a separação dos segmentos para profundidade e evitar preencher o espaço interno de cotovelos/joelhos dobrados; o rig e os comprimentos não mudam. Experimentos sem ganho visual serão revertidos.

A Etapa16 mede o campo pausado antes de otimizar e preserva polling do gamepad, retícula/ponteiro, debug/reset, aparência, resize/DPR, acessibilidade e retomada. A simulação permanece em1/120s. A Etapa17 verifica o conjunto em3presets/7animações/8direções, com cópia limpa e regressões proporcionais aos riscos observados.

Capturas técnicas021+ somente para mudanças visuais; progressao/sprint-3 recebe par antes/depois1600×900 apenas quando houver marco perceptível. Sem arte externa em runtime, dependências, WebGL, engine, build ou novas mecânicas. Nenhuma janela visível será aberta.

## Etapa15

6841de8/9e96db3 publicados. npm test e Chrome headless completo verdes, pixels provam contorno externo preservado, tinta interna removida, junção preenchida e dobra vazia.180JPEGs/8pares;021 e par008 revisados. Custo de pintura e picos em aruan-juncoes-pele.md, sem FPS físico.
