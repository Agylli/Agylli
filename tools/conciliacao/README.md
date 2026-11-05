# Conferência CSV local — Agylli

Utilitário Python 3.11+ (testado com Python 3.12), somente biblioteca padrão, sem servidor, banco, credenciais, chamadas de rede ou integração com o site público. O SysAla **não tem API, webhook ou sincronização automática**. A ferramenta confere retratos exportados manualmente; não é ERP nem fonte de estoque.

## Entradas e configuração

1. CSV de produtos/saldo de uma unidade física do SysAla.
2. CSV de produtos/disponibilidade comercial da Nuvemshop.
3. Mapeamento opcional de códigos físicos e online, um para um; sem arquivo, a correspondência é por SKU idêntico.
4. Registro aprovado de reservas/alocações e conferência dos pedidos online.

Não conhecemos os layouts reais. Copiar `config.example.json` para `dados-comerciais/conciliacao/` e preencher os nomes exatos das colunas depois de receber amostras autorizadas. Os campos vazios do modelo não são um layout SysAla/Nuvemshop. O adaptador de cada fonte define `encoding`, `delimiter`, `columns`, `skip_rows` opcional e, para saldos, `quantity_format`.

Codificações: UTF-8, UTF-8 com BOM (`utf-8-sig`), UTF-16, CP1252 e Latin-1. Separadores: vírgula, ponto e vírgula, tabulação e `|`. Não há autodetecção silenciosa. SKU mantém maiúsculas/minúsculas e zeros iniciais, removendo somente espaços externos; colisões após essa limpeza são bloqueadas. Saldos devem ser inteiros não negativos; por padrão não são aceitos separadores de milhar, decimais ou notação científica. Os modos explícitos `decimal_comma_integral` e `decimal_dot_integral` só aceitam fração zero e exigem confirmação da interpretação do arquivo.

`snapshot_at` registra o corte operacional real de todas as fontes, com fuso ISO 8601. `max_age_minutes` é uma validade técnica configurável de 1 a 1440 minutos, padrão 60; não define frequência comercial nem garante atualização em tempo real. Corte ausente, futuro ou vencido bloqueia exportação. Nova movimentação exige novos retratos e simulação, mesmo dentro desse prazo.

## Registro normalizado de reservas

Os nomes abaixo são campos internos do adaptador, **não nomes presumidos de colunas do ERP ou da loja**. A operação pode mapear seu registro aprovado para esses campos:

| Campo | Significado obrigatório |
| --- | --- |
| `sku` | SKU online a conciliar |
| `allocated` | Reserva física bruta aprovada para o online, incluída no saldo SysAla do corte, antes dos compromissos declarados abaixo |
| `pending_sales` | Unidades de vendas online comprometidas ainda não refletidas no saldo SysAla; preencher zero explicitamente quando conferido que não há pendência |
| `holds` | Outros compromissos/bloqueios ainda incluídos na reserva bruta e no saldo físico, sem sobrepor as unidades de `pending_sales` |
| `pending_refs` | Referências privadas dos pedidos ou evidência da conferência; obrigatório quando há venda pendente |
| `orders_reviewed` | `sim` somente após conferir efetivamente os pedidos/movimentações online até o corte |
| `approved_by`, `approved_at`, `reference` | Responsável, data com fuso e referência da aprovação da alocação |

O **teto líquido** é `allocated - pending_sales - holds`, condicionado à reserva bruta não exceder o saldo físico e os compromissos não excederem a reserva. Nunca é usado `saldo SysAla → saldo Nuvemshop` como regra automática. O saldo online atual não recebe uma segunda subtração de vendas já refletidas na loja. O teto limita propostas; ele não é uma proposta automática de aumento.

Um teto impossível não é ajustado para zero silenciosamente: há bloqueio. Cada SKU online precisa de reserva aprovada e correspondência física. Itens existentes apenas no físico são informados, mas não geram atualização online. Duplicidades, mapeamento ambíguo e dois SKUs online compartilhando um mesmo SKU físico impedem a geração final. Kits, conversão de unidades e agregação automática de filiais não estão implementados.

