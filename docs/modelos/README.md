# Modelos de preparação e homologação

Os quatro modelos da Etapa 2 foram preservados:

| Arquivo | Uso na Etapa 3 |
| --- | --- |
| `produtos-piloto.csv` | Dados dos produtos/variações, varejo, logística, imagens e disponibilidade de origem |
| `precificacao-piloto.csv` | Custos e preço aprovado, exclusivamente para conferência interna |
| `atacado-piloto.csv` | Regras/tabelas B2B a aprovar e validar no recurso contratado |
| `campanhas-utm.csv` | URL e parâmetros de campanha aprovada, se houver; entrada orgânica dispensa campanha |

Controles adicionais:

| Arquivo | Conteúdo inicial e finalidade |
| --- | --- |
| `validacao-piloto.csv` | P01–P10 são posições vazias de controle, não produtos inventados. Preencher SKUs reais e repetir linhas para as variações; nenhuma linha aprovada previamente |
| `mapeamento-importacao-nuvemshop.csv` | Campos do modelo interno; colunas oficiais vazias, aguardando comprovação do formato. Campos de controle marcados para não exportar |
| `homologacao-varejo.csv` | 16 cenários de entrada, carrinho, frete, Pix/cartão, pedido e cancelamento/estorno, todos `nao_executado` |
| `homologacao-revenda.csv` | 13 cenários de CPF/CNPJ, pendência, aprovação, tabela, perfis e revogação, todos `nao_executado` |

## Preparar a cópia de trabalho

```sh
mkdir -p dados-comerciais/etapa3
cp docs/modelos/*.csv dados-comerciais/etapa3/
```

`dados-comerciais/` está ignorado no Git e no pacote de deploy. Arquivos com custos, preços privados, dados pessoais, referências de pedidos e evidências preenchidas permanecem nesse diretório ou em armazenamento privado aprovado. Os modelos desta pasta pública ficam sem dados comerciais reais.

## Preencher e aprovar

1. Obter dados oficiais para os quatro modelos originais. Não presumir preço, estoque, GTIN, regra comercial ou limite do plano.
2. Em `validacao-piloto.csv`, usar `sim`, `nao` ou `nao_aplicavel` com justificativa nos campos de conferência. `resultado` começa em `pendente_dados`; somente alterar para `aprovado` após todas as verificações aplicáveis. Um grupo com variações não está aprovado enquanto houver variação pendente.
3. Em `mapeamento-importacao-nuvemshop.csv`, registrar fonte e versão do modelo oficial, nomes exatos das colunas, unidades/transformações e responsável. Não preencher os destinos presumindo o formato da plataforma. Campos `controle_interno_nao_exportar` ficam fora da vitrine e do arquivo público de importação.
4. Em homologação, registrar `nao_executado`, `bloqueado`, `aprovado`, `reprovado` ou `nao_aplicavel` justificado. Acrescentar data, responsável e referência de evidência privada; não colocar documentos/cartões/comprovantes no CSV público.
5. Gerar o arquivo definitivo fora desta pasta somente depois da confirmação do modelo oficial e aceite do lote. Os modelos de preparação e de testes não devem ser importados diretamente na loja.

Roteiros: [ativação](../ativacao-comercial.md), [catálogo](../catalogo-piloto.md), [homologação](../homologacao-comercial.md) e [primeira venda](../primeira-venda.md).

## Preparação da Etapa 5

- `checklist-implantacao-etapa5.csv`: 14 etapas com papéis, dependências e critérios; resultados inicialmente `nao_executado`.
- `fontes-nuvemshop-etapa5.csv`: oito grupos de recursos aguardando artigo oficial vigente, plano e procedimento confirmados; não há URLs de artigos presumidas.
- `recebimento-arquivos-etapa5.csv`: modelo vazio de inventário privado para fonte, autorização, unidade, corte, encoding, separador, significado do saldo e hash.

Preencher somente cópias privadas. Plano: [implantação da Etapa 5](../implantacao-comercial-etapa5.md). Campos: [mapeamento real](../mapeamento-csv-reais.md).
