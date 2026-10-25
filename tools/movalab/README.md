# MovaLab Procedural

Ferramenta local do Game 2D — Aruan, em desenvolvimento. O jogo continua Canvas 2D/V1; Three.js existe somente no MovaLab.

## Executar

Na raiz do repositório:

~~~powershell
npm run movalab
~~~

Acesse manualmente http://127.0.0.1:5320. O inicializador instala three@0.180.0 apenas em tools/movalab/app, quando necessário. Depois da instalação, a prévia funciona offline. Encerre o servidor antigo antes de iniciar outro na mesma porta. Nenhuma janela é aberta automaticamente.

## Biblioteca

Copie FBX para workspace/sources/MixamoOriginalsPack, organizando Animations, AnimationsWithSkin e Characters3D. A abertura e o botão **Atualizar pasta** catalogam o conteúdo sem duplicar nem modificar os originais. Não existe botão de upload na interface.

Busca, status, categorias e favoritos ajudam a selecionar clipes. Origem/licença/categoria/favorito são editáveis e persistem em workspace/library.json. Fontes retiradas ficam indisponíveis; recolocá-las restaura o item. Substituir bytes no mesmo caminho atualiza hash/metadados e guarda o hash anterior. Alterações do workspace precisam de commit/push para chegar ao GitHub.

## Prévia 3D e compatibilidade

Escolha uma animação à esquerda e um personagem à direita. O original usa FBXLoader e AnimationMixer; malha, ossos e materiais vêm do FBX. Controles: reproduzir/pausar, início, scrub, repetição, velocidade0.25–2×, câmera orbital/frente/lado/costas/reset, malha/ossos/ambos, aramado, chão/grade, orientação/posição e movimento no lugar.

A troca de personagens usa um perfil humanoide semântico e deltas de rotação no espaço global em relação à pose neutra. Preserva translações locais dos membros e escala do destino; apenas o deslocamento do quadril recebe escala proporcional às pernas. Não se trata de retarget universal nem de IK/foot-lock completo. Juntas essenciais ausentes acionam fallback explícito para a origem; dedos ausentes indicam suporte parcial. kid:65 ossos; cabecudo:57, sem oito canais Pinky.

**Auditoria real atual:**41 FBX;34 animações, dois personagens7300 carregáveis e cinco6100 que exigem conversão. As34 animações foram avaliadas com kid e cabecudo em68 combinações numéricas, sem NaN e sem alteração de comprimentos locais. A extensão do FBXLoader corrige apenas o rodapé de uma cópia em memória, resolvendo17 arquivos7700 cujo alinhamento era interpretado como dados pelo loader r180. Originais intactos.

O Three.js limita skinning a quatro pesos por vértice e ignora o mapa ShininessExponent destes modelos. Texturas principais foram conferidas em Chrome; não alegamos equivalência perfeita de materiais ou aprovação humana contra o Mixamo. Capturas037/038 e tira de caminhada/corrida/idle registram a prévia. O palco pausado teve zero repinturas em12RAF estáveis; memória do renderer caiu para duas geometrias/uma textura após troca.

## Procedural Lab e Aruan

Ainda não entregues: Aruan3D Proxy, rigV2 Canvas, retarget procedural, export de clipes e player opt-in no estúdio. A aba atual informa essa pendência. Não substituir a V1 nem declarar MovaLab1.0 concluído pela prévia3D. A tag aruan-v1-rig-original preserva o commit1aadd07.

## Verificação

~~~powershell
npm run test:movalab
node tools/movalab/tests/pack-audit.cjs
node tools/movalab/tests/fbx-footer.mjs
node tools/movalab/tests/retarget.mjs
node tools/movalab/tests/real-pack.mjs --report
$env:MOVALAB_ALL_ASSETS='1'
node tools/movalab/tests/browser3d.cjs
npm test
npm run test:browser
~~~

Testes de API/browser usam workspaces temporários, não a biblioteca original. Para uma captura nova, defina MOVALAB_CAPTURE com prefixo numerado inédito, por exemplo039-movalab-marco. Confira as imagens antes de declarar sucesso visual. A auditoria numérica não decodifica imagens; o teste browser cobre a renderização real. O picoRSS do processo em lote foi608MiB, não uma medida do consumo contínuo da UI.

## Documentos

- [Handoff](docs/codex-astra-handoff.md)
- [Plano de arquitetura](docs/movalab-app-architecture.md) (histórico; o estado acima prevalece)
- [Auditoria do pack](docs/real-pack-2026-10-25.json)
- [Memória](../../memory-ai.md)

Issues:#61(pai),#63(biblioteca entregue),#64(prévia em validação),#65(legados/compatibilidade),#66(proxy/export futuro). Não fechar gates físicos nem confundir testes com aceite artístico.
