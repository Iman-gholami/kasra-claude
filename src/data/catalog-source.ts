/**
 * Raw mock catalog for the demo storefront.
 *
 * This file only uses relative imports with explicit `.ts` extensions (no path
 * aliases) so the placeholder image generator in `scripts/` can import it
 * directly with Node's TypeScript type stripping. The storefront never reads
 * these definitions directly — it goes through `src/lib/catalog`.
 *
 * All names, prices and stock levels are sample data.
 */
import type { SizeSystem } from "../types/catalog";

export type CategorySlug = "shomiz" | "manto" | "tshirt";

export interface ColorDefinition {
  id: string;
  name: string;
  hex: string;
}

export const COLORS = {
  black: { id: "black", name: "مشکی", hex: "#1f1f1f" },
  white: { id: "white", name: "سفید", hex: "#f4f2ec" },
  cream: { id: "cream", name: "کرم", hex: "#ebdfca" },
  beige: { id: "beige", name: "بژ", hex: "#d6c1a3" },
  camel: { id: "camel", name: "شتری", hex: "#b4875c" },
  brown: { id: "brown", name: "قهوه‌ای", hex: "#6b4c38" },
  gray: { id: "gray", name: "طوسی", hex: "#9a9893" },
  charcoal: { id: "charcoal", name: "ذغالی", hex: "#3b3b3d" },
  navy: { id: "navy", name: "سرمه‌ای", hex: "#28324b" },
  olive: { id: "olive", name: "زیتونی", hex: "#6c6a46" },
  sage: { id: "sage", name: "سبز مریمی", hex: "#a5b29c" },
  dustyPink: { id: "dusty-pink", name: "صورتی چرک", hex: "#d3a397" },
  blush: { id: "blush", name: "صورتی روشن", hex: "#eccbc1" },
  sky: { id: "sky", name: "آبی آسمانی", hex: "#a9c1d5" },
  denim: { id: "denim", name: "آبی جین", hex: "#56708f" },
  burgundy: { id: "burgundy", name: "زرشکی", hex: "#6a2832" },
  mustard: { id: "mustard", name: "خردلی", hex: "#c69a45" },
  lilac: { id: "lilac", name: "یاسی", hex: "#b8a6c8" },
} as const satisfies Record<string, ColorDefinition>;

export type ColorKey = keyof typeof COLORS;

export { SIZE_LABELS, SIZE_ORDER } from "./sizes.ts";
import { ALPHA_SIZES, NUMERIC_SIZES } from "./sizes.ts";
export { ALPHA_SIZES, NUMERIC_SIZES };

export interface CategoryDefinition {
  slug: CategorySlug;
  name: string;
  latinName: string;
  tagline: string;
  description: string;
  sizeSystem: SizeSystem;
  searchTerms: string[];
  order: number;
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    slug: "shomiz",
    name: "شومیز",
    latinName: "Blouses",
    tagline: "سبک و روشن، برای هر روز",
    description:
      "شومیزهای ساتن، لینن و کرپ با برش‌های ساده و جزئیات ظریف؛ مناسب محیط کار، دانشگاه و قرارهای روزانه.",
    sizeSystem: "alpha",
    searchTerms: ["شومیز", "بلوز", "پیراهن", "blouse", "shomiz", "shirt"],
    order: 1,
  },
  {
    slug: "manto",
    name: "مانتو",
    latinName: "Manteaus",
    tagline: "خوش‌دوخت، راحت، ماندگار",
    description:
      "مانتوهای کتان، لینن و کرپ در فرم‌های بلند، کیمونویی و کمربنددار؛ طراحی‌شده برای آسودگی در طول روز.",
    sizeSystem: "numeric",
    searchTerms: ["مانتو", "manto", "manteau", "روپوش", "بارانی", "کت"],
    order: 2,
  },
  {
    slug: "tshirt",
    name: "تیشرت",
    latinName: "T-Shirts",
    tagline: "پایه‌ی هر استایل",
    description:
      "تیشرت‌های نخی، ریب و اورسایز در رنگ‌های خنثی؛ پایه‌ای مطمئن برای ست‌کردن با مانتو و شلوار.",
    sizeSystem: "alpha",
    searchTerms: ["تیشرت", "تی شرت", "تی‌شرت", "tshirt", "t-shirt", "tee", "تاپ"],
    order: 3,
  },
];

/** Shape hints for the placeholder illustration generator. */
export interface GarmentVisual {
  garment: "tshirt" | "blouse" | "manteau";
  neckline: "crew" | "v" | "turtle" | "collar" | "bow" | "mandarin" | "boat";
  sleeve: "short" | "long" | "three-quarter" | "puff" | "sleeveless" | "flare" | "kimono" | "elbow";
  length: "crop" | "regular" | "hip" | "knee" | "midi";
  fit: "regular" | "oversize" | "boxy" | "fitted";
  pattern?: "solid" | "stripe" | "floral" | "rib" | "melange" | "dots";
  closure?: "none" | "buttons" | "hidden" | "open" | "double" | "belt" | "wrap";
  pockets?: boolean;
}

/**
 * Stock overrides: a colour key maps to a single number (all sizes) or to a
 * size → units map. Anything not listed falls back to deterministic sample stock.
 */
export type StockOverrides = Partial<Record<ColorKey, number | Record<string, number>>>;

