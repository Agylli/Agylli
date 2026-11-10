import { Heart, Layers, Store } from "lucide-react";
import { experience } from "@/config/content";
import { marketing } from "@/config/marketing";
import { ContactBanner } from "@/components/marketing/contact-banner";
import styles from "./experience-section.module.css";

const icons = { heart: Heart, store: Store };

export function ExperienceSection() {
  return <section className={styles.section} aria-labelledby="experience-heading">
    <div className="container">
      <div className={styles.heading}><p className={styles.eyebrow}>{marketing.experience.eyebrow}</p><h2 id="experience-heading">{marketing.experience.title}</h2></div>
      <div className={styles.grid}>{experience.map(item => {
        const Icon = item.icon ? icons[item.icon] : Layers;
        return <article key={item.title} className={styles.card}>
          <span className={styles.icon}><Icon size={26} strokeWidth={1.4} aria-hidden="true" /></span>
          <h3>{item.title}</h3><p>{item.description}</p>
        </article>;
      })}</div>
      <ContactBanner />
    </div>
  </section>;
}
