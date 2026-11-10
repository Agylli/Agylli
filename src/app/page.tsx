import { Suspense } from "react";
import type { Metadata } from "next";
import { Heart, Store } from "lucide-react";
import { Hero } from "@/components/marketing/hero";
import { CategorySection } from "@/components/marketing/category-section";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { WholesaleBanner } from "@/components/marketing/wholesale-banner";
import { ContactBanner } from "@/components/marketing/contact-banner";
import { experience } from "@/config/content";
import { brand } from "@/config/brand";
import { marketing } from "@/config/marketing";
import { BrandSelection } from "@/components/marketing/brand-selection";
import { BrandIntro } from "@/components/marketing/brand-intro";
import { BrandRibbon } from "@/components/marketing/brand-ribbon";

export const metadata: Metadata = { alternates: { canonical: brand.links.site ? "/" : undefined } };
const icons = { heart: Heart, store: Store };

export default function Home() {
  return <>
    <Hero />
    <BrandRibbon />
    <BrandIntro />
    <CategorySection />
    <BrandSelection />
    <Suspense fallback={<section id="produtos" className="section container"><h2>Nosso universo de produtos</h2><p>Preparando a seleção demonstrativa…</p></section>}><ProductShowcase /></Suspense>
    <WholesaleBanner />
    <section className="section container experience-section" aria-labelledby="experience-heading"><div className="section-heading"><div><p className="eyebrow">{marketing.experience.eyebrow}</p><h2 id="experience-heading">{marketing.experience.title}</h2></div></div><div className="experience-grid">{experience.map(item => { const Icon = item.icon ? icons[item.icon] : null; return <article key={item.title}><span className="experience-icon" aria-hidden="true">{Icon && <Icon size={25} strokeWidth={1.4} />}</span><h3>{item.title}</h3><p>{item.description}</p></article>; })}</div></section>
    <ContactBanner />
  </>;
}
