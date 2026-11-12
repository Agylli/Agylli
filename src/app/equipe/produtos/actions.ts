"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requirePortal } from "@/lib/reseller/session";
import { catalogBucket, catalogProductInput } from "@/lib/reseller/catalog";
import { textField, UUID_PATTERN, validMaterial, type ActionState } from "@/lib/reseller/validation";
import { resellerPortal } from "@/config/reseller";

export async function saveCatalogProduct(_: ActionState, form: FormData): Promise<ActionState> {
  const { db } = await requirePortal(true), id = textField(form,"id");
  if (id && !UUID_PATTERN.test(id)) return { error: "Produto inválido." };
  let input: ReturnType<typeof catalogProductInput>;
  try { input = catalogProductInput(form); } catch(error) { return { error: error instanceof Error ? error.message : "Confira o produto." }; }
  let previousPath: string | null = null;
  if (id) {
    const previous = await db.from("reseller_catalog_products").select("id,image_path").eq("id",id).maybeSingle();
    if (previous.error || !previous.data) return { error: "Produto não encontrado. Atualize a página." };
    previousPath = previous.data.image_path;
  }
  let uploadedPath: string | null = null;
  const file = form.get("photo");
  if (file instanceof File && file.size) {
    if (file.size > resellerPortal.materialLimitBytes || !["image/jpeg","image/png","image/webp"].includes(file.type)) return { error: "Envie uma fotografia JPG, PNG ou WebP de até 3 MB." };
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validMaterial(bytes,file.type)) return { error: "O arquivo não corresponde a uma fotografia válida." };
    const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    uploadedPath = `${randomUUID()}.${extension}`;
    const uploaded = await db.storage.from(catalogBucket).upload(uploadedPath,bytes,{contentType:file.type,upsert:false});
    if (uploaded.error) return { error: "Não foi possível salvar a fotografia." };
  }
  const payload = { ...input, image_path: uploadedPath ?? previousPath };
  const saved = id ? await db.from("reseller_catalog_products").update(payload).eq("id",id).select("id").maybeSingle()
    : await db.from("reseller_catalog_products").insert(payload).select("id").single();
  if (saved.error || !saved.data) {
    if (uploadedPath) await db.storage.from(catalogBucket).remove([uploadedPath]);
    return { error: "Não foi possível salvar. Confira se o código já está cadastrado ou se o catálogo precisa ser ativado." };
  }
  if (uploadedPath && previousPath) await db.storage.from(catalogBucket).remove([previousPath]);
  revalidatePath("/equipe/produtos");revalidatePath("/revendedor/produtos");
  return { success: input.active ? "Produto publicado no catálogo de revenda." : "Produto salvo e oculto dos revendedores." };
}
export async function toggleCatalogProduct(_: ActionState, form: FormData): Promise<ActionState> {
  const { db } = await requirePortal(true), id = textField(form,"id"), active = textField(form,"active");
  if (!UUID_PATTERN.test(id) || !["true","false"].includes(active)) return { error: "Confira o produto." };
  const saved = await db.from("reseller_catalog_products").update({active:active==="true"}).eq("id",id).select("id").maybeSingle();
  if (saved.error || !saved.data) return { error: "Não foi possível atualizar o catálogo." };
  revalidatePath("/equipe/produtos");revalidatePath("/revendedor/produtos");
  return { success: active === "true" ? "Produto publicado." : "Produto retirado da seleção. Pedidos anteriores foram preservados." };
}
