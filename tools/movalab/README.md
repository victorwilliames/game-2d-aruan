# MovaLab Procedural

**Laboratório de importação e conversão de animações para personagens procedurais.**

> **Estado (25/10/2026):** leitor FBX offline + **MovaLab Alpha 0.1 com interface local, importação, biblioteca persistente e player diagnóstico 3D** implementados. **Retargeting real para o Aruan Canvas, malha 3D skinned e export procedural ainda NÃO existem.** [Arquitetura completa](docs/movalab-app-architecture.md).

## Aplicativo visual local — Alpha 0.1 (primeiro incremento funcional)

**Agora existe uma interface executável**, em `tools/movalab/app/`, servida por `tools/movalab/service/server.cjs`, sem bibliotecas externas ou build. A interface foi criada primeiro para **library persistente + player diagnóstico de esqueleto FBX**. O plano integral (WebGL, Proxy skinned, conversor) permanece em [Arquitetura do aplicativo](docs/movalab-app-architecture.md).

### Como abrir (Windows, na raiz do repositório)

```powershell
git pull origin master
node tools/movalab/service/server.cjs
```

Abrir manualmente **http://127.0.0.1:5320** no navegador. O processo precisa ficar rodando enquanto usa o aplicativo. Para parar, usar `Ctrl+C` no terminal.

**Não precisa instalar Node modules, Three.js, Blender nem usar o servidor do jogo.** Requer Node.js 20+ (recomendado 22). O jogo principal continua em `http://localhost:5317` com `npm start`.

### Primeiro teste

1. Clicar em **Import Motion**.
2. Selecionar o `Walking.fbx` que já foi baixado em `Downloads`.
3. A animação aparece na biblioteca. O player mostra a **hierarquia 3D projetada no Canvas**; dar play, pausar, arrastar timeline e girar com mouse.
4. Alternar **Skeleton / Chibi proxy**: o segundo modo é uma **representação técnica aproximada**, **não um modelo 3D skinned calibrado nem a animação procedural final**.
5. Editar `Source`, `License` e `Review status`; clicar **Save metadata**.
6. Fechar e reabrir o servidor; a biblioteca e os metadados continuam disponíveis.

**Workspace de verdade:** `tools/movalab/workspace/library.json` (índice) e `tools/movalab/workspace/sources/<sha256>.fbx` (arquivos por hash). O diretório é criado **na primeira importação** e é ignorado pelo Git; não sincroniza com GitHub nem apaga automaticamente. Faça backup da pasta `workspace/` para preservar sua biblioteca caso perca o PC.

**Nota:** somente FBX Binary com hierarquia de animação é aceito neste incremento; arquivos FBX ASCII/GLB exigem próximo adaptador. `Without Skin` **funciona no modo Skeleton**. Nenhuma API de terceiros é consultada. O serviço escuta apenas `127.0.0.1`. Arquivos grandes são limitados a 24 MiB; clipes sem movimento são rejeitados.

### Testes locais

```powershell
node tools/movalab/tests/app.cjs
$env:MOVALAB_TEST_FBX="C:\Users\willi\Downloads\Walking.fbx"
node tools/movalab/tests/app.cjs
node tools/movalab/tests/fbx-reader.cjs $env:MOVALAB_TEST_FBX
npm test
npm run test:browser
```

A variável `MOVALAB_TEST_FBX` apenas indica uma **amostra existente no computador para testes**, não faz commit nem upload da animação. A suíte do app usa uma pasta temporária separada, não toca no `workspace` real.

### Próximo estágio (não entregue nesta Alpha)

- Reproduzir malha 3D real e `SkinnedMesh` com Three.js/WebGL, mantendo a ferramenta isolada do Canvas do jogo.
- Calibrar retarget humanoide com bind/rest pose e eixos; substituir o proxy aproximado por Aruan 3D técnico rigado.
- Abrir a segunda tela **Procedural Lab**, que agora é um roadmap visível, e executar exportação real para o Aruan V2 Canvas.
- Validar `FootPlant`, grip do arco, oito direções e FPS antes de ativar no jogo.

