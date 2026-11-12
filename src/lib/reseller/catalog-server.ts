import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { catalogBucket, type CatalogProduct } from "./catalog";

export async function catalogImages(db: SupabaseClient, products: CatalogProduct[]) {
  const paths = products.flatMap(product => product.image_path ? [product.image_path] : []);
  if (!paths.length) return products;
  try {
    const { data } = await db.storage.from(catalogBucket).createSignedUrls(paths, 3600);
    const urls = new Map((data ?? []).map(item => [item.path, item.signedUrl]));
    return products.map(product => ({ ...product, imageUrl: product.image_path ? urls.get(product.image_path) ?? null : null }));
  } catch { return products; }
}
