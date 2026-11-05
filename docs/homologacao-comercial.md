# Homologação comercial — varejo e revendedores

Este é um roteiro executável pela equipe autorizada, não um registro de testes já realizados na Nuvemshop. A ausência de loja, URLs, produtos, recurso B2B e método de pagamento aprovado impede o aceite comercial por enquanto. Preparação e dependências: [ativação](ativacao-comercial.md).

## Antes de iniciar

1. Definir responsável da Agylli, ambiente/loja, revisão do site, versão do catálogo e participantes autorizados. Separar painel administrativo de URL pública de compra/cadastro.
2. Obter aceite dos produtos piloto e do modelo oficial de importação. Confirmar SKUs, preços, fotos, peso/dimensões, disponibilidade e unidade de expedição.
3. Confirmar recurso B2B, tabelas e regras de aprovação. Se não estiver contratado ou não atender a CPF/CNPJ, registrar bloqueio e definir solução oficial; não simular aprovação no institucional.
4. Aprovar os cenários de Pix/cartão, valor máximo, ambiente, dados oficiais de teste e autorização para cancelamento/estorno. Não criar contas de pagamento, contratar serviços, cadastrar pessoas ou movimentar recursos sem autorização.
5. Definir CEPs e endereços de teste autorizados, cobertura esperada, serviço de entrega e responsável por conciliação. Não disparar expedição/etiquetas de teste sem decisão operacional.
6. Copiar os modelos para armazenamento privado. Identidades, comprovantes e detalhes de pedidos permanecem nos sistemas oficiais e no arquivo privado de evidências.

## Compra de varejo — sequência principal

| Passo | Ação | Resultado esperado e evidência |
| --- | --- | --- |
| 1. Site Agylli | Abrir homepage no computador e no celular; conferir revisão e origem da visita | Identidade aprovada e navegação funcionam. Se houver campanha aprovada, usar URL do modelo UTM; entrada orgânica dispensa UTM |
| 2. Comprar no varejo | Clicar no CTA; conferir também menu, rodapé, produtos, sobre e contato | Todos os destinos de varejo apontam à URL oficial configurada; em ambiente sem configuração, alternativa continua funcionando |
| 3. Loja Nuvemshop | Conferir domínio e vitrine pública | A loja pertence à operação aprovada; sem redirecionamento para painel ou loja desconhecida |
| 4. Produto | Selecionar produto e variação do piloto | SKU, imagem, descrição, marca, categoria, preço e disponibilidade corretos |
| 5. Carrinho | Adicionar, alterar quantidade e remover/reinserir item | Carrinho nativo com variação e totais corretos; quantidade indisponível não aceita indevidamente |
| 6. Frete | Informar CEP autorizado atendido e conferir serviço/prazo/custo; repetir com CEP fora de cobertura | Origem e medidas corretas; preço/prazo coerentes; indisponibilidade clara onde não há serviço |
| 7. Pagamento | Executar somente o método/cenário previamente aprovado | Pix e cartão conciliados ao pedido pelo provedor; valor, parcelas e status corretos |
| 8. Confirmação e pedido | Conferir confirmação, notificações e painel oficial | Pedido único, SKUs, quantidades, valores, frete e status corretos. Pedido criado não significa necessariamente pagamento aprovado |
| 9. Cancelamento/estorno | Executar apenas o procedimento autorizado e aplicável ao cenário | Cancelamento de pedido não pago e estorno de pagamento são operações distintas; acompanhar retorno e conciliação do provedor |

## Cenários adicionais obrigatórios

- **Pix aprovado:** confirmar o retorno efetivo do provedor, não somente uma tela/código gerado. Não copiar código Pix ou comprovante para documentação pública.
- **Pix não pago/expirado:** pedido permanece sem classificação de pago; conferir prazo e liberação/reserva conforme regra oficial configurada.
- **Cartão aprovado:** utilizar dados de teste oficiais no ambiente permitido, ou operação real expressamente autorizada. Conferir parcelas/total e retorno da transação.
- **Cartão recusado:** utilizar cenário de recusa disponibilizado pelo provedor. Não usar cartões/identidades inventados; recusa não confirma venda paga.
- **Confirmação recarregada:** reabrir confirmação e painel sem gerar outro pedido/cobrança. Se houver mensuração aprovada, conferir ausência de receita duplicada; clique de saída continua separado de `purchase`.
- **Cancelamento não pago:** não registrar devolução de dinheiro que não foi recebido. Conferir status e estoque pelo sistema oficial.
- **Estorno pago:** ter autorização, identificar a transação correta, registrar solicitação e acompanhar status. Não declarar o estorno concluído apenas porque o pedido foi cancelado ou a solicitação foi aceita.
- **Conciliação final:** comparar pedidos, pagamentos, eventuais taxas/estornos e disponibilidade. Deixar os pedidos de teste identificados segundo o processo da empresa e sem expedição indevida.

