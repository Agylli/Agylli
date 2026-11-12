import { CatalogError, getPublicCatalog } from "@/integrations/nuvemshop/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const catalog = await getPublicCatalog();
    return Response.json(catalog ?? { status: "not_configured" }, { headers });
  } catch (error) {
    // Do not log raw errors, request headers, upstream response bodies or secrets.
    const code = error instanceof CatalogError ? error.code : "unavailable";
    console.warn("[catalogo]", code);
    return Response.json({ status: "unavailable", code }, { status: 503, headers });
  }
}
