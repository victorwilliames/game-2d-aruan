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

### Fluxo até o jogo — #67

O MovaLab é o estúdio principal: **1 Animação/personagem → 2 Conferir no Canvas → 3 Gatilho/conflitos → 4 Testar no jogo**. Depois de converter/carregar um clipe, clique em **Avançar: definir gatilho**, escolha parado/andar/correr ou ação por tecla e **Aplicar no jogo**. A sugestão vem do nome e precisa ser confirmada. Espaço já pertence à cambalhota; o aplicativo exige outra tecla ou confirmação explícita de substituição. Vínculos existentes também exigem resolução. Abra/recarregue o jogo para carregar a configuração salva em `workspace/game-bindings.json`.

O jogo passa a amostrar JSONs convertidos no controlador real. O controlador mantém a movimentação em mundo e FootPlant; o deslocamento do FBX não é somado novamente. Ataques/cambalhota originais continuam como fallback quando não substituídos. **Ações por tecla reproduzem movimento, sem implementar automaticamente dano, física de pulo ou skills.** Há um botão para restaurar as animações originais. O manifesto inicia vazio: não ativa nada sem **Aplicar no jogo**.

O modo leve básico usa resolução limitada aDPR1, sem MSAA/sombras3D; **Melhorias visuais** habilita sombras e atéDPR2. Palco oculto não renderiza, e a etapa3 não reamostra a referência. Não há decimação automática das malhas neste marco. 200FPS continua meta não certificada; depende do custo, GPU e taxa da tela. A inspeção antiga não é etapa obrigatória.

Implementação experimental funcional: Aruan 3D Proxy com SkinnedMesh/65 ossos/pesos reais; conversão FBX → rig humanoide → poses/alvos IK; comparação sincronizada com o renderer Canvas real; ajustes de quadril/braços/passo/pés/cabeça/intensidade/root; presets persistentes; salvar clipes na biblioteca e baixar JSON versionado.

No estúdio inspecao.html, V1 continua padrão. Importe um arquivo aruan-clip.v1.json para ativar V2 experimental; volte à V1 pelo seletor. A caminhada real exportada já está em workspace/exports/mixamo-walking.aruan-clip.v1.json. Oito direções/dois ciclos, apoios e retorno aos mesmos pixels da V1 passaram em Chrome. Não se trata de migração do jogo: index.html agora pode carregar clipes JSON pela configuração explícita da etapa3, sem Three.js ou parser FBX. A tag aruan-v1-rig-original preserva o commit1aadd07.

O diagnóstico do Lab usa o solver real a120Hz, conferindo alcance IK, comprimentos, apoios e limite inferior da cabeça. Das34 animações do pack,32 passaram numericamente; `falling to roll` e `hard landing` precisam de ajuste por atravessar o piso. O resultado numérico não aprova arte. Relatório em `docs/procedural-pack-report.json`.

O editor permite recortar início/fim na fonte, pedir repetição quando a junção for compatível, adicionar/remover/buscar marcadores e reabrir clipes salvos pelo seletor **Banco procedural**. O tempo da referência inclui o início do recorte; o Canvas começa em zero com raiz normalizada. Marcadores preservam o instante original ao mudar o recorte. O banco valida o hash dos bytes canônicos ao carregar; uma fonte ausente permite Canvas, mas oculta a comparação3D. A caminhada de demonstração já está registrada no banco, sem duplicar seu JSON. Saídas acima de16MiB pedem recorte menor.

O banco inclui demonstrações reais de caminhada, corrida e idle. No estúdio, importe os JSONs e escolha **Troca de clipe** (imediata/0,15/0,30/0,60 s). A seleção combina pose e raiz por tempo absoluto, ajusta a fase pelos apoios e mantém os pontos de apoio comuns até levantar os pés. A origem continua sendo amostrada durante o fade; interromper uma troca conserva pose e velocidade da raiz. Ao terminar, o estado da origem é liberado. Pausa, quadros e oito vistas usam o mesmo estado. Um clipe menor que o fade termina a transição antes de parar. Trocas com IK inviável recebem diagnóstico, sem certificação universal.

As pequenas junções dos pés são corrigidas durante o trecho aéreo, preservando apoios. `inspectLoop` verifica posição/orientação dos pés e raiz na volta; o salto de 1,15 unidade da corrida foi eliminado. Pequena deriva da raiz em apoio contínuo é removida; uma deriva grande desativa o loop. Os 22 clipes configurados para repetir passaram nesse diagnóstico. Isso não certifica toda a estética do loop nem mistura os canais da hierarquia 3D entre clipes: a transição atual atua nas poses/alvos do Canvas.

