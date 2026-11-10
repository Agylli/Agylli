import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { PageIntro } from "@/components/marketing/page-intro";
import { LocationCards } from "@/components/marketing/location-cards";
import { ActionLink } from "@/components/ui/action-link";
import { locationContent, locations, locationMapUrl } from "@/config/locations";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Onde atuamos",
  description: "Conheça a unidade Agylli em Cândido Sales, BA. Rua Rio Pardo, 75 — Célio Alves. WhatsApp (77) 98854-9691.",
  alternates: { canonical: brand.links.site ? "/onde-atuamos" : undefined },
};

export default function LocationsPage() {
  return <>
    <PageIntro eyebrow={locationContent.eyebrow} title={locationContent.title}><p>{locationContent.introduction}</p></PageIntro>
    <section className="section container" aria-labelledby="units-heading">
      <div className="coverage-overview"><div><p className="eyebrow">PESSOAS, PRODUTOS E CONEXÕES</p><h2 id="units-heading">{locationContent.unitsTitle}</h2><p className="locations-introduction">{locationContent.coverage}</p></div><aside className="unit-address-panel"><MapPin size={32} strokeWidth={1.4} aria-hidden="true" /><h3>Cândido Sales · BA</h3><p>Rua Rio Pardo, 75 — Célio Alves</p><a href={locationMapUrl(locations[0])} className="inline-link">Ver endereço no mapa</a></aside></div>
      <LocationCards />
    </section>
    <section className="container region-callout"><div><p className="eyebrow">NOVAS POSSIBILIDADES PARA O SEU NEGÓCIO</p><h2>Vamos falar de revenda?</h2><p>Conheça a proposta de atacado e converse com nossa equipe em Cândido Sales.</p></div><ActionLink href="/atacado">Conhecer o atacado</ActionLink></section>
  </>;
}
