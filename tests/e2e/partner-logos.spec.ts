import { expect, test } from "@playwright/test";

test("logos permitem pausar e retomar a alternância", async ({ page }) => {
  await page.goto("/");
  const brands = page.locator("section[aria-labelledby='brands-heading']");
  const layer = brands.locator("[aria-hidden='true'] img").first().locator("..");
  await expect(layer).toHaveCSS("animation-play-state", "running");
  await brands.getByRole("button", { name: "Pausar alternância das marcas" }).click();
  await expect(layer).toHaveCSS("animation-play-state", "paused");
  await brands.getByRole("button", { name: "Retomar alternância das marcas" }).click();
  await expect(layer).toHaveCSS("animation-play-state", "running");
});

test("logos ficam estáticas e todas visíveis com movimento reduzido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const list = page.getByRole("list", { name: "Marcas parceiras" });
  await expect(list.getByRole("listitem")).toHaveCount(5);
  for (const name of ["Facinatus Cosméticos", "Suave Fragrance", "D’Bianco Professional", "Natubelly", "Sofisticatto Cosméticos"]) {
    await expect(list.getByRole("img", { name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Pausar alternância das marcas" })).toBeHidden();
});
