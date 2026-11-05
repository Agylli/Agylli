import type { Metadata } from "next";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { PageIntro } from "@/components/marketing/page-intro";
import { ActionLink } from "@/components/ui/action-link";
import { ContactBanner } from "@/components/marketing/contact-banner";
import { wholesaleBenefits, wholesaleContent, wholesaleFaq, wholesaleSteps } from "@/config/content";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Seja revendedor", description: "Conheça a proposta de atacado Agylli para revendedores com CPF ou CNPJ. Cadastro e condições comerciais a confirmar.", alternates: { canonical: brand.links.site ? "/atacado" : undefined } };

export default function WholesalePage() {
  return <><PageIntro eyebrow="AGYLLI PARA O SEU NEGÓCIO" title="Beleza que abre possibilidades."><p>{wholesaleContent.introduction}</p><ActionLink href={brand.links.wholesale}>{brand.labels.request}</ActionLink><p className="small-note">{wholesaleContent.registrationNote}</p></PageIntro>
    <section className="section container" aria-labelledby="benefits-heading"><div className="section-heading"><div><p className="eyebrow">NOVOS CAMINHOS PARA REVENDEDORES</p><h2 id="benefits-heading">Uma parceria começa com possibilidades.</h2></div></div><div className="info-grid">{wholesaleBenefits.map((item, index) => <article className="info-card" key={item.title}><span className="card-number">0{index + 1}<ArrowUpRight size={20} aria-hidden="true" /></span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section>
    <section className="steps-section"><div className="container steps-layout"><div><p className="eyebrow">DO PRIMEIRO OLÁ AO PRÓXIMO PASSO</p><h2>Como fazer<br /><em>parte disso?</em></h2><p>{wholesaleContent.stepsIntroduction}</p><ActionLink href={brand.links.wholesale}>{brand.labels.request}</ActionLink></div><ol className="step-list">{wholesaleSteps.map((step, index) => <li key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>)}</ol></div></section>
    <section className="section container faq-section" aria-labelledby="faq-heading"><div><p className="eyebrow">PARA COMEÇAR COM CLAREZA</p><h2 id="faq-heading">Sua próxima dúvida<br />pode estar aqui.</h2><Sparkles size={44} strokeWidth={1} aria-hidden="true" /></div><div>{wholesaleFaq.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></section>
    <aside className="container commercial-note"><Check size={20} aria-hidden="true" /><p>{wholesaleContent.conditions}</p></aside><ContactBanner /></>;
}
