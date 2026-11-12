# Convenções — Agylli Cosméticos

- Cada tarefa na nuvem já é isolada. Use o checkout existente; não crie Git worktrees sem solicitação explícita.
- Projeto Next.js App Router, React, TypeScript estrito e Tailwind CSS v4, Node 24 LTS e npm. Use `npm ci` e preserve `package-lock.json`; não atualize dependências sem motivo.
- Prefira Server Components. Use Client Components apenas para interatividade (menu e filtros). Não faça chamadas a serviços opcionais para renderizar o site.
- Interface e conteúdo em português brasileiro. Reutilize `src/config/brand.ts`, `marketing.ts`, `content.ts` e `src/data/products.ts`. Tokens visuais ficam em `src/app/globals.css`.
- Não invente condições comerciais, contatos, URLs reais, preços, avaliações, margens, certificações ou características dos produtos. Identifique os dados demonstrativos. Preserve os fallbacks seguros.
- Os CSVs em `docs/modelos/` são modelos de preparação, não o formato nativo confirmado do importador Nuvemshop. Dados reais de custos, preços e estoque ficam fora do Git e do deploy, em `dados-comerciais/` ou armazenamento privado aprovado.
- Não ativar GA4, GTM, Google Ads ou Meta Pixel sem IDs, consentimento e configuração aprovados. Clique de saída para a loja não representa compra; seguir `docs/mensuracao.md`.
- O varejo e futuramente o B2B são operados pela Nuvemshop. Não crie checkout, pagamentos ou sistema de estoque paralelo nesta etapa.
- Escopo aprovado em 11/11/2026: portal de revendedores com Supabase Auth, aprovação manual, solicitações para a loja física, materiais privados e painel da equipe com aviso por e-mail. São solicitações de atendimento, sem checkout, cálculo de preços, baixa de estoque ou compra financeira automática. Preservar o varejo Nuvemshop.
- Em 12/11/2026 a Agylli escolheu catálogo próprio de revenda e montagem de solicitações com preparação de mensagem WhatsApp. Equipe publica apenas dados reais/fotos autorizadas. Descontos, valores e disponibilidade são conferidos manualmente pela loja; não adicionar preços, custos, estoque ou cálculo automático ao catálogo sem novo escopo aprovado. Registrar no portal antes de preparar WhatsApp e nunca afirmar entrega de mensagem/venda a partir de um clique. Ver `docs/catalogo-revenda.md`.
- Atualização de escopo em 12/11/2026: `/revendedor/produtos` usa os mesmos produtos publicados na Nuvemshop, sem preços de varejo ou links de compra. Adicionar ao carrinho de solicitação e registrar antes de preparar WhatsApp; equipe confere opções, estoque e preço de revenda. Preservar o catálogo manual existente e os pedidos antigos, sem exigir duplicação de cadastro para o novo fluxo.
- Autorização da equipe vem exclusivamente de `portal_staff`, provisionado por administrador do Supabase. Nunca confiar em e-mail, metadados editáveis ou papel enviado pelo cliente. Aplicar RLS a todos os registros; não usar chave secreta para consultas comuns de revendedores.
- PDFs de materiais usam envio direto ao Storage privado com token de upload temporário e conferência no servidor antes da publicação: até 50 MB, imagens até 3 MB. Não encaminhar arquivos grandes por Server Actions, ampliar o limite de corpo da Vercel ou expor a sessão HTTP-only/chave secreta no navegador. Ver `docs/envio-materiais.md`.
- Compras anteriores do SysAla só aparecem após vinculação autorizada por identificador de cliente e referência de venda. Nunca transformar solicitações em compras confirmadas automaticamente. Catálogos e condições precisam de autorização antes de publicação.
- Informação definitiva: SysAla não tem API, webhooks ou sincronização automática. Usar exclusivamente exportações CSV manuais e conciliação operacional; não planejar conexão automática SysAla → Nuvemshop.
- `tools/conciliacao/` é um utilitário local Python, sem rede, fora de `src/` e do pacote de produção. Nunca expor por rota Next.js ou fazer deploy administrativo sem autorização. Testar com `npm run test:conciliacao`; dados e relatórios reais ficam em `dados-comerciais/`.
- Supabase é opcional; use apenas chave publicável no cliente. Nunca versione segredos nem use `service_role` no navegador. APIs privadas são futuras integrações exclusivamente no servidor.
- Toda imagem precisa de procedência; não reutilize ativos da Sallve. Use `next/image` com dimensões/sizes, alt adequado e preload apenas para conteúdo prioritário. Prefira arquivos locais otimizados.
- Mantenha navegação por teclado, foco visível, skip link, contraste e suporte a reduced-motion. Verifique 375, 768 e 1440 px e não introduza dependência de hover.
- Para validar: `npm run lint`, `npm test`, `npm run build`, `npm run typecheck`, `npm run test:e2e`. Os E2E esperam variáveis comerciais ausentes para validar fallbacks. O Chromium do sistema é detectado quando disponível.
- Atualize documentação quando mudar fluxos, configuração ou integrações. Não afirme que API, deploy ou CI remoto foram validados sem execução real.
- Preserve arquivos e alterações existentes. Não publique repositório, não envie push e não faça deploy de produção sem autorização explícita do usuário.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
