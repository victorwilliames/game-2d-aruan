# Sprint6 — Expressão de idle e continuidade facial

Guarda-chuva47, blocker técnico42 fechado. Gates físicos3/17/18/19/22 preservados.

| Etapa | Issue | Tarefa | Blockers nativos |
|---|---|---|---|
| 22 — Piscada e expressão de idle | #48 | #49 | 49 depende42;48 depende42/49 |
| 23 — Regressão facial e transições | #50 | #51 | 51 depende48;50 depende48/51 |

Estudo: expressões de olhos fechados na ficha aprovada do Aruan. Proposta procedural: piscada curta de120ms a cada4,8s de idle, mantendo a respiração de2,4s. Sem aleatoriedade ou relógio externo. Olhos abertos no ativo dos golpes; abertura suave na antecipação/entrada de esquiva e blend de locomoção. Sem mudar sobrancelhas, identidade ou pintura facial.

A pose carrega o fechamento das pálpebras, portanto pausa e passo fixo1/120s continuam controlando a animação. Campo/estúdio compartilham a função temporal; o ciclo de inspeção idle pode conter duas respirações para manter a piscada periódica sem cortar o loop.

Aceitar somente ganho de naturalidade na comparação controlada. Verificar vista frontal/três quartos/perfis/costas, classic/cropped e presets; nenhuma face extra nas costas, clipping ou olho aberto ao ficar totalmente fechado. Tira de seis frames no mesmo enquadramento, conjunto025+ e par011curado1600×900 se houver marco perceptível. Reverter se piorar a leitura.

Regressão final: três presets, sete animações, oito direções, DPR1/1,25/2, transições reais e cópia limpa; npm test antes/depois de rig/head, hashesLF/blobs e Chrome headless completo sem erros. Canvas2D, IK/grip/apoios/equipamento/cache preservados. Sem mecânica, engine, WebGL, build, dependência, referênciaPNG em runtime ou janela visível.

Project2 recebeu Sprint6 e Etapas22/23 preservando IDs anteriores. Labels existentes, parents e blockedBy/blocking nativos; nenhuma view criada. Tarefa49 A Fazer, etapas48/50 aguardam as filhas.

## Tarefa49

83c78c6 entrega piscada120ms/4,8s com respiração2,4s preservada; pose e transições controlam o fechamento. npm test antes/depois e Chrome headless completo verdes:144renders de pálpebras/costas,5transições reais,216casos de rastro,3presets/7animações/8direções,0erros/referênciasruntime.31JPEGs025,272técnicos/11pares, par011 contra checkout00dfb35 e tira facial revisados. Ver aruan-piscada-idle.md.
