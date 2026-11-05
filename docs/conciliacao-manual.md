# SysAla e Nuvemshop — procedimento de conciliação manual

## Premissa definitiva e escopo

O SysAla atende a loja física e **não possui API, webhooks ou sincronização automática com e-commerce**. O intercâmbio disponível é exportação manual de CSV. A Nuvemshop opera o e-commerce e seu cadastro/pedidos/checkout. O site Next.js apresenta a marca e encaminha públicos, sem saldo, ERP ou checkout paralelo.

O utilitário [tools/conciliacao](../tools/conciliacao/README.md) é local e offline: preserva exportações, detecta inconsistências, apresenta uma prévia e só gera arquivo local após revisão/aprovação e confirmação do formato oficial. Ele nunca importa automaticamente na Nuvemshop ou escreve no SysAla.

## Responsabilidades — nomes a definir pela Agylli

| Papel operacional | Responsabilidade |
| --- | --- |
| Responsável da loja física | Exportar CSV SysAla da unidade e do corte definidos; conferir contagem física quando houver divergência |
| Conferente do e-commerce | Conferir pedidos, pagamentos, reservas, cancelamentos e devoluções na Nuvemshop; identificar vendas ainda não lançadas no SysAla |
| Operador SysAla | Registrar manualmente as vendas/movimentações autorizadas no sistema físico, com referência do pedido e controle para não duplicar lançamentos |
| Aprovador comercial/estoque | Aprovar separação física, disponibilidade destinada ao online, compromissos e proposta final; resolver divergências críticas |
| Operador Nuvemshop | Reexportar e conferir o retrato atual; importar somente o arquivo aprovado pelo processo oficial confirmado; reexportar depois e conciliar |
| Gestor da operação | Definir horários, substitutos, janela sem movimentações, resposta a falhas e autorização para liberação |

Preferir revisão e aprovação por pessoas distintas quando a equipe permitir. Os papéis não são nomes ou acessos fictícios: atribuir responsáveis reais e registrar a decisão internamente. Quem importa não pode mudar a quantidade aprovada por conta própria.

## Reserva física de mercadoria para o online

Para o piloto de aproximadamente dez produtos, aprovar uma quantidade fisicamente separada/identificada por SKU e unidade de expedição. Essa mercadoria não deve ser vendida no balcão sem nova autorização e revisão da alocação. A reserva reduz o risco de o mesmo item ser prometido nos dois canais; não cria um segundo saldo no site.

O registro aprovado informa reserva **bruta**, unidades de vendas online ainda incluídas no saldo físico, outros compromissos não descontados, referências dos pedidos e confirmação de conferência. Não usar a diferença entre dois saldos como se ela representasse vendas pendentes. Um registro desconhecido deve ficar pendente; nunca preencher zero para esconder ausência de conferência.

A ferramenta limita a proposta a `reserva bruta − vendas pendentes de lançamento − outros compromissos`, sem subtrair novamente essas vendas do saldo online que já as refletiu. Quando a venda for lançada no SysAla, atualizar também o registro de alocação para o novo corte: não apenas zerar a pendência mantendo uma reserva bruta antiga, o que poderia criar reposição indevida.

Várias unidades com o mesmo SKU não serão somadas automaticamente. No piloto, definir uma unidade de origem ou fornecer uma base de correspondência previamente reconciliada e aprovada, preservando os CSVs originais. Kits e conversões de unidades exigem processo específico; não forçar um mapeamento um-para-um incorreto.

## Rotina de abertura e fechamento

