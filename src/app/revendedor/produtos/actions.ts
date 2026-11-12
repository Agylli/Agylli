"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePortal } from "@/lib/reseller/session";
import { catalogSelection } from "@/lib/reseller/catalog";
import { requestContextInput, type ActionState } from "@/lib/reseller/validation";
import { notifyStore } from "@/integrations/email/notify";
export async function submitCatalogRequest(_: ActionState, form: FormData): Promise<ActionState> {
  const session = await requirePortal();
  if (session.profile?.status !== "approved") return { error: "A equipe precisa aprovar seu cadastro antes do primeiro pedido." };
  let selection: ReturnType<typeof catalogSelection>, context: ReturnType<typeof requestContextInput>;
  try {
    selection = catalogSelection(form);
    context = requestContextInput(form);
  } catch(error) { return { error: error instanceof Error ? error.message : "Revise os produtos." }; }
  const result = await session.db.rpc("portal_create_catalog_request",{p_unit:context.unit,p_items:selection,p_notes:context.notes,p_client_token:context.token});
  if (result.error || typeof result.data !== "string") return { error: "Não foi possível registrar. Um produto pode ter sido retirado do catálogo; atualize a página e revise sua seleção." };
  try { await notifyStore(result.data); } catch { /* The request and notification remain in the panel. */ }
  revalidatePath("/revendedor");revalidatePath("/equipe");
  redirect(`/revendedor/pedidos/${result.data}?notice=whatsapp`);
}
