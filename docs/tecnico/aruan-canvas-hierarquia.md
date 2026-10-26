# Canvas por hierarquia completa — primeiro marco da #79

**Em desenvolvimento, não é encerramento da #79/Sprint 9.** Código no checkout isolado `.worktrees/sprint-9`, branch `codex/79-canvas-hierarchy`. #76/#77/#78 estão concluídas tecnicamente e publicadas; #79 permanece Em Andamento.

O modo experimental do MovaLab usa os 65 canais já presentes no clipe V1 para construir o rig Canvas. Pelve, coluna, cabeça, clavículas, cotovelos, punhos, dedos, joelhos, tornozelos e toes seguem a hierarquia; o painter existente continua Canvas 2D, com rosto/cabelo/pena/traje/equipamento preservados. V1 é o padrão e a prévia completa exige seleção explícita. Não foi necessário migrar para engine ou substituir a arte por sprites.

## Verificação realizada

- 968 poses/oito direções no adaptador, erro de comprimento <4,7e−14 e frames ortonormais. Raiz do chamador aplicada uma vez; deslocamento horizontal importado não duplica movimento.
- Alterar somente o quaternion de um dedo muda sua ponta sem alterar polegar, punho ou os campos V1. Isso verifica que o movimento não foi reduzido aos alvos antigos.
- Contatos do clipe e correção de altura da pelve alimentam IK com comprimentos invariantes. O solver ganhou extensão máxima **opt-in** para este caminho; o padrão `.985` da V1 permanece. Walking testado com erro de apoio ~1e−14.
- MovaLab real: `Start Walking-com-skin-mixamo.fbx` do pack preexistente, Aruan Proxy 3D e Canvas no mesmo tempo. Oito direções rasterizadas e seis instantes; capturas 056/057 revisadas. A paridade FK bruta com os 65 ossos do proxy no instante comparado teve erro máximo 0,000128 cm, antes dos ajustes de contato do Canvas.
- Corrigida uma causa real de perda de paridade: tempos Float32 criavam um intervalo extra na conversão. A grade de 176 intervalos agora mantém 177 chaves, em vez de deslocar toda a amostragem. Conversor versionado `0.6-frame-grid`; teste de regressão sobre FBX real incluído.
- `npm test` pós-mudança de rig/painter, API MovaLab, teste procedural e smoke V1 focal passaram. Index/inspecao: duas páginas, sete animações/oito direções/três presets, zero erros. O primeiro lançamento focal teve EBUSY transitório na porta do Chrome; repetição passou. 315 JPEGs válidos,13 pares históricos.

## Uso e limites atuais

Na etapa 2 do MovaLab, o seletor **Movimento no Canvas → Movimento completo + dedos (prévia)** ativa o novo caminho. O Aruan Proxy também pode ser escolhido na referência 3D. Ajustes escalares de encaixe ficam no modo Original; a prévia completa mantém apoios e controle de deslocamento. A aplicação definitiva deste modo ao gameplay está desabilitada enquanto transições/combate e a integração do novo player são validados. Os vínculos antigos continuam no caminho anterior.

O renderer e a prévia foram verificados em servidor temporário do checkout. O servidor herdado na5320 ainda executa o backend anterior; sua reinicialização foi solicitada ao autor porque AGENTS seção6 proíbe encerrar processos alheios. Isso não impede continuar desenvolvimento/testes isolados. Não alegar que a rota nova já está disponível no processo herdado.

Ainda faltam: piloto de clipes difíceis do dataset adquirido (roll/landing/giro/gestos), precisão/custo e cache compacto, transição completa V1↔hierarquia, mais correções de chão/apoios e integração segura no jogo. Não converter em massa nem declarar todos os2.317 prontos. A primeira evidência usa fonte antiga conhecida; o novo catálogo ainda precisa ser conectado na#80. Nenhum download foi repetido.

Reproduzir no checkout com dependências já existentes:

```powershell
node tools/movalab/tests/humanoid-canvas.mjs
$env:MOVALAB_HIERARCHY='1'
node tools/movalab/tests/browser3d.cjs
```

## Transições completas — terceiro marco

`AruanClips.localHierarchy` expõe a pose local sem reduzir os canais. `AruanHumanoid.sample/createTransition` interpola os65quaternions com slerp e a pelve com interpolação linear, aplicando o alinhamento de raiz/apoios do player existente. Só aceita o mesmo perfil calibrado (topologia e offsets); não mistura proporções de personagens nem alonga ossos. A transição pode ser interrompida e, ao assentar, o sampler `steady` deixa de reter o clipe de saída.

