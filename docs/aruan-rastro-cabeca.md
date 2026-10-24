# Sprint5 / Etapa20 — Rastro sem atravessar a cabeça

O ensaio controlado colocou lado a lado a mesma pose: cabeça isolada, personagem sem rastro e personagem com rastro. A faceta clara só apareceu no terceiro caso. Não era uma divisão geométrica do cabelo nem equipamento atravessando a cabeça.

A causa estava no fluxo de SwordTrail.draw: o ramo de largura projetada inferior a5unidades desenhava um brilho estreito e executava continue antes da exclusão da cabeça. Assim, o finalizador frontal atravessava cabelo e rosto, enquanto os rastros largos já aplicavam uma exclusão elíptica. O renderer da cabeça não foi alterado nesta tarefa.

A exclusão agora envolve todos os segmentos de primeiro plano, inclusive o brilho. Ela é aplicada uma vez por chamada; segmentos de trás continuam no passe anterior ao personagem. A elipse acompanha o referencial da cabeça: projeção de um elipsoide local, incluindo o alto do cabelo, em vez de uma elipse fixa alinhada à tela. Não desenha hull, não cobre o rosto com pintura e não altera rig/volume/equipamento. O rastro preserva duração120ms, desvanecimento, largura e brilho fora da cabeça.

## Regressão por pixels

O teste desenha o personagem real, lê uma região central de120×180pixelsCSS centrada na cabeça com zoom3 e compara o conteúdo após o passe frontal. Testa3presets×3ataques×8direções×3DPR=216casos. A região foi escolhida como contrato de leitura de cabelo/face; não é uma certificação pixel a pixel de toda a silhueta ou pena.

Com effects.js da base9243d0c, a regressão falha no finalizador frontal:944pixels alterados nessa região. Com a correção,216casos passaram sem alteração da região; cada um dos três ataques continua produzindo pixels visíveis fora dela. O teste também verifica restauração de transformação, alpha e clip, preenchendo um pixel dentro da área excluída após desenhar o rastro. A execução ampla inclui este cenário depois das amostras de custo de pintura.

O SHA-256 de effects.js foi atualizado conscientemente em docs/aruan-preservacao.json; world/math/paint/server permanecem preservados. npm test antes da alteração passou; a rodada posterior e Chrome headless completo são registrados no checkpoint da tarefa. Repetir foco com node tests/headless.cjs --smoke --trail-only.

Os termos faceta do cabelo nos checkpoints anteriores descreviam a aparência observada. O diagnóstico desta tarefa corrige a atribuição: era sobreposição do brilho do rastro. Hardware físico, notch real, sensação de controle e FPS de display continuam sem certificação; gates3/17/18/19/22 mantidos. Nenhuma janela visível ou referênciaPNG em runtime.