1. **Definir corte:** gestor e responsáveis combinam período, unidade, SKUs piloto e janela controlada. Registrar datas com fuso e responsáveis.
2. **Exportar SysAla:** responsável da loja física guarda o CSV original sem edição em diretório privado. Confirmar unidade, significado do saldo, data de corte e se há reservas/bloqueios já descontados.
3. **Conferir online:** conferente consulta pedidos/movimentações na Nuvemshop e exporta o estoque. Separar pedido criado, não pago, aprovado, cancelado, devolvido e estornado conforme os estados reais da plataforma.
4. **Lançar no físico:** operador SysAla registra manualmente os movimentos autorizados ainda ausentes, com referência privada e prevenção de duplicidade. Conferir com o responsável se o pedido movimenta disponibilidade antes ou depois do pagamento conforme a regra adotada.
5. **Reexportar após lançamentos:** se algo mudou, atualizar os arquivos e o registro de reserva; não misturar um corte anterior do ERP com um corte posterior da loja sem conciliação dos movimentos intermediários.
6. **Conferir reserva:** aprovador verifica mercadoria separada, pendências restantes e outros compromissos, confirma a conferência de pedidos e aprova o registro. Quantidade disponível de cada SKU deve ser explícita, inclusive zero.
7. **Simular:** executar o utilitário com adaptadores baseados nas amostras reais. Ler os relatórios de itens sem correspondência, duplicados, dados inválidos, diferenças e vendas pendentes. Itens só no físico não viram estoque online automaticamente.
8. **Resolver erros:** duplicidade, correspondência ausente de item online, registro não aprovado ou reserva impossível exigem correção da fonte e nova simulação. Não dispensar erro crítico com justificativa genérica.
9. **Revisar e aprovar:** preencher quantidades propostas e motivos; conferir a prévia, o hash e o arquivo-modelo oficial do importador. Aprovador declara o aceite da prévia exata e das condições operacionais.
10. **Revalidar a janela:** reexportar fontes e reconferir pedidos. Se arquivos ou movimentos mudarem, refazer a simulação/revisão. Não importar ajuste absoluto enquanto não houver garantia operacional de janela sem movimentações até concluir a importação; o utilitário não consegue observar ou bloquear vendas online/físicas.
11. **Gerar e importar manualmente:** somente com modelo oficial confirmado, nenhum bloqueio e aprovação válida. Operador importa no painel pelo procedimento oficialmente homologado, sem sobrescrever cadastro/preço ou criar produtos inadvertidamente.
12. **Conferir depois:** reexportar a Nuvemshop, comparar as quantidades/identificadores afetados com o arquivo aprovado e os eventos ocorridos; registrar resultado e divergências. O fato de gerar um CSV não comprova que a importação foi aceita.
13. **Arquivar e encerrar:** preservar originais, hashes, revisões, aprovações e evidências privadas; encerrar pendências com responsáveis e prazo. Definir retenção e backup privado pela política da empresa.

Fazer a rotina no início/fim da operação e rever os SKUs afetados **a cada movimento relevante**, especialmente com o catálogo piloto. Uma conferência diária isolada não garante estoque atualizado durante o dia. Não esperar o próximo dia para tratar exposição indevida ou uma venda ainda não lançada.

## Tratamento de ocorrências

| Ocorrência | Ação operacional |
| --- | --- |
| Saldo SysAla diferente do online | Conferir reserva e movimentos; a diferença pode ser legítima entre canais. Não igualar saldos automaticamente |
| Online acima da reserva líquida | Interromper a liberação correspondente conforme processo aprovado, revisar exposição e propor ajuste dentro do teto; só importar em janela controlada |
| Venda online não lançada | Identificar pedido e unidades, registrar no SysAla uma vez quando autorizado e reexportar/reconciliar reserva no novo corte |
| Cancelamento não pago | Conferir liberação de compromisso segundo comportamento oficial; não registrar estorno de dinheiro inexistente nem somar mercadoria novamente sem conferir o saldo |
| Cancelamento pago/estorno | Tratar dinheiro e mercadoria separadamente; confirmação de estorno não comprova retorno físico. Acompanhar provedor e pedido oficial |
| Devolução | Reincorporar disponibilidade somente depois de recebimento, inspeção e lançamento autorizado; não disponibilizar automaticamente por status de devolução solicitado |
| SKU duplicado/sem correspondência | Corrigir cadastro/mapeamento; não agregar filiais, kits ou produtos diferentes por aproximação de nomes |
| Arquivo incompleto ou codificação divergente | Confirmar exportação, separador e encoding; preservar o original e gerar novo caso após corrigir o adaptador/fonte |
| Arquivo mudou depois da aprovação | Invalidar prévia e gerar nova simulação; não usar um hash antigo para um lote novo |
| Importação com erro ou parcial | Guardar retorno do painel, interromper novos ajustes e reexportar; não repetir cegamente o mesmo arquivo nem repor quantidades pelo relatório anterior |

## Condições para arquivos reais

Aguardar amostras autorizadas do SysAla, exportação e modelo oficial da Nuvemshop, mapeamento de SKUs quando necessário e registro de reservas aprovado. Confirmar cabeçalhos, codificações, separadores, unidades de saldo, identificadores de atualização e comportamento de importação parcial/total. A geração final permanece desabilitada no modelo de configuração genérico.

Todos os arquivos reais, custos, pedidos, aprovações e relatórios ficam em `dados-comerciais/` ou armazenamento privado aprovado, fora do GitHub e de `public/`. A ferramenta não deve ser publicada como painel web. O código e os fixtures fictícios podem ser revisados separadamente; qualquer deploy administrativo exige autorização específica.

## Prioridade comercial

Manter a homologação de varejo e de cadastro/aprovação de revendedores na Nuvemshop com cerca de dez produtos reais, Pix/cartão, frete e pedidos. Usar esta rotina manual e a reserva física aprovada no piloto, sem esperar conexão SysAla inexistente. Mercado Livre/Shopee serão integrados futuramente à **operação online**, com regras de disponibilidade entre canais e conciliação manual com a loja física.
