import { materialCategories, resellerPortal } from "@/config/reseller";
import { textField, UUID_PATTERN } from "./validation";
const extensions = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
export function materialFileSpec(mime: string, size: number) {
  if (!Object.hasOwn(extensions,mime) || !Number.isSafeInteger(size) || size <= 0) throw new Error("Envie um PDF, JPG, PNG ou WebP válido.");
  const limit = mime === "application/pdf" ? resellerPortal.catalogPdfLimitBytes : resellerPortal.materialLimitBytes;
  if (size > limit) throw new Error(mime === "application/pdf" ? `O PDF deve ter até ${Math.floor(limit/1024/1024)} MB. Divida ou reduza o catálogo antes de enviar.` : "A imagem deve ter até 3 MB.");
  return { mime, size, extension: extensions[mime as keyof typeof extensions] };
}
export function materialPathMime(path: string) {
  const match = /^([0-9a-f-]{36})\.(pdf|jpg|png|webp)$/.exec(path);
  if (!match || !UUID_PATTERN.test(match[1])) return null;
  return Object.entries(extensions).find(([,extension]) => extension === match[2])?.[0] ?? null;
}
export function materialMetadata(form: FormData) {
  const title=textField(form,"title"), description=textField(form,"description"), category=textField(form,"category");
  if (title.length<3 || title.length>120 || description.length>1000 || !Object.hasOwn(materialCategories,category)) throw new Error("Confira título, descrição e categoria.");
  if (form.get("authorized")!=="on") throw new Error("Confirme a autorização de uso do material.");
  return { title,description,category };
}
