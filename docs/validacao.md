# Validação — Agylli Cosméticos

## Etapa 2 — consolidação e preparação comercial

Em 5 de novembro de 2026, passaram `npm run lint` (sem erros/avisos), `npm test` (14 testes unitários), `npm run build`, `npm run typecheck` e `npm run test:e2e` (33 testes). Foram mantidas as seis rotas e a identidade aprovada. Os testes de navegador cobrem 375, 768 e 1440 px, imagens carregadas, acessibilidade axe sem violações detectadas, fluxos provisórios, novo bloco de cadastro, contatos, categorias, menu, teclado, 404 e auditoria de links internos/âncoras.

Os três testes novos de configuração verificam ausência de URLs, ativação independente do varejo e leitura das três variáveis, incluindo caminho/query/fragmento de B2B. Usam domínios `.example` apenas dentro dos testes e não conectam uma loja real. Os 18 screenshots foram atualizados com a interface da Etapa 2.

Os quatro modelos CSV foram lidos e conferidos: cabeçalhos únicos, sem linhas de produtos, preços ou campanhas. O guia deixa explícito que o formato precisa ser mapeado ao importador oficial da loja. Não houve importação comercial ou teste de pedido real. O plano de medição é documentação: nenhuma tag ou conta foi ativada.

A conferência de Git/CI e os resultados finais de publicação devem ser associados ao commit enviado, conforme [consolidação](consolidacao-etapa2.md). O histórico de validação da Etapa 1 está preservado abaixo. Não houve atualização de dependências ou alteração de checkout, banco de clientes ou estoque.


## Contatos, área de atuação e ícones decorativos

A atualização foi publicada com autorização em https://agylli.vercel.app/. Deployment `dpl_G5yx73fxJjV9SRS7BCReZfgsFMAv`, URL desta versão https://agylli-n9gfab2do-agylli.vercel.app. A resposta do deploy e a consulta independente `vercel inspect` confirmaram `production`, estado `READY` e os aliases permanentes. Os testes funcionais foram executados localmente; o bloqueio de proxy ao hostname público continua sendo o limite registrado abaixo. Não houve push ao GitHub, alteração de DNS ou nova publicação do ambiente Codex.

Em 5 de novembro de 2026, os contatos fornecidos pelo usuário foram conferidos na página oficial de atendimento. Foram adicionados WhatsApp, telefone, central 0800 e endereços das unidades de Cândido Sales e Ipatinga à página de contato e ao rodapé. A nova rota `/onde-atuamos` apresenta as duas regiões, o mapa institucional original e os mesmos canais. A orientação de cadastro B2B agora permite conversar com as equipes sem coletar documentos ou simular envio de cadastro.

O ícone não veio identificado na mensagem. Após a pergunta de esclarecimento, foi comunicada a interpretação de estrelas/asteriscos decorativos: Asterisk, Sparkle e Sparkles foram removidos de todas as páginas, incluindo o selo do hero. A logo original e os controles de navegação foram preservados. O usuário confirmou posteriormente que queria remover estrelas e asteriscos decorativos, correspondendo à alteração publicada.

Passaram `npm run lint` (sem erros/avisos), 11 testes unitários, build de produção, TypeScript e 30 testes E2E. Os testes cobrem as seis rotas em 375, 768 e 1440 px, navegação, imagens, filtros, fallbacks, contatos por unidade e ausência dos ícones removidos. Nenhuma violação foi detectada pelo axe WCAG A/AA nas páginas testadas. As 18 capturas foram atualizadas; contato no celular e a área de atuação no computador foram inspecionados visualmente. Os testes verificam os destinos dos links; não enviam mensagens nem fazem ligações.

O primeiro build foi interrompido porque o compilador de CSS tentou abrir uma porta restrita pelo sandbox. O cache reteve esse erro na tentativa seguinte; a remoção apenas dos caches gerados e a execução autorizada fora dessa restrição permitiram concluir o build. Nenhuma checagem foi desativada e nenhum segredo foi adicionado.

