# Validação — Etapa 1

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
