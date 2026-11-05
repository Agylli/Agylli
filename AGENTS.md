# Convenções — Agylli Cosméticos

- Cada tarefa na nuvem já é isolada. Use o checkout existente; não crie Git worktrees sem solicitação explícita.
- Projeto Next.js App Router, React, TypeScript estrito e Tailwind CSS v4, Node 24 LTS e npm. Use `npm ci` e preserve `package-lock.json`; não atualize dependências sem motivo.
- Prefira Server Components. Use Client Components apenas para interatividade (menu e filtros). Não faça chamadas a serviços opcionais para renderizar o site.
- Interface e conteúdo em português brasileiro. Reutilize `src/config/brand.ts`, `marketing.ts`, `content.ts` e `src/data/products.ts`. Tokens visuais ficam em `src/app/globals.css`.
- Não invente condições comerciais, contatos, URLs reais, preços, avaliações, margens, certificações ou características dos produtos. Identifique os dados demonstrativos. Preserve os fallbacks seguros.
- O varejo e futuramente o B2B são operados pela Nuvemshop. Não crie checkout, pagamentos ou sistema de estoque paralelo nesta etapa.
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
