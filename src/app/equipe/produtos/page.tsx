import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { requirePortal } from "@/lib/reseller/session";
import { UUID_PATTERN } from "@/lib/reseller/validation";
import { catalogImages } from "@/lib/reseller/catalog-server";
import type { CatalogProduct } from "@/lib/reseller/catalog";
import { PortalShell, PortalUnavailable, EmptyState, Pagination, pageNumber } from "@/components/reseller/shell";
import { ActionForm } from "@/components/reseller/action-form";
import { CatalogProductForm } from "@/components/reseller/catalog-product-form";
import { toggleCatalogProduct } from "./actions";
export default async function TeamProductsPage({ searchParams }: { searchParams: Promise<{editar?:string;pagina?:string}> }) {
  if (!supabaseSettings()) return <PortalUnavailable />;
  const session = await requirePortal(true), query = await searchParams, page=pageNumber(query.pagina), offset=(page-1)*20;
  if (query.editar && !UUID_PATTERN.test(query.editar)) notFound();
  const result = await session.db.from("reseller_catalog_products").select("id,name,sku,brand,category,description,image_path,active").order("created_at",{ascending:false}).range(offset,offset+20);
  let editing: CatalogProduct | undefined;
  if (query.editar && !result.error) {
    const selected = await session.db.from("reseller_catalog_products").select("id,name,sku,brand,category,description,image_path,active").eq("id",query.editar).maybeSingle();
    if (selected.error || !selected.data) notFound();editing=selected.data as CatalogProduct;
  }
  const products=await catalogImages(session.db,((result.data ?? []) as CatalogProduct[]).slice(0,20));
  return <PortalShell name={session.profile?.name ?? "equipe Agylli"} staff tab="produtos">
    <div className="portal-heading"><p className="eyebrow">CATÁLOGO EXCLUSIVO DE REVENDA</p><h1>Produtos para a parceria.</h1><p>Publique a seleção que os revendedores poderão adicionar aos pedidos. A equipe aplica os descontos no atendimento.</p><Link href="/revendedor/produtos" className="inline-link">Abrir catálogo da revenda</Link></div>
    {result.error ? <div className="portal-message" role="status"><p>Não foi possível carregar os produtos. Se esta for a primeira configuração, aplique a migration do catálogo no Supabase.</p><Link href="https://github.com/Agylli/Agylli/blob/main/docs/catalogo-revenda.md" className="inline-link">Consultar instruções de ativação</Link></div> : <>
      {editing && <Link href="/equipe/produtos" className="inline-link">Adicionar outro produto</Link>}
      <CatalogProductForm product={editing} />
      {!products.length ? <EmptyState title="Vamos publicar o primeiro produto?"><p>Preencha os dados acima. Os produtos ilustrativos da homepage não são usados como catálogo comercial.</p></EmptyState> : <div className="portal-order-list">
        {products.map(product => <article className="portal-order-card portal-team-product" key={product.id}>
          {product.imageUrl && <Image src={product.imageUrl} alt={product.name} width={110} height={110} unoptimized />}
          <div><span className="portal-badge">{product.active ? "Publicado" : "Oculto"}</span><h2>{product.name}</h2><p>{product.brand}{product.category && ` · ${product.category}`}</p>{product.sku && <p>Código: {product.sku}</p>}</div>
          <div className="portal-actions"><Link className="inline-link" href={`/equipe/produtos?editar=${product.id}`}>Editar produto</Link>
            <ActionForm action={toggleCatalogProduct} label={product.active ? "Retirar do catálogo" : "Publicar produto"} className="portal-inline-form"><input name="id" type="hidden" value={product.id} /><input name="active" type="hidden" value={String(!product.active)} /></ActionForm>
          </div>
        </article>)}
      </div>}
      <Pagination page={page} hasNext={(result.data?.length ?? 0)>20} base="/equipe/produtos" />
    </>}
  </PortalShell>;
}
