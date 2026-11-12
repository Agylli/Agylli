import type { PublicCatalog } from "@/lib/catalog";
import type { CatalogProduct, CatalogSelection } from "./catalog";
import { resellerPortal } from "@/config/reseller";

/** Explicit projection: retail prices, availability and purchase URLs stay out of the portal. */
export function resellerNuvemshopProducts(catalog: PublicCatalog): CatalogProduct[] {
  return catalog.products.map(product => ({
    id: `nuvemshop:${product.id}`,
    name: product.name.replace(/\s+/g, " ").trim().slice(0, 160),
    sku: `Nuvemshop #${product.id}`,
    brand: product.brand,
    category: catalog.categories.find(category => product.categoryIds.includes(category.id))?.name ?? "",
    description: "",
    image_path: null,
    imageUrl: product.image,
    active: true,
  }));
}

export function nuvemshopSelection(form: FormData): CatalogSelection {
  const ids = form.getAll("catalog_id"), quantities = form.getAll("quantity");
  if (!ids.length || ids.length > resellerPortal.requestLimit || ids.length !== quantities.length)
    throw new Error("Selecione até 20 produtos para a solicitação.");
  const seen = new Set<string>();
  return ids.map((id, index) => {
    const quantity = quantities[index];
    if (typeof id !== "string" || !/^nuvemshop:[1-9]\d*$/.test(id) || seen.has(id) || typeof quantity !== "string" || !/^[1-9]\d?$/.test(quantity))
      throw new Error("Revise os produtos e use quantidades inteiras de 1 a 99.");
    seen.add(id);
    return { id, quantity: Number(quantity) };
  });
}

export function nuvemshopRequestItems(selection: CatalogSelection, catalog: PublicCatalog) {
  const products = resellerNuvemshopProducts(catalog);
  return selection.map(item => {
    const product = products.find(product => product.id === item.id);
    if (!product) throw new Error("Um produto não está mais publicado. Atualize a página e revise seu carrinho.");
    return { name: product.name, sku: product.sku!, quantity: item.quantity };
  });
}
