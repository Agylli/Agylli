# Experiência dark, entradas e contato — 10/11/2026

As seções de experiência e atendimento da homepage agora compartilham a estética dark: fundo carvão, brilho bordô, bordas discretas, textos claros e ícones em coral. O botão principal abre o WhatsApp oficial; o link de atendimento continua disponível.

A hero recebeu um fundo original em CSS inspirado na referência de dobras claras enviada pelo usuário: gradientes cônicos suaves com máscara radial clara. O efeito é decorativo, estático, sem imagem externa, preservando legibilidade, cores e a composição aprovada. Não houve geração ou alteração de fotos.

Atualização expressa da Agylli: existe somente a unidade de Cândido Sales · BA, na Rua Rio Pardo, 75 — Célio Alves, com WhatsApp (77) 98854-9691 (`https://wa.me/5577988549691`). Ipatinga e os telefones anteriores foram retirados da interface, metadados e orientações de cadastro. O mapa antigo, que apresenta duas unidades, não é mais renderizado; seu arquivo permanece apenas como ativo histórico. A página de atuação mostra endereço e busca no mapa, sem coordenadas ou cobertura presumidas.

`ScrollReveal` aplica entradas às seções principais das páginas com IntersectionObserver e Web Animations, alternando deslocamentos de 28 px de baixo, da esquerda e da direita. Cada seção entra uma vez por navegação, com duração de 620 ms. Sem dependência adicional, sem listeners de rolagem e sem alterar o layout. O observador acompanha novos blocos renderizados pelo Suspense.

O HTML nasce visível: sem JavaScript, sem suporte ao observador ou com movimento reduzido, o conteúdo permanece disponível. A mudança da preferência cancela animações e revela seções; foco de teclado também revela imediatamente a seção. Navegação e rodapé permanecem estáveis, sem deslocamento animado. Mudanças de rota reinicializam o observador e limpam os efeitos anteriores.

Testes: contato único, retirada de telefones e da unidade anterior, filtros e navegação existentes, três sentidos de entrada, preferência reduzida e conteúdo com JavaScript desabilitado. Validar 375, 768 e 1440 px, acessibilidade, ausência de rolagem horizontal e WhatsApp. Documentos antigos de implantação continuam como histórico e não substituem os contatos atualizados em `src/config/locations.ts`.
