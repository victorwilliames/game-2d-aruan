# Registro visual do desenvolvimento

As capturas 000 são capturas reais já existentes do piloto anterior, feitas antes da troca para Aruan. Não representam o arquivo rig.js atual.

Os próximos registros são numerados e capturados no navegador após cada marco visual. A página do estúdio oferece uma vista fixa para comparação e aproximação do rosto. Datas e commits ficam no histórico Git; as capturas fazem parte dos commits.

| Sprint / Etapa | Registro | Estado |
|---|---|---|
| Sprint 9 / Etapa 35 / #79 (em andamento) | 056-canvas-completo-comparacao | Primeiro modo de prévia com hierarquia65/dedos no painter Canvas real, ao lado do Aruan Proxy com Start Walking do pack existente. Chrome headless; integração ao gameplay ainda desabilitada neste modo. |
| Sprint 9 / Etapa 35 / #79 (em andamento) | 057-canvas-vistas-8-direcoes, 057-canvas-vistas-sequencia | Oito direções no mesmo instante e seis tempos realmente rasterizados. Paridade FK do proxy em0,40s <0,000128cm após corrigir grade Float32; contatos IK numéricos verdes. Chibi/roupa/pena/aljava e3flechas preservados; sem aprovação artística final ou QA de todos os clipes. |
| Sprint 9 / Etapa 35 / #79 (em andamento) | 058-canvas-piloto-1, 058-canvas-piloto-2 | Oito FBXs do snapshot adquirido, quatro tempos por clipe, carregados pelo banco temporário no Chrome headless. Walking, Running, Falling To Roll, Hard Landing, Punching, giro180°, Thumbs Up e ataque horizontal. Running inclui rolamento conforme descrição original; não usar o nome como certificação de corrida contínua. Chaves irregulares preservadas, apoios/comprimentos verdes; sem aprovação artística ou aplicação ao gameplay. |
| Sprint 9 / Etapa 35 / #79 (em andamento) | 059-canvas-transicoes | Fade0/0,15/0,30s e interrupção no banco real; fixture StartWalking com quaternion de dedo modificado independentemente. Troca e interrupção sem salto de juntas (~5,7e−14); diferença visual do dedo é pequena em tamanho de jogo. Evidência técnica de blend, sem aprovação artística ou migração do combate. |
| Sprint 9 / Etapa 36 / #80 (em andamento) | 060-mixamo-banco-catalogo | Primeiro catálogo externo real2.317movimentos/19personagens, busca PT-BR e HardLanding no Proxy. Diagnóstico: câmera com limites antigos cortou a pose baixa; falha preservada para comparação. |
| Sprint 9 / Etapa 36 / #80 (em andamento) | 061-mixamo-banco-catalogo | Enquadramento recalcula malha skinned atual; HardLanding a0,5s inteiro no viewport, vértices amostradosNDC≤0,655. Catálogo com80cards iniciais, estados honestos e busca *pouso*. Não certifica arte/modelos nem conversão/cache de produção. |
| Sprint 9 / Etapa 36 / #80 (em andamento) | 062-mixamo-cache-catalogo | HardLanding do cache já preparado aberto pelo botão real,65canais no Canvas e Aruan Proxy na referência. Oito artefatos piloto reutilizados sem cópia de gzip;529ms até prévia nesta execução. Ajustes de chão do Canvas são documentados; sem aprovação artística. |
| Sprint 9 / Etapa 36 / #80 (em andamento) | 063-mixamo-preparo-catalogo | Waving ainda não processado: botão → fila/worker offline → validação → Canvas,7,6s no teste. Catálogo passa a9prévia/9validados/0aprovados visualmente/0integrados; fonte existente, sem download. Chibi/roupa/pena/aljava preservados. |
| Sprint 9 / Etapa37 / #81 | 067-mixamo-personagens-galeria | Walking real em23destinos (Aruan/três proporções/19importados), câmera individual e90mapas decodificados. Quatro rigs parciais; nove prévias parciais por dedos/pesos/mapas, limites indicados por quadro. Chrome headless, framebuffer renderizado imediatamente antes da leitura e quadros vazios rejeitados. Ensaios064–066 descartados por falha de captura. Não certifica arte nem gameplay. |
| Sprint9 / Etapa38 / #82 | 068-mixamo-dev-dev-catalogo | Janela DEV dentro do jogo pausado, ElbowPunching real no mesmo painter Canvas, scrub/direção6/velocidade2×/loop opcional. Fonte existente preparada offline pelo botão, sem download; cache passa a10clipes. Ensaio seguinte usa Punching exato e confirma estado de combate intacto, rascunho de atribuição separado e WASD restaurado. Sem aprovação artística/publicação gameplay. |
| Sprint 9 / Etapa 34 / #78 | 055-mixamo-perfis-galeria | Walking real do snapshot HF no Aruan Proxy, três perfis paramétricos e Y Bot na mesma timeline. Chrome headless/SwiftShader 1600×900, câmeras individuais; imagens conferidas. Geometria e pesos do Aruan padrão preservados byte a byte. Prova técnica 3D, sem aceite artístico, Canvas completo ou migração de combate. |
| MovaLab / #67 | 053-movalab-jogo-jogo, 053-movalab-fluxo-movimentos/gatilhos e054-movalab-gatilhos-gatilhos | Primeira integração no jogo real: idle/andar/correr, F e substituiçãoSpace; ossos invariantes/IK verdes em8direções. Etapas coloridas, persistência e conflitos conferidos emChromeheadless.053gatilhos registra o estado inicial da lista;054 corrige a atualização após aplicar. Modo leve básico, sem certificação200FPS. |
| Sprint7 / Etapa24 / #58 | 027-locomocao-antes/depois.jpg e comparacao.webm | Jogo real, contrabalanço e transferência de peso; vídeo de seis segundos simulados, mesmo comando/câmera, sem cenário alterado. Primeira revisão visual; par012 |
| Sprint 7 / Etapa 24 / #54 | 026-contornos-piscada-sequencia | Tinta da mandíbula/orelhas coerente com o corpo; ajuste pequeno, somente evidência técnica. Sem novo par curado ou alegação de salto visual |
| Sprint 6 / Etapa 22 / #49 | 025-piscada: tira facial, campo, estúdio, 3 presets, 7 sequências, golpes e transições | Piscada120ms/4,8s integrada à pose;144renders de olhos/costas e5transições reais. Ciclo idle do estúdio4,8s contém duas respirações2,4s; par011 curado |
| Sprint 5 / Etapa 20 / #44 | 024-rastro-cabeca: campo, estúdio, 3 presets, 7 sequências, golpes e transições | Exclusão da cabeça também protege contra brilho estreito; regressão real de pixels944→0 no caso frontal,216casos; par010 curado |
| Sprint 4 / Etapa 18 / #39 | 023-mechas: campo, estúdio, 3 presets, 7 sequências, golpes e transições | Cabelo com menos sulcos entre painéis e franja preservada; 30 JPEGs novos, Chrome headless completo sem erros; par009 em progressao/sprint-4 |
| Sprint 3 / Etapa 16 / #33 | 022-pausa-campo-pausa-dpr | Campo pausado0repinturas estáveis; Menu porRAF ativo e retícula conserva200×150CSS emDPR1/2. Registro técnico, sem novo par curado/arte |
| Sprint 3 / Etapa 15 / #31 | 021-juncoes:campo,estudio,3presets,7sequencias,combate e3telas de toque | Tinta interna recortada entre ossos adjacentes, preenchimentos/profundidades separados; Canvas real prova dobra vazia e junção contínua;180JPEGs/8pares curados |
| Sprint 2 / Etapa 13 / #26 | 020-continuidade-giro-sequencia | Seis ângulos controlados sem debug; detalhes surgem gradualmente ao girar, opacidade máxima por grau4→0,54; sem novo par curado para microajuste |
| Sprint 2 / Etapa 12 / #24 | 019-pele-tecido:3grades de aparência,3layouts do painel,preview e campo personalizado | Pele com contorno castanho mais leve, mãos arredondadas, marcas aderentes à superfície e vincos curvos;150JPEGs técnicos e primeiro par daSprint2 |
| Sprint 1 / Etapa 11 / #20 | 018-personalizacao:campo/estudio,3presets,3telas do painel,JSON e campo personalizado | 3×7×8 renders, download/importação/persistência e toque nativo;142JPEGs técnicos,6pares curados;preview fixo durante edição |
| Sprint 1 / Etapa 10 / #9 | 017-regressao:campo,estudio,grades,sequencias,transicoes,controle e3telas de toque | Marco técnico de regressão:113JPEGs/5pares curados,7loops,3inputs,zero erros/referências em runtime |
| Sprint 1 / Etapa 9 / #18 | 016-gamepad-campo, estudio e com-controle | Gamepad API standard simulada no Chrome:8direções/combos/foco/hot-plug/handoff; HUD VIEW/MENU e retícula; sem Xbox físico |
| Sprint 1 / Etapa 8 / #17 | 015-toque-campo, estudio, toque-360x740/740x360/320x568 e toque-tablet | Joystick/mira/combo/dodge multitouch nativo; alvos e três layouts verificados; par curado005 |
| Sprint 1 / Etapa 7 / #16 | 014-animacao-campo, estudio, direcoes, sete sequencias, tres grades de golpes e live-reversal/dodge/cancel | Continuidade, giros na antecipação, rolagem com peso e movimentos secundários;9.880poses e par curado004 |
| Sprint 1 / Etapa 7 / #5 | 013-equipamento-campo, estudio, direcoes, golpe-1/2/3-direcoes, run/dodge/0/2-sequencia | Suporte posterior com clearance; antecipações sem atravessar cabeça; par curado003 |
| Sprint 1 / Etapa 6 / #15 | 012-impacto-campo, estudio e golpe-1/2/3-direcoes | Rastro curto/afilado preserva rosto; efeitos limitados e movimento reduzido; par curado002 |
| Sprint 1 / Etapa 5 / #14 | 011-cancel-campo, estudio e live-cancel | Três intenções rápidas preservadas e cancelamento após ativo; seis frames da transição para dodge |
| Sprint 1 / Etapa 5 / #6 | 010-combo-campo, estudio, direcoes, golpe-1/2/3-direcoes, live-reversal/dodge | 24 contatos direcionais e auditoria dos rastros; finalizador não acerta alvo atrás. Faixa frontal do rastro será refinada na Etapa 6 |
| Sprint 1 / Etapa 4 / #13 | 009-camera-campo, estudio, direcoes, live-reversal e live-dodge | Câmera com deadzone e antecipação pelo movimento; oito bordas em duas resoluções e DPR 1/2 |
| Pré-Aruan / — | piloto-campo / piloto-inspecao | Piloto anterior com cavaleiro; capturas preservadas de 23/10/2026, 01:48 |
| Sprint 1 / Etapa 0 | aruan-primeiro-estudio | Primeira reconstrução procedural do Aruan, com arco e aljava articulados |
| Sprint 1 / Etapa 0 | aruan-rosto / aruan-rig-golpe / aruan-cambalhota | Correção do rosto/pena e da pegada articulada; regressão com 5.816 poses |
| Sprint 1 / Etapa 0 | aruan-campo / aruan-combo-campo | Campo de treino e combo em execução, após o checkpoint de 23/10/2026 |
| Sprint 1 / — | game-2d-aruan / game-2d-aruan-estudio | Identidade **Game 2D - Aruan** no campo e no estúdio; sem mudança de arte |
| Sprint 1 / Etapa 1 / #4 | 005-antes/depois-campo, 005-antes/depois-estudio, 005-antes/depois-direcoes | Auditoria das oito direções; olhos, sobrancelhas e massas do cabelo. JPEG real, headless 1600×900; detalhes em docs/aruan-auditoria-direcoes.md |
| Sprint 1 / Etapa 1 / #8 | 006-baseline-campo, estudio, direcoes e idle/walk/run/dodge/0/1/2-sequencia | Baseline reproduzível; sete tiras de seis frames, 1600×900; JPEG e MIME verificados. Rodar node tests/headless.cjs <sequencia-slug> |
| Sprint 1 / Etapa 3 / #7 | 007-apoios-campo, estudio, direcoes, live-reversal e live-dodge | Pouso sem impulso residual e transferência de apoio antes do limite do IK; tiras live do jogo real em 1600×900 |
| Sprint 1 / Etapa 3 / #12 | 008-resposta-campo, estudio, direcoes, live-reversal e live-dodge | Reversão no próximo passo, frenagem em 150 ms e parada estável; velocidades máximas preservadas |

