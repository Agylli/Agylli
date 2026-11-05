# Agylli Cosméticos

Primeira versão do site institucional e comercial da Agylli. Apresenta a marca, separa varejo e atacado e prepara as futuras integrações. **Não há checkout, pagamentos, gestão de estoque ou coleta de cadastros neste projeto.**

## Executar

Requisitos: Node.js 24 LTS (fixado em `.nvmrc`), npm e Git. Editor recomendado: Visual Studio Code; extensões e tarefas estão em `.vscode/`.

```sh
cd /workspace/Agylli  # ou a pasta em que você clonou o projeto
npm ci
npm run dev
```

O servidor de desenvolvimento usa a porta 3000. Não é necessário criar `.env.local` para desenvolver ou visualizar as páginas.

Para configurar serviços reais, copie `.env.example` para `.env.local`, preencha apenas os campos confirmados e reinicie o servidor. Nunca versione esse arquivo. Variáveis `NEXT_PUBLIC_*` ficam visíveis no navegador e são incorporadas no build; mudanças exigem novo build/deploy.

## Rotas

| Rota | Função |
| --- | --- |
| `/` | Homepage, públicos, categorias e produtos demonstrativos filtráveis |
| `/atacado` | Proposta de revenda, CPF/CNPJ, etapas e perguntas frequentes |
| `/sobre` | Apresentação institucional provisória |
| `/contato` | Canais oficiais quando configurados; estado informativo quando ausentes |
| `/contato?assunto=revenda` | Orientação para quem solicita acesso B2B |
| `/loja-em-breve` | Destino seguro enquanto a loja de varejo não foi configurada |

## Comandos

```sh
npm run lint        # ESLint, sem avisos permitidos
npm test            # testes unitários, Vitest
npm run build       # produção, incluindo checagem TypeScript do Next
npm run typecheck   # TypeScript; execute o build antes em um checkout novo
npm run start       # servir o build de produção
npm run test:e2e    # Playwright, contra o build de produção
```

O Playwright usa Chromium. No ambiente na nuvem, `/usr/bin/chromium` já está disponível e é detectado automaticamente. Em outras máquinas, execute `npx playwright install chromium`; no Linux, `npx playwright install --with-deps chromium` instala também bibliotecas do sistema quando autorizado. Pode-se selecionar um binário compatível com `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. O teste inicia e encerra seu próprio servidor, ou reutiliza o servidor existente na porta 3000 fora do CI. Use o build sem variáveis comerciais para testar os fallbacks padrão.

Os testes de navegador cobrem as cinco páginas em 375, 768 e 1440 px, axe WCAG A/AA, menu móvel e Escape, teclado, filtros com histórico, imagens, 404 e os caminhos comerciais sem URLs configuradas. Capturas da execução ficam em `test-results/screenshots/`. Não substituem uma auditoria humana nem medição de Core Web Vitals em produção.

## Estrutura

```text
src/
  app/                 rotas, layouts, metadados, sitemap, robots e tokens CSS
  components/
    layout/            cabeçalho e rodapé
    marketing/         hero, categorias, produtos, banners e introdução
    ui/                elementos reutilizáveis
  config/              marca, conteúdo comercial, URLs e contatos
  data/                catálogo e categorias demonstrativos
  integrations/        cliente Supabase opcional
  lib/                 validação e construção de URLs
public/images/         imagens locais e ilustrações próprias
tests/{unit,e2e}/      testes funcionais
docs/                  arquitetura, integrações, deploy, roadmap e evidências
.github/workflows/     CI
.vscode/               recomendações e tarefas para VS Code
```

## Personalizar a marca

- Cores: tokens `@theme` em `src/app/globals.css`. As cores das ilustrações são parte dos próprios SVGs.
- Nome, links, navegação e canais: `src/config/brand.ts` e `.env.local`.
- Textos da homepage e banners: `src/config/marketing.ts`.
- Benefícios, etapas e FAQ: `src/config/content.ts`.
- Nomes e ilustrações demonstrativos: `src/data/products.ts`.
- Fontes locais: DM Sans e DM Serif Display, distribuídas via Fontsource com suas licenças OFL. Sem dependência de Google Fonts em runtime/build.

As imagens são conceitos visuais originais; a composição fotográfica foi gerada para este protótipo, e os quatro SVGs foram criados para a Agylli. Não são fotografias de produtos reais nem imagens da Sallve. Ver `public/images/README.md`.

## Variáveis opcionais

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_NUVEMSHOP_URL` | URL HTTPS confirmada da loja. Vazio/inválido usa `/loja-em-breve` |
| `NEXT_PUBLIC_NUVEMSHOP_B2B_URL` | URL HTTPS pública da área de revendedores. Vazio/inválido usa contato de revenda |
| `NEXT_PUBLIC_SITE_URL` | Origem HTTPS oficial para SEO. Vazio mantém `noindex` e robots bloqueado |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | País + DDD + número, 10 a 15 dígitos; sem espaços ou símbolos |
| `NEXT_PUBLIC_CONTACT_EMAIL` | E-mail oficial confirmado; sem valor, não há link de e-mail |
| `NEXT_PUBLIC_SUPABASE_URL` | URL HTTPS do projeto Supabase, apenas para uso futuro |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave `sb_publishable_*`, nunca uma chave secreta ou `service_role` |

O Supabase não é chamado durante a renderização e não bloqueia o site. Não existem tabelas nem autenticação habilitada pela aplicação. APIs privadas devem ser implementadas no servidor futuramente, com credenciais sem prefixo `NEXT_PUBLIC_` e autorização apropriada.

## GitHub e Vercel

O repositório de destino é `Agylli/Agylli`, na branch `main`, preservando o origin e a visibilidade existentes. O pacote chama-se `agylli-cosmeticos`. O envio do código ao repositório existente foi autorizado pelo usuário; não foi criado ou renomeado outro repositório. O deploy na Vercel continua pendente de autorização.

Para obter o código no computador, use **Code → Download ZIP** no GitHub ou execute:

```sh
git clone https://github.com/Agylli/Agylli.git
cd Agylli
npm ci
npm run dev
```

O CI está preparado para lint, testes, build, TypeScript e Playwright a cada push e pull request. Os resultados locais estão documentados; a execução remota deve ser acompanhada na aba Actions. Procedimento de deploy e variáveis por ambiente: [docs/deploy.md](docs/deploy.md).

## Próximas etapas

Validar identidade, textos, dados institucionais, contatos e condições comerciais; fornecer catálogo e fotografias reais; conectar varejo/B2B à Nuvemshop. Os próximos marcos e limites estão no [roadmap](docs/roadmap.md) e os pontos de conexão em [integrações](docs/integracoes.md).

Arquitetura: [docs/arquitetura.md](docs/arquitetura.md). Convenções para tarefas futuras: [AGENTS.md](AGENTS.md). Evidências desta etapa: [docs/validacao.md](docs/validacao.md).
