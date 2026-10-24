# Hashes canônicos LF — #21

Reproduzido em clone local novo de ff1f346: npm test falha no hash de world.js. A cópia de trabalho antiga tinha finais de linha mistos; o Git já armazenava LF por .gitattributes, então o manifesto antigo não descrevia os bytes publicados.

Os cinco arquivos foram comparados byte a byte após normalizar CRLF para LF com os blobs de HEAD. São idênticos: nenhuma alteração semântica foi feita. Quatro hashes do manifesto foram corrigidos; effects.js já era canônico desde #15. A normalização da working tree não gera diff dos fontes, porque o índice já tinha LF.

| Arquivo | SHA-256 anterior | SHA-256 canônico LF |
|---|---|---|
| js/world.js | 5f1c37e39769da05209909aa6cf0230c514029e8bc23017bea4846a229a45983 | d45d6b27529c25337013ef653d2e46f5fa7148f85f94189686d75f7f42d69f68 |
| js/math.js | d08ed3a29aaaea6a89fb3c207c72cf5c74f6b27ea5b12f5d023b12a2d7754ffa | c5dfde9a8cbabd5ae166975b9d84bf9a8eb7bf87db5d277fcfcb5f47910d57bb |
| js/paint.js | a244a1a901f451329ef59473187e1fe8b4455facaaacc71de04a669ca8dafdeb | a37ac8d88cb997dc49be4b145a5bc899b7e08518080c511291656ddf20729d8a |
| js/effects.js | f91e96a654f6bb3a8821bcedccb0bebe2d49f774993b40667450912ebcc98150 | f91e96a654f6bb3a8821bcedccb0bebe2d49f774993b40667450912ebcc98150 |
| server.cjs | e5efc837a89dcabb3f62a1277424029d0675d0da08200498dce27755fa3b2971 | b624b2dbc01aa1f75e1ed2919e72cb383d30c2206a39f7ab453a451121b1cc4a |

A regressão nova exige LF e SHA-256 correto em npm test. O modo explícito node tests/preservation.cjs --git também compara com HEAD para certificação de um commit; não é imposto durante edição de mudanças autorizadas ainda não commitadas. Evidência de cópia limpa e navegador será registrada no checkpoint.
