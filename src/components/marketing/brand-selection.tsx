import { marketing } from "@/config/marketing";
import { PartnerLogos } from "@/components/marketing/partner-logos";

export function BrandSelection() {
  return <section className="brand-selection container" aria-labelledby="brands-heading">
    <div><p className="eyebrow">{marketing.brands.eyebrow}</p><h2 id="brands-heading">{marketing.brands.title}</h2><p>{marketing.brands.description}</p></div>
    <PartnerLogos />
  </section>;
}
