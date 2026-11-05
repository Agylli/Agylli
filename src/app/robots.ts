import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";
export default function robots(): MetadataRoute.Robots {
  return { rules: brand.links.site ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" }, sitemap: brand.links.site ? new URL("/sitemap.xml", brand.links.site).href : undefined };
}
