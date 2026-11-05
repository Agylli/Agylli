import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_NUVEMSHOP_URL", "");
  vi.stubEnv("NEXT_PUBLIC_NUVEMSHOP_B2B_URL", "");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
});
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe("Contrato de ambiente dos canais comerciais", () => {
  it("mantém os destinos provisórios quando as URLs não foram fornecidas", async () => {
    const { brand } = await import("@/config/brand");
    expect(brand.links).toEqual({ retail: "/loja-em-breve", wholesale: "/contato?assunto=revenda", site: null });
  });

  it("permite ativar varejo sem ativar cadastro B2B ou indexação", async () => {
    vi.stubEnv("NEXT_PUBLIC_NUVEMSHOP_URL", "https://varejo.example/colecao?canal=institucional");
    const { brand } = await import("@/config/brand");
    expect(brand.links.retail).toBe("https://varejo.example/colecao?canal=institucional");
    expect(brand.links.wholesale).toBe("/contato?assunto=revenda");
    expect(brand.links.site).toBeNull();
  });

  it("lê as três variáveis preservando caminho, query e fragmento do acesso B2B", async () => {
    vi.stubEnv("NEXT_PUBLIC_NUVEMSHOP_URL", "https://varejo.example/");
    vi.stubEnv("NEXT_PUBLIC_NUVEMSHOP_B2B_URL", "https://revenda.example/cadastro?origem=site#inicio");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://institucional.example");
    const { brand } = await import("@/config/brand");
    expect(brand.links).toEqual({ retail: "https://varejo.example/", wholesale: "https://revenda.example/cadastro?origem=site#inicio", site: "https://institucional.example/" });
  });
});
