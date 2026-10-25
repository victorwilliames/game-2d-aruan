# MovaLab — continuidade da missão autônoma

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

1. Banco procedural: listar/carregar clipes salvos na UI; hoje API persiste, UI só salva. Registrar fixture sem duplicar JSON e tornar rota GET compatível com filename registrado seguro.
2. Recorte início/fim, marcadores/eventos e loop explícito, mantendo previews no mesmo tempo. Normalizar raiz horizontal inicial no recorte. Guardar provenance e presets. Limitar export ao máximo16MiB aceito pelo player.
3. Mapeamento manual de ossos/diagnóstico de perfis; controles de orientação das mãos, suavização e offsets. Preservação de dedos não equivale a renderização articulada.
4. Corrigir/calibrar landing/roll com solver/limites reais; não esconder erro com status verde.
5. Transições de clipes no player, benchmark amostragem/IK e polimento visual em tamanho real. Comparação humana comMixamo não feita.
6. Atualizar GitHub e documentação por marco, testar LinuxCI e fechar65 somente com critérios técnicos demonstrados;64continua revisão artística,66/61emexecução. Gates físicos3/17/18/19/22 intactos.

Não criar sprints/views. Project2 oficial. Memória append-only. Commits/push emmaster autorizados; semforcepush. Não matar processos alheios nem alterar originais. Próximo agente deve consultar git status e remote antes de editar.
