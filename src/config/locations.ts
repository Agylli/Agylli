/** Unidades informadas pela Agylli e conferidas em /fale-conosco/ e /ondeatuamos/. */
export const locations = [
  {
    id: "candido-sales",
    name: "Unidade de Cândido Sales",
    state: "Bahia",
    stateCode: "BA",
    region: "Região de Vitória da Conquista",
    city: "Cândido Sales",
    street: "Rua Rio Pardo, 75",
    neighborhood: "Célio Alves",
    whatsapp: { label: "(77) 98854-9691", href: "https://wa.me/5577988549691" },
    phones: [{ label: "(77) 3438-2030", href: "tel:+557734382030", type: "Telefone" }],
  },
  {
    id: "ipatinga",
    name: "Unidade de Ipatinga",
    state: "Minas Gerais",
    stateCode: "MG",
    region: "Região do Vale do Aço",
    city: "Ipatinga",
    street: "Campo Grande, 690 A",
    neighborhood: "Caravelas",
    whatsapp: { label: "(31) 99390-2031", href: "https://wa.me/5531993902031" },
    phones: [{ label: "0800 283 1787", href: "tel:08002831787", type: "Central de atendimento" }],
  },
] as const;

export const locationContent = {
  eyebrow: "AGYLLI NA BAHIA E EM MINAS GERAIS",
  title: "Onde atuamos.",
  introduction: "Duas unidades, uma mesma conexão: aproximar pessoas, produtos e novas possibilidades. Conheça os contatos da Agylli e fale com a equipe da sua região.",
  unitsTitle: "Encontre a sua unidade.",
  coverage: "Nossas unidades estão nas regiões de Vitória da Conquista, na Bahia, e do Vale do Aço, em Minas Gerais. Consulte a equipe sobre atendimento à sua localidade e condições de entrega.",
  map: { src: "/images/locations/agylli-atuacao.webp", width: 1024, height: 805, alt: "Mapa do Brasil com as unidades Agylli destacadas na Bahia e em Minas Gerais.", caption: "Mapa institucional publicado pela Agylli. Consulte a unidade sobre atendimento à sua localidade." },
  contactIntroduction: "Escolha a unidade com a qual deseja conversar. Nossa equipe pode ajudar com produtos, atendimento e informações para revendedores.",
  resellerNotice: "Para solicitar informações sobre cadastro e revenda, fale com uma das unidades pelo WhatsApp ou telefone. O cadastro online está em preparação; este site não coleta documentos nem confirma solicitações de acesso.",
} as const;

export function locationMapUrl(location: typeof locations[number]): string {
  const address = `${location.street}, ${location.neighborhood}, ${location.city}, ${location.state}, Brasil`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
