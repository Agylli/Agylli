# Composições de categoria e alternância de marcas

Os quatro links e filtros da homepage foram preservados. `categoryArtwork`, em `src/data/products.ts`, define a composição ilustrativa: Nomma/Natubelly para pele, shampoo e máscara Rescue+/D’Bianco para cabelos, Madelle/Suave Fragrance com Charme/D’Bianco para perfumes e Duo Glow/Facinatus para maquiagem. Fotos originais permanecem separadas dos fundos e bases decorativas em CSS. Fonte dos arquivos: `public/images/README.md`.

`PartnerLogos` alterna as cinco marcas por opacidade, em ciclo de 25 segundos: três posições no desktop/tablet e duas no celular. Não desloca a altura da seção. Controle de pausa/retomada e pausa ao passar o mouse sobre as logos. As cópias animadas são decorativas; uma lista única fornece os cinco nomes às tecnologias assistivas. Com movimento reduzido, a lista fica visível e estática com as cinco logos. Logos mantêm cores e proporções oficiais; Natubelly/Sofisticatto usam fundo escuro para preservar os arquivos claros originais.

Os arquivos de logo são carregados antecipadamente, sem preload, para evitar um espaço vazio durante a troca ou no modo estático; as fotografias de categoria continuam com carregamento lazy e tamanhos responsivos pelo Next Image.

Validar: 375, 768 e 1440 px; carregamento de todas as fotos/logos; filtros das categorias; pausa, retomada e lista estática; foco e ausência de rolagem horizontal. Testes em `tests/e2e/partner-logos.spec.ts`, além dos testes existentes de navegação e acessibilidade. Nenhuma alteração de preços, checkout, banco ou configuração comercial.