**Limite de observação:** saldos de dois CSVs não revelam quais vendas ocorreram. A ferramenta identifica as pendências **declaradas e revisadas** no registro, com quantidades e referências; sem essa conferência, bloqueia a saída. Não calcula uma venda a partir da diferença de saldos.

## 1. Simular e preservar originais

Executar da raiz do projeto, sem instalar dependências npm:

```sh
python3 -m tools.conciliacao simular \
  --config dados-comerciais/conciliacao/config.json \
  --sysala dados-comerciais/conciliacao/sysala.csv \
  --nuvemshop dados-comerciais/conciliacao/nuvemshop.csv \
  --reservas dados-comerciais/conciliacao/reservas.csv \
  --mapeamento dados-comerciais/conciliacao/mapeamento.csv \
  --saida dados-comerciais/conciliacao/caso-001
```

No Windows com Python instalado, usar `py -3 -m tools.conciliacao ...`. Omitir `--mapeamento` somente quando os códigos forem realmente idênticos. Campos do registro interno precisam de aprovação da operação, não podem ser extraídos por suposição.

São gerados `originals/` com bytes originais, `manifest.json` com nomes/caminhos privados, hashes SHA-256, tamanhos e metadados, `report.md`, `report.json`, `differences.csv` e `review-template.csv`. Nada é enviado a serviços externos. Os arquivos originais de entrada não são modificados; snapshots e relatórios de auditoria são criados com acesso restrito e proteção contra sobrescrita. Não editar snapshots/manifestos: corrigir a fonte e abrir novo caso.

O CSV de diferenças é para leitura, não importação. A diferença físico−online pode ser esperada por causa da separação de canais. Relatórios e prévias escapam células potencialmente interpretadas como fórmulas. JSON e originais podem conter dados comerciais da exportação e devem permanecer privados.

## 2. Revisar quantidades e gerar prévia

Copiar `review-template.csv` para um arquivo de trabalho privado. Preencher todos os SKUs online do lote: `proposed_quantity`, justificativa (`reason`), responsável (`reviewed_by`) e data ISO com fuso (`reviewed_at`). Para manter saldo também é necessária decisão explícita; quantidade vazia não é zero.

```sh
python3 -m tools.conciliacao revisar \
  --caso dados-comerciais/conciliacao/caso-001 \
  --revisao dados-comerciais/conciliacao/revisao.csv \
  --saida dados-comerciais/conciliacao/plano-001
```

A revisão interna usa CSV UTF-8/vírgula conforme o modelo gerado. São produzidos `preview.csv`, `plan.json` com hash, cópia da revisão e `approval.example.json` com aprovação inicialmente falsa. Quantidade negativa, acima do teto, revisão incompleta, SKU duplicado/desconhecido ou ausência de justificativa bloqueiam o plano.

Exposição online acima da reserva pode ser resolvida com proposta válida e aprovada. Erros de origem, duplicidades, pendências não conferidas e outros defeitos críticos **não podem ser dispensados** por uma justificativa: exigem correção e novo caso.

## 3. Geração final — desabilitada sem modelo e aprovação

A configuração genérica tem `final_format: null`. Para arquivos reais, aguardar o modelo oficial Nuvemshop e amostras autorizadas; validar o procedimento de atualização **apenas de saldo**, as colunas, identificadores de produto/variação e o comportamento do importador. Não gerar um arquivo de cadastro completo que possa sobrescrever preços, descrições ou criar produtos.

Só depois dessa validação o adaptador `final_format` pode declarar:

