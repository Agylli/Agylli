"use client";

import Image from "next/image";
import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { featuredBrands } from "@/data/products";
import styles from "./partner-logos.module.css";

export function PartnerLogos() {
  const [paused, setPaused] = useState(false);
  return <div className={styles.gallery} data-paused={paused}>
    <div className={styles.stage} aria-hidden="true">
      {[0, 1, 2].map(slot => <div className={styles.slot} key={slot}>
        {featuredBrands.map((_, index) => {
          const partner = featuredBrands[(index + slot) % featuredBrands.length];
          return <div key={partner.name} className={`${styles.layer} ${partner.dark ? styles.dark : ""}`} style={{ animationDelay: `${index === 0 ? 0 : (index - featuredBrands.length) * 5}s` }}>
            <Image src={partner.image} alt="" width={partner.width} height={partner.height} loading="eager" sizes="(max-width: 767px) 40vw, 20vw" />
          </div>;
        })}
      </div>)}
    </div>
    <ul className={styles.staticList} aria-label="Marcas parceiras">
      {featuredBrands.map(partner => <li key={partner.name} className={partner.dark ? styles.dark : ""}><Image src={partner.image} alt={partner.name} width={partner.width} height={partner.height} loading="eager" sizes="(max-width: 767px) 40vw, 20vw" /></li>)}
    </ul>
    <button type="button" className={styles.control} aria-label={paused ? "Retomar alternância das marcas" : "Pausar alternância das marcas"} aria-pressed={paused} onClick={() => setPaused(value => !value)}>
      {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}<span>{paused ? "Retomar" : "Pausar"}</span>
    </button>
  </div>;
}
