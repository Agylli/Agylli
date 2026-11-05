# Etapa 5 — implantação e homologação comercial

Estado: preparação técnica local; operação real ainda não homologada. Preservar o site Next.js/Vercel e usar a Nuvemshop para varejo, atacado, cadastro e compra. SysAla atende a loja física por CSV manual; a conciliação depende de conferência humana e reserva aprovada. Marketplaces ficam para uma etapa posterior.

## Documentação oficial: bloqueio atual e regra de evidência

Em 5 de novembro de 2026, a consulta a `https://atendimento.nuvemshop.com.br/` falhou no proxy: `CONNECT tunnel failed, response 403`. Não houve resposta HTTP da origem. O domínio não está permitido na política atual deste ambiente.

Assim, **nenhum recurso de plano, caminho de menu, formato de importador, tabela B2B ou meio de pagamento foi declarado comprovado por documentação atual nesta etapa**. Não foram inventados passos de painel ou nomes de aplicações. O roteiro abaixo define preparação, autorização e critérios de homologação; os passos específicos de configuração precisam do artigo oficial vigente e da confirmação de disponibilidade na loja.

Preencher uma cópia privada de [fontes-nuvemshop-etapa5.csv](modelos/fontes-nuvemshop-etapa5.csv) com URL exata do artigo, data da consulta, plano aplicável, procedimento/limites confirmados e responsável. Não marcar como comprovado apenas porque a funcionalidade foi solicitada pela Agylli, consta de um plano desejado ou apareceu em material genérico antigo.

Para concluir essa parte, é necessário acesso à central oficial ou documentos oficiais atuais fornecidos pela operação, além do plano/recurso contratado. A liberação de acesso à documentação não autoriza configuração da loja ou movimentação financeira.

## Responsáveis e sequência de implantação

Os papéis abaixo precisam receber nomes reais pela Agylli. Os modelos começam em `nao_executado`; nenhum aceite comercial foi preenchido como se já tivesse ocorrido.

| Etapa | Responsável | Pré-requisitos | Critério de conclusão |
| --- | --- | --- | --- |
| G01 — fontes oficiais | Responsável pela implantação | Acesso aos guias atuais e plano da loja | Fontes e limites comprovados por recurso |
| G02 — loja e acessos | Gestor Agylli | URL pública, responsável e autorização de configuração | Loja, plano e acesso delegado confirmados |
| G03 — dez produtos | Comercial/cadastro | Dados oficiais, preços e fotos autorizadas | Dez grupos e todas as variações aprovados |
| G04 — saldos e arquivos | Loja física/conferente | CSVs e reserva física aprovada | Mapeamento validado e proposta sem bloqueios, considerando pendências |
| G05 — cadastro piloto | Operador Nuvemshop | G01–G03 e autorização de cadastro | Cadastro pelo recurso documentado e vitrine conferidos |
| G06 — atacado | Comercial B2B | G01–G02, regras e recurso comprovado | CPF/CNPJ, aprovação, perfis e tabela corretos |
| G07 — pagamentos | Financeiro/operador | Provedor e procedimento documentados; autorização | Pix/cartão preparados e cenários de teste autorizados |
| G08 — frete | Logística/operador | Origem, pesos, dimensões e CEPs autorizados | Cobertura, custo, prazo e indisponibilidade homologados |
| G09 — Preview | Técnico | URLs públicas oficiais aprovadas | Novo build, CTAs corretos e nenhum conteúdo administrativo acessível |
| G10 — compra varejo | Testador/financeiro | G04–G09 aplicáveis e autorização de pagamento | Cenários V01–V16 aplicáveis concluídos e conciliados |
| G11 — revendedor | Comercial B2B/testador | G06/G09 e identidades autorizadas | Cenários B01–B13 aplicáveis concluídos |
| G12 — aceite | Gestor Agylli | Homologação varejo e políticas/responsáveis | Aceite varejo; B2B tem liberação separada |
| G13 — Production | Técnico | G12, URLs e autorização de publicação | Revisão de produção e direcionamentos confirmados |
| G14 — primeira compra | Atendimento/financeiro/estoque | Operação liberada | Pedido/pagamento reais e disponibilidade conciliados |

Registro de execução: [checklist-implantacao-etapa5.csv](modelos/checklist-implantacao-etapa5.csv). Não dispensar um teste obrigatório simplesmente por ausência de acesso; registrar bloqueio. Guardar pedidos, documentos e comprovantes em evidências privadas.

## Preparar o cadastro dos dez primeiros produtos

1. Agylli escolhe os dez produtos reais e as variações que pretende disponibilizar. Reutilizar as fichas internas de [produtos](modelos/produtos-piloto.csv), [precificação](modelos/precificacao-piloto.csv) e [atacado](modelos/atacado-piloto.csv) em cópia privada.
2. Conferir SKU único, GTIN aplicável, nome, marca/categoria, descrição autorizada, imagens, preço aprovado, embalagem de envio e disponibilidade destinada ao online. Confirmar o campo/plano que representará cada informação na loja antes de cadastrar.
3. Aguardar o guia oficial atual do cadastro/importador. Escolher cadastro manual ou importação somente depois de comprovar o procedimento. Não preencher cabeçalhos oficiais por suposição.
4. Operador autorizado cadastra primeiro um produto simples e um com variação, se existir no piloto, seguindo o guia comprovado; confere identificadores, fotos, preço e logística no painel e na vitrine.
5. Corrigir o piloto inicial e repetir até os dez produtos e todas as variações. Registrar os identificadores e o aceite em arquivo privado, evitando duplicação ao repetir atualização.
6. Aprovar a exposição comercial e o método de controle do lote antes da venda. Os quatro produtos ilustrativos do institucional continuam ilustrativos; seus nomes/fotos não autorizam preço ou estoque real.

