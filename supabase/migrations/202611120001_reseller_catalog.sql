-- Catalogo privado de apresentacao para solicitacoes. Sem precos ou estoque.
begin;

create table public.reseller_catalog_products (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(btrim(name)) between 2 and 160),
 sku text check(sku is null or length(btrim(sku)) between 1 and 80),
 brand text not null default '' check(length(brand)<=80),
 category text not null default '' check(length(category)<=80),
 description text not null default '' check(length(description)<=1000),
 image_path text unique check(image_path is null or image_path ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$'),
 active boolean not null default true,
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index reseller_catalog_sku on public.reseller_catalog_products(lower(btrim(sku))) where sku is not null;
create index reseller_catalog_active_name on public.reseller_catalog_products(active,name);
alter table public.reseller_catalog_products enable row level security;
create policy catalog_read on public.reseller_catalog_products for select to authenticated
 using(public.portal_is_staff() or (active and public.portal_is_approved()));
create policy catalog_insert on public.reseller_catalog_products for insert to authenticated
 with check(public.portal_is_staff() and created_by=auth.uid());
create policy catalog_update on public.reseller_catalog_products for update to authenticated
 using(public.portal_is_staff()) with check(public.portal_is_staff());
revoke all on public.reseller_catalog_products from anon,authenticated;
grant select on public.reseller_catalog_products to authenticated;
grant insert(name,sku,brand,category,description,image_path,active) on public.reseller_catalog_products to authenticated;
grant update(name,sku,brand,category,description,image_path,active) on public.reseller_catalog_products to authenticated;
create function public.portal_catalog_updated() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now();return new;end; $$;
create trigger portal_catalog_update before update on public.reseller_catalog_products
 for each row execute function public.portal_catalog_updated();
revoke all on function public.portal_catalog_updated() from public,anon,authenticated;

-- Snapshot dos IDs/quantidades para repeticao segura, mesmo se o catalogo mudar.
alter table public.reseller_requests add column catalog_selection jsonb
 check(catalog_selection is null or (jsonb_typeof(catalog_selection)='array' and jsonb_array_length(catalog_selection) between 1 and 20));

create function public.portal_create_catalog_request(p_unit text,p_items jsonb,p_notes text,p_client_token uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare
 uid uuid:=auth.uid(); rid uuid; previous public.reseller_requests%rowtype;
 item jsonb; snapshot jsonb;
begin
 if uid is null or not public.portal_is_approved() then raise exception 'Cadastro nao aprovado';end if;
 if p_client_token is null or p_unit is null or p_unit<>'candido-sales' then raise exception 'Unidade ou token invalidos';end if;
 if p_notes is null or length(p_notes)>1000 then raise exception 'Observacoes invalidas';end if;
 if p_items is null or jsonb_typeof(p_items)<>'array' then raise exception 'Selecao invalida';end if;
 if jsonb_array_length(p_items) not between 1 and 20 then raise exception 'Limite de produtos';end if;
 for item in select * from jsonb_array_elements(p_items) loop
  if jsonb_typeof(item)<>'object' or item-array['id','quantity']<>'{}'::jsonb
   or jsonb_typeof(item->'id') is distinct from 'string'
   or jsonb_typeof(item->'quantity') is distinct from 'number' then raise exception 'Selecao invalida';end if;
  if (item->>'id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
   or (item->>'quantity') !~ '^[1-9][0-9]?$' then raise exception 'Produto ou quantidade invalidos';end if;
 end loop;
 if (select count(distinct (i->>'id')::uuid) from jsonb_array_elements(p_items)i)<>jsonb_array_length(p_items) then raise exception 'Produto duplicado';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into previous from public.reseller_requests where user_id=uid and client_token=p_client_token;
 if found then
  if previous.catalog_selection is distinct from p_items or previous.unit_id<>p_unit or previous.notes<>p_notes then
   raise exception 'Token ja utilizado com outra solicitacao';
  end if;
  return previous.id;
 end if;
 -- Bloqueia alteracoes concorrentes nos produtos ate concluir o snapshot.
 perform p.id from public.reseller_catalog_products p
  join jsonb_array_elements(p_items)i on p.id=(i->>'id')::uuid for share of p;
 if (select count(*) from public.reseller_catalog_products p
   join jsonb_array_elements(p_items)i on p.id=(i->>'id')::uuid where p.active)<>jsonb_array_length(p_items) then
  raise exception 'Produto indisponivel no catalogo; revise a selecao';
 end if;
 select jsonb_agg(jsonb_build_object('name',p.name,'sku',coalesce(p.sku,''),'quantity',(i.value->>'quantity')::integer) order by i.ordinality)
 into snapshot from jsonb_array_elements(p_items) with ordinality i(value,ordinality)
 join public.reseller_catalog_products p on p.id=(i.value->>'id')::uuid;
 rid:=public.portal_create_request(p_unit,snapshot,p_notes,p_client_token);
 update public.reseller_requests set catalog_selection=p_items where id=rid;
 return rid;
end; $$;
revoke all on function public.portal_create_catalog_request(text,jsonb,text,uuid) from public,anon,authenticated;
grant execute on function public.portal_create_catalog_request(text,jsonb,text,uuid) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('reseller-products','reseller-products',false,3145728,array['image/png','image/jpeg','image/webp']);
create policy catalog_image_read on storage.objects for select to authenticated
 using(bucket_id='reseller-products' and (public.portal_is_staff() or (public.portal_is_approved() and exists(
  select 1 from public.reseller_catalog_products p where p.active and p.image_path=storage.objects.name))));
create policy catalog_image_insert on storage.objects for insert to authenticated
 with check(bucket_id='reseller-products' and public.portal_is_staff());
create policy catalog_image_delete on storage.objects for delete to authenticated
 using(bucket_id='reseller-products' and public.portal_is_staff());
commit;
