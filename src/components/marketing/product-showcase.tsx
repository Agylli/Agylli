"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { categories, illustrativeProducts } from "@/data/products";
import { brand } from "@/config/brand";
import { marketing } from "@/config/marketing";
import { matchingCategories, type PublicCatalog } from "@/lib/catalog";

type View = { mode: "demo" } | { mode: "loading" } | { mode: "unavailable" } | { mode: "live"; catalog: PublicCatalog };

export function ProductShowcase({ live = false }: { live?: boolean }) {
  const [view, setView] = useState<View>({ mode: live ? "loading" : "demo" });
  const hasLive = useRef(live);
  useEffect(() => {
    let stopped = false, busy = false;
    let controller: AbortController | undefined;
    async function refresh() {
      if (busy || document.visibilityState === "hidden") return;
      busy = true;
      controller = new AbortController();
      const timer = window.setTimeout(() => controller?.abort(), 28000);
      try {
        const response = await fetch("/api/catalogo", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("catalog_unavailable");
        const data = await response.json();
        if (stopped) return;
        if (data.status === "not_configured") setView({ mode: hasLive.current ? "unavailable" : "demo" });
        else if (data.status === "ready" && Array.isArray(data.products) && Array.isArray(data.categories)) {
          hasLive.current = true; setView({ mode: "live", catalog: data });
        } else throw new Error("catalog_unavailable");
      } catch {
        if (!stopped) setView({ mode: hasLive.current ? "unavailable" : "demo" });
      } finally { window.clearTimeout(timer); busy = false; }
    }
    void refresh();
    const interval = window.setInterval(() => void refresh(), 60000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => { stopped = true; controller?.abort(); window.clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("focus", onVisible); };
  }, []);
  return view.mode === "demo" ? <IllustrativeShowcase /> : <LiveShowcase view={view} />;
}

function CatalogPhoto({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? <Image src={src} alt={name} fill sizes="(max-width: 767px) 44vw, 23vw" onError={() => setFailed(true)} /> : <span className="catalog-placeholder">Imagem em preparação</span>;
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function LiveShowcase({ view }: { view: Exclude<View, { mode: "demo" }> }) {
  const params = useSearchParams();
  const requested = params.get("categoria") ?? "todos";
  const [pagination, setPagination] = useState({ filter: "todos", limit: 12 });
  const catalog = view.mode === "live" ? view.catalog : null;
  const ids = catalog ? matchingCategories(requested, catalog.categories) : [];
  const filtered = catalog ? requested === "todos" ? catalog.products : catalog.products.filter(product => product.categoryIds.some(id => ids.includes(id))) : [];
  const limit = pagination.filter === requested ? pagination.limit : 12;
  return <section id="produtos" className="section products-section" aria-labelledby="products-heading"><div className="container">
    <div className="section-heading"><div><p className="eyebrow">DIRETO DA NOSSA LOJA ONLINE</p><h2 id="products-heading">Encontre seu próximo cuidado.</h2></div><Link href={brand.links.retail} className="inline-link">Catálogo completo <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    {catalog && <div className="product-toolbar"><nav className="filter-list" aria-label="Filtrar produtos por categoria">
      <Link href="/#produtos" className={`filter-chip ${requested === "todos" ? "selected" : ""}`} aria-current={requested === "todos" ? "true" : undefined} scroll={false}>Todos</Link>
      {catalog.categories.map(category => <Link key={category.id} href={`/?categoria=${encodeURIComponent(category.slug || category.id)}#produtos`} className={`filter-chip ${ids.includes(category.id) ? "selected" : ""}`} aria-current={ids.includes(category.id) ? "true" : undefined} scroll={false}>{category.name}</Link>)}
    </nav><span className="demo-label">CATÁLOGO NUVEMSHOP</span></div>}
    <p className="demo-notice">Produtos e preços de varejo consultados na Nuvemshop. Atualização periódica; confirme preço, opções e disponibilidade na loja antes de comprar.</p>
    {view.mode === "loading" && <p className="catalog-empty" role="status">Carregando os produtos da nossa loja…</p>}
    {view.mode === "unavailable" && <div className="catalog-empty" role="status"><p>Não foi possível carregar os produtos agora.</p><Link href={brand.links.retail} className="inline-link">Ver produtos na loja <ArrowUpRight size={16} aria-hidden="true" /></Link></div>}
    {catalog && <>
      <p className="sr-only" aria-live="polite">{filtered.length} {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}</p>
      {!filtered.length && <div className="catalog-empty"><p>{catalog.products.length ? "Nenhum produto encontrado nesta categoria." : "Ainda não há produtos publicados para exibir nesta vitrine."}</p><Link href={brand.links.retail} className="inline-link">Consultar catálogo na loja</Link></div>}
      <div className="product-grid">{filtered.slice(0, limit).map(product => <article className="product-card" key={product.id}>
        <Link href={product.url} className="product-image" aria-label={`Ver ${product.name} na loja`}><span className="product-tag">{product.available === false ? "Indisponível" : "Loja online"}</span><CatalogPhoto key={product.image} src={product.image} name={product.name} /><span className="product-open"><ArrowUpRight size={20} aria-hidden="true" /></span></Link>
        <p className="product-category">{catalog.categories.find(category => product.categoryIds.includes(category.id))?.name}</p><h3><Link href={product.url}>{product.name}</Link></h3>{product.brand && <p className="product-brand">{product.brand}</p>}
        <div className="catalog-price">{product.compareAt !== null && <del>{currency.format(product.compareAt)}</del>}{product.price === null ? <span>Consulte preço na loja</span> : <><span>{product.fromPrice ? "A partir de " : ""}</span><strong>{currency.format(product.price)}</strong></>}</div>
        <span className="product-availability">{product.available === false ? "Indisponível no momento" : "Confira as opções na loja"}</span>
        <Link href={product.url} className="inline-link" aria-label={`Ver opções de ${product.name} na Nuvemshop`}>Ver produto na loja <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </article>)}</div>
      {filtered.length > limit && <div className="catalog-more"><button type="button" className="button button-secondary" onClick={() => setPagination({ filter: requested, limit: limit + 12 })}>Mostrar mais produtos</button><p>Exibindo {Math.min(limit, filtered.length)} de {filtered.length} produtos.</p></div>}
      {catalog.truncated && <p className="demo-notice">Esta vitrine mostra parte do catálogo. Acesse a loja para consultar todos os produtos.</p>}
    </>}
  </div></section>;
}

function IllustrativeShowcase() {
  const params = useSearchParams();
  const requested = params.get("categoria");
  const selected = categories.some(item => item.id === requested) ? requested : "todos";
  const visible = selected === "todos" ? illustrativeProducts : illustrativeProducts.filter(item => item.category === selected);
  return <section id="produtos" className="section products-section" aria-labelledby="products-heading"><div className="container">
    <div className="section-heading"><div><p className="eyebrow">{marketing.products.eyebrow}</p><h2 id="products-heading">{marketing.products.title}</h2></div><Link href={brand.links.retail} className="inline-link">Conheça a loja <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    <div className="product-toolbar"><nav className="filter-list" aria-label="Filtrar produtos demonstrativos por categoria">
      {[{ id: "todos", short: "Todos" }, ...categories].map(item => <Link key={item.id} href={item.id === "todos" ? "/#produtos" : `/?categoria=${item.id}#produtos`} className={`filter-chip ${selected === item.id ? "selected" : ""}`} aria-current={selected === item.id ? "true" : undefined} scroll={false}>{item.short}</Link>)}
    </nav><span className="demo-label">SELEÇÃO ILUSTRATIVA</span></div>
    <p className="demo-notice">{marketing.products.notice}</p>
    <p className="sr-only" aria-live="polite">{visible.length} {visible.length === 1 ? "produto demonstrativo" : "produtos demonstrativos"}</p>
    <div className="product-grid">{visible.map(product => <article className="product-card" key={product.id}>
      <Link href={brand.links.retail} className="product-image" aria-label={`Conhecer a loja — ${product.name}, seleção ilustrativa`}><span className="product-tag">Referência visual</span><Image src={product.image} alt={`${product.name}, da ${product.brand} — fotografia da marca usada como referência visual`} fill sizes="(max-width: 767px) 44vw, 23vw" /><span className="product-open"><ArrowUpRight size={20} aria-hidden="true" /></span></Link>
      <p className="product-category">{categories.find(item => item.id === product.category)?.label}</p><h3>{product.name}</h3><p className="product-brand">{product.brand}</p><p className="product-detail">{product.detail}</p><span className="product-availability">{marketing.products.availability}</span>
    </article>)}</div>
  </div></section>;
}
