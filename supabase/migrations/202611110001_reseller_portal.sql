-- Portal de relacionamento e solicitacoes. Nao representa estoque nem checkout.
begin;
create table public.reseller_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null check (length(name) between 3 and 100),
 email text not null check(length(email)<=254), phone text not null check(length(phone) between 10 and 24),
 unit_id text not null check (unit_id in ('candido-sales')),
 status text not null default 'pending' check (status in ('pending','approved','suspended')),
 created_at timestamptz not null default now()
);
create table public.portal_staff (user_id uuid primary key references auth.users(id) on delete cascade);
create function public.portal_is_staff() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.portal_staff where user_id = auth.uid());
$$;
create function public.portal_is_approved() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.reseller_profiles where id = auth.uid() and status = 'approved');
$$;
create function public.portal_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 -- Cadastros de outros sistemas de autenticacao nao geram um perfil de revenda.
 if new.raw_user_meta_data->>'portal' = 'agylli-reseller' then
  insert into public.reseller_profiles(id,name,email,phone,unit_id)
  values(new.id, new.raw_user_meta_data->>'name',new.email,new.raw_user_meta_data->>'phone',new.raw_user_meta_data->>'unit');
 end if;
 return new;
end; $$;
create trigger portal_create_profile after insert on auth.users for each row execute function public.portal_new_user();
create function public.portal_sync_email() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 update public.reseller_profiles set email=new.email where id=new.id;
 return new;
end; $$;
create trigger portal_update_email after update of email on auth.users for each row execute function public.portal_sync_email();

create table public.reseller_requests (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.reseller_profiles(id),
 unit_id text not null check(unit_id in ('candido-sales')),
 status text not null default 'recebido' check(status in ('recebido','em_analise','em_separacao','pronto','entregue','cancelado')),
 notes text not null default '' check(length(notes)<=1000), client_token uuid not null, submitted_items jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(user_id,client_token)
);
create index reseller_requests_owner_created on public.reseller_requests(user_id,created_at desc);
create table public.reseller_request_items (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.reseller_requests(id) on delete cascade,
 name text not null check(length(name) between 2 and 160), sku text check(length(sku)<=80),
 quantity integer not null check(quantity between 1 and 99)
);
create index reseller_request_items_request on public.reseller_request_items(request_id);
create table public.reseller_request_events (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.reseller_requests(id),
 status text not null, actor_id uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create table public.reseller_email_notifications (
 request_id uuid primary key references public.reseller_requests(id),
 status text not null default 'pending' check(status in ('pending','sending','sent','failed')),
 attempts integer not null default 0, provider_id text, last_error text,
 updated_at timestamptz not null default now()
);
create table public.reseller_resources (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 3 and 120),
 description text not null check(length(description)<=1000),
 category text not null check(category in ('catalogo','divulgacao','beneficio')),
 file_path text unique, active boolean not null default true, created_by uuid not null references auth.users(id) default auth.uid(),
 created_at timestamptz not null default now()
);
-- Apenas fatos confirmados pela operacao: nao preencher a partir de solicitacoes pendentes.
create table public.reseller_purchase_records (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.reseller_profiles(id),
 unit_id text not null check(unit_id in ('candido-sales')),
 purchased_at timestamptz not null check(isfinite(purchased_at)), source_reference text not null check(length(source_reference) between 1 and 100),
 summary text not null check(length(summary) between 1 and 2000), total_brl numeric(12,2) check(total_brl>=0 and total_brl<10000000000),
 imported_at timestamptz not null default now(), unique(unit_id,source_reference)
);

create index reseller_events_request_date on public.reseller_request_events(request_id,created_at);
create index reseller_purchases_owner_date on public.reseller_purchase_records(user_id,purchased_at desc);

