# Rig V2 + MovaLab — primeiro protótipo executável

**Estado:** leitura e avaliação de hierarquia FBX offline funcionando com o `Walking.fbx` fornecido pelo autor. **Ainda não há retargeting ao personagem Aruan ou renderização da caminhada no Canvas.**

## Código implementado

- `src/fbx-binary.cjs`: leitor de **FBX binário** (nós, arrays comprimidos, hierarquia e curvas de movimento) implementado em Node.js sem dependências externas. É um **subconjunto de FBX**, não um leitor universal; validado especificamente com o `Walking.fbx` versão 7700.
- `src/inspect-fbx.cjs`: diagnóstico em JSON com ossos, canais, duração e amostras do quadril.
- `src/rig-v2.cjs`: avaliador experimental de hierarquia 3D com transforms locais/globais, sem substituir `js/rig.js` ou o renderizador Canvas.
- `src/aruan-v2-profile.cjs`: **topologia proposta** de 65 ossos com relações pai/filho compatíveis com a amostra Mixamo, além das dimensões e campos semânticos do rig V1. **Não é a bind pose chibi definitiva.**
- `tests/fbx-reader.cjs`: teste de leitura real, hierarquia, amostragem e deslocamento dos pés.

## Teste local

Deixe `Walking.fbx` fora do Git (não publicar assets originais do Mixamo). Execute a partir da raiz do repositório:

```powershell
node tools/movalab/src/inspect-fbx.cjs "C:\CAMINHO\Walking.fbx"
node tools/movalab/tests/fbx-reader.cjs "C:\CAMINHO\Walking.fbx"
```

O primeiro comando apresenta os dados do arquivo. O segundo verifica os ossos e curvas que existem na amostra fornecida pelo autor. Sem FBX, execute `node tools/movalab/tests/fbx-reader.cjs` para checar apenas matemática e rejeição de formato inválido.

## Resultado verificado no FBX enviado

- FBX binário versão **7700**.
- **65 ossos** e uma raiz `Hips`.
- **315 curvas de animação** distribuídas em **53 grupos**.
- **32 instantes amostrados**, duração **1,0333 segundo**.
- **65/65 ossos** do perfil proposto encontrados e **nenhuma divergência de pais**.
- Pés se movimentam no avaliador: diferenças primeira pose ↔ metade do ciclo de aproximadamente **9,10** e **2,15** unidades do próprio FBX. Isso comprova extração de movimento, **não** naturalidade, retargeting chibi ou ausência de patinação.

O teste foi executado em Node.js com o FBX real, **fora do GitHub**. Os testes globais `npm test` e `npm run test:browser` do jogo não foram executados por esta integração remota, pois não há uma cópia local autenticada do repositório inteiro. Nenhum arquivo de jogo foi alterado.

## Próximas tarefas antes de chamar isto de Rig V2 funcional

1. Validar bind/rest pose de origem e convenções `PreRotation/PostRotation` contra uma referência 3D.
2. Definir a bind pose chibi do destino, proporções fixas, limites articulares e conversão de eixos.
3. Traduzir movimentos das mãos/pés/quadril para os controles do Aruan, preservando `FootPlant`, IK e pegada do arco.
4. Criar um player V2 **opcional** no estúdio para comparação V1 × V2, sem substituir animações existentes automaticamente.
5. Comparar caminhada 8 direções, pés apoiados e FPS usando imagens e teste de navegador headless.

## Restrições

Sem Three.js em runtime, sem dependências de engine, sem FBX no Git, sem mudar `js/rig.js`, `js/character.js` ou `js/main.js` neste protótipo. A evolução será avaliada antes de substituir a V1.

Relacionados: [#60](https://github.com/victorwilliames/game-2d-aruan/issues/60), [#61](https://github.com/victorwilliames/game-2d-aruan/issues/61) e [V1 preservada](https://github.com/victorwilliames/game-2d-aruan/blob/master/docs/versions/aruan-v1.md).
