/**
 * Generates the art-directed placeholder imagery used by the demo storefront.
 *
 * Real product photography was not available when this prototype was built,
 * so every product colourway is rendered as a studio-style "ghost mannequin"
 * illustration (front, back and fabric detail), together with category tiles,
 * the homepage hero and the collection banner. Output is written to
 * `public/images/**` as WebP and is consumed through `next/image`.
 *
 * Replace with real photography by keeping the same paths (or by changing the
 * image URLs in `src/lib/catalog/mock-repository.ts`) — see README › Images.
 *
 * Usage: npm run images:generate [-- --only=<slug>,<slug>] [-- --scenes]
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";
import {
  CATEGORY_DEFINITIONS,
  COLORS,
  PRODUCT_DEFINITIONS,
  type ColorKey,
  type GarmentVisual,
  type ProductDefinition,
} from "../src/data/catalog-source.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "images");
const W = 1200;
const H = 1600;
const SCENES_ONLY = process.argv.includes("--scenes");
const ONLY = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");

// ───────────────────────────── colour helpers ─────────────────────────────

type RGB = [number, number, number];
const hexToRgb = (hex: string): RGB => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
};
const rgbToHex = (rgb: RGB) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a: string, b: string, t: number) => {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex([0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * t) as RGB);
};
const shade = (c: string, t: number) => mix(c, "#000000", t);
const tint = (c: string, t: number) => mix(c, "#ffffff", t);
const luminance = (c: string) => {
  const [r, g, b] = hexToRgb(c).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Deterministic PRNG so regenerated assets are byte-stable. */
function prng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

const f = (n: number) => Math.round(n * 10) / 10;
const pt = (p: { x: number; y: number }) => `${f(p.x)} ${f(p.y)}`;

// ───────────────────────────── backdrops ─────────────────────────────

interface Backdrop {
  top: string;
  bottom: string;
  arch: string;
}
const BACKDROPS: Backdrop[] = [
  { top: "#efe8de", bottom: "#e2d7c8", arch: "#e4d9ca" }, // sand
  { top: "#edebe6", bottom: "#dcd8d0", arch: "#e0dcd4" }, // stone
  { top: "#f2e8e3", bottom: "#e5d3cb", arch: "#e9d9d1" }, // rose
  { top: "#eaece5", bottom: "#d9ddd2", arch: "#dde1d6" }, // sage
];

function backdropFor(index: number, garment: string): Backdrop {
  const b = BACKDROPS[index % BACKDROPS.length];
  // Very light garments need a slightly deeper backdrop to keep their silhouette.
  if (luminance(garment) > 0.62) {
    return { top: shade(b.top, 0.035), bottom: shade(b.bottom, 0.06), arch: shade(b.arch, 0.07) };
  }
  return b;
}

function studioBackground(id: string, width: number, height: number, b: Backdrop) {
  return `
  <defs>
    <linearGradient id="${id}-wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${b.top}"/>
      <stop offset="1" stop-color="${b.bottom}"/>
    </linearGradient>
    <radialGradient id="${id}-light" cx="0.68" cy="0.22" r="0.75">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}-vignette" cx="0.5" cy="0.45" r="0.85">
      <stop offset="0.6" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#3a2a1a" stop-opacity="0.09"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#${id}-wall)"/>
  <rect width="${width}" height="${height}" fill="url(#${id}-light)"/>
  <rect width="${width}" height="${height}" fill="url(#${id}-vignette)"/>`;
}

const GRAIN = `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>`;

// ───────────────────────────── garment geometry ─────────────────────────────

interface Pt {
  x: number;
  y: number;
}
const P = (x: number, y: number): Pt => ({ x, y });
const add = (a: Pt, b: Pt) => P(a.x + b.x, a.y + b.y);
const scl = (a: Pt, k: number) => P(a.x * k, a.y * k);
const mid = (a: Pt, b: Pt) => P((a.x + b.x) / 2, (a.y + b.y) / 2);
const mirror = (a: Pt) => P(-a.x, a.y);

interface GarmentDrawing {
  silhouette: string[];
  inner: string;
  details: string;
  folds: string;
  bbox: { minX: number; maxX: number; minY: number; maxY: number };
  waistY: number;
  hemY: number;
  neckWidth: number;
}

interface Dimensions {
  nw: number;
  neckDepth: number;
  sw: number;
  shoulderDrop: number;
  ax: number;
  ay: number;
  wx: number;
  wy: number;
  hx: number;
  hy: number;
}

function dimensions(v: GarmentVisual, view: "front" | "back"): Dimensions {
  const manteau = v.garment === "manteau";
  const neckW: Record<GarmentVisual["neckline"], number> = {
    crew: 64,
    v: 68,
    boat: 98,
    turtle: 54,
    collar: 58,
    bow: 62,
    mandarin: 58,
  };
  const neckD: Record<GarmentVisual["neckline"], number> = {
    crew: 56,
    v: manteau ? 210 : 150,
    boat: 24,
    turtle: 12,
    collar: 42,
    bow: 48,
    mandarin: 30,
  };
  const fitShoulder = { fitted: 182, regular: 202, oversize: 252, boxy: 238 }[v.fit];
  const fitWaist = { fitted: 152, regular: 178, oversize: 238, boxy: 232 }[v.fit];
  const fitHem = { fitted: 168, regular: 192, oversize: 246, boxy: 234 }[v.fit];
  const lengthY = manteau
    ? { crop: 640, regular: 760, hip: 760, knee: 1010, midi: 1160 }[v.length]
    : { crop: 440, regular: 610, hip: 690, knee: 900, midi: 1000 }[v.length];
  const sw = manteau ? fitShoulder + 10 : fitShoulder;
  const dropped = v.fit === "oversize" || v.fit === "boxy";
  return {
    nw: neckW[v.neckline],
    neckDepth: view === "back" ? (v.neckline === "turtle" ? 8 : 18) : neckD[v.neckline],
    sw,
    shoulderDrop: dropped ? 44 : 30,
    ax: v.sleeve === "sleeveless" ? sw * 0.84 : sw - (dropped ? 34 : 18),
    ay: dropped ? 250 : v.sleeve === "kimono" ? 330 : 190,
    wx: manteau ? (v.closure === "belt" ? fitWaist - 6 : fitWaist + 14) : fitWaist,
    wy: manteau ? 400 : 380,
    hx: manteau ? fitHem + (v.length === "midi" ? 52 : 36) : fitHem,
    hy: lengthY,
  };
}

interface SleeveSpec {
  angle: number;
  length: number;
  cuff: number;
  kind: "plain" | "puff" | "flare" | "kimono";
  cuffBand: number;
}

