import { expect, test } from "@playwright/test";

const snapshot = {
  status: "ready", updatedAt: "2026-11-12T12:00:00Z", truncated: false,
  categories: [{ id: "10", name: "Perfumes", slug: "perfumes" }, { id: "11", name: "Cabelos", slug: "cabelos" }],
  products: [
    { id: "1", name: "Perfume FICTÍCIO", brand: "Marca FICTÍCIA", image: "/images/products/colonia-madelle.webp", url: "https://loja.example/produtos/perfume-ficticio/", categoryIds: ["10"], price: 39.9, compareAt: 49.9, fromPrice: false, available: true },
    { id: "2", name: "Shampoo FICTÍCIO", brand: "", image: null, url: "https://loja.example/produtos/shampoo-ficticio/", categoryIds: ["11"], price: null, compareAt: null, fromPrice: false, available: false },
  ],
};

test("vitrine real substitui demonstração, filtra e abre o produto correspondente", async ({ page }) => {
  await page.route("**/api/catalogo", route => route.fulfill({ json: snapshot }));
  await page.goto("/");
  const showcase = page.locator("#produtos");
  await expect(showcase.locator(".product-card")).toHaveCount(2);
  await expect(showcase).not.toContainText("SELEÇÃO ILUSTRATIVA");
  await expect(showcase).toContainText("39,90"); await expect(showcase.locator("del")).toContainText("49,90");
  await expect(showcase.getByRole("link", { name: "Ver Perfume FICTÍCIO na loja", exact: true })).toHaveAttribute("href", snapshot.products[0].url);
  await showcase.getByRole("link", { name: "Perfumes", exact: true }).click();
  await expect(showcase.locator(".product-card")).toHaveCount(1);
  await expect(showcase.locator("h3")).toHaveText("Perfume FICTÍCIO");
  await showcase.getByRole("link", { name: "Cabelos", exact: true }).click();
  await expect(showcase).toContainText("Indisponível no momento");
  await expect(showcase).toContainText("Consulte preço na loja");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("catálogo vazio não vira oferta ilustrativa", async ({ page }) => {
  await page.route("**/api/catalogo", route => route.fulfill({ json: { ...snapshot, products: [], categories: [] } }));
  await page.goto("/");
  await expect(page.locator("#produtos")).toContainText("Ainda não há produtos publicados");
  await expect(page.locator("#produtos .product-card")).toHaveCount(0);
});

test("falha depois de carregar retira os preços antigos e preserva acesso à loja", async ({ page }) => {
  let fail = false;
  await page.route("**/api/catalogo", route => fail ? route.fulfill({ status: 503, json: { status: "unavailable" } }) : route.fulfill({ json: snapshot }));
  await page.goto("/");
  await expect(page.locator("#produtos .product-card")).toHaveCount(2);
  fail = true;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.locator("#produtos")).toContainText("Não foi possível carregar");
  await expect(page.locator("#produtos .product-card")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Ver produtos na loja", exact: true })).toHaveAttribute("href", "/loja-em-breve");
});
