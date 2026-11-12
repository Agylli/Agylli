import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "/revendedor",
  "/revendedor/entrar",
  "/revendedor/cadastro",
  "/revendedor/recuperar-senha",
  "/revendedor/redefinir-senha",
  "/revendedor/reenviar-confirmacao",
  "/revendedor/solicitar",
  "/equipe",
];
for (const route of routes) {
  test(`${route}: portal responsivo, acessivel e seguro sem credenciais`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    expect(response?.headers()["cache-control"]).toContain("no-store");
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    if (route === "/revendedor/entrar" || route === "/revendedor/cadastro") {
      await expect(page.getByLabel("E-mail", { exact: true })).toBeDisabled();
      await expect(page.getByRole("status")).toContainText("em preparação");
    }
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `test-results/screenshots/portal-${route.replaceAll("/", "-")}-${testInfo.project.name}.png`,
      fullPage: true,
      animations: "disabled",
    });
  });
}
test("entrada do revendedor preserva contato e permite conhecer cadastro e recuperacao", async ({
  page,
}) => {
  await page.goto("/atacado");
  await page
    .getByRole("link", { name: "Já sou revendedor: acessar minha área" })
    .click();
  await expect(page).toHaveURL(/\/revendedor\/entrar$/);
  await page.getByRole("link", { name: "Ainda não tenho cadastro" }).click();
  await expect(page).toHaveURL(/\/revendedor\/cadastro$/);
  await expect(page.getByLabel("Nome completo")).toBeVisible();
  await page.getByRole("link", { name: /Já tenho cadastro/ }).click();
  await page.getByRole("link", { name: "Esqueci minha senha" }).click();
  await expect(page).toHaveURL(/\/revendedor\/recuperar-senha$/);
});
test("home, rodape e menu oferecem cadastro e entrada diretos", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Quero ser revendedor", exact: true }).click();
  await expect(page).toHaveURL(/\/revendedor\/cadastro$/);
  await page.getByRole("navigation", { name: "Canais de compra" }).getByRole("link", { name: "Cadastro de revendedor", exact: true }).click();
  await expect(page).toHaveURL(/\/revendedor\/cadastro$/);
  const menu = page.getByRole("button", { name: "Abrir menu" });
  const mobile = await menu.isVisible();
  if (mobile) await menu.click();
  const navigation = page.getByRole("navigation", { name: mobile ? "Navegação móvel" : "Navegação principal", exact: true });
  await navigation.getByRole("link", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/revendedor\/entrar$/);
  await page.getByRole("link", { name: "Ainda não tenho cadastro" }).click();
  await expect(page).toHaveURL(/\/revendedor\/cadastro$/);
});
test("retorno de autenticacao invalido nao redireciona para dominio externo", async ({
  request,
}) => {
  const result = await request.get(
    "/auth/callback?code=FICTICIO&next=https://example.invalid",
    { maxRedirects: 0 },
  );
  expect(result.status()).toBe(307);
  expect(result.headers().location).toContain(
    "/revendedor/entrar?notice=confirmation-error",
  );
  expect(result.headers().location).not.toContain("example.invalid");
  const material = await request.get(
    "/revendedor/materiais/11111111-1111-4111-8111-111111111111",
    { maxRedirects: 0 },
  );
  expect(material.status()).toBe(307);
  expect(material.headers().location).toContain("/revendedor/entrar");
});

test("aviso de link usado orienta login e permite reenviar sem repetir cadastro", async ({ page }) => {
  await page.goto("/revendedor/entrar?notice=confirmation-error");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Se já confirmou seu e-mail, entre com sua senha");
  await page.getByRole("link", { name: "Reenviar e-mail de confirmação" }).click();
  await expect(page).toHaveURL(/\/revendedor\/reenviar-confirmacao$/);
  await expect(page.getByLabel("E-mail", { exact: true })).toBeVisible();
  await expect(page.getByLabel("E-mail", { exact: true })).toBeDisabled();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reenviar confirmação", exact: true })).toBeDisabled();
});

test("SQL de preparacao nao e servido pela aplicacao", async ({ request }) => {
  const result = await request.get(
    "/supabase/migrations/202611110001_reseller_portal.sql",
  );
  expect(result.status()).toBe(404);
  expect(await result.text()).not.toContain(
    "create table public.reseller_profiles",
  );
});
