# Nuvemshop — conexão do varejo e do atacado

A aplicação Next.js permanece responsável pela apresentação institucional. A Nuvemshop será responsável por catálogo comercial, clientes, tabelas de preços, cadastro B2B, pedidos, checkout e pagamentos. Não criar um segundo checkout, cadastro de clientes ou estoque nesta aplicação.

## Execução da Etapa 3

O [plano de ativação comercial](ativacao-comercial.md) detalha loja, tabelas, CPF/CNPJ, aprovação, Pix, cartão, frete e gestão de pedidos, com dependências e evidências de aceite. Os [roteiros de homologação](homologacao-comercial.md) e o [checklist da primeira venda](primeira-venda.md) devem ser executados pela equipe autorizada antes da liberação.

O formato oficial atual do importador ainda não foi verificado: a central oficial está bloqueada pelo proxy deste ambiente. Não foi gerado um arquivo definitivo. O [controle de mapeamento](modelos/mapeamento-importacao-nuvemshop.csv) aguarda o modelo obtido no painel autorizado. Os testes locais do site não comprovam venda ou aprovação B2B real.

## Contrato de configuração preservado

| Variável | Destino | Sem URL HTTPS válida |
| --- | --- | --- |
| `NEXT_PUBLIC_NUVEMSHOP_URL` | Loja oficial de varejo | `/loja-em-breve` |
| `NEXT_PUBLIC_NUVEMSHOP_B2B_URL` | Cadastro/acesso oficial de revendedores | `/contato?assunto=revenda` |
| `NEXT_PUBLIC_SITE_URL` | Origem canônica do site institucional | `noindex`, robots bloqueado e sitemap sem URLs |

Os nomes estão preservados em `src/config/brand.ts`, com validação em `src/lib/urls.ts`. São aceitas URLs HTTPS absolutas sem credenciais embutidas. Os campos `NEXT_PUBLIC_*` são públicos e incorporados ao build; não contêm tokens de API. Alterá-los na Vercel exige novo build/deploy. Não foi inventado nenhum endereço comercial.

## Jornada atual e ponto de cadastro

- Homepage: o botão de varejo usa a variável da loja; o botão de atacado abre a apresentação `/atacado`.
- Cabeçalho, rodapé, seleção de produtos e demais CTAs de varejo usam o mesmo destino centralizado.
- `/atacado` mantém benefícios, CPF/CNPJ, orientações de cadastro e FAQ. O bloco `#cadastro-atacado` define o espaço estável de cadastro e pode ser usado por futuras campanhas.
- Todos os botões “Solicitar acesso ao atacado” usam a variável B2B, inclusive o novo bloco. Sem configuração, o visitante pode conversar com as unidades pelos contatos oficiais. Não há coleta de documentos nem confirmação fictícia de cadastro.
- A apresentação do atacado continua acessível mesmo depois de conectar a área B2B. Links institucionais de revenda permanecem em `/atacado`.

O futuro cadastro será acessado por link. Um formulário incorporado só deve ser considerado se a Nuvemshop oferecer um mecanismo oficial, acessível e adequado à privacidade. Não incorporar páginas arbitrárias nem criar um banco paralelo de revendedores.

## Ativação do varejo

1. A Agylli confirma a loja, o responsável pelo painel e a URL pública HTTPS.
2. Validar na Nuvemshop produtos, frete, pagamento, políticas e canais de atendimento. Seguir o [piloto de catálogo](catalogo-piloto.md).
3. Cadastrar a URL em `NEXT_PUBLIC_NUVEMSHOP_URL` no ambiente de Preview; fazer novo build.
4. Verificar os links de varejo da homepage, menu móvel, rodapé, produtos e página provisória, em celular e computador.
5. Efetuar um pedido de teste permitido na própria plataforma e conferir pagamento, entrega e registro do pedido. Não usar o clique de saída como prova de compra.
6. Após aprovação comercial, aplicar a mesma configuração em Production, publicar e validar a jornada completa. Manter o deployment anterior disponível para rollback.

## Ativação do atacado

1. Confirmar com a Nuvemshop o plano/recurso ou aplicação oficial que suporta B2B, tabelas de preço, cadastro e aprovação. A capacidade efetiva ainda não foi verificada em uma loja contratada.
2. A Agylli define documentos, regras de CPF/CNPJ, aprovação, limites, preços, faixas, pagamento, frete e atendimento. O material institucional não substitui a aprovação das condições vigentes.
3. Confirmar o endereço público de cadastro/acesso para `NEXT_PUBLIC_NUVEMSHOP_B2B_URL`; não usar um link administrativo.
4. Testar acesso de visitante e revendedor aprovado, tabela correta, negação de acesso indevido e comportamento da aprovação na Nuvemshop.
5. Configurar em Preview, revisar os três pontos de solicitação em `/atacado` e a informação do bloco `#cadastro-atacado`; depois aplicar a configuração aprovada em Production.

## Critérios para liberar a operação

- URLs reais fornecidas e destinos confirmados pela Agylli; navegação interna e fallbacks continuam funcionais.
- Catálogo piloto aprovado, sem preços, peso, estoque ou descontos inventados.
- Checkout e cadastro B2B testados na plataforma; pedidos e clientes pertencem à operação Nuvemshop.
- Domínio institucional e políticas definidos, com SEO revisado após configurar `NEXT_PUBLIC_SITE_URL`.
- Mensuração e consentimento validados conforme [plano de análise](mensuracao.md).

APIs, tokens privados e webhooks são uma etapa futura, somente quando houver necessidade concreta, documentação oficial e autorização. Nenhuma conexão com Nuvemshop, SysAla ou marketplaces foi ativada nesta etapa.
