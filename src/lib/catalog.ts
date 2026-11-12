/** Only these public fields may leave the server. Never pass raw Admin API objects. */
export type CatalogCategory = { id: string; name: string; slug: string };
export type CatalogProduct = {
  id: string; name: string; brand: string; image: string | null; url: string;
  categoryIds: string[]; price: number | null; compareAt: number | null;
  fromPrice: boolean; available: boolean | null;
};
export type PublicCatalog = {
  status: "ready"; products: CatalogProduct[]; categories: CatalogCategory[];
  updatedAt: string; truncated: boolean;
};

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function id(value: unknown): string | null {
  const result = String(value ?? "");
  return /^[1-9]\d*$/.test(result) ? result : null;
}
export function catalogText(value: unknown): string {
  if (typeof value === "string") return value.trim().slice(0, 240);
  const languages = record(value);
  for (const key of ["pt", "pt-BR", "es", "en"]) if (typeof languages[key] === "string" && languages[key].trim()) return languages[key].trim().slice(0, 240);
  return "";
}
export function catalogSlug(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function catalogImage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    if (!url.hostname.endsWith(".mitiendanube.com") && url.hostname !== "d26lpennugtm8s.cloudfront.net") return null;
    return url.href;
  } catch { return null; }
}
function money(value: unknown): number | null {
  if (typeof value !== "number" && (typeof value !== "string" || !/^\d+(\.\d+)?$/.test(value))) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 1e12 ? number : null;
}
function variantAvailable(variant: Record<string, unknown>): boolean | null {
  if (variant.stock_management === false) return true;
  if (variant.stock_management === true && typeof variant.stock === "number" && Number.isFinite(variant.stock) && variant.stock >= 0) return variant.stock > 0;
  return null;
}
function pricing(rawVariants: unknown): Pick<CatalogProduct, "price" | "compareAt" | "fromPrice" | "available"> {
  const variants = Array.isArray(rawVariants) ? rawVariants.map(record) : [];
  const available = variants.some(v => variantAvailable(v) === true) ? true : variants.length && variants.every(v => variantAvailable(v) === false) ? false : null;
  const sellable = variants.filter(v => variantAvailable(v) !== false);
  const candidates = sellable.length ? sellable : variants;
  const prices = candidates.map(variant => {
    const regular = money(variant.price), promotion = money(variant.promotional_price);
    return { regular, value: regular === null ? null : promotion !== null && promotion < regular ? promotion : regular };
  });
  if (!prices.length || prices.some(p => p.value === null)) return { price: null, compareAt: null, fromPrice: false, available };
  const price = Math.min(...prices.map(p => p.value!));
  const fromPrice = prices.some(p => p.value !== price);
  const compareAt = !fromPrice && prices.every(p => p.regular === prices[0].regular && p.regular! > price) ? prices[0].regular : null;
  return { price, compareAt, fromPrice, available };
}

export function normalizeCatalog(rawProducts: unknown[], rawCategories: unknown[], storeUrl: string, truncated = false): PublicCatalog {
  const origin = new URL(storeUrl).origin;
  const categoryMap = new Map<string, CatalogCategory & { parent: string | null }>();
  const categoryRecords = [...rawCategories, ...rawProducts.flatMap(p => Array.isArray(record(p).categories) ? record(p).categories as unknown[] : [])];
  const hidden = new Set(categoryRecords.filter(c => ["hidden", "soft-hidden"].includes(String(record(c).visibility))).map(c => id(record(c).id)).filter(Boolean));
  for (const item of categoryRecords) {
    const category = record(item), key = id(category.id), name = catalogText(category.name);
    if (!key || !name || hidden.has(key)) continue;
    categoryMap.set(key, { id: key, name, slug: catalogSlug(catalogText(category.handle) || name), parent: id(category.parent) });
  }
  const products: CatalogProduct[] = [];
  const seen = new Set<string>();
  for (const item of rawProducts) {
    const product = record(item), key = id(product.id), name = catalogText(product.name), handle = catalogText(product.handle);
    if (!key || seen.has(key) || !name || !handle || /[/?#\\\s]/.test(handle) || handle === "." || handle === "..") continue;
    if (product.visibility !== undefined ? product.visibility !== "visible" : product.published !== true) continue;
    const memberships = new Set<string>();
    for (const category of Array.isArray(product.categories) ? product.categories : []) {
      let categoryId = id(typeof category === "object" ? record(category).id : category);
      const visited = new Set<string>();
      while (categoryId && !visited.has(categoryId)) {
        visited.add(categoryId);
        const entry = categoryMap.get(categoryId);
        if (!entry) break;
        memberships.add(categoryId); categoryId = entry.parent;
      }
    }
    const images = Array.isArray(product.images) ? product.images : [];
    products.push({ id: key, name, brand: catalogText(product.brand), image: images.map(image => catalogImage(record(image).src)).find(Boolean) ?? null,
      url: new URL(`/produtos/${encodeURIComponent(handle)}/`, origin).href, categoryIds: [...memberships], ...pricing(product.variants) });
    seen.add(key);
  }
  const usedCategories = new Set(products.flatMap(product => product.categoryIds));
  const categories = [...categoryMap.values()].filter(c => usedCategories.has(c.id)).map(({ id, name, slug }) => ({ id, name, slug }));
  return { status: "ready", products, categories, updatedAt: new Date().toISOString(), truncated };
}

const aliases: Record<string, string[]> = {
  pele: ["pele", "cuidados-com-a-pele", "cuidados-faciais", "facial", "rosto", "skincare"],
  cabelos: ["cabelos", "capilar", "linha-capilar", "cuidados-com-os-cabelos"],
  perfumes: ["perfumes", "perfumaria", "fragrancias"],
  maquiagem: ["maquiagem", "maquiagens", "make-up", "makeup", "make"],
};
export function matchingCategories(requested: string, categories: CatalogCategory[]): string[] {
  const accepted = aliases[requested] ?? [requested];
  return categories.filter(c => c.id === requested || accepted.includes(c.slug) || accepted.includes(catalogSlug(c.name))).map(c => c.id);
}