---

## Por que existe?

O **Game 2D — Aruan** utiliza um esqueleto matemático com coordenadas 3D invisíveis, cinemática inversa (IK) e desenho em **Canvas 2D puro**. Atualmente, `js/rig.js` cria movimentos com fórmulas e poses numéricas. O MovaLab pretende ler movimentos criados no Blender, Mixamo ou outras fontes e adaptá-los às **poses numéricas aceitas pelo animador**, sem renderizar modelos 3D no jogo.

## Local

Esta ferramenta vive em `tools/movalab/`, isolada do runtime do jogo. Nome exibido: **MovaLab Procedural**; nome curto: **MovaLab**. Outras ferramentas podem compartilhar `tools/`.

## Primeiro caminho técnico (proposto, não validado)

1. **Entrada:** FBX real de caminhada enviado pelo autor e validado como fonte para a prova de conceito. O FBX original não é versionado.
2. **Leitura offline (protótipo implementado):** `src/fbx-binary.cjs` lê hierarquia, timestamps e curvas; `src/rig-v2.cjs` avalia transforms 3D experimentalmente. Subconjunto FBX validado nesta amostra, sem dependências.
3. **Normalização (pendente):** corrigir orientação dos eixos, escala, pose de repouso e movimento da raiz.
4. **Retarget:** traduzir o movimento para o perfil de articulações e os campos de pose do Aruan. Resolver geometria e limites, não apenas trocar nomes de ossos.
5. **Saída:** dados de animação em formato versionado (proposta: JSON) para um **player próprio ainda a implementar**.
6. **Integração controlada:** adicionar suporte no animador, **preservando** IK, pés apoiados no mundo, pegada pela ponta do arco, simulação 1/120s e Canvas 2D.
7. **Aceite:** comparar caminhada frente/lado/costas e oito direções no tamanho real do jogo, verificar deformações, suavidade e patinação dos pés; medir custo.

## Não faz nesta entrega

- Não altera `js/rig.js`, Canvas, combate, cenário nem fluxo existente.
- Não instala Three.js, Blender, Python ou dependências de runtime.
- Não possui conversão universal automática de arquivos ou rigs arbitrários.
- Não faz upload nem distribui arquivos FBX de terceiros.

## Esqueletos e generalização

A ferramenta poderá ter perfis separados: `aruan` primeiro e outros para NPCs, inimigos ou chefes no futuro. Animações de humanoides compatíveis podem ser reaproveitadas; criaturas com ossos diferentes exigem perfis e adaptações próprios. Mãos/dedos só terão articulação individual se o rig de destino também possuir essa capacidade.

## Documentos

- [Arquitetura e critérios de teste](docs/architecture.md)
- [Issue de escopo](https://github.com/victorwilliames/game-2d-aruan/issues/60)
- [Instruções do projeto](../../AGENTS.md) e [memória entre IAs](../../memory-ai.md)

## Teste atual e próximos passos

O autor **já forneceu** um `Walking.fbx` real. É possível rodar, sem dependências extras:

```powershell
node tools/movalab/src/inspect-fbx.cjs "C:\\CAMINHO\\Walking.fbx"
node tools/movalab/tests/fbx-reader.cjs "C:\\CAMINHO\\Walking.fbx"
```

A amostra contém 65 ossos, 315 curvas de animação e 32 instantes ao longo de aproximadamente 1,0333 segundo. O perfil de 65 ossos conferiu com a estrutura de pais do Mixamo. **Este teste não comprova uma caminhada funcional no Aruan.** Falta a transformação para sua bind pose chibi e a integração com o Canvas/IK. Ver [relatório técnico](docs/rig-v2-prototype.md).

Nenhuma biblioteca foi adicionada ao jogo e os FBX originais não devem ser incluídos no Git.
