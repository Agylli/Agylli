import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { marketing } from "@/config/marketing";
import { resellerPortal } from "@/config/reseller";

export function WholesaleBanner() {
  return <section className="wholesale-banner container" aria-labelledby="wholesale-heading">
    <div className="wholesale-art" aria-hidden="true"><div className="wholesale-orbit orbit-one" /><div className="wholesale-orbit orbit-two" /><span className="wholesale-art-label">BELEZA QUE<br />MOVIMENTA.</span><div className="wholesale-art-note">NOVOS CAMINHOS, JUNTOS.</div></div>
    <div className="wholesale-copy"><p className="eyebrow">{marketing.wholesale.eyebrow}</p><h2 id="wholesale-heading">{marketing.wholesale.title}<br />{marketing.wholesale.subtitle} <em>{marketing.wholesale.accent}</em></h2><p>{marketing.wholesale.description}</p><Link href={resellerPortal.signup} className="button button-primary"><span>{marketing.wholesale.action}</span><ArrowUpRight size={18} aria-hidden="true" /></Link><span className="wholesale-disclaimer">{marketing.wholesale.disclosure}</span></div>
  </section>;
}
