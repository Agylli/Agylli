"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePortal } from "@/lib/reseller/session";
import { catalogSelection } from "@/lib/reseller/catalog";
import { requestContextInput, type ActionState } from "@/lib/reseller/validation";
import { notifyStore } from "@/integrations/email/notify";
import { getPublicCatalog } from "@/integrations/nuvemshop/catalog";
import { nuvemshopSelection, nuvemshopRequestItems } from "@/lib/reseller/nuvemshop";
export async function submitCatalogRequest(_: ActionState, form: FormData): Promise<ActionState> {
  const session = await requirePortal();
  if (session.profile?.status !== "approved") return { error: "A equipe precisa aprovar seu cadastro antes do primeiro pedido." };
  if (form.get("source") === "nuvemshop") {
    let context: ReturnType<typeof requestContextInput>, items: ReturnType<typeof nuvemshopRequestItems>;
    try {
      context = requestContextInput(form);
      const selection = nuvemshopSelection(form);
      const catalog = await getPublicCatalog();
      if (!catalog) throw new Error("catalog_unavailable");
      items = nuvemshopRequestItems(selection, catalog);
    } catch {
      return { error: "Não foi possível conferir sua seleção. Atualize a página e revise os produtos, quantidades e a confirmação das condições." };
    }
    // Names and references come from the server catalog, never from client fields.
    const result = await session.db.rpc("portal_create_request", { p_unit: context.unit, p_items: items, p_notes: context.notes, p_client_token: context.token });
    if (result.error || typeof result.data !== "string") return { error: "Não foi possível registrar sua solicitação. Confira o cadastro e tente novamente em instantes. Seu carrinho continua nesta página." };
    try { await notifyStore(result.data); } catch { /* Durable request remains in the team panel. */ }
    revalidatePath("/revendedor"); revalidatePath("/equipe");
    redirect(`/revendedor/pedidos/${result.data}?notice=whatsapp`);
  }
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
