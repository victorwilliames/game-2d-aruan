# Etapa 7 — Equipamento (#5)

O equipamento anterior entrava no volume da cabeça grande: hastes e aljava apareciam atravessando o cabelo. Aljava agora se apoia mais abaixo nas costas e inclina para trás. O arco guardado acompanha essa inclinação e usa o mesmo suporte posterior. A bandoleira existente continua cruzando o peito e liga ao suporte posterior. Três flechas permanecem sempre na aljava.

A primeira tentativa com todo o suporte muito afastado foi descartada por parecer flutuar. O resultado encosta a base na região lombar e afasta somente a parte superior. A transição de equipar passa lateralmente, com desvio máximo90u e zero no início/fim; quando equipado, a pegada permanece7u da extremidade, coincidente com a mão.

A auditoria geométrica revelou ainda dois problemas de antecipação: primeiro golpe levava o punho perto da cabeça e o finalizador colocava arco/punho dentro dela. Reposicionadas as poses de braço e a inclinação do arco, mantendo ossos, timing, hitTime, avanço e três ataques. Nenhum ataque novo.

## Verificação

- 5.816 poses×amostras existentes: ossos/grip/apoios invariantes, erro máximo~3e-14. São5.816 amostras totais; não multiplicadas novamente por8.
- Clearance do arco inteiro a cada3,5u, inclusive durante equipar/golpes, contra envelope da cabeça(35,43,42); quiver/shaft/tips contra envelope ampliado. Três flechas e frame ortogonal conferidos em todas as amostras.
- npm test verde, incluindo combo rápido/cancelamento,24 contatos e apoio real/bordas.
- Chrome headless: jogo e estúdio sem erros, oito direções e sete animações; capturas013 de idle,run,dodge e antecipações/contatos revisadas. Par curado003 em1600×900.
- Sem hardware físico ou benchmark de display. Movimento secundário e continuidade das transições ficam na etapa-mãe#16.

Achado técnico para certificação: #21 criada no Project#2, filha#19, blockers nativos#17/#18. Quatro hashes antigos correspondem a finais de linha locais mistos e divergem dos blobs LF. effects.js já está canônico emLF desde#15. Não foram normalizados outros arquivos preservados nesta tarefa.
