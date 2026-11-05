# Catálogo comercial piloto — preparação para Nuvemshop

O piloto deve usar aproximadamente **10 produtos reais**, escolhidos e aprovados pela Agylli. Um produto com variações terá várias linhas, uma por SKU vendável; assim, 10 produtos podem ocupar mais de 10 linhas. Os quatro itens ilustrativos do site permanecem como estão até existir catálogo autorizado e conferido.

Na Etapa 3, o acompanhamento do lote foi preparado em [validacao-piloto.csv](modelos/validacao-piloto.csv), com dez posições vazias de controle, e o mapeamento em [mapeamento-importacao-nuvemshop.csv](modelos/mapeamento-importacao-nuvemshop.csv). Nenhum produto real foi preenchido ou validado. O bloqueio de acesso à documentação oficial e as condições para gerar o arquivo definitivo estão registrados em [ativação comercial](ativacao-comercial.md).

## Modelos entregues e limite do formato

| Arquivo | Finalidade |
| --- | --- |
| [produtos-piloto.csv](modelos/produtos-piloto.csv) | Dados do produto/variação, logística, imagens, varejo e referência do estoque |
| [precificacao-piloto.csv](modelos/precificacao-piloto.csv) | Custos e aprovação de preço; uso interno |
| [atacado-piloto.csv](modelos/atacado-piloto.csv) | Regras comerciais e tabelas de revenda aprovadas |

Os arquivos têm **somente cabeçalhos**. Não há produtos, EANs, preços, estoque ou condições inventados. São um formato de preparação e conferência da Agylli, não um CSV nativo homologado da Nuvemshop. Antes de importar, obter o modelo atual do importador da loja e mapear os campos para ele. Imagens, variações, tabelas B2B e atualizações de estoque podem exigir recursos diferentes; verificar o que o plano e o importador realmente suportam. Não enviar o arquivo interno de custos ao importador de produtos.

Copiar os modelos preenchidos para `dados-comerciais/` ou um armazenamento privado aprovado. Essa pasta está ignorada pelo Git e pelo pacote de deploy. Não preencher e commitar os templates públicos, nem colocar custos ou exportações comerciais em `public/`. Esses arquivos são preparação de importação; não operam ou mantêm um estoque paralelo.

## Convenções de preenchimento

- CSV UTF-8, separador vírgula, cabeçalho preservado. Usar aspas em campos que contenham vírgula, aspas ou quebra de linha; uma aspa interna vira duas aspas.
- Valores monetários em BRL, com ponto decimal, duas casas e sem símbolo de moeda. Percentuais em pontos percentuais, de 0 a 100; vazio significa ainda não definido, não zero.
- Peso em kg e dimensões em cm, medidos na embalagem utilizada para envio. Não trocar peso líquido do produto por peso de postagem.
- SKU e EAN/GTIN são texto. Importar essas colunas como texto no Excel/LibreOffice para preservar zeros iniciais e evitar notação científica.
- SKU único por variação vendável, estável e conciliável com a origem. Não reutilizar o mesmo SKU para tamanhos/cores diferentes. `grupo_produto` agrupa as variações do mesmo produto.
- Datas no formato `AAAA-MM-DD`; instantes de estoque em ISO 8601 com fuso. Flags usam `sim` ou `nao`.
- Descrições em texto revisado, sem scripts, informações pessoais ou alegações de eficácia não fornecidas/aprovadas. Fotografias apenas com origem e autorização registradas.

## Dicionário do arquivo de produtos

| Campo | Regra de conferência |
| --- | --- |
| `grupo_produto` | Identificador interno de agrupamento; mesmo valor para variações do mesmo produto |
| `sku` | Obrigatório e único por item vendável; conferir duplicidade nos três arquivos e na loja |
| `ean_gtin` | Quando aplicável, código verdadeiro do fabricante; 8, 12, 13 ou 14 dígitos e dígito verificador válido |
| `ean_nao_aplicavel_justificativa` | Se não houver GTIN aplicável, justificar; nunca gerar um número fictício |
| `nome_comercial`, `marca` | Nome e marca oficiais, consistentes entre variações |
| `categoria`, `subcategoria` | Taxonomia aprovada; subcategoria opcional, sem duplicar grafias |
| `descricao` | Texto comercial revisado, quantidade/conteúdo e orientações oficiais quando disponíveis |
| `variacoes_json` | Lista de atributos da variação, com nomes/valores oficiais; `[]` para produto sem variação. Cada combinação deve ser única no grupo |
| `peso_kg` | Peso positivo da unidade embalada para envio, medido e confirmado |
| `altura_cm`, `largura_cm`, `comprimento_cm` | Medidas positivas da embalagem de envio; conferir orientação e arredondamento exigidos pelo importador |
| `imagens_urls` | URLs HTTPS de imagens autorizadas, separadas por `\|`; primeira imagem é a principal. Confirmar acesso e associação à variação |
| `direitos_imagem_confirmados` | `sim` somente com autorização/procedência registrada fora do cadastro público |
| `preco_varejo_brl` | Preço final aprovado; deve corresponder ao arquivo interno de precificação, sem fórmula de custo exposta |
| `estoque_disponivel` | Inteiro não negativo de disponibilidade comercial confirmada; não importar quantidade estimada |
| `origem_estoque`, `id_produto_origem` | Sistema/unidade e identificador de origem aprovados; SysAla físico somente por CSV manual, sem API ou sincronização automática |
| `estoque_referencia_em`, `responsavel_estoque` | Data/hora do retrato e responsável por conferir/atualizar na operação oficial |
| `situacao_comercial` | `rascunho`, `aprovado_piloto` ou `bloqueado`; converter explicitamente para o estado suportado pelo painel. Não ativar venda por simples preenchimento |
| `validado_por` | Identificação interna de quem aprovou o cadastro, fora da descrição pública |

