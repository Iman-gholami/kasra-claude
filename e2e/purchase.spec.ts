import { test, expect, fa, isMobile, addProductToCart, chooseFirstAvailableSize } from "./fixtures";

const BASIC_TEE = "tshirt-basic-rouzaneh"; // 590,000 Toman; black / XL is sold out in the mock data
const RIB_TEE = "tshirt-crop-rib-nava"; // 650,000 Toman, previously 750,000
const SOLD_OUT = "shomiz-abrisham-shida";

test.describe("product variants", () => {
  test("colour and size behave as real variants", async ({ page }) => {
    await page.goto(`/product/${BASIC_TEE}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("تیشرت بیسیک نخی روزانه");

    // Adding without a size is blocked with an accessible error.
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByRole("alert").filter({ hasText: "سایز" })).toContainText("سایز موردنظر را انتخاب کنید");
    await expect(page.getByTestId("cart-count")).toHaveCount(0);

    // Black / XL is out of stock and cannot be selected.
    await page.locator('label:has(input[data-testid="color-black"])').click();
    await expect(page).toHaveURL(/color=black/);
    await expect(page.getByTestId("size-XL")).toBeDisabled();
    await expect(page.getByTestId("size-M")).toBeEnabled();

    // In model-preview mode the front image is illustrative stock photography;
    // the original back image still follows the selected colour.
    const gallery = page.getByTestId("gallery-track").locator("img");
    if (process.env.NEXT_PUBLIC_MODEL_PREVIEW === "true") {
      await expect(gallery.first()).toHaveAttribute("src", /pexels/);
      await expect(gallery.nth(1)).toHaveAttribute("src", /black-back/);
    } else {
      await expect(gallery.first()).toHaveAttribute("src", /black-front/);
    }
    await expect(page.getByTestId("gallery-thumbnails").locator("button")).toHaveCount(3);

    await page.locator('label:has(input[data-testid="size-M"])').click();
    await expect(page.getByRole("alert").filter({ hasText: "سایز" })).toHaveCount(0);
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByTestId("cart-count")).toHaveText(fa(1));
  });

  test("a sold-out size stays unavailable after switching back", async ({ page }) => {
    await page.goto(`/product/${BASIC_TEE}?color=black`);
    await expect(page.getByTestId("size-XL")).toBeDisabled();
    await page.locator('label:has(input[data-testid="color-white"])').click();
    await expect(page.getByTestId("size-XL")).toBeEnabled();
    await page.locator('label:has(input[data-testid="size-XL"])').click();
    await page.locator('label:has(input[data-testid="color-black"])').click();
    // The previously chosen XL is dropped because black/XL cannot be bought.
    await expect(page.getByTestId("size-XL")).not.toBeChecked();
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByRole("alert").filter({ hasText: "سایز" })).toBeVisible();
  });

  test("fully sold-out products cannot be added", async ({ page }) => {
    await page.goto(`/product/${SOLD_OUT}`);
    await expect(page.getByTestId("add-to-cart")).toBeDisabled();
    await expect(page.getByTestId("add-to-cart")).toHaveText("ناموجود");
    await expect(page.getByTestId("availability")).toContainText("موجود نیست");
    const sizes = page.locator('input[data-testid^="size-"]');
    for (const size of await sizes.all()) await expect(size).toBeDisabled();
  });

  test("quick add from a product card adds the chosen variant", async ({ page }) => {
    await page.goto("/category/tshirt");
    const card = page.getByTestId("product-card").filter({ visible: true, hasText: "تیشرت بیسیک نخی روزانه" });
    await card.getByTestId("quick-add").click();
    const sheet = page.getByRole("dialog", { name: "افزودن سریع به سبد" });
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('input[data-testid^="size-"]').first()).toBeVisible();
    await chooseFirstAvailableSize(page, sheet);
    await sheet.getByTestId("quick-add-submit").click();
    await expect(sheet).toBeHidden();
    await expect(page.getByTestId("cart-count")).toHaveText(fa(1));
  });
});

test.describe("cart", () => {
  test("quantities, totals and persistence", async ({ page }) => {
    await addProductToCart(page, BASIC_TEE, { color: "white", size: "M" });
    await addProductToCart(page, RIB_TEE);
    await expect(page.getByTestId("cart-count")).toHaveText(fa(2));

    await page.goto("/cart");
    const lines = page.getByTestId("cart-line").filter({ visible: true });
    await expect(lines).toHaveCount(2);

    const basic = lines.filter({ hasText: "تیشرت بیسیک نخی روزانه" });
    await basic.getByRole("button", { name: "افزایش تعداد" }).click();
    await expect(basic.getByTestId("line-total")).toHaveText(`${fa(1_180_000)} تومان`);

    // 2 × 590,000 + 650,000 = 1,830,000; original 2 × 590,000 + 750,000 = 1,930,000
    await expect(page.getByTestId("summary-original")).toHaveText(`${fa(1_930_000)} تومان`);
    await expect(page.getByTestId("summary-savings")).toHaveText(`${fa(100_000)} تومان`);
    await expect(page.getByTestId("summary-shipping")).toHaveText(`${fa(95_000)} تومان`);
    await expect(page.getByTestId("summary-total")).toHaveText(`${fa(1_925_000)} تومان`);

    // Persisted across reloads without flashing an empty cart.
    await page.reload();
    await expect(lines).toHaveCount(2);
    await expect(page.getByTestId("summary-total")).toHaveText(`${fa(1_925_000)} تومان`);

    // Different variants of the same product are separate lines.
    await addProductToCart(page, BASIC_TEE, { color: "beige", size: "M" });
    await page.goto("/cart");
    await expect(lines).toHaveCount(3);

    await lines.filter({ hasText: "تیشرت کراپ ریب نوا" }).getByRole("button", { name: /حذف/ }).click();
    await expect(lines).toHaveCount(2);
    await expect(page.getByTestId("cart-count")).toHaveText(fa(3));
  });

  test("cart drawer opens from the header", async ({ page }) => {
    await addProductToCart(page, BASIC_TEE, { color: "gray", size: "S" });
    await page.getByRole("button", { name: /سبد خرید/ }).click();
    const drawer = page.getByRole("dialog", { name: /سبد خرید/ });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByTestId("cart-line")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });

  test("wishlist persists and stays in sync across pages", async ({ page }) => {
    await page.goto(`/product/${RIB_TEE}`);
    const toggle = page.getByTestId("wishlist-toggle").filter({ visible: true }).first();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page.getByTestId("wishlist-toggle").filter({ visible: true }).first()).toHaveAttribute("aria-pressed", "true");

    await page.goto("/wishlist");
    const cards = page.getByTestId("product-card").filter({ visible: true });
    await expect(cards).toHaveCount(1);
    await expect(cards).toContainText("تیشرت کراپ ریب نوا");
    await cards.getByTestId("wishlist-toggle").click();
    await expect(page.getByText("فهرست علاقه‌مندی‌های شما خالی است")).toBeVisible();
  });
});

test.describe("demo checkout", () => {
  test("validation, demo confirmation and order history", async ({ page }) => {
    await addProductToCart(page, BASIC_TEE, { color: "white", size: "L" });
    await page.goto("/checkout");
    await expect(page.getByText("تسویه‌حساب نمایشی")).toBeVisible();

    await page.getByTestId("place-order").click();
    const summary = page.getByTestId("error-summary");
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(page.locator("#checkout-fullName")).toHaveAttribute("aria-invalid", "true");

    await page.locator("#checkout-fullName").fill("سارا محمدی");
    await page.locator("#checkout-mobile").fill("0912345");
    await page.locator("#checkout-postalCode").fill("12345");
    await page.locator("#checkout-city").click();
    await expect(page.locator("#checkout-mobile-error")).toContainText("معتبر نیست");

    // Persian digits are accepted and normalized.
    await page.locator("#checkout-mobile").fill("۰۹۱۲۳۴۵۶۷۸۹");
    await page.locator("#checkout-province").selectOption("اصفهان");
    await page.locator("#checkout-city").fill("اصفهان");
    await page.locator("#checkout-address").fill("خیابان چهارباغ، کوچه‌ی ۱۲، پلاک ۴");
    await page.locator("#checkout-postalCode").fill("1351813845");
    await expect(page.getByTestId("error-summary")).toHaveCount(0);

    await page.getByTestId("place-order").click();
    await expect(page).toHaveURL(/\/checkout\/confirmation\?order=KB-/);
    await expect(page.getByTestId("order-confirmation")).toContainText("سفارش آزمایشی شما ثبت شد");
    const orderId = await page.getByTestId("order-id").textContent();
    await expect(page.getByTestId("cart-count")).toHaveCount(0);

    await page.goto("/account");
    await expect(page.locator("#orders")).toContainText(orderId!.trim());
  });

  test("checkout with an empty cart points back to the shop", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.locator("main").getByText("سبد خرید شما خالی است")).toBeVisible();
  });
});

test.describe("mobile purchase experience", () => {
  test("sticky purchase bar appears after scrolling past the main button", async ({ page }) => {
    test.skip(!isMobile(page), "mobile only");
    await page.goto(`/product/${BASIC_TEE}`);
    const sticky = page.getByTestId("sticky-add-to-cart");
    await expect(sticky).toBeHidden();
    await page.getByRole("heading", { name: "ممکن است بپسندید" }).scrollIntoViewIfNeeded();
    await expect(sticky).toBeVisible();
    await sticky.click();
    // Without a size the page scrolls back to the size selector and explains why.
    await expect(page.getByRole("alert").filter({ hasText: "سایز" })).toContainText("سایز");
  });
});
