# Etapa 9 — Gamepad Xbox e input híbrido (#18)

Gamepad API no passo fixo, com polling também durante pausa para Menu retomar. Apenas mapping standard é aceito. Stick esquerdo move/anda/corre com oito direções normalizadas, deadzone radial18%, curva1,2 e velocidade contínua. Stick direito orienta o próximo ataque; retícula de direção permanece fora da silhueta e dentro da tela. A ataca, B esquiva, Menu/Start pausa e View alterna esqueleto. Rótulos do HUD seguem o dispositivo.

Ações usam borda de pressão: segurar A/B/Menu não repete. Conectar/reconectar, recuperar foco ou limpar input exige neutralização antes de ações, evitando clique fantasma. Menu permanece disponível para retomar pausa. Desconectar solta o movimento; API indisponível ou mapping não padrão não lança erro.

Teclado/mouse, toque e gamepad alternam sem reiniciar. Um stick mantido não rouba controle após a troca. O detector compara com a posição no momento da troca, então um movimento gradual também retoma o gamepad (não exige salto entre polls). Pequenas intenções analógicas já viram o personagem, sem esperar velocidade12u/s. Fonte de input/estado conectado aparecem no diagnóstico.

## Verificação

- npm test verde:9.880 poses mais oito direções do controle, drift, movimento curto/gradual, A mantido, combo3pressões, B, Menu/View, pausa sem avançar simulação, blur/foco, neutralização, desconexão/reconexão, mapping não padrão, exceção da API e troca entre três inputs.
- Chrome real headless: Gamepad API presente, entradas standard simuladas atravessam o consumidor real e repetem movimento/combo/dodge/pausa/foco/hot-plug/handoff. Nenhum dispositivo físico foi exposto à página; Xbox físico NÃO foi validado. Não se declara teste de driver, conexão USB/Bluetooth ou sensação física.
- Jogo/estúdio sem erros,7loops/câmera/DPR e multitouch nativo em3viewports continuam verdes. Custo desktop com pacing:mediana3,3/3,4ms e p954,1/4,4ms sem/com192partículas; não éFPS.
- Capturas016 campo/estúdio/modo controle revisadas. Sem par extra na progressão para mudança localizada de legenda/retícula; os cinco pares curados existentes permanecem.
