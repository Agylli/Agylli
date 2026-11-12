-- Requer limite global compativel no Storage; o plano Free permite no maximo 50 MB.
-- Esta migration nao altera plano, politicas, visibilidade ou contas.
begin;
do $$
begin
  if not exists(select 1 from storage.buckets where id='reseller-materials') then
    raise exception 'Bucket reseller-materials ausente. Aplique primeiro a migration original do portal.';
  end if;
  update storage.buckets set file_size_limit=104857600 where id='reseller-materials';
end; $$;
commit;
