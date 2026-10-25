# Conversão offline de FBX legado

Conversor **real e isolado** de FBX para GLB. Usa o binding Python oficial de
[ufbx](https://github.com/ufbx/ufbx) (MIT/Unlicense); não adiciona biblioteca ao
runtime Canvas do Aruan. Não depende de abrir Blender, serviços externos ou
Autodesk SDK. Instalação inicial requer internet; depois funciona offline.

## Instalar somente na ferramenta

Requer Python 3.12 e Node.js 22+ para os testes consumidores. Na raiz do projeto:

```powershell
python -m pip install --target tools/movalab/legacy/.python -r tools/movalab/legacy/requirements.txt
$env:PYTHONPATH=(Resolve-Path tools/movalab/legacy/.python).Path
python tools/movalab/legacy/convert_fbx.py "caminho/original.fbx" "caminho/derivados/personagem.glb"
```

O processo recebe **um arquivo por execução**. Caminhos devem ser passados como
argumentos, sem montar comandos por concatenação. Em integração Node, usar
`spawn(python, [script, source, output], {windowsHide:true, env:{...}})`.
Não carregar o binding nativo dentro de um serviço de longa duração.

O GLB e seu relatório `personagem.conversion.json` são criados sem sobrescrever
arquivos existentes. O original é apenas lido; seu SHA-256 é conferido novamente
antes da gravação. O relatório registra versão FBX, SHA-256 e tamanho de entrada
e saída, versão do conversor/binding, opções, contagens e perdas conhecidas.
Escolha um diretório de derivados, separado dos FBX originais. Os arquivos
gerados não fazem parte deste código nem são comitados pelos testes.

Opções: `--fps 30` (1–120), `--no-animation`. Amostragem acontece offline, sem
impor o framerate do jogo. GlTF usa posições em metros, Y para cima e rotações
quaternion. Preserva hierarquia e transforms resolvidas por ufbx, normais, UVs,
triângulos, materiais básicos, texturas baseColor/diffuse PNG/JPEG **embutidas**,
skin e inverse bind matrices. Polígonos côncavos
usam ear clipping, não um fan incorreto.

As imagens são copiadas sem recompressão para bufferViews do próprio GLB e
deduplicadas por SHA-256. UV V é invertido para o referencial de imagem glTF;
samplers mantêm repeat/clamp. PNG com alpha usa recorte `MASK` em 0,5.
**Nenhum caminho externo de textura é aberto**: `load_external_files=False`,
inclusive quando o FBX registra caminhos absolutos ou segmentos `..`.
Texturas sem bytes embutidos, outros formatos, layered textures e transforms
UV não suportadas permanecem diagnosticados como omitidos.

**Limites explícitos:** mapas normal/specular/roughness, shaders proprietários,
transparência blend, blend shapes, constraints, câmeras e luzes não são
exportados. O material preserva cor básica e imagem difusa, sem alegar aparência
pixel a pixel. Usa até quatro influências normalizadas
por vértice para compatibilidade com Three.js; o relatório mede a massa de peso
descartada. `counts.images`/`counts.textures` informam a saída e
`diagnostics.textures` registra MIME, dimensões, hash, conexões de material e
motivo de cada mapa exportado/omitido. Cabeçalho reconhecido não equivale a
decode validado. Não representa conversão para Aruan nem retargeting entre personagens.

`ufbx-python==0.0.5` apresentou access violation em Windows ao liberar wrappers
nativos temporários. O conversor mantém o grafo de owners vivo e usa processo
curto com `os._exit()` **após flush** para evitar finalização defeituosa.
A memória é devolvida pelo sistema ao terminar. Erros Python saem com status 1;
o chamador deve considerar qualquer exit code diferente de 0 como falha,
mesmo que existam arquivos parciais de uma execução interrompida. Recomenda-se
limite de tempo/memória no processo chamador. Não reutilizar `convert()` como
API Python em processo persistente. Esta restrição é específica do binding,
não do formato GLB. A dependência está fixada para reproduzir a validação;
atualização exige repetir a bateria real.

## Testes reproduzíveis

```powershell
$env:PYTHONPATH=(Resolve-Path tools/movalab/legacy/.python).Path
python tools/movalab/legacy/test_legacy.py
python tools/movalab/legacy/test_legacy.py --pack tools/movalab/workspace/sources/MixamoOriginalsPack --output "$env:TEMP/movalab-legacy-validacao-nova"
$legacyFiles=Get-ChildItem "$env:TEMP/movalab-legacy-validacao-nova" -Filter *.glb | Select-Object -ExpandProperty FullName
node tools/movalab/legacy/verify_glb.mjs @legacyFiles
```

O diretório de saída deve ser novo, pois sobrescrita é recusada. `verify_glb.mjs`
consome os derivados com **GLTFLoader real**, verifica matrizes de bind contra
as matrizes globais da malha, ligações de textura nos materiais e skinning de
vértices. Nesse teste Node, `createImageBitmap` é deliberadamente substituído
por bitmap mínimo: **não há decode nem validação visual dos pixels**. A bateria
Python confere os bytes SHA-256 exatos das imagens. Decode, orientação UV e
aparência exigem QA de navegador real. Usa Three.js já
instalado no app; para outro local, defina `MOVALAB_THREE_ROOT`.

Prova adicional de animação moderna (mesma configuração de conversão):

```powershell
python tools/movalab/legacy/convert_fbx.py "tools/movalab/workspace/sources/MixamoOriginalsPack/AnimationsWithSkin/Start Pack/Start Walking-com-skin-mixamo.fbx" "$env:TEMP/start-walking-convertido.glb"
node tools/movalab/legacy/compare_animation.mjs "tools/movalab/workspace/sources/MixamoOriginalsPack/AnimationsWithSkin/Start Pack/Start Walking-com-skin-mixamo.fbx" "$env:TEMP/start-walking-convertido.glb"
```

Esse teste compara as trajetórias reais de 65 ossos, em quatro instantes, entre
FBXLoader e GLTFLoader, convertendo centímetros para metros. A carga de texturas
é omitida deliberadamente nesse teste geométrico.

## Evidência em 25/10/2026

Cinco FBX 6100 do pack existente convertidos e consumidos pelo GLTFLoader.
Na versão 2 do conversor, theboss preserva uma imagem PNG difusa (11 objetos
texturados no Three); male-realista preserva uma PNG (seis objetos texturados);
gordo preserva uma PNG facial e uma JPEG corporal (quatro objetos texturados).
Y Bot/y-bot não possuem texturas embutidas. Boss normal/specular e gordo normal
permanecem omitidos com diagnóstico; duplicatas de imagem não duplicam bytes.

| Original | Malhas GLB | Skins | Triângulos | Maior massa de peso descartada |
|---|---:|---:|---:|---:|
| Characters3D/y-bot.fbx | 2 | 2 | 55.320 | 0 |
| Characters3D/theboss.fbx | 11 | 11 | 10.220 | 0 |
| Characters3D/male-realista.fbx | 6 | 6 | 17.916 | 0,032571 |
| Characters3D/gordo.fbx | 4 | 4 | 7.200 | 0 |
| Animations/Male Locomotion Pack/Y Bot.fbx | 2 | 2 | 55.320 | 0 |

Todos são personagens estáticos: **nenhum desses cinco contém animação variável
exportável**, inclusive o Y Bot dentro da pasta Animations. O conversor não
inventa movimentos. A geometria de male-realista possui múltiplos materiais:
seis meshes GLB tornam-se oito objetos de malha no Three.js, comportamento normal.

O erro máximo das matrizes de bind nos cinco foi `3,485e-6`; pesos somam 1,
skinning produz valores finitos e todos os originais mantiveram seus hashes.
No FBX 7700 Start Walking com skin, houve uma animação exportada (2,933333 s),
260 comparações de juntas, erro posicional máximo `6,58e-9 m` e erro angular
máximo `0,000580 rad` nos instantes medidos. Três testes unitários de geometria
e binário passaram na primeira entrega; a versão 2 amplia para cinco testes,
adicionando cabeçalhos PNG/JPEG e truncamento. Cinco conversões com imagens
embutidas também passaram: SHA do original preservado, deduplicação correta,
bytes das imagens idênticos aos FBX e mesmo limite de erro de bind.

**Ainda não verificado nesta entrega:** decode real/screenshot/material final no viewport,
aceite artístico, retarget dos GLB para outros rigs e integração ao catálogo/UI.
Não fechar #65 ou anunciar MovaLab 1.0 apenas com estes testes.

## Alternativas investigadas

- [Assimp](https://raw.githubusercontent.com/assimp/assimp/master/code/AssetLib/FBX/FBXDocument.cpp)
  recusa versões anteriores a 7100; não resolve este pack legado.
- [Blender 4.5](https://developer.blender.org/docs/release_notes/4.5/pipeline_assets_io/)
  tem importador ufbx experimental para FBX anterior a 7.1; opção externa futura,
  sem impor operação manual diária.
- [FBX2glTF Godot](https://github.com/godotengine/FBX2glTF) deixou de ser mantido
  e seus binários incluem Autodesk SDK proprietário. Não foi baixado/redistribuído.
