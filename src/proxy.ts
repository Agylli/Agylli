import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseSettings } from "@/integrations/supabase/settings";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
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
