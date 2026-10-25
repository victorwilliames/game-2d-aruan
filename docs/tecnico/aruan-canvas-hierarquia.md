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

O teste browser usa Chrome headless e hardlink do FBX conhecido, em fixture no D:. Não altera a biblioteca/bindings do autor nem abre janela visível.
