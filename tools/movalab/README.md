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

Implementação experimental funcional: Aruan 3D Proxy com SkinnedMesh/65 ossos/pesos reais; conversão FBX → rig humanoide → poses/alvos IK; comparação sincronizada com o renderer Canvas real; ajustes de quadril/braços/passo/pés/cabeça/intensidade/root; presets persistentes; salvar clipes na biblioteca e baixar JSON versionado.

No estúdio inspecao.html, V1 continua padrão. Importe um arquivo aruan-clip.v1.json para ativar V2 experimental; volte à V1 pelo seletor. A caminhada real exportada já está em workspace/exports/mixamo-walking.aruan-clip.v1.json. Oito direções/dois ciclos, apoios e retorno aos mesmos pixels da V1 passaram em Chrome. Não se trata de migração do jogo: index.html continua sem player externo, Three.js ou parser FBX. A tag aruan-v1-rig-original preserva o commit1aadd07.

O diagnóstico do Lab usa o solver real a120Hz, conferindo alcance IK, comprimentos, apoios e limite inferior da cabeça. Das34 animações do pack,32 passaram numericamente; `falling to roll` e `hard landing` precisam de ajuste por atravessar o piso. O resultado numérico não aprova arte. Relatório em `docs/procedural-pack-report.json`.

O editor permite recortar início/fim na fonte, pedir repetição quando a junção for compatível, adicionar/remover/buscar marcadores e reabrir clipes salvos pelo seletor **Banco procedural**. O tempo da referência inclui o início do recorte; o Canvas começa em zero com raiz normalizada. Marcadores preservam o instante original ao mudar o recorte. O banco valida o hash dos bytes canônicos ao carregar; uma fonte ausente permite Canvas, mas oculta a comparação3D. A caminhada de demonstração já está registrada no banco, sem duplicar seu JSON. Saídas acima de16MiB pedem recorte menor.

Em **Mapeamento e limites**, cada um dos65 canais pode usar um osso da fonte, o automático ou ficar sem canal. Perfis são salvos nos presets e clipes. Ossos ausentes, nomes ambíguos e um osso usado por dois canais são rejeitados; nomes repetidos na seleção são identificados pelo índice e nome do nó. O modo automático preserva os pares de transformação/skin do FBX (117 nós para65nomes no StartWalking com malha). Nomes duplicados em ramos distintos exigem perfil explícito. A API numérica também aceita perfil de destino; a UI atual tem destino fixo AruanV2.

Limites: dedos são guardados na hierarquia, mas o renderer Canvas ainda desenha punhos fixos; ataques externos não geram acertos nem equipamento automático. Faltam transições, calibração adicional entre posesT/A e controles avançados. Qualidade artística final não aprovada. Não declarar MovaLab1.0 concluído.

## Formatos antigos e GLB

A UI oferece preparação opcional do conversor Python/ufbx e conversão individual/em lote dos cinco FBX6100. Cada execução guarda hash da fonte, versão, hash do conversor, derivado e diagnóstico em `workspace/derived/`; não altera o original. O cache é invalidado se fonte ou conversor mudarem. Não é necessário Blender.

GLB2 com malha/skin é carregado por GLTFLoader; o catálogo diferencia modelos estáticos de animações. Os cinco legados foram convertidos, carregados e animados por retarget no Chrome headless. Texturas difusas PNG/JPEG embutidas são preservadas byte a byte; o navegador confirmou imagens decodificadas. `gordo`, `male-realista` e `theboss` mantêm suas texturas; os dois YBots não as contêm. Mapas normais/especulares não são transferidos, e o limite de quatro pesos perde até3,26% da massa de pesos no male-realista. Relatório: `docs/legacy-service-report.json`, capturas042/043. Conversão não é equivalência visual universal.

## Verificação

~~~powershell
npm run test:movalab
node tools/movalab/tests/pack-audit.cjs
node tools/movalab/tests/fbx-footer.mjs
node tools/movalab/tests/retarget.mjs
node tools/movalab/tests/proxy.mjs
node tools/movalab/tests/procedural.mjs --write
node tools/movalab/tests/real-pack.mjs --report
node tools/movalab/tests/legacy-service.cjs --report
node tools/movalab/tests/procedural-pack.mjs
$env:MOVALAB_ALL_ASSETS='1'
node tools/movalab/tests/browser3d.cjs
npm test
npm run test:browser
node tests/headless.cjs --smoke --clip-only
~~~

Testes de API/browser usam workspaces temporários, não a biblioteca original. Para uma captura nova, defina MOVALAB_CAPTURE com prefixo numerado inédito, por exemplo039-movalab-marco. Confira as imagens antes de declarar sucesso visual. A auditoria numérica não decodifica imagens; o teste browser cobre a renderização real. O picoRSS do processo em lote foi608MiB, não uma medida do consumo contínuo da UI.

## Documentos

- [Handoff](docs/codex-astra-handoff.md)
- [Plano de arquitetura](docs/movalab-app-architecture.md) (histórico; o estado acima prevalece)
- [Auditoria do pack](docs/real-pack-2026-10-25.json)
- [Memória](../../memory-ai.md)

Issues:#61(pai),#63(biblioteca entregue),#64(prévia em validação),#65(legados/compatibilidade),#66(proxy/export implementado experimentalmente, polimento pendente). Não fechar gates físicos nem confundir testes com aceite artístico.
