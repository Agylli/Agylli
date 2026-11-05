# Publicação — GitHub e Vercel

## Fluxo da revisão consolidada

O projeto e a conta continuam `agylli`; a URL permanente é **https://agylli.vercel.app/**. A publicação do ambiente Codex é independente da atualização deste site. A configuração de DNS de `agylli.com.br` continua separada.

1. Executar as validações e criar o commit do código/ativos/documentação. Comparar `main` remota novamente e integrar avanços sem force push, se houver.
2. Enviar o commit autorizado e conferir igualdade de SHA local/remoto.
3. Abrir o workflow `Qualidade` associado a esse SHA. A API GitHub pode ser bloqueada neste ambiente; a interface oficial `https://github.com/Agylli/Agylli/actions` está acessível. Conferir a conclusão da execução nova, não somente um badge geral.
4. Se houver integração Git Vercel ativa, verificar o deployment disparado para o mesmo commit. Se for necessário publicar por CLI, partir de checkout limpo da revisão aprovada e registrar os metadados abaixo.
5. Após publicação, conferir estado READY, destino production, alias permanente e metadata `agylliCommitSha` igual ao commit esperado. Guardar URL imutável/ID e resultado no relatório de entrega. Os metadados documentam qual revisão foi publicada; não substituem o teste funcional da jornada.

```sh
agylli_commit=$(git rev-parse HEAD)
npx vercel@65.11.0 deploy --prod --yes --project agylli --scope agylli \
  --meta "agylliCommitSha=$agylli_commit" --meta agylliBranch=main
npx vercel@65.11.0 inspect <url-imutavel-do-deployment> --scope agylli --json
```

Não imprimir arquivos de autenticação nem passar tokens no comando. Neste ambiente, continuar usando a seleção de configuração/cache indicada abaixo. Não é necessário autenticar novamente enquanto a sessão existente estiver válida.

## Variáveis para ligar a Nuvemshop

Preservar `NEXT_PUBLIC_NUVEMSHOP_URL` (varejo), `NEXT_PUBLIC_NUVEMSHOP_B2B_URL` (cadastro/acesso B2B) e `NEXT_PUBLIC_SITE_URL` (origem institucional para SEO). Cadastrar somente URLs oficiais confirmadas; nunca credenciais nesses campos. Sem configuração, manter loja em breve, contato de revenda e noindex, respectivamente.

Na Vercel, abrir o projeto `agylli`, **Settings → Environment Variables**. Aplicar valores aprovados a Preview para validar antes de Production; cada mudança pública exige novo build/deploy. Confirmar que as variáveis realmente estão associadas ao ambiente publicado. Configuração comercial e testes de aceite: [Nuvemshop](nuvemshop.md).

Nenhum ID de analytics é necessário nesta etapa; não adicionar tags antes do fluxo de consentimento e da configuração descritos em [mensuração](mensuracao.md). Supabase segue opcional. Não configurar segredos para APIs ainda não implementadas.

## Homologação comercial da Etapa 3

A preparação operacional não altera URLs ou parâmetros de produção. Quando a Agylli fornecer os destinos e autorizar a configuração, seguir [ativação](ativacao-comercial.md), [homologação](homologacao-comercial.md) e [primeira venda](primeira-venda.md). Validar primeiro Preview e depois Production com novo build; conferir a origem institucional separadamente da loja e da área B2B.

O êxito do CI e do build não valida cadastro, tabela, frete ou pagamento na Nuvemshop. Não cadastrar gateway, banco, dados de clientes ou transportadoras pelo deploy. Custos, preços privados, dados pessoais, arquivo definitivo de importação e comprovantes permanecem fora do Git/deploy em `dados-comerciais/` ou armazenamento privado aprovado. Não liberar a operação comercial enquanto houver bloqueio crítico nos roteiros.

## Consolidação e autorização — Etapa 5

Antes de enviar o lote local, executar testes e `npm run build` seguido de `npm run check:public-build`. O CI também verifica esse gate, além de testes de conciliação e de navegador. Revisar arquivos versionados e confirmar que `dados-comerciais/`, originais, aprovações reais, custos e credenciais não estão no índice nem no pacote público.

A main dispara publicação automática na Vercel. Envio de código ao GitHub não autoriza publicar um painel administrativo: a ferramenta continua fora do runtime, sem rotas públicas, com exclusão de tracing e de pacote. Se o gate falhar, não realizar o envio/publicação do lote até corrigir. O push deve usar autorização válida, destino confirmado e histórico preservado, sem force push.

As verificações locais não comprovam a disponibilidade de recursos comerciais na Nuvemshop. Plano e critérios de liberação: [Etapa 5](implantacao-comercial-etapa5.md). Não executar importação, cobrança, Pix, estorno ou alteração de saldo como parte do deploy.

## Deployment verificado antes da Etapa 2

- URL permanente: **https://agylli.vercel.app/**
- Conta e espaço de trabalho: **Agylli** (`agylli`).
- Projeto Vercel existente: `agylli`.
- Deployment: `dpl_G5yx73fxJjV9SRS7BCReZfgsFMAv`.
- URL desta versão: https://agylli-n9gfab2do-agylli.vercel.app.
- Destino: `production`; estado confirmado pela Vercel: `READY`.
- Data: 5 de novembro de 2026.

