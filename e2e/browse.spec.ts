import { test, expect, fa, isMobile } from "./fixtures";

test.describe("homepage and navigation", () => {
  test("homepage loads with hero, categories and products", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/بوتیک کسرا/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("استایل هر روزت");
    await expect(page.getByRole("link", { name: "مشاهده محصولات" })).toBeVisible();
    await expect(page.getByTestId("product-card").filter({ visible: true })).toHaveCount(8);
    // No horizontal overflow on any viewport.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("primary CTA opens the catalog", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "مشاهده محصولات" }).click();
    await expect(page).toHaveURL(/\/shop$/);
    await expect(page.getByTestId("result-count").filter({ visible: true })).toHaveText(`${fa(36)} محصول`);
  });

  test("category navigation shows only that category", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("category-tile-manto").click();
    await expect(page).toHaveURL(/\/category\/manto$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("مانتو");
    await expect(page.getByTestId("result-count").filter({ visible: true })).toHaveText(`${fa(12)} محصول`);
    const names = await page.getByTestId("product-card").filter({ visible: true }).locator("h3").allTextContents();
    expect(names.length).toBe(12);
    for (const name of names) expect(name).toContain("مانتو");
  });

  test("unknown routes render the custom 404 page", async ({ page, consoleErrors }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "این صفحه پیدا نشد" })).toBeVisible();
    // The browser logs the expected 404 document response itself.
    consoleErrors.splice(0, consoleErrors.length, ...consoleErrors.filter((e) => !e.includes("status of 404")));
  });

  test("main navigation works on every viewport", async ({ page }) => {
    await page.goto("/");
    if (isMobile(page)) {
      await page.getByRole("button", { name: "منوی اصلی" }).click();
      const menu = page.getByRole("dialog");
      await expect(menu).toBeVisible();
      await menu.getByRole("link", { name: "تیشرت" }).click();
      await expect(menu).toBeHidden();
    } else {
      await page.getByRole("navigation", { name: "منوی اصلی" }).getByRole("link", { name: "تیشرت" }).click();
    }
    await expect(page).toHaveURL(/\/category\/tshirt$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("تیشرت");
  });
});

test.describe("search", () => {
  test("typeahead suggests matching products and opens results", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "جستجوی محصولات" }).filter({ visible: true }).first().click();
    const input = page.getByRole("combobox", { name: "عبارت جستجو" });
    await expect(input).toBeFocused();
    await input.fill("لینن");
    const options = page.getByRole("option");
    await expect(options.first()).toBeVisible();
    await expect(page.getByRole("listbox")).toContainText("مانتو لینن کیمونویی نارون");
    // Keyboard navigation reaches the options.
    await input.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-activedescendant", /.+/);
    await input.press("Escape");
    await expect(input).toBeHidden();
  });

  test("search page returns relevant results and normalizes Arabic characters", async ({ page }) => {
    // «تيشرت» typed with Arabic yeh must match «تیشرت».
    await page.goto(`/search?q=${encodeURIComponent("تيشرت اورسايز")}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("تيشرت اورسايز");
    const names = await page.getByTestId("product-card").filter({ visible: true }).locator("h3").allTextContents();
    expect(names).toContain("تیشرت اورسایز ملانژ سولو");
    for (const name of names) expect(name).toContain("تیشرت");
  });

  test("no-results state offers a way forward", async ({ page }) => {
    await page.goto(`/search?q=${encodeURIComponent("کفش ورزشی")}`);
    await expect(page.getByRole("heading", { name: /محصولی برای «کفش ورزشی» پیدا نشد/ })).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: "همه‌ی محصولات" })).toBeVisible();
  });
});

test.describe("catalog filtering and sorting", () => {
  test("filters update results and the shareable URL", async ({ page }) => {
    await page.goto("/category/tshirt");
    const count = page.getByTestId("result-count").filter({ visible: true });
    if (isMobile(page)) {
      // Phones: choose in the sheet, preview the count, then apply once.
      await page.getByTestId("open-filters").click();
      const sheet = page.getByRole("dialog", { name: "فیلتر محصولات" });
      await sheet.locator('label:has([data-testid="filter-size-FS"])').click();
      await expect(sheet.getByTestId("apply-filters")).toHaveText(`نمایش ${fa(1)} محصول`);
      await expect(page).not.toHaveURL(/size=/);
      await sheet.getByTestId("apply-filters").click();
      await expect(sheet).toBeHidden();
    } else {
      // Desktop: every change applies immediately.
      await page.getByTestId("filter-panel").filter({ visible: true }).locator('label:has([data-testid="filter-size-FS"])').click();
    }
    await expect(page).toHaveURL(/size=FS/);
    await expect(count).toHaveText(`${fa(1)} محصول`);
    const cards = page.getByTestId("product-card").filter({ visible: true });
    await expect(cards).toHaveCount(1);
    await expect(cards).toContainText("تیشرت اورسایز ملانژ سولو");

    // The filtered URL is shareable: a fresh load renders the same state.
    await page.reload();
    await expect(page.getByTestId("product-card").filter({ visible: true })).toHaveCount(1);

    // Removing the chip restores the full category.
    await page.getByRole("link", { name: "حذف فیلتر سایز فری‌سایز" }).click();
    await expect(page).toHaveURL(/\/category\/tshirt$/);
    await expect(count).toHaveText(`${fa(12)} محصول`);
  });

  test("discount filter only returns discounted products", async ({ page }) => {
    await page.goto("/shop?sale=1");
    const cards = page.getByTestId("product-card").filter({ visible: true });
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) await expect(cards.nth(i).locator("del")).toHaveCount(1);
  });

  test("sorting by price orders products correctly", async ({ page }) => {
    await page.goto("/shop?category=manto");
    await page.getByTestId("sort-select").filter({ visible: true }).selectOption("price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);
    await expect(page.locator("[data-pending]")).toHaveCount(0);
    const asc = (await page.getByTestId("product-card").filter({ visible: true }).locator("[data-price]").evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-price")))));
    expect(asc.length).toBe(12);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));

    await page.getByTestId("sort-select").filter({ visible: true }).selectOption("price-desc");
    await expect(page).toHaveURL(/sort=price-desc/);
    await expect(page.locator("[data-pending]")).toHaveCount(0);
    const desc = await page.getByTestId("product-card").filter({ visible: true }).locator("[data-price]").evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-price"))));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  test("pagination and browser back/forward keep catalog state", async ({ page }) => {
    await page.goto("/shop");
    const cards = page.getByTestId("product-card").filter({ visible: true });
    const firstPage = await cards.first().getAttribute("data-product-id");
    await page.getByTestId("next-page").filter({ visible: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(cards.first()).not.toHaveAttribute("data-product-id", firstPage!);
    await page.goBack();
    await expect(page).toHaveURL(/\/shop$/);
    await expect(cards.first()).toHaveAttribute("data-product-id", firstPage!);
  });
});
