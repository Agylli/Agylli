import Image from "next/image";
import { brand } from "@/config/brand";
import { marketing } from "@/config/marketing";
import { ActionLink } from "@/components/ui/action-link";
import styles from "./hero.module.css";

export function Hero() {
  return <section className={`${styles.hero} container`} aria-labelledby="hero-heading">
    <div className={styles.intro}>
      <p className={styles.eyebrow}>{brand.hero.eyebrow}</p>
      <h1 id="hero-heading"><span>{brand.hero.title}</span><br /><em>{brand.hero.accent}</em></h1>
      <p className={styles.description}>{brand.hero.description}</p>
    </div>
    <div className={styles.paths}>
      {marketing.hero.paths.map((path, index) => <article key={path.channel} className={`${styles.card} ${index === 0 ? styles.retail : styles.wholesale}`} aria-labelledby={`hero-${path.channel}`}>
        <div className={styles.copy}>
          <p className={styles.channel}>{path.label}</p>
          <h2 id={`hero-${path.channel}`}>{path.title}</h2>
          <p className={styles.cardDescription}>{path.description}</p>
        </div>
        <div className={styles.image}>
          <Image src={path.image} alt={path.alt} fill sizes="(max-width: 767px) 36vw, 23vw" preload={index === 0} className={styles.photo} />
        </div>
        <ActionLink href={index === 0 ? brand.links.retail : "/atacado"} variant={index === 0 ? "primary" : "light"} className={styles.action}>
          {index === 0 ? brand.labels.retail : brand.labels.wholesale}
        </ActionLink>
      </article>)}
    </div>
    <p className={styles.disclosure}>{marketing.hero.imageDisclosure}</p>
  </section>;
}
