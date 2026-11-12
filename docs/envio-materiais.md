# Catálogos e materiais privados

O formulário **Equipe → Materiais** envia arquivos diretamente ao Supabase Storage privado com **TUS**, em blocos de 6 MB. Mostra percentual/quantidade enviada, permite cancelar, retenta falhas temporárias e encerra tentativas sem resposta. Os campos e o arquivo selecionado são preservados quando há erro. O cadastro só é publicado depois da conferência no servidor.

## Limite ativo e preparação para 100 MB

A Agylli confirmou **Supabase Free em 12/11/2026**. A documentação oficial limita esse plano a **50 MB por arquivo**. O limite ativo permanece 50 MB (`52428800` bytes); imagens continuam em 3 MB. Alterar somente o banco ou a interface para 100 MB não supera o limite global do serviço. Não foi contratado nem alterado plano.

`NEXT_PUBLIC_RESELLER_PDF_LIMIT_MB` ausente, vazio ou diferente de `100` conserva 50 MB. O código suporta 100 MB somente quando essa variável vale exatamente `100`; ela não muda a contratação nem os limites do Supabase.

Para ativar **100 MB**, após aprovação da contratação/configuração:

1. Confirmar plano compatível. A documentação oficial consultada permite mais de 50 MB no Pro e superiores; conferir as condições vigentes antes da contratação.
2. Em **Storage → Settings → Global file size limit**, configurar pelo menos 100 MB.
3. Aplicar [202611120003_material_upload_100mb.sql](../supabase/migrations/202611120003_material_upload_100mb.sql). A migração é repetível, altera apenas o limite de `reseller-materials` para `104857600` e preserva privacidade/políticas; não altera o plano. **Não aplicar enquanto o projeto permanecer Free.**
4. Na Vercel, definir `NEXT_PUBLIC_RESELLER_PDF_LIMIT_MB=100` no ambiente autorizado e gerar novo build. Servidor e navegador usam o mesmo limite incorporado no build.
5. Homologar PDF autorizado entre 50 e 100 MB, inclusive download por revendedor aprovado, antes de considerar a ampliação concluída.

No Free, manter o ajuste já utilizado em [202611120002_material_upload_limit.sql](../supabase/migrations/202611120002_material_upload_limit.sql). Para conferir:

```sql
select id, public, file_size_limit
from storage.buckets
where id in ('reseller-materials', 'reseller-products');
```

`reseller-materials` deve mostrar `public = false` e `52428800` no Free. `reseller-products` mantém `3145728`. O limite global precisa permitir 50 MB. PDFs maiores devem ser reduzidos ou divididos enquanto esse plano permanecer ativo.

## Envio, segurança e recuperação

1. O navegador confere campos, autorização e tamanho antes de iniciar. Uma Server Action autentica a equipe e cria um token temporário para um objeto novo, sem sobrescrita.
2. `tus-js-client` envia blocos de 6 MB ao hostname direto do Storage para projetos `*.supabase.co`, usando `x-signature` e a chave publicável. A sessão permanece HTTP-only. Não há chave secreta ou JWT da equipe no navegador.
3. TUS retoma do último saldo de bytes confirmado após falhas transitórias, com tentativas limitadas. Erros de acesso/tamanho não são repetidos automaticamente. URLs/tokens de envio não são persistidos no armazenamento do navegador; retomada automática vale durante a tentativa com a página aberta.
4. Inatividade por 90 segundos ou duração total de 15 minutos encerra o envio e libera o formulário. Preparação e confirmação têm prazo de 45 segundos; a conferência do cabeçalho no servidor tem 15 segundos. Progresso de rede não equivale à publicação.
5. Cancelar interrompe o transporte e impede o início da publicação por essa tentativa. O botão só aparece durante o envio; confirmação já iniciada não oferece cancelamento. Sair da tela durante o transporte também o interrompe.
6. A publicação recebe apenas dados pequenos e a referência. O servidor verifica novamente equipe, tamanho/MIME reais e assinatura inicial por URL assinada da origem configurada. Tentativas com o mesmo caminho não duplicam o cadastro.
7. Se o arquivo chegou e a confirmação falhou/demorou, conferir a lista antes de tentar novamente. A referência concluída é conservada na página e permite repetir a publicação com o mesmo arquivo, sem novo envio.
8. O download exige sessão/RLS e usa URL temporária, sem transportar o PDF pela Vercel. Revendedores pendentes não recebem materiais privados ativos.

Objetos parciais ou enviados sem cadastro podem permanecer privados após interrupção, fechamento da página ou falha. Limpeza exige revisão administrativa das referências; não remover materiais legítimos automaticamente. Conteúdo rejeitado por tipo/tamanho/assinatura é removido antes da publicação. Não registrar tokens, nomes de arquivos comerciais, URLs assinadas ou dados de clientes no Git/logs.

## Mensagens operacionais

| Código | Conferência sugerida |
| --- | --- |
| `ENVIO_SEM_RESPOSTA` / `ENVIO_TEMPO` | Conexão, bloqueios do navegador/rede e nova tentativa |
| `ENVIO_LIMITE` | Plano, limite global, bucket e tamanho do arquivo |
| `ENVIO_ACESSO` | Atualizar página, entrar com conta de equipe e conferir permissões |
| `ENVIO_HTTP_...` / `ENVIO_REDE` | Estado do serviço/conexão; não compartilhar URLs ou tokens |
| Confirmação após envio demorou | Conferir lista e concluir com a mesma referência antes de reenviar |

A causa remota exata da tentativa relatada como parada não foi comprovada por logs ou sessão autenticada. O fluxo anterior não tinha progresso nem prazo de transporte. A correção é validada com armazenamento simulado e precisa de homologação com arquivo real.

## Homologação

Abrir uma página nova após o deploy. Entrar em `/equipe?aba=materiais`, preencher os dados e enviar PDF autorizado entre 20 e 50 MB. Conferir progresso, mensagem final, lista e download com equipe e revendedor aprovado. Conferir também cancelamento, interrupção, repetição após falha de confirmação e rejeição antes do envio para PDF acima do limite ativo ou imagem acima de 3 MB.

Fontes oficiais consultadas em 12/11/2026: [TUS e tokens assinados](https://supabase.com/docs/guides/storage/uploads/resumable-uploads), [limites por plano/bucket](https://supabase.com/docs/guides/storage/uploads/file-limits) e [tus-js-client](https://github.com/tus/tus-js-client). O conteúdo foi conferido nos repositórios oficiais; nenhum serviço real foi usado para os testes de transferência.
