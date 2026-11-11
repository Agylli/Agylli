# Entrega local — área do revendedor

Data: 11/11/2026, Bahia (UTC−03). Base inicial: `3341f0f`; atualizações remotas até `b22f7fd` incorporadas, repositório `Agylli/Agylli`. Implementação nova local; nenhum push, deploy do portal, alteração do Supabase remoto ou envio de e-mail real nesta entrega.

## Decisões confirmadas pela Agylli

- Cadastro simples, entrada/saída e acompanhamento dos pedidos e compras.
- Solicitação de produtos encaminhada à loja física para conferir, separar e entregar.
- Aprovação manual antes de pedidos e materiais comerciais.
- Aviso por e-mail **e** painel da equipe.
- Destino inicial `adm.agylli@gmail.com`, com futura troca para `contato@agylli.com`.
- Preservar a configuração atual de contato exclusivo em Cândido Sales e reutilizar projeto Supabase `https://jblvhlppkvpovqodpgqd.supabase.co`.

## Implementado no código

| Parte | Entrega |
| --- | --- |
| Acesso | Cadastro, confirmação, login, saída, recuperação e nova senha; sessão em cookies e retorno seguro |
| Aprovação | Papel de funcionário separado dos metadados do usuário; aprovação exige e-mail confirmado |
| Pedidos | Até 20 itens por solicitação, quantidades de 1 a 99, unidade, observações e condições reconhecidas |
| Persistência | Pedido, itens, evento e aviso em transação; token evita duplicação e recusa reuso com conteúdo alterado |
| Atendimento | Painel da equipe, detalhes, cadastros e evolução sequencial até entrega/cancelamento |
| E-mail | Adaptador com idempotência e recibo; falha preserva o pedido e permite tratamento no painel |
| Materiais | Publicação/retirada, benefício com texto e catálogo/divulgação com arquivo privado de até 3 MB |
| Histórico físico | Tela e estrutura protegida prontas; nenhum dado anterior foi importado ou inventado |
| Institucional | Identidade, varejo Nuvemshop e contatos preservados; entradas do portal no atacado/rodapé |
| Segurança | RLS, autorizações servidor/SQL, cookies HTTP-only, noindex/no-store e migrações excluídas do pacote público |

RLS e a aplicação impedem acesso cruzado a pedidos, eventos e compras. Não há checkout, cálculo de preço, reserva ou alteração de estoque. O utilitário CSV mantém suas funções; o gate foi estendido para recusar migrações SQL no pacote público.

## Verificações executadas

- ESLint: aprovado, sem avisos.
- TypeScript e build: aprovados; rotas privadas dinâmicas.
- Vitest: **43 testes aprovados**, incluindo 14 com a migração integral executada em PostgreSQL local PGlite, mais validação, e-mail simulado e entrada pública do cadastro.
- Python: **45 testes aprovados**, sem ignorados nesta máquina; conciliação e gate.
- Playwright: **87 testes aprovados** nas larguras 375, 768 e 1440 px; suíte completa com institucional, acessibilidade, portais em preparação e retornos seguros.
- A suíte final foi executada novamente após incorporar as cinco atualizações remotas até `b22f7fd`, preservando o visual aprovado, animações, logotipos e o contato exclusivo de Cândido Sales.
- Gate do build: **23 traces** conferidos, sem utilitário, pasta privada ou migrações.
- Auditoria do JavaScript entregue ao cliente: sem referências a `SUPABASE_SECRET_KEY`, `RESEND_API_KEY` ou ao endpoint de envio.

Total: **175 casos distintos aprovados** nas verificações realizadas. Os E2E usam a configuração sem credenciais; as fixtures de Auth/Storage do teste SQL não equivalem aos serviços hospedados. Envio de e-mail usa provedor simulado nos testes.

## Pendências para ativar

1. Aplicar a [migração revisada](../supabase/migrations/202611110001_reseller_portal.sql) no projeto Supabase existente por administrador autorizado.
2. Configurar confirmação de e-mail, origens/retornos e as variáveis de Preview/Production conforme [guia](portal-revendedor.md). A consulta de nomes na Vercel encontrou somente `NEXT_PUBLIC_NUVEMSHOP_URL`; nenhuma chave foi solicitada por chat ou exposta.
3. Provisionar o primeiro funcionário por UUID confirmado e verificar dois usuários de teste distintos.
4. Configurar o provedor/remetente e autorizar o teste de e-mail ao destinatário aprovado.
5. Receber catálogos/materiais autorizados e, para compras anteriores, amostras CSV com mapeamento de cliente e referências de venda.
6. Homologar os fluxos no ambiente real e obter autorização para enviar/publicar o novo portal e painel.

O sistema não apresenta compras ou materiais fictícios para preencher as telas. Sem Supabase configurado, o institucional continua funcionando e a área informa preparação.

## Prévia visual

- [Acesso no computador](screenshots/portal-entrar-1440.png).
- [Cadastro no celular](screenshots/portal-cadastro-375.png).

As capturas mostram o estado real de preparação, com campos desabilitados até configurar o serviço; não representam uma sessão de revendedor fictício como se fosse real.
