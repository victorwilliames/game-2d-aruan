# MovaLab Procedural — Plano de arquitetura do aplicativo

**Status:** projeto de implementação (não confundir com funcionalidade entregue)  
**Versão do plano:** 1.0 · 25/10/2026  
**Repositório:** `victorwilliames/game-2d-aruan` · **branch principal:** `master`  
**Issue relacionada:** [#61 — Aruan Rig V2](https://github.com/victorwilliames/game-2d-aruan/issues/61)  
**Base protegida:** tag `aruan-v1-rig-original` → `1aadd07f4bef562d347f5366b8918f5a1cf559cf`  
**Escopo:** ferramenta local de desenvolvimento, **fora do runtime do jogo**.

> **Objetivo em uma frase:** importar animações humanoides 3D, catalogá-las, pré-visualizá-las num boneco-fonte e num **Aruan 3D Proxy** e, numa segunda interface, convertê-las com ajustes e validação para clips executáveis pelo **Aruan procedural em Canvas 2D**.

## 1. Decisões do produto

1. **Duas áreas distintas, no mesmo aplicativo:**
   - **Library / 3D Preview:** importar, catalogar, buscar, inspecionar, comparar e aprovar motions.
   - **Procedural Lab:** retargeting para o Rig V2 do Aruan, ajustes, foot-lock, comparação visual A/B e exportação.
2. **O Aruan 3D Proxy é ferramenta de prévia**, não substitui a arte chibi/HQ do jogo. Precisa de *mesh*, hierarquia de ossos, *bind pose* e *skin weights*, mesmo que a malha comece simples.
3. **Preview 3D pode usar Three.js dentro de `tools/movalab`**, mas **`index.html` e `inspecao.html` do jogo continuam 100% Canvas 2D**, sem WebGL, engine ou dependência adicional de runtime.
4. **Biblioteca local persistente**, com importações sucessivas de arquivos do computador e prevenção de duplicatas. **Não é uma integração direta com a conta do Mixamo**; não pressupor MCP/API oficial, fazer scraping ou armazenar credenciais.
5. **Conversão NÃO é só renomear ossos:** envolve pose neutra, sistemas de eixos, orientação local, proporções chibi, alvos de IK e eventos de contato.
6. **Aceite visual é obrigatório.** Ler FBX, passar em teste ou mostrar o boneco caminhando em 3D **não significa** que a animação já funciona no Aruan Canvas.
7. **Começar local-first, no navegador**, acessado via servidor Node na máquina do autor. Empacotamento como desktop só depois que o fluxo estiver estável.

## 2. Situação existente no GitHub

| Componente | Estado conferido | Local |
|---|---|---|
| Leitor FBX binário offline | Implementado, subconjunto do formato | `src/fbx-binary.cjs` |
| Inspeção FBX por linha de comando | Implementada | `src/inspect-fbx.cjs` |
| Avaliação hierárquica experimental | Implementada, requer calibração de rotações/rest pose | `src/rig-v2.cjs` |
| Perfil humanoide proposto | 65 ossos e mapa semântico inicial | `src/aruan-v2-profile.cjs` |
| Testes de FBX | Teste com amostra real informado como verde | `tests/fbx-reader.cjs` |
| UI / banco de animações | **Ainda não implementados** | Este plano |
| Proxy 3D skinned do Aruan | **Ainda não implementado** | Este plano |
| Retarget para Rig V2 e Canvas | **Ainda não implementado** | Issue #61 |
| Player de clip procedural no jogo | **Ainda não implementado** | Issue #61 |

A amostra `Walking.fbx` já analisada possui **65 ossos, 315 curvas, 32 instantes e aproximadamente 1,0333 s**. Foi exportada **Without Skin**: pode não ter malha visível no visor-fonte, então o app deve desenhar o **esqueleto por linhas/cápsulas**, independentemente da presença de mesh.

O usuário já concluiu a sincronização da `master`, com checkpoint V1 permanente. Não duplicar o jogo em ZIP/repositório novo.

## 3. Arquitetura de alto nível

```text
FONTES EXTERNAS (uso manual e licenciado)
Mixamo (.fbx) ───────┐
Quaternius (.glb/.fbx quando disponíveis) ─┤
ActorCore (.fbx) ────┤
Rokoko / iClone / AccuRIG (export compatível) ─┘
                         │ Upload explícito de arquivo local
                         ▼
┌────────────────────────────────────────────────────────────┐
│ MovaLab: serviço LOCAL de importação + biblioteca          │
│ valida arquivo → SHA-256 → extrai metadados → salva asset   │
│ separa original, metadados, derivados e histórico           │
└──────────────────────────────┬─────────────────────────────┘
                               │
                ┌──────────────▼───────────────┐
                │ TELA 1 — Library / 3D Preview│
                │ rig fonte ↔ Aruan 3D Proxy   │
                │ play / timeline / diagnóstico │
                │ revisar, salvar, aprovar      │
                └──────────────┬───────────────┘
                               │ "Abrir no Procedural Lab"
                ┌──────────────▼────────────────────────────┐
                │ TELA 2 — Procedural Lab                    │
                │ source → normalizar → retarget → IK        │
                │ 3D referência ↔ Canvas Aruan V2 (opcional)│
                │ ajustar, marcar contatos, validar         │
                └──────────────┬────────────────────────────┘
                               │ export versionado
                ┌──────────────▼───────────────┐
                │ aruan-clip.v1.json            │
                │ só poses + eventos + metadados│
                └──────────────┬───────────────┘
                               │ integração aprovada
                               ▼
                     JOGO ARUAN (Canvas 2D)
                  Animator V1 / Player V2 opt-in
                     IK + FootPlant + desenho
```

**Regra:** a criação/conversão cara acontece **offline no MovaLab**. O jogo recebe somente dados compactos e interpola valores numéricos durante o loop habitual de 1/120 s; não interpreta FBX e não instancia Three.js.

## 4. Stack proposta e justificativa

| Camada | Tecnologia recomendada | Por quê |
|---|---|---|
| Interface | **React + Vite + TypeScript** dentro do app | Componentes, formulários, biblioteca, estado previsível; isolado do jogo |
| Viewport 3D | **Three.js** direto (primeiro MVP) | OrbitControls, SkeletonHelper, SkinnedMesh, AnimationMixer, GLTFLoader e FBXLoader |
| Leitura/canonicalização | Node.js, reaproveitando `src/fbx-binary.cjs` | Processamento determinístico, CLI e testes offline |
| Serviço local | Node.js com rotas HTTP dedicadas ao MovaLab | Upload e persistência em disco sem nuvem |
| Armazenamento MVP | **JSON de índice + arquivos por hash SHA-256** | Simples, portável, sem banco externo; escrita atômica e backup |
| Evolução do banco | SQLite se consultas/volume exigirem | Busca e relacionamento maiores; **não é obrigatório no MVP** |
| Formatos | **FBX Binary** e **GLB/glTF 2.0** nas rotas compatíveis | Mixamo/ActorCore e ecossistema aberto |
| Testes | `node:test`, Vite typecheck e Chrome headless/Playwright apenas no app | Qualidade sem poluir os testes do jogo |

**Decisão sobre Three.js:** é dependência **de ferramenta**, explicitamente isolada em `tools/movalab/app/package.json`. **Não acrescentar** Three.js, React ou Vite ao `package.json` da raiz do jogo.

**Por que não Electron inicialmente?** Criar uma interface web local custa menos em distribuição/manutenção. Quando validada, avaliar empacotar o mesmo app como Tauri/Electron. O usuário **não** precisa de Blender ou AccuRIG para abrir o MVP com proxy geométrico provisório.

**Importante sobre o importador:** usar o `FBXLoader` do Three.js para **preview**, como implementação de referência; manter nosso leitor Node para diagnóstico/export offline. Comparar rotações e `bind pose` entre ambos antes de declarar o parser próprio totalmente correto. Render 3D não deve depender apenas do parser experimental.

## 5. Tela 1 — Library / 3D Preview

```text
┌────────────────────────────────────────────────────────────────────────┐
│ MovaLab Procedural   [Library] [Procedural Lab]    [+ Import Animation]│
├──────────────────────┬──────────────────────────────┬──────────────────┤
│ BUSCAR / FILTRAR     │       VIEWPORT 3D            │ INSPECTOR        │
│ walking ...          │                              │ Personagem:      │
│ Locomotion           │   source | Aruan 3D Proxy    │ • Source rig     │
│ Combat               │                              │ • Aruan proxy    │
│ Idle / Gesture       │    mesh / bones / grid       │                  │
│ Fonte / licença      │                              │ Duration / FPS   │
│ Status / tags        │                              │ Ossos / aviso    │
│                      ├──────────────────────────────┤ Root motion      │
│ Clips importados     │ ◀▶ Play  [━━━━●━━━━] 1.0×     │ Loop / In Place  │
│ ✓ Walking            │ Events / foot contacts       │                  │
│ · Happy Walk         │                              │ [Approve]        │
│ · Idle               │                              │ [Procedural Lab] │
└──────────────────────┴──────────────────────────────┴──────────────────┘
```

**MVP indispensável:**

- Upload múltiplo `.fbx`/`.glb` selecionado pelo usuário; drag-and-drop opcional.
- Detectar arquivo inválido, mostrar tamanho, hash, procedência, licença e problemas de leitura.
- Persistir no computador; ao reabrir o app, listar todos os clipes anteriores.
- Evitar cópia duplicada do mesmo conteúdo; permitir mesmo nome para arquivos diferentes e versões de metadados.
- Player com play/pause, loop, scrub, taxa 0.5×/1×/2× e reinício determinístico.
- `Source Skeleton`: mostrar ossos mesmo quando o FBX estiver *Without Skin*.
- `Aruan 3D Proxy`: animar uma malha articulada com hierarquia destinatária; **quando ainda não houver retarget, indicar claramente "Preview do destino indisponível"**, não fingir que bone source = bone destination.
- Modos malha / ossos / ambos, grade, câmera orbital, reset de câmera e captura de comparação.
- Diagnósticos (missing bones, rotações inválidas, dados ignorados, root motion, suspeita de escala).
- Estados `imported`, `needs-mapping`, `ready`, `approved`, `exported`, `error`.
- A seleção do clip deve abrir a mesma animação na segunda tela sem re-upload.

**Não incluir no MVP:** login, loja, colaboração remota, edição não linear tipo iClone, marketplace, conexão automática com Mixamo.

## 6. Aruan 3D Proxy — especificação

### 6.1. O que é e o que não é

É um **boneco técnico chibi** que lembra a silhueta do Aruan, para avaliar **movimento tridimensional**. Não é o personagem final, não tem que reproduzir o cabelo/cel-shading do jogo, e **não prova** que a pintura Canvas consegue acompanhar cada dedo.

### 6.2. Implementação incremental

**Proxy A, independente de programas externos:**
- Gerar no próprio Three.js geometria básica para cabeça grande, peito, bacia, braços, pernas, pés e mãos.
- Adicionar ossos em uma hierarquia humanoide própria, `SkinnedMesh` e pesos básicos, ou segmentos rigidamente anexados aos respectivos bones.
- Registrar `restPose`, comprimentos, eixo da frente, eixo vertical, origem no quadril e regras de escala do Aruan.
- Mostrar opção de esqueleto técnico com articulações completas dos dedos **se o rig existir**, mesmo que a malha inicial tenha mãos simples.
- Arco é prop de depuração opcional, segurado **pela ponta**, sem alterar lógica de combate.

**Proxy B, opcional e mais bonito:**
- Modelar um chibi 3D mais fiel, exportar **GLB**, gerar/ajustar rig com **AccuRIG** se desejado; importar o resultado no MovaLab.
- AccuRIG recebe **malha 3D** em A/T-pose: **não recebe diretamente Canvas, código procedural nem imagem isolada**. A criação de malha continua sendo necessária.
- O rig e a geometria devem ser versionados separadamente: o **perfil de rig** é a referência de retarget; a **malha** é substituível.

**Decisão:** **começar com Proxy A** para não travar todo o projeto na criação artística 3D. Proxy B é melhoria, não pré-requisito.

## 7. Tela 2 — Procedural Lab

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Procedural Lab  ◀ Library   Clip: Walking   Profile: Aruan Rig V2     │
├───────────────────┬───────────────────────────────┬────────────────────┤
│ MAPPING           │ COMPARAÇÃO A/B                │ CONTROLES          │
│ Hips → Pelve      │                              │ Stride length      │
│ Spine → Torso     │ [Referência 3D] [Canvas 2D]  │ Hip sway           │
│ Head → Cabeça     │                              │ Arm swing          │
│ Hands → IK targets│ [Pose / Contato / Orientação]│ Foot lock          │
│ Feet → IK targets │                              │ Scale / Forward    │
│ Fingers → ...     │                              │ Smoothing          │
├───────────────────┴───────────────────────────────┴────────────────────┤
│ Timeline:   L foot contact  |  R foot contact  |  Loop start/end     │
│ [Validate]   [Save preset]   [Export JSON]   [Test in Studio (opt-in)] │
└────────────────────────────────────────────────────────────────────────┘
```

**Pipeline interno obrigatório:**

1. **Ler origem:** bones, propriedades locais, curvas e timestamps do FBX/GLB.
2. **Normalizar:** eixos, unidades, escala, handedness, hierarquia, `PreRotation/PostRotation` e `rest/bind pose`.
3. **Amostragem contínua:** usar *quaternion slerp* para rotações e interpolação adequada para translações, sem interpolar ângulos Euler ingenuamente na fronteira ±180°.
4. **Retarget humanoide:** extrair orientações relativas à pose neutra e adaptar ao perfil destinatário e às proporções chibi.
5. **IK/contato:** gerar metas de pés/mãos e fases de apoio; preservar `FootPlant` no **mundo** e não substituir seu controle por posição de pé local.
6. **Camada procedural:** escolher o que vem do clip e o que continua gerado por regras (respiração, correção de apoio, equipamento, expressão, transição).
7. **Preview A/B:** referencial 3D versus Aruan **real em Canvas**, com marcador explícito para etapa ainda não disponível.
8. **Exportar:** asset leve versionado e **validado**. Nunca exportar dados binários FBX para o runtime.

**Ajustes por clip:** escala de passo, altura do quadril, inclinação, balanço de braço, suavização, offsets do root, começo/fim do loop, contatos L/R, ativação/desativação de dedos e tags de eventos (impacto, gesto etc.). Presets são armazenados por perfil e não modificam silenciosamente o original.

**Qualidade:** a caminhada é a prova inicial, não prometer transferência automática universal para luta com arma, criaturas ou interações complexas. Ataques exigir-se-ão eventos de acerto, posição da mão e regras de grip adicionais.

## 8. Layout de pastas proposto

Manter todos os novos componentes dentro de `tools/movalab/`:

```text
tools/movalab/
├── README.md
├── .gitignore
├── docs/
│   ├── architecture.md                  # documento histórico inicial
│   ├── rig-v2-prototype.md               # leitura FBX real e limitações
│   └── movalab-app-architecture.md       # ESTE PLANO
├── src/                                  # Node offline EXISTENTE
│   ├── fbx-binary.cjs
│   ├── inspect-fbx.cjs
│   ├── rig-v2.cjs
│   ├── aruan-v2-profile.cjs
│   ├── normalize-motion.cjs              # FUTURO
│   ├── retarget.cjs                      # FUTURO
│   └── export-clip.cjs                   # FUTURO
├── tests/
│   └── fbx-reader.cjs                    # existente; ampliar depois
├── app/                                  # NOVO, separação completa
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── main.tsx
│   │   ├── pages/LibraryPage.tsx
│   │   ├── pages/ProceduralLabPage.tsx
│   │   ├── components/AnimationLibrary.tsx
│   │   ├── components/MotionTimeline.tsx
│   │   ├── components/ThreePreview.tsx
│   │   ├── components/CanvasComparison.tsx
│   │   ├── three/AruanProxy.ts
│   │   ├── three/SourceSkeleton.ts
│   │   └── api/client.ts
│   └── public/
├── service/                               # NOVO, Node local
│   ├── server.cjs
│   ├── library.cjs
│   └── import.cjs
└── workspace/                             # LOCAL; IGNORADO PELO GIT
    ├── library.json
    ├── sources/<sha256>/
    ├── proxies/
    ├── previews/
    ├── presets/
    └── exports/
```

**Os arquivos existentes não devem ser movidos agora.** Os nomes `FUTURO/NOVO` são propostas de destino, não alegações de código já entregue.

## 9. Biblioteca de animações: modelo de dados

Adotar um **ID lógico imutável** por registro e um **hash do conteúdo** para deduplicação, mantendo o nome amigável e os metadados editáveis. Exemplo de índice (ilustrativo):

```json
{
  "schemaVersion": 1,
  "animations": [
    {
      "id": "motion_walk_001",
      "title": "Walking",
      "source": "Mixamo",
      "sourceFile": "Walking.fbx",
      "sha256": "<calculado-ao-importar>",
      "format": "fbx",
      "durationSeconds": 1.0333,
      "sourceSampleRate": 30,
      "boneCount": 65,
      "rigProfileId": "mixamo-humanoid",
      "tags": ["locomotion", "walk"],
      "license": {
        "sourceUrl": "https://www.mixamo.com/",
        "userConfirmedUsageRights": false,
        "notes": "Verificar termos de uso"
      },
      "rootMotion": "in-place",
      "status": "imported",
      "importedAt": "<timestamp-gerado-no-import>",
      "derivedVersions": []
    }
  ]
}
```

**Esses números são da amostra de referência; não cadastrá-la automaticamente enquanto o arquivo não for importado pelo app local.**

**Importação repetida:** mesmo hash → reutilizar bytes, oferecer vincular/importar metadados; hash novo → registrar nova mídia; conversões/previews com hash da origem + versão do perfil + preset + versão do conversor. Persistir índice por escrita atômica com backup; tratar renomeações sem quebrar vínculos.

**Workspace** fica fora do Git e **não deve ser apagado por comandos de limpeza**, testes ou build. Documentar uma ação de backup/export da biblioteca e outra de restaurar a biblioteca com checagem de hashes. O browser não acessa `C:\Users\...` automaticamente; ele recebe arquivos explicitamente selecionados ou servidos pela API local.

**Segurança do importador:** limites de bytes/quantidade, assinatura real de formato, validação de arrays/hierarquia, travas contra zip bombs/path traversal, sem execução de scripts embutidos e processamento local. Não expor o serviço em `0.0.0.0` por padrão: escutar somente em `127.0.0.1`, política de origem restrita e sem upload para nuvem.

## 10. Contrato de exportação procedural (proposta v1)

O output deve ser **asset por clip**, não código JavaScript gerado nem modelo 3D. Exemplo conceitual:

```json
{
  "schemaVersion": "aruan-clip.v1",
  "name": "walk_mixamo_v1",
  "rig": "aruan-v2",
  "loop": true,
  "durationSeconds": 1.0333,
  "sampleRate": 30,
  "coordinates": {
    "x": "front",
    "y": "left",
    "z": "up",
    "units": "aruan-cm"
  },
  "channels": ["pelvis", "chest", "head", "leftHandIK", "rightHandIK", "leftFootIK", "rightFootIK"],
  "frames": [
    {
      "t": 0,
      "pose": {
        "pelvis": [0, 0, 0],
        "leftFootIK": [0, 0, 0],
        "rightFootIK": [0, 0, 0]
      }
    }
  ],
  "events": [
    { "time": 0, "kind": "foot-contact", "side": "left" }
  ],
  "sourceId": "motion_walk_001",
  "converterVersion": "0.1.0"
}
```

**NÃO é o schema definitivo** nem clip utilizável agora; define conceitos a validar com o `Animator`/`FootPlant` real. Os arrays acima são placeholders de contrato, não posições extraídas. O código do jogo deve rejeitar versão desconhecida, timestamps não monótonos, NaN e campos inesperados.

**Controle de FPS:** 30 amostras/s na origem não limitam o jogo a 30 FPS. O player amostra/interpola pelo tempo da simulação 1/120 s e desenha conforme a cadência do dispositivo. Evitar interpolação per-frame cara desnecessária; pré-calcular o que for possível e medir memória/CPU.

## 11. Integração com softwares existentes

| Ferramenta | Aproveitamento sensato | Dependência obrigatória? |
|---|---|---|
| **Mixamo** | Fonte de FBX com rig conhecido; arquivos importados manualmente | Não |
| **Quaternius Universal Animation Library 2** | Banco CC0 com 130+ motions, versões root motion on/off e teste de retarget | Não |
| **ActorCore** | Biblioteca de motions gratuitos/licenciados; download manual e atribuição de direitos | Não |
| **AccuRIG** | Rig automático para uma malha 3D real do Proxy B; refinamento de mãos/dedos | Não (apenas Proxy B) |
| **iClone Personal** | Editor/retarget externo para clips difíceis; checar limites do plano e exportação | Não |
| **Rokoko Studio** | Captura e refinamento de mocap autoral, exportando arquivo compatível | Não |

**Licenças:** registrar `source`, URL, titular, versão do pack, licença e eventual obrigação de atribuição para cada importação. Gratuidade de download **não equivale** à licença universal CC0. **Não incluir motions ou meshes de terceiros no Git** por padrão; as restrições de redistribuição e uso precisam ser verificadas por fonte. Para Quaternius, verificar se a variante baixada contém GLB/FBX aceitos: a versão-fonte `.blend` é **opcional** e não abre diretamente no visualizador web; só usar Blender externo se necessário, nunca como dependência diária do usuário.

## 12. Sequência de implementação com gates objetivos

### M0 — Fundação, sem instalar dependência no jogo
- Criar pasta `app/` isolada, scripts locais (`npm run dev`, `npm run build`, `npm test`) **dentro da ferramenta**.
- Layout navegável das duas telas, estados vazios, erro e loading; sem botões que finjam funcionar.
- Criar serviço local e política de armazenamento/backup, `.gitignore`.
- **Aceite:** UI abre em navegador headless, sem afetar `npm test` do projeto principal.

### M1 — Importador + biblioteca persistente **(primeira entrega visual)**
- Upload de `Walking.fbx`, extração de duração/bones e lista de clips.
- Hash/deduplicação, fontes/licenças, buscas/tags, exclusão lógica e persistência após reiniciar.
- **Aceite:** importar 2 arquivos diferentes, reiniciar serviço, ambos continuam listados; importar mesmo arquivo novamente não duplica bytes.

### M2 — Preview 3D source real
- Render do esqueleto do `Walking.fbx` mesmo sem mesh; play/pause/scrub, bones, câmera.
- Para formato suportado, GLB com mesh; validar comportamento FBXLoader contra nosso parser.
- **Aceite:** ver a caminhada reproduzindo quadro a quadro, com movimento mensurável e sem tela preta.

### M3 — Aruan Proxy A e comparação
- Geometria chibi simplificada, skeleton próprio, bind/rest pose e 3D A/B.
- Implementar retarget básico de origem humanoide para proxy; marcar incompatibilidades.
- **Aceite:** source e proxy se movem no mesmo ritmo, sem braços invertidos/juntas explodindo. **Isso não é export procedural.**

### M4 — Procedural Lab, primeira caminhada no Canvas
- Normalizador calibrado (eixos/escala/rotações), retarget do quadril e IK targets.
- Implementar player opt-in no **estúdio** para `aruan-clip.v1`; deixar o jogo ativo no V1.
- Comparação referencial 3D × Aruan Canvas, ajustes e contatos de pés.
- **Aceite:** Aruan realmente caminha com o clip importado em pelo menos frente/lateral/costas e depois oito direções, sem regressão dos pés/arma/identidade.

### M5 — Exportação, confiabilidade e performance
- Export com metadados/eventos, presets versionados, regressão em lote e validação de licença.
- Testes com clipes variados e, depois, Quaternius/ActorCore (sem prometer compatibilidade universal).
- **Aceite:** output reproduzível, comparações salvas e custo de CPU medido; decisão explícita do autor para ativar V2 fora do estúdio.

**Prioridade:** completar **M0 → M1 → M2** antes de sofisticar edição de movimentos, modelagem de personagem ou usar Rokoko. Pode evoluir o Proxy A em paralelo após fixar a hierarquia e rest pose.

## 13. Testes e critérios de não-regressão

**No MovaLab:**
- `FBX Without Skin` abre esqueleto no preview; GLB válido abre malha, arquivo malformado apresenta erro compreensível.
- As mesmas amostras de tempo geram pose determinística; importações são idempotentes por hash.
- Hierarquia sem ciclo, sem NaN, com quaternion normalizado, unidades e rest pose testadas.
- Alterar preset não modifica o FBX original; reinício preserva a biblioteca.
- Falhas de upload/arquivo grande não derrubam serviço nem perdem índice.
- Play, pause, scrub, velocidade e troca de clip não deixam timers/listeners vazando.
- Quadro de referência e quadro exportado testados em três poses-chave da caminhada real.

**No Aruan, apenas quando integrar player:**
- `npm test`, `npm run test:browser`, 10.552 poses/5 hashes conforme baseline do repositório.
- Testar oito direções, corrida, idle, dodge, combo, três ataques e contato de pés.
- Canvas 2D puro, arco pela ponta, aljava/flechas, `FootPlant` no mundo e passo 1/120 s.
- Comparar vídeos/imagens em **tamanho de jogo real**; testes verdes não garantem naturalidade.
- Medir p50/p95 de custo por frame e memória, inclusive vários NPCs simulados antes de alegar prontidão para MMO.

**Não executar** Chrome com janela visível; usar headless. Não mexer no cenário. Não abrir outro repositório. Não alterar histórico/tag V1.

## 14. Coordenação GitHub e handoff

- Trabalhar na `master` conforme preferência do autor, **sem force push** e sem branches duradouras.
- Antes de gravar, `fetch` e comparar o estado remoto; não sobrescrever trabalho simultâneo de OpenCode/Codex.
- Issue de referência [#61](https://github.com/victorwilliames/game-2d-aruan/issues/61), card em **Game 2D - Aruan Project #2**. Usar etapas M0–M5 como checklist; evitar criar nova sprint/board só por causa deste documento.
- `memory-ai.md` e `AGENTS.md` são fontes de handoff, mas este documento fixa a arquitetura do app; **código real prevalece** se o status mudar.
- Alterações em `tools/movalab` não autorizam alterações automáticas no jogo ou nos cinco arquivos protegidos por hash.
- A pasta de biblioteca/workspace local é conteúdo do usuário: nunca apagar durante sync/merge/clean.
- A próxima IA deve **começar em M0**, validar o estado atual, realizar o primeiro incremento demonstrável e registrar o que executou/testou, sem marcar M4 concluído antes de ver o Aruan Canvas reproduzir a caminhada.

---

## 15. Definition of Done por entrega

- [ ] Funcionalidade verificável na interface (não apenas layout de mentira).
- [ ] Dados persistentes após reiniciar e backups respeitados.
- [ ] Testes MovaLab rodaram; eventuais limites explicitados.
- [ ] `npm test` / `npm run test:browser` do Aruan, se houve integração.
- [ ] Sem regressão da V1 nem dependência de Three.js no jogo.
- [ ] Nenhum FBX/GLB de terceiros ou biblioteca local comitada sem autorização.
- [ ] Capturas headless e comparação quando houver mudança visual.
- [ ] `memory-ai.md`, Issue #61 e Project #2 atualizados.
- [ ] Commit/push com hash informado e próximo marco indicado.

**Decisão técnica final:** primeiro **biblioteca + preview 3D de verdade**; depois **proxy 3D rigado**; só então **export procedural demonstrado no Canvas 2D**. Aproveitar softwares externos como produtores de arquivos e referências, **não** reconstruir os seus editores nem acoplar o runtime do Aruan a eles.
