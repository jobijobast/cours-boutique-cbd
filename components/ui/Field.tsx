"use client";

import { AlertTriangle, type LucideIcon } from "lucide-react";
import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  label: string;
  helper?: string;
  error?: string;
  icon?: LucideIcon;
  optional?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, helper, error, icon: Icon, optional, className, id, disabled, ...rest },
  ref
) {
  const auto = useId();
  const inputId = id ?? auto;
  const describedId = `${inputId}-desc`;
  const hasDesc = Boolean(error || helper);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={inputId} className={cn("text-[14px] font-semibold", disabled ? "text-muted" : "text-ink")}>
        {label}
        {optional && <span className="font-normal text-muted"> (facultatif)</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden
            strokeWidth={2}
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasDesc ? describedId : undefined}
          className={cn(
            "min-h-12 w-full rounded-md border-2 bg-surface px-4 text-body text-ink placeholder:text-muted",
            "transition-[border-color,box-shadow] duration-200 ease-out",
            "focus:border-focus focus-visible:outline-offset-1",
            Icon && "pl-12",
            error ? "border-alert" : "border-line hover:border-muted",
            disabled && "cursor-not-allowed bg-page text-muted hover:border-line"
          )}
          {...rest}
        />
      </div>
      {hasDesc && (
        <p
          id={describedId}
          className={cn("flex items-start gap-1.5 text-caption", error ? "font-medium text-alert" : "text-muted")}
        >
          {error && <AlertTriangle aria-hidden strokeWidth={2} className="mt-px size-4 shrink-0" />}
          {error ?? helper}
        </p>
      )}
    </div>
  );
});
