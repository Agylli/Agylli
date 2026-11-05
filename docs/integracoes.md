# Integrações e limites

## Nuvemshop

**Varejo preparado:** `NEXT_PUBLIC_NUVEMSHOP_URL` define o destino dos links de compra, inclusive dos produtos demonstrativos. Sem uma URL HTTPS válida, os links levam a `/loja-em-breve`; nenhum endereço de loja foi inventado. Não há consulta de catálogo, autenticação, preços ou checkout local.

**Atacado preparado:** a apresentação fica em `/atacado`. `NEXT_PUBLIC_NUVEMSHOP_B2B_URL` será o destino do botão de solicitação de acesso quando a área B2B estiver disponível. Até lá, `/contato?assunto=revenda` explica a preparação do cadastro e apresenta apenas canais oficiais configurados. Nenhum pedido ou cadastro é enviado agora.

**Próxima decisão:** confirmar recursos e plano B2B, critérios de CPF/CNPJ, documentos, pedido mínimo, preços, regras de aprovação, cadastro e domínio. Se houver necessidade real de API, usar a documentação oficial da Nuvemshop, aplicação autorizada e escopos mínimos. Tokens e app secrets devem permanecer no servidor; não usar `NEXT_PUBLIC_*`. Definir webhooks verificados, idempotência, cache e tratamento de indisponibilidade antes de implementar.

## SysAla

A empresa já utiliza o sistema na loja física. Não presumir que exista API pública, webhook ou conector. Solicitar documentação oficial, versão e contrato de acesso; validar identificação de produtos/variações, fonte de verdade de estoque, atualização incremental, limites, autenticação e ambiente de teste. Não foi feita conexão, extração ou gravação no SysAla.

## Mercado Livre e Shopee

Integração futura via hub compatível com a operação ou APIs oficiais com contas autorizadas. Avaliar catálogo, SKU, variações, pedidos e conflitos de estoque em conjunto com a Nuvemshop e o SysAla. Não foram conectadas contas, criados anúncios ou solicitadas permissões.

## Supabase

Cliente preparado em `src/integrations/supabase/client.ts`. `getSupabaseClient()` retorna `null` quando não configurado. A função só aceita URL HTTPS e chave com prefixo `sb_publishable_`. O nome da variável já limita o uso à chave publicável; o validador é uma proteção adicional e não substitui a revisão de credenciais.

O cliente não é importado pelas páginas atuais, não cria conexão na renderização e não ativa autenticação persistente. Nenhuma tabela, migração, política, storage bucket ou usuário foi criado. Não há necessidade de credencial para a Etapa 1.

Para evoluir: criar projeto autorizado, configurar URL e chave publicável, definir schema, habilitar RLS, políticas por papel e testes de autorização; usar integração SSR oficial se autenticação for aprovada. Chaves secretas e `service_role` jamais podem ser expostas no cliente, nos logs ou no Git.
