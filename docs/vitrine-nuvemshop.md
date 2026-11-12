# Vitrine de produtos reais — 12/11/2026

O site mantém o design próprio e passa a consultar o catálogo da loja Nuvemshop por uma conexão somente de leitura. Produtos, preços, publicação, categorias e variações continuam sendo administrados na Nuvemshop. Cada produto leva à sua própria página `/produtos/{handle}/` na loja configurada. A vitrine pública não cria carrinho, checkout, cobrança, cadastro de compradores ou escrita de estoque. O portal privado de revendedores e seu catálogo próprio permanecem separados, com autenticação e regras de acesso preservadas; seus dados não são publicados por esta API.

## Configuração privada

Na Vercel, configurar `NUVEMSHOP_STORE_ID` e `NUVEMSHOP_ACCESS_TOKEN` em Production e, quando autorizado, nos ambientes de teste. Usar aplicativo sob medida com apenas `read_products` (inclui categorias); não pedir clientes, pedidos, pagamentos ou escrita. Não colocar token no código, Git, chat, URL ou variáveis `NEXT_PUBLIC_*`. A URL pública `NEXT_PUBLIC_NUVEMSHOP_URL` deve ser a loja correta e precisa de rebuild se alterada.

A homepage recebe apenas um booleano indicando a ativação, nunca o token. O módulo de acesso tem barreira `server-only`. `GET /api/catalogo` é um endpoint público com projeção explícita dos campos seguros; ele não aceita URL de origem, ID de outra loja ou token pela requisição do visitante.

## Leitura e proteção

- Admin API 2025-03: somente GET em `/products` e `/categories`, com HTTPS, host fixo e cabeçalho Authorization Bearer. Redirecionamentos são recusados.
- Busca de produtos com `published=true` e nova conferência de `visibility=visible` (compatibilidade com published legado). Ocultos e não listados não são enviados ao visitante.
- Paginação de até dez páginas de 200 produtos e categorias. Se o limite do lote for atingido, a interface informa que a vitrine é parcial e aponta para o catálogo completo. O carregamento visual começa com 12 produtos e permite mostrar mais.
- Respostas brutas não são persistidas: somente a projeção pública é armazenada no Data Cache por 60 segundos. A chave usa uma impressão criptográfica do token, não o token. Renovar a chave gera outro cache.
- Revalidação pode servir o último resultado enquanto atualiza. Resultados com mais de cinco minutos são recusados pelo servidor. A resposta HTTP do endpoint não é armazenada pelo navegador/CDN. A aba aberta consulta novamente a cada minuto, somente quando visível, e ao voltar ao foco.
- Token, custo, SKU, quantidade de estoque, HTML de descrição e demais campos internos não são devolvidos. Os logs têm apenas códigos fixos, sem corpos de erro ou credenciais.
- Timeout por chamada de até oito segundos e janela total de 22 segundos; falhas de autorização, limite ou rede retornam estado indisponível, sem quebrar a homepage.
- Somente imagens HTTPS dos CDNs permitidos da Nuvemshop são utilizadas. Imagem ausente ou com falha mostra espaço neutro, sem foto inventada.

## Preço e categorias

Preços exibidos em reais, adequados à loja brasileira Agylli. Usa-se o preço promocional quando válido e menor que o preço regular. Entre variações, a vitrine considera as não esgotadas, quando o estoque permite determinar isso, e mostra “A partir de” se os valores variam. Preço nulo não vira zero; desconto global não é inferido entre opções diferentes. A decisão final de valor/disponibilidade é da loja no momento da compra. Não são consultadas tabelas B2B nem preços privados.

Os filtros vêm das categorias reais usadas pelos produtos publicados, incluindo ancestrais visíveis. Os quatro cards institucionais usam aliases de nomes exatos de categoria (pele/cuidados com a pele, cabelos/capilar, perfumes/perfumaria, maquiagem/makeup). Não se classifica um produto por adivinhação do nome. Se as categorias ainda não estiverem organizadas na Nuvemshop, o produto aparece em Todos e os filtros devem ser ajustados no painel da loja. Categorias ocultas não são apresentadas.

## Estados e diagnóstico

Sem credenciais, o ambiente local/CI mantém a seleção ilustrativa claramente identificada. Com conexão configurada, o HTML inicial mostra carregamento e o navegador solicita o catálogo. Loja vazia mostra estado vazio; falha mostra orientação para acessar a loja, sem substituir por preços ou produtos fictícios. Se uma atualização falhar depois de carregar, os valores antigos são retirados da vitrine.

Diagnóstico público em `/api/catalogo`: `ready`, `not_configured` ou `unavailable`. Em falhas, apenas códigos fixos como `authorization`, `configuration`, `rate_limit`, `pagination`, `response` e `stale`; nunca o token. `authorization` exige conferir token, loja e permissão no ambiente correto da Vercel. Alterar as variáveis exige novo deployment. Não revelar valores ao registrar evidências.

## Validação

Testes unitários cobrem sanitização, não exposição de custos/tokens, publicação, preços nulos/promoções/variações, categorias, imagens seguras, GET fixo, paginação e falha de autorização. E2E com catálogo FICTÍCIO interceptado no navegador cobrem renderização, preço, filtro, URL por produto, catálogo vazio e retirada de valores após falha. Esses fixtures não são produtos reais e não são usados na produção.

A integração real somente é considerada validada depois de conferir `/api/catalogo` em produção, fotos e URLs da loja, sem ler ou copiar o segredo da Vercel. CI sem credenciais valida os caminhos simulados, não a autenticação real. SysAla continua exclusivamente por CSV manual; esta integração não modifica a conciliação.

Fontes oficiais consultadas em 12/11/2026:

- https://nuvemshop.dev/api/getting-started
- https://nuvemshop.dev/docs-api/authentication
- https://tiendanube.github.io/api-documentation/resources/product
- https://tiendanube.github.io/api-documentation/resources/product-variant
- https://tiendanube.github.io/api-documentation/resources/category