export interface ProductDefinition {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  compareAtPrice?: number;
  colors: ColorKey[];
  sizes?: string[];
  description: string;
  material: string;
  fit?: string;
  care: string[];
  attributes: [label: string, value: string][];
  createdAt: string;
  featured?: boolean;
  tags?: string[];
  stock?: StockOverrides;
  visual: GarmentVisual;
}

const CARE_COTTON = ["شست‌وشو با ماشین در آب سرد تا ۳۰ درجه", "از سفیدکننده استفاده نکنید", "اتو با حرارت متوسط"];
const CARE_DELICATE = ["شست‌وشوی دستی یا برنامه‌ی ظریف‌شویی", "در سایه خشک شود", "اتو از پشت پارچه با حرارت کم"];
const CARE_LINEN = ["شست‌وشو در آب ولرم تا ۴۰ درجه", "پیش از خشک‌شدن کامل اتو شود", "از خشک‌کن استفاده نکنید"];
const CARE_DRY = ["خشک‌شویی توصیه می‌شود", "روی چوب‌لباسی پهن نگهداری شود", "اتو بخار با فاصله"];

export const PRODUCT_DEFINITIONS: ProductDefinition[] = [
  // ───────────────────────────── شومیز ─────────────────────────────
  {
    id: "p-101",
    slug: "shomiz-satin-raha",
    name: "شومیز ساتن یقه‌انگلیسی رها",
    category: "shomiz",
    price: 1_290_000,
    colors: ["cream", "black", "dustyPink"],
    description:
      "شومیز ساتن با یقه‌ی انگلیسی و دکمه‌های صدفی‌رنگ. درخشش ملایم پارچه آن را برای روزهای کاری و مهمانی‌های ساده مناسب می‌کند.",
    material: "ساتن ابریشم‌نما (۱۰۰٪ پلی‌استر)",
    fit: "فرم راسته با سرشانه‌ی استاندارد",
    care: CARE_DELICATE,
    attributes: [["یقه", "انگلیسی"], ["آستین", "بلند با مچ دکمه‌دار"], ["قد", "تا روی باسن"]],
    createdAt: "2026-09-28",
    featured: true,
    tags: ["ساتن", "مجلسی", "اداری"],
    visual: { garment: "blouse", neckline: "collar", sleeve: "long", length: "hip", fit: "regular", closure: "buttons" },
  },
  {
    id: "p-102",
    slug: "shomiz-linen-nila",
    name: "شومیز لینن آستین‌پفی نیلا",
    category: "shomiz",
    price: 1_450_000,
    colors: ["white", "sage", "sky"],
    description:
      "شومیز لینن خنک با آستین‌های پفی کوتاه و یقه‌ی گرد. بافت طبیعی لینن حس سبکی و تازگی را در روزهای گرم حفظ می‌کند.",
    material: "لینن و ویسکوز (۵۵٪ لینن، ۴۵٪ ویسکوز)",
    fit: "کمی گشاد",
    care: CARE_LINEN,
    attributes: [["یقه", "گرد"], ["آستین", "پفی کوتاه"], ["قد", "استاندارد"]],
    createdAt: "2026-10-04",
    featured: true,
    tags: ["لینن", "تابستانه"],
    visual: { garment: "blouse", neckline: "crew", sleeve: "puff", length: "regular", fit: "regular", closure: "none" },
  },
  {
    id: "p-103",
    slug: "shomiz-crepe-ava",
    name: "شومیز کرپ یقه‌گرد آوا",
    category: "shomiz",
    price: 980_000,
    colors: ["black", "navy", "beige", "white"],
    description:
      "شومیزی ساده و همه‌کاره از کرپ نرم با یقه‌ی گرد و دکمه‌ی پشت گردن. انتخابی مطمئن برای ست‌کردن زیر مانتو یا با شلوار پارچه‌ای.",
    material: "کرپ مازراتی (۹۵٪ پلی‌استر، ۵٪ الاستین)",
    fit: "راسته",
    care: CARE_COTTON,
    attributes: [["یقه", "گرد"], ["آستین", "بلند"], ["کشسانی", "کم"]],
    createdAt: "2026-07-12",
    tags: ["کرپ", "بیسیک", "اداری"],
    visual: { garment: "blouse", neckline: "crew", sleeve: "long", length: "regular", fit: "regular", closure: "none" },
  },
  {
    id: "p-104",
    slug: "shomiz-harir-yas",
    name: "شومیز حریر گل‌ریز یاس",
    category: "shomiz",
    price: 1_690_000,
    compareAtPrice: 1_990_000,
    colors: ["cream", "sky"],
    description:
      "شومیز حریر دولایه با طرح گل‌ریز ظریف و یقه‌ی هفت. لایه‌ی آستر داخلی باعث می‌شود پارچه نما نداشته باشد.",
    material: "حریر شیفون با آستر ویسکوز",
    fit: "آزاد",
    care: CARE_DELICATE,
    attributes: [["یقه", "هفت"], ["آستین", "سه‌ربع"], ["طرح", "گل‌ریز"]],
    createdAt: "2026-08-03",
    featured: true,
    tags: ["حریر", "گلدار", "مجلسی"],
    visual: { garment: "blouse", neckline: "v", sleeve: "three-quarter", length: "regular", fit: "regular", pattern: "floral", closure: "none" },
  },
  {
    id: "p-105",
    slug: "shomiz-nakhi-mahtab",
    name: "شومیز نخی راه‌راه مهتاب",
    category: "shomiz",
    price: 1_150_000,
    colors: ["sky", "beige"],
    description:
      "شومیز نخی با راه‌راه‌های باریک عمودی و یقه‌ی پیراهنی. پارچه‌ی پنبه‌ای تنفس‌پذیر و دوخت تمیز جادکمه، آن را به انتخابی روزمره تبدیل کرده است.",
    material: "پنبه‌ی پاپلین (۱۰۰٪ نخ)",
    fit: "راسته",
    care: CARE_COTTON,
    attributes: [["یقه", "پیراهنی"], ["آستین", "بلند"], ["طرح", "راه‌راه عمودی"]],
    createdAt: "2026-06-21",
    tags: ["نخی", "راه‌راه"],
    visual: { garment: "blouse", neckline: "collar", sleeve: "long", length: "hip", fit: "regular", pattern: "stripe", closure: "buttons" },
  },
  {
    id: "p-106",
    slug: "shomiz-oversize-sara",
    name: "شومیز اورسایز پاپلین سارا",
    category: "shomiz",
    price: 1_380_000,
    compareAtPrice: 1_590_000,
    colors: ["white", "blush", "charcoal"],
    sizes: ["S", "M", "L"],
    description:
      "شومیز اورسایز با سرشانه‌ی افتاده و جیب سینه. قد بلندتر از پشت، امکان پوشیدن آزاد یا گره‌زدن جلو را فراهم می‌کند.",
    material: "پاپلین پنبه‌ای (۹۷٪ نخ، ۳٪ الاستین)",
    fit: "اورسایز؛ اگر فرم جذب‌تر می‌خواهید یک سایز کوچک‌تر انتخاب کنید",
    care: CARE_COTTON,
    attributes: [["یقه", "پیراهنی"], ["آستین", "بلند با سرشانه‌ی افتاده"], ["جیب", "یک جیب سینه"]],
    createdAt: "2026-09-10",
    tags: ["اورسایز", "نخی"],
    visual: { garment: "blouse", neckline: "collar", sleeve: "long", length: "hip", fit: "oversize", closure: "buttons", pockets: true },
  },
  {
    id: "p-107",
    slug: "shomiz-crop-termeh",
    name: "شومیز کراپ دکمه‌دار ترمه",
    category: "shomiz",
    price: 1_090_000,
    colors: ["black", "mustard", "cream"],
    sizes: ["S", "M", "L"],
    description:
      "شومیز کوتاه دکمه‌دار با یقه‌ی کوتاه و فرم جمع‌وجور. همراه مناسبی برای شلوارهای فاق‌بلند و دامن‌های بلند.",
    material: "ویسکوز کرپ (۱۰۰٪ ویسکوز)",
    fit: "کراپ، کمی جذب",
    care: CARE_DELICATE,
    attributes: [["یقه", "کوتاه"], ["آستین", "آرنجی"], ["قد", "کراپ"]],
    createdAt: "2026-08-18",
    tags: ["کراپ"],
    visual: { garment: "blouse", neckline: "collar", sleeve: "elbow", length: "crop", fit: "fitted", closure: "buttons" },
  },
  {
    id: "p-108",
    slug: "shomiz-papioni-lili",
    name: "شومیز یقه‌پاپیونی لیلی",
    category: "shomiz",
    price: 1_560_000,
    colors: ["white", "burgundy", "black"],
    description:
      "شومیز ظریف با یقه‌ی پاپیونی قابل گره و آستین‌های بلند. انتخابی رسمی و زنانه برای جلسه‌ها و مراسم.",
    material: "کرپ ژرژت (۱۰۰٪ پلی‌استر)",
    fit: "راسته",
    care: CARE_DELICATE,
    attributes: [["یقه", "پاپیونی"], ["آستین", "بلند با مچ کش‌دار"], ["بستن", "دکمه‌ی پشت"]],
    createdAt: "2026-09-02",
    featured: true,
    tags: ["مجلسی", "رسمی"],
    visual: { garment: "blouse", neckline: "bow", sleeve: "long", length: "regular", fit: "regular", closure: "none" },
  },
  {
    id: "p-109",
    slug: "shomiz-viscose-parnian",
    name: "شومیز ویسکوز چین‌دار پرنیان",
    category: "shomiz",
    price: 1_240_000,
    compareAtPrice: 1_480_000,
    colors: ["lilac", "sage", "cream"],
    description:
      "شومیز ویسکوز نرم با چین‌های ریز زیر یقه که حرکتی آرام به لباس می‌دهد. خنک و سبک برای استفاده‌ی روزانه.",
    material: "ویسکوز (۱۰۰٪)",
    fit: "آزاد",
    care: CARE_DELICATE,
    attributes: [["یقه", "گرد چین‌دار"], ["آستین", "بلند"], ["قد", "استاندارد"]],
    createdAt: "2026-07-27",
    tags: ["ویسکوز"],
    visual: { garment: "blouse", neckline: "boat", sleeve: "long", length: "regular", fit: "regular", closure: "none" },
  },
  {
    id: "p-110",
    slug: "shomiz-katan-bahar",
    name: "شومیز کتان دمپاگشاد بهار",
    category: "shomiz",
    price: 1_320_000,
    colors: ["olive", "beige", "white"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "شومیز کتان با آستین‌های دمپاگشاد سه‌ربع و یقه‌ی هفت کوتاه. فرم ساده‌ی آن با شلوار جین و پارچه‌ای به‌خوبی هماهنگ می‌شود.",
    material: "کتان نخی (۸۰٪ نخ، ۲۰٪ پلی‌استر)",
    fit: "راسته",
    care: CARE_COTTON,
    attributes: [["یقه", "هفت"], ["آستین", "سه‌ربع دمپاگشاد"], ["قد", "تا روی باسن"]],
    createdAt: "2026-06-30",
    tags: ["کتان"],
    visual: { garment: "blouse", neckline: "v", sleeve: "flare", length: "hip", fit: "regular", closure: "none" },
  },
  {
    id: "p-111",
    slug: "shomiz-diplomat-delaram",
    name: "شومیز یقه‌دیپلمات دلارام",
    category: "shomiz",
    price: 1_190_000,
    colors: ["white", "navy", "camel"],
    stock: { navy: { S: 0, M: 0 } },
    description:
      "شومیز یقه‌دیپلمات (یقه‌ی ایستاده) با جادکمه‌ی مخفی؛ فرمی تمیز و مینیمال که زیر مانتو هم بسیار خوش‌فرم دیده می‌شود.",
    material: "پاپلین پنبه‌ای (۱۰۰٪ نخ)",
    fit: "راسته",
    care: CARE_COTTON,
    attributes: [["یقه", "دیپلمات"], ["آستین", "بلند"], ["بستن", "دکمه‌ی مخفی"]],
    createdAt: "2026-08-25",
    tags: ["مینیمال", "اداری"],
    visual: { garment: "blouse", neckline: "mandarin", sleeve: "long", length: "regular", fit: "regular", closure: "hidden" },
  },
  {
    id: "p-112",
    slug: "shomiz-abrisham-shida",
    name: "شومیز ابریشم مصنوعی شیدا",
    category: "shomiz",
    price: 1_850_000,
    colors: ["blush", "cream"],
    stock: { blush: 0, cream: 0 },
    description:
      "شومیز با پارچه‌ی ابریشم مصنوعی براق، یقه‌ی هفت و آستین‌های بلند پفی از سرشانه. این مدل در حال حاضر موجود نیست.",
    material: "ابریشم مصنوعی (۱۰۰٪ پلی‌استر)",
    fit: "آزاد",
    care: CARE_DRY,
    attributes: [["یقه", "هفت"], ["آستین", "بلند پفی"], ["حالت پارچه", "براق"]],
    createdAt: "2026-07-05",
    tags: ["مجلسی", "ابریشم"],
    visual: { garment: "blouse", neckline: "v", sleeve: "puff", length: "regular", fit: "regular", closure: "none" },
  },

  // ───────────────────────────── مانتو ─────────────────────────────
  {
    id: "p-201",
    slug: "manto-katan-mahoor",
    name: "مانتو کتان بلند جلوباز ماهور",
    category: "manto",
    price: 3_450_000,
    colors: ["beige", "black", "olive"],
    description:
      "مانتو بلند جلوباز از کتان ضخیم با یقه‌ی ب و دو جیب پهلو. فرم صاف و ایستای پارچه، ظاهری مرتب و ساختارمند می‌سازد.",
    material: "کتان کجراه (۹۸٪ نخ، ۲٪ الاستین)",
    fit: "راسته؛ قد حدود ۱۰۵ سانتی‌متر در سایز ۴۰",
    care: CARE_COTTON,
    attributes: [["قد", "بلند (زیر زانو)"], ["آستین", "بلند"], ["جیب", "دو جیب پهلو"]],
    createdAt: "2026-10-06",
    featured: true,
    tags: ["کتان", "بلند", "پاییزه"],
    visual: { garment: "manteau", neckline: "v", sleeve: "long", length: "midi", fit: "regular", closure: "open", pockets: true },
  },
  {
    id: "p-202",
    slug: "manto-linen-naroon",
    name: "مانتو لینن کیمونویی نارون",
    category: "manto",
    price: 2_890_000,
    compareAtPrice: 3_390_000,
    colors: ["cream", "sage", "camel"],
    sizes: ["38", "40", "42", "44"],
    description:
      "مانتو کیمونویی سبک از لینن طبیعی با آستین‌های گشاد و کمربند پارچه‌ای جداشونده. خنک، راحت و مناسب روزهای گرم.",
    material: "لینن (۱۰۰٪ کتان طبیعی)",
    fit: "آزاد، با کمربند قابل‌تنظیم",
    care: CARE_LINEN,
    attributes: [["قد", "تا زانو"], ["آستین", "کیمونویی"], ["کمربند", "جداشونده"]],
    createdAt: "2026-08-11",
    featured: true,
    tags: ["لینن", "کیمونو", "تابستانه"],
    visual: { garment: "manteau", neckline: "v", sleeve: "kimono", length: "knee", fit: "oversize", closure: "belt" },
  },
  {
    id: "p-203",
    slug: "manto-crepe-aida",
    name: "مانتو کرپ کمربنددار آیدا",
    category: "manto",
    price: 3_190_000,
    colors: ["black", "navy", "brown"],
    description:
      "مانتو کرپ با کمربند هم‌رنگ و یقه‌ی انگلیسی. پارچه‌ی کرپ کمی کشسان، حرکت راحت را در طول روز ممکن می‌کند.",
    material: "کرپ مازراتی (۹۲٪ پلی‌استر، ۸٪ الاستین)",
    fit: "کمی جذب در کمر با کمربند",
    care: CARE_DRY,
    attributes: [["قد", "تا زانو"], ["یقه", "انگلیسی"], ["بستن", "دکمه و کمربند"]],
    createdAt: "2026-09-19",
    tags: ["کرپ", "اداری", "رسمی"],
    visual: { garment: "manteau", neckline: "collar", sleeve: "long", length: "knee", fit: "fitted", closure: "belt" },
  },
  {
    id: "p-204",
    slug: "manto-nakhi-gelareh",
    name: "مانتو تابستانه نخی گلاره",
    category: "manto",
    price: 2_450_000,
    colors: ["white", "sky", "blush"],
    description:
      "مانتو سبک نخی با جادکمه‌ی کامل و آستین‌های سه‌ربع. پارچه‌ی خنک و نرم برای روزهای آفتابی.",
    material: "وال پنبه‌ای (۱۰۰٪ نخ)",
    fit: "راسته",
    care: CARE_COTTON,
    attributes: [["قد", "تا زانو"], ["آستین", "سه‌ربع"], ["بستن", "دکمه‌ی کامل"]],
    createdAt: "2026-06-14",
    tags: ["نخی", "تابستانه"],
    visual: { garment: "manteau", neckline: "mandarin", sleeve: "three-quarter", length: "knee", fit: "regular", closure: "buttons" },
  },
  {
    id: "p-205",
    slug: "manto-barani-paeez",
    name: "مانتو بارانی کلاسیک پاییز",
    category: "manto",
    price: 4_290_000,
    colors: ["camel", "beige", "black"],
    description:
      "بارانی کلاسیک دوردیف دکمه با سردوشی، کمربند و پارچه‌ی گاباردین ضدآب‌نما. همراهی ماندگار برای روزهای سرد و بارانی.",
    material: "گاباردین (۶۵٪ پلی‌استر، ۳۵٪ نخ)",
    fit: "راسته با کمربند",
    care: CARE_DRY,
    attributes: [["قد", "زیر زانو"], ["بستن", "دوردیف دکمه"], ["جزئیات", "سردوشی و کمربند"]],
    createdAt: "2026-10-09",
    featured: true,
    tags: ["بارانی", "پاییزه", "زمستانه"],
    visual: { garment: "manteau", neckline: "collar", sleeve: "long", length: "midi", fit: "regular", closure: "double", pockets: true },
  },
  {
    id: "p-206",
    slug: "manto-mazerati-rose",
    name: "مانتو مازراتی اورسایز رز",
    category: "manto",
    price: 3_690_000,
    compareAtPrice: 4_190_000,
    colors: ["dustyPink", "gray", "cream"],
    sizes: ["38", "40", "42", "44"],
    description:
      "مانتو اورسایز با سرشانه‌ی افتاده و دکمه‌های بزرگ. پارچه‌ی مازراتی خوش‌افت، فرمی آزاد و شیک می‌سازد.",
    material: "مازراتی (۱۰۰٪ پلی‌استر)",
    fit: "اورسایز",
    care: CARE_DRY,
    attributes: [["قد", "تا زانو"], ["آستین", "بلند با سرشانه‌ی افتاده"], ["بستن", "دکمه"]],
    createdAt: "2026-09-25",
    tags: ["اورسایز", "مازراتی"],
    visual: { garment: "manteau", neckline: "v", sleeve: "long", length: "knee", fit: "oversize", closure: "buttons", pockets: true },
  },
  {
    id: "p-207",
    slug: "manto-jean-tina",
    name: "مانتو جین سنگ‌شور تینا",
    category: "manto",
    price: 3_350_000,
    colors: ["denim", "sky"],
    description:
      "مانتو جین با شست‌وشوی سنگی، دکمه‌های فلزی و جیب‌های رو. استایلی جوان و راحت برای دانشگاه و بیرون‌رفتن.",
    material: "جین (۹۸٪ نخ، ۲٪ الاستین)",
    fit: "راسته",
    care: ["شست‌وشو پشت‌ورو در آب سرد", "جدا از لباس‌های روشن شسته شود", "در سایه خشک شود"],
    attributes: [["قد", "تا زانو"], ["یقه", "پیراهنی"], ["جیب", "دو جیب رو"]],
    createdAt: "2026-07-20",
    tags: ["جین", "اسپرت"],
    visual: { garment: "manteau", neckline: "collar", sleeve: "long", length: "knee", fit: "regular", closure: "buttons", pockets: true },
  },
  {
    id: "p-208",
    slug: "manto-minimal-sepideh",
    name: "مانتو دکمه‌مخفی مینیمال سپیده",
    category: "manto",
    price: 2_980_000,
    colors: ["black", "white", "charcoal"],
    description:
      "مانتو با جادکمه‌ی مخفی و خطوط کاملاً تمیز. بدون هیچ جزئیات اضافه؛ برای کسانی که سادگی را ترجیح می‌دهند.",
    material: "کرپ کش (۹۵٪ پلی‌استر، ۵٪ الاستین)",
    fit: "راسته",
    care: CARE_COTTON,
    attributes: [["قد", "تا زانو"], ["یقه", "دیپلمات"], ["بستن", "دکمه‌ی مخفی"]],
    createdAt: "2026-08-30",
    featured: true,
    tags: ["مینیمال", "اداری"],
    visual: { garment: "manteau", neckline: "mandarin", sleeve: "long", length: "knee", fit: "regular", closure: "hidden" },
  },
  {
    id: "p-209",
    slug: "manto-kati-elena",
    name: "مانتو کتی ساده النا",
    category: "manto",
    price: 3_890_000,
    colors: ["charcoal", "camel", "navy"],
    stock: { navy: 0 },
    description:
      "مانتو با برش کتی، یقه‌ی کت و یک دکمه‌ی اصلی. ساختار سرشانه‌ی دوخت‌دار ظاهری رسمی و مرتب می‌دهد.",
    material: "فاستونی نرم (۷۰٪ پلی‌استر، ۳۰٪ ویسکوز)",
    fit: "کمی جذب",
    care: CARE_DRY,
    attributes: [["قد", "روی زانو"], ["یقه", "کتی"], ["آستر", "دارد"]],
    createdAt: "2026-09-14",
    tags: ["رسمی", "کتی"],
    visual: { garment: "manteau", neckline: "v", sleeve: "long", length: "hip", fit: "fitted", closure: "buttons", pockets: true },
  },
  {
    id: "p-210",
    slug: "manto-linen-shabnam",
    name: "مانتو لینن آستین‌کلوش شبنم",
    category: "manto",
    price: 2_790_000,
    compareAtPrice: 3_150_000,
    colors: ["white", "lilac", "beige"],
    description:
      "مانتو لینن با آستین‌های کلوش و یقه‌ی هفت. حرکت نرم آستین‌ها حال‌وهوایی رمانتیک و سبک به لباس می‌دهد.",
    material: "لینن و ویسکوز (۶۰٪ لینن، ۴۰٪ ویسکوز)",
    fit: "آزاد",
    care: CARE_LINEN,
    attributes: [["قد", "تا زانو"], ["آستین", "کلوش"], ["بستن", "جلوبسته"]],
    createdAt: "2026-07-08",
    tags: ["لینن", "تابستانه"],
    visual: { garment: "manteau", neckline: "v", sleeve: "flare", length: "knee", fit: "regular", closure: "none" },
  },
  {
    id: "p-211",
    slug: "manto-harir-mahsa",
    name: "مانتو حریر دولایه مهسا",
    category: "manto",
    price: 2_650_000,
    colors: ["black", "cream", "sage"],
    description:
      "مانتو حریر دولایه با یقه‌ی گرد و چاک‌های پهلو. سبک، روان و مناسب مهمانی‌های عصرگاهی تابستان.",
    material: "حریر کریشه با آستر نخی",
    fit: "آزاد",
    care: CARE_DELICATE,
    attributes: [["قد", "زیر زانو"], ["آستین", "بلند"], ["لایه", "دولایه"]],
    createdAt: "2026-08-07",
    tags: ["حریر", "مجلسی"],
    visual: { garment: "manteau", neckline: "crew", sleeve: "long", length: "midi", fit: "regular", closure: "none" },
  },
  {
    id: "p-212",
    slug: "manto-jibdar-aram",
    name: "مانتو بلند جیب‌دار آرام",
    category: "manto",
    price: 3_550_000,
    colors: ["olive", "brown", "black"],
    description:
      "مانتو بلند تک‌رنگ با جیب‌های بزرگ پهلو و دکمه‌های چوبی. پارچه‌ی ضخیم‌تر آن برای پاییز و اوایل زمستان مناسب است.",
    material: "کتان ضخیم (۱۰۰٪ نخ)",
    fit: "راسته",
    care: CARE_COTTON,
    attributes: [["قد", "بلند"], ["جیب", "دو جیب بزرگ پهلو"], ["دکمه", "چوبی"]],
    createdAt: "2026-10-01",
    tags: ["پاییزه", "بلند"],
    visual: { garment: "manteau", neckline: "collar", sleeve: "long", length: "midi", fit: "regular", closure: "buttons", pockets: true },
  },

  // ───────────────────────────── تیشرت ─────────────────────────────
  {
    id: "p-301",
    slug: "tshirt-basic-rouzaneh",
    name: "تیشرت بیسیک نخی روزانه",
    category: "tshirt",
    price: 590_000,
    colors: ["white", "black", "beige", "gray"],
    stock: {
      white: { S: 6, M: 8, L: 7, XL: 4 },
      black: { S: 5, M: 7, L: 3, XL: 0 },
      beige: { S: 4, M: 6, L: 5, XL: 3 },
      gray: { S: 3, M: 5, L: 4, XL: 2 },
    },
    description:
      "تیشرت یقه‌گرد از پنبه‌ی شانه‌شده با بافت نرم و ضخامت متوسط. پایه‌ای ساده که هر روز به کار می‌آید.",
    material: "پنبه‌ی شانه‌شده (۱۰۰٪ نخ، ۱۸۰ گرم)",
    fit: "راسته",
    care: CARE_COTTON,
    attributes: [["یقه", "گرد"], ["آستین", "کوتاه"], ["گرماژ", "۱۸۰ گرم"]],
    createdAt: "2026-09-30",
    featured: true,
    tags: ["بیسیک", "نخی"],
    visual: { garment: "tshirt", neckline: "crew", sleeve: "short", length: "regular", fit: "regular", pattern: "solid" },
  },
  {
    id: "p-302",
    slug: "tshirt-oversize-solo",
    name: "تیشرت اورسایز ملانژ سولو",
    category: "tshirt",
    price: 790_000,
    colors: ["gray", "cream", "charcoal"],
    sizes: ["FS"],
    description:
      "تیشرت اورسایز با پارچه‌ی ملانژ و سرشانه‌ی افتاده. فری‌سایز طراحی شده و برای سایز S تا XL مناسب است.",
    material: "پنبه‌ی ملانژ (۸۵٪ نخ، ۱۵٪ پلی‌استر)",
    fit: "اورسایز (فری‌سایز)",
    care: CARE_COTTON,
    attributes: [["یقه", "گرد"], ["آستین", "کوتاه با سرشانه‌ی افتاده"], ["سایز", "فری‌سایز"]],
    createdAt: "2026-10-08",
    featured: true,
    tags: ["اورسایز", "ملانژ"],
    visual: { garment: "tshirt", neckline: "crew", sleeve: "short", length: "regular", fit: "oversize", pattern: "melange" },
  },
  {
    id: "p-303",
    slug: "tshirt-crop-rib-nava",
    name: "تیشرت کراپ ریب نوا",
    category: "tshirt",
    price: 650_000,
    compareAtPrice: 750_000,
    colors: ["black", "white", "sage", "dustyPink"],
    sizes: ["S", "M", "L"],
    description:
      "تیشرت کراپ از پارچه‌ی ریب کشسان که فرم بدن را به‌خوبی دنبال می‌کند. مناسب برای ست با شلوارهای فاق‌بلند.",
    material: "ریب پنبه‌ای (۹۵٪ نخ، ۵٪ لایکرا)",
    fit: "جذب",
    care: CARE_COTTON,
    attributes: [["یقه", "گرد"], ["آستین", "کوتاه"], ["قد", "کراپ"]],
    createdAt: "2026-08-22",
    tags: ["کراپ", "ریب"],
    visual: { garment: "tshirt", neckline: "crew", sleeve: "short", length: "crop", fit: "fitted", pattern: "rib" },
  },
  {
    id: "p-304",
    slug: "tshirt-se-rob-sahar",
    name: "تیشرت آستین‌سه‌ربع سحر",
    category: "tshirt",
    price: 720_000,
    colors: ["cream", "navy", "burgundy"],
    description:
      "تیشرت آستین سه‌ربع با یقه‌ی قایقی کم‌عمق؛ برای فصل‌های میانی، زیر مانتو یا به‌تنهایی.",
    material: "جودون پنبه‌ای (۹۵٪ نخ، ۵٪ لایکرا)",
    fit: "راسته",
    care: CARE_COTTON,
    attributes: [["یقه", "قایقی"], ["آستین", "سه‌ربع"], ["کشسانی", "متوسط"]],
    createdAt: "2026-07-16",
    tags: ["آستین‌بلند"],
    visual: { garment: "tshirt", neckline: "boat", sleeve: "three-quarter", length: "regular", fit: "regular", pattern: "solid" },
  },
  {
    id: "p-305",
    slug: "tshirt-yaghe-haft-asa",
    name: "تیشرت یقه‌هفت پنبه‌ای آسا",
    category: "tshirt",
    price: 640_000,
    colors: ["white", "black", "lilac"],
    description:
      "تیشرت یقه‌هفت با برش ساده و پارچه‌ی خنک. یقه‌ی هفت کم‌عمق، گردن را کشیده‌تر نشان می‌دهد.",
    material: "پنبه‌ی سوپرپنبه (۱۰۰٪ نخ)",
    fit: "راسته",
    care: CARE_COTTON,
    attributes: [["یقه", "هفت"], ["آستین", "کوتاه"], ["قد", "استاندارد"]],
    createdAt: "2026-06-26",
    tags: ["بیسیک"],
    visual: { garment: "tshirt", neckline: "v", sleeve: "short", length: "regular", fit: "regular", pattern: "solid" },
  },
  {
    id: "p-306",
    slug: "tshirt-rahrah-darya",
    name: "تیشرت راه‌راه ملوانی دریا",
    category: "tshirt",
    price: 760_000,
    colors: ["navy", "black"],
    description:
      "تیشرت راه‌راه افقی با الهام از استایل ملوانی کلاسیک. آستین‌های بلند و یقه‌ی قایقی.",
    material: "جودون پنبه‌ای (۱۰۰٪ نخ)",
    fit: "راسته",
    care: CARE_COTTON,
    attributes: [["یقه", "قایقی"], ["آستین", "بلند"], ["طرح", "راه‌راه افقی"]],
    createdAt: "2026-09-06",
    tags: ["راه‌راه"],
    visual: { garment: "tshirt", neckline: "boat", sleeve: "long", length: "regular", fit: "regular", pattern: "stripe" },
  },
  {
    id: "p-307",
    slug: "tshirt-jodoon-pooneh",
    name: "تیشرت جودون کلاسیک پونه",
    category: "tshirt",
    price: 690_000,
    colors: ["sage", "mustard", "white", "sky"],
    description:
      "تیشرت جودون با یقه‌ی گرد کمی پهن‌تر و آستین‌هایی که تا وسط بازو می‌رسند. رنگ‌های روشن و شاد برای روزهای معمول.",
    material: "جودون (۹۲٪ نخ، ۸٪ لایکرا)",
    fit: "راسته",
    care: CARE_COTTON,
    attributes: [["یقه", "گرد"], ["آستین", "کوتاه"], ["پارچه", "جودون"]],
    createdAt: "2026-07-30",
    tags: ["رنگی"],
    visual: { garment: "tshirt", neckline: "crew", sleeve: "short", length: "regular", fit: "regular", pattern: "solid" },
  },
  {
    id: "p-308",
    slug: "tshirt-halgheyi-taban",
    name: "تیشرت آستین‌حلقه‌ای تابان",
    category: "tshirt",
    price: 560_000,
    compareAtPrice: 690_000,
    colors: ["white", "black", "camel"],
    sizes: ["S", "M", "L"],
    description:
      "تاپ آستین‌حلقه‌ای ریب، مناسب برای استفاده زیر مانتوهای سبک یا شومیزهای جلوباز.",
    material: "ریب پنبه‌ای (۹۵٪ نخ، ۵٪ لایکرا)",
    fit: "جذب",
    care: CARE_COTTON,
    attributes: [["یقه", "گرد"], ["آستین", "حلقه‌ای"], ["کشسانی", "زیاد"]],
    createdAt: "2026-06-18",
    tags: ["تاپ", "ریب"],
    visual: { garment: "tshirt", neckline: "crew", sleeve: "sleeveless", length: "regular", fit: "fitted", pattern: "rib" },
  },
  {
    id: "p-309",
    slug: "tshirt-yaghe-eski-barfa",
    name: "تیشرت یقه‌اسکی نازک برفا",
    category: "tshirt",
    price: 820_000,
    colors: ["black", "cream", "brown"],
    description:
      "تیشرت یقه‌اسکی نازک با آستین بلند؛ لایه‌ی زیرین ایده‌آل برای مانتوهای پاییزی و زمستانی.",
    material: "ویسکوز کشی (۹۵٪ ویسکوز، ۵٪ الاستین)",
    fit: "جذب",
    care: CARE_DELICATE,
    attributes: [["یقه", "اسکی"], ["آستین", "بلند"], ["کشسانی", "زیاد"]],
    createdAt: "2026-10-03",
    tags: ["یقه‌اسکی", "پاییزه"],
    visual: { garment: "tshirt", neckline: "turtle", sleeve: "long", length: "regular", fit: "fitted", pattern: "solid" },
  },
  {
    id: "p-310",
    slug: "tshirt-slub-kiana",
    name: "تیشرت اسلاب نخی کیانا",
    category: "tshirt",
    price: 740_000,
    colors: ["beige", "olive", "white"],
    description:
      "تیشرت از پارچه‌ی اسلاب با بافت نامنظم و طبیعی که ظاهری دست‌ساز به آن می‌دهد. بسیار سبک و خنک.",
    material: "نخ اسلاب (۱۰۰٪ نخ)",
    fit: "کمی آزاد",
    care: CARE_COTTON,
    attributes: [["یقه", "گرد"], ["آستین", "کوتاه"], ["بافت", "اسلاب"]],
    createdAt: "2026-08-14",
    tags: ["نخی", "تابستانه"],
    visual: { garment: "tshirt", neckline: "crew", sleeve: "short", length: "regular", fit: "regular", pattern: "melange" },
  },
  {
    id: "p-311",
    slug: "tshirt-boxy-hila",
    name: "تیشرت باکسی‌فیت هیلا",
    category: "tshirt",
    price: 850_000,
    colors: ["charcoal", "white", "blush"],
    sizes: ["S", "M", "L"],
    description:
      "تیشرت با برش باکسی، قد کمی کوتاه‌تر و پارچه‌ی ضخیم که فرم خود را حفظ می‌کند.",
    material: "پنبه‌ی سنگین (۱۰۰٪ نخ، ۲۴۰ گرم)",
    fit: "باکسی",
    care: CARE_COTTON,
    attributes: [["یقه", "گرد"], ["آستین", "کوتاه"], ["گرماژ", "۲۴۰ گرم"]],
    createdAt: "2026-09-21",
    tags: ["باکسی"],
    visual: { garment: "tshirt", neckline: "crew", sleeve: "short", length: "crop", fit: "boxy", pattern: "solid" },
  },
  {
    id: "p-312",
    slug: "tshirt-organic-sogand",
    name: "تیشرت پنبه ارگانیک سوگند",
    category: "tshirt",
    price: 890_000,
    colors: ["cream", "sage", "dustyPink"],
    description:
      "تیشرت یقه‌گرد از الیاف پنبه‌ی ارگانیک (طبق اطلاعات نمونه) با رنگ‌های ملایم خاکی.",
    material: "پنبه‌ی ارگانیک (۱۰۰٪ نخ) — اطلاعات نمونه",
    fit: "راسته",
    care: CARE_COTTON,
    attributes: [["یقه", "گرد"], ["آستین", "کوتاه"], ["الیاف", "پنبه‌ی ارگانیک"]],
    createdAt: "2026-07-24",
    tags: ["ارگانیک"],
    visual: { garment: "tshirt", neckline: "crew", sleeve: "elbow", length: "regular", fit: "regular", pattern: "dots" },
  },
];
