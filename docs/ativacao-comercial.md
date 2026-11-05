# Etapa 3 — preparação operacional para ativação comercial

A base da Etapa 2 foi preservada. O site institucional continua em Next.js/Vercel; produtos, clientes, pedidos, checkout, pagamentos e acesso B2B pertencem à Nuvemshop e aos serviços oficiais contratados. Esta entrega prepara a execução; **primeira venda e aprovação de revendedor ainda não foram homologadas em uma loja real**.

## Estado e ordem de execução

| Frente | Preparação disponível | Dependência para ativar |
| --- | --- | --- |
| Loja de varejo | Contrato de URL e chamadas revisados, fallback funcional | Loja existente ou criação autorizada, URL pública e responsável |
| Catálogo piloto | Quatro modelos da Etapa 2 e controles de validação/mapeamento | Cerca de 10 produtos reais, autorização de imagens e modelo oficial do importador |
| Pix e cartão | Casos de aprovação, recusa, expiração e conciliação especificados | Provedor escolhido, habilitação aprovada e método/ambiente de teste autorizado |
| Frete | Cenários de cobertura, custo, prazo e indisponibilidade definidos | Origem de expedição, regras, dimensões/peso, serviços e CEPs de teste aprovados |
| Pedidos | Critérios de registro, pagamento, cancelamento e estorno definidos | Acesso autorizado ao painel e responsável pela operação |
| Revendedores | Roteiro CPF/CNPJ, pendência, aprovação e tabelas preparado | Recurso/plano B2B confirmado, regras e URL pública de cadastro/acesso |
| Primeira venda | Checklist de liberação e acompanhamento preparado | Homologação aceita e liberação comercial registrada |

Sequência: confirmar a loja e as capacidades → validar e importar o piloto pelo modelo oficial → homologar pagamento/frete/pedido → homologar cadastro e aprovação de revenda → configurar URLs aprovadas em Preview e Production → liberar a operação e acompanhar a primeira venda. Não é necessário aguardar SysAla ou marketplaces para preparar esses testes; a operação deve usar CSVs manuais SysAla, conferência de pedidos e reserva física aprovada para o piloto, conforme a [conciliação manual](conciliacao-manual.md). Não existe sincronização automática entre SysAla e Nuvemshop.

## Configurações a confirmar na Nuvemshop

| Configuração | Definição necessária | Evidência de aceite |
| --- | --- | --- |
| Loja de varejo | URL pública HTTPS, dados institucionais, responsável, moeda, atendimento e políticas | Vitrine e checkout corretos; domínio identificado; acesso de operação autorizado |
| Tabela de atacado | Recurso contratado, SKUs elegíveis, preços ou descontos, faixas, vigência e mínimos | Preço correto para cada perfil e nenhum acesso indevido a condição restrita |
| Cadastro CPF/CNPJ | Campos, documentos necessários, política, distinção pessoa física/jurídica e tratamento de duplicidade | Solicitações completas na plataforma; nenhuma coleta paralela no Next.js |
| Aprovação | Responsável, critérios, comunicação de decisão e revogação | Pendente sem acesso restrito; aprovado com tabela correta; reprovado sem privilégio |
| Pix | Provedor, cadastro do recebedor, liquidação, validade e regras oficiais | Cenários autorizado/pago e não pago/expirado conciliados ao pedido |
| Cartão | Provedor, análise/habilitação, parcelas, taxas e política comercial | Aprovação e recusa de teste verificadas; nenhuma venda paga em caso de recusa |
| Frete | Unidade/origem de expedição, cobertura, serviços, prazo e política de custo | Cálculo coerente para CEP atendido; tratamento claro fora de cobertura |
| Pedidos | Acessos por função, status e responsáveis, confirmação, separação e conciliação | Pedido único e valores corretos; pagamento/cancelamento/estorno reconciliados |

Os nomes e capacidades exatos dependem da loja/plano e dos recursos realmente contratados. Não está confirmado que toda tabela, faixa, aprovação ou importação seja nativa ou esteja disponível no plano da Agylli. Validar com o painel e a documentação oficial antes de contratar ou configurar extensões.

O teste de pagamento precisa de autorização específica de ambiente, método, participantes e limite de valor. Preferir o mecanismo de teste oficial do provedor quando disponível. Se não houver sandbox, não executar cobrança/Pix real sob o rótulo de simulação: a Agylli deve aprovar a operação controlada e eventual cancelamento/estorno antes da execução. Nenhuma movimentação financeira foi realizada por esta entrega.

## Catálogo e modelo oficial de importação

