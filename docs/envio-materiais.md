# Catálogos e materiais privados

O formulário **Equipe → Materiais** aceita PDF até **50 MB** e JPG/PNG/WebP até **3 MB**. O fluxo antigo enviava o arquivo pela Server Action, limitada a 4 MB no projeto; PDFs acima de 20 MB falhavam antes de chegar à validação do formulário. Aumentar somente esse limite não resolve o limite da plataforma de hospedagem.

## Configuração do Supabase

Aplicar [202611120002_material_upload_limit.sql](../supabase/migrations/202611120002_material_upload_limit.sql) no projeto existente, após a migration original do portal. A alteração é repetível e modifica apenas `file_size_limit` do bucket `reseller-materials` para `52428800` bytes. Não muda políticas, visibilidade ou contas. O bucket `reseller-products` mantém o limite de 3 MB.

No SQL Editor, a conferência pode ser feita com:

```sql
select id, public, file_size_limit
from storage.buckets
where id in ('reseller-materials', 'reseller-products');
```

`reseller-materials` deve permanecer privado (`public = false`) e mostrar `52428800`. O limite global de arquivos em **Storage → Settings** também precisa permitir 50 MB; não contratar plano nem alterar outros limites sem aprovação. Não é necessária variável de ambiente nova: são usadas as configurações públicas Supabase já existentes, com chave publicável moderna.

## Como funciona

1. O navegador valida os campos e os limites antes de iniciar o envio. O formulário apresenta erros na própria página e indica a fase do envio.
2. Uma Server Action verifica a sessão e a permissão real da equipe. Somente então cria um caminho aleatório e um token temporário para enviar aquele objeto, sem sobrescrever arquivos existentes.
3. O navegador envia os bytes diretamente ao bucket privado. A sessão de autenticação permanece em cookies HTTP-only; nenhuma chave secreta é entregue ao navegador.
4. Outra Server Action recebe apenas os dados do material e a referência do arquivo. Confere novamente a equipe, o tamanho e MIME registrados pelo Storage e os primeiros bytes por URL assinada da origem configurada.
5. O cadastro do material só é criado após essas verificações. Tentativas repetidas com a mesma referência não duplicam o cadastro. Um envio concluído pode ser reutilizado numa tentativa de publicação com o mesmo arquivo selecionado.
6. Revendedores aprovados acessam materiais ativos por URL de download temporária. O arquivo não passa pelo servidor da Vercel, inclusive no download.

O arquivo não vira público ao ser enviado. Se a publicação não terminar ou a página for fechada, um objeto sem cadastro pode permanecer privado e acessível apenas à equipe. A limpeza deve ser revisada por administrador, conferindo referências antes de excluir; não há remoção automática de materiais legítimos. Arquivos rejeitados por tipo/tamanho/conteúdo são removidos antes da publicação.

## Homologação com a equipe

1. Confirmar o limite do bucket e abrir uma página nova após o deploy.
2. Entrar por `/equipe` com uma conta já autorizada. O login padrão também encaminha funcionários ao painel da equipe.
3. Em Materiais, preencher título, categoria, descrição e autorização de uso. Selecionar um PDF autorizado de mais de 20 MB e até 50 MB.
4. Aguardar o envio e a mensagem de publicação; conferir a lista e abrir o arquivo.
5. Entrar com um revendedor aprovado e conferir o acesso ao material ativo. Uma conta pendente não deve obtê-lo.
6. Conferir mensagem de limite com PDF acima de 50 MB ou imagem acima de 3 MB. Não é necessário enviar esses arquivos ao servidor para validar o limite.

PDF acima de 50 MB precisa ser reduzido ou dividido antes do envio. Para falha de rede/armazenamento, conferir conexão, sessão e limites; selecionar novamente o mesmo arquivo e tentar publicar. Não compartilhar tokens ou links assinados em logs, Git ou chamados.

Os testes locais usam arquivos fictícios e Storage simulado. Eles não comprovam um envio real ao projeto Supabase; a homologação acima depende da configuração e de uma conta autorizada.
