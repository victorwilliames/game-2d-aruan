# Banco Mixamo externo — #80 em desenvolvimento

**Marco atual: catálogo + preparo sob demanda + cache/fila funcionais em branch isolada.** Nove clipes têm prévia Canvas e validação numérica; os demais permanecem catalogados com arquivo presente. Aprovação visual e integração ao gameplay continuam separadas. As seções de primeiro marco abaixo preservam o contexto dos testes anteriores.

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

## Segundo marco — preparo e cache

`prepare-mixamo.mjs` verifica SHA-256 da fonte, topologia/pais/eixos do contrato65, faz conversão offline somente quando necessária, inspeciona a120Hz e compara65juntas com o Proxy independente em24tempos. O resultado distingue falha, requer ajuste e validação técnica; nenhum caminho promove aprovação visual ou vinculação ao gameplay. O jogo não recebe Three/FBX.

A chave de cache combina SHA-256 da fonte, RigContract, conversor/configuração/loader, perfil, dependências declaradas, player/IK e opções. Gzip preserva exatamente os bytes JSON; leitura verifica hash comprimido, hash JSON, limite16MiB e vínculo fonte/perfil. Arquivos são publicados sem sobrescrever fontes/caches existentes; gzip órfão idêntico pode ser reutilizado após interrupção. Locks preservam processos de preparo vivos. Teto10GB e reserva2GB são conferidos antes das escritas, com margem500MB para checkout/Git/temporários.

Hashes dos componentes de texto normalizam CRLF para LF: checkout Windows não invalida código idêntico. Hashes dos FBXs continuam sobre bytes originais. Alterar o validador invalida seu registro; um artefato de versão anterior só pode ser reutilizado quando conversor/perfil/player ainda coincidem, com nova validação numérica. Isso permitiu manter também o gzip de Waving após consolidar a política portátil, sem refazer sua conversão.

Os oito pilotos foram revalidados e registrados por referência ao mesmo gzip, sem reconversão/cópia. Seus881.155bytes de artefatos foram reutilizados; leitura validada após preparo (cache do SO aquecido) levoucerca de4–12ms. No navegador, abrir HardLanding preparado até o Canvas levou529–717ms nas medições, incluindo UI/inspeção/desenho. Isso não mede FPS ou hardware físico móvel.

O novo botão **Preparar e ver no Canvas** usa fila com um worker, até16pedidos, deduplicação concorrente, timeout120s e journal por chave. Clipe já preparado abre sem worker/conversão. Falhas e interrupções aparecem no catálogo e podem ser consultadas pelo job; nova solicitação retoma usando artefatos válidos. Waving foi preparado pela UI a partir da fonte existente e abriu no Canvas em7,6s. Resultado:9convertidos/9validados/9com prévia,0aprovados visualmente/0integrados.

Rotas novas: `POST /api/mixamo/prepare` com `{id,loop:false}`, `GET /api/mixamo/jobs/<chave>` e `GET /api/mixamo/motions/<id>/prepared`. O último verifica/descomprime e entrega somente o clipe numérico. Filtros por etapa usam os booleanos de evidência; convertido inclui os estados posteriores. O laboratório mantém o personagem de referência escolhido e reutiliza o player de65canais/transições da #79.

CLI agora inclui operações explícitas:

```powershell
node tools/movalab/scripts/mixamo.cjs prepare Waving.fbx
node tools/movalab/scripts/mixamo.cjs list --state converted
node tools/movalab/scripts/mixamo.cjs validate Waving.fbx
node tools/movalab/scripts/mixamo.cjs preview Waving.fbx
```

`validate` confere integridade do cache agora e identifica que a auditoria numérica foi registrada no preparo; não finge reexecutá-la. `preview` retorna o endpoint de dados para o Canvas, sem abrir navegador. `assign` continua reservado à integração #82/#83, para preservar os contratos de combate. Não há conversão automática dos2.317.

Medição NTFS após o marco: fontes/cache1.692.390.576bytes + checkout245.729.960bytes =1.938.120.536bytes alocados. Lógico de fontes/cache1.687.484.768bytes; discoD livre86.923.444.224bytes na medição do guard. Transferência externa não aumentou. Relatórios: `tools/mixamo/metadata/storage-after-cache.json`, `mixamo-cache-audit.json` e `mixamo-catalog-browser.json`.

Testes: cache/invalidação/hash/orfandade/lock/orçamento, fila com pedidos duplicados, falha persistida e estado interrompido após reabrir controlador; busca/API/fontes; browser real de cache e preparo; regressão V1 com34clipes/banco/recorte/marcadores/publicação; npmtest322JPEGs e smoke focal das duas páginas sem erros. Capturas062/063 revisadas. O teste legado de recorte passou a criar um Proxy novo quando essa é a referência escolhida, mantendo a comparação de carregamento independente. A CI deste segundo marco ainda precisa ser confirmada; primeiro marco276ba72/40254458461 verde.
