"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { cn } from "@/lib/cn";

/** Demo contact form: validates locally and clearly states that nothing is sent. */
export function ContactForm() {
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});
  const [sent, setSent] = useState(false);
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const name = String(data.get("name") ?? "").trim();
        const message = String(data.get("message") ?? "").trim();
        const next = {
          name: name.length < 2 ? "نام خود را وارد کنید." : undefined,
          message: message.length < 10 ? "پیام باید دست‌کم ۱۰ کاراکتر باشد." : undefined,
        };
        setErrors(next);
        setSent(!next.name && !next.message);
      }}
    >
      <Field id="contact-name" label="نام" required error={errors.name}>
        <input id="contact-name" name="name" autoComplete="name" aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? "contact-name-error" : undefined} className={cn(inputClasses, "h-12")} />
      </Field>
      <Field id="contact-message" label="پیام" required error={errors.message}>
        <textarea id="contact-message" name="message" rows={5} aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? "contact-message-error" : undefined} className={cn(inputClasses, "py-3 leading-7")} />
      </Field>
      <Button type="submit">ارسال پیام</Button>
      <p role="status" className="min-h-6 text-sm text-success">
        {sent ? "فرم معتبر است، اما این نسخه نمایشی است و پیام شما ارسال یا ذخیره نشد." : null}
      </p>
    </form>
  );
}