- [Contato no celular](screenshots/contato-375.png)
- [Onde atuamos no computador](screenshots/onde-atuamos-1440.png)
- [Onde atuamos no celular](screenshots/onde-atuamos-375.png)


## Publicação permanente inicial na Vercel

Em 5 de novembro de 2026, após o usuário autorizar a conexão oficial da CLI com a conta `agylli`, a versão atual foi publicada no projeto `agylli`, no espaço de trabalho Agylli. O deployment `dpl_CjVYXb9AoURbTLKJyzjsL7KVS8Ke` foi concluído com `readyState: READY`, `target: production` e domínio de produção **https://agylli.vercel.app/**. O endereço permanente substitui a publicação temporária anterior.

Antes do deploy, passaram novamente lint, 11 testes unitários, build, TypeScript e 24 testes de navegador. O lint foi ajustado para ignorar `.vercel/**`, que contém código gerado. Um erro interno do Turbopack após a restauração do snapshot foi resolvido removendo somente `.next/cache` e `.vercel/output` e refazendo o build; o código da aplicação não foi modificado para contornar testes.

A consulta à URL pública pelo ambiente retornou bloqueio do proxy (`CONNECT tunnel failed, response 403`), antes de alcançar a aplicação. O estado de produção foi confirmado pela Vercel; não há confirmação de HTTP 200 externo a partir desta máquina. Não houve novo push ao GitHub nesta publicação.

## Revisão com fontes oficiais e identidade Agylli

Após a publicação do ambiente pelo usuário, os oito links oficiais indicados passaram a responder HTTP 200. A revisão local usa a logo original no cabeçalho/rodapé, símbolo original como favicon e paleta bordô/preto baseada no CSS Agylli. A história foi conferida na página oficial, e as orientações de cadastro das imagens de revendedores foram incorporadas com indicação de vigência a confirmar.

Os quatro produtos fictícios foram substituídos por fotografias reais e nomes dos catálogos Suave Fragrance e D’Bianco; a Facinatus aparece com sua logo original publicada pela Agylli. A seleção permanece ilustrativa, sem preços ou estoque. O CDN específico de fotos Facinatus retornou 403; esse bloqueio não foi contornado. A foto de Sobre vem do site oficial da Agylli.

Na revisão, passaram lint, build, TypeScript, 11 testes unitários e 24 testes E2E, incluindo cinco páginas em 375, 768 e 1440 px, imagens carregadas, filtros, navegação, fallback comercial e axe sem violações detectadas. Os testes de filtro foram atualizados para os nomes reais da seleção. As capturas foram atualizadas para esta identidade.

Esta revisão não foi enviada ao GitHub e não realizou deploy, publicação do ambiente ou alterações de configuração. Não houve execução remota de CI para essas mudanças. A escala de leitura ampliada foi preservada.

Os registros abaixo documentam as etapas anteriores.

Executada em 5 de novembro de 2026, no checkout `/workspace/Agylli`, sem credenciais de Supabase, URLs comerciais ou contatos reais.

| Verificação | Resultado |
| --- | --- |
| Instalação reproduzível `npm ci` | Passou; lockfile preservado |
| `npm run lint` | Passou, 0 erros e 0 avisos |
| `npm test` | 11 testes passaram em 2 arquivos |
| `npm run build` | Passou; 5 páginas, 404 e endpoints de SEO gerados |
| `npm run typecheck` | Passou |
| `npm run test:e2e` | 24 testes passaram, sem testes pulados |
| axe WCAG A/AA | Nenhuma violação detectada nas 5 páginas × 3 larguras |
| Layout | 375, 768 e 1440 px, sem overflow horizontal e com todas as imagens carregadas |
| Produção local | Inicialização e encerramento pelo Playwright, respostas e fluxos funcionais verificados |
| Desenvolvimento local | Homepage HTTP 200, navegação até atacado e contato de revenda, sem erros de execução da página |
| Grafo de dependências ESLint | `npm ls eslint` válido, ESLint 10 e plugins compatíveis |

## Comportamentos exercitados

