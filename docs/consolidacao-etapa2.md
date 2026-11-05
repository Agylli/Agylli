# Consolidação — Etapa 2

## Ponto de partida observado

Em 5 de novembro de 2026, o checkout estava na branch `main`, commit `ae104d73869c0c0713cdf61510b714f8b20bb1b1`. `git fetch origin main` confirmou o mesmo commit no GitHub e contagem `HEAD...FETCH_HEAD` de `0 0`: nenhum commit exclusivo de qualquer lado.

As alterações locais ainda não enviadas eram arquivos modificados/novos e exclusões de ativos substituídos. O [manifesto inicial completo](historico/alteracoes-locais-antes-etapa2.txt) foi salvo antes de editar. Inclui a identidade oficial, fotos reais, histórico, contatos, área de atuação, remoção de elementos decorativos, documentação, relatórios, capturas e ajustes de deploy/lint. Todas essas alterações foram preservadas para consolidação.

O origin é `https://github.com/Agylli/Agylli.git`. O deployment de partida era `dpl_G5yx73fxJjV9SRS7BCReZfgsFMAv`, em produção e READY. Como havia sido publicado com arquivos locais não commitados, ele não estabelecia equivalência com o commit antigo do GitHub.

## Alterações desta etapa

- Homepage com orientação explícita de varejo e revenda para CPF/CNPJ, preservando composição, fotos, logo e paleta.
- Novo bloco `WholesaleAccess`, em `/atacado#cadastro-atacado`, com link centralizado de cadastro, orientação conforme disponibilidade e acesso às unidades. Nenhum formulário de clientes foi criado.
- Testes para contrato das variáveis e auditoria de links internos/âncoras, além das verificações existentes.
- Especificação do piloto e três CSVs de preparação de produtos, custos e atacado; modelo UTM e plano de análise. Os arquivos não contêm dados comerciais preenchidos.
- Pasta `dados-comerciais/` ignorada pelo Git e pelo deploy para cópias privadas dos modelos.
- README, implantação, arquitetura, integrações, roadmap e convenções atualizados.

## Verificação de Git e envio seguro

1. Conferir status e diff; executar lint, testes, build, TypeScript e navegador.
2. Preparar um commit com os arquivos de código, ativos e documentação, verificando que não contém `.env.local`, `.vercel`, credenciais, caches ou dados comerciais reais.
3. Reconsultar `main` antes do envio. Se o remoto avançar, preservar e integrar os commits; nunca usar force push ou substituir o histórico remoto.
4. Enviar a revisão para `main` conforme a autorização vigente de sincronização e confirmar o SHA remoto com `git ls-remote`/novo fetch.
5. Conferir o workflow `Qualidade` associado ao SHA exato. Um badge geral ou o sucesso de uma execução anterior não comprova o CI da nova revisão.
6. Conferir a Vercel pela revisão esperada e estado READY, utilizando metadados do commit se o deployment for feito por CLI. Ver [deploy](deploy.md).

## Acesso ao CI neste ambiente

A consulta pela API GitHub (`gh run list`) retornou `Forbidden`. Foi possível ler a interface oficial em `https://github.com/Agylli/Agylli/actions` pelo domínio permitido. As três execuções anteriores estavam concluídas com sucesso; a execução mais recente antes do envio era [Qualidade #3](https://github.com/Agylli/Agylli/actions/runs/41975097869), do commit `ae104d7`.

Após o push, conferir na mesma página a nova execução e abrir o detalhe para associar SHA, branch e conclusão. Não contornar a política de rede nem considerar a mensagem de autenticação do CLI uma prova de que o transporte Git está sem acesso: o fetch funcionou. Os resultados finais do envio, CI e deployment devem ser registrados no relatório de entrega, depois de observados.
