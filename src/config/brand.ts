import { emailAddress, publicHttpsUrl, retailUrl, whatsappUrl, wholesaleUrl } from "@/lib/urls";

export const brand = {
  name: "Agylli Cosméticos",
  wordmark: "AGYLLI",
  logo: { src: "/images/brand/agylli-logo.png", width: 356, height: 92 },
  tagline: "Conectando pessoas a produtos.",
  description: "Cosméticos para o seu cuidado e novas possibilidades para o seu negócio. Conheça o universo Agylli, para consumidores e revendedores.",
  hero: {
    eyebrow: "SEU PRÓXIMO MOMENTO DE CUIDADO",
    title: "Beleza para você.",
    accent: "Oportunidade para seu negócio.",
    description: "Descubra um universo de cosméticos para cuidar de você ou impulsionar suas vendas.",
  },
  contact: {
    email: emailAddress(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    whatsapp: whatsappUrl(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
  },
  links: {
    retail: retailUrl(process.env.NEXT_PUBLIC_NUVEMSHOP_URL),
    wholesale: wholesaleUrl(process.env.NEXT_PUBLIC_NUVEMSHOP_B2B_URL),
    site: publicHttpsUrl(process.env.NEXT_PUBLIC_SITE_URL),
  },
  navigation: [
    { label: "Início", href: "/" },
    { label: "Produtos", href: "/#produtos" },
    { label: "Seja Revendedor", href: "/atacado" },
    { label: "Sobre Nós", href: "/sobre" },
    { label: "Onde atuamos", href: "/onde-atuamos" },
    { label: "Contato", href: "/contato" },
  ],
  labels: { retail: "Comprar no varejo", wholesale: "Comprar no atacado", request: "Solicitar acesso ao atacado" },
  provisional: "Seleção ilustrativa. Consulte catálogo, preços e disponibilidade nos canais oficiais.",
} as const;
