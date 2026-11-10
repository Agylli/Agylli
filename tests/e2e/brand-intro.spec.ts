import { expect, test } from "@playwright/test";

test("faixa permite pausar e retomar sem perder conteúdo", async ({ page }) => {
  await page.goto("/");
  const ribbon = page.getByRole("region", { name: "Para sua rotina e para o seu negócio" });
  const track = ribbon.locator("[data-paused]");
  await expect(ribbon.getByText("Seu cuidado, do seu jeito", { exact: true })).toHaveCount(2);
  await expect(track).toHaveCSS("animation-play-state", "running");
  await ribbon.getByRole("button", { name: "Pausar movimento da faixa" }).click();
  await expect(track).toHaveCSS("animation-play-state", "paused");
  await expect(ribbon.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  await ribbon.getByRole("button", { name: "Retomar movimento da faixa" }).click();
  await page.getByRole("region", { name: /Acreditamos na beleza/ }).getByRole("link").focus();
  await expect(track).toHaveCSS("animation-play-state", "running");
  await page.getByRole("link", { name: "Conheça nossa história" }).click();
  await expect(page).toHaveURL(/\/sobre$/);
});

test("movimento reduzido mantém todas as mensagens estáticas e legíveis", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const ribbon = page.getByRole("region", { name: "Para sua rotina e para o seu negócio" });
  await expect(ribbon.locator("[data-paused]")).toHaveCSS("animation-name", "none");
  await expect(ribbon.getByRole("button")).toBeHidden();
  for (const text of ["Seu cuidado, do seu jeito", "Marca própria & outras marcas", "Para você & para revender", "Beleza em cada possibilidade"]) {
    await expect(ribbon.getByText(text, { exact: true }).first()).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
