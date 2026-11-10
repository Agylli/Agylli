import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { marketing } from "@/config/marketing";
import styles from "./brand-intro.module.css";

export function BrandIntro() {
  return <section id="universo" className={styles.intro} aria-labelledby="brand-intro-heading">
    <div className={`${styles.content} container`}>
      <p className={styles.eyebrow}>{marketing.intro.eyebrow}</p>
      <h2 id="brand-intro-heading">{marketing.intro.title}<br />{" "}{marketing.intro.subtitle} <em>{marketing.intro.accent}</em></h2>
      <span className={styles.rule} aria-hidden="true" />
      <p className={styles.description}>{marketing.intro.description}</p>
      <Link href="/sobre" className={styles.link}>{marketing.intro.action}<ArrowUpRight size={18} aria-hidden="true" /></Link>
    </div>
  </section>;
}
