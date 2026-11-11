import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, it, expect, vi } from "vitest";
import { WholesaleAccess } from "@/components/marketing/wholesale-access";
import ContactPage from "@/app/contato/page";
import WholesalePage from "@/app/atacado/page";
import { WholesaleBanner } from "@/components/marketing/wholesale-banner";
import { brand } from "@/config/brand";
function primarySignupLinks(html: string) {
  return [...html.matchAll(/<a\b[^>]*>/g)].filter(([anchor]) =>
    anchor.includes('href="/revendedor/cadastro"') &&
    anchor.includes('class="button button-primary'),
  );
}
afterEach(() => vi.unstubAllEnvs());
describe("Entrada publica para o cadastro do revendedor", () => {
  it("ativa o cadastro interno quando o portal Supabase esta configurado", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.example.invalid");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "sb_publishable_FICTICIO",
    );
    const html = renderToStaticMarkup(createElement(WholesaleAccess));
    expect(primarySignupLinks(html)).toHaveLength(1);
    expect(html).toContain("cadastros são analisados");
    expect(html).toContain('href="/revendedor/entrar"');
  });
  it("mantem contato e acesso em preparacao quando faltam credenciais", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    const html = renderToStaticMarkup(createElement(WholesaleAccess));
    expect(primarySignupLinks(html)).toHaveLength(1);
    expect(html).toContain('href="/contato?assunto=revenda"');
    expect(html).toContain("Cadastro online em preparação");
    expect(html).toContain('href="/revendedor/entrar"');
  });
  it("orienta o contato de revenda para a area ativa em vez de informar preparacao", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.example.invalid");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "sb_publishable_FICTICIO",
    );
    const html = renderToStaticMarkup(
      await ContactPage({
        searchParams: Promise.resolve({ assunto: "revenda" }),
      }),
    );
    expect(html).toContain('href="/revendedor/cadastro"');
    expect(html).toContain('href="/revendedor/entrar"');
    expect(html).toContain("Acessar minha área de revendedor");
    expect(html).toContain("Crie seu acesso na área do revendedor");
  });
  it("mantem cadastro e entrada visiveis no contato sem credenciais", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    const html = renderToStaticMarkup(
      await ContactPage({ searchParams: Promise.resolve({ assunto: "revenda" }) }),
    );
    expect(html).toContain('href="/revendedor/cadastro"');
    expect(html).toContain('href="/revendedor/entrar"');
    expect(html).toContain("cadastro online está em preparação");
  });
  it("direciona menu, campanha e botoes do atacado ao cadastro mesmo sem Supabase", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(brand.navigation.find(item => item.label === "Seja Revendedor")?.href).toBe("/revendedor/cadastro");
    expect(brand.navigation.find(item => item.label === "Entrar")?.href).toBe("/revendedor/entrar");
    const banner = renderToStaticMarkup(createElement(WholesaleBanner));
    expect(primarySignupLinks(banner)).toHaveLength(1);
    const wholesale = renderToStaticMarkup(createElement(WholesalePage));
    expect(primarySignupLinks(wholesale)).toHaveLength(3);
    expect(wholesale).not.toContain("o botão leva à página de atendimento");
  });
  it("preserva o destino B2B externo como opcao adicional ao cadastro interno", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_NUVEMSHOP_B2B_URL", "https://revenda.example/cadastro");
    vi.resetModules();
    const { WholesaleAccess: ConfiguredAccess } = await import("@/components/marketing/wholesale-access");
    const html = renderToStaticMarkup(createElement(ConfiguredAccess));
    expect(primarySignupLinks(html)).toHaveLength(1);
    expect(html).toContain('href="https://revenda.example/cadastro"');
    expect(html).toContain("Acessar atacado na Nuvemshop");
  });
});
