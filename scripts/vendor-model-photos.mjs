/**
 * One-time build of local image assets for the optional preview.
 * Intended for a GitHub Actions runner, not for application runtime.
 * Output is idempotent and original public/images/products are never changed.
 */
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

const SOURCES = [
  "src/lib/model-photo-preview.ts",
  "src/components/home/hero.tsx",
  "src/components/home/collection-banner.tsx",
  "src/app/about/page.tsx",
];
const ids = new Set();
for (const source of SOURCES) {
  const text = await readFile(source, "utf8");
  for (const [id] of text.matchAll(/\b\d{6,9}\b/g)) ids.add(id);
}
const targetDir = "public/images/model-preview";
await mkdir(targetDir, { recursive: true });
const list = [...ids].sort((a, b) => Number(a) - Number(b));
let downloaded = 0, existing = 0, unavailable = 0;

async function download(id) {
  const dest = join(targetDir, `${id}.jpg`);
  try {
    if ((await stat(dest)).size > 6000) { existing++; return; }
  } catch {}

  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1440&fit=crop`;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { "accept": "image/jpeg,image/*;q=0.9" },
        signal: AbortSignal.timeout(18000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const kind = response.headers.get("content-type") ?? "";
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!kind.startsWith("image/") || buffer.length < 6000 || buffer.length > 4_000_000 ||
          buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer.at(-2) !== 0xff || buffer.at(-1) !== 0xd9) {
        throw new Error(`invalid JPEG (type=${kind}, size=${buffer.length})`);
      }
      await writeFile(dest, buffer);
      downloaded++;
      console.log(`OK ${id} ${buffer.length} bytes`);
      return;
    } catch (err) {
      if (attempt === 2) {
        unavailable++;
        console.warn(`UNAVAILABLE ${id}: ${String(err)}`);
      }
    }
  }
}
const concurrency = 5;
for (let at = 0; at < list.length; at += concurrency) {
  await Promise.all(list.slice(at, at + concurrency).map(download));
}
console.log(`Model photos: ${list.length} requested, ${downloaded} downloaded, ${existing} cached, ${unavailable} unavailable.`);
if (downloaded + existing < 8) {
  console.error("Too few valid model photos. Keeping workflow failed rather than reporting a successful preview.");
  process.exitCode = 1;
}
