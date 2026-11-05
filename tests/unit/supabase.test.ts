import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseClient } from "@/integrations/supabase/client";

afterEach(() => vi.unstubAllEnvs());
describe("Supabase opcional", () => {
  it("funciona sem credenciais e não realiza conexão", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(getSupabaseClient()).toBeNull();
  });
  it("rejeita chaves não publicáveis e URLs inseguras", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_secret_not-for-the-browser");
    expect(getSupabaseClient()).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_demo");
    expect(getSupabaseClient()).toBeNull();
  });
});
