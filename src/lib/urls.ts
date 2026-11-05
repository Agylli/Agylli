/** Public URLs are HTTPS-only: reject credentials, relative paths and unsafe schemes. */
export function publicHttpsUrl(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function retailUrl(value?: string): string {
  return publicHttpsUrl(value) ?? "/loja-em-breve";
}

export function wholesaleUrl(value?: string): string {
  return publicHttpsUrl(value) ?? "/contato?assunto=revenda";
}

export function whatsappUrl(value?: string): string | null {
  const digits = value?.trim();
  return digits && /^[1-9]\d{9,14}$/.test(digits) ? `https://wa.me/${digits}` : null;
}

export function emailAddress(value?: string): string | null {
  const email = value?.trim();
  return email && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? email : null;
}
