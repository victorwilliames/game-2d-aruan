# Sprint 2 — Polimento visual e animação

Sprint1 encerrada em0f37f50 após as Etapas0–11. Sprint2#22 mantém Canvas2D, passo1/120s, arte procedural, referências de estudo e todos os invariantes. Sem novas mecânicas ou dependências.

| Etapa | Issue | Tarefa filha | Blocker nativo | Status inicial |
|---|---|---|---|---|
| 12 — Leitura de mãos/pés/tecido | #23 | #24 | Sprint1#3 fechada | A Fazer |
| 13 — Continuidade e movimento secundário | #25 | #26 | Etapa12#23 | Bloqueado |
| 14 — Estúdio econômico e regressão | #27 | #28 | Etapa13#25 | Bloqueado |

As filhas fecham antes dos pais; cada tarefa tem o mesmo blocker da etapa. O Project#2 contém Sprint2 e Etapas12–14 como novas opções, preservando IDs/opções anteriores. Nenhuma view foi criada. Labels existentes foram reutilizadas; o campo Sprint identifica a sprint. A issue guarda-chuva recebe Etapa12 como início do intervalo12–14.

Na comparação com a referência aprovada vista_3_4_frente_oposta.png, as três maiores diferenças abordáveis neste recorte são: divisões duras de volumes nas extremidades, marcas de dedos fora da leitura da superfície e pano com vinco de aparência rígida. A proporção chibi e a silhueta já estabelecidas serão preservadas; não se usará uma pose de referência como gabarito de pixels.

A Etapa12 deve suavizar a leitura de pele/mãos/pés e dobras com ganho perceptível nas oito direções e no campo. A Etapa13 amostra transições rápidas e assentamento de expressão/detalhes; só altera o que tiver descontinuidade observável. A Etapa14 reduz redraws quando o estúdio está pausado, mantendo resposta imediata a controles, aparência, resize e DPR.

Evidências: npm test e Chrome headless, capturas técnicas019+ apenas em marcos visuais, pares curados em capturas/progressao/sprint-2 e tiras de seis frames quando úteis. Não certifica hardware físico ou FPS de display. O board ao vivo é a fonte da verdade para Status/dependências.