- Varejo leva a `/loja-em-breve` sem URL configurada.
- Atacado leva a `/atacado`, e a solicitação de acesso leva a `/contato?assunto=revenda`.
- Contato explica o estado de preparação, sem formulário ou falsa confirmação de envio.
- Categorias e filtros funcionam, inclusive com voltar/avançar do navegador.
- Menu móvel abre/fecha, Escape retorna foco ao botão, e o skip link funciona por teclado.
- FAQ usa expansão nativa acessível; páginas inexistentes retornam 404.
- URLs inválidas/inseguras são rejeitadas nos testes unitários; valores HTTPS configurados são preservados.
- Supabase ausente ou com chave não publicável retorna `null`, sem dependência para renderização.

Foram corrigidos durante a validação um caractere XML inválido na ilustração de maquiagem, contraste de texto no bloco de revenda, espaçamento de título e escala do elemento decorativo no celular. Os testes finais cobrem essas correções. A origem loopback `127.0.0.1` foi explicitamente autorizada apenas para recursos do servidor de desenvolvimento, mantendo o bloqueio de outras origens.

## Capturas

As 15 capturas em `docs/screenshots/` foram geradas pelo Chromium na execução final dos E2E. Incluem as cinco páginas nas três larguras, com fontes e imagens carregadas.

- [Homepage desktop](screenshots/home-1440.png)
- [Homepage tablet](screenshots/home-768.png)
- [Homepage celular](screenshots/home-375.png)
- [Atacado desktop](screenshots/atacado-1440.png)
- [Atacado celular](screenshots/atacado-375.png)
- [Sobre](screenshots/sobre-1440.png)
- [Contato](screenshots/contato-1440.png)
- [Loja em preparação](screenshots/loja-em-breve-1440.png)

## Revisão de legibilidade

Depois do pedido de fontes maiores, a escala de texto foi ampliada: corpo em 16 px, auxiliares e botões em 14 px, legendas informativas com mínimo de 12 px, nomes dos produtos/categorias em 20 px e perguntas do FAQ em 18 px. Foram ajustados o breakpoint do menu e a quebra dos botões para preservar os rótulos. A marca textual e o selo decorativo conservam proporções próprias.

Lint, build, TypeScript, os 11 testes unitários e os 24 testes de navegador passaram novamente após essa revisão. As 15 capturas foram atualizadas e os layouts de celular e tablet também foram inspecionados visualmente. A leitura dos sites de identidade, história, revendedores e marcas permanece bloqueada pela rede. O usuário forneceu diretamente conteúdo institucional e comercial, incorporado a “Sobre” e “Atacado”, com procedência em `docs/conteudo-institucional-recebido.md`.

## Limites e estado externo

- Na validação inicial, não houve push, criação/renomeação de repositório remoto, execução do GitHub Actions remoto, deploy Vercel ou publicação de produção. Posteriormente, o usuário autorizou o envio ao repositório existente `Agylli/Agylli`, na branch `main`; o envio foi realizado e o commit remoto conferido. O resultado do CI remoto deve ser acompanhado separadamente na aba Actions. O usuário também autorizou o deploy, ainda bloqueado por ausência de autenticação Vercel e acesso à sua API, conforme `docs/deploy.md`.
- Não houve conexão real a Supabase, Nuvemshop, SysAla, Mercado Livre ou Shopee. O teste de destinos configurados é unitário; a jornada comercial real deve ser validada com URLs oficiais.
- Não foi feita medição de Core Web Vitals em produção nem testes em dispositivos físicos, Safari ou Firefox. Axe e Chromium não substituem auditoria manual completa de acessibilidade.
- O acesso à referência Sallve foi bloqueado pela política de rede. Nenhum texto ou ativo desse site foi copiado.
- `install_script` e `start_skill` foram persistidos no rascunho do ambiente. Eles não publicam nem aplicam alterações de infraestrutura automaticamente. A restauração em uma nova tarefa ainda não foi testada; revisar/salvar e publicar o ambiente são ações separadas no produto.
