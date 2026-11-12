import {beforeEach,describe,it,expect,vi} from "vitest";
const {session,notify,revalidate,redirect}=vi.hoisted(()=>({session:vi.fn(),notify:vi.fn(),revalidate:vi.fn(),redirect:vi.fn()}));
vi.mock("@/lib/reseller/session",()=>({requirePortal:session}));
vi.mock("@/integrations/email/notify",()=>({notifyStore:notify}));
vi.mock("next/cache",()=>({revalidatePath:revalidate}));
vi.mock("next/navigation",()=>({redirect}));
import {submitCatalogRequest} from "@/app/revendedor/produtos/actions";
const id="11111111-1111-4111-8111-111111111111",rid="22222222-2222-4222-8222-222222222222",token="33333333-3333-4333-8333-333333333333";
const rpc=vi.fn();
function form(){const f=new FormData();for(const [k,v] of [["catalog_id",id],["quantity","2"],["unit","candido-sales"],["token",token],["acknowledgment","on"],["notes","TESTE FICTICIO"],["name","NOME FORJADO"]])f.append(k,v);return f;}
beforeEach(()=>{
 vi.clearAllMocks();rpc.mockResolvedValue({data:rid,error:null});notify.mockResolvedValue("pending");
 redirect.mockImplementation((path:string)=>{throw new Error(`REDIRECT ${path}`);});
 session.mockResolvedValue({profile:{status:"approved"},db:{rpc}});
});
describe("Registro antes da preparacao de WhatsApp",()=>{
 it("envia IDs e quantidades ao banco e preserva pedido se o aviso por email falhar",async()=>{
  notify.mockRejectedValue(new Error("FALHA FICTICIA"));
  await expect(submitCatalogRequest({},form())).rejects.toThrow(`/revendedor/pedidos/${rid}?notice=whatsapp`);
  expect(rpc).toHaveBeenCalledWith("portal_create_catalog_request",{p_unit:"candido-sales",p_items:[{id,quantity:2}],p_notes:"TESTE FICTICIO",p_client_token:token});
  expect(rpc.mock.invocationCallOrder[0]).toBeLessThan(notify.mock.invocationCallOrder[0]);
  expect(revalidate).toHaveBeenCalledWith("/equipe");
 });
 it("falha no registro nao dispara aviso nem redireciona como se tivesse salvo",async()=>{
  rpc.mockResolvedValue({data:null,error:{code:"FICTICIO"}});
  expect((await submitCatalogRequest({},form())).error).toBeTruthy();
  expect(notify).not.toHaveBeenCalled();expect(redirect).not.toHaveBeenCalled();
 });
 it("perfil pendente nao pode registrar mesmo forjando o formulario",async()=>{
  session.mockResolvedValue({profile:{status:"pending"},db:{rpc}});
  expect((await submitCatalogRequest({},form())).error).toContain("aprovar");
  expect(rpc).not.toHaveBeenCalled();expect(notify).not.toHaveBeenCalled();
 });
});
