# Portal do revendedor e painel da equipe

Escopo aprovado em 11/11/2026. A configuração vigente confirma somente a unidade de Cândido Sales; cadastro e solicitações aceitam esse identificador. A Agylli solicitou cadastro simples, entrada/saída, acompanhamento, benefícios, catálogos e divulgação, além de solicitações de produtos atendidas pela loja física. A equipe receberá as solicitações por **e-mail e painel**, com aprovação manual dos cadastros.

Em 12/11/2026 a Agylli escolheu [catálogo próprio de revenda e atendimento WhatsApp](catalogo-revenda.md). Essa extensão acrescenta publicação de produtos, seleção por IDs/quantidades e mensagem preparada após registrar a solicitação; descontos e condições ficam com a equipe. Requer a segunda migration e produtos/fotos reais.

## Fluxo implementado

1. O menu “Seja Revendedor”, a chamada “Quero ser revendedor” da homepage e os botões “Solicitar acesso ao atacado” levam diretamente a `/revendedor/cadastro`, mesmo antes da configuração do Supabase. O menu “Entrar”, o rodapé e `/atacado` oferecem entrada para `/revendedor/entrar`. Os contatos e o acesso externo B2B, quando configurado, continuam disponíveis. A falta das variáveis bloqueia os formulários com uma mensagem de preparação; não esconde os links de acesso.
2. Cadastro com nome, e-mail, senha de no mínimo 12 caracteres, telefone e unidade. Confirmação do e-mail no Supabase e aprovação manual no painel.
3. Revendedor aprovado acessa resumo, pedidos, compras confirmadas, catálogos/materiais, benefícios e dados da conta. Recuperação de senha e saída estão incluídas.
4. `/revendedor/solicitar` recebe produtos pelo nome/código e quantidade; não usa o catálogo ilustrativo como dado comercial. Unidade, produtos e reconhecimento das condições são obrigatórios. Não há pagamento, preço calculado, reserva nem baixa de saldo.
5. A transação registra solicitação, itens, evento inicial e aviso pendente. Só então tenta enviar o e-mail. Falha de envio mantém o pedido no painel.
6. `/equipe` permite conferir cadastros, aprovar/suspender, acompanhar solicitações, atualizar andamento, reenviar avisos e publicar/retirar materiais autorizados. O rodapé oferece “Acesso da equipe”. Após login ou confirmação, a entrada padrão consulta `portal_is_staff` e encaminha funcionários autorizados ao painel da equipe; a área pessoal continua acessível por `/revendedor?aba=inicio`. Isso não concede permissões novas. Falha de consulta bloqueia o acesso administrativo e mostra orientação para tentar novamente.
7. O revendedor acompanha `Recebido → Em análise → Em separação → Pronto para entrega → Entregue`, ou cancelamento permitido. A loja confirma condições e realiza os procedimentos comerciais no sistema físico. Entrega de solicitação não gera compra confirmada automaticamente.

Este portal de relacionamento é o novo escopo específico aprovado pelo usuário; substitui a premissa anterior de depender exclusivamente do B2B Nuvemshop para essas funções. **Varejo, checkout e pagamento do e-commerce continuam na Nuvemshop.** SysAla continua sem API/webhooks; o utilitário CSV permanece local e fora do deploy. Não há ERP ou estoque paralelo.

## Ativação no projeto Supabase existente

Projeto informado pela Agylli: `https://jblvhlppkvpovqodpgqd.supabase.co`. A existência do projeto foi informada; permissões e schema remoto não foram inspecionados nem modificados nesta implementação.

