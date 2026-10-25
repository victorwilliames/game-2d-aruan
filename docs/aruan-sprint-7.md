# Sprint 7 — Coerência dos contornos da identidade

Guarda-chuva #52, blocker técnico #47 fechado. Gates físicos #3/#17/#18/#19/#22 preservados.

| Etapa | Issue | Tarefa | Blockers nativos |
|---|---|---|---|
| 24 — Coerência de tinta na cabeça | #53 | #54 | #54 depende #47; #53 depende #47/#54 |
| 25 — Regressão de contraste e identidade | #55 | #56 | #56 depende #53; #55 depende #53/#56 |

Comparação: o turnaround aprovado usa contorno de pele castanho; o corpo já segue essa leitura desde a Sprint 2, mas mandíbula e orelhas ainda usam preto mais pesado. As mechas laterais/tufos também usam a tinta global, em vez da tinta da paleta de cabelo escolhida pelo usuário.

Proposta: harmonizar a tinta sem alterar geometria, silhueta, expressão, franja ou pena. Comparar em close e tamanho de jogo; manter somente ganho perceptível com leitura preservada. Sem detalhes adicionais. Se não houver ganho, reverter e documentar o ensaio.

Verificar três presets, sete animações, oito direções e DPR 1/1,25/2, incluindo piscada, rastro, transições, inputs e buffers. npm test antes/depois de character/head, hashes LF/blobs e Chrome headless completo; certificação final em cópia limpa. Conjunto026+ e par012 somente se houver marco visual relevante; não registrar ajustes transitórios no curado.

Canvas2D, simulação 1/120 s, IK, grip, apoios, equipamento e cache preservados. Sem mecânica nova, dependência, engine, build, WebGL, referência PNG em runtime ou janela visível. Project2 recebeu Sprint7 e Etapas24/25 preservando IDs, labels existentes, parents e dependências nativas; nenhuma view criada.
