"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requirePortal } from "@/lib/reseller/session";
import {
  textField,
  UUID_PATTERN,
  validMaterial,
  canTransition,
  type ActionState,
} from "@/lib/reseller/validation";
import { resellerPortal, materialCategories } from "@/config/reseller";
import { notifyStore } from "@/integrations/email/notify";

export async function updateRequestStatus(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { db } = await requirePortal(true),
    id = textField(form, "id"),
    status = textField(form, "status");
  if (!UUID_PATTERN.test(id)) return { error: "Solicitação inválida." };
  const { data } = await db
    .from("reseller_requests")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (!data || !canTransition(data.status, status))
    return {
      error:
        "Esse andamento não é permitido. Atualize a página e confira o pedido.",
    };
  const result = await db.rpc("portal_set_status", {
    p_id: id,
    p_status: status,
  });
  if (result.error)
    return {
      error:
        "Não foi possível atualizar. Confira se outra pessoa já alterou o pedido.",
    };
  revalidatePath("/equipe");
  revalidatePath(`/equipe/pedidos/${id}`);
  revalidatePath("/revendedor");
  revalidatePath(`/revendedor/pedidos/${id}`);
  return { success: "Andamento atualizado." };
}
export async function updateProfileStatus(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { db } = await requirePortal(true),
    id = textField(form, "id"),
    status = textField(form, "status");
  if (
    !UUID_PATTERN.test(id) ||
    !["pending", "approved", "suspended"].includes(status)
  )
    return { error: "Confira o cadastro e o status." };
  const result = await db.rpc("portal_set_profile_status", {
    p_id: id,
    p_status: status,
  });
  if (result.error)
    return {
      error:
        "Não foi possível atualizar. Para aprovar, o revendedor precisa confirmar o e-mail.",
    };
  revalidatePath("/equipe");
  return { success: "Cadastro atualizado." };
}
export async function retryNotification(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requirePortal(true);
  const id = textField(form, "id");
  if (!UUID_PATTERN.test(id)) return { error: "Solicitação inválida." };
  const state = await notifyStore(id);
  revalidatePath(`/equipe/pedidos/${id}`);
  return state === "sent"
    ? { success: "E-mail enviado à loja." }
    : {
        error:
          "O envio continua pendente. Confira a configuração de e-mail e o acompanhamento pelo painel.",
      };
}
export async function publishMaterial(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { db } = await requirePortal(true),
    title = textField(form, "title"),
    description = textField(form, "description"),
    category = textField(form, "category");
  if (
    title.length < 3 ||
    title.length > 120 ||
    description.length > 1000 ||
    !Object.hasOwn(materialCategories, category)
  )
    return { error: "Confira título, descrição e categoria." };
  if (form.get("authorized") !== "on")
    return { error: "Confirme a autorização de uso do material." };
  const file = form.get("file");
  let path: string | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > resellerPortal.materialLimitBytes)
      return { error: "Use um arquivo de até 3 MB." };
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validMaterial(bytes, file.type))
      return { error: "Envie um PDF, JPG, PNG ou WebP válido de até 3 MB." };
    const extension = (
      {
        "application/pdf": "pdf",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      } as Record<string, string>
    )[file.type];
    path = `${randomUUID()}.${extension}`;
    const uploaded = await db.storage
      .from(resellerPortal.bucket)
      .upload(path, bytes, { contentType: file.type, upsert: false });
    if (uploaded.error)
      return { error: "Não foi possível salvar o arquivo. Tente novamente." };
  } else if (category !== "beneficio")
    return { error: "Adicione o arquivo do catálogo ou material." };
  const result = await db
    .from("reseller_resources")
    .insert({ title, description, category, file_path: path });
  if (result.error) {
    if (path) await db.storage.from(resellerPortal.bucket).remove([path]);
    return { error: "Não foi possível publicar o material." };
  }
  revalidatePath("/equipe");
  revalidatePath("/revendedor");
  return { success: "Material publicado para os revendedores aprovados." };
}
export async function toggleMaterial(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { db } = await requirePortal(true),
    id = textField(form, "id"),
    active = textField(form, "active") === "true";
  if (!UUID_PATTERN.test(id)) return { error: "Material inválido." };
  const { error } = await db
    .from("reseller_resources")
    .update({ active })
    .eq("id", id);
  if (error) return { error: "Não foi possível atualizar o material." };
  revalidatePath("/equipe");
  revalidatePath("/revendedor");
  return {
    success: active
      ? "Material disponibilizado."
      : "Material retirado da área de revendedores.",
  };
}
