# Agylli Cosméticos

Site institucional e comercial da Agylli, com as Etapas 1 e 2 entregues e preparação operacional da Etapa 3. Apresenta a marca, separa varejo e atacado e prepara as futuras integrações. **Não há checkout, pagamentos, gestão de estoque ou coleta de cadastros neste projeto.**

## Etapa 2 — preparação comercial

- Jornadas de varejo e revenda preservadas, com ponto de cadastro em `/atacado#cadastro-atacado` e destinos provisórios funcionais.
- [Consolidação do Git e verificação de CI](docs/consolidacao-etapa2.md).
- [Ativação da Nuvemshop](docs/nuvemshop.md), mantendo `NEXT_PUBLIC_NUVEMSHOP_URL`, `NEXT_PUBLIC_NUVEMSHOP_B2B_URL` e `NEXT_PUBLIC_SITE_URL`.
- [Piloto de aproximadamente 10 produtos reais](docs/catalogo-piloto.md), com modelos em `docs/modelos/` para produtos, precificação e atacado. São arquivos de preparação, não o formato nativo homologado do importador.
- [Plano de medição e consentimento](docs/mensuracao.md), com GA4/GTM/Ads/Meta e UTMs documentados, sem rastreadores ativos.

Dados comerciais preenchidos ficam em `dados-comerciais/` ou armazenamento privado aprovado, fora do Git/deploy. Nenhum preço, SKU, GTIN ou estoque foi inventado.

## Etapa 3 — preparação para ativação

- [Relatório de entrega, testes e pendências](docs/etapa3.md).
- [Plano operacional](docs/ativacao-comercial.md): configurações de loja, B2B, Pix/cartão, frete e pedidos, com dependências e critérios de aceite.
- [Homologação de varejo e revenda](docs/homologacao-comercial.md): 16 casos de varejo e 13 de cadastro/aprovação, com registros inicialmente não executados.
- [Checklist da primeira venda](docs/primeira-venda.md) e [índice dos modelos](docs/modelos/README.md), incluindo dez posições vazias de validação e o mapeamento do importador.

A ativação real aguarda URLs, dados dos produtos, confirmação do recurso B2B, modelo oficial de importação e autorização para configurar a loja e testar pagamentos. A central oficial da Nuvemshop retornou bloqueio do proxy neste ambiente; nenhum CSV definitivo foi gerado sem verificar o formato. Os testes locais validam o site, não uma compra ou aprovação comercial real.

## Revisão da Etapa 3 — conciliação CSV local

Relatório da entrega: [revisão e preparação da Etapa 4](docs/revisao-etapa3-etapa4.md).

SysAla é o sistema da loja física e não oferece API, webhooks ou sincronização automática. A Nuvemshop opera o e-commerce; marketplaces serão ligados futuramente à operação online. A conciliação entre físico e online será manual, com possível reserva física aprovada.

O [utilitário local](tools/conciliacao/README.md) recebe exportações, mapeamento opcional e registro de reservas/pedidos conferidos. Preserva originais e gera relatório/prévia; não acessa plataformas ou importa estoque. Geração final depende de modelo oficial, revisão, aprovação do hash e fontes revalidadas. Python 3.11+; não requer npm ou credenciais para executar a CLI.

```sh
python3 -m tools.conciliacao --help
python3 -m unittest discover -s tools/conciliacao/tests -p 'test_*.py' -v
```

Procedimento e papéis: [conciliação manual](docs/conciliacao-manual.md). O utilitário é administrativo local, excluído do pacote de deploy. Não expor pelo site. Originais, custos, relatórios e arquivos finais ficam fora de Git e `public/`, em `dados-comerciais/` ou armazenamento privado aprovado. Relatórios antigos são históricos; não representam autorização ou possibilidade de integração automática SysAla.

## Etapa 5 — consolidação e homologação comercial

