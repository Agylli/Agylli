# Roadmap — Agylli Cosméticos

## Etapa 1 — entregue

- Site institucional publicado na Vercel com seis páginas: início, atacado, sobre, contato, onde atuamos e loja em breve.
- Logo e cores oficiais, fotografias reais de referência, história revisada e contatos das duas unidades.
- Layout responsivo, fontes ampliadas, navegação acessível, filtros ilustrativos e remoção de estrelas/asteriscos decorativos.
- Base Next.js/React/TypeScript/Tailwind, Supabase opcional, testes, CI e documentação.

Os relatórios de situação de 5/11/2026 anteriores à Etapa 2 são registros históricos; não representam a situação da sincronização depois desta consolidação.

## Etapa 2 — consolidação e preparação comercial entregue

- Consolidar a identidade, os ativos e os contatos já aprovados no repositório `Agylli/Agylli`, preservando o histórico remoto e sem force push.
- Preservar as três variáveis de varejo, B2B e origem institucional; validar configuração ausente, parcial e completa.
- Reforçar a diferenciação dos públicos na homepage e definir o ponto de cadastro em `/atacado#cadastro-atacado`, usando a Nuvemshop ou o contato oficial conforme configuração.
- Entregar [especificação e modelos do piloto de catálogo](catalogo-piloto.md), incluindo dados cadastrais, precificação interna e regras B2B; sem importar produtos inventados.
- Entregar [plano de medição](mensuracao.md) e modelo UTM, com consentimento e separação de clique de saída/compra concluída; sem instalar rastreadores.
- Executar validações, sincronizar GitHub e conferir CI e revisão de produção conforme [procedimento de consolidação](consolidacao-etapa2.md).

## Etapa 3 — preparação operacional e dependências

- Matriz de configuração de loja, tabelas, cadastro CPF/CNPJ, aprovação, Pix/cartão, frete e gestão de pedidos em [ativação comercial](ativacao-comercial.md).
- [Roteiros de homologação](homologacao-comercial.md), com 16 cenários de varejo e 13 de revenda; nenhum teste comercial real foi executado.
- Controles para aproximadamente dez produtos e mapeamento ao modelo oficial, mantendo os quatro CSVs originais sem dados inventados.
- [Checklist de primeira venda](primeira-venda.md) e planejamento das integrações posteriores, preservando a arquitetura híbrida.
- Formato oficial de importação ainda pendente: central oficial bloqueada pelo proxy. Arquivo definitivo não gerado; obter modelo do painel autorizado e validar antes de importar.

O marco de primeira venda e aprovação de revendedor permanece pendente até o fornecimento dos dados/acessos e a execução autorizada dos roteiros. Nenhuma conta, pagamento, frete, tabela ou integração externa foi configurada nesta preparação.

## Próximo marco — ativar a Nuvemshop

1. Receber a URL oficial de varejo e o acesso autorizado à loja; confirmar plano/recurso B2B e sua URL pública.
2. Validar aproximadamente 10 produtos reais, com SKUs, GTINs aplicáveis, fotos autorizadas, logística, preços, condições de atacado e estoque de origem confirmado.
3. Mapear os modelos internos ao importador oficial atual e aprovar o piloto antes do catálogo completo.
4. Configurar URLs em Preview, testar varejo/cadastro/compra na Nuvemshop e depois aplicar as configurações aprovadas em Production.
5. Finalizar informações institucionais e políticas, confirmar domínio/DNS e configurar SEO antes de liberar indexação.
6. Aprovar IDs, contas, consentimento e implementação de medição nos dois ambientes; validar compra real e ausência de duplicidade.

Procedimento: [Nuvemshop](nuvemshop.md). Ainda não há catálogo completo, checkout ativo conectado, cadastro B2B online ou validação de uma loja comercial real neste projeto.

## Integrações posteriores

- SysAla: obter documentação oficial/API/conector, definir identificação dos itens, fonte de verdade de estoque e rotina de atualização; não presumir API disponível.
- Mercado Livre e Shopee: escolher hub ou APIs autorizadas depois de definir catálogo, pedidos e estoque consistentes com Nuvemshop/SysAla.
- Supabase: ativar apenas quando uma funcionalidade exigir banco/autenticação, com finalidade, schema, RLS e autorização definidos. Não duplicar o cadastro comercial da Nuvemshop.
- Campanhas/CMS: adicionar páginas conforme demanda, reutilizando os componentes atuais e a identidade aprovada.

Não há previsão de checkout próprio, sistema paralelo de clientes ou controle local de estoque. Prazos e custos das próximas integrações dependem das definições comerciais e do acesso aos serviços; não foram estimados nesta etapa.
