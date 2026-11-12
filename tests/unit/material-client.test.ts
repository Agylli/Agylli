import {describe,it,expect,vi} from "vitest";
import {transferMaterial,type MaterialTransfer,type CompletedMaterialUpload} from "@/lib/reseller/material-client";
import {materialFileSpec,materialPathMime} from "@/lib/reseller/material-upload";
import {guardedFileAction} from "@/lib/reseller/forms";
function form(){const f=new FormData();for(const[k,v]of[["title","CATALOGO FICTICIO"],["description","TESTE"],["category","catalogo"],["authorized","on"]])f.set(k,v);return f;}
function largePdf(){const f=new File(["%PDF-1.7\nFICTICIO"],"TESTE.pdf",{type:"application/pdf"});Object.defineProperty(f,"size",{value:25*1024*1024});return f;}
function api(){return {prepare:vi.fn().mockResolvedValue({path:"11111111-1111-4111-8111-111111111111.pdf",token:"TOKEN-FICTICIO"}),upload:vi.fn().mockResolvedValue({error:null}),finalize:vi.fn().mockResolvedValue({success:"Publicado"}),benefit:vi.fn().mockResolvedValue({success:"Publicado"}),phase:vi.fn()} satisfies MaterialTransfer;}
describe("PDF grande segue ao Storage e nunca ao corpo da acao Vercel",()=>{
 it("25 MB seguem somente ao adaptador Storage; servidor recebe apenas metadados",async()=>{
  const a=api(),f=form(),file=largePdf();f.set("file",file);
  expect((await transferMaterial(f,{current:null},a)).success).toBeTruthy();
  expect(a.prepare).toHaveBeenCalledWith({mime:"application/pdf",size:25*1024*1024});
  expect(a.upload.mock.calls[0][2]).toBe(file);
  for(const value of (a.finalize.mock.calls[0][1] as FormData).values())expect(value).not.toBeInstanceOf(File);
  expect((a.finalize.mock.calls[0][1] as FormData).get("file")).toBeNull();
 });
 it("retenta publicacao sem enviar o arquivo novamente",async()=>{
  const a=api(),f=form(),cache:{current:CompletedMaterialUpload|null}={current:null};f.set("file",largePdf());
  a.finalize.mockResolvedValueOnce({error:"FALHA FICTICIA"});
  await transferMaterial(f,cache,a);await transferMaterial(f,cache,a);
  expect(a.upload).toHaveBeenCalledTimes(1);expect(a.finalize).toHaveBeenCalledTimes(2);expect(cache.current).toBeNull();
 });
 it("envio interrompido nao publica material",async()=>{
  const a=api(),f=form();f.set("file",largePdf());a.upload.mockResolvedValue({error:"FICTICIO"});
  expect((await transferMaterial(f,{current:null},a)).error).toBeTruthy();expect(a.finalize).not.toHaveBeenCalled();
 });
 it("beneficio sem anexo continua disponivel sem upload",async()=>{
  const a=api(),f=form();f.set("category","beneficio");await transferMaterial(f,{current:null},a);
  expect(a.benefit).toHaveBeenCalled();expect(a.prepare).not.toHaveBeenCalled();
 });
 it("limita PDF a 50 MB e imagens a 3 MB; rejeita caminho arbitrario",()=>{
  expect(materialFileSpec("application/pdf",50*1024*1024).extension).toBe("pdf");
  expect(()=>materialFileSpec("application/pdf",51*1024*1024)).toThrow(/50 MB/);
  expect(()=>materialFileSpec("image/jpeg",4*1024*1024)).toThrow(/3 MB/);
  expect(materialPathMime("../../arquivo.pdf")).toBeNull();expect(materialPathMime("https://externo.invalid/a.pdf")).toBeNull();
 });
 it("arquivo grande bloqueado antes de enviar e erro de transporte permanece no formulario",async()=>{
  const send=vi.fn().mockResolvedValue({success:"OK"}),f=form();f.set("file",new File([new Uint8Array(4*1024*1024)],"TESTE.jpg",{type:"image/jpeg"}));
  expect((await guardedFileAction(send,3*1024*1024)({},f)).error).toContain("3 MB");expect(send).not.toHaveBeenCalled();
  send.mockRejectedValue(new Error("PRIVATE FICTICIO"));f.delete("file");
  expect((await guardedFileAction(send,3*1024*1024)({},f)).error).toContain("conexão");
 });
 it("sinais de navegacao do Next nao sao engolidos",async()=>{
  const navigation=Object.assign(new Error("REDIRECT"),{digest:"NEXT_REDIRECT;replace;/equipe;303;"});
  await expect(guardedFileAction(vi.fn().mockRejectedValue(navigation),3)({},new FormData())).rejects.toBe(navigation);
 });
});
