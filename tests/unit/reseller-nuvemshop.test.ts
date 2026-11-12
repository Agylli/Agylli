import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicCatalog } from "@/lib/catalog";
import { resellerNuvemshopProducts, nuvemshopSelection, nuvemshopRequestItems } from "@/lib/reseller/nuvemshop";

const mocks = vi.hoisted(() => ({ session: vi.fn(), require: vi.fn(), catalog: vi.fn(), rpc: vi.fn(), notify: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/reseller/session", () => ({ portalSession: mocks.session, requirePortal: mocks.require }));
vi.mock("@/integrations/nuvemshop/catalog", () => ({ getPublicCatalog: mocks.catalog }));
vi.mock("@/integrations/email/notify", () => ({ notifyStore: mocks.notify }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
import { GET } from "@/app/revendedor/produtos/catalogo/route";
import { submitCatalogRequest } from "@/app/revendedor/produtos/actions";

const catalog: PublicCatalog = { status: "ready", updatedAt: new Date().toISOString(), truncated: false,
  categories: [{ id: "8", name: "TESTE", slug: "teste" }],
  products: [{ id: "123", name: "PRODUTO FICTÍCIO", brand: "MARCA FICTÍCIA", image: null, url: "https://loja.example/produtos/ficticio/", categoryIds: ["8"], price: 87.65, compareAt: 99.99, fromPrice: false, available: false }] };
const token = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
function form() {
  const f = new FormData();
  for (const [key, value] of Object.entries({ source: "nuvemshop", catalog_id: "nuvemshop:123", quantity: "2", token, unit: "candido-sales", acknowledgment: "on", notes: "Cor azul, se houver." })) f.set(key, value);
  return f;
}
beforeEach(() => {
  vi.resetAllMocks();
  const session = { profile: { status: "approved" }, staff: false, db: { rpc: mocks.rpc } };
  mocks.session.mockResolvedValue(session); mocks.require.mockResolvedValue(session);
  mocks.catalog.mockResolvedValue(catalog); mocks.rpc.mockResolvedValue({ data: token, error: null });
  mocks.redirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT"); });
});
afterEach(() => vi.restoreAllMocks());

describe("Catálogo Nuvemshop para revendedores", () => {
  it("projeta apenas identificação e fotografia sem preço, estoque ou links de compra", () => {
    const p = resellerNuvemshopProducts(catalog)[0];
    expect(p).toEqual({ id: "nuvemshop:123", name: "PRODUTO FICTÍCIO", sku: "Nuvemshop #123", brand: "MARCA FICTÍCIA", category: "TESTE", description: "", image_path: null, imageUrl: null, active: true });
    expect(JSON.stringify(p)).not.toMatch(/price|compareAt|available|loja.example/);
    expect(resellerNuvemshopProducts({ ...catalog, products: [{ ...catalog.products[0], name: "A".repeat(240) }] })[0].name).toHaveLength(160);
  });
  it("rejeita quantidades, duplicados, limite e referências inválidas", () => {
    expect(nuvemshopSelection(form())).toEqual([{ id: "nuvemshop:123", quantity: 2 }]);
    for (const quantity of ["0", "100", "1.5", "-1", "x"]) { const f = form(); f.set("quantity", quantity); expect(() => nuvemshopSelection(f)).toThrow(); }
    const duplicate = form(); duplicate.append("catalog_id", "nuvemshop:123"); duplicate.append("quantity", "1"); expect(() => nuvemshopSelection(duplicate)).toThrow();
    const invalid = form(); invalid.set("catalog_id", token); expect(() => nuvemshopSelection(invalid)).toThrow();
    const full = form(); for (let i = 1; i <= 20; i++) { full.append("catalog_id", `nuvemshop:${i}`); full.append("quantity", "1"); } expect(() => nuvemshopSelection(full)).toThrow();
    expect(() => nuvemshopRequestItems([{ id: "nuvemshop:999", quantity: 1 }], catalog)).toThrow();
  });
  it("nega catálogo antes de consultar Nuvemshop a visitantes e não aprovados", async () => {
    mocks.session.mockResolvedValue(null); expect((await GET()).status).toBe(401);
    mocks.session.mockResolvedValue({ profile: { status: "pending" }, staff: false }); expect((await GET()).status).toBe(403);
    expect(mocks.catalog).not.toHaveBeenCalled();
  });
  it("retorna catálogo sem preços só a aprovados ou equipe e sem cache compartilhado", async () => {
    const response = await GET(); expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ status: "ready", products: resellerNuvemshopProducts(catalog), truncated: false });
    mocks.session.mockResolvedValue({ profile: null, staff: true }); expect((await GET()).status).toBe(200);
    mocks.catalog.mockRejectedValue(new Error("SEGREDO FICTÍCIO")); const failed = await GET(); expect(failed.status).toBe(503); expect(await failed.text()).not.toContain("SEGREDO");
  });
  it("valida seleção no servidor e registra snapshot, ignorando nomes e preços forjados", async () => {
    const f = form(); f.set("product", "NOME FORJADO"); f.set("price", "0.01"); f.set("sku", "CODIGO FORJADO");
    await expect(submitCatalogRequest({}, f)).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.rpc).toHaveBeenCalledWith("portal_create_request", { p_unit: "candido-sales", p_items: [{ name: "PRODUTO FICTÍCIO", sku: "Nuvemshop #123", quantity: 2 }], p_notes: "Cor azul, se houver.", p_client_token: token });
    expect(mocks.notify).toHaveBeenCalledWith(token);
    expect(mocks.redirect).toHaveBeenCalledWith(`/revendedor/pedidos/${token}?notice=whatsapp`);
  });
  it("não registra nem prepara WhatsApp se cadastro, catálogo ou gravação falhar", async () => {
    mocks.require.mockResolvedValue({ profile: { status: "pending" } }); expect(await submitCatalogRequest({}, form())).toHaveProperty("error"); expect(mocks.catalog).not.toHaveBeenCalled();
    mocks.require.mockResolvedValue({ profile: { status: "approved" }, db: { rpc: mocks.rpc } });
    mocks.catalog.mockResolvedValue({ ...catalog, products: [] }); expect(await submitCatalogRequest({}, form())).toHaveProperty("error"); expect(mocks.rpc).not.toHaveBeenCalled();
    mocks.catalog.mockResolvedValue(catalog); mocks.rpc.mockResolvedValue({ error: { message: "FALHA FICTÍCIA" }, data: null });
    expect(await submitCatalogRequest({}, form())).toHaveProperty("error"); expect(mocks.redirect).not.toHaveBeenCalled(); expect(mocks.notify).not.toHaveBeenCalled();
  });
  it("falha de email mantém o pedido registrado e permite continuar para WhatsApp", async () => {
    mocks.notify.mockRejectedValue(new Error("FICTICIO"));
    await expect(submitCatalogRequest({}, form())).rejects.toThrow("NEXT_REDIRECT"); expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });
});
