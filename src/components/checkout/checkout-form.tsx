"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, CircleAlert, Info, LoaderCircle, ShieldCheck, ShoppingBag } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { CartSummary } from "@/components/cart/cart-summary";
import { DemoBadge } from "@/components/ui/demo-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, describedBy, inputClasses } from "@/components/ui/field";
import { cartActions, useCartLines } from "@/features/cart/cart-store";
import { computeCartTotals } from "@/features/cart/totals";
import { orderActions } from "@/features/orders/orders-store";
import {
  CHECKOUT_FIELDS,
  IRAN_PROVINCES,
  validateCheckout,
  validateField,
  type CheckoutErrors,
  type CheckoutField,
  type CheckoutValues,
} from "@/features/checkout/validation";
import { useHydrated } from "@/lib/store/create-store";
import { demoCommerce, type ShippingMethodId } from "@/lib/site";
import { formatNumber, formatToman } from "@/lib/persian";
import { cn } from "@/lib/cn";

const FIELD_LABELS: Record<CheckoutField, string> = {
  fullName: "نام و نام خانوادگی",
  mobile: "شماره‌ی موبایل",
  province: "استان",
  city: "شهر",
  address: "نشانی دقیق",
  postalCode: "کد پستی",
  notes: "توضیحات سفارش",
  shippingMethod: "روش ارسال",
};

const INITIAL: CheckoutValues = {
  fullName: "",
  mobile: "",
  province: "",
  city: "",
  address: "",
  postalCode: "",
  notes: "",
  shippingMethod: "post",
};

function createOrderId() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.floor(Math.random() * 36 * 36)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `KB-${stamp}${rand}`;
}

