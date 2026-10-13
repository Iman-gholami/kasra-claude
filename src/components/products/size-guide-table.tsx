import type { SizeSystem } from "@/types/catalog";
import { toPersianDigits } from "@/lib/persian";

export const ALPHA_SIZE_CHART = [
  { size: "S", bust: "86–90", waist: "70–74", hip: "94–98" },
  { size: "M", bust: "90–94", waist: "74–78", hip: "98–102" },
  { size: "L", bust: "94–100", waist: "78–84", hip: "102–108" },
  { size: "XL", bust: "100–106", waist: "84–90", hip: "108–114" },
  { size: "XXL", bust: "106–112", waist: "90–96", hip: "114–120" },
];

export const NUMERIC_SIZE_CHART = [
  { size: "38", bust: "88", shoulder: "37", sleeve: "58", length: "100" },
  { size: "40", bust: "92", shoulder: "38", sleeve: "59", length: "102" },
  { size: "42", bust: "96", shoulder: "39", sleeve: "60", length: "104" },
  { size: "44", bust: "100", shoulder: "40.5", sleeve: "61", length: "106" },
  { size: "46", bust: "104", shoulder: "42", sleeve: "62", length: "108" },
];

const th = "px-3 py-2.5 text-start font-semibold whitespace-nowrap";
const td = "px-3 py-2.5 tabular-nums whitespace-nowrap";

/** Sample measurement tables (centimetres). Replace with the brand's real pattern measurements. */
export function SizeGuideTable({ system, caption }: { system: SizeSystem; caption?: string }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-line">
      <table className="w-full border-collapse text-sm">
        <caption className="bg-sand-soft px-3 py-2.5 text-start text-[0.8125rem] font-semibold">
          {caption ?? (system === "alpha" ? "شومیز و تیشرت — اندازه‌ی بدن (سانتی‌متر)" : "مانتو — اندازه‌ی لباس (سانتی‌متر)")}
        </caption>
        <thead className="border-b border-line bg-surface">
          {system === "alpha" ? (
            <tr>
              <th scope="col" className={th}>سایز</th>
              <th scope="col" className={th}>دور سینه</th>
              <th scope="col" className={th}>دور کمر</th>
              <th scope="col" className={th}>دور باسن</th>
            </tr>
          ) : (
            <tr>
              <th scope="col" className={th}>سایز</th>
              <th scope="col" className={th}>دور سینه</th>
              <th scope="col" className={th}>سرشانه</th>
              <th scope="col" className={th}>قد آستین</th>
              <th scope="col" className={th}>قد لباس</th>
            </tr>
          )}
        </thead>
        <tbody className="divide-y divide-line bg-surface">
          {system === "alpha"
            ? ALPHA_SIZE_CHART.map((r) => (
                <tr key={r.size}>
                  <th scope="row" className={th} dir="ltr">{r.size}</th>
                  <td className={td}>{toPersianDigits(r.bust)}</td>
                  <td className={td}>{toPersianDigits(r.waist)}</td>
                  <td className={td}>{toPersianDigits(r.hip)}</td>
                </tr>
              ))
            : NUMERIC_SIZE_CHART.map((r) => (
                <tr key={r.size}>
                  <th scope="row" className={th}>{toPersianDigits(r.size)}</th>
                  <td className={td}>{toPersianDigits(r.bust)}</td>
                  <td className={td}>{toPersianDigits(r.shoulder.replace(".", "٫"))}</td>
                  <td className={td}>{toPersianDigits(r.sleeve)}</td>
                  <td className={td}>{toPersianDigits(r.length)}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

export function SizeGuideNote() {
  return (
    <p className="text-xs leading-6 text-ink-muted">
      اعداد این جدول نمونه هستند و پس از اندازه‌گیری الگوهای واقعی تولید به‌روزرسانی می‌شوند. اگر بین دو سایز هستید، برای
      فرم راحت‌تر سایز بزرگ‌تر را انتخاب کنید.
    </p>
  );
}
