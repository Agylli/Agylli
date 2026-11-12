import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { server, ssr } = vi.hoisted(() => ({ server: vi.fn(), ssr: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/integrations/supabase/server", () => ({ serverSupabase: server }));
vi.mock("@supabase/ssr", () => ({ createServerClient: ssr }));

import { canonicalPortalUrl } from "@/lib/reseller/auth-return";
import { proxy } from "@/proxy";
import { GET as confirm } from "@/app/auth/confirm/route";
import { GET as callback } from "@/app/auth/callback/route";
import { resendConfirmation } from "@/app/revendedor/actions";

const origin = "https://institucional.example";
const verify = vi.fn(), exchange = vi.fn(), resend = vi.fn(), role = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", origin);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
  verify.mockReset().mockResolvedValue({ error: null });
  exchange.mockReset().mockResolvedValue({ error: null });
  resend.mockReset().mockResolvedValue({ error: null });
  role.mockReset().mockResolvedValue({data:false,error:null});
  server.mockReset().mockResolvedValue({ rpc:role, auth: { verifyOtp: verify, exchangeCodeForSession: exchange, resend } });
});
afterEach(() => vi.unstubAllEnvs());

describe("Origem e retorno seguro da autenticacao", () => {
  it("mantem cadastro e callback na mesma origem, com caminho e parametros preservados", () => {
    const request = new URL("https://alias.example/auth/callback?code=FICTICIO&next=%2Fequipe");
    expect(canonicalPortalUrl(request, origin, true)?.href).toBe(`${origin}/auth/callback?code=FICTICIO&next=%2Fequipe`);
    expect(canonicalPortalUrl(new URL(`${origin}/revendedor/entrar`), origin, true)).toBeNull();
    expect(canonicalPortalUrl(request, undefined, true)).toBeNull();
    expect(canonicalPortalUrl(request, "http://localhost:3000", true)).toBeNull();
    expect(canonicalPortalUrl(request, origin, false)).toBeNull();
    expect(canonicalPortalUrl(new URL("https://alias.example//externo.invalid"), origin, true)?.origin).toBe(origin);
  });
  it("redireciona GET antes de criar cookies e bloqueia POST na origem incorreta", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const result = await proxy(new NextRequest("https://alias.example/revendedor/cadastro"));
    expect(result.status).toBe(307);
    expect(result.headers.get("location")).toBe(`${origin}/revendedor/cadastro`);
    const post = await proxy(new NextRequest("https://alias.example/revendedor/entrar", { method: "POST", body: "senha=FICTICIA" }));
    expect(post.status).toBe(400);
    expect(post.headers.get("location")).toBeNull();
    expect(await post.text()).not.toContain("FICTICIA");
    expect(ssr).not.toHaveBeenCalled();
    expect(result.headers.get("cache-control")).toContain("no-store");
    expect(result.headers.get("referrer-policy")).toBe("no-referrer");
    const sameOrigin = await proxy(new NextRequest(`${origin}/revendedor/entrar`, { method: "POST" }));
    expect(sameOrigin.status).toBe(200);
  });
  it("confirma token hash e envia somente a um destino interno permitido", async () => {
    const result = await confirm(new NextRequest(`${origin}/auth/confirm?token_hash=FICTICIO&type=signup&next=https://externo.invalid`));
    expect(verify).toHaveBeenCalledExactlyOnceWith({ token_hash: "FICTICIO", type: "signup" });
    expect(result.headers.get("location")).toBe(`${origin}/revendedor`);
    expect(result.headers.get("cache-control")).toContain("no-store");
    expect(result.headers.get("referrer-policy")).toBe("no-referrer");
  });
  it("recuperacao valida abre apenas a tela de nova senha", async () => {
    const result = await confirm(new NextRequest(`${origin}/auth/confirm?token_hash=FICTICIO&type=recovery&next=/equipe`));
    expect(result.headers.get("location")).toBe(`${origin}/revendedor/redefinir-senha`);
  });
  it("encaminha codigo PKCE recebido em confirm ao callback sem consumir o token duas vezes", async () => {
    const result = await confirm(new NextRequest(`${origin}/auth/confirm?code=FICTICIO&next=https://externo.invalid`));
    const location = new URL(result.headers.get("location")!);
    expect(location.pathname).toBe("/auth/callback");
    expect(location.searchParams.get("code")).toBe("FICTICIO");
    expect(location.searchParams.get("next")).toBe("/revendedor");
    expect(server).not.toHaveBeenCalled();
  });
  it("nao verifica tipo invalido nem concede acesso para token expirado ou reutilizado", async () => {
    await confirm(new NextRequest(`${origin}/auth/confirm?token_hash=FICTICIO&type=forjado`));
    expect(server).not.toHaveBeenCalled();
    verify.mockResolvedValue({ error: { code: "otp_expired", message: "DADO PRIVADO FICTICIO" } });
    const result = await confirm(new NextRequest(`${origin}/auth/confirm?token_hash=FICTICIO&type=signup`));
    expect(result.headers.get("location")).toBe(`${origin}/revendedor/entrar?notice=confirmation-error`);
    expect([...result.headers.values()].join(" ")).not.toContain("FICTICIO");
  });
  it("callback valida codigo e preserva destino permitido da equipe", async () => {
    const result = await callback(new NextRequest(`${origin}/auth/callback?code=FICTICIO&next=/equipe`));
    expect(exchange).toHaveBeenCalledExactlyOnceWith("FICTICIO");
    expect(result.headers.get("location")).toBe(`${origin}/equipe`);
    expect(result.headers.get("cache-control")).toContain("no-store");
  });
  it("confirmacao e callback comuns direcionam integrante autorizado para equipe",async()=>{
    role.mockResolvedValue({data:true,error:null});
    for(const result of [
      await callback(new NextRequest(`${origin}/auth/callback?code=FICTICIO`)),
      await confirm(new NextRequest(`${origin}/auth/confirm?token_hash=FICTICIO&type=signup`)),
    ])expect(result.headers.get("location")).toBe(`${origin}/equipe`);
  });
  it("identifica perda do verificador sem afirmar que o email deixou de ser confirmado", async () => {
    exchange.mockResolvedValue({ error: { code: "pkce_code_verifier_not_found" } });
    const result = await callback(new NextRequest(`${origin}/auth/callback?code=FICTICIO`));
    expect(result.headers.get("location")).toBe(`${origin}/revendedor/entrar?notice=confirmation-session-error`);
  });
  it("indisponibilidade do provedor retorna ao login sem expor o erro ou abrir sessao", async () => {
    exchange.mockRejectedValue(new Error("ERRO PRIVADO FICTICIO"));
    verify.mockRejectedValue(new Error("ERRO PRIVADO FICTICIO"));
    for (const result of [
      await callback(new NextRequest(`${origin}/auth/callback?code=FICTICIO`)),
      await confirm(new NextRequest(`${origin}/auth/confirm?token_hash=FICTICIO&type=signup`)),
    ]) {
      expect(result.headers.get("location")).toBe(`${origin}/revendedor/entrar?notice=confirmation-error`);
    }
  });
});

