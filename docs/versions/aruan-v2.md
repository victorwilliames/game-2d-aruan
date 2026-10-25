# Aruan V2 — rig humanoide e MovaLab Procedural

Estado em25/10/2026: implementação experimental funcional no estúdio; o jogo ativo continua V1.

V1 preservada no commit1aadd07f4bef562d347f5366b8918f5a1cf559cf e tag anotada aruan-v1-rig-original. Consulte [registroV1](aruan-v1.md).

MovaLab converte FBX real com Three.js offline para perfil humanoide65ossos, proxySkinnedMesh e canais de pose/alvosIK do Canvas. `js/clip-player.js` valida/amostra JSON versionado, rootmotion, contatos e hierarquia semThree ou parserFBX. Na direção posterior #67, o autor autorizou aplicar clipes ao jogo pela interfaceMovaLab: idle/andar/correr ou ação por tecla, com conflito/substituição explícita. `index.html` carrega o player leve e `workspace/game-bindings.json`; configuração vazia mantém animações originais. Rig/rendererV1 não foram substituídos. `inspecao.html` permanece histórico/técnico, fora do fluxo principal.

A caminhada do Male Locomotion Pack já foi convertida e reproduzida no Canvas real em oito direções/dois ciclos, com pés em mundo, ossos invariantes, três flechas e retorno aos mesmos pixelsV1. Fixture: tools/movalab/workspace/exports/mixamo-walking.aruan-clip.v1.json. Capturas039–044 e relatórios emtools/movalab/docs.

Das34animações,32 passam no diagnóstico numérico do adaptador; falling to roll e hard landing precisam ajuste por atravessar o piso. Isso não constitui aprovação artística. Dedos são preservados na hierarquia, mas o Canvas ainda desenha punhos fixos. Ataques externos não ativam hits/equipamento. Transições, editor completo e polimento permanecem pendentes.

Preservar Canvas2D, IK, apoio em mundo, passo1/120, pegada/aljava/flechas, cenário em cache e cinco hashes. A conversão pesada fica só na ferramenta. Não ativar V2 no jogo sem regressão e aceite visual. Master permanece única principal; trabalho temporário isolado deve ser integrado e arquivado sem reescrever histórico.

Issue60 documental concluída;61emexecução,63catálogo concluída,64revisão do preview,65formatos e66proxy/export. Estado detalhado e testes no [handoff](../../tools/movalab/docs/codex-astra-handoff.md) e [memória](../../memory-ai.md).
