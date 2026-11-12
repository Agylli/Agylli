import { NextResponse, type NextRequest } from "next/server";
import { serverSupabase } from "@/integrations/supabase/server";
import { safePortalNext } from "@/lib/reseller/validation";
import { destinationAfterAuthentication } from "@/lib/reseller/destination";
export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get("token_hash"),
    type = request.nextUrl.searchParams.get("type");
  const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
  // Some existing email templates send a PKCE code to this path instead.
  const code = request.nextUrl.searchParams.get("code");
  if (!hash && !type && code) {
    const callback = new URL("/auth/callback", request.url);
    callback.searchParams.set("code", code);
    callback.searchParams.set("next", safePortalNext(request.nextUrl.searchParams.get("next")));
    return NextResponse.redirect(callback, { headers });
  }
  try {
    if (hash && (type === "signup" || type === "recovery" || type === "email")) {
      const db = await serverSupabase();
      if (db) {
        const { error } = await db.auth.verifyOtp({ token_hash: hash, type });
        if (!error)
          return NextResponse.redirect(
            new URL(
              type === "recovery"
                ? "/revendedor/redefinir-senha"
                : await destinationAfterAuthentication(db, request.nextUrl.searchParams.get("next")),
              request.url,
            ),
            { headers },
          );
      }
    }
  } catch {
    // Expired links and provider outages do not create or bypass a session.
  }
  return NextResponse.redirect(
    new URL("/revendedor/entrar?notice=confirmation-error", request.url),
    { headers },
  );
}
