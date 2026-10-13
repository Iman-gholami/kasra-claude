"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Demo-only signup: validates input but never stores or sends it. */
export function NewsletterForm() {
  const id = useId();
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "invalid" | "done">("idle");
  return (
    <section aria-labelledby={`${id}-title`} className="container-page pt-20 md:pt-28">
      <div className="mx-auto max-w-2xl text-center">
        <DemoBadge>فرم نمایشی</DemoBadge>
        <h2 id={`${id}-title`} className="mt-4 text-2xl font-bold md:text-[1.75rem]">
          از کالکشن‌های تازه باخبر شوید
        </h2>
        <p className="mt-3 leading-7 text-ink-soft">
          طراحی این بخش برای اطلاع‌رسانی کالکشن‌های جدید آماده است، اما فرم هنوز به سرویس خبرنامه متصل نشده است.
        </p>
        <form
          noValidate
          className="mt-7 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setState(EMAIL.test(value.trim()) ? "done" : "invalid");
          }}
        >
          <label htmlFor={`${id}-email`} className="sr-only">
            ایمیل
          </label>
          <input
            id={`${id}-email`}
            type="email"
            dir="ltr"
            inputMode="email"
            autoComplete="email"
            placeholder="example@mail.com"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (state !== "idle") setState("idle");
            }}
            aria-invalid={state === "invalid"}
            aria-describedby={`${id}-msg`}
            className="h-12 flex-1 rounded-sm border border-line-strong bg-surface px-4 text-start outline-none transition-colors placeholder:text-ink-muted/70 focus:border-ink aria-invalid:border-danger"
          />
          <Button type="submit" size="md" className="sm:px-8">
            عضویت
          </Button>
        </form>
        <p id={`${id}-msg`} role="status" className="mt-3 min-h-6 text-sm">
          {state === "invalid" ? <span className="text-danger">لطفاً یک ایمیل معتبر وارد کنید.</span> : null}
          {state === "done" ? (
            <span className="text-success">ایمیل معتبر است، اما چون این فرم نمایشی است هیچ اطلاعاتی ذخیره یا ارسال نشد.</span>
          ) : null}
        </p>
      </div>
    </section>
  );
}