Observação: as capturas 003 e o teste `tests/game.cjs` foram versionados nos commits `9bd1c73` e `e48f87b`.

Nota técnica: os arquivos desta pasta usam a extensão **`.jpg`** e conteúdo JPEG real (bytes iniciais `FF D8 FF E0`). Em 23/10/2026 as capturas antigas foram renomeadas de `.png` para `.jpg` para corrigir a extensão. Novas capturas devem seguir o mesmo padrão.






| Sprint7 / Etapa25 / #56 | 028-antes,028-depois,028-comparacao-perfil | e9b1b49: perfil/cabelo/orelhas/pena. Oito direções e comparação lateral, mesma pose/câmera1600×900. Chrome headless; tarefa visual ainda aberta. |
| Sprint7 / Etapa25 / #56 | 030-rosto-antes-depois | Orelhas pequenas e encostadas, nariz em volume único e boca visível com cantos levemente erguidos; mesma pose/câmera, frente/3/4/perfil em close 1800×1000. Comparação contra 8bfd676; corpo/mãos/pés/tecido seguem abertos. |
| Sprint7 / Etapa25 / #56 | 031-corpo-antes-depois | Volumes de pernas, braços e tronco mais próximos da referência chibi; pés com pontas de dedos, tecido maior com cauda curta e dobras suaves. Comparação contra 8665bb0, frente/3/4/perfil/costas em 1600×900; mãos ainda simplificadas e aceite visual pendente. |
| Sprint7 / Etapa25 / #56 | 034-maos-antes-depois | Mão mais quadrada, punho sem costura escura, polegar arredondado no lado interno e três sulcos de dedos; comparação ampliada do braço contra c33c108 em 1600×900. Recorte de estudo, não é o corpo inteiro; mãos ainda não finais e aceite visual pendente. |

