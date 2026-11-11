import { readFile } from "node:fs/promises";
import ignore from "ignore";
import { describe, expect, it } from "vitest";

async function deploymentFilter() {
  return ignore().add(await readFile(new URL("../../.vercelignore", import.meta.url), "utf8"));
}

describe("Arquivos de entrada do deployment", () => {
  it("preserva os adaptadores Supabase usados em runtime e exclui somente a pasta de migracoes da raiz", async () => {
    const filter = await deploymentFilter();
    for (const path of ["src/integrations/supabase/server.ts", "src/integrations/supabase/settings.ts", "src/integrations/supabase/client.ts"]) {
      expect(filter.ignores(path), path).toBe(false);
    }
    expect(filter.ignores("supabase/migrations/202611110001_reseller_portal.sql")).toBe(true);
  });

  it("mantem dados privados, segredos e o utilitario fora do pacote", async () => {
    const filter = await deploymentFilter();
    for (const path of ["dados-comerciais/FICTICIO.csv", ".env.local", "tools/conciliacao/audit.py", "docs/portal-revendedor.md"]) {
      expect(filter.ignores(path), path).toBe(true);
    }
    expect(filter.ignores(".env.example")).toBe(false);
  });
});
