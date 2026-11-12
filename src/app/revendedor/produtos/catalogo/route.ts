import { portalSession } from "@/lib/reseller/session";
import { getPublicCatalog } from "@/integrations/nuvemshop/catalog";
import { resellerNuvemshopProducts } from "@/lib/reseller/nuvemshop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  const session = await portalSession();
  if (!session) return Response.json({ status: "unauthorized" }, { status: 401, headers });
  if (session.profile?.status !== "approved" && !session.staff)
    return Response.json({ status: "forbidden" }, { status: 403, headers });
  try {
    const catalog = await getPublicCatalog();
    if (!catalog) return Response.json({ status: "unavailable" }, { status: 503, headers });
    return Response.json({ status: "ready", products: resellerNuvemshopProducts(catalog), truncated: catalog.truncated }, { headers });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503, headers });
  }
}
