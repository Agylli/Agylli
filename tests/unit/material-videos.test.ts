import { describe, it, expect, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import type { SupabaseClient } from "@supabase/supabase-js";
import { materialFileSpec, materialPathMime } from "@/lib/reseller/material-upload";
import { validMaterial } from "@/lib/reseller/validation";
import { materialCovers } from "@/lib/reseller/material-covers-server";
describe("Vídeos privados de divulgação",()=>{
 it("aceita MP4/WebM até 50 MB e rejeita formatos e tamanho incompatíveis",()=>{
  for(const mime of ["video/mp4","video/webm"]){expect(materialFileSpec(mime,50*1024*1024)).toHaveProperty("extension");expect(()=>materialFileSpec(mime,50*1024*1024+1)).toThrow("50 MB");}
  expect(()=>materialFileSpec("video/quicktime",1024)).toThrow();
  expect(materialPathMime("11111111-1111-4111-8111-111111111111.mp4")).toBe("video/mp4");
  expect(materialPathMime("11111111-1111-4111-8111-111111111111.webm")).toBe("video/webm");
 });
 it("verifica a assinatura do contêiner sem aceitar PDF renomeado ou conteúdo HTML",()=>{
  expect(validMaterial(new Uint8Array([0,0,0,24,102,116,121,112,105,115,111,109]),"video/mp4")).toBe(true);
  expect(validMaterial(new Uint8Array([0x1a,0x45,0xdf,0xa3]),"video/webm")).toBe(true);
  for(const mime of ["video/mp4","video/webm"])expect(validMaterial(new TextEncoder().encode("%PDF-<html>"),mime)).toBe(false);
 });
 it("assina vídeo e capa no bucket privado sem tratar PDF como mídia de reprodução",async()=>{
  const video="11111111-1111-4111-8111-111111111111.mp4",cover="22222222-2222-4222-8222-222222222222.jpg";
  const signed=vi.fn(async(paths:string[])=>({data:paths.map(path=>({path,signedUrl:`https://storage.example.invalid/${path}?token=FICTICIO`}))}));
  const from=vi.fn(()=>({createSignedUrls:signed}));const db={storage:{from}} as unknown as SupabaseClient;
  const base={id:"FICTICIO",title:"FICTICIO",description:"TESTE",category:"divulgacao" as const,active:true,created_at:"2026-11-16"};
  const result=await materialCovers(db,[{...base,file_path:video,cover_path:cover},{...base,id:"OUTRO",file_path:"33333333-3333-4333-8333-333333333333.pdf"}]);
  expect(from).toHaveBeenCalledWith("reseller-materials");expect(signed).toHaveBeenCalledWith([cover,video],900);
  expect(result[0].videoUrl).toContain(video);expect(result[0].coverUrl).toContain(cover);expect(result[1].videoUrl).toBeNull();
 });
 it("migração adiciona apenas formatos sem mudar limite, privacidade ou outros buckets",async()=>{
  const db=new PGlite();try{
   await db.exec("create schema storage;create table storage.buckets(id text primary key,public boolean,file_size_limit bigint,allowed_mime_types text[]);insert into storage.buckets values('reseller-materials',false,52428800,array['application/pdf','image/jpeg']),('outro',false,3145728,array['image/png']);");
   const sql=await readFile(new URL('../../supabase/migrations/20261116210444_material_videos.sql',import.meta.url),'utf8');await db.exec(sql);await db.exec(sql);
   const r=await db.query<{id:string;public:boolean;file_size_limit:number;allowed_mime_types:string[]}>("select * from storage.buckets order by id");
   expect(r.rows[0].allowed_mime_types).toEqual(['image/png']);expect(r.rows[1].allowed_mime_types).toEqual(['application/pdf','image/jpeg','video/mp4','video/webm']);expect(Number(r.rows[1].file_size_limit)).toBe(52428800);expect(r.rows[1].public).toBe(false);
  }finally{await db.close();}
 },20000);
});
