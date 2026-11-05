# Publicação futura — GitHub e Vercel

O usuário autorizou o envio do código ao repositório existente `Agylli/Agylli`, na branch `main`, para baixar e abrir o projeto no computador. A visibilidade e o origin são preservados. `agylli-cosmeticos` é o nome do pacote; nenhum outro repositório foi criado. A autorização de envio do código não inclui deploy na Vercel.

## Antes de publicar

1. Aprovar a identidade provisória e o conteúdo para a publicação do site. O código usa o repositório existente; alterações de nome, visibilidade ou origin precisam de autorização específica. Preservar histórico e não sobrescrever remotos.
2. Confirmar domínio, Nuvemshop varejo/B2B, contatos, razão social, CNPJ, endereço, condições e políticas aplicáveis. Substituir os dados demonstrativos por catálogo e imagens autorizados antes da operação comercial.
3. Executar `npm ci`, lint, testes, build, typecheck e E2E. Revisar diffs e arquivos incluídos; `.env.local`, `.vercel`, relatórios e dependências devem ficar fora do Git.
4. Acompanhar o workflow `.github/workflows/ci.yml` na aba Actions do GitHub após o envio do código. Uma validação local aprovada não estabelece o resultado da execução remota.

## Configurar a Vercel

Após autorização, importar o repositório no painel da Vercel:

- Framework: **Next.js**.
- Root Directory: raiz do projeto (a pasta que contém `package.json`).
- Node.js: **24.x**.
- Install Command: `npm ci`.
- Build Command: `npm run build`.
- Output Directory: padrão do Next.js, sem override.
- Preparar primeiro um Preview. Publicação de produção requer autorização do usuário.

Nenhuma variável é obrigatória para gerar o protótipo. Para operar o varejo, configurar `NEXT_PUBLIC_NUVEMSHOP_URL` com a URL HTTPS oficial. A área B2B usa `NEXT_PUBLIC_NUVEMSHOP_B2B_URL`. Preencher os canais oficiais com `NEXT_PUBLIC_WHATSAPP_NUMBER` e/ou `NEXT_PUBLIC_CONTACT_EMAIL`.

Configurar `NEXT_PUBLIC_SITE_URL` somente com a origem de produção confirmada (ex.: seu domínio oficial, sem caminhos). Esse campo ativa URLs canônicas, sitemap e indexação. Previews devem permanecer protegidos de indexação pelo ambiente da Vercel e sem uma URL pública de produção indevida. O protótipo sem esse campo permanece `noindex`.

O Supabase continua opcional: se necessário futuramente, configurar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` separadamente por ambiente. Nunca usar chave secreta nem `service_role` em variável pública. Não inserir tokens privados de marketplaces ou Nuvemshop nas variáveis públicas.

Após mudar `NEXT_PUBLIC_*`, refazer o deploy: os valores são incorporados ao bundle/build. Validar CTAs externos no domínio oficial, páginas sem credenciais, mobile, metadados, imagens, robots e sitemap. Medir Core Web Vitals com dados de laboratório e posteriormente dados reais; não assumir métricas de produção a partir do build.

## Publicar o ambiente Codex

A configuração reutilizável do ambiente é separada do deploy do site. O rascunho de instalação e as instruções de startup, quando salvos, não publicam o repositório nem a Vercel. A publicação do ambiente deve ser feita pelo usuário nas configurações do produto; processos em execução não sobrevivem necessariamente ao snapshot.
