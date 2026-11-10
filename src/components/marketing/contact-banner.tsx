import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { marketing } from "@/config/marketing";
import { locations } from "@/config/locations";
import styles from "./experience-section.module.css";

export function ContactBanner() {
  const location = locations[0];
  return <section className={styles.contact} aria-labelledby="contact-heading">
    <div><p className={styles.eyebrow}>{marketing.contact.eyebrow}</p><h2 id="contact-heading">{marketing.contact.title}</h2><p className={styles.contactDescription}>{marketing.contact.description}</p>
      <address className={styles.address}><strong>{location.city} · {location.stateCode}</strong>{location.street} — {location.neighborhood}<br />WhatsApp: {location.whatsapp.label}</address>
    </div>
    <div className={styles.actions}><a href={location.whatsapp.href} className={styles.whatsapp}>Conversar no WhatsApp<ArrowUpRight size={18} aria-hidden="true" /></a><Link href="/contato" className={styles.details}>Ver canais de atendimento</Link></div>
  </section>;
}
