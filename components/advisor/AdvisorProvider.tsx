"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AdvisorPanel } from "./AdvisorPanel";

type AdvisorContextValue = {
  isOpen: boolean;
  /** Ouvre le conseiller ; `prompt` envoie directement un premier message */
  open: (prompt?: string) => void;
  close: () => void;
};

const AdvisorContext = createContext<AdvisorContextValue | null>(null);

export function AdvisorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const open = useCallback((prompt?: string) => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setPending(prompt ?? null);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => returnFocus.current?.focus?.(), 50);
  }, []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <AdvisorContext.Provider value={value}>
      {children}
      <AdvisorPanel open={isOpen} onOpen={() => open()} onClose={close} pendingPrompt={pending} onPromptConsumed={() => setPending(null)} />
    </AdvisorContext.Provider>
  );
}

export function useAdvisor() {
  const ctx = useContext(AdvisorContext);
  if (!ctx) throw new Error("useAdvisor doit être utilisé dans <AdvisorProvider>");
  return ctx;
}