O usuário autorizou a publicação e a conexão oficial da CLI Vercel. O deploy utilizou os arquivos atuais do checkout, incluindo identidade oficial, imagens reais, contatos por unidade, a rota `/onde-atuamos` com mapa e a remoção de estrelas/asteriscos decorativos. A publicação é vinculada à conta do usuário, substituindo o link temporário anterior. Nenhuma reivindicação adicional ou token por chat é necessário.

O repositório associado continua sendo `Agylli/Agylli`, na branch `main`. Não houve novo push nesta publicação; portanto, o código mais recente permanece no checkout local e no deployment, enquanto o GitHub conserva a versão anteriormente enviada. Alterações de nome, visibilidade ou origin não foram realizadas. A configuração do domínio próprio `agylli.com.br` é uma etapa separada e seus registros DNS não foram alterados.

## Como publicar uma atualização

A partir da pasta do projeto, com Node.js 24 LTS e npm:

```sh
npm ci
npm run lint
npm test
npm run build
npm run typecheck
npm run test:e2e
npx vercel@65.11.0 login
npx vercel@65.11.0 deploy --prod --yes --project agylli --scope agylli
```

Antes de executar um novo deploy, confirmar a autorização vigente e a conta/projeto corretos. O projeto usa o preset Next.js e a raiz `.`. O `engines.node` do pacote e `.nvmrc` fixam Node.js 24. A CLI cuida da autenticação: não colocar credenciais em scripts, logs, Git ou chat.

No ambiente na nuvem, a CLI foi executada com `--global-config /tmp/agylli-vercel-auth`, cache npm em `/tmp/agylli-vercel-npm-cache` e `XDG_CACHE_HOME=/tmp/agylli-vercel-cache`. `NODE_USE_ENV_PROXY=1` mantém o acesso pelo proxy configurado. Essas seleções não exigem alterar `HOME` nem desabilitar TLS. A autenticação não deve ser presumida disponível em outra máquina; verificar com `vercel whoami` antes de publicar.

`.vercelignore` exclui dependências instaladas, caches, credenciais locais, arquivos reais de ambiente, documentação, relatórios, testes e a pasta privada `dados-comerciais/` do pacote. O template vazio `.env.example` é permitido porque aparece no rastreamento de arquivos do Next. `.vercel` permanece ignorado pelo Git. O ESLint também ignora `.vercel/**`, que contém código gerado.

## Validação e limites

Antes do deployment de partida da Etapa 1, passaram lint, 11 testes unitários, build, TypeScript e 30 testes de navegador, incluindo as seis páginas em 375, 768 e 1440 px, imagens, navegação, filtros, fallbacks e axe. Depois da restauração do ambiente, caches antigos causaram um erro interno do Turbopack; a limpeza restrita aos diretórios gerados `.next/cache` e `.vercel/output` permitiu um build limpo e bem-sucedido.

A Vercel confirmou o deployment de produção e o alias permanente. O proxy do ambiente ainda bloqueia a consulta direta a `agylli.vercel.app`; por isso, o HTTP externo e a experiência remota não foram validados por esta máquina. Esse bloqueio local não é uma resposta da aplicação. Para automatizar a checagem externa a partir daqui, o hostname exato `agylli.vercel.app` precisará ser permitido na configuração de rede. Nenhuma alteração adicional de rede foi feita para o deploy.

O workflow de GitHub Actions está preparado, mas não foi executado remotamente para as alterações ainda não enviadas ao GitHub. As checagens locais e o estado do deploy são evidências separadas.

## Variáveis e integrações

Nenhuma variável comercial ou credencial de Supabase é necessária para renderizar esta versão. O varejo usa `/loja-em-breve` enquanto `NEXT_PUBLIC_NUVEMSHOP_URL` não estiver configurada; o atacado usa o contato de revenda enquanto a área B2B não estiver disponível. Não há checkout, pagamento ou estoque independente.

Para ativar os destinos reais, preencher `NEXT_PUBLIC_NUVEMSHOP_URL` e `NEXT_PUBLIC_NUVEMSHOP_B2B_URL` com URLs HTTPS oficiais. Os contatos das unidades estão em `src/config/locations.ts` e funcionam sem ambiente. Canais gerais adicionais podem ser definidos em `NEXT_PUBLIC_WHATSAPP_NUMBER` e `NEXT_PUBLIC_CONTACT_EMAIL`. A origem de produção para SEO é definida por `NEXT_PUBLIC_SITE_URL`; sem esse campo, a configuração mantém `noindex` até a confirmação do domínio canônico.

Supabase permanece opcional: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, exclusivamente com chave publicável. Nunca usar chave secreta ou `service_role` em variável pública. Mudanças em `NEXT_PUBLIC_*` exigem novo build/deploy porque os valores são incorporados à aplicação.

Conferir conteúdo institucional, contatos, condições comerciais e políticas antes da operação comercial. A publicação do ambiente Codex é independente do deploy do site; não foi necessária nova publicação do ambiente nesta etapa.
