import Image from "next/image";
import { ArrowDown, Sparkles, Asterisk } from "lucide-react";
import { brand } from "@/config/brand";
import { marketing } from "@/config/marketing";
import { ActionLink } from "@/components/ui/action-link";

export function Hero() {
  return <section className="hero container" aria-labelledby="hero-heading">
    <div className="hero-copy"><p className="eyebrow"><Asterisk className="tiny-star" size={19} aria-hidden="true" />{brand.hero.eyebrow}</p>
      <h1 id="hero-heading">{brand.hero.title}<br /><em>{brand.hero.accent}</em></h1>
      <p className="hero-description">{brand.hero.description}</p>
      <div className="hero-actions"><ActionLink href={brand.links.retail}>{brand.labels.retail}</ActionLink><ActionLink href="/atacado" variant="secondary">{brand.labels.wholesale}</ActionLink></div>
      <div className="hero-footnote"><span className="line" /><span>{marketing.hero.footnote}</span></div>
    </div>
    <div className="hero-visual"><Image src="/images/hero-cosmetics.webp" alt="Composição ilustrativa de cosméticos Agylli em embalagens lilás, creme e âmbar sobre pedestais" fill sizes="(max-width: 767px) 100vw, 52vw" preload className="hero-photo" />
      <div className="hero-photo-label"><Sparkles size={15} aria-hidden="true" />{marketing.hero.photoLabel}</div>
      <span className="image-disclaimer">{marketing.hero.imageDisclosure}</span>
      <div className="hero-stamp" aria-hidden="true"><span>BELEZA EM</span><Asterisk className="stamp-star" size={38} strokeWidth={1.3} /><span>CADA POSSIBILIDADE</span></div>
    </div>
    <a href="#universo" className="hero-scroll" aria-label="Explore o universo Agylli"><ArrowDown size={16} aria-hidden="true" /></a>
  </section>;
}
