"use client";

import Link from "next/link";
import { ArrowRight, Check, Package } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/data/products";
import { useAccount } from "@/lib/account";

type Order = { number: string; total: number; email: string; livraison: "relais" | "domicile"; items: number };

const BURST_COLORS = ["bg-action", "bg-success", "bg-alert-bg", "bg-trust", "bg-accent", "bg-alert"];

/** Petites pastilles qui jaillissent autour de la coche (célébration sobre) */
function Burst() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const dist = 70 + (i % 3) * 22;
        return (
          <motion.span
            key={i}
            className={`absolute size-2.5 rounded-full ${BURST_COLORS[i % BURST_COLORS.length]}`}
            style={{ left: -5, top: -5 }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: [0, 1.2, 0.6], opacity: [1, 1, 0] }}
            transition={{ duration: 1.1, delay: 0.25 + (i % 4) * 0.03, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      })}
    </div>
  );
}

export default function ConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const { hydrated, account } = useAccount();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("seve-last-order");
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      /* rien */
    }
  }, []);

  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-4 py-12 text-center md:py-20">
      <div className="relative">
        <Burst />
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="grid size-20 place-items-center rounded-full bg-accent text-success"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 15 }}
        >
          <Check aria-hidden className="size-10" strokeWidth={2.5} />
        </motion.span>
      </motion.span>
      </div>

      <h1 className="text-title">Commande validée !</h1>
      <p className="text-body text-muted">
        Livraison discrète sous 48 h. Un e-mail de suivi vous a été envoyé
        {order?.email ? (
          <>
            {" "}
            à <span className="font-semibold text-ink">{order.email}</span>
          </>
        ) : null}
        .
      </p>

      {order && (
        <div className="mt-2 w-full rounded-lg border border-line bg-surface p-5 text-left shadow-e1">
        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-caption text-muted">Commande</dt>
            <dd className="font-semibold tabular-nums">{order.number}</dd>
          </div>
          <div>
            <dt className="text-caption text-muted">Total payé</dt>
            <dd className="font-semibold">{formatPrice(order.total)}</dd>
          </div>
        </dl>
          <p className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-[15px]">
            <Package aria-hidden className="size-5 shrink-0" strokeWidth={2} />
            {order.livraison === "relais" ? "Point relais" : "À domicile"} · colis neutre, sans mention du contenu
          </p>
        </div>
      )}

      {hydrated && !account && order && (
        <div className="w-full rounded-lg border-2 border-dashed border-line bg-surface p-5 text-left">
          <p className="font-semibold">Suivez cette commande depuis votre compte</p>
          <p className="mt-1 text-[15px] text-muted">
            Créez un compte avec {order.email} en 1 minute : cette commande y apparaîtra automatiquement. C&apos;est
            facultatif.
          </p>
          <Link
            href={`/compte?email=${encodeURIComponent(order.email)}`}
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-semibold text-ink underline underline-offset-4"
          >
            Créer mon compte
            <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
          </Link>
        </div>
      )}

      <ButtonLink href="/boutique" size="lg" icon={ArrowRight} iconPosition="end" className="mt-4 w-full sm:w-auto">
        Continuer mes achats
      </ButtonLink>
      <Link href="/analyses" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
        Consulter les analyses labo
      </Link>
    </div>
  );
}
