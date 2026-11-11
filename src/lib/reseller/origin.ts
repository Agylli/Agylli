import "server-only";
import { publicHttpsUrl } from "@/lib/urls";
export function portalOrigin(): string | null {
  const value = publicHttpsUrl(process.env.NEXT_PUBLIC_SITE_URL);
  return value ? new URL(value).origin : null;
}
