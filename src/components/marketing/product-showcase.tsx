"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { categories, demoProducts } from "@/data/products";
import { brand } from "@/config/brand";
import { marketing } from "@/config/marketing";

export function ProductShowcase() {
  const params = useSearchParams();
  const requested = params.get("categoria");
  const selected = categories.some(item => item.id === requested) ? requested : "todos";
  const visible = selected === "todos" ? demoProducts : demoProducts.filter(item => item.category === selected);
  return <section id="produtos" className="section products-section" aria-labelledby="products-heading"><div className="container">
    <div className="section-heading"><div><p className="eyebrow">{marketing.products.eyebrow}</p><h2 id="products-heading">{marketing.products.title}</h2></div><Link href={brand.links.retail} className="inline-link">Conheça a loja <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    <div className="product-toolbar"><nav className="filter-list" aria-label="Filtrar produtos demonstrativos por categoria">
      {[{ id: "todos", short: "Todos" }, ...categories].map(item => <Link key={item.id} href={item.id === "todos" ? "/#produtos" : `/?categoria=${item.id}#produtos`} className={`filter-chip ${selected === item.id ? "selected" : ""}`} aria-current={selected === item.id ? "true" : undefined} scroll={false}>{item.short}</Link>)}
    </nav><span className="demo-label">CATÁLOGO DEMONSTRATIVO</span></div>
    <p className="demo-notice">{marketing.products.notice}</p>
    <p className="sr-only" aria-live="polite">{visible.length} {visible.length === 1 ? "produto demonstrativo" : "produtos demonstrativos"}</p>
    <div className="product-grid">{visible.map(product => <article className="product-card" key={product.id}>
      <Link href={brand.links.retail} className="product-image" style={{ backgroundColor: product.color }} aria-label={`Conhecer a loja — ${product.name}, produto demonstrativo`}><span className="product-tag">Ilustrativo</span><Image src={product.image} alt={`Embalagem conceitual de ${product.name}, produto fictício`} fill sizes="(max-width: 767px) 44vw, 23vw" /><span className="product-open"><ArrowUpRight size={20} aria-hidden="true" /></span></Link>
      <p className="product-category">{categories.find(item => item.id === product.category)?.label}</p><h3>{product.name}</h3><p className="product-detail">{product.detail}</p><span className="product-availability">{marketing.products.availability}</span>
    </article>)}</div>
  </div></section>;
}
