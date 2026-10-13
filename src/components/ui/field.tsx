import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const inputClasses =
  "block w-full rounded-sm border border-line-strong bg-surface px-4 text-[0.9375rem] outline-none transition-[border-color,box-shadow] placeholder:text-ink-muted/80 hover:border-ink-muted focus:border-ink focus:ring-2 focus:ring-ink/10 aria-invalid:border-danger aria-invalid:focus:ring-danger/15 disabled:cursor-not-allowed disabled:bg-sand-soft";

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}

/** Label + control + hint + error wiring. The control must use `${id}-hint` / `${id}-error` in aria-describedby. */
export function Field({ id, label, required, hint, error, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden>
            {" "}
            *
          </span>
        ) : (
          <span className="ms-1 text-xs font-normal text-ink-muted">(اختیاری)</span>
        )}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs leading-5 text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[0.8125rem] font-medium leading-5 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, hasHint: boolean, error?: string) {
  return cn(error ? `${id}-error` : hasHint ? `${id}-hint` : "") || undefined;
}
