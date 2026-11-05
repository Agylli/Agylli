# Referências oficiais fornecidas pelo usuário

## Identidade e conteúdo

- Identidade visual e logo: https://agylli.com.br/
- História: https://www.agylli.com.br/historia/
- Informações para revendedores: https://www.agylli.com.br/revendedores/

## Marcas indicadas para imagens ilustrativas

- Facinatus: https://facinatus.com.br/
- Suave Fragrance: https://catalogo.suavefragrance.com.br/?v=SUAVEZAP_KILL_FRAGRANCE_OLD_ENGINE_SAFE_20260618#page/1
- D'Bianco, linha profissional: https://dbianco.com.br/collections/profissional

As referências foram fornecidas pelo usuário para orientar a revisão. As requisições aos cinco endereços inicialmente fornecidos foram recusadas pelo proxy com HTTP 403 no estabelecimento do túnel, antes de alcançar os sites. O conteúdo da página adicional de revendedores também depende da liberação do mesmo domínio `www.agylli.com.br`. Isso não comprova indisponibilidade dos sites públicos.

Os domínios foram adicionados ao rascunho de rede, preservando o acesso já declarado para a API da Vercel. A gravação do rascunho não aplica a política à máquina atual. Após o usuário salvar/aplicar as configurações, tentar novamente as fontes e identificar eventuais CDNs necessários antes de baixar imagens.

O usuário enviou diretamente o texto institucional e de revendedores durante a revisão. Esse texto passou a ser a fonte das páginas “Sobre” e “Atacado”, incluindo atuação há mais de uma década, portfólio com mais de 600 itens, apoio aos revendedores, descontos a partir de 30% e a política de frete descrita. A procedência e os limites estão em `conteudo-institucional-recebido.md`. As condições vigentes continuam sujeitas à confirmação no canal comercial.

Logo, cores e fotografias das marcas não foram obtidas. A identidade e as ilustrações atuais permanecem provisórias; não recriar logotipos ou embalagens oficiais por aproximação. A página de história não foi lida: o texto de “Sobre” usa a apresentação institucional recebida, sem inventar datas de fundação, nomes ou marcos históricos.

## Revisão de legibilidade

Os tamanhos do texto foram ampliados, com tokens em `src/app/globals.css`: corpo `1rem` (16 px na configuração padrão), texto auxiliar `.875rem` (14 px) e legendas `.75rem` (12 px). Títulos de produtos e categorias usam 20 px; perguntas do FAQ usam 18 px. Os tamanhos acompanham a preferência de fonte do navegador por meio de unidades relativas.

O menu móvel aparece até 980 px, e os botões da seção principal passam a ocupar linhas próprias quando não há espaço para manter os rótulos legíveis. A marca textual provisória e o selo puramente decorativo mantêm suas proporções visuais; o selo não contém informação exclusiva e está oculto de tecnologias assistivas.
