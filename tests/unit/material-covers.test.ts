import { describe, expect, it, vi } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { transferMaterialCover } from "@/lib/reseller/material-cover-client";
import { transferMaterial, type CompletedMaterialUpload } from "@/lib/reseller/material-client";
import type { ActionState } from "@/lib/reseller/validation";

const coverPath = "11111111-1111-4111-8111-111111111111.jpg";
function api() { return { prepare: vi.fn().mockResolvedValue({ path: coverPath, token: "FICTICIO" }), upload: vi.fn().mockResolvedValue({ error: null }), phase: vi.fn(), progress: vi.fn(), finalize: vi.fn<(state:ActionState,form:FormData)=>Promise<ActionState>>().mockResolvedValue({success:"OK"}), benefit: vi.fn<(state:ActionState,form:FormData)=>Promise<ActionState>>().mockResolvedValue({success:"OK"}) }; }
function cover() { return new File([new Uint8Array([255,216,255,0])], "FICTICIO.jpg", { type: "image/jpeg", lastModified: 10 }); }
function form() { const f = new FormData(); f.set("title", "MATERIAL FICTÍCIO"); f.set("description", "TESTE"); f.set("category", "catalogo"); f.set("authorized", "on"); return f; }
describe("Capas opcionais e privadas", () => {
  it("capa inválida ou acima de 3 MB não gera token nem envia arquivo", async () => {
    for (const file of [new File(["FICTICIO"], "a.pdf", { type: "application/pdf" }), new File([new Uint8Array(3*1024*1024+1)], "a.png", { type: "image/png" })]) {
      const a = api(), f = new FormData(); f.set("cover", file);
      expect(await transferMaterialCover(f, { current: null }, a)).toHaveProperty("error"); expect(a.prepare).not.toHaveBeenCalled();
    }
  });
  it("imagem opcional usa Storage e cache de retomada, nunca bytes na publicação", async () => {
    const a=api(), f=form(), fileCache:{current:CompletedMaterialUpload|null}={current:null}, coverCache:{current:CompletedMaterialUpload|null}={current:null};
    f.set("cover",cover()); f.set("file",new File(["%PDF-FICTICIO"],"FICTICIO.pdf",{type:"application/pdf"}));
    a.prepare.mockResolvedValueOnce({path:coverPath,token:"FICTICIO"}).mockResolvedValue({path:"22222222-2222-4222-8222-222222222222.pdf",token:"FICTICIO"});
    a.finalize.mockResolvedValueOnce({error:"FICTICIO"} as never);
    await transferMaterial(f,fileCache,a,coverCache);await transferMaterial(f,fileCache,a,coverCache);
    expect(a.upload).toHaveBeenCalledTimes(2); expect(a.finalize).toHaveBeenCalledTimes(2);
    const metadata=a.finalize.mock.calls[0][1] as FormData;
    expect(metadata.get("cover_path")).toBe(coverPath);for(const value of metadata.values())expect(value).not.toBeInstanceOf(File);
    expect(fileCache.current).toBeNull();expect(coverCache.current).toBeNull();
  });
  it("benefício com capa e sem PDF continua válido; falha de capa não publica", async () => {
    const f=form(),a=api();f.set("category","beneficio");f.set("cover",cover());
    await transferMaterial(f,{current:null},a);expect(a.benefit).toHaveBeenCalled();expect((a.benefit.mock.calls[0][1] as FormData).get("cover_path")).toBe(coverPath);
    a.benefit.mockClear();a.upload.mockResolvedValue({error:"FALHA"} as never);
    expect(await transferMaterial(f,{current:null},a)).toHaveProperty("error");expect(a.benefit).not.toHaveBeenCalled();
  });
  it("migração mantém arquivos antigos e libera capas apenas para aprovados de materiais ativos", async () => {
    const db=new PGlite();
    try {
      await db.exec(`create role anon;create role authenticated;create schema storage;
        create function public.portal_is_staff() returns boolean language sql as $$select current_setting('test.staff',true)='true'$$;
        create function public.portal_is_approved() returns boolean language sql as $$select current_setting('test.approved',true)='true'$$;
        create table public.reseller_resources(id int,file_path text,active boolean);
        insert into public.reseller_resources values(1,'arquivo.pdf',true);
        create table storage.objects(bucket_id text,name text);alter table storage.objects enable row level security;
        grant usage on schema storage to anon,authenticated;grant select on storage.objects,public.reseller_resources to anon,authenticated;
        create policy portal_material_read on storage.objects for select to authenticated using(false);`);
      const sql=await readFile(new URL('../../supabase/migrations/20261116205454_material_covers.sql',import.meta.url),'utf8');await db.exec(sql);
      expect((await db.query("select file_path,cover_path from public.reseller_resources")).rows).toEqual([{file_path:"arquivo.pdf",cover_path:null}]);
      await db.exec(`update public.reseller_resources set cover_path='${coverPath}' where id=1;insert into public.reseller_resources values(2,'oculto.pdf',false,'22222222-2222-4222-8222-222222222222.png');
        insert into storage.objects values('reseller-materials','arquivo.pdf'),('reseller-materials','${coverPath}'),('reseller-materials','22222222-2222-4222-8222-222222222222.png'),('reseller-materials','temporario.jpg');`);
      await expect(db.exec("update public.reseller_resources set cover_path='https://externo.invalid/foto.jpg' where id=1")).rejects.toThrow();
      for(const [role,staff,approved,count] of [['anon',false,false,0],['authenticated',false,false,0],['authenticated',false,true,2],['authenticated',true,false,4]] as const) {
        await db.exec(`set role ${role};set test.staff='${staff}';set test.approved='${approved}';`);
        expect((await db.query('select * from storage.objects')).rows).toHaveLength(count);await db.exec('reset role');
      }
    } finally {await db.close();}
  },20000);
});