| MovaLab / #63 | 035-movalab-biblioteca | Diagnóstico: lista completa esticava o palco para 3012px e cortava o personagem. Chrome headless, 1420×850. |
| MovaLab / #63 | 036-movalab-biblioteca | Catálogo completo: 34 animações, seis personagens, cinco legados; palco corrigido para 850×571, listas com rolagem, categorias e favoritos persistentes. Preview original, sem aceite Mixamo/retarget. |

| MovaLab / #64 | 037-movalab-retarget e sufixos kid/cabecudo | Primeira prévia com deltas de pose neutra; originais e dois destinos com materiais. Sem alterar comprimentos, cabecudo parcial por dedos mínimos ausentes. |
| MovaLab / #64 | 038-movalab-preview e sufixos kid/cabecudo/movimentos | Controles, trocas concorrentes e tira real de caminhada/corrida/idle revisados. 34 clipes × dois destinos em teste numérico; screenshot não certifica fidelidade ao Mixamo. |

| MovaLab / #66 | 039-movalab-proxy-aruan-proxy e movimentos | Proxy técnico real:65 ossos,37.896 vértices,4.680 vértices com pesos de junta. Caminhar/correr/idle em SkinnedMesh. Não é arte final. |
| MovaLab / #66 | 040-movalab-canvas-laboratorio | Primeira comparação sincronizada fonte FBX real × renderer Canvas real, conversão/apoios/ajustes/presets/export experimental. |
| MovaLab / #66 | 041-movalab-estudio-estudio/direcoes/sequencia | JSON real importado pelo seletor nativo do estúdio; oito vistas e tira de caminhada. Apoios em dois ciclos, V1 restaurada com pixels idênticos. |
| MovaLab / #65 | 042-movalab-glb-legados | Cinco FBX6100 convertidos e retargetados; marco inicial com materiais básicos, antes de restaurar texturas. |
| MovaLab / #65 | 043-movalab-texturas-legados | Mesmo lote com texturas difusas reais decodificadas no Chrome headless; boss, male e gordo texturizados, YBots sem imagens no original. |
| MovaLab / #66 | 044-movalab-diagnostico-laboratorio | Referência com malha real × Aruan Canvas, pés planos durante apoio e diagnóstico do solver a120Hz. Sem certificação artística. |
| MovaLab / #66 | 045-movalab-editor-laboratorio | Primeira inspeção dos controles de recorte; viewport inicial não mostra todo o editor. |
| MovaLab / #66 | 046-movalab-recorte-banco-editor | Captura completa: trecho0,2–0,8s reaberto do banco, referência no tempo original, marcador salvo/removido e novo marcador de recuperação. Chrome headless; layout390/740px sem transbordamento. |
| MovaLab / #66 | 047-movalab-perfil-manual-editor | Diagnóstico durante implementação: mapear só um nó por nome deixou os pais de skin naT-pose e deformou a referência. Falha preservada para comparação, não é aceite. |
| MovaLab / #66 | 050-movalab-perfil-validado-editor | Perfil manual/preset/banco reais; aliases de transformação/skin preservados e in-place corrige o quadril anatômico. Referência comparada com FBX carregado do zero no mesmo instante; malha voltou àpose correta. |
| MovaLab / #66 | 051-movalab-calibracao-aruan-proxy e movimentos | Calibração anatômica T/A; proxy técnico e tira de caminhada/corrida/idle. Direção/torção/comprimentos verificados, oito vistas Canvas e cinco GLBs legados no Chrome. Não é arte final nem certificação1.0. |
| MovaLab / #66 | 052-movalab-transicoes-estudio e sequencia | Seletor real com fade/ajuste de fase; caminhada→corrida e corrida→idle em0/0,15/0,30s. Oito vistas, interrupção, pausa, ciclos e apoios resolvidos verificados; clipe curto termina fade antes de pausar. Transições de pose Canvas, não migração do jogo. |
