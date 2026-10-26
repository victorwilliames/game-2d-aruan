# Xbox + Mixamo — vertical slice #83, 26/10/2026

O gameplay agora aplica Idle/Walk/Standard Run reais aos 65 canais Mixamorig e entrega o rig completo ao painter Canvas existente. Antes, `MovaGame.pose()` devolvia apenas os escalares reduzidos e `main.js` sempre chamava `solveRig` V1. A presença da hierarquia no JSON não significava uso no jogo.

`js/locomotion.js` combina quaternions de idle/caminhada continuamente, compartilha a fase caminhada/corrida e ajusta cadência pela distância percorrida e pelo `cycleDelta` da fonte. Uma ponte geométrica de 120 ms permite comparar V1/Mixamo sem mudar posição, velocidade, colisões ou recursos. Root motion horizontal nunca entra no controlador. O combate Sprint 8 e ações explícitas do MovaLab usam seu caminho anterior; a entrada em combate retorna diretamente à pose nativa, preservando a trajetória de hitbox. A suavização dessa entrada continua fora deste marco de locomoção.

O FootPlant original permanece responsável por apoios em mundo. O adaptador usa as posições horizontais da hierarquia, os canais convertidos de altura da sola e a altura de política de apoio V1; o solver hierárquico resolve a pelve anatômica e o IK sem alterar comprimentos. Usar a elevação de segurança FK como sola produzia pés suspensos; usar a altura anatômica da pelve na reserva de alcance V1 provocava passos indefinidos. Ambos foram detectados pelo teste que exige amostras reais de apoio e pés assentados depois de parar.

O analógico já era proporcional. A correção usa `moveDeadzone=.14`, mantendo `aimDeadzone=.18`, e normaliza a projeção removida ao inverter o movimento: antes faltava dividir por `|moveIntent|²`, deixando impulso contrário quando a inclinação era parcial. Aceleração e frenagem não receberam atraso novo; bindings Xbox permanecem iguais.

## Fontes selecionadas

Reutilizados sem reconversão nem aquisição os três exports reais versionados de `MixamoOriginalsPack/Animations/Male Locomotion Pack/`: `idle.fbx` (8,333333 s), `walking.fbx` (1,033333 s) e `standard run.fbx` (0,733333 s). São ciclos de locomoção existentes com root/canais/apoios, avaliados no Canvas em movimento, parada, círculo e transições. Os 65 nomes/pais e o mesmo perfil de destino são validados antes de ativar. Proveniência SHA, metadados e dados completos permanecem nos exports. O catálogo adquirido foi consultado: `Walking.fbx` é Happy Walk e `Running.fbx` descreve Running And Rolling (ver `hierarchy-pilot-report.json`); este último foi rejeitado como ciclo de corrida. Não há conversão em massa nem novos assets brutos.

Esta camada usa os três ciclos curados acima. Os slots pessoais de locomoção continuam salvos no workspace, mas não substituem automaticamente esta seleção; ações explícitas configuradas continuam funcionando. A publicação genérica de qualquer novo ciclo hierárquico é continuação da #83.

## Evidência e limites

`node tests/headless.cjs --smoke --locomotion-only` usa Gamepad API simulada no Canvas real: 20/50/100%, círculo, inversão total/parcial, parada, L3, X/A/B/LB/LT/RB, 65 canais, comprimentos, apoios, retorno V1, falha de asset e trajetórias idênticas V1/Mixamo. O relatório é `tools/movalab/docs/xbox-locomotion-report.json`. Captura 070 registra a primeira comparação ainda com o problema de apoio; 071 é a correção revisada. A regressão completa de index/inspecao e os gatilhos publicados do MovaLab também foram executados em Chrome exclusivamente headless. Nenhuma janela visível.

Velocidades medidas após 0,4 s: 20% ≈5,12 u/s; 50% ≈43,96 u/s; 100% ≈289,96 u/s. Simulação não certifica hardware Xbox, qualidade artística profissional nem FPS real. #68 e gates físicos continuam em revisão humana; #83 é mais ampla que esta entrega.

## Teste pelo autor

Abra `http://localhost:5317/?dev=1`, recarregue e conecte o Xbox. Incline levemente, até a metade e até o fim; gire 360°, inverta e solte. L3 ativa sprint; X ataca; A/B esquivam; LB defende; LT apara; RB usa runa. O botão superior direito alterna **Mixamo 65 / V1**, sem comandos extras no Xbox. F3 mostra fonte/nome, inclinação bruta, velocidade, estado, blend e fallback. Verifique especialmente contato dos pés, parada e mudanças de direção. O aceite de sensação/qualidade permanece com o autor.
