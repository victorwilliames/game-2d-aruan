# MovaLab — continuidade da missão autônoma

> **RETOMADA AUTORIZADA — 25/10/2026, #67/P0.** Autor quer MovaLab como estúdio principal, quatro etapas até jogo real, animação natural antes de arte e modo leve. Novo marco integra slots idle/andar/correr e ações por tecla ao jogo por configuração explícita. A pausa anterior terminou com esse pedido. #61/#66/#67 abertas; MovaLab1.0 e meta200FPS não certificados. Consulte memória/checklist para o checkpoint publicado mais recente.

Atualizado em25/10/2026. Branch master. Missão atual: prompt completo anexado pelo autor, que autoriza avançar do catálogo até exportação Canvas, decisões técnicas e agentes isolados. Este pedido substitui o escopo restrito do handoff antigo.

## Marcos publicados

- d457c62: catálogo/favoritos/categorias/hash e layout; #63 concluída.
- 1155cfc: preview original e retarget por deltas globais relativos à pose neutra, rodapé FBX7700, controles e68combinações.
- 27b100b e65e4ba4: conversor opcional ufbx6100→GLB, skin/pesos/materiais/texturas difusas; trabalho de subagente isolado integrado.
- be7096a: proxy SkinnedMesh65ossos, conversor de poses, player JSON semThree, Lab A/B, presets e estúdio opt-in.
- 3e8b999: inicialização Chrome CI Linux corrigida. CI verde: https://github.com/victorwilliames/game-2d-aruan/actions/runs/40174814433
- Checkpoint seguinte: integração UI/API GLB/legados/texturas, diagnóstico Canvas, catálogo34 e capturas042–044. Consultar git log para hash e CI deste checkpoint.

## Estado reproduzível

`npm run movalab` serve a ferramenta em5320. Não encerrar processo antigo de outro usuário/agente; testes usam portas/workspaces temporários e encerram somente seus próprios processos. Nunca abrir navegador visível.

41 FBX originais:34animações,2personagens modernos,5personagens6100. Os34clipes carregam emFBXLoader;68combinações com kid/cabecudo passam números. Cinco6100 passam por subprocesso Python/ufbx, preservando original/hash e histórico, carregam no GLTFLoader e recebem retarget. Imagens difusas embutidas preservadas byte a byte e decodificadas no Chrome. Perdas reportadas: mapas normais/especulares não transferidos, quatro pesos/vertice (male até3,26% da massa). Fontes/outputs/conversor invalidam cache corretamente. O Python é opcional e instalado só na ferramenta; não é dependência do jogo.

Lab compara malha 3D com o renderer Canvas real em iframe, usa sete ajustes + footlock, presets, salvar/exportar JSON e link ao estúdio. `js/clip-player.js` valida schema e amostra poses/hierarquia/root/apoios semThree. `inspecao.html` importa JSON, oferece oito direções e retorna V1 aos mesmos pixels. `index.html` continua V1 e não carrega o player externo. Tag V1 e cinco arquivos preservados intactos.

Diagnóstico real do solver a120Hz no Lab e estúdio. Walking:63samples,1,033333s,3apoios, erroIK~1e-14 e slip~6,39e-14. Lote34:32passam; falling to roll atravessa o chão e tem pequeno clamp; hard landing atravessa o chão. Esses dois não são animações prontas. Dedos existem na hierarquia, porém CanvasV1 desenha punhos fixos. Ataques não geram hits nem equipam arco automaticamente. Proxy é técnico, não arte final. Não declarar1.0concluído.

## Verificação

- npm test:10.552poses,5hashesLF e capturas.
- npm run test:browser: campo/estúdio V1 completo.
- node tools/movalab/tests/app.cjs
- node tools/movalab/tests/fbx-footer.mjs
- node tools/movalab/tests/retarget.mjs
- node tools/movalab/tests/real-pack.mjs --report
- node tools/movalab/tests/proxy.mjs
- node tools/movalab/tests/procedural.mjs --write
- node tools/movalab/tests/procedural-pack.mjs
- node tools/movalab/tests/legacy-service.cjs --report
- MOVALAB_ALL_ASSETS=1 MOVALAB_LAB=1 MOVALAB_LEGACY=1 node tools/movalab/tests/browser3d.cjs (sintaxe de ambiente conforme shell)
- node tests/headless.cjs --smoke --clip-only