1. Administrador autorizado revisa e aplica **uma única vez** [202611110001_reseller_portal.sql](../supabase/migrations/202611110001_reseller_portal.sql) pelo fluxo de migração aprovado/SQL Editor. A migração é transacional, aditiva e não apaga tabelas existentes; se houver conflito de nomes, investigar e não contornar apagando dados.
2. Ativar confirmação de e-mail e revisar a entrega transacional de autenticação e os limites vigentes do Supabase. Configurar o domínio institucional aprovado como Site URL e autorizar os retornos `/auth/callback`, `/auth/callback?next=/revendedor/redefinir-senha` e `/auth/confirm` nas URLs de redirecionamento. A query da recuperação faz parte do endereço permitido. Preview deve ter URL exata autorizada; não liberar domínios arbitrários.
3. O callback PKCE `/auth/callback` troca o código por sessão. Os templates padrão e o callback PKCE podem ser utilizados na homologação em Preview. Opcionalmente, em produção, para confirmação independente do navegador, configurar o template oficial com `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`. Recuperação pode usar `type=recovery`. Templates com `SiteURL` usam a origem configurada no projeto, não a URL de Preview; não direcionar testes de Preview a uma versão de produção sem o novo portal. Não colocar access tokens ou segredos em mensagens/logs.
4. Preencher as variáveis descritas abaixo em Preview, aplicar novo build e homologar. A área permanece em preparação sem configuração Supabase; o institucional segue funcional.
5. Preparar o primeiro funcionário: criar/confirmar o acesso no Auth, conferir a identidade e escolher o UUID correto. **Somente administrador do projeto** insere esse UUID em `public.portal_staff`. E-mail do destinatário de avisos, metadados `role` e formulário de cadastro nunca concedem acesso de equipe.

Exemplo para administrador, em console privado e após confirmar o UUID real:

```sql
-- Substituir o marcador pelo UUID conferido do funcionario, com e-mail confirmado.
insert into public.portal_staff(user_id)
select id from auth.users
where id = '<UUID_CONFIRMADO_DO_FUNCIONARIO>'::uuid
  and email_confirmed_at is not null;
```

Para contas de revendedores já existentes no Auth, não duplicar usuários: conferir identidade e provisionar o perfil associado ao UUID existente por operação administrativa autorizada. Novos cadastros do portal criam o perfil automaticamente com status `pending`.

## Configuração de aplicação e e-mail

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública do projeto existente |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave **publicável moderna**, `sb_publishable_...`; não usar chave secreta aqui |
| `NEXT_PUBLIC_SITE_URL` | Origem HTTPS institucional aprovada, necessária para links de confirmação/recuperação |
| `SUPABASE_SECRET_KEY` | Chave moderna secreta `sb_secret_...`, exclusivamente no servidor do worker de e-mail |
| `RESEND_API_KEY` | Credencial do provedor de e-mail, exclusivamente no servidor |
| `RESELLER_EMAIL_FROM` | Endereço remetente autorizado/verificado no provedor |
| `RESELLER_NOTIFICATION_EMAIL` | Destino inicial aprovado `adm.agylli@gmail.com`; substituir por `contato@agylli.com` quando a Agylli confirmar |

Nunca enviar chaves por chat nem versionar `.env.local`. A configuração pública Supabase não é suficiente para enviar os avisos da loja; o worker requer as variáveis de servidor. Sem envio configurado, o pedido continua registrado e o painel informa que o aviso não tem envio confirmado. Não criar conta, contratar plano, verificar domínio, alterar DNS ou enviar e-mail real automaticamente como parte da instalação do código.

### Quando aparece “O acesso online está em preparação”

Essa mensagem aparece quando `NEXT_PUBLIC_SUPABASE_URL` ou a chave moderna `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` não está configurada corretamente no build. Aplicar a migration não preenche variáveis da Vercel. Os links de cadastro e entrada continuam disponíveis, mas os formulários ficam desabilitados.

