import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { marketing } from "@/config/marketing";

export function ContactBanner() {
  return <section className="contact-banner container" aria-labelledby="contact-heading"><div><p className="eyebrow">{marketing.contact.eyebrow}</p><h2 id="contact-heading">{marketing.contact.title}</h2><p>{marketing.contact.description}</p></div><Link href="/contato" className="contact-circle" aria-label="Conheça nossos canais de atendimento"><ArrowUpRight size={32} strokeWidth={1.4} aria-hidden="true" /></Link></section>;
}
