export const categories = [
  { id: "pele", label: "Cuidados com a pele", short: "Pele", description: "Um respiro na sua rotina.", image: "/images/skincare.svg", className: "category-lilac" },
  { id: "cabelos", label: "Cabelos", short: "Cabelos", description: "Seu jeito, da raiz às pontas.", image: "/images/haircare.svg", className: "category-peach" },
  { id: "perfumes", label: "Perfumes", short: "Perfumes", description: "Presença que fica.", image: "/images/perfume.svg", className: "category-green" },
  { id: "maquiagem", label: "Maquiagem", short: "Maquiagem", description: "Expresse todas as suas versões.", image: "/images/makeup.svg", className: "category-pink" },
] as const;

export type CategoryId = typeof categories[number]["id"];
export const demoProducts: { id: string; name: string; category: CategoryId; detail: string; image: string; color: string }[] = [
  { id: "serum", name: "Sérum Essencial", category: "pele", detail: "Um convite ao autocuidado", image: "/images/skincare.svg", color: "var(--color-lilac-light)" },
  { id: "hair", name: "Ritual Capilar", category: "cabelos", detail: "Cuidado da raiz às pontas", image: "/images/haircare.svg", color: "var(--color-peach)" },
  { id: "perfume", name: "Essência Aurora", category: "perfumes", detail: "Seu próximo encontro olfativo", image: "/images/perfume.svg", color: "var(--color-sage)" },
  { id: "makeup", name: "Cor em Movimento", category: "maquiagem", detail: "Beleza para se expressar", image: "/images/makeup.svg", color: "var(--color-rose)" },
];
