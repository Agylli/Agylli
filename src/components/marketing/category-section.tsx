import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/data/products";
import { marketing } from "@/config/marketing";

export function CategorySection() {
  return <section className="section container" aria-labelledby="categories-heading">
    <div className="section-heading"><div><p className="eyebrow">{marketing.categories.eyebrow}</p><h2 id="categories-heading">{marketing.categories.title}</h2></div><span className="section-aside">{marketing.categories.aside}</span></div>
    <div className="category-grid">{categories.map(category => <Link key={category.id} href={`/?categoria=${category.id}#produtos`} className={`category-card ${category.className}`}>
      <div className="category-art"><Image src={category.image} alt="" fill sizes="(max-width: 767px) 44vw, 23vw" /><span className="category-arrow"><ArrowUpRight size={18} aria-hidden="true" /></span></div>
      <h3>{category.label}</h3><p>{category.description}</p>
    </Link>)}</div>
  </section>;
}
