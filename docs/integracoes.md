# Integrações e limites

## Nuvemshop

**Varejo preparado:** `NEXT_PUBLIC_NUVEMSHOP_URL` define o destino dos links de compra, inclusive dos produtos demonstrativos. Sem uma URL HTTPS válida, os links levam a `/loja-em-breve`; nenhum endereço de loja foi inventado. Não há consulta de catálogo, autenticação, preços ou checkout local.

**Atacado preparado:** a apresentação fica em `/atacado`. `NEXT_PUBLIC_NUVEMSHOP_B2B_URL` será o destino do botão de solicitação de acesso quando a área B2B estiver disponível. Até lá, `/contato?assunto=revenda` explica a preparação do cadastro e apresenta os contatos oficiais das unidades. Nenhum pedido ou cadastro é enviado agora.

**Próxima decisão:** confirmar recursos e plano B2B, critérios de CPF/CNPJ, documentos, pedido mínimo, preços, regras de aprovação, cadastro e domínio. Se houver necessidade real de API, usar a documentação oficial da Nuvemshop, aplicação autorizada e escopos mínimos. Tokens e app secrets devem permanecer no servidor; não usar `NEXT_PUBLIC_*`. Definir webhooks verificados, idempotência, cache e tratamento de indisponibilidade antes de implementar.

## SysAla

A empresa já utiliza o sistema na loja física. Não presumir que exista API pública, webhook ou conector. Solicitar documentação oficial, versão e contrato de acesso; validar identificação de produtos/variações, fonte de verdade de estoque, atualização incremental, limites, autenticação e ambiente de teste. Não foi feita conexão, extração ou gravação no SysAla.

## Mercado Livre e Shopee

Integração futura via hub compatível com a operação ou APIs oficiais com contas autorizadas. Avaliar catálogo, SKU, variações, pedidos e conflitos de estoque em conjunto com a Nuvemshop e o SysAla. Não foram conectadas contas, criados anúncios ou solicitadas permissões.

## Supabase

Cliente preparado em `src/integrations/supabase/client.ts`. `getSupabaseClient()` retorna `null` quando não configurado. A função só aceita URL HTTPS e chave com prefixo `sb_publishable_`. O nome da variável já limita o uso à chave publicável; o validador é uma proteção adicional e não substitui a revisão de credenciais.

O cliente não é importado pelas páginas atuais, não cria conexão na renderização e não ativa autenticação persistente. Nenhuma tabela, migração, política, storage bucket ou usuário foi criado. Não há necessidade de credencial para a Etapa 1.

Para evoluir: criar projeto autorizado, configurar URL e chave publicável, definir schema, habilitar RLS, políticas por papel e testes de autorização; usar integração SSR oficial se autenticação for aprovada. Chaves secretas e `service_role` jamais podem ser expostas no cliente, nos logs ou no Git.

## Preparação detalhada

- [Conexão e aceite de varejo/B2B](nuvemshop.md).
- [Catálogo piloto, logística, preços e estoque de origem](catalogo-piloto.md).
- [Análise de resultados, UTMs e compra concluída](mensuracao.md).

Os três documentos são preparação: não significam que uma loja, API ou conta comercial tenha sido conectada.

## Planejamento após a homologação comercial — Etapa 3

Primeiro validar o varejo e o B2B na Nuvemshop. O institucional continua encaminhando públicos; não passa a processar pedidos, clientes ou estoque por causa de uma integração futura.

| Domínio de dados | Decisão/integração a validar | Limite arquitetural |
| --- | --- | --- |
| Catálogo e SKUs | Identificador estável de produto/variação e mapeamento entre Nuvemshop, SysAla e eventual hub | Um SKU identifica a mesma unidade vendável; não usar nome como chave nem criar catálogo operacional paralelo no Next.js |
| Disponibilidade | Agylli escolhe fonte oficial, unidade(s), reservas e rotina de atualização | Não presumir soma de unidades, API SysAla ou dois sistemas escrevendo o mesmo saldo sem regra |
| Pedidos/pagamento | Definir sistema que recebe cada pedido, estados e responsáveis por conciliação | Pedido, cancelamento e estorno seguem a plataforma/provedor; não duplicar cobrança ou atendimento financeiro |
| Clientes B2B | Validar perfil, aprovação, tabela e escopos disponíveis na Nuvemshop | Não copiar CPF/CNPJ/documentos para um segundo cadastro no Supabase/institucional |
| Marketplaces | Comparar hub compatível com Nuvemshop/SysAla e APIs oficiais; decidir estoque, anúncios, preço/frete e atendimento por canal | Não conectar contas nem publicar anúncios antes da autorização e da consistência do piloto |

Para SysAla, solicitar documentação oficial, versão, acesso e ambiente de testes; verificar recursos reais de produto/variação, unidades, disponibilidade, pedidos, autenticação, limites e atualização incremental. A escolha entre consulta, webhook, arquivo ou conector depende dessa validação, sem inferir que algum desses recursos esteja disponível.

Se um conector for aprovado, especificar no servidor ou hub autorizado: validação de origem/autenticação, idempotência por evento/pedido, reprocessamento sem duplicação, tratamento de falhas, limites de API, monitoramento e reconciliação de saldos/estados. Não expor tokens em `NEXT_PUBLIC_*`; logs não devem conter documentos pessoais ou segredos. Antes de ampliar canais, testar reserva/liberação em pedido, recusa, cancelamento e estorno conforme o comportamento dos sistemas oficiais.

Critério para iniciar marketplaces: catálogo piloto e jornada de compra aprovados, identificadores conciliados, fonte de disponibilidade definida e responsável por divergências. Não foi feita conexão, extração de dados, anúncio, rotina de saldo ou contratação nesta etapa.
