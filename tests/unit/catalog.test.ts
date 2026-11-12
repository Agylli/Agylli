import { describe, expect, it } from "vitest";
import { catalogImage, matchingCategories, normalizeCatalog } from "@/lib/catalog";

const base = "https://loja.example/";
const category = { id: 10, name: { pt: "Perfumes" }, handle: { pt: "perfumes" }, visibility: "visible" };
const product = (changes = {}) => ({ id: 1, name: { pt: "Produto FICTÍCIO" }, handle: { pt: "produto-ficticio" }, published: true, visibility: "visible", brand: "Marca FICTÍCIA", categories: [10], images: [{ src: "https://acdn-us.mitiendanube.com/stores/001/products/ficticio.webp" }], variants: [{ price: "40.00", promotional_price: null, stock_management: true, stock: 3, cost: "CUSTO-PRIVADO", sku: "SKU-PRIVADO" }], ...changes });

describe("Projeção pública do catálogo Nuvemshop", () => {
  it("publica somente campos permitidos, sem custo, SKU, estoque numérico ou descrições HTML", () => {
    const result = normalizeCatalog([product({ description: "<script>PRIVADO</script>", private_field: "SEGREDO" })], [category], base);
    expect(result.products[0]).toMatchObject({ name: "Produto FICTÍCIO", price: 40, available: true, url: "https://loja.example/produtos/produto-ficticio/", categoryIds: ["10"] });
    expect(Object.keys(result.products[0]).sort()).toEqual(["id", "name", "brand", "image", "url", "categoryIds", "price", "compareAt", "fromPrice", "available"].sort());
    expect(JSON.stringify(result)).not.toMatch(/CUSTO|SKU-PRIVADO|SEGREDO|script|stock|variants/);
  });
  it("exclui ocultos, não listados, sem nome, sem handle e duplicados", () => {
    const result = normalizeCatalog([product(), product(), product({ id: 2, visibility: "hidden" }), product({ id: 3, visibility: "unlisted" }), product({ id: 4, visibility: undefined, published: false }), product({ id: 5, name: {} }), product({ id: 6, handle: "../privado" })], [], base);
    expect(result.products).toHaveLength(1);
  });
  it("aceita a publicação legada sem visibility e não inventa marca ou preço ausentes", () => {
    const result = normalizeCatalog([product({ visibility: undefined, brand: null, variants: [{ price: null, stock_management: true, stock: null }] })], [], base);
    expect(result.products[0]).toMatchObject({ brand: "", price: null, available: null });
  });
  it("seleciona o preço das variações disponíveis, sem anunciar o preço de uma variação esgotada", () => {
    const result = normalizeCatalog([product({ variants: [
      { price: "1.00", stock_management: true, stock: 0 },
      { price: "50.00", promotional_price: "40.00", stock_management: true, stock: 2 },
    ] })], [], base);
    expect(result.products[0]).toMatchObject({ price: 40, compareAt: 50, fromPrice: false, available: true });
  });
  it("usa a partir de quando as opções têm preços diferentes e não aplica desconto global falso", () => {
    const result = normalizeCatalog([product({ variants: [{ price: "50.00", promotional_price: "40.00", stock_management: false }, { price: "60.00", stock_management: false }] })], [], base);
    expect(result.products[0]).toMatchObject({ price: 40, compareAt: null, fromPrice: true, available: true });
  });
  it.each([null, "", "NaN", "12,50", "-1", Number.POSITIVE_INFINITY])("não converte preço inválido em oferta: %s", value => {
    const result = normalizeCatalog([product({ variants: [{ price: value, promotional_price: "2", stock_management: false }] })], [], base);
    expect(result.products[0].price).toBeNull();
  });
  it("preserva zero real e sinaliza produto esgotado sem alterar seu saldo", () => {
    const result = normalizeCatalog([product({ variants: [{ price: "0.00", stock_management: true, stock: 0 }] })], [], base);
    expect(result.products[0]).toMatchObject({ price: 0, available: false });
  });
  it("inclui ancestrais visíveis nas categorias e exclui categorias ocultas", () => {
    const parent = { ...category, id: 20, name: "Cuidados", handle: "cuidados" };
    const child = { ...category, parent: 20 };
    const result = normalizeCatalog([product({ categories: [10, 30] })], [parent, child, { id: 30, name: "Privada", visibility: "hidden" }], base);
    expect(result.products[0].categoryIds).toEqual(["10", "20"]);
    expect(result.categories.map(c => c.name)).not.toContain("Privada");
    expect(matchingCategories("perfumes", result.categories)).toEqual(["10"]);
  });
  it("reconhece aliases apenas pelos nomes das categorias reais", () => {
    expect(matchingCategories("pele", [{ id: "1", name: "Cuidados com a pele", slug: "cuidados-com-a-pele" }])).toEqual(["1"]);
    expect(matchingCategories("pele", [{ id: "1", name: "Cabelos", slug: "cabelos" }])).toEqual([]);
  });
  it.each(["http://acdn-us.mitiendanube.com/a.png", "https://acdn-us.mitiendanube.com.evil.example/a.png", "https://user:password@acdn-us.mitiendanube.com/a.png", "https://127.0.0.1/a.png", "javascript:alert(1)"])("recusa imagem insegura: %s", value => {
    expect(catalogImage(value)).toBeNull();
  });
});
