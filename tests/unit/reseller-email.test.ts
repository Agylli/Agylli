import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { admin } = vi.hoisted(() => ({ admin: vi.fn() }));
vi.mock("@/integrations/supabase/server", () => ({
  notificationSupabase: admin,
}));
vi.mock("@/lib/reseller/origin", () => ({
  portalOrigin: () => "https://institucional.example",
}));
import { notifyStore } from "@/integrations/email/notify";
let updates: unknown[];
function worker(claim = true) {
  return {
    rpc: vi.fn().mockResolvedValue({ data: claim, error: null }),
    from: vi.fn((table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            error: null,
            data:
              table === "reseller_requests"
                ? {
                    id: "FICT",
                    user_id: "FICT-USER",
                    unit_id: "candido-sales",
                    notes: "FICTICIO",
                    reseller_request_items: [
                      { name: "FICTICIO", sku: "FICT", quantity: 1 },
                    ],
                  }
                : {
                    name: "FICTICIO",
                    email: "ficticio@example.invalid",
                    phone: "(77) 99999-0000",
                  },
          }),
        }),
      }),
      update: (value: unknown) => {
        updates.push(value);
        return { eq: () => ({ eq: async () => ({ error: null }) }) };
      },
    })),
  };
}
beforeEach(() => {
  updates = [];
  admin.mockReturnValue(worker());
  vi.stubEnv("RESEND_API_KEY", "re_FICTICIO_NAO_REAL");
  vi.stubEnv("RESELLER_EMAIL_FROM", "sender@example.invalid");
  vi.stubEnv("RESELLER_NOTIFICATION_EMAIL", "store@example.invalid");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
describe("Notificacao duravel para a loja", () => {
  it("sem configuracao nao tenta enviar e preserva pendencia para o painel", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(await notifyStore("FICT")).toBe("pending");
    expect(fetcher).not.toHaveBeenCalled();
    expect(updates).toHaveLength(0);
  });
  it("claim ja utilizado evita reenvio concorrente", async () => {
    admin.mockReturnValue(worker(false));
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(await notifyStore("FICT")).toBe("pending");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("so confirma envio apos recibo do provedor e grava idempotencia", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "FICT-MESSAGE" }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetcher);
    expect(await notifyStore("FICT")).toBe("sent");
    expect(fetcher.mock.calls[0][1].headers["Idempotency-Key"]).toBe(
      "agylli-request-FICT",
    );
    expect(updates).toContainEqual(
      expect.objectContaining({ status: "sent", provider_id: "FICT-MESSAGE" }),
    );
  });
  it("falha do provedor preserva registro para tratamento no painel", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("FICTICIO", { status: 503 })),
    );
    expect(await notifyStore("FICT")).toBe("failed");
    expect(updates).toContainEqual(
      expect.objectContaining({
        status: "failed",
        last_error: "provider_http_503",
      }),
    );
  });
  it("resposta sem recibo nao e contada como email enviado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 200 })),
    );
    expect(await notifyStore("FICT")).toBe("failed");
    expect(updates).not.toContainEqual(
      expect.objectContaining({ status: "sent" }),
    );
  });
});
