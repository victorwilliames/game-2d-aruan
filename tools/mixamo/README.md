# Fontes Mixamo locais — Sprint 9

Fonte: [Linzhan/Mixamo-Animations-Characters](https://huggingface.co/datasets/Linzhan/Mixamo-Animations-Characters). Uso interno; o dataset declara `adobe-mixamo-terms`. Não redistribuir o pack bruto no Git. O manifesto fixa a revisão e preserva tamanhos e SHA-256/LFS.

Sem dependência nova, sem cache global ou duplicação em C:. Execute da raiz do repositório:

```powershell
node tools/mixamo/scripts/acquire.cjs inventory --public
node tools/mixamo/scripts/acquire.cjs download --public
node tools/mixamo/scripts/acquire.cjs verify --public
node tools/mixamo/tests/acquire.cjs
```

`--root=D:\.GITHUB\games\game-2d-aruan\tools\mixamo` permite que um checkout isolado use a pasta principal sem copiar fontes. `inventory` é o dry-run: só consulta metadados e falha se a seleção não tiver 2.317 movimentos e os 19 personagens exatos. `download` usa três workers, reaproveita arquivos íntegros e retoma `.part` apenas com HTTP 206 e Content-Range correto. Um arquivo existente inválido é preservado e reportado. Reexecute após resolver uma falha; não execute duas instâncias na mesma raiz.

O orçamento usa 10.000.000.000 bytes (limite conservador) e reserva de 2.000.000.000 bytes livres. Transferência é reservada antes da requisição: uma tentativa interrompida pode consumir orçamento conservador maior que o tráfego real, evitando subcontagem após falha. O ledger local não contém credenciais. Fontes, derivados e temporários devem ficar nesta raiz para serem medidos; o relatório também informa o checkout temporário. Não converter tudo antes do piloto de armazenamento/precisão.

Sem `--public`, somente a configuração padrão HF do próprio usuário é consultada; tokens nunca entram em URLs ou logs. Nesta sessão o cache padrão retornou 401 e a rota pública foi usada. Nenhuma autenticação bem-sucedida foi declarada.

Catalogado, presente, convertido, validado, prévia Canvas, aprovado visualmente e integrado são estados distintos. Este importador só adquire/verifica fontes. MovaLab e runtime serão conectados nas etapas seguintes.
