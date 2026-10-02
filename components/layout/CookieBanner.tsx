"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { readStorage, writeStorage } from "@/lib/storage";
import { AGE_EVENT, AGE_KEY } from "./AgeGate";

const COOKIE_KEY = "seve-cookies";

/** Bandeau cookies : « Refuser » exactement aussi visible que « Accepter ». */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => {
      const age = readStorage<string | null>(AGE_KEY, null) === "yes";
      const choice = readStorage<string | null>(COOKIE_KEY, null);
      setVisible(age && !choice);
    };
    check();
    window.addEventListener(AGE_EVENT, check);
    return () => window.removeEventListener(AGE_EVENT, check);
  }, []);

  const choose = (value: "accepted" | "refused") => {
    writeStorage(COOKIE_KEY, value);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          aria-label="Gestion des cookies"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-[76px] z-50 lg:bottom-6 rounded-lg border border-line bg-surface p-4 shadow-e3 md:inset-x-auto md:left-6 md:max-w-[440px] md:p-6"
        >
          <h2 className="font-sans text-[16px] font-bold">Vos cookies, votre choix</h2>
          <p className="mt-1.5 text-[14px] text-muted">
            Nous mesurons l&apos;audience seulement si vous l&apos;acceptez. Les cookies nécessaires au panier restent
            actifs.{" "}
            <Link href="/legal/cookies" className="font-semibold text-ink underline underline-offset-4">
              En savoir plus
            </Link>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => choose("refused")}>
              Refuser
            </Button>
            <Button variant="secondary" onClick={() => choose("accepted")}>
              Accepter
            </Button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
