import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resellerPortal } from "@/config/reseller";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { materialFileSpec, materialPathMime } from "./material-upload";
import { validMaterial } from "./validation";

async function firstBytes(url: string) {
  const response = await fetch(url, { headers: { Range: "bytes=0-15" }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000) });
  if (!response.ok || !response.body) throw new Error("file_header_unavailable");
  const reader = response.body.getReader(), bytes = new Uint8Array(16); let length = 0;
  try {
    while (length < 16) { const part = await reader.read(); if (part.done) break; const take = Math.min(part.value.length, 16 - length); bytes.set(part.value.subarray(0, take), length); length += take; }
  } finally { try { await reader.cancel(); } catch { /* Already closed. */ } }
  return bytes.subarray(0, length);
}

/** Caller must authenticate staff before validation; never accepts arbitrary URLs. */
export async function validateStoredMaterial(db: SupabaseClient, path: string, imageOnly = false): Promise<string | null> {
  const mime = materialPathMime(path);
  if (!mime || (imageOnly && !mime.startsWith("image/"))) return "Referência do arquivo inválida. Selecione a imagem novamente.";
  const bucket = db.storage.from(resellerPortal.bucket), info = await bucket.info(path);
  if (info.error || !info.data) return "O arquivo ainda não chegou ao armazenamento. Tente concluir o envio novamente.";
  const actualMime = info.data.contentType?.split(";")[0].toLowerCase();
  try {
    if (actualMime !== mime) throw new Error("O tipo do arquivo não corresponde ao material enviado.");
    materialFileSpec(actualMime, Number(info.data.size));
  } catch (error) { await bucket.remove([path]); return error instanceof Error ? error.message : "Arquivo inválido."; }
  const signed = await bucket.createSignedUrl(path, 60), settings = supabaseSettings();
  if (signed.error || !signed.data || !settings) return "Não foi possível validar o arquivo. Tente publicar novamente.";
  try {
    if (new URL(signed.data.signedUrl).origin !== new URL(settings.url).origin) throw new Error("invalid_storage_origin");
    if (!validMaterial(await firstBytes(signed.data.signedUrl), mime)) { await bucket.remove([path]); return "O conteúdo não corresponde a um PDF, imagem ou vídeo válido."; }
  } catch { return "Não foi possível conferir o conteúdo do arquivo. Tente publicar novamente."; }
  return null;
}
