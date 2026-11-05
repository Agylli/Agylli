# Arquitetura da Etapa 1

## Limite do sistema

Este projeto é o site principal e de marketing da Agylli. A Nuvemshop será responsável pela jornada de compra, checkout, pagamento e operação B2B. O site apresenta a marca e encaminha os públicos. O catálogo de quatro itens é exclusivamente demonstrativo; não representa o catálogo real de 101 a 500 itens.

## Camadas

1. `app`: páginas e metadados por rota, layout comum e endpoints de SEO. A homepage, atacado, sobre e loja em breve são pré-renderizados. Contato é renderizado no servidor conforme o assunto da URL.
2. `components`: apresentação por contexto. Elementos de marketing podem compor futuras campanhas e páginas de captura. `PageIntro` e `ActionLink` são blocos compartilhados.
3. `config` e `data`: identidade e conteúdo editável separados da apresentação. Não usar esses arquivos como fonte de preços ou estoque.
4. `lib`: validação de URLs e contatos. Destinos comerciais aceitam apenas HTTPS sem credenciais. Valores ausentes ou inválidos produzem fallbacks internos.
5. `integrations`: adaptadores opcionais. O Supabase é inicializado de forma lazy somente quando solicitado, nunca no caminho de renderização atual.

## Decisões

- Next.js App Router, TypeScript estrito e Server Components por padrão. Menu e filtros são os únicos componentes interativos no cliente.
- Filtros usam query string (`?categoria=...`) e links reais, permitindo compartilhamento, voltar/avançar e navegação acessível. Não simulam uma busca no catálogo real.
- Tailwind CSS v4 com `@theme` centralizado e classes semânticas de composição para manter a identidade legível. Fontes servidas localmente por Fontsource.
- Imagem hero em WebP local e `next/image` para otimização e preload. Ilustrações SVG locais para categorias e produtos. Sem imagens ou fontes externas no runtime.
- SEO inclui idioma, título por página, description, Open Graph, robots e sitemap. Até definir `NEXT_PUBLIC_SITE_URL`, o site permanece `noindex`. A Vercel também deve proteger previews de indexação.
- Cabeçalhos básicos incluem `nosniff`, `DENY`, política de referência e bloqueio de câmera/microfone/geolocalização. Não há analytics nem cookies de autenticação nesta etapa.
- Sem formulários de dados pessoais, banco, migrações, sessões, checkout, carrinho ou APIs privadas. Nenhum botão informa um envio que não aconteceu.

## Crescimento

Campanhas podem entrar em `src/app/(marketing)/campanhas/...`, reutilizando os componentes atuais. Adicionar um CMS ou API de catálogo somente após definir autoria, atualização, cache e direitos de acesso. Não transformar dados demonstrativos em catálogo de produção sem validação comercial.

Antes de coletar leads, aprovar finalidade, política de privacidade, retenção, consentimento quando aplicável, antispam e destino de atendimento. Antes de ativar autenticação ou tabelas no Supabase, definir autorização e RLS e adicionar testes para esses limites.
