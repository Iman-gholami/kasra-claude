import AxeBuilder from "@axe-core/playwright";
import { test, expect, addProductToCart } from "./fixtures";

const pages = ["/", "/shop", "/category/manto", "/product/manto-barani-paeez", "/search?q=لینن", "/size-guide", "/faq", "/account"];

test.describe("accessibility (axe, WCAG 2.2 A/AA)", () => {
  for (const path of pages) {
    test(`no serious violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }

  test("no serious violations on cart and checkout with items", async ({ page }) => {
    await addProductToCart(page, "tshirt-basic-rouzaneh", { color: "white", size: "M" });
    for (const path of ["/cart", "/checkout"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${path} ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    }
  });

  test("skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "پرش به محتوای اصلی" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });
});
