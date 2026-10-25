# MovaLab Procedural

**Laboratório de importação e conversão de animações para personagens procedurais.**

> **Estado:** proposta técnica e estrutura inicial. **Não há importação FBX, retargeting ou pré-visualizador funcionando** nesta entrega. Nenhuma animação do Mixamo foi testada.

## Por que existe?

O **Game 2D — Aruan** utiliza um esqueleto matemático com coordenadas 3D invisíveis, cinemática inversa (IK) e desenho em **Canvas 2D puro**. Atualmente, `js/rig.js` cria movimentos com fórmulas e poses numéricas. O MovaLab pretende ler movimentos criados no Blender, Mixamo ou outras fontes e adaptá-los às **poses numéricas aceitas pelo animador**, sem renderizar modelos 3D no jogo.

## Local

Esta ferramenta vive em `tools/movalab/`, isolada do runtime do jogo. Nome exibido: **MovaLab Procedural**; nome curto: **MovaLab**. Outras ferramentas podem compartilhar `tools/`.

## Primeiro caminho técnico (proposto, não validado)

1. **Entrada:** um FBX real de caminhada (Mixamo ou Blender) fornecido pelo autor.
2. **Leitura offline:** um importador obtém hierarquia, timestamps e transformações dos ossos. Biblioteca/estratégia de importação só será escolhida depois da prova de conceito; não adicionar dependências ao jogo.
3. **Normalização:** corrigir orientação dos eixos, escala, pose de repouso e movimento da raiz.
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

## O que falta para a prova de conceito?

Um **FBX real** de caminhada escolhido no Mixamo e autorização explícita para adicionar **dependências somente à ferramenta** se necessárias. A Adobe disponibiliza o Mixamo gratuitamente com Adobe ID; o usuário baixa o FBX em sua própria conta. O jogo não deve depender do leitor FBX para rodar.

**Status de validação:** documentação inicial, sem testes de conversão executados. Não anunciar retargeting concluído sem arquivo fonte e comparação real.
