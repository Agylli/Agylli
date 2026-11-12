import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { serverSupabase } from "@/integrations/supabase/server";
import type { PortalProfile } from "./types";
import { safePortalNext } from "./validation";

export const portalSession = cache(async () => {
  const db = await serverSupabase();
  if (!db) return null;
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) return null;
  async function staffAccess() {
    try { return await db!.rpc("portal_is_staff"); }
    catch { return {data:null,error:true}; }
  }
  const [profile, staff] = await Promise.all([
    db
      .from("reseller_profiles")
      .select("id,name,email,phone,unit_id,status")
      .eq("id", data.user.id)
      .maybeSingle(),
    staffAccess(),
  ]);
  return {
    db,
    user: data.user,
    profile: profile.data as PortalProfile | null,
    staff: !staff.error && staff.data === true,
    staffError: !!staff.error,
    profileError: !!profile.error,
  };
});
export async function requirePortal(staff = false) {
  const session = await portalSession();
  if (!session)
    redirect(
      `/revendedor/entrar?next=${encodeURIComponent(safePortalNext(staff ? "/equipe" : "/revendedor"))}`,
    );
  if (staff && session.staffError) redirect("/revendedor?notice=access-check-error");
  if (staff && !session.staff) redirect("/revendedor?notice=restricted");
  return session;
}
