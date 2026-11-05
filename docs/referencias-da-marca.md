# Referências oficiais e revisão de identidade

## Fontes consultadas

Em 5 de novembro de 2026, após o usuário publicar o ambiente com a liberação de rede, os oito links fornecidos responderam HTTP 200:

- Identidade: https://www.agylli.com.br/
- História: https://www.agylli.com.br/historia/
- Revendedores: https://www.agylli.com.br/revendedores/
- Vantagens: https://www.agylli.com.br/revendedores/img/vantagens2.png
- Passos: https://www.agylli.com.br/revendedores/img/passos2.png
- Facinatus: https://facinatus.com.br/
- Suave Fragrance: https://catalogo.suavefragrance.com.br/?v=SUAVEZAP_KILL_FRAGRANCE_OLD_ENGINE_SAFE_20260618#page/1
- D’Bianco: https://dbianco.com.br/collections/profissional

Os bloqueios registrados na revisão anterior foram resolvidos para esses endereços. A consulta foi realizada pelo proxy configurado, mantendo TLS verificado. Não foram modificadas configurações de rede nesta revisão.

## Identidade incorporada

A logo original foi obtida do tema do site Agylli e reutilizada sem redesenho ou recoloração no cabeçalho e no rodapé. O símbolo original foi usado como favicon. O CSS oficial (`/wp-content/themes/agylli/css/style.css?v=4.6`) define bordô `#a92d30`, bordô escuro `#8d191b` e preto `#282828`, usados na nova paleta. Os fundos claros e neutros de apoio foram adaptados para a interface, sem alegar que são uma especificação completa de manual da marca.

## História e revendedores

A história foi conferida e adaptada a partir da página oficial: origem na venda direta, primeiro escritório comercial conectando indústria fornecedora e interessados em revenda, desenvolvimento da rede com diversidade, capacitação e suporte. Não foram criados nomes de fundadores, datas exatas ou marcos históricos ausentes da fonte. O novo capítulo digital corresponde ao projeto atual solicitado pelo usuário.

A página de revendedores confirmou o portfólio de mais de 600 itens, treinamento, publicidade, materiais de apoio, frete e descontos a partir de 30%. A imagem de passos também informa maioridade/emancipação, RG, CPF, comprovante de residência, visita de supervisor, assinatura de contrato e kit de trabalho. Essas orientações são apresentadas como publicadas na página existente, com consulta sobre aplicação e vigência no novo B2B. Nenhum documento é coletado pelo site.

A imagem de vantagens contém uma sugestão de renda mensal. Esse valor não foi incorporado nem transformado em promessa de rendimento. Desconto e margem de lucro continuam distintos. A revisão anterior, com texto fornecido diretamente pelo usuário, está registrada em `conteudo-institucional-recebido.md`.

## Fotografias e marcas

A homepage usa fotografias reais de Suave Fragrance e D’Bianco, além das logos de Facinatus, Suave Fragrance e D’Bianco. A página Sobre usa a foto da loja publicada pela Agylli. Os nomes fictícios e as embalagens sintéticas foram substituídos por uma seleção ilustrativa com nomes reais, sem preços ou indicação de estoque. URLs de origem: `public/images/README.md`.

O CDN de fotos de produto da Facinatus retornou 403. Foi usada a logo da marca publicada no site Agylli, sem alterar o rascunho de rede nem contornar o bloqueio.

## Legibilidade e escopo

Foram preservados corpo de 16 px, auxiliares e botões de 14 px, legendas informativas de pelo menos 12 px, títulos de produtos de 20 px e FAQ de 18 px. O menu móvel aparece até 980 px e os botões quebram em linhas próprias quando necessário.

A revisão de identidade foi inicialmente mantida local. Posteriormente, o usuário autorizou o deploy e conectou sua conta Vercel: a versão está em produção em https://agylli.vercel.app/. Não houve novo push ao GitHub nem atualização do rascunho de ambiente para essa publicação. Evidências e instruções estão em `deploy.md` e `validacao.md`.

## Contatos e área de atuação

A página https://www.agylli.com.br/fale-conosco/ e a página https://www.agylli.com.br/ondeatuamos/ responderam HTTP 200. Os contatos confirmam os dados fornecidos pelo usuário: Cândido Sales, Rua Rio Pardo, 75 — Célio Alves, WhatsApp (77) 98854-9691 e telefone (77) 3438-2030; Ipatinga, Campo Grande, 690 A — Caravelas, central 0800 283 1787 e WhatsApp (31) 99390-2031.

A área de atuação é apresentada na fonte como imagem: regiões de Vitória da Conquista/BA e do Vale do Aço/MG. O mapa original foi convertido para WebP e acompanhado de conteúdo HTML legível. Não foi inferida cobertura nacional a partir da silhueta do Brasil. O atendimento a cada localidade e as condições de entrega devem ser consultados com a unidade. O site agora apresenta esses contatos em `/contato`, `/onde-atuamos` e no rodapé, com links de WhatsApp, telefone e busca de endereço no Google Maps. Não foram encontrados e-mail ou horários confirmados na página consultada; não foram inventados.

## Elementos decorativos

Como o ícone não veio identificado inicialmente, foi adotada e comunicada a interpretação de estrelas e asteriscos decorativos, confirmada posteriormente pelo usuário. Os componentes Asterisk, Sparkle e Sparkles foram removidos de todas as páginas, incluindo introduções, banners, rodapé e loja em preparação. O selo decorativo do hero também foi retirado. A navegação e a logo original foram preservadas. Os E2E verificam a ausência desses ícones nas seis rotas.
