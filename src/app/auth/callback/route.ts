import { NextResponse, type NextRequest } from "next/server";
import { serverSupabase } from "@/integrations/supabase/server";
import { safePortalNext } from "@/lib/reseller/validation";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code"),
    db = await serverSupabase();
  if (code && db) {
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(
          safePortalNext(request.nextUrl.searchParams.get("next")),
          request.url,
        ),
      );
  }
  return NextResponse.redirect(
    new URL("/revendedor/entrar?notice=confirmation-error", request.url),
  );
}
