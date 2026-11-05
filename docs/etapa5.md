# Etapa 5 — consolidação e preparação da homologação comercial

Data de referência: 5 de novembro de 2026, Bahia (UTC−03).

## Estado do código e comparação

A inspeção inicial encontrou checkout limpo, branch `main` em `a40552a0a24dff71e1d0abdf19a5f02569a1a09a`, um commit à frente de `origin/main` e nenhum atrás. O fetch confirmou o remoto em `386fb83e6a92e741fdaef8de6d550cc7c6bd996e`; não houve divergência de histórico.

O commit `a40552a` foi revisado: 37 arquivos com utilitário local, testes fictícios, documentação e exclusões de publicação. A ferramenta e a identidade do site foram preservadas. Esta consolidação acrescenta gate de pacote público, testes de não exposição, mapeamento de arquivos reais e plano operacional; não reimplementa catálogo, checkout, clientes ou funções comerciais da Nuvemshop.

O lote de sincronização contém `a40552a` e o novo commit local de consolidação, identificável por `git log`. **Não houve push desta entrega.** O envio precisa de autorização válida do lote e nova conferência do remoto. Nenhuma importação, alteração de saldo ou operação financeira foi executada.

## Auditoria de publicação

| Verificação | Resultado |
| --- | --- |
| Arquivos em `dados-comerciais/`, `.vercel/`, caches e relatórios de execução | Não versionados |
| Ambiente | Somente `.env.example` vazio está versionado; nenhuma credencial identificada no lote revisado |
| Modelos originais de produtos, custos, atacado e UTM | Apenas cabeçalhos, sem dados comerciais preenchidos |
| Outros CSVs | Controles/roteiros sem dados reais e fixtures explicitamente fictícios |
| Utilitário administrativo | Fora de `src/` e `public/`, excluído por `.vercelignore` e `outputFileTracingExcludes` |
| Pacote construído | 13 traces sem referências ao utilitário ou à pasta privada |
| Caminhos administrativos no servidor local | 404 para código/configuração da ferramenta e para caminho de arquivo comercial |

Os relatórios privados de auditoria desta etapa ficam em `dados-comerciais/etapa5/`, fora do Git. A revisão cobriu os arquivos presentes no lote; antes de cada envio, repetir a conferência caso algo seja preenchido/alterado. Modelos públicos não devem receber custos, preços restritos ou dados reais.

A listagem da Vercel confirmou que o último deployment de produção continuava `READY`, no commit remoto `386fb83`, URL imutável `https://agylli-7un93dacc-agylli.vercel.app`. Não houve publicação administrativa nesta etapa. O acesso HTTP direto ao hostname público não foi revalidado por este ambiente.

## Testes executados e barreiras acrescentadas

| Verificação local | Resultado |
| --- | --- |
| `npm run test:conciliacao` | 45 testes passaram: os 40 existentes mais cinco testes do gate de pacote |
| `npm test` | 14 testes unitários do site passaram |
| `npm run test:e2e` | 36 testes passaram, incluindo os três projetos de largura e a recusa de caminhos privados |
| `npm run lint` | Passou, sem erros/avisos |
| `npm run build` e `npm run typecheck` | Passaram |
| `npm run check:public-build` | Passou; 13 traces conferidos |

Total: **95 testes locais**, sem simular compra ou aprovação B2B real. O workflow recebeu o gate pós-build para impedir publicação de referências administrativas/comerciais. O novo CI remoto ainda depende do push autorizado; não foi declarado aprovado com base em uma execução de outro commit.

O gate recusa build sem traces, traces malformados, referências a ferramentas/dados privados, rotas desses caminhos e arquivos Python/CSV/ambiente ou symlinks em `public/`. As funções `simular`, `revisar` e `exportar` continuam offline, com aprovação humana, consideração de pedidos pendentes/reservas e modelo oficial obrigatório. Nenhum layout de origem ou saída real foi presumido.

## Arquivos preparados

