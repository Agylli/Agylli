import Link from "next/link";
import { ArrowUpRight, Sparkle } from "lucide-react";
import { brand } from "@/config/brand";
import { marketing } from "@/config/marketing";

export function Footer() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-top">
      <div className="footer-brand"><Link href="/" className="wordmark" aria-label="Agylli Cosméticos — início">{brand.wordmark}<span>COSMÉTICOS</span></Link><p>{marketing.footer.line1}<br />{marketing.footer.line2}</p><Sparkle size={32} strokeWidth={1} aria-hidden="true" /></div>
      <div><h2>Explore</h2><nav aria-label="Navegação do rodapé">{brand.navigation.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav></div>
      <div><h2>Seu jeito de comprar</h2><nav aria-label="Canais de compra"><Link href={brand.links.retail}>Para você <ArrowUpRight size={14} aria-hidden="true" /></Link><Link href="/atacado">Para o seu negócio <ArrowUpRight size={14} aria-hidden="true" /></Link><Link href="/contato">Fale com a Agylli</Link></nav></div>
      <div className="footer-note"><h2>Um novo capítulo</h2><p>{marketing.footer.description}</p><span className="status"><i aria-hidden="true" />Site em desenvolvimento</span></div>
    </div>
    <div className="footer-bottom"><p>© {new Date().getFullYear()} {brand.name}.</p><p>{brand.provisional}</p></div>
    <p className="legal-note">{marketing.footer.legal}</p>
  </div></footer>;
}
