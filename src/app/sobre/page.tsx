import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro } from "@/components/marketing/page-intro";
import { ContactBanner } from "@/components/marketing/contact-banner";
import { ActionLink } from "@/components/ui/action-link";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Sobre nós", description: "Conheça a Agylli Cosméticos: da loja física ao digital, conectando autocuidado e oportunidades para revendedores.", alternates: { canonical: brand.links.site ? "/sobre" : undefined } };
export default function AboutPage() {
  return <><PageIntro eyebrow="MUITO PRAZER, SOMOS A AGYLLI" title="Beleza que aproxima."><p>Para os seus momentos de cuidado. Para as suas próximas conquistas. Para todas as suas possibilidades.</p></PageIntro>
    <section className="section container about-layout"><div className="about-image"><Image src="/images/hero-cosmetics.webp" alt="Imagem conceitual de cosméticos Agylli, com embalagens e identidade provisórias" fill sizes="(max-width: 767px) 90vw, 45vw" /><span>Uma visão do que estamos construindo.</span></div><div className="about-copy"><p className="eyebrow">DA LOJA FÍSICA A UM NOVO CAPÍTULO</p><h2>O cuidado nos conecta.<br /><em>A beleza nos move.</em></h2><p>A Agylli Cosméticos comercializa cosméticos de marca própria e outras marcas, atendendo consumidores e revendedores. Nossa loja física já faz parte dessa história; agora, estamos preparando nosso espaço digital.</p><p>Aqui, você poderá conhecer nosso universo e encontrar o caminho para comprar no varejo ou explorar a proposta de atacado com CPF ou CNPJ.</p><p>Este é o começo de uma nova etapa. A identidade visual e a apresentação completa da nossa história serão atualizadas com as informações oficiais da marca.</p><ActionLink href={brand.links.retail}>Conheça nosso universo</ActionLink></div></section><ContactBanner /></>;
}
