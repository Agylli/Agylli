import { UUID_PATTERN } from "./validation";
import { resellerPortal } from "@/config/reseller";

export type CatalogProduct = {
  id: string; name: string; sku: string | null; brand: string; category: string;
  description: string; image_path: string | null; active: boolean;
  imageUrl?: string | null;
};
export type CatalogSelection = { id: string; quantity: number }[];
export const catalogBucket = "reseller-products";
export const catalogLimit = 500;
export function catalogSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}
export function filterCatalog(products: CatalogProduct[], query: string, category: string) {
  const term = catalogSearch(query);
  return products.filter(p => (!category || p.category === category) &&
    catalogSearch([p.name,p.sku,p.brand,p.category].join(" ")).includes(term));
}
export function addCatalogProduct(selection: CatalogSelection, id: string): CatalogSelection {
  const current = selection.find(p => p.id === id);
  if (current) return selection.map(p => p.id === id ? { ...p, quantity: Math.min(p.quantity + 1, 99) } : p);
  return selection.length < resellerPortal.requestLimit ? [...selection, { id, quantity: 1 }] : selection;
}
export function catalogSelection(form: FormData): CatalogSelection {
  const ids = form.getAll("catalog_id"), quantities = form.getAll("quantity");
  if (!ids.length || ids.length > resellerPortal.requestLimit || ids.length !== quantities.length)
    throw new Error("Selecione até 20 produtos para o pedido.");
  const seen = new Set<string>();
  return ids.map((raw, index) => {
    const id = typeof raw === "string" ? raw.toLowerCase() : "";
    const quantity = quantities[index];
    if (!UUID_PATTERN.test(id) || seen.has(id) || typeof quantity !== "string" || !/^[1-9]\d?$/.test(quantity))
      throw new Error("Revise os produtos e use quantidades inteiras de 1 a 99.");
    seen.add(id);
    return { id, quantity: Number(quantity) };
  });
}
export function catalogProductInput(form: FormData) {
  const field = (key: string) => typeof form.get(key) === "string" ? String(form.get(key)).trim() : "";
  const name = field("name"), sku = field("sku"), brand = field("brand"), category = field("category"), description = field("description");
  if (name.length < 2 || name.length > 160 || sku.length > 80 || brand.length > 80 || category.length > 80 || description.length > 1000 || /[\r\n]/.test(name + sku + brand + category))
    throw new Error("Confira nome, código, marca, categoria e descrição do produto.");
  if (form.get("authorized") !== "on") throw new Error("Confirme a autorização das informações e da fotografia.");
  return { name, sku: sku || null, brand, category, description, active: form.get("active") === "on" };
}
