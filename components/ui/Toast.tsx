"use client";

import { AlertTriangle, Check, Info, X } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ToastType = "success" | "error" | "info";

type ToastInput = {
  type: ToastType;
  message: string;
  action?: { label: string; href: string };
};
type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<{ show: (t: ToastInput) => void } | null>(null);

const DURATION = 3000;

const styles: Record<ToastType, { border: string; icon: typeof Check; iconClass: string; label: string }> = {
  success: { border: "border-l-success", icon: Check, iconClass: "text-success", label: "Succès" },
  error: { border: "border-l-alert", icon: AlertTriangle, iconClass: "text-alert", label: "Erreur" },
  info: { border: "border-l-action", icon: Info, iconClass: "text-ink", label: "Information" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const reduce = useReducedMotion();

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (t: ToastInput) => {
      const id = nextId.current++;
      setItems((list) => [...list.slice(-2), { ...t, id }]);
      window.setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-[88px] z-[70] flex flex-col items-center gap-3 lg:inset-x-auto lg:bottom-24 lg:right-6 lg:items-end"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const s = styles[t.type];
            const Icon = s.icon;
            return (
              <motion.div
                key={t.id}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "pointer-events-auto flex w-full max-w-[400px] items-start gap-3 rounded-md border border-l-4 border-line bg-surface py-3 pl-4 pr-2 shadow-e3",
                  t.type === "error" && "bg-alert-bg",
                  s.border
                )}
              >
                <Icon aria-hidden strokeWidth={2} className={cn("mt-0.5 size-5 shrink-0", s.iconClass)} />
                <div className="flex flex-1 flex-col gap-1 py-0.5">
                  <p className="text-[15px] font-medium text-ink">
                    <span className="sr-only">{s.label} : </span>
                    {t.message}
                  </p>
                  {t.action && (
                    <Link
                      href={t.action.href}
                      onClick={() => dismiss(t.id)}
                      className="self-start text-[14px] font-semibold text-ink underline underline-offset-4"
                    >
                      {t.action.label}
                    </Link>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Fermer le message"
                  className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-action-tint hover:text-ink"
                >
                  <X aria-hidden className="size-5" strokeWidth={2} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans <ToastProvider>");
  return ctx;
}

/** Aperçu statique pour le design system */
export function ToastPreview({ type, message }: { type: ToastType; message: string }) {
  const s = styles[type];
  const Icon = s.icon;
  return (
    <div
      className={cn(
        "flex w-full max-w-[400px] items-start gap-3 rounded-md border border-l-4 border-line bg-surface px-4 py-3 shadow-e3",
        type === "error" && "bg-alert-bg",
        s.border
      )}
    >
      <Icon aria-hidden strokeWidth={2} className={cn("mt-0.5 size-5 shrink-0", s.iconClass)} />
      <p className="text-[15px] font-medium">
        <span className="sr-only">{s.label} : </span>
        {message}
      </p>
    </div>
  );
}
