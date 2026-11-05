# Plano de análise de resultados — sem rastreadores ativos

Esta etapa entrega a especificação de medição. **GA4, GTM, Google Ads e Meta Pixel não foram instalados ou ativados.** Não há IDs, cookies de publicidade, eventos de analytics ou coleta de cadastro acrescentados à aplicação.

## Arquitetura de medição

| Ferramenta | Finalidade futura | Configuração/decisão pendente |
| --- | --- | --- |
| Google Analytics 4 | Navegação, interesse nos públicos e funil entre site e loja | Conta/propriedade, responsáveis, ID de medição, domínios, retenção e consentimento |
| Google Tag Manager | Gerenciar tags/eventos aprovados e suas regras de consentimento | Container web, acessos, publicação/Preview e governança; não duplicar integrações nativas |
| Google Ads | Campanhas e conversões comerciais confirmadas | Conta, vinculação GA4/Ads, IDs/rótulos ou importação de conversão, regras e consentimento |
| Meta Pixel | Campanhas e eventos aprovados para Meta | Conta empresarial, Pixel, domínio, responsáveis, consentimento e eventual deduplicação com CAPI |

O site institucional está na Vercel; pedidos e checkout estarão na Nuvemshop. Confirmar os recursos nativos e o plano da loja antes de escolher tags manuais ou integrações oficiais. Definir um responsável pela medição e um inventário de tags nos dois ambientes. A mesma compra não pode ser enviada duas vezes por integração nativa, GTM e scripts manuais.

## Consentimento e privacidade antes da instalação

1. Aprovar finalidade, categorias, responsáveis, retenção, política e mecanismo de consentimento adequado à operação.
2. Oferecer escolha de medição e publicidade, com recusa acessível e possibilidade de rever a escolha. Navegação, links comerciais e atendimento funcionam sem aceitar rastreamento.
3. Adotar inicialmente bloqueio das tags opcionais até consentimento correspondente. Para Google, planejar o estado inicial negado de `analytics_storage`, `ad_storage`, `ad_user_data` e `ad_personalization`, com atualização somente após escolha válida. Não habilitar pings sem cookies ou modo avançado sem análise/aprovação específica.
4. Meta Pixel e eventuais eventos de servidor também obedecem às escolhas e à finalidade aprovada. Uma integração de servidor não elimina as exigências de privacidade.
5. Nunca colocar nome, e-mail, CPF, CNPJ, telefone, documentos ou identificadores pessoais em UTMs, URLs, nomes de eventos ou payloads de analytics. Recursos de publicidade avançada exigem avaliação separada; não são habilitados por padrão.

Não foi criada uma interface de consentimento fictícia nem campos de ambiente para ativar tags automaticamente. Os IDs serão configurados somente junto da implementação e validação aprovadas.

## Eventos e significado comercial

| Evento planejado | Origem e disparo | Conversão de venda? |
| --- | --- | --- |
| `page_view` | Navegação consentida; deduplicar mudanças de rota do App Router e coleta automática | Não |
| `commerce_outbound_click` | Clique real que sai do institucional para a URL Nuvemshop configurada, com consentimento | Não; intenção de acesso |
| `wholesale_interest` | Interesse na apresentação de atacado; opcional, separado do acesso ao cadastro | Não |
| `begin_checkout` | Entrada real no checkout da loja, pela integração disponível | Não; início de checkout |
| `purchase` | Compra concluída na Nuvemshop conforme critério financeiro/comercial aprovado | Sim, após validar a integração |
| `refund` | Estorno real associado ao pedido, se suportado pela integração escolhida | Ajuste comercial, não nova venda |

Payload planejado para `commerce_outbound_click`: `channel` (`retail` ou `wholesale`), `placement` (por exemplo `hero`, `header`, `footer`, `product_showcase`, `wholesale_access`), `destination_host` e `source_path` sem query pessoal. Sem `value`, `revenue` ou `transaction_id`. Seletores/atributos estáveis para esses pontos serão adicionados na implementação de medição; hoje não existe listener ou `dataLayer` de analytics no site.

O clique que abre `/loja-em-breve`, `/atacado` ou `/contato?assunto=revenda` é interno e **não deve disparar saída para Nuvemshop**. Cliques de WhatsApp, caso medidos futuramente, terão evento de contato separado. Não enviar um evento no carregamento do botão ou em prefetch; somente na interação real e sem atrasar/bloquear a navegação.

Não marcar o clique de saída como `purchase`, nem usá-lo como conversão primária de venda no Google Ads/Meta. Se for útil medir intenção como conversão secundária, nomear e reportar explicitamente como clique, separado da receita.

