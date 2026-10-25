# Sprint3 / Etapa16 — Campo pausado econômico

O campo repintava continuamente em pausa. O teste real reproduziu12pinturas em12frames, com58,2ms de trabalho no painter naquele ensaio. A mesma janela agora tem0pinturas e0ms dentro do painter; a simulação permanece parada. Isso não significa CPU total zero: RAF, polling de gamepad e uma comparação leve de estado continuam ativos.

A decisão de pintar observa flags, tempo/rig/posição, fonte de input, mouse/direção, filas de diagnóstico, aparência e geometria da câmera. Resize e ações explícitas invalidam o buffer mesmo quando os valores parecem iguais. render() continua forçando o desenho; para alterações diretas de diagnóstico fora desse conjunto, Pilot.step/render continuam disponíveis. Game.frames conta callbacks RAF; Game.frameMs só amostra frames pintados e mantém o último valor em pausa.

O polling do gamepad ocorre antes da decisão de cache. A prova usa Menu standard simulado através do RAF real: despausa, a simulação avança em passos1/120s, Menu pausa novamente e as pinturas assentam em0. Não é teste físico de Xbox.

DPR também é observado sem depender de resize. O mouse guardado em pixels do bitmap é reescalado na troca de densidade para conservar a posição CSS. Em1024×768/DPR1,360×740/DPR2 e1600×900/DPR1/2, cada mudança pintou uma vez e assentou em0; a retícula ficou em200×150CSS. A preferência emulada de movimento reduzido limpa também os offsets de shake já congelados em pausa e força pintura.

O campo escuta contextrestored para não manter o buffer apagado após restauração do seu contexto. A regressão focal inclui esse evento simulado, além de debug/lento, ponteiro/saída, troca de fonte, aparência/reset e resize:13ações de atualização. Não se alega teste de perda física de GPU ou recuperação de todos os dispositivos.

npm test antes/depois:10.552poses,5hashesLF, integração, aparência e continuidade verdes. Chrome headless: suíte completa e teste focal de restauração do campo, duas páginas sem erros, sete animações/oito direções/três presets no conjunto completo; toque nativoCDP e APIgamepad simulada.181JPEGs/8pares conferem. A captura técnica022 documenta a retícula após a rodada de DPR; nenhum novo par curado foi criado para esta otimização sem mudança de arte. Gates físicos permanecem pendentes.

Para repetir o foco, use node tests/headless.cjs --smoke --game-economy-only. O harness encerra servidor, navegador e perfil próprios. Nenhuma janela visível, dependência, engine, WebGL, asset de referência runtime ou mecânica nova.
