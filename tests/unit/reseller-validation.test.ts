import { describe, it, expect } from "vitest";
import {
  requestInput,
  signupInput,
  safePortalNext,
  validMaterial,
  canTransition,
} from "@/lib/reseller/validation";
import { requestEmail } from "@/integrations/email/request-message";
function requestForm() {
  const f = new FormData();
  for (const [key, value] of [
    ["unit", "candido-sales"],
    ["token", "44444444-4444-4444-8444-444444444444"],
    ["product", "PRODUTO FICTÍCIO"],
    ["sku", "FICT-001"],
    ["quantity", "2"],
    ["acknowledgment", "on"],
  ])
    f.append(key, value);
  return f;
}
function signupForm() {
  const f = new FormData();
  for (const [key, value] of [
    ["name", "Revendedor Fictício"],
    ["email", "ficticio@example.invalid"],
    ["password", "uma-senha-ficticia-123"],
    ["phone", "(77) 99999-0000"],
    ["unit", "candido-sales"],
    ["consent", "on"],
  ])
    f.set(key, value);
  return f;
}
describe("Entradas nao confiaveis do portal", () => {
  it("preserva SKU textual, exige reconhecimento e rejeita quantidade invalida", () => {
    const form = requestForm();
    expect(requestInput(form).items[0]).toEqual({
      name: "PRODUTO FICTÍCIO",
      sku: "FICT-001",
      quantity: 2,
    });
    for (const value of ["0", "-1", "1.5", "1e2", "100", ""]) {
      form.set("quantity", value);
      expect(() => requestInput(form)).toThrow();
    }
    form.set("quantity", "1");
    form.delete("acknowledgment");
    expect(() => requestInput(form)).toThrow();
  });
  it("rejeita arrays desalinhados, carga excessiva, unidade forjada e token invalido", () => {
    const form = requestForm();
    form.append("product", "FICTICIO 2");
    expect(() => requestInput(form)).toThrow();
    const other = requestForm();
    other.set("unit", "outra");
    expect(() => requestInput(other)).toThrow();
    other.set("unit", "candido-sales");
    other.set("token", "forjado");
    expect(() => requestInput(other)).toThrow();
    const many = requestForm();
    for (let i = 0; i < 20; i++) {
      many.append("product", "FICTICIO");
      many.append("sku", "");
      many.append("quantity", "1");
    }
    expect(() => requestInput(many)).toThrow();
  });
  it("cadastro exige contato, senha adequada, unidade real e consentimento", () => {
    const form = signupForm();
    expect(signupInput(form).email).toBe("ficticio@example.invalid");
    for (const [key, value] of [
      ["email", "invalido"],
      ["password", "curta"],
      ["phone", "123"],
      ["unit", "forjada"],
      ["consent", ""],
    ]) {
      const invalid = signupForm();
      invalid.set(key, value);
      expect(() => signupInput(invalid)).toThrow();
    }
  });
  it("retornos de autenticacao nao permitem redirecionamento externo", () => {
    for (const value of [
      "https://example.invalid",
      "//evil.invalid",
      "/equipe/../externo",
      "javascript:alert(1)",
      null,
      undefined,
    ])
      expect(safePortalNext(value)).toBe("/revendedor");
    expect(safePortalNext("/equipe")).toBe("/equipe");
    expect(safePortalNext("/revendedor/redefinir-senha")).toBe(
      "/revendedor/redefinir-senha",
    );
  });
  it("recusa HTML, SVG, executavel ou imagem falsamente identificada no upload", () => {
    expect(
      validMaterial(
        new TextEncoder().encode("%PDF-1.7\nFICTICIO"),
        "application/pdf",
      ),
    ).toBe(true);
    expect(
      validMaterial(
        new TextEncoder().encode("<html>FICTICIO</html>"),
        "application/pdf",
      ),
    ).toBe(false);
    expect(
      validMaterial(new TextEncoder().encode("<svg/>"), "image/svg+xml"),
    ).toBe(false);
    expect(
      validMaterial(new Uint8Array(3 * 1024 * 1024 + 1), "image/png"),
    ).toBe(false);
  });
  it("nao permite pular etapas ou reabrir atendimento concluido", () => {
    expect(canTransition("recebido", "em_analise")).toBe(true);
    expect(canTransition("recebido", "entregue")).toBe(false);
    expect(canTransition("entregue", "recebido")).toBe(false);
    expect(canTransition("__proto__", "recebido")).toBe(false);
  });
  it("email usa texto simples, unidade aprovada e identificador do pedido", () => {
    const email = requestEmail({
      id: "44444444-4444-4444-8444-444444444444",
      name: "FICTICIO",
      email: "ficticio@example.invalid",
      phone: "(77) 99999-0000",
      unit: "candido-sales",
      items: [{ name: "<script>FICTICIO</script>", sku: "00001", quantity: 2 }],
      notes: "FICTICIO",
      origin: "https://institucional.example",
    });
    expect(email.subject).toContain("AG-44444444");
    expect(email.text).toContain("Unidade de Cândido Sales");
    expect(email.text).toContain("Código".toLowerCase());
    expect(email.text).toContain("/equipe/pedidos/44444444");
    expect(email).not.toHaveProperty("html");
  });
});
