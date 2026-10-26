# Banco Mixamo externo — #80 em desenvolvimento

O MovaLab lê o snapshot já adquirido em `tools/mixamo`, por padrão ou via `MOVALAB_MIXAMO_ROOT`. O checkout isolado usa explicitamente a raiz principal: `D:\.GITHUB\games\game-2d-aruan\tools\mixamo`. Não há cópia dos FBXs para `workspace/sources`, novo download ou instalação.

Primeiro marco:2.317movimentos e19personagens listados, todos os arquivos presentes por tamanho/realpath. SHA-256/proveniência e a data da verificação anterior ficam no registro; `verify` revalida o hash ao consumir o conteúdo para preparo. IDs derivados de dataset/revisão/path permanecem estáveis. Só podem ser servidos arquivos do inventário seletivo, dentro da raiz real e das coleções autorizadas; traversal, unidades Windows, symlinks para fora e personagens não selecionados são rejeitados.

Nomes/descrições EN vêm dos metadados adquiridos. PT-BR usa glossário local, categorias, tags e sinônimos; as sugestões e palavras ainda não traduzidas são identificadas como inferências. FPS30 e duração calculada por frames são estimativas, com FPS medido ainda nulo. Loop, root motion, preparação curta e estabilidade do pé continuam desconhecidos até análise. A busca ranqueia correspondências e sinônimos, sem exigir serviço pago. `Running.fbx`, por exemplo, tem descrição original *Action Move Running And Rolling*.

O catálogo mantém separados: catalogado, arquivo presente, convertido, validado tecnicamente, prévia Canvas disponível, aprovado visualmente e integrado. Neste primeiro marco o índice de produção tem **zero** conversões: os oito caches do piloto #79 ainda não foram adotados pelo novo índice. Não significa que o piloto não exista. O preparo/cache de produção ainda está em implementação nesta mesma #80.

`GET /api/motions` e `/api/assets` mesclam a fonte externa com a biblioteca existente. Favoritos/categoria/nome personalizados usam `library.json.externalSources.mixamo.overrides`, preservando a lista de fontes locais e seus metadados. O formulário não promove estado técnico ou visual. `GET /api/mixamo/catalog?q=...&category=...&state=...&favorites=1&offset=0&limit=100` permite consulta local (até500registros por página). O diagnóstico aproximado antigo `/clip` não é usado para certificar o novo Canvas.

No navegador, busca PT-BR/EN e catálogo completo são utilizáveis; a lista monta80cards inicialmente e permite carregar mais, evitando milhares de elementos DOM. Escolher fonte externa usa o mesmo visualizador e seleciona Aruan Proxy quando não há destino definido. A #81 ainda fará a auditoria visual/UI dos19modelos, materiais e calibração; listagem não certifica todos os destinos.

Captura060 registra a falha de enquadramento encontrada;061 mostra a correção. O botão de restaurar câmera recalcula os limites da malha skinned na pose atual e enquadra os cantos no viewport. Em HardLanding a0,5s, vértices amostrados ficam dentro da tela (máximoNDC0,655). Sem ajuste contínuo da câmera durante o playback.

Verificação: catálogo real2.317/19, busca *pouso*, HardLanding lido da raiz externa e aplicado ao Proxy no Chrome headless; renderização inicial80cards, zero erros. Testes unitários e API com bytes gerados cobrem busca, IDs, integridade, fontes ausentes, allowlist, favoritos persistidos e recusa de aprovação fictícia. Não são testes de FBX; o teste de navegador usa a fonte real.

CLI de leitura já disponível:

```powershell
$env:MIXAMO_ROOT='D:\.GITHUB\games\game-2d-aruan\tools\mixamo'
node tools/movalab/scripts/mixamo.cjs list --limit 20
node tools/movalab/scripts/mixamo.cjs search 'giro porretada espada' --limit 10
node tools/movalab/scripts/mixamo.cjs inspect Running.fbx
```

`prepare/validate/preview/assign` e fila/cache de produção ainda não foram declarados entregues. O servidor herdado5320 continua no backend anterior; testes usam servidor temporário próprio, sem encerrar processos alheios. #79 está Em Revisão, branchfd4782b com CI40241451752verde; #80 continua Em Andamento na branch `codex/80-mixamo-catalog`, baseada nesse checkpoint. O GOAL existente não foi recriado.
