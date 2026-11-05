# Relatório — Etapa 3: preparação para ativação comercial

Atualização definitiva posterior: SysAla permite somente CSV manual, sem API/webhooks/sincronização automática. Seguir a [revisão de arquitetura](arquitetura.md) e a [conciliação manual](conciliacao-manual.md).

Data: 5 de novembro de 2026. Base recebida: `24e6555`, com a Etapa 2 sincronizada. A revisão inicial confirmou `main` local/remota sem divergência e checkout limpo.

## Resultado efetivo

**Preparação operacional entregue; ativação e homologação comercial permanecem pendentes.** Não foram fornecidos URLs da loja/B2B, produtos reais, modelo oficial de importação ou acesso/autorização para configurar a Nuvemshop e executar pagamentos. A existência da loja e o recurso B2B contratado ainda precisam ser confirmados pela Agylli.

| Frente | O que foi preparado | Estado comercial |
| --- | --- | --- |
| Nuvemshop | Matriz de configuração de varejo, atacado, CPF/CNPJ, aprovação, Pix, cartão, frete e pedidos | Aguardando loja/acesso autorizado e definições |
| Catálogo piloto | Processo reutilizando os quatro modelos existentes; dez posições vazias de validação e mapeamento de 24 campos | Sem dados reais; nenhum produto importado |
| Formato oficial | Registro da fonte a consultar e critérios de confirmação do modelo da loja | Consulta bloqueada pelo proxy; formato ainda não verificado e arquivo definitivo não gerado |
| Compra | 16 cenários de varejo, incluindo os nove passos pedidos, falhas e conciliação | Todos `nao_executado` na Nuvemshop |
| Revendedores | 13 cenários de cadastro CPF/CNPJ, pendência, aprovação, tabela, perfis e revogação | Todos `nao_executado` na Nuvemshop |
| Primeira venda | Checklist de liberação, acompanhamento e sequência após aceite | Não liberada/registrada por esta tarefa |
| Integrações futuras | Plano atualizado de SysAla, Mercado Livre e Shopee com responsabilidades e consistência dos dados | Nenhum serviço ou conta conectado |

A interface, cores, fontes, logos, fotos, seis páginas, arquitetura e variáveis foram preservadas. Não houve alteração em `src/`, `public/`, dependências ou `.env.example`. Nenhum checkout, sistema de clientes ou estoque paralelo foi desenvolvido.

## Arquivos preparados e atualizados

- [ativacao-comercial.md](ativacao-comercial.md): plano operacional e dependências.
- [homologacao-comercial.md](homologacao-comercial.md): roteiros de varejo e revendedores, autorização de testes e critérios de aceite.
- [primeira-venda.md](primeira-venda.md): checklist de liberação e acompanhamento da venda.
- [modelos/README.md](modelos/README.md): instruções dos quatro modelos originais e dos quatro controles novos.
- [validacao-piloto.csv](modelos/validacao-piloto.csv): P01–P10 são posições de controle, sem produtos ou SKUs inventados.
- [mapeamento-importacao-nuvemshop.csv](modelos/mapeamento-importacao-nuvemshop.csv): colunas oficiais vazias, aguardando comprovação.
- [homologacao-varejo.csv](modelos/homologacao-varejo.csv) e [homologacao-revenda.csv](modelos/homologacao-revenda.csv): casos e resultados esperados; nenhum sucesso comercial previamente preenchido.
- README, Nuvemshop, catálogo, implantação, integrações, roadmap e registro de validação atualizados.

Os quatro CSVs da Etapa 2 continuam apenas com cabeçalhos, sem edição de dados comerciais. Cópias de trabalho dos oito CSVs foram preparadas em `dados-comerciais/etapa3/`, preservando arquivos existentes. O diretório está ignorado no Git e no deploy; dados preenchidos e evidências devem permanecer privados.

## Resultado dos testes executados

| Verificação local | Resultado |
| --- | --- |
| ESLint | Passou, sem erros/avisos |
| Testes unitários | 14 passaram |
| Build de produção | Passou |
| TypeScript | Passou |
| Playwright | 33 passaram, cobrindo 375, 768 e 1440 px |
| Acessibilidade automatizada | Sem violações axe detectadas nas páginas testadas |
| Navegação e alternativas | CTAs, menu, filtros, contatos, links internos e âncoras funcionais; varejo em breve e contato de revenda mantidos |
| Modelos operacionais | CSVs legíveis, cabeçalhos únicos e linhas consistentes; cenários comerciais não executados e mapeamento oficial vazio |

Esses testes validam o site institucional e os arquivos preparados. Não comprovam importação, cálculo de frete, compra, liquidação, estorno ou aprovação B2B na Nuvemshop. Não foi medido resultado de primeira venda ou conversão comercial.

## Dependências e orientações de ativação

1. Agylli confirma se já tem loja, sua URL pública, o responsável autorizado e o plano/recurso B2B.
2. Obter o modelo oficial do importador no painel/documentação vigente; conferir cabeçalhos, unidades, variações, imagens e atualização por identificador. A tentativa de consultar `https://atendimento.nuvemshop.com.br/` retornou `CONNECT tunnel failed, response 403`, sem HTTP da origem. Não contornar a política de rede nem usar formato presumido.
3. Fornecer aproximadamente 10 produtos reais, SKUs e GTINs aplicáveis, descrições, marcas/categorias, fotos autorizadas, preços e regras de atacado aprovados, peso/dimensões de envio e disponibilidade de origem.
4. Definir provedor de Pix/cartão, origem/serviços de entrega, regras de pedidos e responsáveis. Configuração da loja e qualquer cobrança/Pix, cancelamento ou estorno exigem a autorização aplicável; não foram realizados nesta preparação.
5. Depois de receber URLs oficiais e autorização, aplicar em Preview: `NEXT_PUBLIC_NUVEMSHOP_URL`, `NEXT_PUBLIC_NUVEMSHOP_B2B_URL` e origem institucional aprovada em `NEXT_PUBLIC_SITE_URL`. Fazer novo build, executar os roteiros e aplicar Production somente após aceite. Sem valores, alternativas e `noindex` continuam funcionando.
6. Registrar aceite comercial, liberar o varejo e acompanhar a primeira venda conforme o [checklist](primeira-venda.md). Liberar a revenda com seu aceite próprio, sem expor tabelas privadas antes da aprovação.

Depois da homologação: ampliar catálogo em lotes, acompanhar pedidos/pagamentos/frete/disponibilidade, aprovar mensuração com consentimento e só então evoluir integrações de gestão/marketplaces. O planejamento está em [integrações](integracoes.md); não houve criação de conta ou configuração externa comercial.
