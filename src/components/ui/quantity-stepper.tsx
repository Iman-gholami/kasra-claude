"use client";

import { Minus, Plus } from "lucide-react";
import { formatNumber } from "@/lib/persian";
import { cn } from "@/lib/cn";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}

export function QuantityStepper({ value, min = 1, max, onChange, label, size = "md", className }: QuantityStepperProps) {
  const btn = cn(
    "inline-flex items-center justify-center text-ink transition-colors hover:bg-sand-soft disabled:cursor-not-allowed disabled:opacity-35",
    size === "sm" ? "size-9" : "size-11",
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-sm border border-line-strong bg-surface", className)}
    >
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="افزایش تعداد">
        <Plus className="size-4" aria-hidden />
      </button>
      <output aria-live="polite" className={cn("min-w-8 text-center font-semibold tabular-nums", size === "sm" ? "text-sm" : "text-base")}>
        {formatNumber(value)}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="کاهش تعداد">
        <Minus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
