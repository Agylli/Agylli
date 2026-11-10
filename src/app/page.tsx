import { Suspense } from "react";
import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { CategorySection } from "@/components/marketing/category-section";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { WholesaleBanner } from "@/components/marketing/wholesale-banner";
import { ExperienceSection } from "@/components/marketing/experience-section";
import { brand } from "@/config/brand";
import { BrandSelection } from "@/components/marketing/brand-selection";
import { BrandIntro } from "@/components/marketing/brand-intro";
import { BrandRibbon } from "@/components/marketing/brand-ribbon";

export const metadata: Metadata = { alternates: { canonical: brand.links.site ? "/" : undefined } };

export default function Home() {
  return <>
    <Hero />
    <BrandRibbon />
    <BrandIntro />
    <CategorySection />
    <BrandSelection />
    <Suspense fallback={<section id="produtos" className="section container"><h2>Nosso universo de produtos</h2><p>Preparando a seleção demonstrativa…</p></section>}><ProductShowcase /></Suspense>
    <WholesaleBanner />
    <ExperienceSection />
  </>;
}
