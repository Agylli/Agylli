import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { brand } from "@/config/brand";
import { marketing } from "@/config/marketing";
import { BrandLogo } from "@/components/ui/brand-logo";
import { locations } from "@/config/locations";

export function Footer() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-top">
      <div className="footer-brand"><Link href="/" className="wordmark footer-logo" aria-label="Agylli Cosméticos — início"><BrandLogo /></Link><p>{marketing.footer.line1}<br />{marketing.footer.line2}</p></div>
      <div><h2>Explore</h2><nav aria-label="Navegação do rodapé">{brand.navigation.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav></div>
      <div><h2>Seu jeito de comprar</h2><nav aria-label="Canais de compra"><Link href={brand.links.retail}>Para você <ArrowUpRight size={14} aria-hidden="true" /></Link><Link href="/atacado">Para o seu negócio <ArrowUpRight size={14} aria-hidden="true" /></Link><Link href="/contato">Fale com a Agylli</Link></nav></div>
      <div className="footer-locations"><h2>Nossas unidades</h2>{locations.map(location => <address key={location.id}><strong className="footer-location-name">{location.city} · {location.stateCode}</strong><p>{location.street} — {location.neighborhood}</p><a href={location.whatsapp.href} aria-label={`WhatsApp da ${location.name}: ${location.whatsapp.label}`}>WhatsApp: {location.whatsapp.label}</a>{location.phones.map(phone => <a key={phone.href} href={phone.href} aria-label={`${phone.type} da ${location.name}: ${phone.label}`}>{phone.label}</a>)}</address>)}</div>
    </div>
    <div className="footer-bottom"><p>© {new Date().getFullYear()} {brand.name}.</p><p>{brand.provisional}</p></div>
    <p className="legal-note">{marketing.footer.legal}</p>
  </div></footer>;
}
