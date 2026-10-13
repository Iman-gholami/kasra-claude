/**
 * Persian text utilities: digit conversion, number formatting and search
 * normalization. Pure functions, safe on both server and client.
 */

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Converts Latin digits to Persian digits (e.g. "12" → "۱۲"). */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/** Converts Persian and Arabic-Indic digits to Latin digits. */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

const numberFormatter = new Intl.NumberFormat("fa-IR", { useGrouping: true, maximumFractionDigits: 0 });

/** Formats an integer with Persian digits and Persian digit grouping (۱٬۲۹۰٬۰۰۰). */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Formats a Toman amount, e.g. "۱٬۲۹۰٬۰۰۰ تومان". */
export function formatToman(value: number): string {
  return `${formatNumber(value)} تومان`;
}

const DIACRITICS = /[ً-ٰٟۖ-ۭ]/g;
const TATWEEL = /ـ/g;
const ZWNJ = /[‌‍‎‏]/g;

/**
 * Normalizes text for search matching:
 * - unifies Arabic/Persian variants of ی and ک (and ة/ۀ → ه, أ/إ/آ → ا, ؤ → و)
 * - strips diacritics and tatweel
 * - converts digits to Latin
 * - lowercases Latin text and collapses whitespace; ZWNJ becomes a space
 */
export function normalizePersian(input: string): string {
  return toLatinDigits(input)
    .replace(/[يىئ]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[ةۀ]/g, "ه")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(ZWNJ, " ")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Removes all separators so «تی شرت», «تی‌شرت» and «تیشرت» compare equal. */
export function compactPersian(normalized: string): string {
  return normalized.replace(/[\s-]+/g, "");
}

/** Persian plural-friendly count label, e.g. "۱۲ محصول". */
export function countLabel(count: number, noun: string): string {
  return `${formatNumber(count)} ${noun}`;
}
