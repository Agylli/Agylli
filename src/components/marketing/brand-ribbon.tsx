"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { marketing } from "@/config/marketing";
import styles from "./brand-intro.module.css";

export function BrandRibbon() {
  const [paused, setPaused] = useState(false);
  return <div className={styles.ribbon} role="region" aria-label="Para sua rotina e para o seu negócio">
    <div className={styles.window}>
      <div className={styles.track} data-paused={paused}>
        {[0, 1].map(copy => <div key={copy} className={styles.group} aria-hidden={copy === 1 ? true : undefined}>
          {marketing.ribbon.map(label => <span key={label} className={styles.item}><span className={styles.marker} aria-hidden="true" />{label}</span>)}
        </div>)}
      </div>
    </div>
    <button type="button" className={styles.pause} aria-label={paused ? "Retomar movimento da faixa" : "Pausar movimento da faixa"} aria-pressed={paused} onClick={() => setPaused(value => !value)}>
      {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
    </button>
  </div>;
}
