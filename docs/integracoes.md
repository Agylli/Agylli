# Integrações e limites — arquitetura híbrida atualizada

## SysAla: somente CSV manual

Informação definitiva fornecida pela Agylli: o SysAla é utilizado na loja física e **não possui API, webhooks ou sincronização automática com plataformas de e-commerce**. A integração possível é exportação manual de CSV. Não existe dependência de conexão automática SysAla → Nuvemshop, nem haverá tentativa de criar essa conexão.

A operação deve conferir pedidos/movimentos online, registrar manualmente vendas no SysAla, aprovar a reserva física para o online e conciliar os CSVs. O saldo total do físico não é uma autorização para sobrescrever o saldo comercial da Nuvemshop. O [procedimento diário](conciliacao-manual.md) define papéis, corte, janela controlada, cancelamentos e devoluções.

A ferramenta [local de conferência](../tools/conciliacao/README.md) trabalha offline, com originais preservados, relatório, revisão manual, prévia e aprovação do hash. Não mantém banco de estoque, não escreve no ERP ou na loja, não importa automaticamente e não deve ser publicada como painel administrativo.

## Nuvemshop: plataforma comercial online

`NEXT_PUBLIC_NUVEMSHOP_URL` direciona o varejo. Sem URL HTTPS válida, os links levam a `/loja-em-breve`. `NEXT_PUBLIC_NUVEMSHOP_B2B_URL` define cadastro/acesso de revendedores; sem configuração, usa `/contato?assunto=revenda`. O institucional não consulta catálogo, cria clientes, altera preços, atualiza estoque ou processa checkout.

A prioridade é homologar aproximadamente dez produtos reais, varejo, CPF/CNPJ e aprovação B2B, tabelas, Pix/cartão, frete e pedidos. Planos/recursos, URLs, dados, pagamentos e acessos ainda precisam ser fornecidos/aprovados. O formato oficial de importação não foi confirmado; a ferramenta local mantém a geração final bloqueada no modelo genérico até receber amostras e modelo oficial.

APIs/webhooks da **Nuvemshop ou de marketplaces**, se necessários futuramente e disponíveis, serão avaliados separadamente, com documentação oficial, autorização e credenciais no servidor/hub. Essa possibilidade não inclui o SysAla nem elimina a conciliação manual com o físico.

## Mercado Livre e Shopee: etapa posterior da operação online

Planejar hub compatível com a Nuvemshop ou APIs oficiais autorizadas, compartilhando catálogo/identificadores e regras de disponibilidade **da operação online**. Não procurar um conector automático para o SysAla, que não oferece essa capacidade.

Antes de ampliar canais, definir como a reserva física destinada ao online será distribuída/compartilhada entre Nuvemshop e marketplaces, sem prometer a mesma unidade simultaneamente em mais de um lugar. Definir preços, frete, atendimento, identificadores de pedido e rotina de conciliação. Nenhuma conta, anúncio ou integração foi criada nesta entrega.

## Responsabilidade pelos dados

| Domínio | Sistema e processo | Limite |
| --- | --- | --- |
| Loja física | SysAla, com exportação de CSV e lançamentos manuais autorizados | Sem API, webhook ou sincronização automática |
| E-commerce | Nuvemshop, com catálogo, clientes, B2B, pedidos, pagamentos e saldo comercial | Alterações somente por processo oficial autorizado; não comandadas pelo site |
| Reserva física | Separação/identificação e registro aprovado pela operação | Não é o saldo total do ERP; deve considerar compromissos e movimentos ainda não lançados |
| Conferência | Utilitário local por lote, com retratos, hashes e aprovação humana | Auditoria, não ERP ou base persistente de saldo operacional |
| Marketplaces futuros | Integração à operação online por hub/API autorizados | Não cria acesso automático ao SysAla nem duplica a reserva física disponível |

Um SKU deve representar a mesma unidade vendável. Códigos diferentes exigem mapeamento um-para-um conferido. Agregação de filiais, kits e conversões não são inferidos; a ausência de correspondência não pode ser resolvida por aproximação de nome.

## Supabase

O cliente opcional permanece em `src/integrations/supabase/client.ts`, sem conexão durante a renderização e sem banco/autenticação habilitados. Não usar o Supabase para recriar ERP, saldo ou cadastro comercial da Nuvemshop. Uma funcionalidade futura que precise do serviço exige finalidade, schema, RLS e autorização próprios. Chaves secretas jamais entram em `NEXT_PUBLIC_*`, Git ou logs.

## Preparação e homologação

- [Conexão de varejo/B2B](nuvemshop.md).
- [Catálogo piloto](catalogo-piloto.md).
- [Ativação comercial](ativacao-comercial.md) e [homologação](homologacao-comercial.md).
- [Conciliação manual](conciliacao-manual.md) e [utilitário local](../tools/conciliacao/README.md).
- [Análise e consentimento](mensuracao.md), sem rastreadores ativos.

Integrações futuras online exigirão autenticação, idempotência, tratamento de falhas e reconciliação conforme os serviços escolhidos. Isso não representa um processo SysAla automático nem uma dependência para começar a operar o piloto manual aprovado.
