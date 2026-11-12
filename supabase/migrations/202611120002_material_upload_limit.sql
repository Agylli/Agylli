-- PDFs sao enviados diretamente ao Storage; imagens continuam limitadas a 3 MB na aplicacao.
begin;
do $$
begin
 if not exists(select 1 from storage.buckets where id='reseller-materials') then
  raise exception 'Bucket reseller-materials ausente. Aplique primeiro a migration original do portal.';
 end if;
 update storage.buckets set file_size_limit=52428800 where id='reseller-materials';
end; $$;
commit;
