# Regressão final da base — #9

## Matriz executada

- npm test:preservação canônicaLF(5arquivos),9.880poses, IK/grip/apoios, clearance, transições e costuras; integração teclado/mouse/toque/gamepad, combos, cancelamento, foco/pausa/reset, colisões/bordas e8árvores/cache1.
- Cadências de display simuladas30/60/144Hz durante1s:tempo simulado1s/1s/0,991667s; deslocamento277,990/277,990/275,573u. Diferença máxima1passo de1/120s. Pausa não acumula wall time; lento25% produz0,25s. Não é medição deFPS físico.
- Chrome headless:teclado e multitouch nativos CDP, gamepad standard simulado,2viewports de câmera/DPR1/2 e3viewports móveis. Gamepad API presente,0dispositivos físicos expostos.
- Acessibilidade:Tab nativo foca canvas com contorno visível; instruções e nomes acessíveis; estado aria-pressed; alvos desktop>=32px/toque>=48px; preferência nativa de movimento reduzido remove shake. R reset durante pausa atualiza rig.
- Estúdio:7loops×8direções, igualdade das poses inicial/final (roll equivalente),3grades de rastro e tiras de6frames.
- Console/rede:0erros e0requests a referências em runtime.113JPEGs técnicos com MIMEimage/jpeg;10imagens curadas/5pares1600×900 e links válidos.
- Custo do trabalho com pacing:desktop mediana3,2/3,4ms,p954,2/4,3ms baseline/192partículas. Móvel teve p95até6,1ms nesta rodada. Não certificaFPS ou hardware físico.

## Harness

Agora usa porta livre e perfil exclusivos, espera documento/API prontos, seleciona alvo page, limita requestsCDP e verifica console.error/exceções/rede/HTTP. O smoke padrão não escreve imagens. Captura exige prefixo numerado novo e recusa sobrescrita antes de abrir processos. Perfil é removido somente após validar caminho temporário próprio; servidor/navegador próprios são encerrados inclusive em falha. Nenhuma janela visível.

Capturas017 registram o marco técnico, sem novo par curado para ajustes pequenos de foco/tamanho de alvo. O último salto curado permanece005(toque).

## Limitações e portão

Celular/Xbox físicos, notch real, sensação dos controles eFPS de display não verificados. A evidência automatizada não é aprovação física. Não há bugP0/P1 conhecido após#21. A etapa-mãe#19 será fechada depois das filhas#9/#21, conforme regra do autor; não se marca a mãe concluída antes desta tarefa. Nova cópia limpa será verificada antes do push.
