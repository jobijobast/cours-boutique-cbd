"use client";

import { Check } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ControlProps = {
  label: ReactNode;
  description?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const peerFocus =
  "peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-focus peer-focus-visible:outline-offset-2";

const rowClass = (disabled?: boolean) =>
  cn(
    "group relative flex min-h-11 items-center gap-3 rounded-sm py-1 text-body",
    disabled ? "cursor-not-allowed text-muted" : "cursor-pointer text-ink"
  );

/** Case à cocher : choix multiples */
export function Checkbox({ label, description, className, disabled, ...rest }: ControlProps) {
  return (
    <label className={cn(rowClass(disabled), className)}>
      <input type="checkbox" className="peer sr-only" disabled={disabled} {...rest} />
      <span
        aria-hidden
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-sm border-2 border-muted bg-surface",
          "transition-[background-color,border-color] duration-200 ease-out",
          "peer-checked:border-action peer-checked:bg-action peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100",
          "group-hover:border-action",
          peerFocus,
          disabled && "opacity-50"
        )}
      >
        <Check
          strokeWidth={3}
          className="size-4 scale-50 text-on-action opacity-0 transition-[transform,opacity] duration-200 ease-out"
        />
      </span>
      <span className="flex flex-col">
        <span>{label}</span>
        {description && <span className="text-caption text-muted">{description}</span>}
      </span>
    </label>
  );
}

/** Bouton radio : un seul choix dans une liste */
export function Radio({ label, description, className, disabled, ...rest }: ControlProps) {
  return (
    <label className={cn(rowClass(disabled), className)}>
      <input type="radio" className="peer sr-only" disabled={disabled} {...rest} />
      <span
        aria-hidden
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full border-2 border-muted bg-surface",
          "transition-[border-color] duration-200 ease-out group-hover:border-action",
          "peer-checked:border-action peer-checked:[&>span]:scale-100",
          peerFocus,
          disabled && "opacity-50"
        )}
      >
        <span className="size-3 scale-0 rounded-full bg-action transition-transform duration-200 ease-out" />
      </span>
      <span className="flex flex-col">
        <span>{label}</span>
        {description && <span className="text-caption text-muted">{description}</span>}
      </span>
    </label>
  );
}

/** Interrupteur : effet immédiat */
export function Toggle({ label, description, className, disabled, ...rest }: ControlProps) {
  return (
    <label className={cn(rowClass(disabled), className)}>
      <input type="checkbox" role="switch" className="peer sr-only" disabled={disabled} {...rest} />
      <span
        aria-hidden
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-pill border-2 border-muted bg-surface",
          "transition-[background-color,border-color] duration-200 ease-out",
          "peer-checked:border-action peer-checked:bg-action",
          "peer-checked:[&>span]:translate-x-5 peer-checked:[&>span]:bg-on-action",
          peerFocus,
          disabled && "opacity-50"
        )}
      >
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-muted transition-[transform,background-color] duration-200 ease-out" />
      </span>
      <span className="flex flex-col">
        <span>{label}</span>
        {description && <span className="text-caption text-muted">{description}</span>}
      </span>
    </label>
  );
}
