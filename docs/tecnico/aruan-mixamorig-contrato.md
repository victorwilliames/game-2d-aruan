# RigContract Mixamorig65 v1 — auditoria real (#76)

O contrato foi extraído do `animation_motion/Walking.fbx` do snapshot HF `7f134bc734557b1d9516cb476d25ea1f577e45c1`, conferido com `animation_bones.json` e SHA-256 `bbd913ad38b55f70282cb61dd215dd2b85d1c06e00ac702c6873a3f82fd6da68`. Artefato: `tools/movalab/docs/mixamorig65.v1.json`. A hierarquia e cada transform de repouso são dados reais, não uma lista inventada de nomes.

## Semântica

- 65 canais, pais exatos, nomes originais, translations, quaternion local XYZW, escala, pre/post-rotation, propriedades FBX e repouso global por osso.
- Centímetros; +Y acima, eixo de coordenadas +X, FrontAxis +Z conforme GlobalSettings; projection Canvas ainda não integrada neste marco.
- FBX XYZ **extrínseco**: aplicar X, depois Y, depois Z. Equivale ao ZYX intrínseco do FBXLoader. Quaternion local = pre × local × inverso(post). Não reaproveitar a composição XYZ intrínseca do antigo protótipo `rig-v2.cjs` como autoridade desta biblioteca.
- Namespace aceito: `mixamorig:`/`mixamorigN:` e a forma sem dois-pontos produzida pelo FBXLoader; namespaces arbitrários ou nomes colidentes são rejeitados.
- Rotações interpolam por quaternion entre chaves por articulação; interpolar Euler diretamente produziu erro de 1,26 cm no Running e foi corrigido nesta nova implementação. Eixos Euler desalinhados e saltos >=180° recebem erro explícito para preparo especializado. Não proclamar suporte universal aos 2.317 clipes a partir deste lote.
- Pivots/offsets não nulos e escalas ósseas diferentes de um são recusados por este avaliador restrito, sem corromper o esqueleto silenciosamente.

## Comparação independente

`tests/mixamorig-contract.cjs` compara os 65 transforms globais com o FBXLoader/AnimationMixer real de Three r180 em seis FBXs: Walking, Running, Falling_To_Roll, Hard_Landing, Punching e 180_Turn_W_Briefcase. 94 instantes; erro máximo espacial 0,000060914 cm e quaternion 1−|dot| normalizado <2,13e−13. Inclui pontos que são chaves de algum canal mas intermediários em outros, verificando slerp. Repouso bruto comparado antes de animar: erro máximo 1,75e−13 cm. Originais intactos; nenhum Three no runtime.

O avaliador legado difere em até 200,62 cm nessa amostra. Isso é um problema daquele **protótipo offline**; o conversor MovaLab existente já usa Three/HumanoidRetarget e não foi substituído. Não alegar que este marco corrigiu o renderer ou o combate.

## Destinos e calibração

`aruanHierarchy()` tem os 65 nomes e pais corretos, sem extras, mas offsets/rest rotations diferem do source. A calibração por destino continua necessária: não copiar translations do Y Bot sobre membros chibi. Separar topologia comum de comprimentos, pose neutra e proporções.

Baseline do proxy existente: SkinnedMesh de 65 ossos, 37.896 vértices, 4.680 vértices com pesos misturados; pesos normalizados, movimento de vértices real e erro de comprimento zero no teste existente. Calibração T/A já existente passou quatro casos, erro de direção ~1,15e−15. Isso não aprova deformação artística ou a nova biblioteca no proxy; #78 fará Y Bot e três arquétipos.

Metadados dos 19 personagens identificam quatro parciais: Peasant_Man e Castle_Guard_01 sem 24 canais cada; Doozy e Mremireh_O_Desbiens sem oito. Nenhum osso foi inventado. Os outros quinze têm os nomes, mas ainda precisam de auditoria de hierarquia, bind, skin e retarget real; status `names-only`, não “compatível completo”. Relatório completo em `tools/movalab/docs/mixamorig-contract-audit.json`.

O FBX de movimento não contém malha: não é possível certificar bind/skin a partir dele. Rest transforms e coordenadas são canônicos da referência; bind inverses e pesos pertencem a cada personagem e serão conferidos separadamente.

## Reproduzir

```powershell
npm run test:mixamo
$env:MIXAMO_ROOT='D:\.GITHUB\games\game-2d-aruan\tools\mixamo'
node tools/movalab/tests/mixamorig-contract.cjs --write
node tools/movalab/tests/proxy.mjs
node tools/movalab/tests/retarget-rest.mjs
```

Sem MIXAMO_ROOT, CI roda somente unidades/fixture; não baixa os FBXs nem alega paridade real. Com fontes locais, a comparação independente e os hashes são exigidos. Nenhuma alteração visual neste marco; QA browser focal anterior abre ambas páginas sem erro; o smoke completo segue com falha preexistente de toque para #83.
