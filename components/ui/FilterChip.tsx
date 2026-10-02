"use client";

import { Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type FilterChipProps = {
  label: string;
  count?: number;
  active?: boolean;
  /** Puce de filtre appliqué, retirable (état vide) */
  removable?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function FilterChip({ label, count, active, removable, className, ...rest }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={removable ? undefined : active}
      aria-label={removable ? `Retirer le filtre ${label}` : undefined}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-pill border-2 px-4 text-[15px] font-medium",
        "transition-[background-color,border-color,color] duration-200 ease-out",
        active || removable
          ? "border-action bg-action-tint text-ink"
          : "border-line bg-surface text-ink hover:border-action",
        className
      )}
      {...rest}
    >
      <AnimatePresence initial={false}>
        {active && !removable && (
          <motion.span
            key="check"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 18, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="inline-flex overflow-hidden"
            aria-hidden
          >
            <Check className="size-[18px]" strokeWidth={2.5} />
          </motion.span>
        )}
      </AnimatePresence>
      <span>
        {label}
        {count !== undefined && <span className="text-muted"> ({count})</span>}
      </span>
      {removable && <X aria-hidden className="size-4" strokeWidth={2} />}
    </button>
  );
}