function sleeveSpec(v: GarmentVisual): SleeveSpec | null {
  const manteau = v.garment === "manteau";
  const big = v.fit === "oversize" || v.fit === "boxy";
  switch (v.sleeve) {
    case "sleeveless":
      return null;
    case "short":
      return { angle: big ? 50 : 42, length: big ? 190 : 150, cuff: big ? 94 : 78, kind: "plain", cuffBand: 0 };
    case "elbow":
      return { angle: 26, length: 300, cuff: 64, kind: "plain", cuffBand: 0 };
    case "three-quarter":
      return { angle: 16, length: manteau ? 470 : 420, cuff: 56, kind: "plain", cuffBand: 0 };
    case "puff":
      return { angle: 36, length: 165, cuff: 70, kind: "puff", cuffBand: 22 };
    case "flare":
      return { angle: 17, length: manteau ? 500 : 430, cuff: 118, kind: "flare", cuffBand: 0 };
    case "kimono":
      return { angle: 52, length: 300, cuff: 132, kind: "kimono", cuffBand: 0 };
    case "long":
    default:
      return {
        angle: 13,
        length: manteau ? 640 : 570,
        cuff: v.fit === "fitted" ? 42 : big ? 58 : 48,
        kind: "plain",
        cuffBand: v.garment === "tshirt" ? 0 : 34,
      };
  }
}

