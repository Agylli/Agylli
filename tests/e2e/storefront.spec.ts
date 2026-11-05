import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["/", "/atacado", "/sobre", "/contato", "/onde-atuamos", "/loja-em-breve"];
for (const route of routes) {
  test(`${route}: responsivo, acessível e sem erros de renderização`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".lucide-asterisk, .lucide-sparkle, .lucide-sparkles")).toHaveCount(0);
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
  const access = page.getByRole("region", { name: "Vamos começar essa parceria?" });
  await expect(access).toHaveAttribute("id", "cadastro-atacado");
  await expect(access.getByRole("link", { name: "Solicitar acesso ao atacado", exact: true })).toHaveAttribute("href", "/contato?assunto=revenda");
  await expect(access).toContainText("Cadastro online em preparação");
  await page.getByRole("link", { name: "Solicitar acesso ao atacado", exact: true }).first().click();
  await expect(page).toHaveURL(/\/contato\?assunto=revenda$/);
  await expect(page.getByRole("status")).toContainText("fale com uma das unidades pelo WhatsApp ou telefone");
  await expect(page.locator("form")).toHaveCount(0);
});

test("contatos das unidades e área de atuação estão disponíveis", async ({ page }) => {
  await page.goto("/contato");
  const bahia = page.getByRole("article", { name: "Unidade de Cândido Sales" });
  await expect(bahia).toContainText("Rua Rio Pardo, 75 — Célio Alves");
  await expect(bahia.getByRole("link", { name: "Conversar no WhatsApp com a Unidade de Cândido Sales", exact: true })).toHaveAttribute("href", "https://wa.me/5577988549691");
  await expect(bahia.getByRole("link", { name: "Telefone da Unidade de Cândido Sales: (77) 3438-2030", exact: true })).toHaveAttribute("href", "tel:+557734382030");
  const minas = page.getByRole("article", { name: "Unidade de Ipatinga" });
  await expect(minas).toContainText("Campo Grande, 690 A — Caravelas");
  await expect(minas.getByRole("link", { name: "Conversar no WhatsApp com a Unidade de Ipatinga", exact: true })).toHaveAttribute("href", "https://wa.me/5531993902031");
  await expect(minas.getByRole("link", { name: "Central de atendimento da Unidade de Ipatinga: 0800 283 1787", exact: true })).toHaveAttribute("href", "tel:08002831787");
  await expect(minas.getByRole("link", { name: "Ver endereço da Unidade de Ipatinga no mapa" })).toHaveAttribute("href", /google\.com\/maps\/search\/\?api=1&query=Campo/);
  await page.getByRole("link", { name: "Conheça nossa área de atuação" }).click();
  await expect(page).toHaveURL(/\/onde-atuamos$/);
  await expect(page.locator("main")).toContainText("Região de Vitória da Conquista");
  await expect(page.locator("main")).toContainText("Região do Vale do Aço");
  await expect(page.getByRole("navigation", { name: "Navegação do rodapé" }).getByRole("link", { name: "Onde atuamos" })).toHaveAttribute("href", "/onde-atuamos");
});

test("categorias filtram os produtos e preservam navegação do navegador", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Perfumes Presença que fica." }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-card h3")).toHaveText("Deo Colônia Madelle");
  await page.getByRole("navigation", { name: "Filtrar produtos demonstrativos por categoria" }).getByRole("link", { name: "Pele", exact: true }).click();
  await expect(page.locator(".product-card h3")).toHaveText("Peeling de Cristal");
  await page.goBack();
  await expect(page.locator(".product-card h3")).toHaveText("Deo Colônia Madelle");
  await page.getByRole("link", { name: "Todos", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(4);
  await expect(page.locator(".demo-notice")).toContainText("seleção ilustrativa");
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

test("links internos e âncoras das seis páginas possuem destinos válidos", async ({ page, request, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const destinations = new Map<string, Set<string>>();
  for (const route of routes) {
    await page.goto(route);
    const hrefs = await page.locator("a[href]").evaluateAll(links => links.map(link => link.getAttribute("href")!));
    for (const href of hrefs) {
      const url = new URL(href, `${origin}${route}`);
      if (url.origin !== origin) continue;
      const path = `${url.pathname}${url.search}`;
      const fragments = destinations.get(path) ?? new Set<string>();
      if (url.hash) fragments.add(decodeURIComponent(url.hash.slice(1)));
      destinations.set(path, fragments);
    }
  }
  for (const [path, fragments] of destinations) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    if (fragments.size) {
      const ids = await page.evaluate(html => Array.from(new DOMParser().parseFromString(html, "text/html").querySelectorAll("[id]")).map(element => element.id), await response.text());
      for (const fragment of fragments) expect(ids, `${path}#${fragment}`).toContain(fragment);
    }
  }
});


test("arquivos administrativos e comerciais não são servidos pelo site", async ({ request }) => {
  for (const path of ["/tools/conciliacao/audit.py", "/tools/conciliacao/config.example.json", "/dados-comerciais/conciliacao/config.json"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
    const body = await response.text();
    expect(body).not.toContain("def export_final(");
    expect(body).not.toContain('"final_format":');
  }
});
