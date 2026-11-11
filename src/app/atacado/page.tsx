import type { Metadata } from "next";
import { ArrowUpRight, Check } from "lucide-react";
import { PageIntro } from "@/components/marketing/page-intro";
import { ActionLink } from "@/components/ui/action-link";
import { ContactBanner } from "@/components/marketing/contact-banner";
import { WholesaleAccess } from "@/components/marketing/wholesale-access";
import {
  wholesaleBenefits,
  wholesaleContent,
  wholesaleFaq,
  wholesaleSteps,
} from "@/config/content";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { resellerPortal } from "@/config/reseller";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Seja revendedor",
  description:
    "Conheça a proposta de atacado Agylli para revendedores com CPF ou CNPJ. Cadastro e condições comerciais a confirmar.",
  alternates: { canonical: brand.links.site ? "/atacado" : undefined },
};

export default function WholesalePage() {
  const portalReady = !!supabaseSettings();
  const registrationHref = portalReady
    ? resellerPortal.signup
    : brand.links.wholesale;
  const faqs = wholesaleFaq.map((faq) => ({
    ...faq,
    answer:
      portalReady && "portalAnswer" in faq ? faq.portalAnswer : faq.answer,
  }));
  const steps = wholesaleSteps.map((step) => ({
    ...step,
    description:
      portalReady && "portalDescription" in step
        ? step.portalDescription
        : step.description,
  }));
  return (
    <>
      <PageIntro
        eyebrow="AGYLLI PARA O SEU NEGÓCIO"
        title="Beleza que abre possibilidades."
      >
        <p>{wholesaleContent.introduction}</p>
        <ActionLink href={registrationHref}>{brand.labels.request}</ActionLink>
        <p className="small-note">{wholesaleContent.registrationNote}</p>
      </PageIntro>
      <section className="section container" aria-labelledby="benefits-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">NOVOS CAMINHOS PARA REVENDEDORES</p>
            <h2 id="benefits-heading">
              Uma parceria começa com possibilidades.
            </h2>
          </div>
        </div>
        <div className="info-grid">
          {wholesaleBenefits.map((item, index) => (
            <article className="info-card" key={item.title}>
              <span className="card-number">
                0{index + 1}
                <ArrowUpRight size={20} aria-hidden="true" />
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="steps-section">
        <div className="container steps-layout">
          <div>
            <p className="eyebrow">DO PRIMEIRO OLÁ AO PRÓXIMO PASSO</p>
            <h2>
              Como fazer
              <br />
              <em>parte disso?</em>
            </h2>
            <p>{wholesaleContent.stepsIntroduction}</p>
            <ActionLink href={registrationHref}>
              {brand.labels.request}
            </ActionLink>
            <aside className="registration-note">
              <p>{wholesaleContent.registrationGuidance}</p>
            </aside>
          </div>
          <ol className="step-list">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <WholesaleAccess />
      <section
        className="section container faq-section"
        aria-labelledby="faq-heading"
      >
        <div>
          <p className="eyebrow">PARA COMEÇAR COM CLAREZA</p>
          <h2 id="faq-heading">
            Sua próxima dúvida
            <br />
            pode estar aqui.
          </h2>
        </div>
        <div>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>
                {faq.question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <aside className="container commercial-note">
        <Check size={20} aria-hidden="true" />
        <p>{wholesaleContent.conditions}</p>
      </aside>
      <ContactBanner />
    </>
  );
}