No MovaLab, **Transição entre clipes completos (s)** controla esse fade ao carregar/converter outro clipe completo; zero desliga. O carregamento do banco congela a prévia anterior enquanto restaura a referência, evitando que um reset assíncrono do relógio provoque salto antes do fade. A fonte que já está ativa é reutilizada. V1 continua no player anterior; o blend V1↔hierarquia no gameplay pertence à integração posterior.

Teste novo `humanoid-transitions.mjs`:1.456poses/oito direções, comprimentos de todas as65juntas, quaternions de dedo independentes, apoios, início/fim e interrupção, com erros até7,2e−14. Piloto real: oito trocas/392poses a120Hz, todas numeric-pass. Browser headless no banco real confirmou alpha0/0,5/1, continuidade de troca5,2e−14 e interrupção5,8e−14; captura059 revisada. O teste de navegador passou após corrigir o salto real causado pela restauração da fonte (~2unidades antes).

CI19d03af/40240569412 verde. Após este marco: npmtest318JPEGs, transiçõesV1, conversor/hierarquia e browser completo do MovaLab (34clipes, três destinos incluindo parcial, banco/recorte/marcadores/publicaçãoV1) verdes. A CI deste terceiro marco ainda precisa ser conferida. Não certifica arte dos2.317 nem integração ao combate; código permanece na branch isolada enquanto o backend herdado aguarda autorização de reinício.

O teste browser usa Chrome headless e hardlink do FBX conhecido, em fixture no D:. Não altera a biblioteca/bindings do autor nem abre janela visível.

## Piloto do snapshot adquirido — segundo marco

O script `tools/movalab/scripts/hierarchy-pilot.mjs` reutiliza oito FBXs já adquiridos, confere seus SHA-256 e compara 65 juntas com o proxy Three independente em 48 tempos por clipe. Caminhada, corrida/rolamento, queda/rolamento, pouso, soco, giro180°, gesto e ataque armado passaram; erro FK máximo0,000303cm. Inspeção de contatos/chão a120Hz: comprimentos e apoios até~1e−14. O relatório `hierarchy-pilot-report.json` separa esse resultado numérico de aprovação artística e integração, ambas ainda zero.

O piloto expôs duas falhas reais corrigidas: (1) a grade uniforme ignorava chaves quaternion irregulares inseridas pelo FBXLoader, causando erro2,31cm em Running e0,276cm no ataque; conversor0.7 preserva a união da grade60Hz e das chaves da fonte, com regressão de chave irregular no CI; (2) a correção de pelve podia levar joelhos abaixo do chão. O adaptador limita a translação pelos volumes superiores e ajusta o polo do joelho sobre o círculo IK, preservando comprimento e apoio. FK bruta continua disponível, sem essas adaptações.

Derivados do lote:3.215.637bytes JSON,881.155bytes gzip; descompressão byte a byte sem perda. Cache por hash de fonte/componentes/perfil, somente em `tools/mixamo/cache/hierarchy-pilot/`, sem novos downloads. Há verificações de teto10GB/reserva2GB antes da escrita e limite16MiB por clipe. Isso demonstra o custo deste lote, sem provar o custo máximo ou aprovar conversão total dos2.317.

Chrome headless carregou os oito clipes pelo fluxo real do banco em workspace temporário:32quadros,65juntas, dedos/painter finitos, zero erros de console/rede. Capturas058 revisadas;317JPEGs válidos. `Running.fbx` tem descrição original **Action Move Running And Rolling**: o rolamento visto na captura pertence à fonte; não deve virar corrida contínua por nome. Gesto e retarget continuam sujeitos a avaliação visual comparada, sem classificação automática como arte pronta.

`npm test`, teste de hierarquia/irregularidade, procedural/API e smoke focal das duas páginas passaram. CI do primeiro marco3030504:40239156326 verde; este segundo marco exige sua própria CI. A #79 permanece aberta para transições completas e integração das restrições; a Sprint8 e os gates físicos permanecem intactos.

```powershell
$env:MIXAMO_ROOT='D:\.GITHUB\games\game-2d-aruan\tools\mixamo'
node --expose-gc tools/movalab/scripts/hierarchy-pilot.mjs
$env:MOVALAB_HIERARCHY='1'
$env:MOVALAB_PILOT='1'
node tools/movalab/tests/browser3d.cjs
```