/** Builds the vector drawing of a garment centred at x=0 with the neck at y=0. */
function drawGarment(v: GarmentVisual, color: string, view: "front" | "back"): GarmentDrawing {
  const d = dimensions(v, view);
  const dark = luminance(color) < 0.12;
  const seam = shade(color, dark ? 0 : 0.28);
  const seamStroke = dark ? tint(color, 0.18) : seam;
  const silhouette: string[] = [];
  let details = "";
  let folds = "";
  let inner = "";

  const N = P(d.nw, 0);
  const S = P(d.sw, d.shoulderDrop);
  const A = P(d.ax, d.ay);
  const Wst = P(d.wx, d.wy);
  const Hm = P(d.hx, d.hy);

  // Sleeves (drawn first so the torso overlaps the armhole).
  const spec = sleeveSpec(v);
  let maxX = d.hx + 10;
  if (spec) {
    const th = (spec.angle * Math.PI) / 180;
    const dir = P(Math.sin(th), Math.cos(th));
    const nrm = P(Math.cos(th), -Math.sin(th));
    const top = mid(S, A);
    const C = add(top, scl(dir, spec.length));
    const O = add(C, scl(nrm, spec.cuff));
    const I = add(C, scl(nrm, -spec.cuff));
    for (const side of [1, -1]) {
      const m = (p: Pt) => (side === 1 ? p : mirror(p));
      let sleeve: string;
      if (spec.kind === "puff") {
        const bulgeO = add(mid(S, O), scl(nrm, 46));
        const bulgeI = add(mid(A, I), scl(nrm, -18));
        sleeve = `M${pt(m(S))} Q${pt(m(bulgeO))} ${pt(m(O))} L${pt(m(I))} Q${pt(m(bulgeI))} ${pt(m(A))} Z`;
        // Elastic band + gathers.
        const bandTop = add(C, scl(dir, -spec.cuffBand));
        const bo = add(bandTop, scl(nrm, spec.cuff - 4));
        const bi = add(bandTop, scl(nrm, -spec.cuff + 4));
        details += `<path d="M${pt(m(bo))} L${pt(m(O))} L${pt(m(I))} L${pt(m(bi))} Z" fill="${shade(color, 0.06)}" stroke="${seamStroke}" stroke-opacity="0.35" stroke-width="2"/>`;
        for (let k = 1; k < 6; k++) {
          const a = add(bandTop, scl(nrm, spec.cuff - (2 * spec.cuff * k) / 6));
          const b = add(a, scl(dir, -70));
          folds += `<path d="M${pt(m(a))} L${pt(m(b))}" stroke="#000" stroke-opacity="0.12" stroke-width="7"/>`;
        }
      } else if (spec.kind === "flare") {
        const hemMid = add(C, scl(dir, 26));
        sleeve = `M${pt(m(S))} Q${pt(m(add(mid(S, O), scl(nrm, 6))))} ${pt(m(O))} Q${pt(m(hemMid))} ${pt(m(I))} Q${pt(m(add(mid(A, I), scl(nrm, 10))))} ${pt(m(A))} Z`;
        folds += `<path d="M${pt(m(add(top, scl(dir, spec.length * 0.45))))} L${pt(m(add(C, scl(nrm, -spec.cuff * 0.3))))}" stroke="#000" stroke-opacity="0.13" stroke-width="12"/>`;
        folds += `<path d="M${pt(m(add(top, scl(dir, spec.length * 0.5))))} L${pt(m(add(C, scl(nrm, spec.cuff * 0.45))))}" stroke="#000" stroke-opacity="0.1" stroke-width="10"/>`;
      } else if (spec.kind === "kimono") {
        const Sk = P(S.x - 10, S.y - 6);
        const Ak = P(A.x - 30, A.y + 40);
        sleeve = `M${pt(m(Sk))} Q${pt(m(add(mid(Sk, O), scl(nrm, 14))))} ${pt(m(O))} L${pt(m(I))} Q${pt(m(add(mid(Ak, I), scl(nrm, -26))))} ${pt(m(Ak))} Z`;
        folds += `<path d="M${pt(m(add(A, P(10, 0))))} Q${pt(m(add(C, scl(nrm, -40))))} ${pt(m(add(C, scl(nrm, -10))))}" stroke="#000" stroke-opacity="0.12" stroke-width="12" fill="none"/>`;
      } else {
        sleeve = `M${pt(m(S))} Q${pt(m(add(mid(S, O), scl(nrm, 7))))} ${pt(m(O))} L${pt(m(I))} Q${pt(m(add(mid(A, I), scl(nrm, -4))))} ${pt(m(A))} Z`;
        if (spec.length > 300) {
          const e1 = add(top, scl(dir, spec.length * 0.52));
          folds += `<path d="M${pt(m(add(e1, scl(nrm, -spec.cuff * 0.9))))} Q${pt(m(add(e1, P(0, 16))))} ${pt(m(add(e1, scl(nrm, spec.cuff * 0.6))))}" stroke="#000" stroke-opacity="0.12" stroke-width="9" fill="none"/>`;
          folds += `<path d="M${pt(m(add(top, scl(dir, 60))))} L${pt(m(add(C, scl(nrm, -spec.cuff * 0.4))))}" stroke="#fff" stroke-opacity="0.09" stroke-width="12"/>`;
        }
        if (spec.cuffBand > 0) {
          const bandTop = add(C, scl(dir, -spec.cuffBand));
          const bo = add(bandTop, scl(nrm, spec.cuff + 1));
          const bi = add(bandTop, scl(nrm, -spec.cuff - 1));
          details += `<path d="M${pt(m(bo))} L${pt(m(bi))}" stroke="${seamStroke}" stroke-opacity="0.45" stroke-width="2.5"/>`;
          if (v.garment === "blouse") {
            const btn = add(add(C, scl(dir, -spec.cuffBand / 2)), scl(nrm, spec.cuff * 0.45));
            details += button(m(btn), color, 6);
          }
        } else if (v.garment === "tshirt") {
          const hemLine = add(C, scl(dir, -16));
          details += `<path d="M${pt(m(add(hemLine, scl(nrm, spec.cuff))))} L${pt(m(add(hemLine, scl(nrm, -spec.cuff))))}" stroke="${seamStroke}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="7 5"/>`;
        }
      }
      silhouette.push(sleeve);
      maxX = Math.max(maxX, Math.abs(m(O).x) + 10, Math.abs(m(I).x) + 10);
    }
  }

  // Torso with neckline.
  const neckline = (() => {
    const nd = d.neckDepth;
    if (view === "front" && v.neckline === "v") return `L0 ${nd} L${f(-d.nw)} 0`;
    return `Q${f(d.nw * 0.72)} ${f(nd * 1.04)} 0 ${f(nd)} Q${f(-d.nw * 0.72)} ${f(nd * 1.04)} ${f(-d.nw)} 0`;
  })();
  const sideR = `L${pt(A)} Q${pt(P(Wst.x - 6, Wst.y - 60))} ${pt(Wst)} Q${pt(P(Hm.x - 4, (Wst.y + Hm.y) / 2))} ${pt(Hm)}`;
  const hemCurve = `Q0 ${f(d.hy + 14)} ${f(-Hm.x)} ${f(Hm.y)}`;
  const sideL = `Q${pt(P(-Hm.x + 4, (Wst.y + Hm.y) / 2))} ${pt(mirror(Wst))} Q${pt(P(-Wst.x + 6, Wst.y - 60))} ${pt(mirror(A))}`;
  const torso =
    v.sleeve === "sleeveless"
      ? `M${pt(N)} L${pt(P(d.sw * 0.66, 18))} Q${pt(P(d.sw * 0.62, d.ay * 0.75))} ${pt(A)} ${sideR.replace(`L${pt(A)} `, "")} ${hemCurve} ${sideL} Q${pt(P(-d.sw * 0.62, d.ay * 0.75))} ${pt(P(-d.sw * 0.66, 18))} L${f(-d.nw)} 0 ${reverseNeck()}`
      : `M${pt(N)} L${pt(S)} ${sideR} ${hemCurve} ${sideL} L${pt(mirror(S))} L${f(-d.nw)} 0 ${reverseNeck()}`;
  function reverseNeck() {
    // Neckline from the left neck point back to the right neck point.
    const nd = d.neckDepth;
    if (view === "front" && v.neckline === "v") return `L0 ${nd} Z`;
    return `Q${f(-d.nw * 0.72)} ${f(nd * 1.04)} 0 ${f(nd)} Q${f(d.nw * 0.72)} ${f(nd * 1.04)} ${f(d.nw)} 0 Z`;
  }
  silhouette.push(torso);
  void neckline;

  // Neck interior (the inside of the back panel, visible in front view).
  const interior = shade(color, dark ? 0.3 : 0.32);
  if (view === "front") {
    const nd = d.neckDepth;
    const neckPath =
      v.neckline === "v"
        ? `M${f(-d.nw)} 0 Q0 -26 ${f(d.nw)} 0 L0 ${nd} Z`
        : `M${f(-d.nw)} 0 Q0 -26 ${f(d.nw)} 0 Q${f(d.nw * 0.72)} ${f(nd * 1.04)} 0 ${f(nd)} Q${f(-d.nw * 0.72)} ${f(nd * 1.04)} ${f(-d.nw)} 0 Z`;
    inner += `<path d="${neckPath}" fill="${interior}"/>`;
    inner += `<path d="M${f(-d.nw + 6)} -2 Q0 -22 ${f(d.nw - 6)} -2" stroke="${shade(color, 0.45)}" stroke-width="6" fill="none" stroke-opacity="0.6"/>`;
  } else {
    inner += `<path d="M${f(-d.nw)} 0 Q0 -18 ${f(d.nw)} 0 Q0 ${f(d.neckDepth)} ${f(-d.nw)} 0 Z" fill="${interior}" opacity="0.65"/>`;
  }

  // Neckline treatments.
  const nd = d.neckDepth;
  const crewCurve = `M${f(d.nw)} 0 Q${f(d.nw * 0.72)} ${f(nd * 1.04)} 0 ${f(nd)} Q${f(-d.nw * 0.72)} ${f(nd * 1.04)} ${f(-d.nw)} 0`;
  if (v.neckline === "crew" || v.neckline === "boat") {
    details += `<path d="${crewCurve}" stroke="${shade(color, 0.07)}" stroke-width="16" fill="none"/>`;
    details += `<path d="${crewCurve}" stroke="${seamStroke}" stroke-opacity="0.35" stroke-width="2" fill="none" transform="translate(0 10)"/>`;
  } else if (v.neckline === "v" && view === "front" && v.garment !== "manteau") {
    details += `<path d="M${f(d.nw)} 0 L0 ${nd} L${f(-d.nw)} 0" stroke="${shade(color, 0.07)}" stroke-width="14" fill="none" stroke-linejoin="round"/>`;
  } else if (v.neckline === "turtle") {
    const t = `M${f(-d.nw - 6)} -82 L${f(d.nw + 6)} -82 L${f(d.nw + 12)} 10 Q0 24 ${f(-d.nw - 12)} 10 Z`;
    silhouette.push(t);
    details += `<path d="${t}" fill="${shade(color, 0.03)}"/>`;
    details += `<ellipse cx="0" cy="-82" rx="${d.nw + 6}" ry="12" fill="${interior}"/>`;
    for (const y of [-56, -30, -6]) {
      details += `<path d="M${f(-d.nw - 8)} ${y} Q0 ${y + 10} ${f(d.nw + 8)} ${y}" stroke="#000" stroke-opacity="0.12" stroke-width="5" fill="none"/>`;
    }
  } else if (v.neckline === "mandarin") {
    const band = `M${f(-d.nw - 3)} -26 Q0 6 ${f(d.nw + 3)} -26 L${f(d.nw)} 2 Q0 ${f(nd + 4)} ${f(-d.nw)} 2 Z`;
    details += `<path d="${band}" fill="${shade(color, 0.05)}" stroke="${seamStroke}" stroke-opacity="0.4" stroke-width="2"/>`;
    if (view === "front") details += `<path d="M0 ${f(nd - 22)} L0 ${f(nd + 4)}" stroke="${interior}" stroke-width="4"/>`;
  } else if (v.neckline === "collar") {
    if (view === "front") {
      details += `<path d="M${f(-d.nw - 6)} 6 Q0 -34 ${f(d.nw + 6)} 6 L${f(d.nw - 4)} 14 Q0 -16 ${f(-d.nw + 4)} 14 Z" fill="${shade(color, 0.12)}"/>`;
      const leaf = (s: number) => {
        const q = (x: number, y: number) => P(s * x, y);
        return `M${pt(q(4, 44))} L${pt(q(d.nw + 2, -12))} Q${pt(q(d.nw + 30, -4))} ${pt(q(d.nw + 42, 30))} L${pt(q(54, 124))} Z`;
      };
      for (const s of [1, -1]) {
        details += `<path d="${leaf(s)}" fill="${tint(color, dark ? 0.06 : 0.05)}" stroke="${seamStroke}" stroke-opacity="0.45" stroke-width="2.2" stroke-linejoin="round"/>`;
        details += `<path d="${leaf(s)}" fill="none" stroke="#000" stroke-opacity="0.08" stroke-width="8" transform="translate(${s * 3} 5)"/>`;
      }
    } else {
      details += `<path d="M${f(-d.nw - 40)} 34 Q0 8 ${f(d.nw + 40)} 34 L${f(d.nw + 30)} -12 Q0 -32 ${f(-d.nw - 30)} -12 Z" fill="${tint(color, 0.04)}" stroke="${seamStroke}" stroke-opacity="0.45" stroke-width="2.2"/>`;
    }
  } else if (v.neckline === "bow" && view === "front") {
    details += `<path d="${crewCurve}" stroke="${shade(color, 0.07)}" stroke-width="12" fill="none"/>`;
    const tails = `M-8 66 Q-30 170 -62 268 L-30 276 Q-6 180 6 70 Z M8 66 Q20 170 34 300 L62 292 Q40 170 18 64 Z`;
    details += `<path d="${tails}" fill="${tint(color, 0.04)}" stroke="${seamStroke}" stroke-opacity="0.4" stroke-width="2"/>`;
    details += `<ellipse cx="-42" cy="52" rx="48" ry="24" transform="rotate(-14 -42 52)" fill="${tint(color, 0.05)}" stroke="${seamStroke}" stroke-opacity="0.4" stroke-width="2"/>`;
    details += `<ellipse cx="42" cy="52" rx="48" ry="24" transform="rotate(14 42 52)" fill="${tint(color, 0.05)}" stroke="${seamStroke}" stroke-opacity="0.4" stroke-width="2"/>`;
    details += `<rect x="-16" y="36" width="32" height="34" rx="9" fill="${shade(color, 0.06)}" stroke="${seamStroke}" stroke-opacity="0.4" stroke-width="2"/>`;
  }

  // Closures and front details.
  if (view === "front") {
    const startY = v.neckline === "collar" ? 46 : v.neckline === "mandarin" ? nd + 4 : nd;
    if (v.closure === "buttons") {
      details += `<path d="M-17 ${f(startY)} L-17 ${f(d.hy + 8)} M17 ${f(startY)} L17 ${f(d.hy + 8)}" stroke="${seamStroke}" stroke-opacity="0.35" stroke-width="2"/>`;
      const step = v.garment === "manteau" ? 104 : 86;
      for (let y = startY + 36; y < d.hy - 50; y += step) details += button(P(0, y), color, v.garment === "manteau" ? 11 : 8.5);
    } else if (v.closure === "hidden") {
      details += `<path d="M14 ${f(startY)} L14 ${f(d.hy + 6)}" stroke="${seamStroke}" stroke-opacity="0.4" stroke-width="2" stroke-dasharray="8 6"/>`;
      details += `<path d="M0 ${f(startY)} L0 ${f(d.hy + 8)}" stroke="#000" stroke-opacity="0.1" stroke-width="3"/>`;
    } else if (v.closure === "open") {
      inner += `<path d="M-24 ${f(nd)} L24 ${f(nd)} L70 ${f(d.hy + 8)} L-70 ${f(d.hy + 8)} Z" fill="${interior}"/>`;
      for (const s of [1, -1]) {
        const lapel = `M${f(s * d.nw)} -4 L${f(s * (d.nw + 46))} 12 L${f(s * 66)} ${f(nd + 30)} L${f(s * 24)} ${f(nd)} Z`;
        details += `<path d="${lapel}" fill="${tint(color, 0.05)}" stroke="${seamStroke}" stroke-opacity="0.45" stroke-width="2.2" stroke-linejoin="round"/>`;
        details += `<path d="M${f(s * 24)} ${f(nd)} L${f(s * 70)} ${f(d.hy + 8)}" stroke="#000" stroke-opacity="0.18" stroke-width="5"/>`;
      }
    } else if (v.closure === "double") {
      for (const s of [1, -1]) {
        const lapel = `M${f(s * d.nw)} -6 L${f(s * (d.nw + 64))} 24 L${f(s * (d.nw + 40))} 70 L${f(s * (d.nw + 70))} 92 L${f(s * 70)} ${f(nd + 10)} L${f(s * 4)} ${f(nd - 10)} Z`;
        details += `<path d="${lapel}" fill="${tint(color, 0.05)}" stroke="${seamStroke}" stroke-opacity="0.5" stroke-width="2.2" stroke-linejoin="round"/>`;
      }
      details += `<path d="M-98 ${f(nd)} L-98 ${f(d.hy + 8)}" stroke="#000" stroke-opacity="0.2" stroke-width="4"/>`;
      details += `<path d="M40 30 L190 64 L182 214 L70 196 Z" fill="none" stroke="${seamStroke}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="7 5"/>`;
      for (const y of [nd + 40, nd + 130, d.wy + 120, d.wy + 220]) {
        details += button(P(-62, y), color, 11) + button(P(62, y), color, 11);
      }
      for (const s of [1, -1]) {
        details += `<path d="M${f(s * (d.nw + 30))} ${f(d.shoulderDrop * 0.5 - 4)} L${f(s * (d.sw - 6))} ${f(d.shoulderDrop - 10)} L${f(s * (d.sw - 4))} ${f(d.shoulderDrop + 14)} L${f(s * (d.nw + 32))} ${f(d.shoulderDrop * 0.5 + 18)} Z" fill="${shade(color, 0.05)}" stroke="${seamStroke}" stroke-opacity="0.4" stroke-width="2"/>`;
        details += button(P(s * (d.nw + 46), d.shoulderDrop * 0.5 + 8), color, 6);
      }
    } else if (v.closure === "wrap") {
      details += `<path d="M${f(-d.nw)} 0 Q40 ${f(d.wy * 0.6)} ${f(d.wx)} ${f(d.wy + 20)}" stroke="#000" stroke-opacity="0.2" stroke-width="4" fill="none"/>`;
    }
  }

  if (v.closure === "belt" || v.closure === "double") {
    const by = d.wy + 10;
    details += `<path d="M${f(-d.wx - 6)} ${f(by - 22)} L${f(d.wx + 6)} ${f(by - 22)} L${f(d.wx + 6)} ${f(by + 22)} L${f(-d.wx - 6)} ${f(by + 22)} Z" fill="${shade(color, 0.06)}" stroke="${seamStroke}" stroke-opacity="0.4" stroke-width="2"/>`;
    if (view === "front") {
      details += `<path d="M-12 ${f(by + 16)} Q-24 ${f(by + 120)} -44 ${f(by + 230)} L-10 ${f(by + 236)} Q0 ${f(by + 120)} 4 ${f(by + 18)} Z M10 ${f(by + 16)} Q22 ${f(by + 110)} 30 ${f(by + 200)} L60 ${f(by + 194)} Q40 ${f(by + 110)} 22 ${f(by + 14)} Z" fill="${shade(color, 0.04)}" stroke="${seamStroke}" stroke-opacity="0.4" stroke-width="2"/>`;
      details += `<rect x="-28" y="${f(by - 28)}" width="56" height="56" rx="12" fill="${shade(color, 0.09)}" stroke="${seamStroke}" stroke-opacity="0.45" stroke-width="2"/>`;
    }
  }

  if (v.pockets && view === "front") {
    if (v.garment === "manteau") {
      const patch = v.neckline === "collar" && v.closure === "buttons";
      for (const s of [1, -1]) {
        if (patch) {
          const x0 = s * 70;
          const x1 = s * 190;
          details += `<path d="M${x0} ${d.wy + 90} L${x1} ${d.wy + 90} L${x1} ${d.wy + 250} Q${(x0 + x1) / 2} ${d.wy + 266} ${x0} ${d.wy + 250} Z" fill="none" stroke="${seamStroke}" stroke-opacity="0.45" stroke-width="2.2" stroke-dasharray="8 5"/>`;
        } else {
          details += `<path d="M${f(s * (d.wx - 46))} ${d.wy + 100} L${f(s * (d.wx - 4))} ${d.wy + 236}" stroke="#000" stroke-opacity="0.22" stroke-width="4"/>`;
        }
      }
    } else {
      details += `<path d="M58 118 L142 118 L142 206 Q100 216 58 206 Z" fill="none" stroke="${seamStroke}" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="6 4"/>`;
    }
  }

  // Back-view construction lines.
  if (view === "back") {
    if (v.garment === "manteau") details += `<path d="M0 ${nd} L0 ${f(d.hy + 10)}" stroke="#000" stroke-opacity="0.16" stroke-width="3"/>`;
    if (v.garment === "blouse") details += `<path d="M${f(-d.sw + 20)} 110 Q0 124 ${f(d.sw - 20)} 110" stroke="${seamStroke}" stroke-opacity="0.35" stroke-width="2" fill="none"/>`;
  }

  // Hem stitching.
  details += `<path d="M${f(-Hm.x + 6)} ${f(Hm.y - 18)} Q0 ${f(d.hy - 4)} ${f(Hm.x - 6)} ${f(Hm.y - 18)}" stroke="${seamStroke}" stroke-opacity="0.32" stroke-width="2" stroke-dasharray="8 6" fill="none"/>`;

  // Soft drape folds: wide, heavily blurred strokes read as fabric volume.
  const r = prng(hash(JSON.stringify(v)));
  const fold = (dPath: string, o: number, w: number) =>
    `<path d="${dPath}" stroke="#000" stroke-opacity="${f(o)}" stroke-width="${f(w)}" fill="none"/>`;
  const glow = (dPath: string, o: number, w: number) =>
    `<path d="${dPath}" stroke="#fff" stroke-opacity="${f(o)}" stroke-width="${f(w)}" fill="none"/>`;
  const hi = dark ? 0.09 : 0.12;
  if (v.fit !== "oversize" && v.fit !== "boxy") {
    for (const s of [1, -1]) {
      folds += fold(`M${f(s * (A.x - 24))} ${f(A.y + 30)} Q${f(s * (A.x - 70))} ${f(d.wy - 50)} ${f(s * (A.x - 105))} ${f(d.wy + 10)}`, 0.07, 26);
      folds += glow(`M${f(s * (A.x - 54))} ${f(A.y + 40)} Q${f(s * (A.x - 96))} ${f(d.wy - 60)} ${f(s * (A.x - 132))} ${f(d.wy - 10)}`, hi * 0.7, 18);
    }
  }
  // Chest highlight on the lit side.
  folds += glow(`M${f(d.sw * 0.35)} ${f(d.ay * 0.55)} Q${f(d.sw * 0.45)} ${f(d.wy * 0.8)} ${f(d.wx * 0.4)} ${f(d.wy + 60)}`, hi, 60);
  const foldCount = v.garment === "manteau" ? 5 : 4;
  for (let i = 0; i < foldCount; i++) {
    const x = -Hm.x + 40 + ((2 * Hm.x - 80) * (i + 0.5 + (r() - 0.5) * 0.4)) / foldCount;
    const len = v.garment === "manteau" ? 320 + r() * 300 : 140 + r() * 120;
    const bend = (r() - 0.5) * 36;
    folds += fold(`M${f(x)} ${f(d.hy - len)} Q${f(x + bend)} ${f(d.hy - len / 2)} ${f(x + bend * 0.6)} ${f(d.hy + 6)}`, 0.045 + r() * 0.035, 22 + r() * 14);
    folds += glow(`M${f(x + 26)} ${f(d.hy - len * 0.85)} Q${f(x + 26 + bend)} ${f(d.hy - len / 2)} ${f(x + 28)} ${f(d.hy)}`, hi * 0.6, 16);
  }

  return {
    silhouette,
    inner,
    details,
    folds,
    bbox: { minX: -maxX, maxX, minY: v.neckline === "turtle" ? -90 : -36, maxY: d.hy + 16 },
    waistY: d.wy,
    hemY: d.hy,
    neckWidth: d.nw,
  };
}

