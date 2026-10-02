"use client";

import { X, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { cn } from "@/lib/cn";

type Action = { label: string; onClick: () => void; icon?: LucideIcon; loading?: boolean };

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Pastille au-dessus du titre (ex. « Rupture de stock ») */
  eyebrow?: ReactNode;
  children?: ReactNode;
  primary?: Action;
  secondary?: Action;
  /** false = porte d'entrée (âge) : ni Échap, ni clic extérieur, ni X */
  dismissible?: boolean;
  /** Voile opaque (masque totalement la page) */
  opaque?: boolean;
  className?: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  primary,
  secondary,
  dismissible = true,
  opaque,
  className,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const first =
        panel.querySelector<HTMLElement>("[data-autofocus]") ?? panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus();
    }, 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === "Tab" && panelRef.current) {
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      returnFocus.current?.focus?.();
    };
  }, [open, dismissible]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6">
          <motion.div
            aria-hidden
            className={cn("absolute inset-0", opaque ? "bg-page" : "bg-scrim")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismissible ? onClose : undefined}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={children ? descId : undefined}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative w-full bg-surface p-6 shadow-e3 md:max-w-[460px] md:rounded-lg md:p-8",
              "rounded-t-lg pb-[max(24px,env(safe-area-inset-bottom))] md:pb-8",
              opaque && "md:border md:border-line",
              className
            )}
          >
            <span aria-hidden className="mx-auto mb-4 block h-1 w-10 rounded-pill bg-line md:hidden" />
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-ink transition-colors duration-200 hover:bg-action-tint"
              >
                <X aria-hidden className="size-6" strokeWidth={2} />
              </button>
            )}
            {eyebrow && <div className="mb-3">{eyebrow}</div>}
            <h2 id={titleId} className="pr-10 text-subtitle">
              {title}
            </h2>
            {children && (
              <div id={descId} className="mt-3 text-body text-muted">
                {children}
              </div>
            )}
            {(primary || secondary) && (
              <div className="mt-6 flex flex-col gap-3">
                {primary && (
                  <Button
                    data-autofocus
                    fullWidth
                    icon={primary.icon}
                    loading={primary.loading}
                    onClick={primary.onClick}
                  >
                    {primary.label}
                  </Button>
                )}
                {secondary && (
                  <Button variant="secondary" fullWidth icon={secondary.icon} onClick={secondary.onClick}>
                    {secondary.label}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
