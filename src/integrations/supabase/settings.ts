import { publicHttpsUrl } from "@/lib/urls";

export function supabaseSettings() {
  const url = publicHttpsUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key?.startsWith("sb_publishable_") ? { url, key } : null;
}