Perfil inicial de custo em `docs/clip-performance-report.json`: Chrome headless com GPU desativada, 1600×900, 30 amostras por cenário; com 1/5/10 instâncias, p95 de amostragem+IK de 0,1/0,5/0,5 ms e geometria/comandos Canvas de 5,2/106,5/143,2 ms. A pintura é o principal custo nessa coleta; não são FPS, tempo de GPU, validação de hardware modesto nem integração de NPCs no jogo.

Em **Mapeamento e limites**, cada um dos65 canais pode usar um osso da fonte, o automático ou ficar sem canal. Perfis são salvos nos presets e clipes. Ossos ausentes, nomes ambíguos e um osso usado por dois canais são rejeitados; nomes repetidos na seleção são identificados pelo índice e nome do nó. O modo automático preserva os pares de transformação/skin do FBX (117 nós para65nomes no StartWalking com malha). Nomes duplicados em ramos distintos exigem perfil explícito. A API numérica também aceita perfil de destino; a UI atual tem destino fixo AruanV2.

A calibração anatômica usa a direção do filho semântico e um eixo de referência do corpo para compatibilizar posesT/A e eixos locais dos ossos, mantendo torção inclusive ao cruzar180°. A direção dos membros de kid/cabecudo foi comparada com a fonte em61instantes: erro vetorial abaixo de7e-9; comprimentos preservados. Testes sintéticos cobremT↔A, escala, yaw e offsets animados. Isso não certifica rigs arbitrários nem arte.

Limites: dedos são guardados na hierarquia, mas o renderer Canvas ainda desenha punhos fixos; ataques externos não geram acertos nem equipamento automático. Faltam controles avançados, transição da hierarquia3D/V1↔V2 completa, correção de roll/landing e polimento. Qualidade artística final não aprovada. Não declarar MovaLab1.0 concluído.

## Formatos antigos e GLB

A UI oferece preparação opcional do conversor Python/ufbx e conversão individual/em lote dos cinco FBX6100. Cada execução guarda hash da fonte, versão, hash do conversor, derivado e diagnóstico em `workspace/derived/`; não altera o original. O cache é invalidado se fonte ou conversor mudarem. Não é necessário Blender.

GLB2 com malha/skin é carregado por GLTFLoader; o catálogo diferencia modelos estáticos de animações. Os cinco legados foram convertidos, carregados e animados por retarget no Chrome headless. Texturas difusas PNG/JPEG embutidas são preservadas byte a byte; o navegador confirmou imagens decodificadas. `gordo`, `male-realista` e `theboss` mantêm suas texturas; os dois YBots não as contêm. Mapas normais/especulares não são transferidos, e o limite de quatro pesos perde até3,26% da massa de pesos no male-realista. Relatório: `docs/legacy-service-report.json`, capturas042/043. Conversão não é equivalência visual universal.

## Verificação

~~~powershell
npm run test:movalab
node tools/movalab/tests/pack-audit.cjs
node tools/movalab/tests/fbx-footer.mjs
node tools/movalab/tests/retarget.mjs
node tools/movalab/tests/retarget-rest.mjs
node tools/movalab/tests/proxy.mjs
node tools/movalab/tests/procedural.mjs --write
node tools/movalab/tests/clip-transitions.mjs --write
node tools/movalab/tests/real-pack.mjs --report
node tools/movalab/tests/legacy-service.cjs --report
node tools/movalab/tests/procedural-pack.mjs
$env:MOVALAB_ALL_ASSETS='1'
node tools/movalab/tests/browser3d.cjs
npm test
npm run test:browser
node tests/headless.cjs --smoke --clip-only
node tests/headless.cjs --smoke --transition-only --clip-performance
~~~

Testes de API/browser usam workspaces temporários, não a biblioteca original. Para uma captura nova, defina MOVALAB_CAPTURE com prefixo numerado inédito, por exemplo039-movalab-marco. Confira as imagens antes de declarar sucesso visual. A auditoria numérica não decodifica imagens; o teste browser cobre a renderização real. O picoRSS do processo em lote foi608MiB, não uma medida do consumo contínuo da UI.

## Documentos

- [Handoff](docs/codex-astra-handoff.md)
- [Plano de arquitetura](docs/movalab-app-architecture.md) (histórico; o estado acima prevalece)
- [Auditoria do pack](docs/real-pack-2026-10-25.json)
- [Memória](../../docs/memory-ai.md)

Issues:#61(pai),#63(biblioteca entregue),#64(prévia em validação),#65(legados/compatibilidade),#66(proxy/export implementado experimentalmente, polimento pendente). Não fechar gates físicos nem confundir testes com aceite artístico.
