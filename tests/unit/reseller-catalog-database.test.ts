import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
let db: PGlite;
const A="11111111-1111-4111-8111-111111111111", B="22222222-2222-4222-8222-222222222222", STAFF="33333333-3333-4333-8333-333333333333", TOKEN="44444444-4444-4444-8444-444444444444";
async function asUser<T>(id:string,fn:()=>Promise<T>,role="authenticated") {
  await db.exec(`begin;set local role ${role};set local request.jwt.claim.sub='${id}';`);
  try {const result=await fn();await db.exec("commit");return result;}catch(error){await db.exec("rollback");throw error;}
}
async function product(active=true,image:string|null=null) {
  return asUser(STAFF,async()=>{const r=await db.query<{id:string}>("insert into public.reseller_catalog_products(name,sku,brand,category,active,image_path) values('PRODUTO FICTICIO','00042','MARCA FICTICIA','TESTE',$1,$2) returning id",[active,image]);return r.rows[0].id;});
}
async function request(items:unknown,user=A,token=TOKEN) {
  return asUser(user,async()=>{const r=await db.query<{id:string}>("select public.portal_create_catalog_request('candido-sales',$1::jsonb,'TESTE FICTICIO',$2::uuid) as id",[JSON.stringify(items),token]);return r.rows[0].id;});
}
beforeAll(async()=>{
  db=new PGlite();
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
    create schema auth;create schema storage;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb not null default '{}',email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth,public,storage to anon,authenticated,service_role;
    grant execute on function auth.uid() to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;grant select,insert,delete on storage.objects to authenticated;`);
  for(const file of ["202611110001_reseller_portal.sql","202611120001_reseller_catalog.sql"])
    await db.exec(await readFile(new URL(`../../supabase/migrations/${file}`,import.meta.url),"utf8"));
},30000);
beforeEach(async()=>{
  await db.exec("truncate auth.users cascade;truncate storage.objects;");
  for(const id of [A,B,STAFF]) await db.query("insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values($1,$2,now(),$3::jsonb)",[id,`${id.slice(0,2)}@example.invalid`,JSON.stringify({portal:"agylli-reseller",name:"PESSOA FICTICIA",phone:"77999990000",unit:"candido-sales"})]);
  await db.query("insert into public.portal_staff values($1)",[STAFF]);
  await db.query("update public.reseller_profiles set status='approved' where id=$1",[A]);
});
afterAll(async()=>{await db?.close();});
describe("Catalogo privado e solicitacoes sem precos ou estoque",()=>{
  it("anonimo e pendente nao leem; aprovado ve somente ativos; equipe ve todos",async()=>{
    const id=await product();
    await asUser(STAFF,()=>db.query("insert into public.reseller_catalog_products(name,active) values('FICTICIO OCULTO',false)"));
    await expect(asUser("",()=>db.query("select * from public.reseller_catalog_products"),"anon")).rejects.toThrow();
    expect((await asUser(B,()=>db.query("select * from public.reseller_catalog_products"))).rows).toHaveLength(0);
    expect((await asUser(A,()=>db.query<{id:string}>("select id from public.reseller_catalog_products"))).rows.map(p=>p.id)).toEqual([id]);
    expect((await asUser(STAFF,()=>db.query("select * from public.reseller_catalog_products"))).rows).toHaveLength(2);
  });
  it("somente equipe publica e edita; autoria nao pode ser alterada",async()=>{
    const id=await product();
    await expect(asUser(A,()=>db.query("insert into public.reseller_catalog_products(name) values('FORJADO')"))).rejects.toThrow();
    await asUser(A,()=>db.query("update public.reseller_catalog_products set active=false where id=$1",[id]));
    expect((await db.query<{active:boolean}>("select active from public.reseller_catalog_products where id=$1",[id])).rows[0].active).toBe(true);
    await expect(asUser(STAFF,()=>db.query("update public.reseller_catalog_products set created_by=$1 where id=$2",[A,id]))).rejects.toThrow();
  });
  it("preserva codigos textuais e rejeita duplicidade de SKU",async()=>{
    await product();
    await expect(product()).rejects.toThrow(/unique|duplicate/);
  });
  it("registra snapshot, evento e aviso atomicamente a partir do catalogo",async()=>{
    const id=await product(),rid=await request([{id,quantity:2}]);
    const r=await db.query<{name:string;sku:string;quantity:number}>("select name,sku,quantity from public.reseller_request_items where request_id=$1",[rid]);
    expect(r.rows).toEqual([{name:"PRODUTO FICTICIO",sku:"00042",quantity:2}]);
    expect((await db.query("select * from public.reseller_email_notifications where request_id=$1",[rid])).rows).toHaveLength(1);
    expect((await db.query("select * from public.reseller_request_events where request_id=$1",[rid])).rows).toHaveLength(1);
  });
  it("repeticao usa snapshot original mesmo apos editar ou ocultar produto",async()=>{
    const id=await product(),items=[{id,quantity:2}],rid=await request(items);
    await asUser(STAFF,()=>db.query("update public.reseller_catalog_products set name='OUTRO NOME FICTICIO',active=false where id=$1",[id]));
    expect(await request(items)).toBe(rid);
    expect((await db.query<{name:string}>("select name from public.reseller_request_items where request_id=$1",[rid])).rows[0].name).toBe("PRODUTO FICTICIO");
    await expect(request([{id,quantity:3}])).rejects.toThrow(/Token/);
    expect((await db.query("select * from public.reseller_requests")).rows).toHaveLength(1);
  });
  it("rejeita nomes e precos forjados, quantidade negativa, IDs duplicados e produto inexistente",async()=>{
    const id=await product();
    for(const items of [[{id,quantity:1,name:"FORJADO"}],[{id,quantity:1,price:1}],[{id,quantity:-1}],[{id,quantity:1.5}],[{id,quantity:100}],[{id,quantity:1},{id,quantity:1}],[{id:TOKEN,quantity:1}]]) await expect(request(items)).rejects.toThrow();
    expect((await db.query("select * from public.reseller_requests")).rows).toHaveLength(0);
  });
  it("produto oculto e perfil nao aprovado bloqueiam pedido",async()=>{
    const id=await product(false);
    await expect(request([{id,quantity:1}])).rejects.toThrow(/indisponivel/);
    await expect(request([{id,quantity:1}],B)).rejects.toThrow(/aprovado/);
    await expect(request([{id,quantity:1}],STAFF)).rejects.toThrow(/aprovado/);
  });
  it("revendedor nao acessa selecao de outra pessoa e nao pode reescrever snapshot",async()=>{
    const id=await product(),rid=await request([{id,quantity:1}]);
    expect((await asUser(B,()=>db.query("select catalog_selection from public.reseller_requests where id=$1",[rid]))).rows).toHaveLength(0);
    await expect(asUser(A,()=>db.query("update public.reseller_requests set catalog_selection='[]' where id=$1",[rid]))).rejects.toThrow();
  });
  it("fotografias privadas so aparecem para aprovados enquanto o produto esta ativo",async()=>{
    const path="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp",id=await product(true,path);
    await asUser(STAFF,()=>db.query("insert into storage.objects(bucket_id,name) values('reseller-products',$1)",[path]));
    expect((await asUser(A,()=>db.query("select * from storage.objects"))).rows).toHaveLength(1);
    expect((await asUser(B,()=>db.query("select * from storage.objects"))).rows).toHaveLength(0);
    await asUser(STAFF,()=>db.query("update public.reseller_catalog_products set active=false where id=$1",[id]));
    expect((await asUser(A,()=>db.query("select * from storage.objects"))).rows).toHaveLength(0);
    await expect(asUser(A,()=>db.query("insert into storage.objects(bucket_id,name) values('reseller-products','FORJADO')"))).rejects.toThrow();
  });
});
