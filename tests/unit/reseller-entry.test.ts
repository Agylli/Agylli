import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, it, expect, vi } from "vitest";
import { WholesaleAccess } from "@/components/marketing/wholesale-access";
import ContactPage from "@/app/contato/page";
afterEach(() => vi.unstubAllEnvs());
describe("Entrada publica para o cadastro do revendedor", () => {
  it("ativa o cadastro interno quando o portal Supabase esta configurado", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.example.invalid");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "sb_publishable_FICTICIO",
    );
    const html = renderToStaticMarkup(createElement(WholesaleAccess));
    expect(html).toContain('href="/revendedor/cadastro"');
    expect(html).toContain("cadastros são analisados");
    expect(html).toContain('href="/revendedor/entrar"');
  });
  it("mantem contato e acesso em preparacao quando faltam credenciais", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    const html = renderToStaticMarkup(createElement(WholesaleAccess));
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
    expect(html).toContain('href="/revendedor"');
    expect(html).toContain("Acessar minha área de revendedor");
    expect(html).toContain("Crie seu acesso na área do revendedor");
  });
});
