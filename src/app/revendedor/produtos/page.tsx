import Link from "next/link";
import { randomUUID } from "node:crypto";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { requirePortal } from "@/lib/reseller/session";
import { PortalShell, PortalUnavailable, ApprovalNotice } from "@/components/reseller/shell";
import { NuvemshopCatalog } from "@/components/reseller/nuvemshop-catalog";
import { locations } from "@/config/locations";
export default async function ResellerProductsPage() {
  if (!supabaseSettings()) return <PortalUnavailable />;
  const session = await requirePortal();
  const approved = session.profile?.status === "approved";
  if (!approved && !session.staff) return <PortalShell name={session.profile?.name ?? "revendedor"} tab="produtos">
    <div className="portal-heading"><h1>Produtos para revenda.</h1><p>Seu catálogo e a seleção de produtos ficam disponíveis após a aprovação.</p></div><ApprovalNotice status={session.profile?.status} />
  </PortalShell>;
  return <PortalShell name={session.profile?.name ?? "equipe Agylli"} tab="produtos">
    <div className="portal-heading"><p className="eyebrow">SUA PRÓXIMA SELEÇÃO AGYLLI</p><h1>Escolha. Combine. Revenda.</h1><p>Adicione os produtos ao carrinho de solicitação e encaminhe a lista pelo WhatsApp. A loja confere o estoque, as opções e o preço diferenciado para revendedores antes de confirmar a compra.</p></div>
    {session.staff && !approved && <p className="portal-message" role="status">Prévia da equipe: você pode conferir os produtos publicados. A criação de pedidos é liberada para contas de revendedores aprovadas. <Link href="/equipe/produtos">Voltar à administração dos produtos</Link></p>}
    <NuvemshopCatalog token={randomUUID()} unit={session.profile?.unit_id ?? locations[0].id} readOnly={!approved} />
    <div className="portal-catalog-help"><Link href="/revendedor/solicitar" className="inline-link">Não encontrei um produto: informar pelo nome ou código</Link></div>
  </PortalShell>;
}