alter table public.reseller_profiles enable row level security;
alter table public.portal_staff enable row level security;
alter table public.reseller_requests enable row level security;
alter table public.reseller_request_items enable row level security;
alter table public.reseller_request_events enable row level security;
alter table public.reseller_email_notifications enable row level security;
alter table public.reseller_resources enable row level security;
alter table public.reseller_purchase_records enable row level security;
create policy profile_read on public.reseller_profiles for select to authenticated using(id=auth.uid() or public.portal_is_staff());
create policy staff_self_read on public.portal_staff for select to authenticated using(user_id=auth.uid());
create policy request_read on public.reseller_requests for select to authenticated using(user_id=auth.uid() or public.portal_is_staff());
create policy item_read on public.reseller_request_items for select to authenticated using(exists(select 1 from public.reseller_requests r where r.id=request_id and (r.user_id=auth.uid() or public.portal_is_staff())));
create policy event_read on public.reseller_request_events for select to authenticated using(exists(select 1 from public.reseller_requests r where r.id=request_id and (r.user_id=auth.uid() or public.portal_is_staff())));
create policy notification_read on public.reseller_email_notifications for select to authenticated using(public.portal_is_staff());
create policy resource_read on public.reseller_resources for select to authenticated using(public.portal_is_staff() or (active and public.portal_is_approved()));
create policy resource_insert on public.reseller_resources for insert to authenticated with check(public.portal_is_staff() and created_by=auth.uid());
create policy resource_update on public.reseller_resources for update to authenticated using(public.portal_is_staff()) with check(public.portal_is_staff());
create policy purchase_read on public.reseller_purchase_records for select to authenticated using(user_id=auth.uid() or public.portal_is_staff());

-- Escritas comerciais passam por funcoes transacionais, nunca por grants amplos.
revoke all on public.reseller_profiles,public.portal_staff,public.reseller_requests,public.reseller_request_items,public.reseller_request_events,public.reseller_email_notifications,public.reseller_resources,public.reseller_purchase_records from anon,authenticated;
grant select on public.reseller_profiles,public.portal_staff,public.reseller_requests,public.reseller_request_items,public.reseller_request_events,public.reseller_email_notifications,public.reseller_resources,public.reseller_purchase_records to authenticated;
grant insert,update on public.reseller_resources to authenticated;
grant all on public.reseller_email_notifications to service_role;
grant select on public.reseller_profiles,public.reseller_requests,public.reseller_request_items to service_role;

create function public.portal_create_request(p_unit text,p_items jsonb,p_notes text,p_client_token uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); rid uuid; item jsonb; n text; q text; s text;
begin
 if uid is null or not public.portal_is_approved() then raise exception 'Cadastro nao aprovado'; end if;
 if p_unit not in ('candido-sales') or p_unit is null or p_client_token is null then raise exception 'Unidade ou token invalidos'; end if;
 if p_notes is null or length(p_notes)>1000 then raise exception 'Observacoes invalidas'; end if;
 if p_items is null or jsonb_typeof(p_items) <> 'array' then raise exception 'Produtos invalidos'; end if;
 if jsonb_array_length(p_items) not between 1 and 20 then raise exception 'Limite de produtos'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select id into rid from public.reseller_requests where user_id=uid and client_token=p_client_token;
 if rid is not null then
  if exists(select 1 from public.reseller_requests where id=rid and (unit_id<>p_unit or notes<>p_notes or submitted_items<>p_items)) then raise exception 'Token ja utilizado com outra solicitacao'; end if;
  return rid;
 end if;
 if (select count(*) from public.reseller_requests where user_id=uid and created_at > now()-interval '15 minutes') >= 10 then raise exception 'Limite de solicitacoes; aguarde'; end if;
 for item in select * from jsonb_array_elements(p_items) loop
  if jsonb_typeof(item)<>'object' then raise exception 'Produto invalido'; end if;
  if item - array['name','sku','quantity'] <> '{}'::jsonb or jsonb_typeof(item->'name') is distinct from 'string' or jsonb_typeof(item->'quantity') is distinct from 'number' then raise exception 'Campos de produto invalidos'; end if;
  if item ? 'sku' and jsonb_typeof(item->'sku') not in ('string','null') then raise exception 'Codigo invalido'; end if;
  n:=btrim(coalesce(item->>'name','')); q:=coalesce(item->>'quantity',''); s:=btrim(coalesce(item->>'sku',''));
  if length(n) not between 2 and 160 or length(s)>80 or q !~ '^[1-9][0-9]?$' then raise exception 'Produto ou quantidade invalidos'; end if;
 end loop;
 insert into public.reseller_requests(user_id,unit_id,notes,client_token,submitted_items) values(uid,p_unit,p_notes,p_client_token,p_items) returning id into rid;
 insert into public.reseller_request_items(request_id,name,sku,quantity)
 select rid,btrim(i->>'name'),btrim(coalesce(i->>'sku','')),(i->>'quantity')::integer from jsonb_array_elements(p_items) i;
 insert into public.reseller_request_events(request_id,status,actor_id) values(rid,'recebido',uid);
 insert into public.reseller_email_notifications(request_id) values(rid);
 return rid;
