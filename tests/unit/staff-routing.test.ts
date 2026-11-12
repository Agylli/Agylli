import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
const {server,redirect}=vi.hoisted(()=>({server:vi.fn(),redirect:vi.fn()}));
vi.mock("server-only",()=>({}));
vi.mock("@/integrations/supabase/server",()=>({serverSupabase:server}));
vi.mock("next/navigation",()=>({redirect}));
import {destinationAfterAuthentication} from "@/lib/reseller/destination";
import {signIn} from "@/app/revendedor/actions";
import {requirePortal,portalSession} from "@/lib/reseller/session";
import ResellerHome from "@/app/revendedor/page";
import type {SupabaseClient} from "@supabase/supabase-js";
const rpc=vi.fn(),getUser=vi.fn(),signInWithPassword=vi.fn();
const profile={id:"11111111-1111-4111-8111-111111111111",name:"PESSOA FICTICIA ADM",email:"ficticio@example.invalid",phone:"77999990000",unit_id:"candido-sales",status:"pending"};
const from=vi.fn(()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:profile,error:null})})})}));
const db={rpc,from,auth:{getUser,signInWithPassword}};
beforeEach(()=>{
 vi.clearAllMocks();rpc.mockReset().mockResolvedValue({data:false,error:null});
 getUser.mockReset().mockResolvedValue({data:{user:{id:profile.id,email:profile.email}},error:null});
 signInWithPassword.mockReset().mockResolvedValue({error:null});server.mockResolvedValue(db);
 redirect.mockImplementation((path:string)=>{throw new Error(`REDIRECT ${path}`);});
 vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL","https://project.example.invalid");vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY","sb_publishable_FICTICIO");
});
afterEach(()=>vi.unstubAllEnvs());
function form(){const f=new FormData();f.set("email",profile.email);f.set("password","SENHA-FICTICIA-123");f.set("next","/revendedor");return f;}
describe("Entrada por permissao da equipe",()=>{
 it("login comum da equipe vai ao painel sem exigir next manual",async()=>{
  rpc.mockResolvedValue({data:true,error:null});
  await expect(signIn({},form())).rejects.toThrow("REDIRECT /equipe");expect(rpc).toHaveBeenCalledWith("portal_is_staff");
 });
 it("nome ADM e papel forjado no formulario nao promovem revendedor",async()=>{
  const f=form();f.set("role","admin");await expect(signIn({},f)).rejects.toThrow("REDIRECT /revendedor");
 });
 it.each([{}, {notice:"restricted"}, {notice:"access-check-error"}])("pagina pessoal sem aba redireciona equipe ja conectada: %j",async(query)=>{
  rpc.mockResolvedValue({data:true,error:null});
  await expect(ResellerHome({searchParams:Promise.resolve(query)})).rejects.toThrow("REDIRECT /equipe");
 });
 it("aba pessoal explicita continua disponivel para integrantes",async()=>{
  rpc.mockResolvedValue({data:true,error:null});
  expect(await ResellerHome({searchParams:Promise.resolve({aba:"conta"})})).toBeTruthy();expect(redirect).not.toHaveBeenCalled();
 });
 it("cliente continua bloqueado ao tentar o painel",async()=>{
  await expect(requirePortal(true)).rejects.toThrow("restricted");
 });
 it("falha ao conferir papel nao concede acesso nem informa falsamente falta de permissao",async()=>{
  rpc.mockResolvedValue({data:true,error:{code:"FICTICIO"}});
  expect(await portalSession()).toMatchObject({staff:false,staffError:true});
  await expect(requirePortal(true)).rejects.toThrow("access-check-error");
  expect(await destinationAfterAuthentication(db as unknown as Pick<SupabaseClient,"rpc">,null)).toContain("access-check-error");
 });
 it("sinal de equipe precisa ser booleano e retornos externos sao descartados",async()=>{
  rpc.mockResolvedValue({data:"true",error:null});
  expect(await destinationAfterAuthentication(db as unknown as Pick<SupabaseClient,"rpc">,"https://externo.invalid")).toBe("/revendedor");
  rpc.mockResolvedValue({data:true,error:null});
  expect(await destinationAfterAuthentication(db as unknown as Pick<SupabaseClient,"rpc">,"//externo.invalid")).toBe("/equipe");
 });
 it("recuperacao de senha preserva destino sem depender do papel",async()=>{
  expect(await destinationAfterAuthentication(db as unknown as Pick<SupabaseClient,"rpc">,"/revendedor/redefinir-senha")).toBe("/revendedor/redefinir-senha");expect(rpc).not.toHaveBeenCalled();
 });
});
