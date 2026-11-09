import { expect, test } from "@playwright/test";

test.describe("Sprint 1 smoke", () => {
  test("Bulgarian homepage loads", async ({ page }) => {
    await page.goto("/bg/");
    await expect(page.locator("html")).toHaveAttribute("lang", "bg");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Всеки детайл има значение.");
  });

  test("English homepage loads", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Every detail matters.");
  });

  test("root redirects to /bg/", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/bg\/$/);
  });

  test("language switch keeps the current section", async ({ page }) => {
    await page.goto("/bg/#pricing");
    await page.getByRole("link", { name: "en", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/#pricing$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Every detail matters.");
  });

  test("hero CTAs scroll to their sections", async ({ page }) => {
    await page.goto("/bg/");
    await page.getByRole("link", { name: "Нашите услуги" }).click();
    await expect(page.locator("#services")).toBeInViewport();
    await page.goto("/bg/");
    await page.getByRole("link", { name: "Изпрати запитване" }).first().click();
    await expect(page.locator("#contact")).toBeInViewport();
  });

  test("no horizontal overflow at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto("/bg/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("mobile menu opens and closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/bg/");
    await page.getByRole("button", { name: "Отвори менюто" }).click();
    const menu = page.getByRole("navigation", { name: "Мобилна навигация" });
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });
});
