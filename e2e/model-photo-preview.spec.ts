import { expect, test } from "@playwright/test";

test.describe("model-photo preview", () => {
  test.skip(process.env.NEXT_PUBLIC_MODEL_PREVIEW !== "true", "Only for model-photo preview builds");

  test("displays fashion models and a sample-photo notice", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("note")).toContainText("پیش‌نمایش عکس مدل فعال است");
    await expect(page.locator('[data-testid="product-card"] img').first()).toHaveAttribute("src", /model-preview/);
    await expect(page.locator('[data-testid="category-tile-shomiz"] img')).toHaveAttribute("src", /model-preview/);

    // Verify loaded pixels, not only rendered src attributes. This protects
    // against the broken hero / category images caused by private-IP DNS.
    for (const locator of [
      page.locator('section[aria-labelledby="hero-title"] img').first(),
      page.locator('[data-testid="category-tile-shomiz"] img').first(),
      page.locator('[data-testid="product-card"] img').first(),
    ]) {
      await expect.poll(async () => locator.evaluate((img) =>
        (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true);
    }
    await expect(page.locator('img[src*="pexels.com"]')).toHaveCount(0);

    await page.goto("/product/shomiz-satin-raha");
    await expect(page.locator('img[alt*="عکس مدل نمونه"]').first()).toBeVisible();
  });
});
