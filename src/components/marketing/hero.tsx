import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { brand } from "@/config/brand";
import { marketing } from "@/config/marketing";
import { ActionLink } from "@/components/ui/action-link";

export function Hero() {
  return <section className="hero container" aria-labelledby="hero-heading">
    <div className="hero-copy"><p className="eyebrow">{brand.hero.eyebrow}</p>
      <h1 id="hero-heading">{brand.hero.title}<br /><em>{brand.hero.accent}</em></h1>
      <p className="hero-description">{brand.hero.description}</p>
      <div className="hero-actions"><ActionLink href={brand.links.retail}>{brand.labels.retail}</ActionLink><ActionLink href="/atacado" variant="secondary">{brand.labels.wholesale}</ActionLink></div>
      <p className="hero-shopping-guide">{marketing.hero.shoppingGuide}</p>
      <div className="hero-footnote"><span className="line" /><span>{marketing.hero.footnote}</span></div>
    </div>
    <div className="hero-visual"><Image src="/images/products/linha-rescue.webp" alt="Fotografia da linha profissional Rescue+ D’Bianco, com shampoo, reconstrutor, queratina, máscara e bálsamo" fill sizes="(max-width: 767px) 100vw, 52vw" preload className="hero-photo" />
      <div className="hero-photo-label">{marketing.hero.photoLabel}</div>
      <span className="image-disclaimer">{marketing.hero.imageDisclosure}</span>
    </div>
    <a href="#universo" className="hero-scroll" aria-label="Explore o universo Agylli"><ArrowDown size={16} aria-hidden="true" /></a>
  </section>;
}
