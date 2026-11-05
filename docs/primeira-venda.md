# Primeira venda — checklist operacional

Status inicial: **não liberada para aceite comercial**. Este arquivo é o checklist preparado para a equipe; os itens não foram executados em uma loja real. Preparar o projeto não equivale a ter uma venda confirmada.

## Liberação antes de receber pedidos reais

- [ ] Loja e URLs oficiais confirmadas; titular/responsável autorizou as configurações.
- [ ] Cerca de 10 produtos reais do piloto aprovados, com cada SKU/variação conferido.
- [ ] Modelo oficial de importação obtido e mapeamento validado; arquivo definitivo revisado e importação conferida.
- [ ] Preços de varejo, disponibilidade e origem de estoque atualizados e aprovados.
- [ ] Origem de expedição, peso/dimensões, cobertura, custo e prazo de frete conferidos.
- [ ] Pix e cartão habilitados pelo provedor escolhido, com cenários de teste aprovados e conciliados.
- [ ] Pedido, confirmação, recusa/expiração, cancelamento e estorno aplicável homologados, sem pedidos de teste pendentes indevidamente.
- [ ] Dados institucionais, atendimento e políticas aprovados, incluindo entrega e troca/devolução; procedimento fiscal definido pela empresa.
- [ ] Responsáveis por pagamento, separação, expedição, cancelamento/estorno e atendimento identificados.
- [ ] `NEXT_PUBLIC_NUVEMSHOP_URL` configurada com a URL real, primeiro validada em Preview e depois em Production; links testados no computador e no celular.
- [ ] Domínio institucional/SEO definidos. Publicação das URLs não pressupõe mudança de DNS; configurar `NEXT_PUBLIC_SITE_URL` somente com origem aprovada.
- [ ] Mensuração opcional continua desativada ou foi aprovada/homologada com consentimento; clique de saída não é contabilizado como compra.
- [ ] Aceite comercial registrado pela Agylli, com data, revisão e eventuais restrições de lançamento.

As condições de revenda devem ter aceite próprio antes de liberar tabela/cadastro restritos. Se o varejo estiver aprovado e o B2B ainda bloqueado, a revenda pode manter apresentação e atendimento provisório sem expor condições privadas.

## Acompanhamento da primeira venda real

1. **Entrada:** o comprador acessa o site Agylli e segue à loja oficial pelo CTA de varejo. Conferir que não caiu em uma página provisória ou loja incorreta.
2. **Produto e carrinho:** produto, variação, quantidade, preço e disponibilidade correspondem ao cadastro comercial aprovado.
3. **Frete e total:** cálculo de entrega e prazo estão claros; total final está coerente com os itens e regras aprovadas.
4. **Pagamento:** confirmar o retorno efetivo de Pix/cartão no provedor e na loja. Pedido criado ou Pix gerado ainda não comprovam pagamento recebido.
5. **Pedido:** conferir registro único na Nuvemshop e comunicação ao comprador. Guardar referência nos sistemas oficiais; não copiar dados do cliente para Git, analytics ou planilhas públicas.
6. **Operação:** responsável verifica disponibilidade na origem oficial, procedimento fiscal e separação/expedição conforme a operação aprovada.
7. **Atendimento:** acompanhar a confirmação e os contatos de suporte, resolvendo divergências antes de prosseguir.
8. **Conciliação:** comparar valores do pedido, pagamento e frete; conferir cancelamento/estorno apenas se houver ocorrência e autorização aplicável.
9. **Registro do marco:** a Agylli confirma que é uma venda real, identifica o pedido no registro privado e registra o resultado. Relatar separadamente cliques, pedidos criados, pagamentos aprovados e vendas canceladas.

## Depois da homologação

- Acompanhar diariamente, no início da operação, erros de link, frete, pagamento, preço e disponibilidade, atribuindo responsável para correção no sistema de origem.
- Expandir o catálogo em lotes aprovados, repetindo a validação por SKU/variação e mantendo a conferência do importador oficial.
- Liberar a revenda somente depois do aceite de CPF/CNPJ, aprovação, isolamento de perfis e tabela correta.
- Implementar medição apenas quando contas/IDs e consentimento forem aprovados, conforme [mensuração](mensuracao.md).
- Avaliar SysAla e marketplaces após definir fonte de estoque, catálogo consistente e rotina de conciliação. Não duplicar checkout ou estoque no institucional.

Se uma etapa crítica falhar, registrar o bloqueio e suspender a liberação correspondente. Voltar um link ao destino provisório não cancela pedidos, desfaz cobranças ou repõe estoque; essas ações pertencem aos processos oficiais e exigem o responsável autorizado.