export function CheckoutForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const lines = useCartLines();
  const [values, setValues] = useState<CheckoutValues>(INITIAL);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [touched, setTouched] = useState<Partial<Record<CheckoutField, boolean>>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const shippingMethod = values.shippingMethod as ShippingMethodId;
  const totals = useMemo(() => computeCartTotals(lines, shippingMethod), [lines, shippingMethod]);
  const method = demoCommerce.shippingMethods.find((m) => m.id === shippingMethod);

  if (!hydrated) {
    return <div className="h-[36rem] animate-pulse rounded-sm bg-sand-soft" aria-label="در حال بارگذاری" role="status" />;
  }

  if (!lines.length && !submitting) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-7" strokeWidth={1.5} />}
        title="سبد خرید شما خالی است"
        description="برای ثبت سفارش آزمایشی، ابتدا محصولی به سبد خرید اضافه کنید."
        action={<ButtonLink href="/shop">مشاهده‌ی محصولات</ButtonLink>}
      />
    );
  }

  const update = (field: CheckoutField, value: string) => {
    const next = { ...values, [field]: value };
    if (field === "province" && value !== "تهران" && next.shippingMethod === "courier") next.shippingMethod = "post";
    setValues(next);
    if (touched[field] || showSummary) setErrors((e) => ({ ...e, [field]: validateField(field, next) }));
  };

  const blur = (field: CheckoutField) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validateField(field, values) }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateCheckout(values);
    setErrors(nextErrors);
    setTouched(Object.fromEntries(CHECKOUT_FIELDS.map((f) => [f, true])));
    const invalid = CHECKOUT_FIELDS.filter((f) => nextErrors[f]);
    if (invalid.length) {
      setShowSummary(true);
      // Move focus to the error summary so screen-reader users hear what to fix.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSubmitting(true);
    const id = createOrderId();
    orderActions.add({
      id,
      createdAt: new Date().toISOString(),
      customerName: values.fullName.trim(),
      city: values.city.trim(),
      province: values.province,
      shippingMethod: method?.label ?? "",
      lines: lines.map(({ sku, slug, name, image, colorName, sizeLabel, unitPrice, quantity }) => ({
        sku,
        slug,
        name,
        image,
        colorName,
        sizeLabel,
        unitPrice,
        quantity,
      })),
      totals,
    });
    cartActions.clear();
    router.push(`/checkout/confirmation?order=${id}`);
  };

  const errorList = CHECKOUT_FIELDS.filter((f) => errors[f]);
  const control = (field: CheckoutField, hasHint = false) => ({
    id: `checkout-${field}`,
    name: field,
    value: values[field],
    onBlur: () => blur(field),
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": describedBy(`checkout-${field}`, hasHint, errors[field]),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_26rem]">
      {/* Order summary: collapsible on phones, sticky column on desktop */}
      <aside className="lg:order-2" aria-labelledby="order-summary-title">
        <div className="rounded-sm border border-line bg-surface lg:sticky lg:top-24">
          <div className="flex min-h-14 items-center justify-between gap-3 px-5 py-3">
            <h2 id="order-summary-title" className="text-base font-bold">
              خلاصه‌ی سفارش <span className="text-sm font-normal text-ink-muted">({formatNumber(totals.itemCount)} کالا)</span>
            </h2>
            <button
              type="button"
              onClick={() => setSummaryOpen((o) => !o)}
              aria-expanded={summaryOpen}
              aria-controls="order-summary-body"
              className="-me-2 flex h-11 items-center gap-2 rounded-sm px-2 text-sm font-semibold tabular-nums lg:hidden"
            >
              {formatToman(totals.total)}
              <span className="sr-only">{summaryOpen ? "پنهان کردن جزئیات" : "نمایش جزئیات"}</span>
              <ChevronDown className={cn("size-4 transition-transform", summaryOpen && "rotate-180")} aria-hidden />
            </button>
          </div>
          <div id="order-summary-body" className={cn(summaryOpen ? "block" : "hidden", "border-t border-line px-5 py-4 lg:block")}>
            <ul className="max-h-72 space-y-4 overflow-y-auto">
              {lines.map((line) => (
                <li key={line.sku} className="flex gap-3">
                  <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-xs bg-sand-soft">
                    <Image src={line.image.src} alt="" fill sizes="56px" className="object-cover" />
                    <span className="absolute top-0 left-0 flex size-5 items-center justify-center rounded-ee-xs bg-ink text-[0.625rem] text-white">
                      {formatNumber(line.quantity)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-medium">{line.name}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {line.colorName}، سایز {line.sizeLabel}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm tabular-nums">{formatNumber(line.unitPrice * line.quantity)}</p>
                </li>
              ))}
            </ul>
            <CartSummary totals={totals} shippingLabel={`ارسال: ${method?.label ?? ""} (نمونه)`} className="mt-5 border-t border-line pt-4" />
            <Link href="/cart" className="mt-4 inline-block text-sm text-ink-soft underline underline-offset-4 hover:text-ink">
              ویرایش سبد خرید
            </Link>
          </div>
        </div>
      </aside>

      <form ref={formRef} noValidate onSubmit={submit} className="space-y-10 lg:order-1" aria-label="فرم ثبت سفارش آزمایشی">
        {showSummary && errorList.length ? (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            className="rounded-sm border border-danger/40 bg-danger-soft p-5 outline-none focus-visible:ring-2 focus-visible:ring-danger"
            data-testid="error-summary"
          >
            <p className="flex items-center gap-2 font-semibold text-danger">
              <CircleAlert className="size-5" aria-hidden />
              لطفاً {formatNumber(errorList.length)} مورد زیر را اصلاح کنید:
            </p>
            <ul className="mt-3 list-disc space-y-1 ps-6 text-sm">
              {errorList.map((f) => (
                <li key={f}>
                  <a href={`#checkout-${f === "shippingMethod" ? "shipping-post" : f}`} className="text-ink underline underline-offset-4">
                    {FIELD_LABELS[f]}: {errors[f]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <fieldset className="space-y-5">
          <legend className="mb-5 text-lg font-bold">اطلاعات گیرنده</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="checkout-fullName" label="نام و نام خانوادگی" required error={errors.fullName}>
              <input {...control("fullName")} onChange={(e) => update("fullName", e.target.value)} autoComplete="name" className={cn(inputClasses, "h-12")} />
            </Field>
            <Field id="checkout-mobile" label="شماره‌ی موبایل" required hint="برای هماهنگی ارسال؛ در این نسخه ذخیره نمی‌شود." error={errors.mobile}>
              <input
                {...control("mobile", true)}
                onChange={(e) => update("mobile", e.target.value)}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                dir="ltr"
                placeholder="09123456789"
                maxLength={16}
                className={cn(inputClasses, "h-12 text-right tabular-nums placeholder:text-right")}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-5 text-lg font-bold">نشانی تحویل</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="checkout-province" label="استان" required error={errors.province}>
              <select
                {...control("province")}
                onChange={(e) => {
                  update("province", e.target.value);
                  setTouched((t) => ({ ...t, province: true }));
                  setErrors((er) => ({ ...er, province: validateField("province", { ...values, province: e.target.value }) }));
                }}
                autoComplete="address-level1"
                className={cn(inputClasses, "h-12 appearance-none bg-[length:1rem] bg-[left_1rem_center] bg-no-repeat pe-4")}
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236f6861' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                }}
              >
                <option value="">انتخاب استان</option>
                {IRAN_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="checkout-city" label="شهر" required error={errors.city}>
              <input {...control("city")} onChange={(e) => update("city", e.target.value)} autoComplete="address-level2" className={cn(inputClasses, "h-12")} />
            </Field>
          </div>
          <Field id="checkout-address" label="نشانی دقیق" required hint="خیابان، کوچه، پلاک و واحد" error={errors.address}>
            <textarea
              {...control("address", true)}
              onChange={(e) => update("address", e.target.value)}
              autoComplete="street-address"
              rows={3}
              className={cn(inputClasses, "py-3 leading-7")}
            />
          </Field>
          <Field id="checkout-postalCode" label="کد پستی" required hint="۱۰ رقم، بدون خط تیره" error={errors.postalCode}>
            <input
              {...control("postalCode", true)}
              onChange={(e) => update("postalCode", e.target.value)}
              inputMode="numeric"
              autoComplete="postal-code"
              dir="ltr"
              maxLength={12}
              className={cn(inputClasses, "h-12 text-right tabular-nums sm:max-w-xs")}
            />
          </Field>
        </fieldset>

        <fieldset aria-describedby={errors.shippingMethod ? "checkout-shippingMethod-error" : undefined}>
          <legend className="mb-2 flex items-center gap-2 text-lg font-bold">
            روش ارسال <DemoBadge>نرخ‌ها نمونه هستند</DemoBadge>
          </legend>
          <p className="mb-4 text-sm text-ink-soft">
            {totals.freeShippingRemaining === 0
              ? "ارسال این سفارش طبق قانون نمونه رایگان است."
              : `ارسال رایگان (قانون نمونه) برای سفارش‌های بالای ${formatToman(demoCommerce.freeShippingThreshold)}.`}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {demoCommerce.shippingMethods.map((m) => {
              const disabled = m.id === "courier" && values.province !== "تهران";
              const checked = values.shippingMethod === m.id;
              return (
                <label
                  key={m.id}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-sm border bg-surface p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                    checked ? "border-ink" : "border-line-strong hover:border-ink-muted",
                    disabled && "cursor-not-allowed opacity-55 hover:border-line-strong",
                  )}
                >
                  <input
                    id={`checkout-shipping-${m.id}`}
                    type="radio"
                    name="shippingMethod"
                    value={m.id}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => update("shippingMethod", m.id)}
                    className="mt-1 size-4 accent-ink"
                  />
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2 text-[0.9375rem] font-semibold">
                      {m.label}
                      <span className="text-sm font-medium tabular-nums">
                        {totals.freeShippingRemaining === 0 ? "رایگان" : formatToman(m.price)}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-ink-muted">
                      {disabled ? "فقط برای استان تهران" : m.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.shippingMethod ? (
            <p id="checkout-shippingMethod-error" className="mt-2 text-[0.8125rem] font-medium text-danger">
              {errors.shippingMethod}
            </p>
          ) : null}
        </fieldset>

        <Field id="checkout-notes" label="توضیحات سفارش" hint="مثلاً زمان مناسب تحویل" error={errors.notes}>
          <textarea {...control("notes", true)} onChange={(e) => update("notes", e.target.value)} rows={2} maxLength={500} className={cn(inputClasses, "py-3 leading-7")} />
        </Field>

        <section aria-labelledby="payment-title" className="rounded-sm border border-dashed border-rose-deep/40 bg-rose-soft/50 p-5">
          <h2 id="payment-title" className="flex items-center gap-2 text-base font-bold">
            <Info className="size-5 text-rose-deep" aria-hidden />
            پرداخت در نسخه‌ی نمایشی
          </h2>
          <p className="mt-2 text-sm leading-7 text-ink-soft">
            درگاه پرداخت هنوز متصل نیست؛ هیچ مبلغی دریافت نمی‌شود و اطلاعات کارت بانکی درخواست نمی‌شود. با زدن دکمه‌ی زیر فقط
            یک سفارش آزمایشی در همین مرورگر ثبت می‌شود.
          </p>
        </section>

        <div className="space-y-3">
          <Button type="submit" size="lg" className="w-full" disabled={submitting} data-testid="place-order">
            {submitting ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <ShieldCheck className="size-5" aria-hidden />}
            ثبت سفارش آزمایشی — {formatToman(totals.total)}
          </Button>
          <p className="text-center text-xs text-ink-muted">با ثبت سفارش آزمایشی هیچ پرداخت یا ارسال واقعی انجام نمی‌شود.</p>
        </div>
      </form>
    </div>
  );
}
