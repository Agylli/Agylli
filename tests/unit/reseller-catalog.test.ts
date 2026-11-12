import { describe,it,expect } from "vitest";
import { addCatalogProduct,catalogSelection,catalogProductInput,filterCatalog,type CatalogProduct } from "@/lib/reseller/catalog";
import { requestWhatsApp } from "@/lib/reseller/whatsapp";
import type { PortalRequest } from "@/lib/reseller/types";
const id="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const product: CatalogProduct={id,name:"PRODUTO FICTÍCIO",sku:"00042",brand:"MARCA FICTÍCIA",category:"TESTE",description:"DADO DE TESTE",image_path:null,active:true};
function order():PortalRequest{return{id,user_id:"FICTICIO",unit_id:"candido-sales",status:"recebido",notes:"NOTA PRIVADA FICTICIA",created_at:"2026-11-12T12:00:00Z",updated_at:"2026-11-12T12:00:00Z",reseller_request_items:[{name:"PRODUTO FICTÍCIO",sku:"00042",quantity:2}]};}
describe("Selecao de produtos e mensagem de atendimento",()=>{
  it("busca ignora acentos e encontra codigo, marca e categoria",()=>{
    expect(filterCatalog([product],"ficticio","")).toHaveLength(1);
    expect(filterCatalog([product],"00042","")).toHaveLength(1);
    expect(filterCatalog([product],"marca", "TESTE")).toHaveLength(1);
    expect(filterCatalog([product],"", "OUTRA")).toHaveLength(0);
  });
  it("mesmo produto soma quantidade, respeitando 99 e 20 itens",()=>{
    expect(addCatalogProduct([{id,quantity:2}],id)).toEqual([{id,quantity:3}]);
    expect(addCatalogProduct([{id,quantity:99}],id)).toEqual([{id,quantity:99}]);
    const full=Array.from({length:20},(_,i)=>({id:String(i),quantity:1}));
    expect(addCatalogProduct(full,id)).toEqual(full);
  });
  it("valida selecao e rejeita IDs duplicados mesmo com caixa diferente",()=>{
    const f=new FormData();f.append("catalog_id",id);f.append("quantity","2");
    expect(catalogSelection(f)).toEqual([{id,quantity:2}]);
    f.append("catalog_id",id.toUpperCase());f.append("quantity","1");
    expect(()=>catalogSelection(f)).toThrow();
    f.delete("catalog_id");f.delete("quantity");f.append("catalog_id",id);f.append("quantity","-1");
    expect(()=>catalogSelection(f)).toThrow();
  });
  it("publicacao exige nome real valido e autorizacao, sem aceitar quebra de linha",()=>{
    const f=new FormData();f.set("name","PRODUTO FICTICIO");f.set("sku","00042");
    expect(()=>catalogProductInput(f)).toThrow();f.set("authorized","on");
    expect(catalogProductInput(f).sku).toBe("00042");f.set("name","OUTRO\nFICTICIO");
    expect(()=>catalogProductInput(f)).toThrow();
  });
  it("WhatsApp usa apenas unidade aprovada, referencia, quantidades e codigos",()=>{
    const result=requestWhatsApp(order(),"PESSOA FICTÍCIA","https://institucional.example");
    const url=new URL(result!.url);expect(url.origin+url.pathname).toBe("https://wa.me/5577988549691");
    expect(url.searchParams.get("text")).toContain("2x PRODUTO FICTÍCIO — código 00042");
    expect(result!.message).toContain("desconto de revendedor vigente");
    expect(result!.message).toContain(`/equipe/pedidos/${id}`);
    expect(result!.message).not.toContain("NOTA PRIVADA");expect(result!.message).not.toContain("30%");
    expect(requestWhatsApp({...order(),unit_id:"forjada"},"FICTICIO")).toBeNull();
  });
  it("lista extensa usa resumo com link e preserva mensagem completa para copiar",()=>{
    const long={...order(),reseller_request_items:Array.from({length:20},()=>({name:"FICTÍCIO ".repeat(17),sku:"0".repeat(80),quantity:99}))};
    const result=requestWhatsApp(long,"PESSOA FICTÍCIA","https://institucional.example")!;
    expect(result.shortened).toBe(true);expect(result.url.length).toBeLessThan(7500);
    expect(result.message).toContain("99x");expect(new URL(result.url).searchParams.get("text")).toContain("Lista completa no painel");
  });
});