- `confirmed: true`, `stock_only_update_confirmed: true`, `confirmed_by`, `confirmed_at` e `reference` da versão/fonte oficial;
- `quantity_semantics: "absolute_available"` somente depois de confirmar que o importador recebe saldo disponível absoluto; formato de incremento/débito ou movimento não é suportado;
- `template_path` do modelo oficial, preservado no caso, `encoding` e `delimiter`;
- `columns`, na ordem exata do modelo. Cada item tem `header` e **ou** `source_column` (campo copiado da exportação Nuvemshop) **ou** `quantity: true` (uma única coluna de saldo);
- `identifier_source_column`, presente na saída, único e preenchido na origem, que identifica corretamente o item a atualizar.

Não há valores reais de colunas de saída neste guia. Os formatos usados na suíte são fictícios e não homologam o importador da plataforma. Se o modelo exigir transformações que o adaptador não suporta, manter bloqueado e implementar/testar a adaptação após receber a especificação.

Depois da prévia, um responsável preenche uma cópia privada da aprovação JSON, informando `approved`, `approved_by`, `approved_at`, o hash exato de `plan_sha256`, `controlled_window`, `movements_reviewed` e `physical_allocation_confirmed`. Todas as confirmações booleanas devem ser verdadeiras. Isso é uma declaração auditável da operação, não autenticação ou assinatura digital de identidade.

```sh
python3 -m tools.conciliacao exportar \
  --caso dados-comerciais/conciliacao/caso-001 \
  --plano dados-comerciais/conciliacao/plano-001 \
  --aprovacao dados-comerciais/conciliacao/aprovacao.json \
  --confirmar-plano HASH_EXATO_DA_PREVIA \
  --sysala dados-comerciais/conciliacao/sysala-reexportado.csv \
  --nuvemshop dados-comerciais/conciliacao/nuvemshop-reexportado.csv \
  --reservas dados-comerciais/conciliacao/reservas-reconferidas.csv \
  --mapeamento dados-comerciais/conciliacao/mapeamento.csv \
  --saida dados-comerciais/conciliacao/saida-aprovada-001
```

As fontes atuais devem estar fora da pasta de auditoria e coincidir byte a byte com os retratos aprovados. Se qualquer fonte mudar, até por nova estrutura/ordem do arquivo, criar nova simulação e aprovação; o utilitário prefere bloquear a aplicar um retrato antigo. Alteração de original, revisão ou plano, aprovação de outro hash, data futura, corte vencido, modelo desconhecido e divergências críticas impedem a criação final.

A saída usa CSV com aspas em todos os campos e finais de linha CRLF; confirmar compatibilidade com o modelo oficial. A saída contém `estoque-aprovado.csv`, cópia da aprovação e `audit.json`, sempre com `import_performed: false`. Somente alterações efetivamente propostas são incluídas. Nenhum arquivo é gerado quando não há alteração. O operador ainda precisa importar manualmente na plataforma, em janela controlada, e reexportar para conferir o resultado. O utilitário não observa a loja em tempo real: se houver movimentação entre a conferência e a importação, a prévia perde validade. Não importar um ajuste absoluto sem garantir a janela operacional.

## Privacidade e execução

Dentro do projeto, saídas são permitidas somente em `dados-comerciais/`; fora dele, somente em diretório privado fora de repositórios Git e de pastas `public`. Destinos já existentes não são sobrescritos. Os registros são auditoria de lotes, sem API, agenda automática, banco, cadastro de clientes ou saldo persistido como fonte operacional.

Códigos de saída: `0` operação local concluída, `3` relatório/prévia gerado com bloqueios, `2` operação recusada ou arquivo/configuração inválido. Um relatório criado não significa que uma importação foi autorizada.

```sh
python3 -m unittest discover -s tools/conciliacao/tests -p 'test_*.py' -v
# Alternativa, se o ambiente Node do projeto estiver instalado:
npm run test:conciliacao
```

Fixtures em `tests/fixtures/` são exclusivamente fictícios para testes, com SKUs/referências `FICT-*`. Nunca usar seus cabeçalhos como especificação real de ERP/importador. Procedimento diário: [conciliação manual](../../docs/conciliacao-manual.md).
