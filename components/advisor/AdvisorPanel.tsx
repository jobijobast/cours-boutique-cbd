"use client";

import { usePathname } from "next/navigation";
import { RotateCcw, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { ChatComposer, ChatMessages, useAdvisorChat } from "./chat";

const SUGGESTIONS = [
  "Je veux me détendre ce soir",
  "J'adore les saveurs fruitées",
  "Je débute avec le CBD",
  "Une idée à moins de 15 €",
];

export const ADVISOR_INTRO = (
  <p>
    Bonjour, je suis le conseiller Sève. Dites-moi votre <strong className="font-semibold">humeur</strong>, le{" "}
    <strong className="font-semibold">moment</strong> et les <strong className="font-semibold">saveurs</strong> que vous
    aimez : je vous propose le produit le plus adapté.
  </p>
);

export function AdvisorPanel({
  open,
  onOpen,
  onClose,
  pendingPrompt,
  onPromptConsumed,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  pendingPrompt: string | null;
  onPromptConsumed: () => void;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const chat = useAdvisorChat("seve-advisor");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Défilement automatique
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [chat.messages, reduce, open]);

  // Focus et Échap
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Message envoyé à l'ouverture (ex. depuis un bouton « Demander au conseiller »)
  const { send } = chat;
  useEffect(() => {
    if (open && pendingPrompt) {
      onPromptConsumed();
      void send(pendingPrompt);
    }
  }, [open, pendingPrompt, onPromptConsumed, send]);

  // Pas de lanceur sur la page « Trouver mon CBD » (le conseiller y est intégré),
  // ni sur mobile là où une barre d'action fixe occupe le bas de l'écran
  const onQuiz = pathname.startsWith("/quiz");
  const crowded = /^\/(panier|paiement|confirmation|produit)/.test(pathname);

  return (
    <>
      <AnimatePresence>
        {!open && !onQuiz && (
          <motion.button
            type="button"
            onClick={onOpen}
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 26, delay: 0.4 }}
            whileHover={reduce ? undefined : { y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "fixed bottom-[84px] right-4 z-40 items-center gap-2 rounded-pill border-2 border-action bg-surface py-2.5 pl-3 pr-4 text-[15px] font-semibold text-ink shadow-e2",
              "lg:bottom-6 lg:right-6",
              crowded ? "hidden lg:inline-flex" : "inline-flex"
            )}
          >
            <span className="relative grid size-7 place-items-center rounded-full bg-accent">
              {!reduce && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full border-2 border-action"
                  animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", repeatDelay: 1.2 }}
                />
              )}
              <Sparkles aria-hidden className="size-4" strokeWidth={2} />
            </span>
            Conseiller IA
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              aria-hidden
              className="fixed inset-0 z-[64] bg-scrim lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.section
              role="dialog"
              aria-label="Conseiller Sève"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              style={{ transformOrigin: "bottom right" }}
              className={cn(
                "fixed z-[65] flex flex-col overflow-hidden border border-line bg-page shadow-e3",
                "inset-x-0 bottom-0 h-[88dvh] rounded-t-lg",
                "lg:inset-x-auto lg:bottom-6 lg:right-6 lg:h-[min(680px,calc(100dvh-120px))] lg:w-[420px] lg:rounded-lg"
              )}
            >
              <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
                <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-action text-on-action">
                  <Sparkles aria-hidden className="size-5" strokeWidth={2} />
                  <span aria-hidden className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-success" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-[18px] leading-tight">Conseiller Sève</h2>
                  <p className="text-[12px] text-muted">IA · selon vos goûts et votre humeur du moment</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    chat.reset();
                    inputRef.current?.focus();
                  }}
                  aria-label="Nouvelle conversation"
                  className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-action-tint"
                >
                  <RotateCcw aria-hidden className="size-5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fermer le conseiller"
                  className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-action-tint"
                >
                  <X aria-hidden className="size-5" strokeWidth={2} />
                </button>
              </header>

              <div
                ref={listRef}
                role="log"
                aria-live="polite"
                aria-busy={chat.busy}
                className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
              >
                <ChatMessages chat={chat} intro={ADVISOR_INTRO} suggestions={SUGGESTIONS} />
              </div>

              <div className="border-t border-line bg-surface px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
                <ChatComposer chat={chat} inputRef={inputRef} />
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
