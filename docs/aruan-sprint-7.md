# Sprint 7 — Personagem: movimento natural e fidelidade visual

Direção corrigida pelo autor em24/10/2026: só personagem; cenário fora de escopo. O progresso anterior de microajustes não entregou o salto visual esperado. Não criar outra sprint para cada ajuste pequeno.

| Prioridade | Etapa / tarefa | Escopo e dependências |
|---|---|---|
| P0 | Etapa24 #53 / tarefa #58 | Andar/correr/entrada/parada com contrabalanço, peso, arcos, contato e transições.58 depende47 fechada;53 aguarda58. |
| P1 | Etapa25 #55 / tarefa #59 | Inventário completo e fidelidade de idle/giro/esquiva/equipar/golpes.59 depende53. |
| P1 | Etapa25 #55 / tarefa #56 | Silhueta, cabeça/cabelo, volumes e tecido próximos da referência.56 depende53/59;55 aguarda as filhas. |

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

34a0f2f corrige contrabalanço e peso da locomoção; testes técnicos verdes, vídeo027 real antes/depois e par012 publicados. #58 fica Em Revisão visual, sem marcar personagem polido. #53 continua aguardando58; #59/#56 mantêm P1 e dependências. Não criar mais sprints de microajuste.