- [Relatório de consolidação, auditoria e testes](docs/etapa5.md).
- [Plano de implantação com responsáveis e critérios de conclusão](docs/implantacao-comercial-etapa5.md).
- [Recebimento e mapeamento dos CSVs reais](docs/mapeamento-csv-reais.md), mantendo os adaptadores sem cabeçalhos presumidos e a geração final bloqueada até comprovar o modelo oficial.
- Modelos de [checklist](docs/modelos/checklist-implantacao-etapa5.csv), [fontes oficiais](docs/modelos/fontes-nuvemshop-etapa5.csv) e [recebimento de arquivos](docs/modelos/recebimento-arquivos-etapa5.csv), sem dados comerciais preenchidos.
- `npm run check:public-build`, após `npm run build`, verifica os traces, rotas e arquivos públicos para bloquear a inclusão do utilitário/dados privados. O gate foi incluído no CI e há testes de acesso 404 aos caminhos administrativos.

O material está preparado localmente. Envio ao GitHub depende da autorização do lote; a integração Git da Vercel exige revisar o pacote público antes do push. Configuração de loja, importação, pagamento e alteração de estoque precisam das autorizações específicas. A documentação oficial Nuvemshop segue bloqueada pela rede; os recursos e passos de painel ainda não comprovados não foram apresentados como homologados.

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
| `/sobre` | História revisada pelo site oficial e apresentação do portfólio |
| `/contato` | Endereços, telefones e WhatsApp das duas unidades |
| `/onde-atuamos` | Regiões, mapa institucional e contatos por unidade |
| `/contato?assunto=revenda` | Orientação para quem solicita acesso B2B |
| `/loja-em-breve` | Destino seguro enquanto a loja de varejo não foi configurada |

## Comandos

```sh
npm run lint        # ESLint, sem avisos permitidos
npm test            # testes unitários do site, Vitest
npm run test:conciliacao # testes do utilitário local, Python 3.11+
npm run build       # produção, incluindo checagem TypeScript do Next
npm run check:public-build # gate de exclusão de conteúdo privado/administrativo
npm run typecheck   # TypeScript; execute o build antes em um checkout novo
npm run start       # servir o build de produção
npm run test:e2e    # Playwright, contra o build de produção
```

O Playwright usa Chromium. No ambiente na nuvem, `/usr/bin/chromium` já está disponível e é detectado automaticamente. Em outras máquinas, execute `npx playwright install chromium`; no Linux, `npx playwright install --with-deps chromium` instala também bibliotecas do sistema quando autorizado. Pode-se selecionar um binário compatível com `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. O teste inicia e encerra seu próprio servidor, ou reutiliza o servidor existente na porta 3000 fora do CI. Use o build sem variáveis comerciais para testar os fallbacks padrão.

Os testes de navegador cobrem as seis páginas em 375, 768 e 1440 px, axe WCAG A/AA, menu móvel e Escape, teclado, filtros com histórico, imagens, contatos por unidade, links internos/âncoras, 404 e os caminhos comerciais sem URLs configuradas. Capturas da execução ficam em `test-results/screenshots/`. Não substituem uma auditoria humana nem medição de Core Web Vitals em produção.

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
public/images/         logos originais, fotos locais e procedência dos ativos
tests/{unit,e2e}/      testes funcionais
docs/                  arquitetura, integrações, deploy, roadmap e evidências
.github/workflows/     CI
.vscode/               recomendações e tarefas para VS Code
```

## Personalizar a marca

- Cores: tokens `@theme` em `src/app/globals.css`. Bordô `#a92d30` e preto `#282828` foram obtidos do CSS oficial; os tons claros são cores de apoio da interface.
- Nome, links, navegação e canais: `src/config/brand.ts` e `.env.local`.
- Unidades, endereços, telefones, WhatsApp e área de atuação: `src/config/locations.ts`.
- Textos da homepage e banners: `src/config/marketing.ts`.
- Benefícios, etapas e FAQ: `src/config/content.ts`.
- Marcas, nomes e fotografias da seleção ilustrativa: `src/data/products.ts`.
- Fontes locais: DM Sans e DM Serif Display, distribuídas via Fontsource com suas licenças OFL. Sem dependência de Google Fonts em runtime/build.

As imagens ativas agora são fotografias reais de produtos Suave Fragrance e D’Bianco, a foto da loja publicada pela Agylli e as logos originais das marcas indicadas. A composição sintética e as embalagens fictícias da primeira versão foram substituídas. As imagens são usadas como seleção ilustrativa, sem preços, oferta ou estoque local. A Facinatus está representada por sua logo publicada no site da Agylli; seu CDN de fotos de produtos ainda bloqueia o acesso deste ambiente. Ver [procedência dos ativos](public/images/README.md).

