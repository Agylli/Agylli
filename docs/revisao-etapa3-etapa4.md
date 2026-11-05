# Entrega — revisão da Etapa 3 e preparação da Etapa 4

Data: 5 de novembro de 2026, horário de referência Bahia (UTC−03).

## Arquitetura revisada

SysAla atende a loja física, sem API, webhook ou sincronização automática. A troca de informação é CSV manual. Nuvemshop atende o e-commerce; Mercado Livre e Shopee serão integrados futuramente à operação online. A dependência de conector automático SysAla → Nuvemshop foi removida do planejamento atual. Relatórios anteriores permanecem registros históricos, não orientação vigente de integração.

O site institucional continua sem ERP, estoque ou checkout paralelo. O novo utilitário é local/offline em `tools/conciliacao/`, fora de `src/`, sem servidor, banco, agenda ou rede. A arquitetura e o roadmap foram atualizados com reserva física aprovada e conciliação operacional manual.

## Utilitário entregue

Executar `python3 -m tools.conciliacao --help` na raiz. Requer Python 3.11+ (validado em 3.12), sem bibliotecas externas. No Windows, usar `py -3` conforme a instalação.

| Etapa | Resultado |
| --- | --- |
| `simular` | Preserva bytes originais e metadados privados, calcula hashes, confere arquivos e gera relatório Markdown/JSON, CSV de diferenças e modelo de revisão |
| `revisar` | Recebe quantidades, justificativas e responsável/data; valida todos os SKUs online e gera prévia com hash e modelo de aprovação inicialmente falso |
| `exportar` | Só gera arquivo local com revisão válida, aprovação explícita do hash, corte vigente, fontes atuais coincidentes e modelo oficial confirmado; nunca executa importação |

Há adaptadores explícitos para cabeçalhos, codificação e separador. A configuração genérica não presume layouts reais e mantém `final_format: null`. É necessário obter amostras autorizadas e modelo oficial para homologar a saída real. O formato de saída fictício da suíte testa o mecanismo, não representa um modelo oficial Nuvemshop.

A quantidade proposta não vem automaticamente do saldo físico: fica limitada à reserva bruta aprovada, descontadas vendas ainda não refletidas no ERP e outros compromissos sem sobreposição. O saldo atual online não recebe uma segunda subtração das mesmas vendas. Sem conferência de pedidos, referências ou alocação aprovada, há bloqueio. Movimentos pendentes vêm do registro humano: os dois saldos sozinhos não permitem descobri-los.

## Segurança implementada

- Sem chamadas a Nuvemshop/SysAla, credenciais ou comandos de importação; operação local por lote.
- Duplicidades, mapeamentos ambíguos, produtos online sem correspondência, quantidades negativas/fracionárias não permitidas e reservas impossíveis bloqueiam saída final.
- Excesso de exposição exige proposta explícita dentro do teto; defeitos de origem não podem ser dispensados por justificativa.
- Originais/revisão/plano preservados e conferidos por SHA-256; alteração depois da prévia invalida o fluxo.
- Aprovação humana declarada identifica responsável, data e hash exato e confirma pedidos, reserva física e janela controlada. Não equivale a autenticação ou assinatura digital de identidade.
- Fontes reexportadas diferentes, corte vencido, modelo oficial desconhecido ou alteração crítica não resolvida impedem geração final.
- Arquivo final só recebe o nome de aprovado depois da escrita da aprovação e da auditoria. Uma falha de escrita não expõe um CSV final aparentemente pronto.
- Caminhos privados obrigatórios dentro do projeto; não gravar entradas/saídas comerciais em `public/`, documentação ou outros repositórios Git. Destinos existentes não são sobrescritos.
- Utilitário e dados privados excluídos de `.vercelignore` e dos traces Next; nenhuma rota administrativa foi criada. Não houve deploy administrativo ou alteração em estoque real nesta entrega.

## Demonstração exclusivamente fictícia

Foi executada uma simulação com os fixtures `FICT-*`, copiados para `dados-comerciais/conciliacao/`. O relatório permaneceu privado/ignorado pelo Git e nenhum arquivo final foi gerado.

| Resultado do lote fictício | Observação |
| --- | --- |
| 7 SKUs online | Incluem saldo igual, separação física, compromissos e código diferente mapeado |
| 2 bloqueios críticos | Um excesso de exposição acima da reserva líquida e um SKU online sem correspondência física |
| 4 unidades de vendas pendentes declaradas | Referências dos pedidos são fictícias; quantidade não inferida por diferença de saldo |
| Produto somente no físico | Informado no relatório, sem gerar quantidade para loja |

Outros cenários estão na suíte: duplicados, arquivo incompleto, codificação/separador distintos, dados ausentes/negativos, aprovação inválida, fonte modificada, corte vencido e falha de gravação. Nenhum fixture contém produto, preço, pedido ou condição real da Agylli.

## Validações executadas

| Verificação | Resultado |
| --- | --- |
| Testes do utilitário (`npm run test:conciliacao`) | 40 passaram |
| Testes unitários do site | 14 passaram |
| Testes de navegador | 33 passaram; seis páginas em 375, 768 e 1440 px |
| Lint | Passou, sem erros/avisos |
| Build e TypeScript | Passaram |
| Traces do build | Não incluem utilitário ou dados privados |
| Demonstração CLI | Relatório gerado e saída 3 esperada para lote com bloqueios; sem importação |

A etapa de CI para o utilitário foi preparada no workflow. Esses resultados são locais; não foi executado CI remoto desta revisão. A entrega permanece local para revisão, sem push ou deploy administrativo.

## Procedimento diário e dependências restantes

O [procedimento de conciliação manual](conciliacao-manual.md) define quem exporta SysAla, confere pedidos, registra vendas, aprova reserva e saldo proposto, importa na Nuvemshop e reconcilia a importação. Inclui abertura/fechamento, movimentos durante o dia, cancelamentos, estornos e devoluções. Disponibilidade física só retorna após conferência e lançamento autorizado; estorno financeiro não comprova retorno de mercadoria.

Para usar arquivos reais, a Agylli precisa fornecer/aprovar:

1. Amostras autorizadas das exportações SysAla e Nuvemshop e modelo oficial atual do importador, com identificadores e significado do saldo.
2. Mapeamento de SKUs quando diferentes; uma unidade de expedição ou base já conciliada por unidade; regras de itens/variações e reserva física.
3. Registro aprovado de alocações, vendas online ainda não lançadas e outros compromissos, com referências e responsáveis.
4. Responsáveis reais, corte, validade técnica e janela sem movimentações para revalidar e importar manualmente.
5. URLs e recursos Nuvemshop, aproximadamente dez produtos reais, preços/logística/regras B2B e autorização para os testes comerciais.

Prioridade seguinte: homologar varejo e aprovação de revendedores na Nuvemshop com o piloto e a rotina manual, acompanhar a primeira venda e só depois ampliar catálogo/canais. Não aguardar nem desenvolver conexão direta SysAla inexistente.

Guia técnico: [utilitário](../tools/conciliacao/README.md). Operação: [conciliação manual](conciliacao-manual.md). Visão geral: [arquitetura](arquitetura.md) e [roadmap](roadmap.md).
