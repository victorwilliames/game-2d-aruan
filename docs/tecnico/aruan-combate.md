# Etapa 5 — Combate

## #6 — Três golpes × oito direções

Adicionada matriz de 24 golpes: cada golpe acerta o alvo frontal exatamente uma vez e retorna ao idle com arco nas costas. O teste também detectou que o disco de impacto do finalizador incluía um alvo a 20u atrás do herói. Corrigido com restrição ao semiplano frontal, sem trocar raio, timing ou criar ataque novo.

Grades 010-combo-golpe-1/2/3-direcoes incluem amostras temporais reais do SwordTrail, com desenho dividido frente/trás. Os planos horizontal, revés e descendente são distintos; empunhadura e aljava permanecem presentes. O pintor de efeitos é carregado pelo teste no estúdio apenas para QA; a página de produto não foi alterada.

Achado para a Etapa6: o descendente de frente/costas ainda comprime o rastro em uma faixa vertical que pode cruzar o rosto. O rastro está ancorado ao golpe, mas precisa de ajuste de duração/largura e oclusão nessa projeção. Não é tratado como aprovação final de polimento.

npm test verde (5.816 poses + 24 acertos direcionais, alvo traseiro, integração/apoios/bordas). Chrome headless: jogo/estúdio sem erros e câmera em 2 resoluções/DPR1/2. Capturas010 revisadas. Sem teste físico ou FPS headed.

## #14 — Buffer e cancelamento

Fila de até duas intenções adicionais por cadeia, cada uma com direção e expiração de 1,2s de simulação. Três cliques rápidos agora geram três contatos; spam não reserva um quarto ataque. As intenções são consumidas uma por vez e limpas em blur, pausa, reset ou dodge. Não se expiram no relógio real durante hitstop/pausa. Direção é travada ao iniciar cada golpe. Janela de encadeamento preservada:0,43/0,34/0,59s.

Dodge cancela somente após max(cancel, fim do ativo):0,52/0,42/0,59s. Antecipação e contato não são interrompidos. O cancel limpa intenções e rastro; não adiciona invulnerabilidade, ataque ou mecânica nova. Avanço e colisões continuam existentes.

npm test cobre três cliques simultâneos, spam40, direção travada, cancel cedo/tarde nos três golpes e retorno ao idle. Chrome headless repete três cliques de PointerEvent e cancelamento no DOM real; duas páginas sem erros. Capturas011 campo/estúdio/live-cancel revisadas. Transição de pose do cancel ainda pode ganhar continuidade na Etapa7, onde ficam os blends de animação. Filho#6 fechado; sem hardware físico ou benchmark headed.