- [Implantação comercial](implantacao-comercial-etapa5.md): sequência de 14 etapas com responsáveis, pré-requisitos, aceite e caminho da primeira compra.
- [Mapeamento real](mapeamento-csv-reais.md): campos de SysAla, Nuvemshop, correspondência, alocações e saída oficial ainda a confirmar.
- [Checklist de execução](modelos/checklist-implantacao-etapa5.csv): etapas inicialmente não executadas e campos de responsáveis/evidências privados.
- [Registro de fontes Nuvemshop](modelos/fontes-nuvemshop-etapa5.csv): oito grupos de recursos aguardando comprovação atual.
- [Recebimento de arquivos](modelos/recebimento-arquivos-etapa5.csv): modelo vazio para inventário privado das amostras.
- `tools/conciliacao/check_build.py` e testes: conferência do pacote público, somente local/CI.
- README, guia da ferramenta, implantação, modelos, roadmap e validação atualizados.

## Documentação Nuvemshop e limites da preparação

A central oficial `https://atendimento.nuvemshop.com.br/` segue bloqueada pelo proxy do ambiente (`CONNECT tunnel failed, response 403`, sem HTTP da origem). **Não foi possível comprovar recursos, plano ou passos específicos de painel na documentação atual.** Nenhum recurso foi rotulado como comprovado sem fonte e nenhum menu/aplicativo foi inventado.

As instruções práticas definem quais dados reunir, a ordem, os responsáveis e o que precisa ser validado. A parte específica de cadastro/tabelas/pagamentos/frete na loja precisa do guia oficial vigente e da disponibilidade efetiva no plano. Para concluir essa validação, liberar o domínio oficial no ambiente ou fornecer os documentos oficiais atuais pela operação. Não configurar a loja a partir de suposições.

## Dados e configurações pendentes

1. Loja existente, URL pública, plano/recurso B2B e acesso delegado/autorização de configuração.
2. Dez produtos reais e variações: SKU, GTIN aplicável, nomes, marca/categoria, descrição/imagens autorizadas, preços, logística e disponibilidade aprovada.
3. CSVs reais SysAla/Nuvemshop, modelo oficial atual de atualização de saldo, mapeamento de códigos se necessário e alocações/reservas/pedidos conferidos.
4. Regras B2B: CPF/CNPJ, documentos, aprovação, perfis, tabela, faixa, vigência, mínimo e condições comerciais.
5. Provedor Pix/cartão, habilitação e procedimento oficial, autorização específica para método/ambiente/valor do teste e cancelamento/estorno aplicável.
6. Origem de expedição, peso/dimensões, cobertura, serviços, CEPs de teste autorizados e custo/prazo a homologar.
7. Dados institucionais/políticas, responsáveis reais, janela de conciliação e autorização de liberação comercial.

As variáveis `NEXT_PUBLIC_NUVEMSHOP_URL`, `NEXT_PUBLIC_NUVEMSHOP_B2B_URL` e `NEXT_PUBLIC_SITE_URL` foram preservadas, sem novos valores inventados. Até a configuração aprovada, manter loja em breve, contato de revenda e `noindex`.

## Caminho para a primeira operação

Comprovar guias/recursos → confirmar loja e autorizações → aprovar e cadastrar piloto → conferir reserva/saldos pelo processo CSV → preparar pagamento/frete pelos procedimentos oficiais → configurar URLs em Preview → homologar a jornada de varejo e o cadastro/aceite B2B → obter aceite comercial → publicar as URLs aprovadas e acompanhar o primeiro pedido/pagamento reais. Varejo e B2B têm liberações separadas.

A compra autorizada segue: Agylli → CTA varejo → loja oficial → produto/variação → carrinho → frete → pagamento especificamente autorizado → confirmação/pedido → conciliação manual e atendimento. Uma autorização de push ou deploy não autoriza pagamento, importação, configuração de serviços ou alteração de saldo. O roteiro detalhado em [implantação](implantacao-comercial-etapa5.md) define o ponto de parada quando faltar uma dessas autorizações.

## Sincronização preparada, sem execução de push

Antes do envio autorizado: checkout limpo, comparação atualizada com `main`, revisão do intervalo completo e testes/gate aprovados. O push deverá ser normal e fast-forward, nunca forçado. Se o remoto avançar, integrar os commits sem sobrescrever trabalho e revalidar as mudanças relevantes.

A integração Git da Vercel publica `main` automaticamente; o utilitário precisa continuar excluído do runtime. Após o push autorizado, conferir CI do SHA exato e metadados do deployment, sem expor arquivos comerciais. Não realizar um deploy administrativo como parte dessa sincronização.
