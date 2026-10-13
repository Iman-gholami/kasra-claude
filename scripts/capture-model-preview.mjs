/** Capture desktop/mobile screenshots from the production model-photo build. */
import { chromium, devices } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.env.PREVIEW_BASE_URL ?? "http://127.0.0.1:3000";
const output = "artifacts/model-preview";
await mkdir(output, { recursive: true });

let healthy = false;
for (let i = 0; i < 60; i++) {
  try {
    const response = await fetch(`${base}/api/health`);
    if (response.ok) { healthy = true; break; }
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
if (!healthy) throw new Error("Preview server did not become healthy within 60 seconds");

const browser = await chromium.launch({ headless: true });
try {
  for (const [name, viewport] of [
    ["desktop", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }],
    ["mobile", devices["Pixel 7"]],
  ]) {
    const context = await browser.newContext(viewport);
    const page = await context.newPage();
    for (const [route, file] of [
      ["/", "home"],
      ["/product/shomiz-satin-raha", "product"],
    ]) {
      await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
      await page.screenshot({ path: `${output}/${name}-${file}.png`, fullPage: true, animations: "disabled" });
    }
    await context.close();
  }
} finally {
  await browser.close();
}
