import type { DetailedError, Upload as TusUpload } from "tus-js-client";
import { materialFileSpec, materialPathMime } from "./material-upload";
import { resellerPortal } from "@/config/reseller";

export type UploadProgress = { sent: number; total: number };
type UploadResult = { error: string | null };
type UploadOptions = {
  url: string;
  key: string;
  path: string;
  token: string;
  file: File;
  mime: string;
  signal: AbortSignal;
  progress: (value: UploadProgress) => void;
  // Internal test seams; the public form always uses the production defaults.
  idleTimeoutMs?: number;
  totalTimeoutMs?: number;
};

export function storageUploadEndpoint(projectUrl: string): URL {
  const url = new URL(projectUrl);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("invalid_storage_origin");
  if (/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname)) {
    url.hostname = url.hostname.replace(".supabase.co", ".storage.supabase.co");
  }
  return new URL("/storage/v1/upload/resumable", url.origin);
}

function storageError(error: Error | DetailedError): string {
  const response = "originalResponse" in error ? error.originalResponse : null;
  const status = response?.getStatus() ?? 0;
  let code = "";
  let providerStatus = 0;
  try {
    const body = JSON.parse(response?.getBody() ?? "{}");
    code = [body.code, body.error, body.message].filter(value => typeof value === "string").join(" ");
    providerStatus = Number(body.statusCode);
  } catch { /* Never show a provider body or signed URL. */ }
  if (status === 413 || providerStatus === 413 || /EntityTooLarge|exceeded.*size|maximum allowed size|file.*large/i.test(code)) {
    return "O Supabase recusou o tamanho do arquivo (ENVIO_LIMITE). Confira o limite global e o bucket. No plano Free, o máximo é 50 MB; 100 MB exige plano compatível.";
  }
  if (status === 401 || status === 403) {
    return "A autorização do envio foi recusada (ENVIO_ACESSO). Atualize a página, entre com a conta da equipe e tente novamente.";
  }
  return `O armazenamento não concluiu o envio (${status ? `ENVIO_HTTP_${status}` : "ENVIO_REDE"}). Confira a conexão e tente novamente; nenhum material foi publicado por esta tentativa.`;
}

/** TUS sends 6 MB chunks directly to private Storage, using an object-scoped token. */
export async function uploadMaterialFile(options: UploadOptions): Promise<UploadResult> {
  const { file, mime, signal, path, token, progress } = options;
  try {
    materialFileSpec(mime, file.size);
    if (materialPathMime(path) !== mime) throw new Error("invalid_file_reference");
  } catch { return { error: "Confira o tipo, tamanho e referência do arquivo antes de enviar." }; }
  if (signal.aborted) return { error: "Envio cancelado. O material não foi publicado." };
  let endpoint: URL;
  try { endpoint = storageUploadEndpoint(options.url); }
  catch { return { error: "O endereço do armazenamento não está configurado corretamente." }; }
  let libraryTimer: ReturnType<typeof setTimeout>;
  let library: typeof import("tus-js-client");
  let cancelLoading = () => {};
  try {
    library = await Promise.race([
      import("tus-js-client"),
      new Promise<never>((_, reject) => { libraryTimer = setTimeout(() => reject(new Error("upload_library_timeout")), 30_000); }),
      new Promise<never>((_, reject) => {
        cancelLoading = () => reject(new Error("upload_cancelled"));
        signal.addEventListener("abort", cancelLoading, { once: true });
        if (signal.aborted) cancelLoading();
      }),
    ]);
  } catch { return { error: signal.aborted ? "Envio cancelado. O material não foi publicado." : "Não foi possível carregar o envio em 30 segundos (ENVIO_CARREGAMENTO). Atualize a página e tente novamente." }; }
  finally { clearTimeout(libraryTimer!); signal.removeEventListener("abort", cancelLoading); }
  const { Upload } = library;
  if (signal.aborted) return { error: "Envio cancelado. O material não foi publicado." };

  return new Promise(resolve => {
    let upload: TusUpload | undefined;
    let settled = false;
    let lastSent = -1;
    let idleTimer: ReturnType<typeof setTimeout>;
    const finish = (error: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(idleTimer);
      clearTimeout(totalTimer);
      signal.removeEventListener("abort", cancel);
      if (error && upload) void upload.abort().catch(() => {});
      resolve({ error });
    };
    const cancel = () => finish("Envio cancelado. O material não foi publicado.");
    const touch = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => finish("O envio ficou sem resposta por 90 segundos (ENVIO_SEM_RESPOSTA). Confira a conexão e tente novamente. Seus campos foram preservados."), options.idleTimeoutMs ?? 90_000);
    };
    const totalTimer = setTimeout(() => finish("O envio atingiu o tempo máximo de 15 minutos (ENVIO_TEMPO). Confira a conexão e tente novamente."), options.totalTimeoutMs ?? 15 * 60_000);
    signal.addEventListener("abort", cancel, { once: true });
    try {
      upload = new Upload(file, {
        endpoint: endpoint.href,
        chunkSize: 6 * 1024 * 1024,
        retryDelays: [0, 1500, 3000, 5000, 10_000],
        uploadDataDuringCreation: true,
        storeFingerprintForResuming: false,
        removeFingerprintOnSuccess: true,
        headers: { apikey: options.key, "x-signature": token },
        metadata: { bucketName: resellerPortal.bucket, objectName: path, contentType: mime, cacheControl: "0" },
        onBeforeRequest(request) {
          const destination = new URL(request.getURL());
          if (destination.origin !== endpoint.origin || !(destination.pathname === endpoint.pathname || destination.pathname.startsWith(`${endpoint.pathname}/`))) {
            finish("O armazenamento retornou um endereço inesperado (ENVIO_DESTINO). Atualize a página e tente novamente.");
            throw new Error("invalid_upload_destination");
          }
          touch();
        },
        onAfterResponse() { touch(); },
        onProgress(sent, total) {
          if (settled) return;
          if (sent !== lastSent) { lastSent = sent; touch(); }
          progress({ sent: Math.max(0, Math.min(sent, total)), total });
        },
        onShouldRetry(error) {
          const status = error.originalResponse?.getStatus() ?? 0;
          return !settled && !signal.aborted && (status === 0 || [408, 409, 425, 429].includes(status) || status >= 500);
        },
        onError(error) { finish(storageError(error)); },
        onSuccess() {
          if (settled) return;
          progress({ sent: file.size, total: file.size });
          finish(null);
        },
      });
      touch();
      upload.start();
    } catch { finish("Não foi possível iniciar o envio (ENVIO_INICIO). Atualize a página e tente novamente."); }
  });
}
