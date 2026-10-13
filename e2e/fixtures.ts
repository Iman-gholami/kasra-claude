import { test as base, expect, type Page } from "@playwright/test";

/** Formats a number the same way the storefront does (Persian digits and grouping). */
export const fa = (n: number) => new Intl.NumberFormat("fa-IR").format(n);

/** Fails a test when the page logs a console error or throws an uncaught exception. */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(err.message));
      await use(errors);
      expect(errors, "console errors during the test").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1440) < 1024;
}

/** Selects the first purchasable size of the current colour on a product page. */
export async function chooseFirstAvailableSize(page: Page, scope = page.locator("main")) {
  const size = scope.locator('input[data-testid^="size-"]:not([disabled])').first();
  const value = await size.getAttribute("value");
  await scope.locator(`label:has(input[data-testid="size-${value}"])`).click();
  return value!;
}

export async function addProductToCart(page: Page, slug: string, options: { color?: string; size?: string } = {}) {
  await page.goto(`/product/${slug}`);
  if (options.color) await page.locator(`label:has(input[data-testid="color-${options.color}"])`).click();
  if (options.size) await page.locator(`label:has(input[data-testid="size-${options.size}"])`).click();
  else await chooseFirstAvailableSize(page);
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByRole("status").filter({ hasText: "به سبد خرید اضافه شد" }).first()).toBeVisible();
}
