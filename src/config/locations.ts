/** Unidade e contato atualizados pela Agylli em 10/11/2026. */
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
  },
] as const;

export const locationContent = {
  eyebrow: "AGYLLI EM CÂNDIDO SALES · BA",
  title: "Onde atuamos.",
  introduction: "Nossa unidade está em Cândido Sales, na Bahia. Um ponto de encontro entre pessoas, produtos e novas possibilidades.",
  unitsTitle: "Encontre a Agylli.",
  coverage: "Estamos em Cândido Sales, na Região de Vitória da Conquista. Consulte nossa equipe pelo WhatsApp sobre atendimento à sua localidade e condições de entrega.",
  contactIntroduction: "Converse com nossa equipe em Cândido Sales. Podemos ajudar com produtos, atendimento e informações para revendedores.",
  resellerNotice: "Para solicitar informações sobre cadastro e revenda, fale com nossa unidade de Cândido Sales pelo WhatsApp. O cadastro online está em preparação; este site não coleta documentos nem confirma solicitações de acesso.",
} as const;

export function locationMapUrl(location: typeof locations[number]): string {
  const address = `${location.street}, ${location.neighborhood}, ${location.city}, ${location.state}, Brasil`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
