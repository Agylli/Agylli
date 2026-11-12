import "server-only";
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import { normalizeCatalog } from "@/lib/catalog";
import { publicHttpsUrl } from "@/lib/urls";

export class CatalogError extends Error {
  constructor(public readonly code: string) { super(code); }
}
export function catalogConfiguration() {
  const storeId = process.env.NUVEMSHOP_STORE_ID?.trim();
  const token = process.env.NUVEMSHOP_ACCESS_TOKEN?.trim();
  const storeUrl = publicHttpsUrl(process.env.NEXT_PUBLIC_NUVEMSHOP_URL);
  if (!storeId || !token) return null;
  if (!/^[1-9]\d*$/.test(storeId) || /[\r\n]/.test(token) || !storeUrl) throw new CatalogError("configuration");
  return { storeId, token, storeUrl };
}

/** GET only, fixed upstream, no redirects; raw variants (including cost) never persist. */
export async function readPages(resource: "products" | "categories", config: { storeId: string; token: string }, deadline: number) {
  const endpoint = new URL(`https://api.nuvemshop.com.br/2025-03/${config.storeId}/${resource}`);
  endpoint.searchParams.set("per_page", "200");
  endpoint.searchParams.set("page", "1");
  endpoint.searchParams.set("fields", resource === "products" ? "id,name,handle,published,visibility,images,variants,brand,categories" : "id,name,handle,parent,visibility");
  if (resource === "products") endpoint.searchParams.set("published", "true");
  let next: URL | null = endpoint;
  const rows: unknown[] = [];
  const visited = new Set<string>();
  for (let page = 1; next && page <= 10; page++) {
    if (visited.has(next.href) || Date.now() >= deadline) throw new CatalogError("pagination");
    visited.add(next.href);
    const response: Response = await fetch(next, { method: "GET", headers: { Authorization: `Bearer ${config.token}`, "User-Agent": "Agylli Vitrine (https://www.agylli.com/)", Accept: "application/json" }, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(Math.max(1, Math.min(8000, deadline - Date.now()))) });
    if (!response.ok) throw new CatalogError(response.status === 401 || response.status === 403 ? "authorization" : response.status === 429 ? "rate_limit" : "upstream");
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new CatalogError("response");
    rows.push(...data);
    const link: string | undefined = response.headers.get("link")?.match(/<([^>]+)>;\s*rel=["']?next["']?/i)?.[1];
    next = null;
    if (link) {
      const candidate: URL = new URL(link, endpoint);
      if (candidate.origin !== endpoint.origin || candidate.pathname !== endpoint.pathname || candidate.username || candidate.password) throw new CatalogError("pagination");
      next = candidate;
    } else if (data.length === 200 && (!response.headers.has("x-total-count") || Number(response.headers.get("x-total-count")) > rows.length)) {
      next = new URL(endpoint); next.searchParams.set("page", String(page + 1));
    }
  }
  return { rows, truncated: next !== null };
}

export async function getPublicCatalog() {
  const config = catalogConfiguration();
  if (!config) return null;
  const fingerprint = createHash("sha256").update(config.token).digest("hex");
  const cached = unstable_cache(async () => {
    const deadline = Date.now() + 22000;
    const [products, categories] = await Promise.all([
      readPages("products", config, deadline), readPages("categories", config, deadline),
    ]);
    return normalizeCatalog(products.rows, categories.rows, config.storeUrl, products.truncated);
  }, ["agylli-public-catalog-v1", config.storeId, config.storeUrl, fingerprint], { revalidate: 60 });
  const catalog = await cached();
  if (Date.now() - Date.parse(catalog.updatedAt) > 300000) throw new CatalogError("stale");
  return catalog;
}
