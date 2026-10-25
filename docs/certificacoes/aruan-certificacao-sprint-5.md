# Sprint5 — Certificação de oclusão e rastro

Base certificada: `00dfb35`, cópia limpa destacada. Código em `bf43bdf`, evidências/capturas em `c536e16`. A falha visual foi isolada no brilho estreito do rastro, que executava continue antes de proteger a cabeça; não era uma falha do cabelo.

## Evidência

- npm test:10.552poses, IK/grip/apoios, integração30/60/144, aparência/continuidade/capturas verdes.
- Cinco SHA-256 canônicosLF e blobsHEAD conferem. effects.js teve alteração consciente do hash; world/math/paint/server não mudaram.
- Regressão Canvas real:216casos=3presets×3ataques×8direções×3DPR. Região central da cabeça intacta após passe frontal; efeitos externos dos três ataques e contexto preservados. Base antiga falha com944pixels alterados no finalizador frontal; correção passa com0.
- Chrome headless completo: campo/estúdio,3presets/7animações/8direções, teclado/foco, toqueCDP3viewports, GamepadAPIstandard simulado, JSON/download/arquivo e persistência.
- Buffers retido/forçado/restaurado iguais emDPR1/1,25/2; campo/estúdio pausados estáveis0repinturas e Menu porRAF responde.
- 241JPEGs técnicos,20JPEGs curados em10pares. Conjunto024 com30capturas; par010023→024 na mesma pose/câmera/preset/finalizador1600×900. Grades de golpes1/3 e diagnóstico isolado revisados: cabelo/face limpos e arco externo do efeito visível.

O teste por pixels observa uma região central de leitura, não a silhueta inteira da cabeça/pena. A elipse de exclusão segue o referencial da cabeça e não pinta sobre o personagem. A duração120ms, desvanecimento, largura e equipamento são preservados.

## Limites

Sem celular/Xbox físicos, notch real, sensação dos controles, falha física deGPU ou FPS de display. Nenhuma janela visível, dependência, build, engine, WebGL, referênciaPNG emruntime ou mecânica nova. Gates3/17/18/19/22 continuam pendentes com relações preservadas.

Trabalho de pintura headless desta execução,120amostras desktop: mediana7,2ms/p95 10,1ms; estresse192partículas8,9/13,4ms. São valores instrumentados e variáveis, não FPS físico nem demonstração isolada de ganho de performance.

Próxima frente segura possível: expressão em idle com piscada curta determinística, seguindo os estudos aprovados de olhos fechados. Sem expressão aleatória em combate, mudança de identidade ou mecânica. Exige comparação controlada, continuidade do ciclo e transições testadas; não faz parte desta certificação do rastro.

Resultado final da cópia limpa00dfb35: OK;216casos da cabeça,3presets/7animações/8direções; console/rede0erros,0referênciasruntime;241JPEGsMIME; sem novas capturas nesta rodada.
