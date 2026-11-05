import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Heart, Sparkles, Store, Asterisk } from "lucide-react";
import { Hero } from "@/components/marketing/hero";
import { CategorySection } from "@/components/marketing/category-section";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { WholesaleBanner } from "@/components/marketing/wholesale-banner";
import { ContactBanner } from "@/components/marketing/contact-banner";
import { experience } from "@/config/content";
import { brand } from "@/config/brand";
import { marketing } from "@/config/marketing";

export const metadata: Metadata = { alternates: { canonical: brand.links.site ? "/" : undefined } };
const icons = { heart: Heart, sparkles: Sparkles, store: Store };

export default function Home() {
  return <>
    <Hero />
    <div className="brand-ribbon" aria-label="Para sua rotina e para o seu negócio">{marketing.ribbon.map((label, index) => <span key={label} className="ribbon-item">{label}{index < marketing.ribbon.length - 1 && <Asterisk className="ribbon-star" size={23} strokeWidth={1.4} aria-hidden="true" />}</span>)}</div>
    <section id="universo" className="brand-intro container"><p className="eyebrow">{marketing.intro.eyebrow}</p><h2>{marketing.intro.title}<br />{" "}{marketing.intro.subtitle} <em>{marketing.intro.accent}</em></h2><p>{marketing.intro.description}</p><Link href="/sobre" className="inline-link">{marketing.intro.action} <ArrowUpRight size={16} aria-hidden="true" /></Link></section>
    <CategorySection />
    <Suspense fallback={<section id="produtos" className="section container"><h2>Nosso universo de produtos</h2><p>Preparando a seleção demonstrativa…</p></section>}><ProductShowcase /></Suspense>
    <WholesaleBanner />
    <section className="section container experience-section" aria-labelledby="experience-heading"><div className="section-heading"><div><p className="eyebrow">{marketing.experience.eyebrow}</p><h2 id="experience-heading">{marketing.experience.title}</h2></div></div><div className="experience-grid">{experience.map(item => { const Icon = icons[item.icon]; return <article key={item.title}><span className="experience-icon"><Icon size={25} strokeWidth={1.4} aria-hidden="true" /></span><h3>{item.title}</h3><p>{item.description}</p></article>; })}</div></section>
    <ContactBanner />
  </>;
}
