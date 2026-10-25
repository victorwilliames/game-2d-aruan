# Sprint 7 — Personagem: movimento natural e fidelidade visual

Direção corrigida pelo autor em24/10/2026: só personagem; cenário fora de escopo. O progresso anterior de microajustes não entregou o salto visual esperado. Não criar outra sprint para cada ajuste pequeno.

| Prioridade | Etapa / tarefa | Escopo e dependências |
|---|---|---|
| P0 | Etapa24 #53 / tarefa #58 | Andar/correr/entrada/parada com contrabalanço, peso, arcos, contato e transições.58 depende47 fechada;53 aguarda58. |
| P1 | Etapa25 #55 / tarefa #59 | Inventário completo e fidelidade de idle/giro/esquiva/equipar/golpes.59 depende53. |
| P0 | Etapa25 #55 / tarefa #56 | Silhueta, cabeça/cabelo, volumes e tecido próximos da referência.56 depende47 fechada; ordenação53/59 removida por nova prioridade explícita do autor.55 aguarda as filhas. |

#54 e#57 ficam no histórico da Etapa24: ajuste pequeno de contorno e auditoria crítica, sem equivaler a um salto artístico. Gates físicos3/17/18/19/22 permanecem pendentes.

## Primeiro marco

A locomoção atual avança braço e perna do mesmo lado. As mãos ficam quase num plano horizontal, tronco oscila de forma simples e pés da caminhada não articulam no balanço. Corrigir o gesto inteiro, não só amortecer os números. Comparar movimento real antes/depois, mesma câmera/velocidade/preset, caminhada e corrida. Preservar apoio no mundo, IK, grip/equipamento e passo1/120s. A mudança só é aceita com ganho perceptível no index, além dos testes.

## Referências e Mixamo

O pacote principal tem23poses:2idle,4andar,4correr,4esquiva e9quadros de3golpes. São poses-chave de estudo, não clips ou um rig pronto. Não encontrei FBX/BVH/GLB/GLTF/BLEND nas referências locais. O inventário vai separar ação diferente de quadros da mesma ação e registrar lacunas de execução/transição.

A Adobe permite usar animações Mixamo em jogos e o serviço atende humanoides bípedes. Aplicação exata no nosso Canvas2D exige um clipe obtido na conta Adobe e retargeting offline para os nossos alvos/articulações; não há importação direta de FBX no renderer atual. Não afirmar uso de mocap ou reprodução exata sem dados. A primeira correção usa as poses disponíveis e princípios de movimento.

Fontes: https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html e https://helpx.adobe.com/creative-cloud/help/mixamo-rigging-animation.html.

## Custo e qualidade

Um teste completo antes/depois dos módulos exigidos, focos durante iteração e uma regressão consolidada por marco relevante. Capturas/vídeo comparativos úteis, sem lotes repetidos para cada microajuste. Não usar quantidade de testes/docs/sprints como aprovação de arte. Sem cenário, novas mecânicas, engine, WebGL, dependências ou build.

## Primeiro marco em revisão

34a0f2f corrige contrabalanço e peso da locomoção; testes técnicos verdes, vídeo027 real antes/depois e par012 publicados. #58 fica Em Revisão visual, sem marcar personagem polido. #53 continua aguardando58; #59 mantém P1; #56 agora P0 independente de53/59, sem fechar os gates de locomoção. Não criar mais sprints de microajuste.

## Marco de perfil — #56, e9b1b49

e9b1b49: implementação real da cabeça/perfil após cobrança do autor. Nova silhueta do cabelo, orelhas redesenhadas, rosto lateral com correção ilustrativa contínua até28graus e pena43×25 com largura orientada à câmera. Rig/IK/locomoção não alterados. npm test antes/depois e Chrome headless completo verdes (2páginas,7animações,8direções,3presets,0erros/0referências runtime). Capturas028 e par013;278JPEGs técnicos/13pares. #56 promovida aP0 independente de53/59, com blocker47fechado; permanece aberta, corpo/mãos/pés/tecido e semelhança final pendentes. Remoções do usuário preservadas.

A correção de vista do rosto é estilização procedural: a cabeça desenhada mantém leitura de três quartos nas laterais. Não é alteração do rumo físico nem do rig. A pena mantém haste/âncora/inclinação no espaço e ajusta somente os eixos da superfície para não desaparecer de lado. Nenhum PNG no runtime. Comparação028 usa o head.js de19cc234 contra o atual, mesma pose BASE_POSE, câmera e escala; referências são guia visual, não turnaround geometricamente calibrado.
