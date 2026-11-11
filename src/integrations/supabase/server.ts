import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseSettings } from "./settings";

export async function serverSupabase() {
  const settings = supabaseSettings();
  if (!settings) return null;
  const store = await cookies();
  return createServerClient(settings.url, settings.key, {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        // Server Components cannot write cookies; Proxy refreshes them before rendering.
        try {
          for (const { name, value, options } of values)
            store.set(name, value, options);
        } catch {
          /* Cookie writes are completed in Proxy or a Server Action. */
        }
      },
    },
  });
}

/** Server-only notification worker. Never imported by a Client Component. */
export function notificationSupabase() {
  const settings = supabaseSettings(),
    key = process.env.SUPABASE_SECRET_KEY;
  if (!settings || !key?.startsWith("sb_secret_")) return null;
  return createClient(settings.url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
