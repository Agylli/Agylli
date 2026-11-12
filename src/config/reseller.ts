export const resellerPortal = {
  home: "/revendedor",
  login: "/revendedor/entrar",
  signup: "/revendedor/cadastro",
  team: "/equipe",
  requestLimit: 20,
  materialLimitBytes: 3 * 1024 * 1024,
  // Free supports 50 MB. Activate 100 only after plan/global/bucket approval.
  get catalogPdfLimitBytes() { return (process.env.NEXT_PUBLIC_RESELLER_PDF_LIMIT_MB === "100" ? 100 : 50) * 1024 * 1024; },
  bucket: "reseller-materials",
  benefits: [
    {
      title: "Sua parceria, por perto",
      description:
        "Atendimento da equipe em Cândido Sales para acompanhar suas solicitações e orientar sua revenda.",
    },
    {
      title: "Conteúdo para apresentar",
      description:
        "Catálogos e materiais de divulgação autorizados, quando disponibilizados pela equipe.",
    },
    {
      title: "Tudo em um só lugar",
      description:
        "Consulte o andamento dos pedidos e as compras confirmadas vinculadas ao seu cadastro.",
    },
  ],
} as const;

export const requestStatuses = {
  recebido: "Recebido",
  em_analise: "Em análise",
  em_separacao: "Em separação",
  pronto: "Pronto para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
} as const;
export type RequestStatus = keyof typeof requestStatuses;
export const statusTransitions: Record<
  RequestStatus,
  readonly RequestStatus[]
> = {
  recebido: ["em_analise", "cancelado"],
  em_analise: ["em_separacao", "cancelado"],
  em_separacao: ["pronto", "cancelado"],
  pronto: ["entregue", "cancelado"],
  entregue: [],
  cancelado: [],
};
export const profileStatuses = {
  pending: "Cadastro em análise",
  approved: "Cadastro aprovado",
  suspended: "Acesso suspenso",
} as const;
export const materialCategories = {
  catalogo: "Catálogo",
  divulgacao: "Divulgação",
  beneficio: "Benefício",
} as const;
