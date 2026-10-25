# Perfis humanoides e calibração — #78

`createHumanoidProfile()` separa a topologia Mixamorig65 dos comprimentos e volumes. O perfil é imutável, valida parâmetros e mantém +X esquerda/+Y acima/+Z frente. Presets: Aruan padrão, pequeno, robusto e alto/musculoso. `aruanHierarchy(profile)` produz os mesmos nomes/pais; `createAruanProxy(profile)` reaproveita a malha procedural existente e adapta sua bind geometry por pesos. Não cria outro renderer nem altera o Canvas do jogo.

O caminho padrão não passa pela deformação paramétrica. Comparação local com o código anterior `a29b15e` confirmou arrays de posição/cor/skinWeight/skinIndex idênticos byte a byte; hash de posições `f2a4ce3489006657d6b8229a6d3d5b7f7bbc4cbebffa4e69dd29be3df6452ad0`. Identidade chibi, roupa vermelha, rosto, pena e equipamento preexistentes do proxy permanecem. O proxy é técnico e não substitui a arte Canvas aprovada.

## Calibração e modelos reais

Reusado `HumanoidRetarget`, com uma calibração por destino e a mesma origem canônica. Seis clipes reais aplicados a 23 destinos (Aruan Proxy + três perfis + 19 personagens), total 690 poses. Todos mantiveram os offsets/comprimentos locais dos membros; raiz recebe movimento escalado proporcionalmente. Erro máximo de direção anatômica ~3,11e−8; erro de comprimento zero. Pesos e índices de todos os vértices foram conferidos, bem como matrizes e amostras de vértices deformados.

`calibrateDestinationBind(root,{repair:true})` é uma operação explícita em memória, antes de construir o retarget. Detecta diferença entre geometry de repouso e bind importado, recalcula apenas a bind da cópia carregada e reverte se não recuperar a tolerância. Não grava FBX, muda geometria ou inventa ossos. No lote, cinco modelos exigiram reparo:

| Modelo | Desvio inicial máximo (cm) |
|---|---:|
| Doozy | 0,426 |
| Castle_Guard_01 | 2,493 |
| Mremireh_O_Desbiens | 1,336 |
| Goblin_D_Shareyko | 1,168 |
| Paladin_WProp_J_Nordstrom | 1,653 |

Depois da calibração, maior erro de bind entre os 23 destinos <0,000128 cm. Dedos existentes participaram do movimento (orientação do dedo relativa à mão; aliases de skin não ocultam o movimento). Peasant_Man e Castle_Guard_01 continuam sem 24 canais; Doozy e Mremireh sem oito. Status parcial preservado, sem criar dedos nas malhas de terceiros.

Relatório: `tools/movalab/docs/humanoid-profiles-audit.json`. Execução local ~6,1 s, RSS observado máximo ~360 MB; números desta coleta, sem promessa de FPS ou teto universal. Loader de textura numérico usa placeholders e **não comprova decodificação de materiais** dos 19 modelos. Essa checagem permanece no browser/MovaLab #81.

## Evidência e limites

Captura 055 mostra Walking real no Aruan, três arquétipos e Y Bot, em Chrome headless/SwiftShader, com a mesma timeline e câmeras individuais. Quatro tempos renderizados sem erro; screenshot revisada. O padrão continua com 37.896 vértices/65 ossos e os dados de geometria anteriores. Index/inspecao abriram sem erro de console/rede no smoke focal, sem modificação do runtime.

Não é aprovação artística, correção universal de contatos/colisão, validação de todos os 2.317 clipes nem Canvas completo. Os perfis ainda não têm seletor na UI principal do MovaLab; a seleção integrada pertence à #81. O helper de bind é API offline explícita, sem substituir silenciosamente a política dos arquivos originais.

```powershell
node tools/movalab/tests/humanoid-profiles.mjs
$env:MIXAMO_ROOT='D:\.GITHUB\games\game-2d-aruan\tools\mixamo'
node --expose-gc tools/movalab/tests/humanoid-profiles.mjs --write
node tools/movalab/tests/profile-browser.cjs
```

O teste de captura protege prefixos já existentes; escolher outro número se for gerar um novo marco. Fontes são servidas apenas em loopback e não são copiadas. Perfil temporário do Chrome fica no D: e é removido pelo próprio teste.