## Compra concluída na Nuvemshop

- O registro do pedido na loja/financeiro é a referência de resultado comercial. GA4 e plataformas de mídia refletem somente a cobertura permitida por consentimento e limitações de medição.
- Definir quando considerar a compra concluída: pedido criado, pagamento aprovado ou outro marco oficial escolhido pela operação. Confirmar em que marco a integração nativa dispara `purchase`. Não tratar pedido cancelado, pagamento recusado ou simples clique como venda paga.
- Usar identificador único do pedido em `transaction_id`, moeda BRL, valor real e itens reais da loja. Recarregar a página de confirmação não pode gerar receita duplicada. Conciliar pedidos de teste, cancelamentos e estornos.
- Escolher uma única estratégia principal para Google Ads: evento importado do GA4 ou tag de conversão aprovada, com deduplicação/reconciliação. Não contar as duas como vendas independentes.
- Se Pixel e Conversions API forem aprovados, usar o mesmo `event_name` e `event_id` para a mesma compra e verificar deduplicação. CAPI não foi implementada nesta etapa.
- Medir abandono com eventos reais da loja, quando disponíveis; um visitante que clicou para sair não é necessariamente alguém que iniciou checkout.

## Domínios e atribuição

Após receber os domínios reais, configurar medição entre domínios do institucional e da Nuvemshop, propriedade/ID compatíveis e lista de domínios autorizados. Confirmar se a integração da loja aceita a configuração, o linker e a preservação dos parâmetros. Evitar autorreferências e fragmentação de sessão; excluir referências de pagamentos somente com base na jornada observada. A escolha de consentimento nos dois ambientes precisa ser coerente.

Hoje o site não repassa UTMs ou identificadores de linker automaticamente à loja. A propagação de campanha será implementada/validada depois das URLs e do mecanismo de consentimento, com lista explícita de parâmetros permitidos, preservação de query/hash do destino e sem copiar dados pessoais da URL. Não encaminhar a query inteira do visitante.

## Convenção de campanhas UTM

Modelo de planejamento: [campanhas-utm.csv](modelos/campanhas-utm.csv), somente cabeçalhos.

| Campo | Convenção |
| --- | --- |
| `utm_source` | Origem padronizada em minúsculas, por exemplo `instagram`, `google`, `newsletter` |
| `utm_medium` | Meio consistente, por exemplo `paid_social`, `cpc`, `email`, `social`, `referral` |
| `utm_campaign` | Nome estável aprovado, sem espaços ou dados pessoais; padrão interno com `_` |
| `utm_content` | Identifica criativo/posição, quando necessário |
| `utm_term` | Termo/segmento de campanha quando aplicável, sem informação pessoal |
| `url_destino`, `publico` | URL confirmada e público varejo/atacado; preservar query e fragmento |

Exemplo de formatação, **sem campanha ativa**: `https://agylli.vercel.app/atacado?utm_source=instagram&utm_medium=paid_social&utm_campaign=piloto_revenda&utm_content=banner#cadastro-atacado`. O endereço institucional publicado é real; os nomes de campanha são apenas uma convenção de exemplo. Ajustar o domínio após sua migração. Não inserir UTMs nos links internos do menu, o que prejudicaria a atribuição da origem.

## Roteiro de validação após configuração aprovada

1. Em Preview, verificar o estado anterior à escolha: nenhuma tag opcional deve carregar/enviar eventos. Testar aceitar, recusar e revogar, inclusive no celular.
2. Validar uma única visualização por navegação no App Router em GA4 DebugView/GTM Preview; conferir mudanças de rota e histórico.
3. Clicar em varejo/atacado com URLs configuradas e com fallbacks. Apenas a saída real consentida para a loja gera `commerce_outbound_click`, com canal e posição corretos.
4. Entrar por UTM aprovada, atravessar os domínios e conferir origem/campanha sem autorreferência indevida e sem dados pessoais.
5. Realizar pedido de teste autorizado na Nuvemshop; conferir `begin_checkout`, marco real de `purchase`, `transaction_id`, moeda, valor e itens. Recarregar confirmação e repetir cliques para testar ausência de duplicidade.
6. Conferir GTM Preview, GA4 DebugView, diagnóstico Google Ads/Tag Assistant e eventos de teste Meta, conforme as ferramentas adotadas. Remover estado de teste antes de publicar.
7. Conciliar com o pedido real da loja e registrar divergências/consentimento. Relatar cliques de saída, checkouts e vendas como indicadores separados.

Essas validações ainda não foram executadas porque não há loja comercial, IDs ou mecanismo de consentimento configurados. Nenhuma conta foi conectada e nenhuma tag foi publicada.
