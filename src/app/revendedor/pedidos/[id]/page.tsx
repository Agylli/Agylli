import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { requirePortal } from "@/lib/reseller/session";
import { UUID_PATTERN } from "@/lib/reseller/validation";
import { PortalShell, PortalUnavailable } from "@/components/reseller/shell";
import { RequestDetail } from "@/components/reseller/request-detail";
import type { PortalRequest } from "@/lib/reseller/types";
import { RequestWhatsApp } from "@/components/reseller/request-whatsapp";
export default async function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!supabaseSettings()) return <PortalUnavailable />;
  const session = await requirePortal(),
    { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();
  const order = await session.db
    .from("reseller_requests")
    .select(
      "id,user_id,unit_id,status,notes,created_at,updated_at,reseller_request_items(id,name,sku,quantity)",
    )
    .eq("id", id)
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (order.error || !order.data) notFound();
  const events = await session.db
    .from("reseller_request_events")
    .select("status,created_at")
    .eq("request_id", id)
    .order("created_at");
  return (
    <PortalShell name={session.profile?.name ?? "revendedor"} tab="pedidos">
      <Link href="/revendedor?aba=pedidos" className="inline-link">
        Voltar para meus pedidos
      </Link>
      <RequestDetail
        order={order.data as PortalRequest}
        events={events.data ?? []}
        actions={<RequestWhatsApp order={order.data as PortalRequest} name={session.profile?.name ?? "revendedor Agylli"} siteUrl={process.env.NEXT_PUBLIC_SITE_URL} approved={session.profile?.status === "approved"} />}
      />
    </PortalShell>
  );
}
