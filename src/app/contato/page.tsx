import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/marketing/page-intro";
import { LocationCards } from "@/components/marketing/location-cards";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { resellerPortal } from "@/config/reseller";
import { brand } from "@/config/brand";
import { locationContent } from "@/config/locations";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a Agylli em Cândido Sales, BA. Rua Rio Pardo, 75 — Célio Alves. WhatsApp (77) 98854-9691 para atendimento e revenda.",
  alternates: { canonical: brand.links.site ? "/contato" : undefined },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ assunto?: string }>;
}) {
  const { assunto } = await searchParams;
  const isWholesale = assunto === "revenda";
  const portalReady = !!supabaseSettings();

  return (
    <>
      <PageIntro
        eyebrow={isWholesale ? "VAMOS FALAR DE REVENDA" : "ATENDIMENTO AGYLLI"}
        title={
          isWholesale
            ? "Seu próximo passo começa aqui."
            : "Toda boa conexão começa com um olá."
        }
      >
        <p>{locationContent.contactIntroduction}</p>
      </PageIntro>
      <section className="section container" aria-labelledby="channels-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CÂNDIDO SALES · BA</p>
            <h2 id="channels-heading">Fale com nossa equipe.</h2>
          </div>
          <Link href="/onde-atuamos" className="inline-link">
            Conheça nossa área de atuação
          </Link>
        </div>
        {isWholesale && (
          <aside className="reseller-contact-note">
            <p role="status">
              {portalReady
                ? locationContent.resellerPortalNotice
                : locationContent.resellerNotice}
            </p>
            {portalReady && (
              <Link href={resellerPortal.home} className="inline-link">
                Acessar minha área de revendedor
              </Link>
            )}
          </aside>
        )}
        <LocationCards />
      </section>
      <section className="container contact-choice">
        <div>
          <p className="eyebrow">CONTINUE A EXPLORAR</p>
          <h2>Qual é a sua próxima descoberta?</h2>
        </div>
        <div>
          <Link href={brand.links.retail} className="inline-link">
            Quero comprar para mim
          </Link>
          <Link href="/atacado" className="inline-link">
            Quero conhecer o atacado
          </Link>
        </div>
      </section>
    </>
  );
}
