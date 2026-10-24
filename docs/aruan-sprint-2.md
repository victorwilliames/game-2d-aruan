# Sprint 2 — Polimento visual e animação

Sprint1 inicialmente encerrada em0f37f50 após a implementação0–11; a auditoria posterior reabriu o aceite físico17/18/19/#3 (ver aruan-validacao-fisica.md). Sprint2#22 mantém Canvas2D, passo1/120s, arte procedural, referências de estudo e todos os invariantes. Sem novas mecânicas ou dependências.

| Etapa | Issue | Tarefa filha | Blocker nativo | Status |
|---|---|---|---|---|
| 12 — Leitura de mãos/pés/tecido | #23 | #24 | Sprint1#3 fechada | Concluída |
| 13 — Continuidade e movimento secundário | #25 | #26 | Etapa12#23 fechada | Concluída |
| 14 — Estúdio econômico e regressão | #27 | #28 | Etapa13#25 fechada | Concluída |

As filhas fecham antes dos pais; cada tarefa tem o mesmo blocker da etapa. O Project#2 contém Sprint2 e Etapas12–14 como novas opções, preservando IDs/opções anteriores. Nenhuma view foi criada. Labels existentes foram reutilizadas; o campo Sprint identifica a sprint. A issue guarda-chuva recebe Etapa12 como início do intervalo12–14.

Na comparação com a referência aprovada vista_3_4_frente_oposta.png, as três maiores diferenças abordáveis neste recorte são: divisões duras de volumes nas extremidades, marcas de dedos fora da leitura da superfície e pano com vinco de aparência rígida. A proporção chibi e a silhueta já estabelecidas serão preservadas; não se usará uma pose de referência como gabarito de pixels.

A Etapa12 deve suavizar a leitura de pele/mãos/pés e dobras com ganho perceptível nas oito direções e no campo. A Etapa13 amostra transições rápidas e assentamento de expressão/detalhes; só altera o que tiver descontinuidade observável. A Etapa14 reduz redraws quando o estúdio está pausado, mantendo resposta imediata a controles, aparência, resize e DPR.

Evidências: npm test e Chrome headless, capturas técnicas019+ apenas em marcos visuais, pares curados em capturas/progressao/sprint-2 e tiras de seis frames quando úteis. Não certifica hardware físico ou FPS de display. O board ao vivo é a fonte da verdade para Status/dependências.

## Checkpoint da Etapa12

Filha#24 concluída em a7ea846; documentação345432b. npm test antes/depois10.552poses e Chrome headless completo verdes. Capturas019 e par007 daSprint2 revisados. Nenhum hash preservado mudou; hardware físico/FPS de display não certificados.

## Checkpoint da Etapa13

Filha#26 concluída em a11db2c/checkpoint9d11139. Salto de opacidade por grau4→0,54; secundários/expressão sem descontinuidade observada em1/120s. npm test e Chrome headless completo verdes. Tira020 de seis ângulos controlados; nenhum novo par curado para refinamento pequeno.

## Checkpoint da tarefa28 e revisão física

37dc7e6/0ea6832 publicados. Cópia limpa37dc: npm test,5hashesLF+blobsHEAD e Chrome headless completo verdes; estúdio pausado12→0repinturas estáveis,15controles e resize/DPR.28 fechada;27 deve consolidar.22 está Bloqueada pelo aceite físico de3, sem remover relações nativas. O código continua disponível para polimento seguro.

## Etapa14 / revisão da Sprint2

Etapas12–14 e filhas24/26/28 tecnicamente concluídas;37dc7e6 testado em cópia limpa e publicado. Sem novas capturas para a otimização não visual. O guarda-chuva22 permanece Bloqueado pelo aceite físico de3: nenhum blocker nativo foi removido. Novas melhorias seguras podem depender do marco técnico27, sem presumir o aceite físico pendente.
