# Etapa 7 — Continuidade e movimento secundário (#16)

Filha#5 fechada em e6f8b7a. A entrada da cambalhota agora mistura a pose real anterior durante100ms; a saída mistura durante120ms e normaliza360° para0° antes de interpolar, evitando uma rotação reversa. O final da pose fecha exatamente no idle. Deslocamento de dodge concentra-se na rolagem, com antecipação e pouso estáticos; distância nominal201,6u e duração0,84s preservadas. Estúdio usa a mesma curva de deslocamento.

Walk/run interpolam sua intensidade com damping12, evitando queda abrupta dos braços ao frear. Respiração usa período2,4s coerente com o estúdio. O giro visual termina em120ms na antecipação do golpe e80ms no início do dodge; direção física permanece travada desde o comando e o giro visual termina antes de qualquer contato/rastro ativo.

Pena, pontas das mechas, tecido e flechas têm movimentos secundários pequenos e suavizados, com atraso de fase em relação à passada. Sobrancelhas refletem esforço e retornam gradualmente. Ossos e dimensões do corpo não foram escalados. O estúdio usa sinais periódicos que fecham nas pontas dos loops.

## Verificação

- npm test:9.880 poses, incluindo run/golpes→dodge→idle nas8direções, continuidade do primeiro passo, fechamento do loop e clearance de equipamento. Ossos/grip/apoios~3e-14.
- Apoio real durante24 ataques: maxAttackClamp1,08e-14 e maxAttackSlip1,68e-14. Locomoção/reversão/borda mantêm apoio~1,6e-14. Giro não dá snap e chega antes do contato; direção física não muda.
- Movimento secundário está presente e limitado; esforço desaparece gradualmente. Não é um teste que exige igualdade exata com o pintor.
- Chrome headless: jogo/estúdio sem erros, costuras dos7loops verificadas por posição das mãos/pés, câmera em2viewports/DPR1/2. Custo do trabalho com pacing:mediana3,2/3,6ms e p954,4/4,4ms baseline/192partículas; não éFPS.
- Capturas014 de ações/transições e par curado004. Este par compara a primeira implementação do cancel(#14) com o resultado atual, incluindo o equipamento da#5; não atribui toda a diferença à#16.
- Sem validação física, percepção manual de timing ou FPS de display. Toque/gamepad ainda serão implementados nas Etapas8/9; certificação final fica na10.
