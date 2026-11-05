# Recebimento e mapeamento dos arquivos reais

Este documento prepara os adaptadores existentes; não define o layout real do SysAla ou da Nuvemshop. O `config.example.json` mantém os nomes das colunas vazios e `final_format: null`. Nenhum estoque deve ser enviado à loja a partir de um formato presumido.

## Receber sem publicar

1. Solicitar amostras autorizadas dos dois sistemas, modelo oficial de atualização de estoque e registro de alocações aprovado. Se houver dados pessoais/custos desnecessários, solicitar uma amostra minimizada pelo responsável, preservando os originais autorizados em armazenamento privado.
2. Salvar em `dados-comerciais/etapa5/entradas/` ou pasta privada aprovada. Não preencher os CSVs públicos de `docs/modelos/` com dados reais.
3. Preencher uma cópia privada de [recebimento-arquivos-etapa5.csv](modelos/recebimento-arquivos-etapa5.csv): fonte, responsável, unidade, corte com fuso, codificação, separador, significado do saldo e hash.
4. Confirmar contagem esperada, presença de todas as variações e se a exportação pertence a uma única unidade. Duplicidade de SKU não autoriza somar filiais ou montar kits automaticamente.

## Campos a mapear — nomes reais ainda pendentes

| Origem | Campo normalizado na ferramenta | Confirmar na amostra/documentação |
| --- | --- | --- |
| SysAla | `adapters.sysala.columns.sku` | Identificador físico da unidade vendável; preservar zeros e diferenciar variações |
| SysAla | `adapters.sysala.columns.quantity` | Qual coluna representa saldo e quais compromissos/bloqueios já foram descontados |
| Nuvemshop | `adapters.nuvemshop.columns.sku` | SKU da variação online, sem usar nome comercial como chave |
| Nuvemshop | `adapters.nuvemshop.columns.quantity` | Disponibilidade comercial exportada e tratamento de pedidos/reservas na plataforma |
| Mapeamento de códigos | `mapping.columns.sysala_sku` e `mapping.columns.online_sku` | Correspondência um-para-um aprovada quando os códigos diferem; não repetir o mesmo estoque físico em dois SKUs online |
| Registro operacional | `allocations.columns.sku` | SKU online ao qual pertence a reserva |
| Registro operacional | `allocated`, `pending_sales`, `holds` | Reserva bruta, vendas ainda não refletidas no SysAla e outros compromissos, sem sobreposição |
| Registro operacional | `pending_refs`, `orders_reviewed` | Referências privadas e confirmação efetiva da conferência dos pedidos; os dois saldos não revelam os movimentos sozinhos |
| Registro operacional | `approved_by`, `approved_at`, `reference` | Responsável, data com fuso e referência da aprovação |
| Modelo oficial de saída | `final_format.columns` | Cabeçalhos e ordem exatos, coluna de saldo e campos de origem que devem ser preservados |
| Modelo oficial de saída | `identifier_source_column` | Identificador real para atualizar cada produto/variação, único e presente na saída |
| Modelo oficial de saída | `quantity_semantics` | Confirmar saldo disponível absoluto; a ferramenta não produz movimentos incrementais |

Os nomes na coluna central são o contrato interno do utilitário, não cabeçalhos de uma exportação real. Usar os nomes exatos encontrados no arquivo autorizado e confirmar `encoding`, `delimiter`, `skip_rows` e representação numérica. Não escolher separador/encoding por tentativa silenciosa nem transformar milhar/decimal sem conhecer a convenção.

## Aceitar um adaptador real

- Conferir os dez produtos piloto e todas as suas variações nos dois arquivos; uma linha com quantidade vazia não é zero.
- Registrar o significado dos saldos e reconciliar pedidos pendentes com a reserva física aprovada. Não copiar o saldo físico total para o e-commerce.
- Rodar `simular` e ler todas as ocorrências. Corrigir duplicidades, correspondências ausentes, dados inválidos e compromissos não conferidos na fonte, criando novo caso.
- Preencher revisão manual e conferir a prévia; manter a geração final bloqueada até confirmar o modelo oficial e o modo de atualização apenas de saldo.
- Confirmar que a saída não altera cadastro/preços nem cria produtos. Uma planilha de cadastro de catálogo não serve automaticamente como atualizador exclusivo de estoque.
- Obter aprovação do hash da prévia, revalidar as fontes na janela operacional e só gerar arquivo local após as autorizações aplicáveis. Importar na Nuvemshop é ação posterior e separada, não executada pelo utilitário.

Guia de comandos e barreiras: [ferramenta local](../tools/conciliacao/README.md). Rotina e responsáveis: [conciliação manual](conciliacao-manual.md). Nenhuma amostra real, modelo oficial ou configuração comercial foi fornecida/validada nesta etapa.
