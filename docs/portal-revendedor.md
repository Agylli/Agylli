# Portal do revendedor e painel da equipe

Escopo aprovado em 11/11/2026. A configuração vigente confirma somente a unidade de Cândido Sales; cadastro e solicitações aceitam esse identificador. A Agylli solicitou cadastro simples, entrada/saída, acompanhamento, benefícios, catálogos e divulgação, além de solicitações de produtos atendidas pela loja física. A equipe receberá as solicitações por **e-mail e painel**, com aprovação manual dos cadastros.

## Fluxo implementado

1. `/atacado` oferece entrada para `/revendedor/entrar` e `/revendedor/cadastro`, preservando os contatos e destinos externos existentes.
2. Cadastro com nome, e-mail, senha de no mínimo 12 caracteres, telefone e unidade. Confirmação do e-mail no Supabase e aprovação manual no painel.
3. Revendedor aprovado acessa resumo, pedidos, compras confirmadas, catálogos/materiais, benefícios e dados da conta. Recuperação de senha e saída estão incluídas.
4. `/revendedor/solicitar` recebe produtos pelo nome/código e quantidade; não usa o catálogo ilustrativo como dado comercial. Unidade, produtos e reconhecimento das condições são obrigatórios. Não há pagamento, preço calculado, reserva nem baixa de saldo.
5. A transação registra solicitação, itens, evento inicial e aviso pendente. Só então tenta enviar o e-mail. Falha de envio mantém o pedido no painel.
6. `/equipe` permite conferir cadastros, aprovar/suspender, acompanhar solicitações, atualizar andamento, reenviar avisos e publicar/retirar materiais autorizados.
7. O revendedor acompanha `Recebido → Em análise → Em separação → Pronto para entrega → Entregue`, ou cancelamento permitido. A loja confirma condições e realiza os procedimentos comerciais no sistema físico. Entrega de solicitação não gera compra confirmada automaticamente.

Este portal de relacionamento é o novo escopo específico aprovado pelo usuário; substitui a premissa anterior de depender exclusivamente do B2B Nuvemshop para essas funções. **Varejo, checkout e pagamento do e-commerce continuam na Nuvemshop.** SysAla continua sem API/webhooks; o utilitário CSV permanece local e fora do deploy. Não há ERP ou estoque paralelo.

## Ativação no projeto Supabase existente

Projeto informado pela Agylli: `https://jblvhlppkvpovqodpgqd.supabase.co`. A existência do projeto foi informada; permissões e schema remoto não foram inspecionados nem modificados nesta implementação.

1. Administrador autorizado revisa e aplica **uma única vez** [202611110001_reseller_portal.sql](../supabase/migrations/202611110001_reseller_portal.sql) pelo fluxo de migração aprovado/SQL Editor. A migração é transacional, aditiva e não apaga tabelas existentes; se houver conflito de nomes, investigar e não contornar apagando dados.
2. Ativar confirmação de e-mail e revisar a entrega transacional de autenticação e os limites vigentes do Supabase. Configurar o domínio institucional aprovado como Site URL e autorizar os retornos `/auth/callback` e `/auth/confirm` nas URLs de redirecionamento. Preview deve ter URL exata autorizada; não liberar domínios arbitrários.
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
- Bucket `reseller-materials` é privado. PDF/JPG/PNG/WebP de até 3 MB, com assinatura do arquivo validada. Somente equipe publica arquivos; apenas arquivos ativos com cadastro correspondente podem ser lidos por aprovados.
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
