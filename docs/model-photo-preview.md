# Model-photo preview (visual design review only)

Run `npm ci && npm run dev:models` and open http://localhost:3000.
Use `npm run dev` for the original illustrations. To test a production build,
run `npm run build:models && npm run start`.

Preview changes product listing cards, cart thumbnails, front gallery pictures,
the hero, category tiles, collection banner, and About page. Original back and
fabric-detail pictures stay in place.

## Important limits
These are **existing Pexels stock photographs**, not AI-generated model
photographs of Kasra garments. The same image is reused for all colours of
a particular product, so colour, fabric, fit and back/detail photos do NOT
match actual product data. The stock photography is for comparing page design
only. Never use it for real sales or imply the people model Kasra clothing.
A notice is shown on every page while this mode is active.

Photographs are served from images.pexels.com and require network access.
The images are free-to-use according to their respective Pexels pages; check
the current license before any other use: https://www.pexels.com/license/.
IDs and the resulting CDN URLs are in src/lib/model-photo-preview.ts.
For a truly accurate result, use approved, per-SKU photographed or generated
images and replace public/images/products/<slug>/<color>-{front,back,detail}.webp.

Tests: npm run typecheck, npm run lint, npm run build:models, npm run test:e2e.
