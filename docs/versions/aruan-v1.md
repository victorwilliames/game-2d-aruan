# Aruan V1 — ponto de restauração (rig original)

**Versão histórica congelada por commit:** `1aadd07f4bef562d347f5366b8918f5a1cf559cf`

**Tag anotada publicada:** `aruan-v1-rig-original` (aponta exatamente para esse commit)

**Código da V1:** https://github.com/victorwilliames/game-2d-aruan/tree/1aadd07f4bef562d347f5366b8918f5a1cf559cf

**Commit completo:** https://github.com/victorwilliames/game-2d-aruan/commit/1aadd07f4bef562d347f5366b8918f5a1cf559cf

**O que significa:** Este commit representa o último estado da branch principal **antes de começar a integração de arquitetura do Aruan Rig V2 e MovaLab Procedural**. Ele preserva o código, o rig atual, as três animações de ataque, locomoção, estúdio e o visual construído até aqui. Não significa jogo finalizado/certificado: os problemas e tarefas pendentes dessa data continuam fazendo parte da V1.

## Decisão do autor

- Usar **uma branch de trabalho principal** (atualmente `master`; é a principal equivalente a `main`).
- Evitar criar branches para cada mudança. Branches temporárias de implantação podem ser integradas ou descartadas após inspeção.
- O **Aruan V1 fica preservado no histórico Git**, por este identificador exato; não gerar ZIP nem copiar todo o projeto para outra pasta.
- O desenvolvimento a partir daí é **Aruan V2**, com rig humanoide melhor estruturado e suporte futuro ao MovaLab Procedural.
- Não migrar ou substituir o renderer Canvas 2D, arte chibi/procedural, cinemática inversa, controles ou combate sem testes e aprovação.
- Não declarar V2 concluída apenas porque o documento foi publicado.

## Recuperação

Para consultar a versão antiga, abrir o link **Código da V1** acima ou usar a tag `aruan-v1-rig-original` (`git show aruan-v1-rig-original`). O identificador completo do commit aponta sempre para a mesma árvore, mesmo quando a branch principal continuar recebendo melhorias.

Para restaurar código, prefira comparar arquivos específicos ou criar uma restauração controlada a partir desse commit/tag, evitando sobrescrever trabalho novo sem revisão.

**Observação:** este é um marco permanente por commit e pela tag anotada `aruan-v1-rig-original`, publicada no GitHub. Não é um GitHub Release e **não significa que o jogo esteja finalizado ou certificado**.

## Próxima fase

Ver [Aruan V2 — arquitetura e migração](aruan-v2.md) e [MovaLab Procedural](../../tools/movalab/README.md) (a documentação MovaLab é integrada à principal após o checkpoint V1).
