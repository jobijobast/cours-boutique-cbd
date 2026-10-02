"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_QTY } from "@/lib/data/products";
import { cn } from "@/lib/cn";

/** Compteur de quantité 1 → MAX_QTY. Au maximum, le + reste focusable mais inactif. */
export function QtyStepper({
  value,
  onChange,
  label,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  className?: string;
}) {
  const atMax = value >= MAX_QTY;
  const atMin = value <= 1;
  const btn =
    "grid size-11 place-items-center rounded-full text-ink transition-colors duration-200 hover:bg-action-tint aria-disabled:cursor-not-allowed aria-disabled:text-muted aria-disabled:hover:bg-transparent";
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-pill border-2 border-line bg-surface", className)}
    >
      <button
        type="button"
        className={btn}
        aria-label="Diminuer la quantité"
        aria-disabled={atMin || undefined}
        onClick={() => !atMin && onChange(value - 1)}
      >
        <Minus aria-hidden className="size-5" strokeWidth={2} />
      </button>
      <output aria-live="polite" className="w-8 text-center text-[16px] font-semibold tabular-nums">
        {value}
      </output>
      <button
        type="button"
        className={btn}
        aria-label="Augmenter la quantité"
        aria-disabled={atMax || undefined}
        onClick={() => !atMax && onChange(value + 1)}
      >
        <Plus aria-hidden className="size-5" strokeWidth={2} />
      </button>
    </div>
  );
}