function button(p: Pt, color: string, r: number) {
  const light = luminance(color) > 0.35;
  const fill = light ? shade(color, 0.16) : tint(color, 0.22);
  return `<g><circle cx="${f(p.x)}" cy="${f(p.y)}" r="${r}" fill="${fill}" stroke="#000" stroke-opacity="0.3" stroke-width="1.5"/><circle cx="${f(p.x - r * 0.3)}" cy="${f(p.y)}" r="${f(r * 0.16)}" fill="#000" fill-opacity="0.35"/><circle cx="${f(p.x + r * 0.3)}" cy="${f(p.y)}" r="${f(r * 0.16)}" fill="#000" fill-opacity="0.35"/></g>`;
}

function patternDefs(id: string, v: GarmentVisual, color: string) {
  const dark = luminance(color) < 0.15;
  const contrast = dark ? "#efe7da" : mix(color, "#273149", 0.7);
  switch (v.pattern) {
    case "stripe":
      return v.garment === "tshirt"
        ? `<pattern id="${id}" width="40" height="36" patternUnits="userSpaceOnUse"><rect width="40" height="13" fill="${contrast}"/></pattern>`
        : `<pattern id="${id}" width="26" height="40" patternUnits="userSpaceOnUse"><rect width="6" height="40" fill="${contrast}" fill-opacity="0.85"/></pattern>`;
    case "floral": {
      const petal = dark ? "#e9dccd" : "#c78c84";
      const leaf = dark ? "#9aa58f" : "#8c9a7e";
      const flower = (cx: number, cy: number, s: number) =>
        [0, 72, 144, 216, 288]
          .map((a) => {
            const rad = (a * Math.PI) / 180;
            return `<circle cx="${f(cx + Math.cos(rad) * 7 * s)}" cy="${f(cy + Math.sin(rad) * 7 * s)}" r="${f(6 * s)}" fill="${petal}"/>`;
          })
          .join("") + `<circle cx="${cx}" cy="${cy}" r="${f(3.6 * s)}" fill="${shade(petal, 0.3)}"/>`;
      return `<pattern id="${id}" width="120" height="120" patternUnits="userSpaceOnUse">${flower(28, 32, 1)}${flower(88, 92, 0.8)}<ellipse cx="52" cy="40" rx="10" ry="4" transform="rotate(-30 52 40)" fill="${leaf}"/><ellipse cx="64" cy="98" rx="9" ry="3.5" transform="rotate(25 64 98)" fill="${leaf}"/><circle cx="96" cy="26" r="3" fill="${petal}"/></pattern>`;
    }
    case "dots":
      return `<pattern id="${id}" width="64" height="64" patternUnits="userSpaceOnUse"><circle cx="16" cy="16" r="5" fill="${dark ? tint(color, 0.7) : shade(color, 0.42)}"/><circle cx="48" cy="48" r="5" fill="${dark ? tint(color, 0.7) : shade(color, 0.42)}"/></pattern>`;
    case "rib":
      return `<pattern id="${id}" width="9" height="20" patternUnits="userSpaceOnUse"><rect width="3" height="20" fill="#000" fill-opacity="0.09"/><rect x="5" width="1.5" height="20" fill="#fff" fill-opacity="0.07"/></pattern>`;
    default:
      return "";
  }
}

