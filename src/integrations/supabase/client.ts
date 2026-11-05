import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicHttpsUrl } from "@/lib/urls";

let client: SupabaseClient | null = null;

/** Optional, lazy browser client. No network connection occurs during rendering. */
export function getSupabaseClient(): SupabaseClient | null {
  const url = publicHttpsUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  if (!key.startsWith("sb_publishable_")) return null;
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  return client;
}