describe("Reenvio de confirmacao solicitado pelo visitante", () => {
  function form(email = "ficticio@example.invalid") {
    const form = new FormData(); form.set("email", email); return form;
  }
  it("usa somente o callback confiavel e remove espacos do email", async () => {
    const result = await resendConfirmation({}, form(" Ficticio@Example.invalid "));
    expect(resend).toHaveBeenCalledExactlyOnceWith({ type: "signup", email: "Ficticio@Example.invalid", options: { emailRedirectTo: `${origin}/auth/callback` } });
    expect(result.success).toContain("Se houver um cadastro");
  });
  it("resposta nao revela se a conta existe, ja confirmou ou atingiu limite do provedor", async () => {
    const normal = await resendConfirmation({}, form());
    resend.mockResolvedValue({ error: { code: "email_not_confirmed" } });
    expect(await resendConfirmation({}, form())).toEqual(normal);
    resend.mockRejectedValue(new Error("FICTICIO"));
    expect(await resendConfirmation({}, form())).toEqual(normal);
  });
  it("email invalido e configuracao ausente nao fazem chamadas de envio", async () => {
    expect((await resendConfirmation({}, form("invalido"))).error).toBeTruthy();
    server.mockResolvedValue(null);
    expect((await resendConfirmation({}, form())).error).toContain("em preparação");
    expect(resend).not.toHaveBeenCalled();
  });
});