/** Renders a garment group in local coordinates (centred at 0, neck at 0). */
function garmentGroup(uid: string, v: GarmentVisual, color: string, view: "front" | "back", opts: { hanger?: boolean; shadow?: Pt } = {}) {
  const g = drawGarment(v, color, view);
  const sil = g.silhouette.map((d) => `<path d="${d}"/>`).join("");
  const pat = patternDefs(`${uid}-pat`, v, color);
  const melange = v.pattern === "melange";
  const shadow = opts.shadow ?? P(-16, 22);
  const hanger = opts.hanger
    ? `<path d="M0 -14 L0 -66 C0 -100 34 -104 36 -80" stroke="#2c2a27" stroke-width="5" fill="none" stroke-linecap="round"/>`
    : "";
  const hangerBar = opts.hanger
    ? `<path d="M${f(-g.neckWidth * 0.8)} -4 Q0 -24 ${f(g.neckWidth * 0.8)} -4" stroke="#9b7652" stroke-width="10" fill="none" stroke-linecap="round"/>`
    : "";
  const markup = `
    <defs>
      <clipPath id="${uid}-clip">${sil}</clipPath>
      <filter id="${uid}-blur" filterUnits="userSpaceOnUse" x="-1200" y="-1200" width="2400" height="3600"><feGaussianBlur stdDeviation="15"/></filter>
      <filter id="${uid}-shadow" filterUnits="userSpaceOnUse" x="-1200" y="-1200" width="2400" height="3600"><feGaussianBlur stdDeviation="20"/></filter>
      <filter id="${uid}-tex" filterUnits="userSpaceOnUse" x="-800" y="-200" width="1600" height="1600">
        <feTurbulence type="fractalNoise" baseFrequency="${melange ? 1.1 : 0.7}" numOctaves="${melange ? 1 : 3}" seed="${hash(uid) % 97}"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <linearGradient id="${uid}-v" x1="0" y1="${g.bbox.minY}" x2="0" y2="${g.bbox.maxY}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#fff" stop-opacity="0.16"/>
        <stop offset="0.45" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity="0.16"/>
      </linearGradient>
      <linearGradient id="${uid}-h" x1="${g.bbox.minX}" y1="0" x2="${g.bbox.maxX}" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#000" stop-opacity="0.2"/>
        <stop offset="0.3" stop-color="#000" stop-opacity="0"/>
        <stop offset="0.62" stop-color="#fff" stop-opacity="0.1"/>
        <stop offset="1" stop-color="#000" stop-opacity="0.12"/>
      </linearGradient>
      ${pat}
    </defs>
    ${hanger}
    <g transform="translate(${shadow.x} ${shadow.y})" fill="#3b2b1c" opacity="0.26" filter="url(#${uid}-shadow)">${sil}</g>
    <g fill="${color}">${sil}</g>
    <g clip-path="url(#${uid}-clip)">
      ${pat ? `<rect x="-800" y="-200" width="1600" height="1600" fill="url(#${uid}-pat)"/>` : ""}
      <rect x="-800" y="-200" width="1600" height="1600" filter="url(#${uid}-tex)" opacity="${melange ? 0.2 : 0.075}"/>
      <rect x="-800" y="-200" width="1600" height="1600" fill="url(#${uid}-v)"/>
      <rect x="-800" y="-200" width="1600" height="1600" fill="url(#${uid}-h)"/>
      <g filter="url(#${uid}-blur)" fill="none" stroke-linecap="round">${g.folds}</g>
    </g>
    ${g.inner}
    ${hangerBar}
    ${g.details}
    <g fill="none" stroke="#000" stroke-opacity="0.14" stroke-width="2">${sil}</g>`;
  return { markup, drawing: g };
}

