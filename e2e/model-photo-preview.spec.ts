import { expect, test } from "@playwright/test";

test.describe("model-photo preview", () => {
  test.skip(process.env.NEXT_PUBLIC_MODEL_PREVIEW !== "true", "Only for model-photo preview builds");

  test("displays fashion models and a sample-photo notice", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("note")).toContainText("پیش‌نمایش عکس مدل فعال است");
    await expect(page.locator('[data-testid="product-card"] img').first()).toHaveAttribute("src", /pexels/);
    await expect(page.locator('[data-testid="category-tile-shomiz"] img')).toHaveAttribute("src", /pexels/);

    await page.goto("/product/shomiz-satin-raha");
    await expect(page.locator('img[alt*="عکس مدل نمونه"]').first()).toBeVisible();
  });
});
