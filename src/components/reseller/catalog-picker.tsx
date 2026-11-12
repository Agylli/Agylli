"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Package, Plus, Trash2, ShoppingBag } from "lucide-react";
import { ActionForm } from "./action-form";
import { submitCatalogRequest } from "@/app/revendedor/produtos/actions";
import { addCatalogProduct, filterCatalog, type CatalogProduct, type CatalogSelection } from "@/lib/reseller/catalog";
import { resellerPortal } from "@/config/reseller";

export function CatalogPicker({ products, token, unit, readOnly = false, source = "manual" }: { products: CatalogProduct[]; token: string; unit: string; readOnly?: boolean; source?: "manual" | "nuvemshop" }) {
  const [search, setSearch] = useState(""), [category, setCategory] = useState("");
  const [selection, setSelection] = useState<CatalogSelection>([]), [shown, setShown] = useState(20);
  const filtered = useMemo(() => filterCatalog(products, search, category), [products, search, category]);
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort((a,b) => a.localeCompare(b,"pt-BR"));
  const selected = selection.flatMap(item => {
    const product = products.find(product => product.id === item.id);
    return product ? [{ ...item, product }] : [];
  });
  const units = selection.reduce((sum, item) => sum + item.quantity, 0);
  return <div className={`portal-catalog-layout${readOnly ? " portal-catalog-preview" : ""}`}>
    <section aria-labelledby="catalog-products-heading">
      <h2 id="catalog-products-heading" className="portal-sr-only">Produtos para revenda</h2>
      <div className="portal-catalog-filters">
        <label htmlFor="catalog-search">Buscar produto, código ou marca
          <input id="catalog-search" type="search" value={search} onChange={event => { setSearch(event.target.value);setShown(20); }} placeholder="O que você procura?" />
        </label>
        <label htmlFor="catalog-category">Categoria
          <select id="catalog-category" value={category} onChange={event => { setCategory(event.target.value);setShown(20); }}>
            <option value="">Todas as categorias</option>
            {categories.map(category => <option key={category}>{category}</option>)}
          </select>
        </label>
      </div>
      <p className="portal-hint" role="status">{filtered.length} {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"} · {selection.length} no pedido</p>
      <div className="portal-product-grid">
        {filtered.slice(0, shown).map(product => {
          const quantity = selection.find(item => item.id === product.id)?.quantity ?? 0;
          return <article key={product.id} className="portal-product-card">
            <div className="portal-product-image">
              {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 767px) 85vw, 320px" unoptimized /> : <div className="portal-product-placeholder"><Package size={42} aria-hidden="true" /><span>Fotografia em preparação</span></div>}
            </div>
            <div className="portal-product-copy">
              {product.brand && <p className="eyebrow">{product.brand}</p>}
              <h3>{product.name}</h3>
              {product.sku && <p className="portal-hint">Código: {product.sku}</p>}
              {product.description && <p className="portal-product-description">{product.description}</p>}
              <p className="portal-hint">Desconto e valor final confirmados pela equipe.</p>
              <button className="button button-secondary" type="button" aria-label={`Adicionar ${product.name} ao pedido`}
                disabled={readOnly || quantity >= 99 || (!quantity && selection.length >= resellerPortal.requestLimit)}
                onClick={() => setSelection(current => addCatalogProduct(current, product.id))}>
                <Plus size={17} aria-hidden="true" />{quantity ? `Adicionar mais · ${quantity} no carrinho` : "Adicionar ao carrinho"}
              </button>
            </div>
          </article>;
        })}
      </div>
      {!filtered.length && <p className="portal-message">Nenhum produto encontrado. Experimente outro nome ou categoria.</p>}
      {shown < filtered.length && <button className="button button-secondary portal-show-more" type="button" onClick={() => setShown(current => current + 20)}>Ver mais produtos</button>}
    </section>
    {!readOnly && <aside id="revisar-pedido" className="portal-cart" aria-labelledby="catalog-cart-heading">
      <div className="portal-cart-heading"><ShoppingBag aria-hidden="true" /><h2 id="catalog-cart-heading">Meu carrinho de solicitação</h2></div>
      <p className="portal-hint">{selection.length} de {resellerPortal.requestLimit} produtos · {units} {units === 1 ? "unidade" : "unidades"}</p>
      {!selected.length ? <p className="portal-cart-empty">Escolha os produtos ao lado para começar.</p> : <>
        <ActionForm action={submitCatalogRequest} label="Continuar para o WhatsApp" enabled={selected.length > 0}>
          <input type="hidden" name="source" value={source} />
          <input type="hidden" name="token" value={token} /><input type="hidden" name="unit" value={unit} />
          <div className="portal-cart-items">
            {selected.map(item => <div className="portal-cart-item" key={item.id}>
              <strong>{item.product.name}</strong>
              {item.product.sku && <span className="portal-hint">Código: {item.product.sku}</span>}
              <input name="catalog_id" type="hidden" value={item.id} />
              <div className="portal-cart-quantity">
                <label htmlFor={`cart-quantity-${item.id}`}>Quantidade
                  <input id={`cart-quantity-${item.id}`} name="quantity" type="number" min={1} max={99} step={1} required value={item.quantity}
                    onChange={event => { const value=event.target.valueAsNumber;if(Number.isInteger(value)&&value>=1&&value<=99)setSelection(current => current.map(row => row.id === item.id ? {...row,quantity:value} : row)); }} />
                </label>
                <button type="button" className="portal-remove" aria-label={`Remover ${item.product.name} do pedido`} onClick={() => setSelection(current => current.filter(row => row.id !== item.id))}><Trash2 size={17} aria-hidden="true" />Remover</button>
              </div>
            </div>)}
          </div>
          <label htmlFor="catalog-notes">Observações para a loja<textarea id="catalog-notes" name="notes" rows={3} maxLength={1000} placeholder="Informe cores, tamanhos, fragrâncias ou outras opções desejadas." /></label>
          <label className="portal-checkbox"><input name="acknowledgment" type="checkbox" required /><span>A loja confirmará disponibilidade, desconto, valor final e entrega antes da compra.</span></label>
          <p className="portal-hint">Primeiro registramos seu pedido no portal. Na próxima tela, você poderá enviá-lo pelo WhatsApp.</p>
        </ActionForm>
      </>}
    </aside>}
    {selected.length > 0 && <a href="#revisar-pedido" className="button button-primary portal-cart-mobile"><ShoppingBag size={18} aria-hidden="true" />Revisar pedido · {units} {units === 1 ? "unidade" : "unidades"}</a>}
  </div>;
}