// ───────────────────────────── scenes ─────────────────────────────

function productSvg(uid: string, v: GarmentVisual, color: string, view: "front" | "back" | "detail", backdrop: Backdrop) {
  const garmentView = view === "back" ? "back" : "front";
  const { markup, drawing } = garmentGroup(uid, v, color, garmentView);
  const bw = drawing.bbox.maxX - drawing.bbox.minX;
  const bh = drawing.bbox.maxY - drawing.bbox.minY;
  const base = Math.min((H * 0.8) / bh, (W * 0.8) / bw);
  let transform: string;
  if (view === "detail") {
    const zoom = 2.5;
    const focusY = v.pattern && v.pattern !== "solid" ? 220 : v.closure === "belt" ? drawing.waistY - 40 : 110;
    const s = base * zoom;
    transform = `translate(${W / 2 - 40} ${f(H / 2 - focusY * s)}) scale(${f(s * 100) / 100})`;
  } else {
    const s = base;
    const top = (H - bh * s) / 2 - drawing.bbox.minY * s + 10;
    transform = `translate(${W / 2} ${f(top)}) scale(${f(s * 1000) / 1000})`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>${GRAIN}</defs>
    ${studioBackground(uid + "-bg", W, H, backdrop)}
    <g transform="${transform}">${markup}</g>
    <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.045"/>
  </svg>`;
}

function archBackdrop(width: number, height: number, x: number, y: number, w: number, color: string) {
  const r = w / 2;
  return `<path d="M${x} ${height} L${x} ${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} L${x + w} ${height} Z" fill="${color}"/>`;
}

function categorySvg(slug: string, v: GarmentVisual, color: string, backdrop: Backdrop) {
  const uid = `cat-${slug}`;
  const { markup, drawing } = garmentGroup(uid, v, color, "front");
  const bw = drawing.bbox.maxX - drawing.bbox.minX;
  const bh = drawing.bbox.maxY - drawing.bbox.minY;
  const s = Math.min((H * 0.7) / bh, (W * 0.74) / bw);
  const top = H * 0.2 - drawing.bbox.minY * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>${GRAIN}</defs>
    ${studioBackground(uid + "-bg", W, H, backdrop)}
    ${archBackdrop(W, H, 170, 150, 860, backdrop.arch)}
    <rect y="${H - 190}" width="${W}" height="190" fill="${shade(backdrop.bottom, 0.05)}"/>
    <g transform="translate(${W / 2} ${f(top)}) scale(${f(s * 1000) / 1000})">${markup}</g>
    <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.045"/>
  </svg>`;
}

interface RailGarment {
  visual: GarmentVisual;
  color: string;
  x: number;
  scale: number;
  view?: "front" | "back";
}

function leafShadows(seed: number, originX: number, originY: number, scale: number, mirrorX = false) {
  const r = prng(seed);
  let out = "";
  for (let b = 0; b < 4; b++) {
    // Branches fall diagonally into the frame from the light source corner.
    const angle = mirrorX ? 55 - b * 14 - r() * 10 : 125 + b * 14 + r() * 10;
    const len = (420 + r() * 260) * scale;
    const rad = (angle * Math.PI) / 180;
    const ex = originX + Math.cos(rad) * len;
    const ey = originY + Math.sin(rad) * len;
    const cx = (originX + ex) / 2 + (r() - 0.5) * 120 * scale;
    const cy = (originY + ey) / 2 + (r() - 0.5) * 120 * scale;
    out += `<path d="M${f(originX)} ${f(originY)} Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}" stroke="#3a3026" stroke-width="${f(5 * scale)}" fill="none"/>`;
    const leaves = 9 + Math.floor(r() * 5);
    for (let i = 1; i <= leaves; i++) {
      const t = i / (leaves + 1);
      const x = (1 - t) * (1 - t) * originX + 2 * (1 - t) * t * cx + t * t * ex;
      const y = (1 - t) * (1 - t) * originY + 2 * (1 - t) * t * cy + t * t * ey;
      const dx = 2 * (1 - t) * (cx - originX) + 2 * t * (ex - cx);
      const dy = 2 * (1 - t) * (cy - originY) + 2 * t * (ey - cy);
      const base = (Math.atan2(dy, dx) * 180) / Math.PI;
      const side = i % 2 === 0 ? 1 : -1;
      const rot = base + side * (38 + r() * 18);
      const lx = x + Math.cos((rot * Math.PI) / 180) * 30 * scale;
      const ly = y + Math.sin((rot * Math.PI) / 180) * 30 * scale;
      out += `<ellipse cx="${f(lx)}" cy="${f(ly)}" rx="${f((44 + r() * 16) * scale)}" ry="${f((13 + r() * 5) * scale)}" transform="rotate(${f(rot)} ${f(lx)} ${f(ly)})" fill="#3a3026"/>`;
    }
  }
  return out;
}

function vase(x: number, floorY: number, s: number) {
  const body = `M${-46 * s} 0 C${-84 * s} ${-44 * s} ${-74 * s} ${-140 * s} ${-28 * s} ${-170 * s} L${-22 * s} ${-214 * s} L${22 * s} ${-214 * s} L${28 * s} ${-170 * s} C${74 * s} ${-140 * s} ${84 * s} ${-44 * s} ${46 * s} 0 Z`;
  const r = prng(77);
  let stems = "";
  for (let i = 0; i < 5; i++) {
    const ex = (-120 + i * 60 + (r() - 0.5) * 40) * s;
    const ey = (-520 - r() * 220) * s;
    stems += `<path d="M0 ${-200 * s} Q${ex * 0.3} ${ey * 0.6} ${ex} ${ey}" stroke="#7d7458" stroke-width="${3 * s}" fill="none"/>`;
    for (let k = 1; k < 8; k++) {
      const t = k / 8;
      const px = 2 * (1 - t) * t * ex * 0.3 + t * t * ex;
      const py = (1 - t) * (1 - t) * -200 * s + 2 * (1 - t) * t * ey * 0.6 + t * t * ey;
      const rot = (k % 2 ? -1 : 1) * (40 + r() * 20) - 80;
      stems += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(22 * s)}" ry="${f(6 * s)}" transform="rotate(${f(rot)} ${f(px)} ${f(py)})" fill="#8b8763" opacity="0.92"/>`;
    }
  }
  return `<g transform="translate(${x} ${floorY})">
    <ellipse cx="${-10 * s}" cy="${4 * s}" rx="${90 * s}" ry="${14 * s}" fill="#3b2b1c" opacity="0.14"/>
    ${stems}
    <path d="${body}" fill="#cdbca6"/>
    <path d="${body}" fill="url(#vase-light)"/>
  </g>`;
}