Exemplo de estrutura, sem preencher dados de um produto: `variacoes_json` é uma lista de objetos com chaves `nome` e `valor`. Nomes/valores e quantidade de atributos precisam seguir o que a loja suporta. Validar o JSON e o escape CSV antes da conversão.

## Precificação interna

`precificacao-piloto.csv` contém `sku`, custo unitário, embalagem, outras despesas unitárias, tributos, taxas do canal, subsídio de frete, margem alvo, preço de varejo aprovado, data de revisão e aprovador. Relacionar tudo pelo SKU do cadastro.

A Agylli informa quais despesas, impostos e taxas se aplicam ao seu regime e à operação. Margem e markup são medidas distintas; o template não escolhe fórmula, margem ou lucro. Não preencher uma taxa desconhecida com zero. Preço e resultado comercial dependem da validação financeira, inclusive arredondamentos e promoções. Custos e margem alvo permanecem privados e não entram em descrição, página, analytics ou planilha pública de importação.

## Regras de atacado

`atacado-piloto.csv` relaciona SKU, nome da tabela, perfil de cliente, faixa mínima/máxima de quantidade, preço de atacado ou desconto, pedido mínimo em unidades/valor, vigência, exigência de aprovação e aprovador.

- Definir qual regra prevalece: preço explícito ou desconto, sem preencher ambos de forma ambígua.
- Faixas não podem se sobrepor na mesma tabela/SKU/vigência; limites e validade precisam ser coerentes.
- Definir quem recebe cada tabela, aprovação de CPF/CNPJ e condições de pagamento/entrega na Nuvemshop.
- O desconto institucional citado no site não deve ser aplicado automaticamente a todos os SKUs. Cada condição exige confirmação comercial vigente.
- Confirmar se tabelas/faixas são importáveis ou exigem cadastro no recurso B2B contratado. Esses campos não são apresentados como capacidades já homologadas do importador.

## Validação de aproximadamente 10 produtos reais

1. **Seleção:** Agylli escolhe cerca de 10 produtos representativos, incluindo variações quando existirem e pelo menos as categorias que pretende vender no lançamento. Entregar nomes oficiais, SKUs, GTINs aplicáveis, fotos autorizadas e responsáveis.
2. **Conferência cadastral:** revisar nomes, marca, descrição, categoria, variações únicas e códigos. Verificar SKU duplicado, GTIN e seu dígito verificador; ausência de código aplicável bloqueia o item até correção ou justificativa.
3. **Logística:** pesar e medir a embalagem de envio. Conferir unidade, foto e associação correta de cada variação. Campos obrigatórios desconhecidos bloqueiam importação; não completar por estimativa.
4. **Financeiro e atacado:** responsável comercial aprova custos/preços, regras de revenda, faixas e vigências. Conferir igualdade do preço aprovado entre arquivos e quais clientes terão cada tabela.
5. **Estoque:** conferir exportação manual SysAla, pedidos online e reserva física aprovada para o piloto. Não há API, webhook ou sincronização automática SysAla → Nuvemshop. Não somar unidades ou copiar o saldo total do físico; seguir a [conciliação manual](conciliacao-manual.md). O site institucional não escreve estoque.
6. **Mapeamento:** baixar o modelo atual do painel; produzir um arquivo de importação separado, somente com os campos suportados. Registrar coluna de origem, coluna do importador, conversão/unidade, obrigatório, responsável e resultado. O arquivo interno de custos não acompanha a importação.
7. **Teste controlado:** usar loja/ambiente de teste disponibilizado pela plataforma ou produtos em rascunho, conforme suporte real. Fazer backup/exportação anterior. Começar com um produto simples e um com variação; corrigir erros antes do lote piloto. Se não houver modo de teste/rascunho, definir procedimento com a equipe antes de expor produtos.
8. **Revisão no painel e vitrine:** conferir contagem de grupos e SKUs, associação de variações, preços, peso, frete, fotos, disponibilidade e tabela de cliente. Verificar celular e computador; testar repetição/atualização conforme a semântica do importador para não duplicar cadastros.
9. **Pedido de teste autorizado:** concluir no sistema Nuvemshop, com cenário permitido pela plataforma. Conferir valor, frete, pagamento, disponibilidade e regras B2B. Não criar pedidos ou anúncios a partir desta aplicação Next.js.
10. **Aceite:** registrar produtos aprovados, problemas, correções, responsáveis e decisão de ampliar. Só importar o catálogo completo após aprovação explícita do lote piloto e um procedimento de correção/retorno.

Critério de aprovação: todos os SKUs do piloto conciliados, nenhum erro de preço/variação/foto, logística e estoque conferidos, acesso B2B correto e pedido de teste validado. Nenhum produto real foi fornecido/importado nesta tarefa; a validação comercial de 10 produtos permanece pendente.

## O que a Agylli precisa fornecer

Seleção dos produtos, dados oficiais e arquivos de imagem autorizados; unidade de venda e variações; códigos do fabricante; peso/dimensões de envio; custos e preços aprovados; impostos/taxas aplicáveis; condições de atacado; fonte e responsável por estoque; acesso autorizado ao painel Nuvemshop e seu arquivo-modelo atual. Compartilhar dados reais pelo canal privado definido pela empresa.
