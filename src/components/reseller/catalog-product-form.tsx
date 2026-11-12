import { ActionForm } from "./action-form";
import { saveCatalogProduct } from "@/app/equipe/produtos/actions";
import type { CatalogProduct } from "@/lib/reseller/catalog";
import { resellerPortal } from "@/config/reseller";
export function CatalogProductForm({ product }: { product?: CatalogProduct }) {
  return <section className="portal-detail-card" aria-labelledby="catalog-product-form-heading">
    <h2 id="catalog-product-form-heading">{product ? "Editar produto" : "Adicionar produto ao catálogo"}</h2>
    <p className="portal-hint">Use dados reais e fotografias autorizadas. O catálogo apresenta os produtos; desconto, valores e disponibilidade são conferidos pela loja.</p>
    <ActionForm action={saveCatalogProduct} label={product ? "Salvar alterações do produto" : "Salvar produto"} key={product?.id ?? "new"} maxFileBytes={resellerPortal.materialLimitBytes}>
      <input name="id" type="hidden" value={product?.id ?? ""} />
      <label htmlFor="catalog-product-name">Nome do produto<input id="catalog-product-name" name="name" required minLength={2} maxLength={160} defaultValue={product?.name} /></label>
      <div className="portal-two-fields portal-product-fields">
        <label htmlFor="catalog-product-sku">Código real / SKU (se houver)<input id="catalog-product-sku" name="sku" maxLength={80} defaultValue={product?.sku ?? ""} /></label>
        <label htmlFor="catalog-product-brand">Marca<input id="catalog-product-brand" name="brand" maxLength={80} defaultValue={product?.brand} /></label>
      </div>
      <label htmlFor="catalog-product-category">Categoria<input id="catalog-product-category" name="category" maxLength={80} defaultValue={product?.category} /></label>
      <label htmlFor="catalog-product-description">Descrição<textarea id="catalog-product-description" name="description" rows={3} maxLength={1000} defaultValue={product?.description} /></label>
      <label htmlFor="catalog-product-photo">{product?.image_path ? "Substituir fotografia (opcional)" : "Fotografia (opcional)"}<input id="catalog-product-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" /><span className="portal-hint">JPG, PNG ou WebP, até 3 MB. Sem uma foto, mostramos um espaço reservado.</span></label>
      <label className="portal-checkbox"><input name="active" type="checkbox" defaultChecked={product?.active ?? true} /><span>Publicar para revendedores aprovados</span></label>
      <label className="portal-checkbox"><input name="authorized" type="checkbox" required /><span>Conferi os dados do produto e tenho autorização para usar a fotografia.</span></label>
    </ActionForm>
  </section>;
}
