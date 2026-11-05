import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { ActionLink } from "@/components/ui/action-link";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Nossa loja está chegando", description: "A loja online Agylli está em preparação. Em breve, um novo espaço para os seus momentos de cuidado.", robots: { index: false, follow: true } };
export default function ComingSoonPage() {
  return <section className="container coming-soon"><div><span className="status"><i aria-hidden="true" />Um novo capítulo está chegando</span><Sparkles className="coming-sparkle" size={44} strokeWidth={1} aria-hidden="true" /><p className="eyebrow">AGYLLI PARA VOCÊ</p><h1>Coisas bonitas<br />levam <em>cuidado.</em></h1><p>Estamos preparando nossa loja online com carinho. Em breve, você terá um novo espaço para descobrir cosméticos e criar seus próprios rituais.</p><p>As compras serão realizadas pela Nuvemshop quando a loja estiver disponível. Até lá, conheça um pouco mais da Agylli.</p><div className="hero-actions"><ActionLink href="/">Explorar a Agylli</ActionLink><ActionLink href="/atacado" variant="secondary">Conhecer o atacado</ActionLink></div>{brand.links.retail !== "/loja-em-breve" && <ActionLink href={brand.links.retail} variant="text">Acessar a loja disponível</ActionLink>}</div><div className="coming-image"><Image src="/images/hero-cosmetics.webp" alt="Composição conceitual de cosméticos com embalagens provisórias da Agylli" fill sizes="(max-width: 767px) 90vw, 45vw" /><span>Um novo olhar para a sua rotina.</span></div></section>;
}
