import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!brand.links.site) return [];
  return ["/", "/atacado", "/sobre", "/onde-atuamos", "/contato"].map(path => ({ url: new URL(path, brand.links.site!).href, changeFrequency: "monthly", priority: path === "/" ? 1 : 0.7 }));
}
