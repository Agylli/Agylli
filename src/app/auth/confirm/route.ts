import { NextResponse, type NextRequest } from "next/server";
import { serverSupabase } from "@/integrations/supabase/server";
import { safePortalNext } from "@/lib/reseller/validation";
export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get("token_hash"),
    type = request.nextUrl.searchParams.get("type");
  const db = await serverSupabase();
  if (
    hash &&
    db &&
    (type === "signup" || type === "recovery" || type === "email")
  ) {
    const { error } = await db.auth.verifyOtp({ token_hash: hash, type });
    if (!error)
      return NextResponse.redirect(
        new URL(
          type === "recovery"
            ? "/revendedor/redefinir-senha"
            : safePortalNext(request.nextUrl.searchParams.get("next")),
          request.url,
        ),
      );
  }
  return NextResponse.redirect(
    new URL("/revendedor/entrar?notice=confirmation-error", request.url),
  );
}
