"use client";

import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export const SORTS = [
  { value: "reco", label: "Recommandés" },
  { value: "asc", label: "Prix croissant" },
  { value: "desc", label: "Prix décroissant" },
  { value: "rating", label: "Mieux notés" },
] as const;
export type SortValue = (typeof SORTS)[number]["value"];

/** Menu de tri (élévation 2) — listbox accessible au clavier */
export function SortMenu({ value, onChange }: { value: SortValue; onChange: (v: SortValue) => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = SORTS.find((s) => s.value === value)!;

  useEffect(() => {
    if (!open) return;
    setActive(SORTS.findIndex((s) => s.value === value));
    listRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, value]);

  const select = (i: number) => {
    onChange(SORTS[i].value);
    setOpen(false);
    btnRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(SORTS.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(SORTS.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(active);
    } else if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      setOpen(false);
      if (e.key === "Escape") btnRef.current?.focus();
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-11 items-center gap-2 rounded-pill border-2 border-line bg-surface px-4 text-[15px] font-medium text-ink transition-colors duration-200 hover:border-action"
      >
        <span className="text-muted">Trier :</span> {current.label}
        <ChevronDown
          aria-hidden
          strokeWidth={2}
          className={cn("size-5 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label="Trier les produits"
            aria-activedescendant={`${listId}-${active}`}
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 z-30 mt-2 w-56 rounded-md border border-line bg-surface p-1.5 shadow-e2"
          >
            {SORTS.map((s, i) => (
              <li
                key={s.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={s.value === value}
                onClick={() => select(i)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center justify-between rounded-sm px-3 text-[15px]",
                  i === active && "bg-action-tint",
                  s.value === value && "font-semibold"
                )}
              >
                {s.label}
                {s.value === value && <Check aria-hidden className="size-4" strokeWidth={2.5} />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
