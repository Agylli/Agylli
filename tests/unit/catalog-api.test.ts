import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }));
import { catalogConfiguration, getPublicCatalog, readPages } from "@/integrations/nuvemshop/catalog";
import { GET } from "@/app/api/catalogo/route";

const token = "TOKEN-FICTICIO-NAO-REAL";
const config = { storeId: "77", token };
beforeEach(() => {
  vi.stubEnv("NUVEMSHOP_STORE_ID", "77"); vi.stubEnv("NUVEMSHOP_ACCESS_TOKEN", token); vi.stubEnv("NEXT_PUBLIC_NUVEMSHOP_URL", "https://loja.example/");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("Fronteira do servidor e transporte de catálogo", () => {
  it("sem configuração não consulta plataforma e retorna estado não configurado", async () => {
    vi.stubEnv("NUVEMSHOP_ACCESS_TOKEN", "");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect(catalogConfiguration()).toBeNull(); expect(await getPublicCatalog()).toBeNull();
    const result = await GET(); expect(await result.json()).toEqual({ status: "not_configured" });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("usa apenas GET, host fixo, cabeçalho privado, timeout e filtro de publicados", async () => {
    const fetch = vi.fn(async () => Response.json([])); vi.stubGlobal("fetch", fetch);
    await readPages("products", config, Date.now() + 10000);
    const [url, options] = fetch.mock.calls[0] as unknown as [URL, RequestInit];
    expect(url.origin).toBe("https://api.nuvemshop.com.br"); expect(url.pathname).toBe("/2025-03/77/products");
    expect(url.searchParams.get("published")).toBe("true"); expect(url.href).not.toContain(token);
    expect(options).toMatchObject({ method: "GET", redirect: "error", cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
    expect(options.signal).toBeDefined();
  });
  it("segue paginação legítima sem encaminhar credenciais a outros hosts ou recursos", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(Response.json([{ id: 1 }], { headers: { Link: '<https://api.nuvemshop.com.br/2025-03/77/products?page=2>; rel="next"' } })).mockResolvedValueOnce(Response.json([{ id: 2 }]));
    vi.stubGlobal("fetch", fetch);
    expect((await readPages("products", config, Date.now() + 10000)).rows).toEqual([{ id: 1 }, { id: 2 }]);
    expect(fetch).toHaveBeenCalledTimes(2);
    fetch.mockReset().mockResolvedValue(Response.json([], { headers: { Link: '<https://evil.example/products>; rel="next"' } }));
    await expect(readPages("products", config, Date.now() + 10000)).rejects.toThrow("pagination");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("não expõe token, custos ou corpo de erro quando a autorização falha", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(`SEGREDO ${token}`, { status: 401 })));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await GET(); expect(result.status).toBe(503); expect(await result.json()).toEqual({ status: "unavailable", code: "authorization" });
    expect(result.headers.get("Cache-Control")).toBe("no-store");
    expect(JSON.stringify(warn.mock.calls)).not.toMatch(/TOKEN-FICTICIO|SEGREDO/);
  });
  it("remove os dados internos antes de devolver JSON ao navegador", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: URL) => Response.json(url.pathname.endsWith("categories") ? [] : [{ id: 1, name: "FICTÍCIO", handle: "ficticio", published: true, variants: [{ price: "12.50", stock_management: false, cost: "CUSTO-PRIVADO", sku: "SKU-PRIVADO" }], secret: token }])));
    const result = await GET(); const text = await result.text();
    expect(result.status).toBe(200); expect(JSON.parse(text).products[0].price).toBe(12.5);
    expect(text).not.toMatch(/CUSTO|SKU-PRIVADO|TOKEN-FICTICIO|secret|variants/);
  });
  it("bloqueia configuração inválida sem usar o token em uma requisição", async () => {
    vi.stubEnv("NUVEMSHOP_STORE_ID", "../outra-loja");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch); vi.spyOn(console, "warn").mockImplementation(() => {});
    const response = await GET(); expect(response.status).toBe(503); expect(fetch).not.toHaveBeenCalled();
  });
  it("recusa erro de limite e corpo inesperado em vez de publicar um catálogo vazio falso", async () => {
    const fetch = vi.fn(async () => new Response("", { status: 429 })); vi.stubGlobal("fetch", fetch);
    await expect(readPages("products", config, Date.now() + 10000)).rejects.toThrow("rate_limit");
    fetch.mockImplementation(async () => Response.json({ error: "unexpected" }));
    await expect(readPages("products", config, Date.now() + 10000)).rejects.toThrow("response");
  });
});
