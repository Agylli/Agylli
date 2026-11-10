import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories, categoryArtwork } from "@/data/products";
import { marketing } from "@/config/marketing";
import styles from "./category-section.module.css";

export function CategorySection() {
  return <section className="section container" aria-labelledby="categories-heading">
    <div className="section-heading"><div><p className="eyebrow">{marketing.categories.eyebrow}</p><h2 id="categories-heading">{marketing.categories.title}</h2></div><span className="section-aside">{marketing.categories.aside}</span></div>
    <div className={styles.grid}>{categories.map(category => <Link key={category.id} href={`/?categoria=${category.id}#produtos`} className={styles.card}>
      <div className={`${styles.art} ${styles[category.id]}`}>
        <span className={styles.arch} aria-hidden="true" /><span className={styles.pedestal} aria-hidden="true" />
        {categoryArtwork[category.id].map(item => <div key={item.image} className={`${styles.product} ${styles[item.position]}`}><Image src={item.image} alt="" fill sizes="(max-width: 767px) 42vw, 23vw" /></div>)}
        <span className={styles.arrow}><ArrowUpRight size={18} aria-hidden="true" /></span>
      </div>
      <h3>{category.label}</h3><p>{category.description}</p>
    </Link>)}</div>
    <p className={styles.disclosure}>Composições ilustrativas com produtos das marcas. Consulte catálogo e disponibilidade.</p>
  </section>;
}
