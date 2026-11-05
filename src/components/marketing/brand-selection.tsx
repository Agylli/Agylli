import Image from "next/image";
import { featuredBrands } from "@/data/products";
import { marketing } from "@/config/marketing";

export function BrandSelection() {
  return <section className="brand-selection container" aria-labelledby="brands-heading">
    <div><p className="eyebrow">{marketing.brands.eyebrow}</p><h2 id="brands-heading">{marketing.brands.title}</h2><p>{marketing.brands.description}</p></div>
    <ul className="partner-grid">{featuredBrands.map(partner => <li key={partner.name} className={partner.className}><Image src={partner.image} alt={partner.name} width={partner.width} height={partner.height} sizes="(max-width: 767px) 45vw, 22vw" /></li>)}</ul>
  </section>;
}
