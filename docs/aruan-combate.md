# Etapa 5 — Combate

## #6 — Três golpes × oito direções

Adicionada matriz de 24 golpes: cada golpe acerta o alvo frontal exatamente uma vez e retorna ao idle com arco nas costas. O teste também detectou que o disco de impacto do finalizador incluía um alvo a 20u atrás do herói. Corrigido com restrição ao semiplano frontal, sem trocar raio, timing ou criar ataque novo.

Grades 010-combo-golpe-1/2/3-direcoes incluem amostras temporais reais do SwordTrail, com desenho dividido frente/trás. Os planos horizontal, revés e descendente são distintos; empunhadura e aljava permanecem presentes. O pintor de efeitos é carregado pelo teste no estúdio apenas para QA; a página de produto não foi alterada.

Achado para a Etapa6: o descendente de frente/costas ainda comprime o rastro em uma faixa vertical que pode cruzar o rosto. O rastro está ancorado ao golpe, mas precisa de ajuste de duração/largura e oclusão nessa projeção. Não é tratado como aprovação final de polimento.

npm test verde (5.816 poses + 24 acertos direcionais, alvo traseiro, integração/apoios/bordas). Chrome headless: jogo/estúdio sem erros e câmera em 2 resoluções/DPR1/2. Capturas010 revisadas. Sem teste físico ou FPS headed.