O arquivo de custos nunca acompanha um cadastro público ou uma importação de catálogo por padrão. Um arquivo nativo definitivo não será gerado antes da comprovação do formato e das permissões de uso.

## Preparar atacado, pagamentos e frete

**Atacado:** comercial define perfil CPF/CNPJ, critérios/documentos de aprovação, SKUs elegíveis, preço ou desconto, vigência, faixas, mínimos, pagamento e entrega. Confirmar na documentação e no plano se a solução contratada oferece cada capacidade; não presumir tabela/aprovação nativas nem escolher uma aplicação por conta própria. Operador autorizado segue somente o procedimento comprovado e testa pendente, aprovado, reprovado e acesso de outro perfil. Não expor condições privadas por engano nem criar cadastro duplicado no institucional.

**Pix e cartão:** financeiro identifica o provedor e as condições aprovadas, confirma o procedimento oficial de habilitação e o ambiente/cenários de teste realmente disponíveis. Conta, recebedor, parcelas, taxas e limites são definidos pela Agylli; nenhum valor foi presumido. Registrar autorização específica de método, ambiente, participantes, limite de valor e eventual cancelamento/estorno. Sem essa autorização, o fluxo para antes do pagamento. Nenhuma cobrança, Pix ou operação financeira foi realizada nesta entrega.

**Frete:** logística confirma unidade/origem de expedição, mercadoria reservada, peso/dimensões da embalagem, cobertura, serviços, prazo e custo esperado. Usar apenas um recurso documentado e disponível no plano/provedor contratado. Homologar CEP atendido e fora de cobertura com dados autorizados. Não inventar frete grátis, prazo ou integração com transportadora e não emitir etiqueta/despachar teste sem autorização.

## Sequência exata da primeira compra autorizada

Executar depois de G01–G09 e da autorização específica para o cenário, sem pular bloqueios:

1. Abrir a homepage Agylli e registrar a revisão/ambiente; conferir uso no computador e no celular.
2. Clicar em **Comprar no varejo** e confirmar acesso à URL Nuvemshop oficialmente aprovada.
3. Localizar um produto real do piloto, escolher a variação e conferir SKU, foto, descrição, preço e disponibilidade.
4. Adicionar ao carrinho e revisar quantidade, variação e total no checkout da plataforma.
5. Informar o CEP autorizado, calcular o frete e conferir serviço, custo, prazo e total final.
6. Informar somente os dados autorizados do comprador e selecionar o método/cenário aprovado pelo financeiro. Se faltar autorização financeira, interromper aqui e registrar o bloqueio; não concluir pagamento por iniciativa própria.
7. Após o pagamento autorizado, conferir o retorno efetivo do provedor. Pix gerado, pedido criado e clique de saída não comprovam pagamento recebido.
8. Conferir confirmação e ID único do pedido na Nuvemshop, SKUs, quantidades, valores, frete, status e notificações. Não registrar cobrança/pedido duas vezes ao reabrir confirmação.
9. Conferente online identifica a movimentação; operador SysAla faz o lançamento manual autorizado e reconcilia reserva/disponibilidade no novo corte. Não reaplicar um saldo anterior por CSV depois de uma nova venda.
10. Se era um teste, executar cancelamento/estorno somente se autorizado e aplicável, acompanhando a confirmação do provedor e a situação da mercadoria. Se era a primeira compra real, prosseguir com atendimento, procedimento fiscal e expedição aprovados.
11. Registrar aceite e evidências privadas; relatar separadamente clique, pedido, pagamento aprovado, cancelamento e venda efetiva.

Para revendedor: entrar por `/atacado#cadastro-atacado`, solicitar cadastro oficial com CPF/CNPJ autorizado, verificar pendência, submeter à revisão comercial, aprovar pelo recurso comprovado e confirmar perfil/tabela corretos. Repetir em celular e conferir isolamento de condições restritas. A confirmação da solicitação não equivale à aprovação.

Roteiros detalhados existentes: [homologação](homologacao-comercial.md), [primeira venda](primeira-venda.md) e [conciliação](conciliacao-manual.md). A primeira liberação pode priorizar varejo; o atacado não recebe autorização automática por esse aceite.

## Configuração do site e próximos passos

Manter `NEXT_PUBLIC_NUVEMSHOP_URL`, `NEXT_PUBLIC_NUVEMSHOP_B2B_URL` e `NEXT_PUBLIC_SITE_URL`. Quando houver URLs oficiais e autorização, configurar em Preview, fazer build e testar CTAs; aplicar Production após aceite. Até lá, manter `/loja-em-breve`, contato de revenda e `noindex`. O utilitário administrativo permanece local e fora do pacote público.

Depois da homologação: acompanhar a primeira venda e a conciliação diária/eventos relevantes, ampliar catálogo em lotes, liberar B2B após aceite próprio e avaliar marketplaces integrados à operação online. Não criar checkout, clientes ou estoque paralelo para substituir recursos da Nuvemshop.