Caminho Python local disponível: C:/Users/willi/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe. Pacote local tools/movalab/.python (ignorado); CI instala legacy/.python. ufbx roda um arquivo por subprocesso, mantendo owners vivos e saindo após flush para evitar crash nativo de finalização no Windows. Não importar binding em servidor persistente.

## Próximos passos concretos

1. Banco e editor entregues no marco após c75d239: listar/carregar clipes pelaUI, hash verificado, fixture nomeada única, recorte0,2–0,8s sincronizado/raiznormalizada, marcadores persistentes/buscáveis/removíveis e guard16MiB. Capturas045/046 revisadas. API/Chrome/números/estúdio verdes.
2. Perfis manuais implementados no marco após20a3397 (CIeditor40176837415verde):65canais, presets+clipes, nósambíguos poríndice/nome, retargetAPI source/target. Corrigido FBXcomskin117nós/65nomes: targetSlots deve animar todosaliases pai/skin zerooffset; in-place deve mover quadril anatômico, nunca sófilhodeskin. Suspender mixerpreview duranteconversão e recriarbindingsdepois. Chrome compara todasmatrizes ecarregamentolimpo; capturas047falha/050correção. Não reintroduzir mapa boneúnicopornome. Próximo: transições econtrolesavançados.
3. CalibraçãoT/A implementada após12ef40e (CIbase40196908721verde): bases anatômicas locais porfilho semântico eforward/up, compensandoeixos/restpose semperdertwist ao180°. Primeira tentativa de shortest-swings perdeuπdetwist efoirejeitada porretarget-rest.mjs; fórmula final usa align*offsetSwing*sourceWorldQ*correctionlocal. TestesT↔A/yaw/escala/offsets/twist passam; kid/cabecudo errovetorial<7e-9. Endbones semfilho ainda usam delta emrest; não certificarrig arbitrário. Fixture0.4 e051atualizadas;32/34Canvas, roll/landing aindaatravessampiso. Checklist geral solicitado pelo autor emdocs/aruan-checklist-completo.md contém65issues ebacklogreal. Próximo: transições, controlesavançados, correção dosdoisclipes, benchmark earte.
4. Corrigir/calibrar landing/roll com solver/limites reais; não esconder erro com status verde.
5. Transições de clipes no player, benchmark amostragem/IK e polimento visual em tamanho real. Comparação humana comMixamo não feita.
6. Atualizar GitHub e documentação por marco, testar LinuxCI 65fechada comCI40176355867verde e semdependentes nativos;64continua revisão artística,66/61emexecução. Gates físicos3/17/18/19/22 intactos.

Não criar sprints/views. Project2 oficial. Memória append-only. Commits/push emmaster autorizados; semforcepush. Não matar processos alheios nem alterar originais. Próximo agente deve consultar git status e remote antes de editar.

## Marco de transições após3374036

Implementação local: js/clip-player.js expõe createTransition(fromSampler,toClip,{duration,startTime,solve}), inspectTransition e inspectLoop. fromSampler deve ser puro e continuar a origem durantefade; congelar snapshot interrompevelocidade. A fase automática busca apoios/IK válidos; pés comuns ficamnoanchor até lift real (unirapoios na seam), offsets/yaw relaxam emvoo. .steady é um objeto sódestino: aoencerrarfade, substituiroestado para nãoretercadeia deorigens. O estúdio fazisso, mantém pausa/interrupções e não para clipe curto antes definalizarfade. Mudança imediata/scrub/restart/V1 resetamfade.

Converter0.5 fecha pequenosseams depés na parteaérea; apoio integral implica cycleDelta0 (driftpequeno removido,grandedesativaloop). No pack22/22loops passam;32/34IKgeral,roll/landingaindafalham. Apenas poses/alvosCanvas são misturados: hierarquia3D/fingers/V1↔V2completa permanecependente.

Fixtures Walking,Run,Idle eíndiceclips.json versionáveis. Regenerar: node tools/movalab/tests/procedural.mjs --write; node tools/movalab/tests/clip-transitions.mjs --write. NativeQA: node tests/headless.cjs --smoke --transition-only. --clip-performance grava perfilCPUJS de1/5/10instâncias (semFPS/GPU/IA/cenário); custos altos estão napintura, nãoamostragem. Não reexecutar benchmark junto deoutros smokes. Captura052estúdio/tirade6frames inspecionada;307JPEGs. npmtest eChromeV1completos verdes antesdepublicar. Próximo: roll/landing, controlesavançados/dedos/equipamento, hierarquia eperformance; MovaLab1.0nãofinal.
