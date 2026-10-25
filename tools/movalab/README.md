# MovaLab Procedural

**Laboratório de importação e conversão de animações para personagens procedurais.**

> **Estado (25/10/2026):** leitura de **FBX binário** e avaliação experimental de hierarquia funcionando **offline** com o `Walking.fbx` real. **Retargeting para o Aruan, reprodução no Canvas e visualizador ainda NÃO existem**. [Prova de conceito e limites](docs/rig-v2-prototype.md).

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
