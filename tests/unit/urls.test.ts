import { describe, expect, it } from "vitest";
import { emailAddress, publicHttpsUrl, retailUrl, whatsappUrl, wholesaleUrl } from "@/lib/urls";

describe("Rotas comerciais e contatos seguros", () => {
  it.each([undefined, "", "not a url", "javascript:alert(1)", "http://example.com", "/loja", "https://user:password@example.com"])("rejeita URL insegura ou ausente: %s", value => {
    expect(publicHttpsUrl(value)).toBeNull();
    expect(retailUrl(value)).toBe("/loja-em-breve");
    expect(wholesaleUrl(value)).toBe("/contato?assunto=revenda");
  });
  it("usa a URL comercial HTTPS configurada, preservando o caminho", () => {
    const url = "https://store.example.com/colecao?origem=agylli";
    expect(retailUrl(url)).toBe(url);
    expect(wholesaleUrl(url)).toBe(url);
  });
  it("cria links somente para contatos válidos", () => {
    expect(whatsappUrl("5511999999999")).toBe("https://wa.me/5511999999999");
    expect(whatsappUrl("+55 (11) abc")).toBeNull();
    expect(whatsappUrl(undefined)).toBeNull();
    expect(emailAddress("atendimento@example.com")).toBe("atendimento@example.com");
    expect(emailAddress("test@example.com\r\nBcc:other@example.com")).toBeNull();
    expect(emailAddress("")).toBeNull();
  });
});
