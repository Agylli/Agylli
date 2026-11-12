import Link from "next/link";
import { randomUUID } from "node:crypto";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { requirePortal } from "@/lib/reseller/session";
import { PortalShell, PortalUnavailable, ApprovalNotice, EmptyState } from "@/components/reseller/shell";
import { CatalogPicker } from "@/components/reseller/catalog-picker";
import { catalogImages } from "@/lib/reseller/catalog-server";
import { catalogLimit, type CatalogProduct } from "@/lib/reseller/catalog";
import { locations } from "@/config/locations";
export default async function ResellerProductsPage() {
  if (!supabaseSettings()) return <PortalUnavailable />;
  const session = await requirePortal();
  const approved = session.profile?.status === "approved";
  if (!approved && !session.staff) return <PortalShell name={session.profile?.name ?? "revendedor"} tab="produtos">
    <div className="portal-heading"><h1>Produtos para revenda.</h1><p>Seu catálogo e a seleção de produtos ficam disponíveis após a aprovação.</p></div><ApprovalNotice status={session.profile?.status} />
  </PortalShell>;
  const result = await session.db.from("reseller_catalog_products").select("id,name,sku,brand,category,description,image_path,active").eq("active",true).order("name").limit(catalogLimit);
  const products = await catalogImages(session.db, (result.data ?? []) as CatalogProduct[]);
  return <PortalShell name={session.profile?.name ?? "equipe Agylli"} tab="produtos">
    <div className="portal-heading"><p className="eyebrow">SUA PRÓXIMA SELEÇÃO AGYLLI</p><h1>Escolha. Combine. Revenda.</h1><p>Monte seu pedido. A equipe confere a disponibilidade e aplica seu desconto no atendimento pelo WhatsApp.</p></div>
    {session.staff && !approved && <p className="portal-message" role="status">Prévia da equipe: você pode conferir os produtos publicados. A criação de pedidos é liberada para contas de revendedores aprovadas. <Link href="/equipe/produtos">Voltar à administração dos produtos</Link></p>}
    {result.error ? <p className="portal-message" role="status">Não foi possível carregar o catálogo agora. Tente novamente em instantes ou fale com sua unidade.</p>
      : products.length ? <CatalogPicker products={products} token={randomUUID()} unit={session.profile?.unit_id ?? locations[0].id} readOnly={!approved} />
      : <EmptyState title="Seu catálogo está chegando."><p>A equipe ainda não publicou produtos para revenda. Você já pode consultar os catálogos e solicitar produtos pelo nome ou código.</p><Link href="/revendedor?aba=materiais" className="inline-link">Consultar catálogos e materiais</Link></EmptyState>}
    <div className="portal-catalog-help"><Link href="/revendedor/solicitar" className="inline-link">Não encontrei um produto: informar pelo nome ou código</Link></div>
  </PortalShell>;
}
