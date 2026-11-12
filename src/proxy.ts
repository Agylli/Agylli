import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { canonicalPortalUrl } from "@/lib/reseller/auth-return";

export async function proxy(request: NextRequest) {
  const canonical = canonicalPortalUrl(
    request.nextUrl,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NODE_ENV === "production",
  );
  if (canonical) {
    const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
    if (request.method !== "GET" && request.method !== "HEAD") {
      return NextResponse.json(
        { error: "Abra a área de acesso pelo endereço oficial do site e tente novamente." },
        { status: 400, headers },
      );
    }
    return NextResponse.redirect(canonical, { headers });
  }
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  const settings = supabaseSettings();
  if (!settings) return response;
  const supabase = createServerClient(settings.url, settings.key, {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values, headers) {
        for (const { name, value } of values) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of values)
          response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers ?? {}))
          response.headers.set(key, value);
        response.headers.set("Cache-Control", "private, no-store");
        response.headers.set("Referrer-Policy", "no-referrer");
      },
    },
  });
  try {
    await supabase.auth.getUser();
  } catch {
    /* Protected pages perform authoritative authorization. */
  }
  return response;
}
export const config = {
  matcher: ["/revendedor/:path*", "/equipe/:path*", "/auth/:path*"],
};
