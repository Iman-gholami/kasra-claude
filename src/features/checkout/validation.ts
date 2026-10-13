import { toLatinDigits } from "@/lib/persian";

export const IRAN_PROVINCES = [
  "آذربایجان شرقی",
  "آذربایجان غربی",
  "اردبیل",
  "اصفهان",
  "البرز",
  "ایلام",
  "بوشهر",
  "تهران",
  "چهارمحال و بختیاری",
  "خراسان جنوبی",
  "خراسان رضوی",
  "خراسان شمالی",
  "خوزستان",
  "زنجان",
  "سمنان",
  "سیستان و بلوچستان",
  "فارس",
  "قزوین",
  "قم",
  "کردستان",
  "کرمان",
  "کرمانشاه",
  "کهگیلویه و بویراحمد",
  "گلستان",
  "گیلان",
  "لرستان",
  "مازندران",
  "مرکزی",
  "هرمزگان",
  "همدان",
  "یزد",
] as const;

export interface CheckoutValues {
  fullName: string;
  mobile: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  notes: string;
  shippingMethod: string;
}

export type CheckoutField = keyof CheckoutValues;
export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

/** Normalizes Iranian mobile numbers (Persian digits, +98/0098/98 prefixes, spaces) to 09XXXXXXXXX. */
export function normalizeMobile(input: string): string {
  let v = toLatinDigits(input).replace(/[\s\-()]/g, "");
  if (v.startsWith("+98")) v = "0" + v.slice(3);
  else if (v.startsWith("0098")) v = "0" + v.slice(4);
  else if (v.startsWith("98") && v.length === 12) v = "0" + v.slice(2);
  else if (v.startsWith("9") && v.length === 10) v = "0" + v;
  return v;
}

export function normalizePostalCode(input: string): string {
  return toLatinDigits(input).replace(/[\s-]/g, "");
}

const MOBILE = /^09\d{9}$/;
// Iranian postal codes: 10 digits; the first five never contain 0 or 2, the fifth is never 5,
// the last five never contain 2, and codes do not start with four identical digits.
const POSTAL_CODE = /^(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}$/;
const NAME = /^[\p{L}\s‌.'-]+$/u;

export function validateField(field: CheckoutField, values: CheckoutValues): string | undefined {
  const value = values[field].trim();
  switch (field) {
    case "fullName":
      if (!value) return "نام و نام خانوادگی را وارد کنید.";
      if (value.length < 3) return "نام واردشده خیلی کوتاه است.";
      if (!NAME.test(value)) return "نام فقط می‌تواند شامل حروف باشد.";
      return;
    case "mobile":
      if (!value) return "شماره‌ی موبایل را وارد کنید.";
      if (!MOBILE.test(normalizeMobile(value))) return "شماره‌ی موبایل معتبر نیست؛ مثال: ۰۹۱۲۳۴۵۶۷۸۹";
      return;
    case "province":
      if (!value) return "استان را انتخاب کنید.";
      if (!(IRAN_PROVINCES as readonly string[]).includes(value)) return "استان انتخاب‌شده معتبر نیست.";
      return;
    case "city":
      if (!value) return "شهر را وارد کنید.";
      if (value.length < 2) return "نام شهر خیلی کوتاه است.";
      return;
    case "address":
      if (!value) return "نشانی دقیق را وارد کنید.";
      if (value.length < 10) return "نشانی را کامل‌تر بنویسید (خیابان، کوچه، پلاک، واحد).";
      return;
    case "postalCode": {
      if (!value) return "کد پستی را وارد کنید.";
      const code = normalizePostalCode(value);
      if (!/^\d{10}$/.test(code)) return "کد پستی باید ۱۰ رقم و بدون خط تیره باشد.";
      if (!POSTAL_CODE.test(code)) return "کد پستی واردشده معتبر به نظر نمی‌رسد.";
      return;
    }
    case "notes":
      if (value.length > 500) return "توضیحات حداکثر می‌تواند ۵۰۰ کاراکتر باشد.";
      return;
    case "shippingMethod":
      if (!value) return "روش ارسال را انتخاب کنید.";
      if (value === "courier" && values.province !== "تهران") return "ارسال با پیک فقط برای استان تهران فعال است.";
      return;
  }
}

export const CHECKOUT_FIELDS: CheckoutField[] = ["fullName", "mobile", "province", "city", "address", "postalCode", "shippingMethod", "notes"];

export function validateCheckout(values: CheckoutValues): CheckoutErrors {
  const errors: CheckoutErrors = {};
  for (const field of CHECKOUT_FIELDS) {
    const error = validateField(field, values);
    if (error) errors[field] = error;
  }
  return errors;
}
