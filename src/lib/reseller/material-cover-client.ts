import { materialFileSpec } from "./material-upload";
import type { CompletedMaterialUpload, MaterialTransfer } from "./material-client";

export async function transferMaterialCover(form: FormData, cache: { current: CompletedMaterialUpload | null }, api: Pick<MaterialTransfer, "prepare" | "upload" | "phase" | "progress">): Promise<{ path: string | null } | { error: string }> {
  const file = form.get("cover");
  if (!(file instanceof File) || !file.size) return { path: null };
  try {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Escolha uma capa JPG, PNG ou WebP de até 3 MB.");
    materialFileSpec(file.type, file.size);
  } catch (error) { return { error: error instanceof Error ? error.message : "Capa inválida." }; }
  if (cache.current?.name === file.name && cache.current.size === file.size && cache.current.modified === file.lastModified) return { path: cache.current.path };
  try {
  api.phase("Enviando a imagem de capa…"); api.progress?.({ sent: 0, total: file.size });
  let timer: ReturnType<typeof setTimeout>;
  const prepared = await Promise.race([
    api.prepare({ mime: file.type, size: file.size }),
    new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Não foi possível preparar a capa em 45 segundos. Tente novamente.")), 45_000); }),
  ]).finally(() => clearTimeout(timer!));
  if ("error" in prepared) return prepared;
  const result = await api.upload(prepared.path, prepared.token, file, file.type);
  if (result.error) return { error: typeof result.error === "string" ? result.error : "Não foi possível enviar a capa." };
  cache.current = { path: prepared.path, name: file.name, size: file.size, modified: file.lastModified };
  return { path: prepared.path };
  } finally { api.phase(""); api.progress?.(null); }
}
