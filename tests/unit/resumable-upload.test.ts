import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Upload, DetailedError } from "tus-js-client";
type Options = ConstructorParameters<typeof Upload>[1];
const { attempts } = vi.hoisted(() => ({ attempts: [] as { options: Options; start: ReturnType<typeof vi.fn>; abort: ReturnType<typeof vi.fn> }[] }));
vi.mock("tus-js-client", () => ({
  Upload: class {
    start = vi.fn();
    abort = vi.fn().mockResolvedValue(undefined);
    constructor(_: unknown, public options: Options) { attempts.push(this); }
  },
}));
import { storageUploadEndpoint, uploadMaterialFile } from "@/lib/reseller/resumable-upload";

beforeEach(() => { attempts.length = 0; vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });
function options() {
  return {
    url: "https://project.supabase.co", key: "sb_publishable_FICTICIO", token: "TOKEN-FICTICIO",
    path: "11111111-1111-4111-8111-111111111111.pdf", mime: "application/pdf",
    file: new File(["%PDF-1.7\nFICTICIO"], "FICTICIO.pdf", { type: "application/pdf" }),
    signal: new AbortController().signal, progress: vi.fn(),
  };
}
function error(status: number, body = "{}") {
  return { originalResponse: { getStatus: () => status, getBody: () => body }, message: "PRIVATE TOKEN-FICTICIO" } as DetailedError;
}
async function begin(overrides: Partial<ReturnType<typeof options>> & {idleTimeoutMs?:number;totalTimeoutMs?:number} = {}) {
  const config = { ...options(), ...overrides };
  const result = uploadMaterialFile(config);
  await vi.dynamicImportSettled();
  expect(attempts).toHaveLength(1);
  return { config, result, attempt: attempts[0], api: attempts[0].options };
}

describe("Upload retomavel privado e limitado", () => {
  it("usa host direto, blocos oficiais de 6 MB e token restrito; nao persiste URLs", async () => {
    const { api, result, config, attempt } = await begin();
    expect(attempt.start).toHaveBeenCalledOnce();
    expect(api).toMatchObject({
      endpoint: "https://project.storage.supabase.co/storage/v1/upload/resumable", chunkSize: 6 * 1024 * 1024,
      storeFingerprintForResuming: false, uploadDataDuringCreation: true,
      headers: { apikey: "sb_publishable_FICTICIO", "x-signature": "TOKEN-FICTICIO" },
      metadata: { bucketName: "reseller-materials", objectName: config.path, contentType: "application/pdf" },
    });
    expect(api.headers).not.toHaveProperty("authorization");
    api.onProgress!(5, config.file.size);
    expect(config.progress).toHaveBeenLastCalledWith({ sent: 5, total: config.file.size });
    api.onSuccess!({} as never);
    expect(await result).toEqual({ error: null });
    expect(vi.getTimerCount()).toBe(0);
  });
  it("retenta falhas temporarias e nao retenta limite ou acesso recusado", async () => {
    const { api, result } = await begin();
    for (const status of [0, 408, 409, 425, 429, 500, 503]) expect(api.onShouldRetry!(error(status), 0, api)).toBe(true);
    for (const status of [400, 401, 403, 404, 413]) expect(api.onShouldRetry!(error(status), 0, api)).toBe(false);
    api.onSuccess!({} as never);await result;
  });
  it("ausencia de resposta encerra o envio e libera seus recursos", async () => {
    const { result, attempt } = await begin({ idleTimeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(1001);
    expect((await result).error).toContain("ENVIO_SEM_RESPOSTA");
    expect(attempt.abort).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);
  });
  it("progresso renova espera; limite total ainda encerra tentativa longa", async () => {
    const { result, api } = await begin({ idleTimeoutMs: 1000, totalTimeoutMs: 3000 });
    for (let sent = 1; sent <= 3; sent++) { await vi.advanceTimersByTimeAsync(900);api.onProgress!(sent, 16); }
    await vi.advanceTimersByTimeAsync(301);
    expect((await result).error).toContain("ENVIO_TEMPO");expect(vi.getTimerCount()).toBe(0);
  });
  it("cancelar interrompe rede e impede que um retorno atrasado pareca sucesso", async () => {
    const controller = new AbortController();
    const { result, api, config, attempt } = await begin({ signal: controller.signal });
    controller.abort();
    expect((await result).error).toContain("cancelado");expect(attempt.abort).toHaveBeenCalledOnce();
    api.onSuccess!({} as never);api.onProgress!(16, 16);
    expect(config.progress).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);
  });
  it.each([413, 400])("limite do provedor HTTP %s informa restricao Free sem expor corpo ou token", async status => {
    const { api, result } = await begin();
    api.onError!(error(status, JSON.stringify({ code: "EntityTooLarge", message: "PRIVATE TOKEN-FICTICIO" })));
    const message = (await result).error;
    expect(message).toContain("ENVIO_LIMITE");expect(message).toContain("Free");expect(message).not.toContain("TOKEN-FICTICIO");
  });
  it("permissao recusada pede nova sessao e nao revela detalhes privados", async () => {
    const { api, result } = await begin();api.onError!(error(403));
    expect((await result).error).toContain("ENVIO_ACESSO");
  });
  it("URL retornada fora da origem esperada nao recebe o token", async () => {
    const { api, result, attempt } = await begin();
    expect(() => api.onBeforeRequest!({ getURL: () => "https://externo.invalid/PRIVATE" } as never)).toThrow("invalid_upload_destination");
    expect((await result).error).toContain("ENVIO_DESTINO");expect(attempt.abort).toHaveBeenCalledOnce();
  });
  it("bloqueia antes de carregar o transporte se ja cancelado ou acima do limite ativo", async () => {
    const config = options(), controller = new AbortController();controller.abort();
    expect((await uploadMaterialFile({ ...config, signal: controller.signal })).error).toContain("cancelado");
    Object.defineProperty(config.file, "size", { value: 100 * 1024 * 1024 });
    expect((await uploadMaterialFile(config)).error).toBeTruthy();expect(attempts).toHaveLength(0);
    vi.stubEnv("NEXT_PUBLIC_RESELLER_PDF_LIMIT_MB", "100");
    const pending = uploadMaterialFile(config);await vi.dynamicImportSettled();
    attempts[0].options.onSuccess!({} as never);expect((await pending).error).toBeNull();
  });
  it("rejeita origens inseguras e preserva dominio HTTPS customizado", () => {
    expect(() => storageUploadEndpoint("http://project.supabase.co")).toThrow();
    expect(() => storageUploadEndpoint("https://user:password@project.supabase.co")).toThrow();
    expect(storageUploadEndpoint("https://storage.example.invalid").origin).toBe("https://storage.example.invalid");
  });
});