1. No Supabase, abrir **Settings → API Keys** e copiar a chave publicável que começa com `sb_publishable_`. Não usar `sb_secret_` nem `service_role` em uma variável pública.
2. Na Vercel, abrir **projeto agylli → Settings → Environment Variables** e salvar a chave como `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no ambiente **Production**.
3. Conferir também `NEXT_PUBLIC_SUPABASE_URL=https://jblvhlppkvpovqodpgqd.supabase.co` e `NEXT_PUBLIC_SITE_URL=https://www.agylli.com`.
4. Aplicar novo build/redeploy depois de salvar. A publicação precisa conter as variáveis; recarregar um build anterior não basta.
5. No Supabase Auth, conferir **URL Configuration**: Site URL `https://www.agylli.com`, com retornos `https://www.agylli.com/auth/callback`, `https://www.agylli.com/auth/callback?next=/revendedor/redefinir-senha` e `https://www.agylli.com/auth/confirm` autorizados. Aplicar a migration antes de testar cadastros reais.

Chaves e configurações do provedor de notificações são uma etapa separada; não são necessárias para exibir o formulário de cadastro. Cadastro, confirmação e recuperação reais ainda precisam de homologação após essa configuração.

### Link expirado, utilizado ou sem sessão no navegador

Um erro ao abrir o link não comprova que o e-mail permaneceu sem confirmação: o Supabase pode ter confirmado o endereço antes de a troca PKCE falhar no navegador. Abrir `/revendedor/entrar` sem parâmetros e tentar o login normal. Se entrar, não repetir o cadastro nem alterar a aprovação do perfil para corrigir esse aviso.

Em produção, o Proxy mantém `/revendedor`, `/equipe` e `/auth` na origem confiável de `NEXT_PUBLIC_SITE_URL` antes de criar cookies. Assim, um cadastro iniciado no domínio sem `www` não perde o verificador ao retornar ao domínio com `www`. GET/HEAD são redirecionados com `no-store`; POST na origem incorreta é recusado, sem encaminhar senhas a outro host. Usar a origem correta por ambiente de Preview.

O login oferece `/revendedor/reenviar-confirmacao`, apenas com e-mail. O visitante solicita o reenvio por uma ação explícita; a resposta não revela se a conta existe ou já confirmou. O provedor aplica seus limites de envio. Cadastro e reenvio usam `/auth/callback`; o template com `token_hash` usa `/auth/confirm` e permite confirmação sem depender do verificador do navegador original. O callback aceita códigos somente pela troca oficial e o confirm verifica hashes pelos tipos permitidos; falhas não liberam sessão nem funções da equipe.

Links antigos continuam com o destino original e podem estar consumidos ou expirados. Após corrigir URL Configuration ou templates, solicitar um novo link. Não colocar códigos, hashes, senhas ou cookies em chamados, arquivos rastreados ou logs.

O adaptador usa `POST https://api.resend.com/emails`, corpo de texto simples e chave de idempotência derivada do ID da solicitação. Registrar `sent` exige recibo do provedor. Claim transacional evita dois envios simultâneos; falha recebe código operacional curto, sem dados pessoais na mensagem de erro. Após interrupção prolongada e antes de reenviar, conferir o provedor e sua janela vigente de idempotência. E-mail aceito pelo provedor não comprova leitura ou recebimento na caixa de entrada.

