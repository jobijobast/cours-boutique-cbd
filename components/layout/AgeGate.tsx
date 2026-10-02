"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { readStorage, removeStorage, writeStorage } from "@/lib/storage";

export const AGE_KEY = "seve-age";
export const AGE_EVENT = "seve-age-ok";

type GateState = "checking" | "ask" | "denied" | "ok";

/** Porte 18+ : obligatoire avant tout produit. Réponse mémorisée. */
export function AgeGate() {
  const [state, setState] = useState<GateState>("checking");

  useEffect(() => {
    setState(readStorage<string | null>(AGE_KEY, null) === "yes" ? "ok" : "ask");
  }, []);

  const accept = () => {
    writeStorage(AGE_KEY, "yes");
    setState("ok");
    window.dispatchEvent(new Event(AGE_EVENT));
  };

  if (state === "ok") return null;

  if (state === "checking") {
    return <div aria-hidden className="fixed inset-0 z-[55] bg-page" />;
  }

  if (state === "denied") {
    return (
      <div className="fixed inset-0 z-[55] grid place-items-center bg-page px-4">
        <div className="flex max-w-md flex-col items-center gap-4 text-center" role="alert">
          <p className="font-display text-[26px] font-semibold">Sève</p>
          <h1 className="text-title">À bientôt</h1>
          <p className="text-muted">
            La vente de CBD est réservée aux adultes. Vous pouvez fermer cet onglet ; aucune donnée n&apos;a été
            enregistrée.
          </p>
          <Button
            variant="text"
            onClick={() => {
              removeStorage(AGE_KEY);
              setState("ask");
            }}
          >
            Je me suis trompé·e de réponse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div aria-hidden className="fixed inset-0 z-[55] bg-page" />
    <Modal
      open
      opaque
      dismissible={false}
      onClose={() => undefined}
      eyebrow={<p className="font-display text-[26px] font-semibold leading-none">Sève</p>}
      title="Avant d'entrer"
      primary={{ label: "J'ai 18 ans ou plus", icon: Check, onClick: accept }}
      secondary={{ label: "Non, quitter le site", onClick: () => setState("denied") }}
    >
      La vente de CBD est réservée aux adultes. Avez-vous 18 ans ou plus ?
    </Modal>
    </>
  );
}
