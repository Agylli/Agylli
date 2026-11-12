import { NextResponse, type NextRequest } from "next/server";
import { serverSupabase } from "@/integrations/supabase/server";
import { safePortalNext } from "@/lib/reseller/validation";
import { confirmationFailureNotice } from "@/lib/reseller/auth-return";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
  let notice = "confirmation-error";
  try {
    const db = code ? await serverSupabase() : null;
    if (code && db) {
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(
          new URL(safePortalNext(request.nextUrl.searchParams.get("next")), request.url),
          { headers },
        );
      notice = confirmationFailureNotice(error);
    }
  } catch {
    // Never expose authentication codes, provider messages or session cookies.
  }
  return NextResponse.redirect(
    new URL(`/revendedor/entrar?notice=${notice}`, request.url),
    { headers },
  );
}
