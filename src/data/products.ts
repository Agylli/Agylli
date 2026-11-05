/** Real brand photographs for illustration; no prices or stock are represented here. */
export const categories = [
  { id: "pele", label: "Cuidados com a pele", short: "Pele", description: "Um respiro na sua rotina.", image: "/images/products/peeling-de-cristal.webp", className: "category-brand" },
  { id: "cabelos", label: "Cabelos", short: "Cabelos", description: "Seu jeito, da raiz às pontas.", image: "/images/products/linha-rescue.webp", className: "category-peach" },
  { id: "perfumes", label: "Perfumes", short: "Perfumes", description: "Presença que fica.", image: "/images/products/colonia-madelle.webp", className: "category-green" },
  { id: "maquiagem", label: "Maquiagem", short: "Maquiagem", description: "Expresse todas as suas versões.", image: "/images/products/batom-total-fix.webp", className: "category-pink" },
] as const;

export type CategoryId = typeof categories[number]["id"];
export const illustrativeProducts: { id: string; name: string; brand: string; category: CategoryId; detail: string; image: string }[] = [
  { id: "peeling", name: "Peeling de Cristal", brand: "Suave Fragrance", category: "pele", detail: "Cuidado facial · 50 g", image: "/images/products/peeling-de-cristal.webp" },
  { id: "rescue", name: "Linha Rescue+", brand: "D’Bianco", category: "cabelos", detail: "Linha profissional para cabelos", image: "/images/products/linha-rescue.webp" },
  { id: "madelle", name: "Deo Colônia Madelle", brand: "Suave Fragrance", category: "perfumes", detail: "Perfumaria · 100 ml", image: "/images/products/colonia-madelle.webp" },
  { id: "total-fix", name: "Batom Total Fix Camila", brand: "Suave Fragrance", category: "maquiagem", detail: "Maquiagem · cor Camila", image: "/images/products/batom-total-fix.webp" },
];

export const featuredBrands = [
  { name: "Facinatus Cosméticos", image: "/images/brand/facinatus.png", width: 440, height: 246, className: "partner-facinatus" },
  { name: "Suave Fragrance", image: "/images/brand/suave-fragrance.png", width: 600, height: 266, className: "partner-suave" },
  { name: "D’Bianco Professional", image: "/images/brand/dbianco.svg", width: 1254, height: 1254, className: "partner-dbianco" },
] as const;
