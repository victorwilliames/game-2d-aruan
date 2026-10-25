# MovaLab — handoff de execução para Codex Astra

**Atualizado:** 2026-10-25  
**Branch:** `master`  
**Checkpoint funcional:** `517a94c1f0e0abe5f2c7a4a351cd14492aab9637`  
**CI comprovada:** [Actions 40168584059](https://github.com/victorwilliames/game-2d-aruan/actions/runs/40168584059), verde, com FBX real com malha em Chrome headless, instalação de Three.js isolada, API e testes do Aruan.  
**Proteção V1:** tag `aruan-v1-rig-original`. Não alterar runtime do Aruan.

## Pedido atual do usuário

**Construir PRIMEIRO um clone funcional da primeira tela do Mixamo em português brasileiro**, usando os assets já versionados em
`tools/movalab/workspace/sources/MixamoOriginalsPack/`, com subpastas `Animations/`, `AnimationsWithSkin/`, `Characters3D/`. O usuário **não quer botão de upload**: ele adiciona novos arquivos nas pastas e o app reconhece os assets, automaticamente ao iniciar e ao clicar em `Atualizar pasta`.

A prévia deve carregar FBX original com malha, materiais, rig, dedos e animação, permitindo escolher **qual animação** e **qual personagem 3D** testar, com controles de timeline/velocidade, play/pause/loop, orbit, zoom, reset, preview malha/ossos/ambos, câmera e iluminação similares à experiência do Mixamo. Evitar interpretação/improviso de ossos em Canvas; a primeira tela agora usa Three.js+FBXLoader+AnimationMixer. Aruan Proxy 3D, retargeting e export procedural só **depois** do aceite visual desta tela.

## Implementado nesta sessão

- Issues criadas: [#63 M1 catálogo/PT-BR](https://github.com/victorwilliames/game-2d-aruan/issues/63), [#64 M2 viewer 3D real](https://github.com/victorwilliames/game-2d-aruan/issues/64), [#65 M3 formatos antigos/performance](https://github.com/victorwilliames/game-2d-aruan/issues/65), [#66 M4 Aruan Proxy/export futura](https://github.com/victorwilliames/game-2d-aruan/issues/66). Issue pai #61.
- `service/pack-library.cjs`: descobre pastas de forma recursiva, classifica clipes e personagens, indexa por caminho/hash sem **duplicar** FBX, suporta sync repetível.
- `service/server.cjs`: `GET /api/assets`, `GET /api/assets/raw?path=...`, `GET /api/motions/:id/raw`, `POST /api/library/sync`, GET `/api/motions` ativa auto-sync. Limite de upload legado aumentado para 96 MiB, mas a UI não usa upload.
- `app/index.html`, `app/styles.css`, `app/main.js`: interface majoritariamente PT-BR, sem botão Import Motion, busca/filtros, animações e escolha dos modelos originais, controles de playback e links entre telas; aba procedural intencionalmente informativa.
- `app/viewer3d.js`: Three.js, FBXLoader, OrbitControls, AnimationMixer, SkeletonHelper, sombras, grade, câmera, seleção de malha e animação. Mapeamento simples de nomes para rigs similares **não garante retarget correto**; falta calibração de bind/rest pose e comparação contra Mixamo.
- `app/package.json`: Three.js versão fixada como dependência **isolada na ferramenta** (sem instalar no Aruan runtime). `scripts/start.cjs` permite `npm run movalab` com setup inicial da dependência.
- `scripts/auditar-pack.cjs` identifica FBX 6100, 7300, 7700, tamanho, tipo, duplicatas.
- Testes `tests/app.cjs`, `tests/pack-audit.cjs`, `tests/browser3d.cjs`. Teste browser headless validou FBX com skin `Start Walking-com-skin-mixamo.fbx` com Three.js. CI passou em `517a94c1`.

## Questões pendentes prioritárias

1. **Inspecionar VISUALMENTE** screenshot do Chrome headless e comparar com Mixamo; CI provar carregamento não certifica pose, animação correta, textura, escala ou direção.
2. **Verificar e corrigir mapeamento de animação entre diferentes personagens**. Atualmente remapeia *tracks* por nome com fallback para source quando incompatível, mas **não resolve offsets de bind/rest pose**. Garantir funcionamento de animações Without Skin em `kid.fbx`, `cabecudo.fbx` ou personagem com skin; pesquisar compatibilidade real. Não fingir compatibilidade universal; diferenciar source preview vs retarget técnico.
3. **Testar todos os 41 FBX versionados**, inclusive `Male Locomotion Pack` adicional, sem corromper arquivos e preservando seu histórico; reportar por arquivo os que executam e os que pedem conversão.
4. **FBX 6100**: 5 assets legados (Y Bot, gordo, male-realista, theboss, y-bot) precisam de ferramenta de conversão/adapter confiável; o parser Node existente aceita 7000–7900. Os `kid.fbx` e `cabecudo.fbx` são FBX 7300 (malha 3D, sem keyframes); jamais tratá-los como clips.
5. Verificar textura / iluminação / wireframe / root-motion / in-place / mirror / controles e comportamento ao mudar modelo e animation clip. Corrigir performance, leaks e UX PT-BR.
6. Criar testes end-to-end com screenshots (sem janela visível) e aceite humano após visualização.
7. Preparar futura issue #66 após primeiro clone fiel: Aruan 3D Proxy rigado, e depois conversão procedural em Canvas, **fora do escopo imediato**.
8. Na biblioteca versionada GitHub: adicionar novos FBX locais **não publica automaticamente commits no Git**; o app atualiza o índice local e OpenCode/Codex podem fazer commit/push quando apropriado. Evitar remover/reescrever o original ou duplicar bytes; verificar política de licença e não abrir o repo ao público enquanto houver originais de terceiros.

## Comandos do próximo agente

```powershell
git fetch origin
git pull --ff-only origin master
npm run movalab
npm run test:movalab
node tools/movalab/tests/pack-audit.cjs
node tools/movalab/tests/browser3d.cjs
npm test
npm run test:browser
```

Servidor `http://127.0.0.1:5320`; se porta ocupada, conferir servidor antigo antes de iniciar outro. Para UI testes navegador sem janela visível. Em CI runner: `npm install --prefix tools/movalab/app --no-audit --no-fund`; usar `.github/workflows/movalab-smoke.yml`.

**Regra de conclusão:** passar testes não equivale a *clone Mixamo visualmente aprovado*. Issue #64 só pode fechar após visualização conferida e troca real de personagens, rigs corretos e movimento natural. Issue #65 só depois dos formatos legados/performance. Não fechar #66 por criar UI vazia.

## Como continuar autonomamente com limites de execução

Atuar em ciclos pequenos: ler `AGENTS.md`, `memory-ai.md`, código e issues → escolher maior bloqueio → implementar → testar → commitar/push → comentar issue → atualizar `memory-ai.md` → próximo bloqueio. Não parar após documentação ou primeira falha; corrigir as falhas detectadas. Não usar force push, não apagar bibliotecas/arquivos versionados, não abrir janelas de navegador. Quando acabar o orçamento de execução ou houver bloqueio real, fornecer relatório de evidências, commits, falhas e próxima ação, sem prometer progresso assíncrono.
