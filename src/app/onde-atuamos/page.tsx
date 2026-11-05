import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro } from "@/components/marketing/page-intro";
import { LocationCards } from "@/components/marketing/location-cards";
import { ActionLink } from "@/components/ui/action-link";
import { locationContent } from "@/config/locations";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Onde atuamos",
  description: "Conheça as unidades Agylli em Cândido Sales, na Bahia, e Ipatinga, em Minas Gerais. Endereços, WhatsApp e telefones oficiais.",
  alternates: { canonical: brand.links.site ? "/onde-atuamos" : undefined },
};

export default function LocationsPage() {
  return <>
    <PageIntro eyebrow={locationContent.eyebrow} title={locationContent.title}><p>{locationContent.introduction}</p></PageIntro>
    <section className="section container" aria-labelledby="units-heading">
      <div className="coverage-overview"><div><p className="eyebrow">PESSOAS, PRODUTOS E CONEXÕES</p><h2 id="units-heading">{locationContent.unitsTitle}</h2><p className="locations-introduction">{locationContent.coverage}</p></div><figure><Image src={locationContent.map.src} width={locationContent.map.width} height={locationContent.map.height} alt={locationContent.map.alt} sizes="(max-width: 767px) 90vw, 50vw" /><figcaption>{locationContent.map.caption}</figcaption></figure></div>
      <LocationCards />
    </section>
    <section className="container region-callout"><div><p className="eyebrow">NOVAS POSSIBILIDADES PARA O SEU NEGÓCIO</p><h2>Vamos falar de revenda?</h2><p>Conheça a proposta de atacado e converse com a unidade da sua região.</p></div><ActionLink href="/atacado">Conhecer o atacado</ActionLink></section>
  </>;
}