Os arquivos [produtos](modelos/produtos-piloto.csv), [precificação](modelos/precificacao-piloto.csv), [atacado](modelos/atacado-piloto.csv) e [campanhas UTM](modelos/campanhas-utm.csv) foram reutilizados como entradas do processo. Continuam vazios, com cabeçalhos apenas. O quarto modelo orienta a entrada de uma campanha aprovada no roteiro; não representa um cadastro de produtos.

A consulta a `https://atendimento.nuvemshop.com.br/`, em 5/11/2026, falhou antes de alcançar a origem: o proxy respondeu `CONNECT tunnel failed, response 403` (HTTP da origem não obtido). O domínio não consta da política de rede vigente. **O formato oficial atual não pôde ser verificado. Nenhum CSV definitivo para importação foi gerado.**

Para liberar o mapeamento, o responsável autorizado deve obter do painel da loja o arquivo-modelo/exportação compatível e a instrução oficial vigente. Registrar versão/data, origem, codificação, separador, cabeçalhos, obrigatoriedade, unidades, variações, imagens e comportamento de atualização por SKU/identificador. Cabeçalhos presumidos ou templates genéricos não satisfazem esse requisito.

- Preencher uma cópia privada de [mapeamento-importacao-nuvemshop.csv](modelos/mapeamento-importacao-nuvemshop.csv). As colunas oficiais estão deliberadamente vazias.
- Campos internos, justificativas, responsáveis e autorização de imagem não são destinados à descrição pública. Custos e margem permanecem exclusivamente privados.
- Confirmar separadamente como o recurso B2B recebe tabelas/faixas; não acrescentar esses campos ao CSV de varejo sem suporte comprovado.
- Conferir cerca de 10 produtos em [validacao-piloto.csv](modelos/validacao-piloto.csv), seguindo a [especificação](catalogo-piloto.md). P01–P10 são posições de controle sem produtos ou SKUs preenchidos; adicionar linhas para cada variação real.
- Gerar o arquivo definitivo somente depois do aceite do modelo, dos dados e da transformação. Arquivo preenchido e arquivo definitivo ficam em `dados-comerciais/` ou armazenamento privado aprovado, fora do Git/deploy.

## Navegação e variáveis preservadas

| Variável | Uso após receber a URL oficial | Alternativa atual |
| --- | --- | --- |
| `NEXT_PUBLIC_NUVEMSHOP_URL` | Loja pública de varejo | `/loja-em-breve` |
| `NEXT_PUBLIC_NUVEMSHOP_B2B_URL` | Cadastro/acesso público B2B | `/contato?assunto=revenda` |
| `NEXT_PUBLIC_SITE_URL` | Origem canônica institucional | `noindex` até definição |

O varejo da homepage, menu, rodapé, produtos, sobre e contato utiliza a configuração centralizada. A chamada de atacado abre a apresentação institucional; os três CTAs de solicitação usam a URL B2B, incluindo `/atacado#cadastro-atacado`. Não foi alterado nenhum destino para um endereço inventado.

Quando os endereços forem fornecidos e sua aplicação autorizada: validar HTTPS, destino e acesso público; configurar primeiro em Preview; fazer novo build; testar todas as chamadas e as jornadas na loja; aplicar Production após aceite; revisar domínio/SEO e guardar a revisão anterior para retorno. Valores `NEXT_PUBLIC_*` são públicos e incorporados ao build; não inserir segredos. Ver [implantação](deploy.md) e [integração](nuvemshop.md).

## Execução e evidências

Usar cópias privadas dos modelos de [homologação de varejo](modelos/homologacao-varejo.csv) e [revenda](modelos/homologacao-revenda.csv). Todas as linhas começam em `nao_executado`. Resultados permitidos: `nao_executado`, `bloqueado`, `aprovado`, `reprovado` e `nao_aplicavel` com justificativa. Um caso bloqueado/não executado não equivale a aprovado. Um cenário de pagamento obrigatório não pode ser dispensado apenas por falta de ambiente.

Cada execução registra data, ambiente/revisão, responsável, resultado, bloqueio e referência de evidência privada. Documentos pessoais, endereços, pedidos reais, comprovantes e dados financeiros não entram nos CSVs públicos, logs ou screenshots versionados. Os testes automatizados do Next.js verificam interface e fallbacks; não comprovam compra, pagamento, importação ou aprovação real.

Roteiros completos: [homologação](homologacao-comercial.md). Liberação e acompanhamento da venda: [primeira venda](primeira-venda.md). Planejamento de sistemas posteriores: [integrações](integracoes.md).
