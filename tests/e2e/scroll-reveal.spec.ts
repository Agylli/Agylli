import { expect, test } from "@playwright/test";

test("entradas incluem os três sentidos e revelam conteúdo ao chegar", async ({ page }) => {
  await page.goto("/");
  const pending = page.locator("main > section[data-reveal-pending='true']");
  await expect(pending.first()).toBeAttached();
  const directions = await page.locator("main > section[data-reveal-direction]").evaluateAll(elements => elements.map(element => element.getAttribute("data-reveal-direction")));
  expect(directions).toEqual(expect.arrayContaining(["up", "left", "right"]));
  const experience = page.getByRole("region", { name: "Uma experiência com a nossa essência." });
  await experience.scrollIntoViewIfNeeded();
  await expect(experience).not.toHaveAttribute("data-reveal-pending", "true");
  await expect(experience.getByRole("link", { name: "Conversar no WhatsApp" })).toHaveAttribute("href", "https://wa.me/5577988549691");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("movimento reduzido não esconde conteúdo nem executa entradas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("main > section[data-reveal-direction]").first()).toBeAttached();
  await expect(page.locator("[data-reveal-pending]")).toHaveCount(0);
  expect(await page.locator("main").evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation instanceof Animation && !(animation instanceof CSSAnimation)).length)).toBe(0);
});

test("sem JavaScript o conteúdo e o contato continuam visíveis", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("[data-reveal-pending]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Uma experiência com a nossa essência." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Conversar no WhatsApp", exact: true })).toHaveAttribute("href", "https://wa.me/5577988549691");
  await context.close();
});