Referências de configuração: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs), [confirmação e recuperação](https://supabase.com/docs/guides/auth/auth-email-templates), [API de envio Resend](https://resend.com/docs/api-reference/emails/send-email). A assinatura SSR usada foi conferida no pacote oficial instalado; homologação remota dos serviços fica pendente de acesso/configuração.

## Histórico real de compras

`reseller_purchase_records` recebe apenas fatos confirmados e vinculados ao revendedor correto. Solicitante não pode inserir ou alterar esses registros. A combinação unidade + referência de venda é única, e valores negativos são rejeitados.

As compras anteriores do SysAla ainda exigem amostra autorizada e mapeamento real: identificador do cliente no ERP → UUID confirmado do revendedor, unidade, referência única de venda, data, resumo e total aprovado quando aplicável. Esses são campos internos esperados, não um layout presumido do SysAla. Não inferir titularidade por nome semelhante, não importar dados de outros clientes e não inventar compras para preencher a tela.

O importador de histórico e a carga de dados reais **não foram executados**. Os pedidos novos já ficam rastreáveis no portal; o histórico físico aparece somente depois de vinculação autorizada. Cancelamentos/devoluções e registros fiscais continuam tratados na operação física.

## Arquivos e permissões

- Todas as tabelas possuem RLS. Revendedores consultam apenas perfil, pedidos, eventos e compras próprios; apenas aprovados consultam materiais ativos.
- Papéis de equipe ficam em tabela separada e sem escrita para usuários autenticados. Autorizações são refeitas no servidor e nas funções SQL, não dependem de esconder botões.
- Criação de solicitação é atômica e idempotente por usuário/token. Mesmo token com conteúdo diferente é recusado. Até 20 itens, quantidades de 1 a 99 e limite por usuário para evitar excesso de envio.
- Bucket `reseller-materials` é privado. PDFs de até 50 MB são enviados diretamente ao Storage com autorização temporária; JPG/PNG/WebP continuam limitados a 3 MB na aplicação. Tipo, tamanho real e assinatura inicial são conferidos antes de publicar. Aplicar a migration de limite descrita no [guia de envio de materiais](envio-materiais.md). Somente equipe publica arquivos; apenas arquivos ativos com cadastro correspondente podem ser lidos por aprovados.
- Download exige sessão e RLS, com URL assinada por 60 segundos e entrega como anexo. Retirar material impede novos downloads; URL já assinada pode funcionar até expirar.
- Sessão em cookies HTTP-only/SameSite, refresh no Proxy, `getUser()` para autenticação, retornos em lista de caminhos permitidos. Páginas privadas têm `noindex` e `Cache-Control: private, no-store`.
- Chave secreta só participa do worker de notificações; consultas de usuários usam a própria sessão e RLS. Não expor o utilitário local CSV no painel web.

## Homologação antes de publicar

1. Aplicar migração em ambiente aprovado e conferir configuração Auth/Storage.
2. Cadastrar duas identidades de teste autorizadas; confirmar e-mail. Aprovar uma e manter outra pendente.
3. Entrar, sair, recuperar senha e verificar aprovação. Papel enviado pelo cliente não deve conceder equipe.
4. Criar solicitação com produtos reais aprovados; conferir uma única gravação após clique repetido. Nenhum estoque ou pagamento deve ser movimentado.
5. Confirmar registro no painel e aviso no destinatário autorizado; simular falha de e-mail em ambiente de teste e conferir preservação do pedido.
6. Atualizar cada etapa na equipe e acompanhar no revendedor. Impedir salto/reabertura de atendimento finalizado.
7. Publicar material autorizado, validar acesso de aprovado, negação ao pendente e revogação após retirada.
8. Tentar acesso cruzado entre os revendedores, IDs alterados e escrita direta pela API: deve ser negado por RLS/RPC.
9. Validar um registro de compra física somente após amostra e titularidade conferidas.
10. Aprovar publicação do novo portal e painel. Os testes locais não substituem a homologação de Auth, banco e entrega de e-mail reais.

## Verificações automatizadas

`npm test` inclui PostgreSQL local (PGlite) com a migração integral e fixtures de Auth/Storage: isolamento, aprovação, papel, transações, idempotência, limites, estados, avisos e biblioteca privada. As fixtures são exclusivamente fictícias e não reproduzem o serviço hospedado de autenticação/armazenamento.

Há testes de validação e envio com provedor simulado e E2E responsivos/acessíveis dos estados sem credenciais. Sessões reais, confirmação/recuperação por e-mail e recebimento de notificações **dependem de homologação no projeto configurado**. Não afirmar esses fluxos reais validados apenas pelos testes locais.
