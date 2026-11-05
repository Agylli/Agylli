import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <section className="page-intro"><div className="container"><Link href="/" className="back-link"><ArrowLeft size={15} aria-hidden="true" /> Voltar ao início</Link><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><div className="intro-description">{children}</div></div></section>;
}