end; $$;

create function public.portal_set_status(p_id uuid,p_status text) returns void language plpgsql security definer set search_path = '' as $$
declare old_status text;
begin
 if not public.portal_is_staff() then raise exception 'Acesso restrito'; end if;
 select status into old_status from public.reseller_requests where id=p_id for update;
 if old_status is null then raise exception 'Solicitacao nao encontrada'; end if;
 if not ((old_status='recebido' and p_status in ('em_analise','cancelado')) or
 (old_status='em_analise' and p_status in ('em_separacao','cancelado')) or
 (old_status='em_separacao' and p_status in ('pronto','cancelado')) or
 (old_status='pronto' and p_status in ('entregue','cancelado'))) then raise exception 'Transicao invalida'; end if;
 update public.reseller_requests set status=p_status,updated_at=now() where id=p_id;
 insert into public.reseller_request_events(request_id,status,actor_id) values(p_id,p_status,auth.uid());
end; $$;
create function public.portal_set_profile_status(p_id uuid,p_status text) returns void language plpgsql security definer set search_path = '' as $$
begin
 if not public.portal_is_staff() then raise exception 'Acesso restrito'; end if;
 if p_status not in ('pending','approved','suspended') or p_status is null then raise exception 'Status invalido'; end if;
 if p_status='approved' and not exists(select 1 from auth.users where id=p_id and email_confirmed_at is not null) then raise exception 'E-mail ainda nao confirmado'; end if;
 update public.reseller_profiles set status=p_status where id=p_id;
 if not found then raise exception 'Cadastro nao encontrado'; end if;
end; $$;
-- Claim atomico: somente o servidor de notificacoes pode alterar o estado de envio.
create function public.portal_claim_email(p_id uuid) returns boolean language plpgsql security definer set search_path = '' as $$
begin
 update public.reseller_email_notifications set status='sending',attempts=attempts+1,updated_at=now(),last_error=null
 where request_id=p_id and attempts<5 and (status in ('pending','failed') or (status='sending' and updated_at<now()-interval '5 minutes'));
 return found;
end; $$;
revoke all on function public.portal_is_staff(),public.portal_is_approved(),public.portal_new_user(),public.portal_sync_email(),public.portal_create_request(text,jsonb,text,uuid),public.portal_set_status(uuid,text),public.portal_set_profile_status(uuid,text),public.portal_claim_email(uuid) from public,anon,authenticated;
grant execute on function public.portal_is_staff(),public.portal_is_approved(),public.portal_create_request(text,jsonb,text,uuid),public.portal_set_status(uuid,text),public.portal_set_profile_status(uuid,text) to authenticated;
grant execute on function public.portal_claim_email(uuid) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('reseller-materials','reseller-materials',false,3145728,array['application/pdf','image/png','image/jpeg','image/webp']);
create policy portal_material_read on storage.objects for select to authenticated using(bucket_id='reseller-materials' and (public.portal_is_staff() or (public.portal_is_approved() and exists(select 1 from public.reseller_resources r where r.active and r.file_path=name))));
create policy portal_material_write on storage.objects for insert to authenticated with check(bucket_id='reseller-materials' and public.portal_is_staff());
create policy portal_material_delete on storage.objects for delete to authenticated using(bucket_id='reseller-materials' and public.portal_is_staff());
commit;
