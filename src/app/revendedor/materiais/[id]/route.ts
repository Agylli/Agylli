import { NextResponse } from "next/server";
import { requirePortal } from "@/lib/reseller/session";
import { UUID_PATTERN } from "@/lib/reseller/validation";
import { resellerPortal } from "@/config/reseller";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requirePortal(),
    { id } = await params;
  if (
    !UUID_PATTERN.test(id) ||
    (session.profile?.status !== "approved" && !session.staff)
  )
    return new NextResponse("Material indisponível", {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  const resource = await session.db
    .from("reseller_resources")
    .select("file_path,active")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();
  if (!resource.data?.file_path)
    return new NextResponse("Material indisponível", { status: 404 });
  const signed = await session.db.storage
    .from(resellerPortal.bucket)
    .createSignedUrl(resource.data.file_path, 60, { download: true });
  if (!signed.data?.signedUrl)
    return new NextResponse(
      "Não foi possível abrir o material. Tente novamente.",
      { status: 503 },
    );
  return NextResponse.redirect(signed.data.signedUrl, {
    headers: {
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
