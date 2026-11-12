import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { safePortalNext } from "./validation";

/** Routing uses the server's staff table, never a name, email or form role. */
export async function destinationAfterAuthentication(
  db: Pick<SupabaseClient, "rpc">,
  requested: string | undefined | null,
): Promise<string> {
  const destination = safePortalNext(requested);
  if (destination === "/revendedor/redefinir-senha") return destination;
  try {
    const { data, error } = await db.rpc("portal_is_staff");
    if (error) return "/revendedor?notice=access-check-error";
    return data === true && destination === "/revendedor" ? "/equipe" : destination;
  } catch {
    return "/revendedor?notice=access-check-error";
  }
}
