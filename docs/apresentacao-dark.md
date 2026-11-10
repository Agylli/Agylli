# Apresentação dark e faixa em movimento

A seção `#universo` mantém os textos e o destino `/sobre`, agora com fundo carvão, brilho bordô discreto e contraste claro. A mudança está isolada em `src/components/marketing/brand-intro.module.css`; hero, cabeçalho, rodapé e demais páginas não foram redesenhados.

`BrandIntro` é renderizado no servidor. `BrandRibbon` usa interatividade somente para pausar/retomar a animação CSS da faixa rosa. O conteúdo é duplicado visualmente para permitir uma volta contínua; a cópia é ocultada das tecnologias assistivas. Há pausa por botão, hover em mouse e foco dentro da faixa. Com `prefers-reduced-motion`, a faixa fica estática, mostra todas as mensagens sem corte e oculta o controle desnecessário.

Verificar em 375, 768 e 1440 px: contraste, ausência de rolagem horizontal, link da história, pausa/retomada e mensagens com movimento reduzido. Os casos funcionais estão em `tests/e2e/brand-intro.spec.ts`.

Nenhuma dependência, URL comercial, dado de produto, checkout, analytics ou integração foi adicionada nesta mudança.