A revisão de legibilidade mantém corpo de 16 px, textos auxiliares/botões de 14 px e legendas de pelo menos 12 px, com unidades relativas para acompanhar a preferência do navegador. A história e o conteúdo de revenda foram conferidos no site oficial após a liberação da rede. As condições comerciais continuam acompanhadas de orientação para confirmar a vigência. A procedência está em [docs/referencias-da-marca.md](docs/referencias-da-marca.md).

Os asteriscos e as estrelas decorativas foram retirados de todas as páginas.

Os contatos das unidades de Cândido Sales e Ipatinga estão disponíveis sem variáveis de ambiente. Foram conferidos na página oficial de atendimento e no mapa de atuação. Links de mapa abrem uma busca pelo endereço; não representam coordenadas verificadas. E-mail, horário e CNPJ continuam sem publicação enquanto não forem confirmados.

## Variáveis opcionais

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_NUVEMSHOP_URL` | URL HTTPS confirmada da loja. Vazio/inválido usa `/loja-em-breve` |
| `NEXT_PUBLIC_NUVEMSHOP_B2B_URL` | URL HTTPS pública da área de revendedores. Vazio/inválido usa contato de revenda |
| `NEXT_PUBLIC_SITE_URL` | Origem HTTPS oficial para SEO. Vazio mantém `noindex` e robots bloqueado |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Canal geral adicional opcional; país + DDD + número, 10 a 15 dígitos |
| `NEXT_PUBLIC_CONTACT_EMAIL` | E-mail oficial confirmado; sem valor, não há link de e-mail |
| `NEXT_PUBLIC_SUPABASE_URL` | URL HTTPS do projeto Supabase, apenas para uso futuro |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave `sb_publishable_*`, nunca uma chave secreta ou `service_role` |

O Supabase não é chamado durante a renderização e não bloqueia o site. Não existem tabelas nem autenticação habilitada pela aplicação. APIs privadas devem ser implementadas no servidor futuramente, com credenciais sem prefixo `NEXT_PUBLIC_` e autorização apropriada.

## GitHub e Vercel

O repositório associado é `Agylli/Agylli`, branch `main`, preservando origin e histórico. A produção está em **https://agylli.vercel.app/**, na conta e projeto Vercel `agylli`. O domínio próprio e DNS são uma etapa separada; os registros de `agylli.com.br` não foram alterados.

A Etapa 2 reúne os arquivos anteriormente publicados a partir do checkout local e a preparação comercial. O procedimento para comparar commits, sincronizar sem force push e identificar o CI da revisão está em [consolidação](docs/consolidacao-etapa2.md). Para comparar o deployment, usar SHA/metadata e estado READY; o HTTP direto de `agylli.vercel.app` é bloqueado pelo proxy deste ambiente e não substitui as validações locais.

Para obter o código no computador:

```sh
git clone https://github.com/Agylli/Agylli.git
cd Agylli
npm ci
npm run dev
```

O CI verifica lint, testes, build, TypeScript e Playwright a cada push/PR. Conferir a execução associada ao commit na [aba Actions](https://github.com/Agylli/Agylli/actions), usando a interface web se a API estiver indisponível. Procedimento de publicação e variáveis por ambiente: [deploy](docs/deploy.md).

## Próximas etapas

Receber URLs e acesso autorizado Nuvemshop, confirmar recurso B2B e modelo oficial, validar aproximadamente 10 produtos reais e executar a homologação de compra e revenda; finalizar políticas, domínio e SEO. Os próximos marcos estão no [roadmap](docs/roadmap.md); preparação de plataformas em [integrações](docs/integracoes.md).

Arquitetura: [docs/arquitetura.md](docs/arquitetura.md). Convenções: [AGENTS.md](AGENTS.md). Evidências históricas da Etapa 1 e validações locais: [docs/validacao.md](docs/validacao.md). Os relatórios anteriores à consolidação são snapshots da situação naquele momento.
