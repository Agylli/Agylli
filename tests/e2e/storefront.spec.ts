import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["/", "/atacado", "/sobre", "/contato", "/loja-em-breve"];
for (const route of routes) {
  test(`${route}: responsivo, acessível e sem erros de renderização`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page).toHaveTitle(/Agylli/);
    await page.evaluate(() => document.fonts.ready);
    // Scroll through the page so lazy images also load before the screenshot/check.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo({ top: y, behavior: "instant" }); await new Promise(resolve => setTimeout(resolve, 60)); }
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await expect(async () => {
      expect(await page.locator("img").evaluateAll(images => images.every(img => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0))).toBe(true);
    }).toPass({ timeout: 8000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(accessibility.violations).toEqual([]);
    expect(errors).toEqual([]);
    await page.screenshot({ path: `test-results/screenshots/${route === "/" ? "home" : route.slice(1)}-${testInfo.project.name}.png`, fullPage: true, animations: "disabled" });
  });
}

test("varejo e atacado possuem destinos funcionais sem configuração", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Comprar no varejo", exact: true }).click();
  await expect(page).toHaveURL(/\/loja-em-breve$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Coisas bonitas");
  await page.goto("/");
  await page.getByRole("link", { name: "Comprar no atacado", exact: true }).click();
  await expect(page).toHaveURL(/\/atacado$/);
  await page.getByRole("link", { name: "Solicitar acesso ao atacado", exact: true }).first().click();
  await expect(page).toHaveURL(/\/contato\?assunto=revenda$/);
  await expect(page.getByRole("status")).toContainText("Ainda não estamos recebendo solicitações");
  await expect(page.locator("form")).toHaveCount(0);
});

test("categorias filtram os produtos e preservam navegação do navegador", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Perfumes Presença que fica." }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-card h3")).toHaveText("Essência Aurora");
  await page.getByRole("navigation", { name: "Filtrar produtos demonstrativos por categoria" }).getByRole("link", { name: "Pele", exact: true }).click();
  await expect(page.locator(".product-card h3")).toHaveText("Sérum Essencial");
  await page.goBack();
  await expect(page.locator(".product-card h3")).toHaveText("Essência Aurora");
  await page.getByRole("link", { name: "Todos", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(4);
  await expect(page.locator(".demo-notice")).toContainText("fictícios");
});

test("menu, teclado, FAQ e página inexistente", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  const menu = page.getByRole("button", { name: "Abrir menu" });
  if (await menu.isVisible()) {
    await menu.click();
    await expect(page.getByRole("navigation", { name: "Navegação móvel" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await menu.click();
    await page.getByRole("navigation", { name: "Navegação móvel" }).getByRole("link", { name: "Seja Revendedor" }).click();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
  } else {
    await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Seja Revendedor" }).click();
  }
  await expect(page).toHaveURL(/\/atacado$/);
  await page.getByText("Existe pedido mínimo ou desconto definido?").click();
  await expect(page.locator("details[open]")).toContainText("descontos a partir de 30%");
  await expect(page.locator("details[open]")).toContainText("não representa lucro garantido");
  const response = await page.goto("/pagina-inexistente");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("novo caminho");
});
