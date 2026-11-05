import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro } from "@/components/marketing/page-intro";
import { ContactBanner } from "@/components/marketing/contact-banner";
import { ActionLink } from "@/components/ui/action-link";
import { brand } from "@/config/brand";
import { aboutContent } from "@/config/content";

export const metadata: Metadata = { title: "Sobre nós", description: aboutContent.description, alternates: { canonical: brand.links.site ? "/sobre" : undefined } };
export default function AboutPage() {
  return <><PageIntro eyebrow="MUITO PRAZER, SOMOS A AGYLLI" title="Beleza que aproxima."><p>{aboutContent.introduction}</p></PageIntro>
    <section className="section container about-layout"><div className="about-image"><Image src="/images/history/loja-agylli.webp" alt="Registro da loja Agylli, com prateleiras de cosméticos, balcão de atendimento e identidade da empresa ao fundo" fill sizes="(max-width: 767px) 90vw, 45vw" /><span>{aboutContent.imageCaption}</span></div><div className="about-copy"><p className="eyebrow">{aboutContent.eyebrow}</p><h2>{aboutContent.title}<br /><em>{aboutContent.accent}</em></h2>{aboutContent.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<ActionLink href={brand.links.retail}>Conheça nosso universo</ActionLink></div></section>
    <section className="section container history-section" aria-labelledby="history-heading"><p className="eyebrow">DA ORIGEM AO PRÓXIMO CAPÍTULO</p><h2 id="history-heading">{aboutContent.historyTitle}</h2><div className="history-grid">{aboutContent.milestones.map(milestone => <article key={milestone.title}><h3>{milestone.title}</h3><p>{milestone.description}</p></article>)}</div></section>
    <section className="section portfolio-section" aria-labelledby="portfolio-heading"><div className="container"><p className="eyebrow">{aboutContent.portfolioEyebrow}</p><h2 id="portfolio-heading">{aboutContent.portfolioTitle}</h2><p className="portfolio-description">{aboutContent.portfolioDescription}</p><ul className="portfolio-categories">{aboutContent.categories.map(category => <li key={category}>{category}</li>)}</ul></div></section><ContactBanner /></>;
}
