"use client";
import { useEffect, useState } from "react";
import type { CatalogProduct } from "@/lib/reseller/catalog";
import { CatalogPicker } from "./catalog-picker";

export function NuvemshopCatalog({ token, unit, readOnly }: { token: string; unit: string; readOnly: boolean }) {
  const [catalog, setCatalog] = useState<{ products: CatalogProduct[]; truncated: boolean } | null>(null);
  const [failed, setFailed] = useState(false), [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 28000);
    let stopped = false;
    async function load() {
      try {
        const response = await fetch("/revendedor/produtos/catalogo", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("unavailable");
        const data = await response.json();
        if (data.status !== "ready" || !Array.isArray(data.products)) throw new Error("unavailable");
        if (!stopped) setCatalog({ products: data.products, truncated: data.truncated === true });
      } catch { if (!stopped) setFailed(true); }
      finally { window.clearTimeout(timeout); }
    }
    void load();
    return () => { stopped = true; window.clearTimeout(timeout); controller.abort(); };
  }, [attempt]);
  if (failed) return <div className="portal-message" role="status"><p>Não foi possível carregar os produtos agora. Sua solicitação também pode ser feita pelo nome ou código no link abaixo.</p><button type="button" className="button button-secondary" onClick={() => { setFailed(false); setAttempt(current => current + 1); }}>Tentar novamente</button></div>;
  if (!catalog) return <p className="portal-message" role="status">Carregando os produtos para revenda…</p>;
  if (!catalog.products.length) return <p className="portal-message" role="status">Ainda não há produtos publicados na loja para exibir aqui. Você pode solicitar pelo nome ou código.</p>;
  return <>{catalog.truncated && <p className="portal-message">Exibimos parte do catálogo. Se não encontrar um produto, informe pelo nome ou código no link abaixo.</p>}<CatalogPicker products={catalog.products} token={token} unit={unit} readOnly={readOnly} source="nuvemshop" /></>;
}