Detalhamento e registro: [homologacao-varejo.csv](modelos/homologacao-varejo.csv), casos V01–V16. Executar as jornadas principais no celular e no computador. Reutilizar cenários de falha apenas conforme suporte real do ambiente/provedor; incapacidade de testar um cenário deve ser registrada e resolvida antes do aceite correspondente.

## Cadastro e aprovação de revendedor

| Passo | Ação | Resultado esperado |
| --- | --- | --- |
| 1. Capacidade | Conferir no painel/fornecedor recurso B2B, tabelas, CPF/CNPJ, aprovação e revogação | Capacidade real documentada para o plano contratado; limitações registradas |
| 2. Entrada | Abrir `/atacado#cadastro-atacado` e clicar em solicitar acesso | Cadastro/acesso oficial correto; apresentação institucional e atendimento disponíveis |
| 3. CPF | Solicitar cadastro com identidade de teste autorizada | Campos, documentos e informação de privacidade coerentes com política; confirmação de recebimento não aprova automaticamente |
| 4. CNPJ | Repetir com cadastro empresarial autorizado | Empresa e responsável tratados conforme política aprovada; sem banco paralelo no Next.js |
| 5. Pendente | Tentar acesso antes da decisão | Restrições e comunicação de pendência conforme regra aprovada; tabela privada não exposta indevidamente |
| 6. Aprovação | Responsável autorizado revisa e aprova o cadastro de teste | Decisão registrada na plataforma, comunicação correta e perfil atribuído |
| 7. Tabela e compra | Conferir SKU elegível, preço/faixa, vigência, mínimo e carrinho | Condição correta para o perfil, sem herdar tabela de outro cliente; pedido B2B de teste somente se autorizado |
| 8. Reprovação/duplicidade | Executar cenários autorizados e consultar comunicação | Sem privilégio indevido ou cadastro paralelo; duplicidade tratada pelo sistema comercial |
| 9. Revogação | Suspender/revogar uma conta de teste pelo mecanismo oficial | Acesso restrito removido conforme política; registrar bloqueio se o recurso não existir |
| 10. Celular e aceite | Repetir entrada/cadastro/acesso no celular e revisar evidências | Fluxo utilizável e aprovações corretas, sem documentos em logs ou arquivos públicos |

Detalhamento e registro: [homologacao-revenda.csv](modelos/homologacao-revenda.csv), casos B01–B13. Não cadastrar pessoas reais ou documentos de terceiros sem a autorização e o tratamento de dados definidos pela empresa.

## Critérios de aceite e retorno

- Aprovar separadamente varejo e revenda; o aceite de um não concede aprovação ao outro.
- Zero erro crítico de valor, SKU/variação, pagamento, acesso a tabela restrita, frete ou duplicação de pedido.
- Cada caso obrigatório tem resultado e evidência; bloqueio, pendência ou recusa de pagamento não podem ser convertidos em sucesso fictício.
- Pedidos de teste e eventuais cancelamentos/estornos conciliados; responsável comercial registra o aceite.
- Configurar Production apenas após autorização do aceite e das URLs. Guardar revisão/valores anteriores para retorno do direcionamento, sem apagar pedidos ou alterar estoque por esta aplicação.
- Se falhar pagamento/frete/acesso, interromper a liberação correspondente, manter atendimento e destinos provisórios quando necessário e corrigir na plataforma responsável.

Depois do aceite, seguir o [checklist da primeira venda](primeira-venda.md). Uma venda real depende de cliente/pedido e pagamento efetivos; não pode ser inferida dos testes locais ou de um clique no botão.
