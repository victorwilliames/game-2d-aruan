# Etapa 11 — Personalização procedural

O estúdio incorpora um catálogo pequeno que preserva a identidade aprovada. O Aruan original continua como padrão: pele acobreada, pano vermelho, cabelo escuro, faixa com grafismos, pena azul/ocre e madeira clara. Não há sprites, dependências nem mudança de produto.

| Camada | Variações e ordem |
|---|---|
| Corpo / pés / mãos | Mesmo rig, dimensões e material de pele |
| Roupa | Pano simples ou sobreposto; nó e pontas sobre a base da cintura |
| Cabelo | Franja longa ou curta dentro do envelope original da cabeça |
| Acessório | Faixa no pulso esquerdo, antes da mão na composição |
| Cabeça | Faixa facial e grafismos preservados; pena azul/ocre com cor azul configurável |
| Equipamento | Madeira de arco/aljava e pigmento do grip; corda, pontas, pegada e três flechas preservadas |

As peças usam a ordenação de profundidade existente. Materiais de tecido, cabelo, madeira e pena têm sombras/luzes derivadas e cacheadas ao alterar a paleta, sem calcular tintas por frame. Os tons exatos do original são preservados. Original, Mata e Terra oferecem combinações legíveis; cores livres podem reduzir o contraste conforme a escolha do autor.

O painel acompanha o preview e as oito direções/animações existentes. Presets, aleatorizar e reset só editam o preview; **Usar no campo** grava em localStorage na chave aruan.appearance.v1. O campo lê ao entrar e acompanha eventos storage de outras abas. JSON baixado é a mesma configuração; importar é atômico e rejeita versão, enum, campo ou cor desconhecida e arquivos acima de 8 KB. Falhas de armazenamento exibem alternativa de exportação e mantêm o padrão funcional.

Exemplo de formato v1:

```json
{"version":1,"outfit":"wrap","hair":"classic","accessory":"none","palette":{"cloth":"#bd3028","hair":"#30241f","wood":"#b47a40","feather":"#1479a7"}}
```

Schema de dados e armazenamento: js/appearance.js. UI: js/customization.js. Render: character/head; nenhum valor de BODY ou duração de pose muda. JSON nunca contém código, URL, caminho de asset ou dados de gameplay. Sprites externos/LPC continuam dependendo de decisão explícita do autor.

Validação automatizada: 10.552 poses incluindo três presets, schema/round-trip/persistência negada, render real de 3×7×8 combinações, download e upload de arquivo JSON, edição/importação/reset, persistência no campo e toque CDP em 360×740, 740×360 e 320×568. Capturas 018 documentam o resultado; a progressão curada contém o par 006 no campo. Não equivale a teste físico de celular/Xbox ou FPS de display.
