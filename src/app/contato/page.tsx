import type { Metadata } from "next";
import { Mail, MessageCircle, Store, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PageIntro } from "@/components/marketing/page-intro";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Contato", description: "Conheça os canais de atendimento da Agylli Cosméticos para consumidores e revendedores.", alternates: { canonical: brand.links.site ? "/contato" : undefined } };
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ assunto?: string }> }) {
  const { assunto } = await searchParams;
  const isWholesale = assunto === "revenda";
  const hasContact = !!brand.contact.email || !!brand.contact.whatsapp;
  return <><PageIntro eyebrow={isWholesale ? "VAMOS FALAR DE REVENDA" : "ESTAMOS CONSTRUINDO NOVAS CONEXÕES"} title={isWholesale ? "Seu próximo passo começa aqui." : "Toda boa conexão começa com um olá."}><p>{isWholesale ? "A área de cadastro de revendedores está em preparação. Consulte abaixo a disponibilidade dos nossos canais oficiais para solicitar informações sobre o atacado." : "Para tirar dúvidas, conhecer a marca ou conversar sobre novas possibilidades para o seu negócio."}</p></PageIntro>
    <section className="section container contact-content" aria-labelledby="channels-heading"><div><p className="eyebrow">ATENDIMENTO AGYLLI</p><h2 id="channels-heading">Vamos conversar.</h2><p>{hasContact ? "Escolha um dos canais oficiais disponíveis para entrar em contato com nossa equipe." : brand.contact.pending}</p>{!hasContact && <div className="pending-message" role="status"><span className="status"><i aria-hidden="true" />Canais em preparação</span><p>{isWholesale ? "Ainda não estamos recebendo solicitações de cadastro por este site. Volte em breve para acessar o canal oficial. Nenhum dado pessoal foi coletado ou enviado." : "Os links de atendimento aparecerão aqui assim que forem confirmados. Nenhum dado pessoal é coletado por esta página."}</p></div>}</div>
      <div className="contact-cards">{brand.contact.whatsapp && <a className="contact-card" href={brand.contact.whatsapp}><MessageCircle aria-hidden="true" /><div><h3>WhatsApp</h3><p>Converse pelo canal oficial.</p></div><ArrowUpRight aria-hidden="true" /></a>}{brand.contact.email && <a className="contact-card" href={`mailto:${brand.contact.email}`}><Mail aria-hidden="true" /><div><h3>E-mail</h3><p>{brand.contact.email}</p></div><ArrowUpRight aria-hidden="true" /></a>}<div className="contact-card"><Store aria-hidden="true" /><div><h3>Nossa loja física</h3><p>Endereço e horários serão publicados após confirmação das informações oficiais.</p></div></div></div>
    </section><section className="container contact-choice"><div><p className="eyebrow">ENQUANTO ISSO, EXPLORE</p><h2>Qual é a sua próxima descoberta?</h2></div><div><Link href={brand.links.retail} className="inline-link">Quero comprar para mim <ArrowUpRight size={17} aria-hidden="true" /></Link><Link href="/atacado" className="inline-link">Quero conhecer o atacado <ArrowUpRight size={17} aria-hidden="true" /></Link></div></section></>;
}