function railScene(opts: {
  id: string;
  width: number;
  height: number;
  railY: number;
  railX: [number, number];
  floorY: number;
  garments: RailGarment[];
  leafOrigin?: Pt;
  leafScale?: number;
  leafMirror?: boolean;
  vaseAt?: { x: number; scale: number };
  wall?: [string, string];
}) {
  const { id, width, height, railY, railX, floorY } = opts;
  const wall = opts.wall ?? ["#efe7dc", "#e3d7c7"];
  const garments = opts.garments
    .map((g, i) => {
      const { markup } = garmentGroup(`${id}-g${i}`, g.visual, g.color, g.view ?? "front", { hanger: true, shadow: P(-26, 30) });
      return `<g transform="translate(${g.x} ${railY + 80 * g.scale}) scale(${g.scale})">${markup}</g>`;
    })
    .join("");
  const leaf = opts.leafOrigin
    ? `<g opacity="0.13" filter="url(#${id}-leafblur)">${leafShadows(11, opts.leafOrigin.x, opts.leafOrigin.y, opts.leafScale ?? 1, opts.leafMirror)}</g>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      ${GRAIN}
      <linearGradient id="${id}-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${wall[0]}"/><stop offset="1" stop-color="${wall[1]}"/></linearGradient>
      <linearGradient id="${id}-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9cbb8"/><stop offset="1" stop-color="#cfbfaa"/></linearGradient>
      <radialGradient id="${id}-sun" cx="0.78" cy="0.18" r="0.7"><stop offset="0" stop-color="#fffaf2" stop-opacity="0.85"/><stop offset="1" stop-color="#fffaf2" stop-opacity="0"/></radialGradient>
      <linearGradient id="vase-light" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.18"/><stop offset="0.6" stop-color="#fff" stop-opacity="0.18"/><stop offset="1" stop-color="#000" stop-opacity="0.12"/></linearGradient>
      <filter id="${id}-leafblur" filterUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}"><feGaussianBlur stdDeviation="${f(10 * (opts.leafScale ?? 1))}"/></filter>
      <filter id="${id}-soft" filterUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}"><feGaussianBlur stdDeviation="40"/></filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id}-wall)"/>
    <rect width="${width}" height="${height}" fill="url(#${id}-sun)"/>
    <path d="M${f(width * 0.56)} 0 L${f(width * 0.86)} 0 L${f(width * 0.98)} ${f(floorY)} L${f(width * 0.62)} ${f(floorY)} Z" fill="#fffaf3" opacity="0.32" filter="url(#${id}-soft)"/>
    ${leaf}
    <rect y="${floorY}" width="${width}" height="${height - floorY}" fill="url(#${id}-floor)"/>
    <rect y="${floorY}" width="${width}" height="3" fill="#bfae98" opacity="0.55"/>
    <g stroke="#2b2926" stroke-linecap="round">
      <path d="M${railX[0]} ${railY} L${railX[1]} ${railY}" stroke-width="7"/>
      <path d="M${railX[0]} ${railY} L${railX[0]} ${floorY + 30}" stroke-width="7"/>
      <path d="M${railX[1]} ${railY} L${railX[1]} ${floorY + 30}" stroke-width="7"/>
      <path d="M${railX[0] - 50} ${floorY + 30} L${railX[0] + 50} ${floorY + 30}" stroke-width="7"/>
      <path d="M${railX[1] - 50} ${floorY + 30} L${railX[1] + 50} ${floorY + 30}" stroke-width="7"/>
    </g>
    <ellipse cx="${(railX[0] + railX[1]) / 2 - 30}" cy="${floorY + 34}" rx="${(railX[1] - railX[0]) / 2 + 60}" ry="18" fill="#3b2b1c" opacity="0.1"/>
    ${garments}
    ${opts.vaseAt ? vase(opts.vaseAt.x, floorY + 34, opts.vaseAt.scale) : ""}
    <rect width="${width}" height="${height}" filter="url(#grain)" opacity="0.04"/>
  </svg>`;
}

