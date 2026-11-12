import { publicHttpsUrl } from "@/lib/urls";

/** Keep PKCE cookies and the email callback on the same trusted origin. */
export function canonicalPortalUrl(
  requestUrl: URL,
  siteUrl: string | undefined,
  production: boolean,
): URL | null {
  const configured = publicHttpsUrl(siteUrl);
  if (!production || !configured) return null;
  const destination = new URL(new URL(configured).origin);
  if (destination.origin === requestUrl.origin) return null;
  // Assign path/search separately so a path starting with // cannot change host.
  destination.pathname = requestUrl.pathname;
  destination.search = requestUrl.search;
  return destination;
}

export function confirmationFailureNotice(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error
    ? error.code
    : undefined;
  return code === "bad_code_verifier" || code === "pkce_code_verifier_not_found"
    ? "confirmation-session-error"
    : "confirmation-error";
}
