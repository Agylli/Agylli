"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePortal } from "@/lib/reseller/session";
import { requestInput, type ActionState } from "@/lib/reseller/validation";
import { notifyStore } from "@/integrations/email/notify";
export async function submitRequest(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const session = await requirePortal();
  if (session.profile?.status !== "approved")
    return {
      error: "A equipe precisa aprovar seu cadastro antes do primeiro pedido.",
    };
  let input: ReturnType<typeof requestInput>;
  try {
    input = requestInput(form);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Revise a solicitação.",
    };
  }
  const result = await session.db.rpc("portal_create_request", {
    p_unit: input.unit,
    p_items: input.items,
    p_notes: input.notes,
    p_client_token: input.token,
  });
  if (result.error || typeof result.data !== "string")
    return {
      error:
        "Não foi possível registrar. Confira seu cadastro e os produtos; se enviou várias solicitações, aguarde alguns minutos.",
    };
  // The transactional record remains in the panel even when email is unavailable.
  try {
    await notifyStore(result.data);
  } catch {
    /* Durable outbox remains pending for the team. */
  }
  revalidatePath("/revendedor");
  revalidatePath("/equipe");
  redirect(`/revendedor/pedidos/${result.data}`);
}
