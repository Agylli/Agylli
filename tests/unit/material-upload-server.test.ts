import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
import {PGlite} from "@electric-sql/pglite";
import {readFile} from "node:fs/promises";
const {session,revalidate}=vi.hoisted(()=>({session:vi.fn(),revalidate:vi.fn()}));
vi.mock("@/lib/reseller/session",()=>({requirePortal:session}));
vi.mock("next/cache",()=>({revalidatePath:revalidate}));
import {prepareMaterialUpload,finalizeMaterialUpload} from "@/app/equipe/material-upload-actions";
const path="11111111-1111-4111-8111-111111111111.pdf",existing=vi.fn(),insert=vi.fn(),info=vi.fn(),signed=vi.fn(),remove=vi.fn(),prepare=vi.fn(),fetcher=vi.fn();
const bucket={info,createSignedUrl:signed,remove,createSignedUploadUrl:prepare};
beforeEach(()=>{
 vi.clearAllMocks();existing.mockReset().mockResolvedValue({data:null,error:null});insert.mockReset().mockResolvedValue({data:{id:"FICTICIO"},error:null});
 info.mockReset().mockResolvedValue({data:{size:25*1024*1024,contentType:"application/pdf"},error:null});
 signed.mockReset().mockResolvedValue({data:{signedUrl:"https://project.example.invalid/storage/v1/object/sign/FICTICIO"},error:null});
 remove.mockReset().mockResolvedValue({error:null});
 prepare.mockReset().mockImplementation(async(path:string)=>({data:{path,token:"TOKEN-FICTICIO"},error:null}));
 fetcher.mockReset().mockImplementation(async()=>new Response("%PDF-1.7\nFICTICIO",{status:206}));vi.stubGlobal("fetch",fetcher);
 vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL","https://project.example.invalid");vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY","sb_publishable_FICTICIO");
 session.mockReset().mockResolvedValue({db:{storage:{from:()=>bucket},from:()=>({select:()=>({eq:()=>({maybeSingle:existing})}),insert:(value:unknown)=>{insert(value);return{select:()=>({single:async()=>insert.mock.results.at(-1)!.value})};}})}});
});
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
function form(){const f=new FormData();for(const[k,v]of[["path",path],["title","CATALOGO FICTICIO"],["description","TESTE"],["category","catalogo"],["authorized","on"]])f.set(k,v);return f;}
describe("Publicacao de arquivo grande somente apos validacao",()=>{
 it("assina apenas caminho novo e exige equipe",async()=>{
  const result=await prepareMaterialUpload({mime:"application/pdf",size:25*1024*1024});
  expect(session).toHaveBeenCalledWith(true);expect(result).toMatchObject({token:"TOKEN-FICTICIO"});
  expect(prepare.mock.calls[0][0]).toMatch(/^[0-9a-f-]{36}\.pdf$/);expect(prepare.mock.calls[0][1]).toEqual({upsert:false});
 });
 it("nao emite token para arquivo acima do limite",async()=>{
  expect(await prepareMaterialUpload({mime:"application/pdf",size:51*1024*1024})).toHaveProperty("error");expect(prepare).not.toHaveBeenCalled();
  vi.stubEnv("NEXT_PUBLIC_RESELLER_PDF_LIMIT_MB","100");
  expect(await prepareMaterialUpload({mime:"application/pdf",size:101*1024*1024})).toHaveProperty("error");expect(prepare).not.toHaveBeenCalled();
 });
 it("confere tamanho real e cabecalho por Range antes de publicar",async()=>{
  expect((await finalizeMaterialUpload({},form())).success).toContain("publicado");
  expect(fetcher.mock.calls[0][1]).toMatchObject({headers:{Range:"bytes=0-15"},cache:"no-store",redirect:"error"});
  expect(insert.mock.calls[0][0]).toMatchObject({file_path:path,title:"CATALOGO FICTICIO"});
  expect(insert.mock.invocationCallOrder[0]).toBeGreaterThan(fetcher.mock.invocationCallOrder[0]);
 });
 it("arquivo falso ou tamanho real excessivo nao e publicado",async()=>{
  fetcher.mockImplementation(async()=>new Response("<html>FICTICIO</html>"));
  expect((await finalizeMaterialUpload({},form())).error).toContain("conteúdo");expect(insert).not.toHaveBeenCalled();expect(remove).toHaveBeenCalledWith([path]);
  info.mockResolvedValue({data:{size:51*1024*1024,contentType:"application/pdf"},error:null});
  expect((await finalizeMaterialUpload({},form())).error).toContain("50 MB");expect(insert).not.toHaveBeenCalled();
 });
 it("caminhos arbitrarios e origem inesperada nao geram download ou publicacao",async()=>{
  const f=form();f.set("path","../../segredo.pdf");expect((await finalizeMaterialUpload({},f)).error).toBeTruthy();expect(info).not.toHaveBeenCalled();
  signed.mockResolvedValue({data:{signedUrl:"https://externo.invalid/PRIVATE"},error:null});
  expect((await finalizeMaterialUpload({},form())).error).toBeTruthy();expect(fetcher).not.toHaveBeenCalled();expect(insert).not.toHaveBeenCalled();
 });
 it("repeticao de publicacao ja concluida nao duplica nem baixa arquivo",async()=>{
  existing.mockResolvedValue({data:{id:"FICTICIO"},error:null});
  expect((await finalizeMaterialUpload({},form())).success).toContain("já está cadastrado");expect(fetcher).not.toHaveBeenCalled();expect(insert).not.toHaveBeenCalled();
 });
 it("falha no Storage nao publica metadados como se o arquivo estivesse pronto",async()=>{
  info.mockResolvedValue({data:null,error:{code:"FICTICIO"}});
  expect((await finalizeMaterialUpload({},form())).error).toBeTruthy();expect(insert).not.toHaveBeenCalled();
 });
 it("migration altera apenas o limite do bucket privado de materiais e pode ser repetida",async()=>{
  const db=new PGlite();
  try{
   await db.exec("create schema storage;create table storage.buckets(id text primary key,file_size_limit bigint,public boolean);insert into storage.buckets values('reseller-materials',3145728,false),('reseller-products',3145728,false);");
   const sql=await readFile(new URL("../../supabase/migrations/202611120002_material_upload_limit.sql",import.meta.url),"utf8");
   await db.exec(sql);await db.exec(sql);
   const r=await db.query<{id:string;file_size_limit:number;public:boolean}>("select * from storage.buckets order by id");
   expect(Number(r.rows[0].file_size_limit)).toBe(52428800);expect(Number(r.rows[1].file_size_limit)).toBe(3145728);expect(r.rows.every(row=>!row.public)).toBe(true);
   const larger=await readFile(new URL("../../supabase/migrations/202611120003_material_upload_100mb.sql",import.meta.url),"utf8");
   await db.exec(larger);await db.exec(larger);
   const updated=await db.query<{id:string;file_size_limit:number;public:boolean}>("select * from storage.buckets order by id");
   expect(Number(updated.rows[0].file_size_limit)).toBe(104857600);expect(Number(updated.rows[1].file_size_limit)).toBe(3145728);expect(updated.rows.every(row=>!row.public)).toBe(true);
  }finally{await db.close();}
 },20000);
});