// ───────────────────────────── output ─────────────────────────────

async function writeImage(svg: string, file: string, quality = 84) {
  await mkdir(path.dirname(file), { recursive: true });
  const img = sharp(Buffer.from(svg), { density: 72 });
  if (file.endsWith(".jpg")) await img.jpeg({ quality, mozjpeg: true }).toFile(file);
  else await img.webp({ quality, effort: 5, smartSubsample: true }).toFile(file);
}

async function runPool<T>(items: T[], size: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const item = items[i++];
        await fn(item);
      }
    }),
  );
}

const visualOf = (slug: string) => PRODUCT_DEFINITIONS.find((p) => p.slug === slug)!.visual;

async function main() {
  const started = Date.now();
  const jobs: { file: string; svg: () => string }[] = [];

  PRODUCT_DEFINITIONS.forEach((product: ProductDefinition, index) => {
    if (SCENES_ONLY || (ONLY && !ONLY.some((o) => product.slug.includes(o)))) return;
    for (const key of product.colors) {
      const color = COLORS[key as ColorKey];
      const backdrop = backdropFor(index, color.hex);
      for (const view of ["front", "back", "detail"] as const) {
        jobs.push({
          file: path.join(OUT, "products", product.slug, `${color.id}-${view}.webp`),
          svg: () => productSvg(`${product.slug}-${color.id}-${view}`, product.visual, color.hex, view, backdrop),
        });
      }
    }
  });

  if (!ONLY) {
    const categoryArt: Record<string, { slug: string; color: string; backdrop: Backdrop }> = {
      shomiz: { slug: "shomiz-satin-raha", color: COLORS.cream.hex, backdrop: BACKDROPS[2] },
      manto: { slug: "manto-barani-paeez", color: COLORS.camel.hex, backdrop: BACKDROPS[0] },
      tshirt: { slug: "tshirt-oversize-solo", color: COLORS.sage.hex, backdrop: BACKDROPS[1] },
    };
    for (const c of CATEGORY_DEFINITIONS) {
      const art = categoryArt[c.slug];
      jobs.push({
        file: path.join(OUT, "categories", `${c.slug}.webp`),
        svg: () => categorySvg(c.slug, visualOf(art.slug), art.color, art.backdrop),
      });
    }

    const heroGarments = (layout: "desktop" | "mobile"): RailGarment[] => {
      const items: [string, string][] = [
        ["manto-barani-paeez", COLORS.camel.hex],
        ["shomiz-satin-raha", COLORS.cream.hex],
        ["manto-katan-mahoor", COLORS.olive.hex],
        ["shomiz-papioni-lili", COLORS.white.hex],
        ["manto-mazerati-rose", COLORS.dustyPink.hex],
        ["tshirt-basic-rouzaneh", COLORS.black.hex],
      ];
      if (layout === "desktop") {
        return items.map(([slug, color], i) => ({ visual: visualOf(slug), color, x: 230 + i * 186, scale: 0.6 }));
      }
      return items.slice(0, 4).map(([slug, color], i) => ({ visual: visualOf(slug), color, x: 190 + i * 236, scale: 0.5 }));
    };

    jobs.push({
      file: path.join(OUT, "hero", "hero-desktop.webp"),
      svg: () =>
        railScene({
          id: "hero-d",
          width: 2400,
          height: 1200,
          railY: 150,
          railX: [110, 1340],
          floorY: 1010,
          garments: heroGarments("desktop"),
          leafOrigin: P(2400, -40),
          leafScale: 1.5,
          vaseAt: { x: 1560, scale: 1.25 },
        }),
    });
    jobs.push({
      file: path.join(OUT, "hero", "hero-mobile.webp"),
      svg: () =>
        railScene({
          id: "hero-m",
          width: 1080,
          height: 1350,
          railY: 110,
          railX: [60, 1020],
          floorY: 900,
          garments: heroGarments("mobile"),
          leafOrigin: P(1080, -60),
          leafScale: 1,
        }),
    });
    jobs.push({
      file: path.join(OUT, "editorial", "autumn-collection.webp"),
      svg: () =>
        railScene({
          id: "autumn",
          width: 1200,
          height: 1500,
          railY: 150,
          railX: [100, 1100],
          floorY: 1220,
          wall: ["#ece3d6", "#ddcfbd"],
          garments: [
            { visual: visualOf("manto-jibdar-aram"), color: COLORS.brown.hex, x: 330, scale: 0.72 },
            { visual: visualOf("manto-barani-paeez"), color: COLORS.beige.hex, x: 620, scale: 0.72 },
            { visual: visualOf("manto-kati-elena"), color: COLORS.charcoal.hex, x: 900, scale: 0.72 },
          ],
          leafOrigin: P(0, -40),
          leafMirror: true,
          leafScale: 1.1,
        }),
    });
    jobs.push({
      file: path.join(OUT, "editorial", "about.webp"),
      svg: () =>
        railScene({
          id: "about",
          width: 1200,
          height: 1500,
          railY: 160,
          railX: [120, 1080],
          floorY: 1230,
          wall: ["#f1e9e2", "#e4d4ca"],
          garments: [
            { visual: visualOf("shomiz-linen-nila"), color: COLORS.white.hex, x: 330, scale: 0.8 },
            { visual: visualOf("manto-linen-naroon"), color: COLORS.sage.hex, x: 640, scale: 0.72 },
            { visual: visualOf("tshirt-crop-rib-nava"), color: COLORS.dustyPink.hex, x: 920, scale: 0.8 },
          ],
          vaseAt: { x: 1040, scale: 1 },
        }),
    });
    jobs.push({
      file: path.join(ROOT, "public", "og-image.jpg"),
      svg: () =>
        railScene({
          id: "og",
          width: 1200,
          height: 630,
          railY: 70,
          railX: [60, 760],
          floorY: 540,
          garments: heroGarments("desktop")
            .slice(0, 5)
            .map((g, i) => ({ ...g, x: 150 + i * 132, scale: 0.36 })),
          leafOrigin: P(1200, -40),
          leafScale: 0.8,
          vaseAt: { x: 900, scale: 0.7 },
        }),
    });
  }

  let done = 0;
  await runPool(jobs, Math.max(2, os.cpus().length), async (job) => {
    await writeImage(job.svg(), job.file);
    done++;
    if (done % 40 === 0) console.log(`  ${done}/${jobs.length}`);
  });
  console.log(`Generated ${jobs.length} images in ${((Date.now() - started) / 1000).toFixed(1)}s → ${path.relative(ROOT, OUT)}`);
}

await main();
