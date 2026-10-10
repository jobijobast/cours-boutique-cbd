"use client";

import Link from "next/link";
import { ArrowRight, Lock, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { useToast } from "@/components/ui/Toast";
import { FreeShippingBar, InlineAlert, ProductVisual } from "@/components/shop/ProductBits";
import { useCart } from "@/lib/cart";
import { formatPrice, getProduct, MAX_QTY } from "@/lib/data/products";

export default function PanierPage() {
  const cart = useCart();
  const { show } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [justCleared, setJustCleared] = useState(false);
  // Produit ajouté par un questionnaire (?reco=slug)
  const [recoSlug, setRecoSlug] = useState<string | null>(null);
  useEffect(() => {
    setRecoSlug(new URLSearchParams(window.location.search).get("reco"));
  }, []);


  const n = cart.count;

  if (!cart.hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8" aria-busy="true">
        <div className="skeleton h-9 w-56" />
        <div className="skeleton mt-6 h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-4 py-16 text-center md:px-8">
        <span className="grid size-16 place-items-center rounded-full bg-accent">
          <ShoppingBag aria-hidden className="size-7" strokeWidth={2} />
        </span>
        <h1 className="text-title">Votre panier est vide</h1>
        <p role="status" className="text-muted">
          {justCleared
            ? "Les articles ont bien été retirés."
            : "Trouvez le produit adapté à votre routine en 3 questions, ou parcourez nos produits."}
        </p>
        <ButtonLink href="/boutique" icon={ArrowRight} iconPosition="end" size="lg" className="w-full sm:w-auto">
          Découvrir nos produits
        </ButtonLink>
        <Link href="/quiz" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
          ou faire le quiz (1 min)
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-28 pt-6 md:px-8 md:pt-10 lg:pb-8">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-title">
          Votre panier <span className="font-sans text-[18px] font-medium text-muted">({n} article{n > 1 ? "s" : ""})</span>
        </h1>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <section aria-label="Articles du panier">
          {recoSlug && cart.lines.some((l) => l.slug === recoSlug) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex items-start gap-3 rounded-lg bg-accent p-4"
            >
              <Sparkles aria-hidden className="mt-0.5 size-5 shrink-0" strokeWidth={2} />
              <p className="text-[15px]">
                <span className="font-semibold">{getProduct(recoSlug)?.name}</span> a été choisi pour vous d&apos;après
                vos réponses. Vous pouvez changer la quantité, le retirer ou{" "}
                <Link href="/boutique" className="font-semibold underline underline-offset-4">
                  voir nos autres produits
                </Link>
                .
              </p>
            </motion.div>
          )}
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {cart.lines.map(({ slug, qty, product }) => (
                <motion.li
                  key={slug}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex gap-4 rounded-lg border border-line bg-surface p-4 shadow-e1"
                >
                  <ProductVisual product={product} size="sm" className="size-16 shrink-0 rounded-md md:size-24" />
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-[17px] leading-snug">
                          <Link href={`/produit/${slug}`} className="hover:underline">
                            {product.name}
                          </Link>
                        </h2>
                        <p className="text-caption text-muted">{product.meta}</p>
                        <p className="text-caption text-muted">{formatPrice(product.price)} l&apos;unité</p>
                      </div>
                      <p className="shrink-0 text-[17px] font-bold">{formatPrice(product.price * qty)}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <QtyStepper
                        value={qty}
                        onChange={(v) => cart.setQty(slug, v)}
                        label={`Quantité pour ${product.name}`}
                      />
                      <Button
                        variant="text"
                        icon={Trash2}
                        onClick={() => {
                          cart.remove(slug);
                          show({ type: "info", message: `${product.name} retiré du panier.` });
                        }}
                        aria-label={`Retirer ${product.name} du panier`}
                      >
                        Retirer
                      </Button>
                    </div>
                    {qty >= MAX_QTY && <InlineAlert>Maximum {MAX_QTY} par commande atteint.</InlineAlert>}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <Button variant="text" icon={Trash2} className="mt-3" onClick={() => setConfirmOpen(true)}>
            Vider le panier
          </Button>
        </section>

        <aside
          aria-labelledby="recap"
          className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 shadow-e1 lg:sticky lg:top-24 md:p-6"
        >
          <h2 id="recap" className="text-subtitle">
            Récapitulatif
          </h2>
          <dl className="flex flex-col gap-2 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-muted">Sous-total</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Livraison point relais</dt>
              <dd className="font-medium text-success">Offerte</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-[18px] font-bold">
              <dt>Total</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </div>
          </dl>
          <FreeShippingBar subtotal={cart.subtotal} />
          <ButtonLink href="/paiement" size="lg" fullWidth icon={ArrowRight} iconPosition="end" className="hidden lg:inline-flex">
            Passer commande
          </ButtonLink>
          <p className="flex items-center justify-center gap-1.5 text-caption text-muted">
            <Lock aria-hidden className="size-3.5" strokeWidth={2} />
            Paiement sécurisé · commande sans création de compte
          </p>
        </aside>
      </div>

      {/* Mobile : action principale toujours accessible au-dessus des onglets */}
      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-[720px] items-center gap-4">
          <p className="flex flex-col leading-tight">
            <span className="text-caption text-muted">Total</span>
            <span className="text-[18px] font-bold">{formatPrice(cart.subtotal)}</span>
          </p>
          <ButtonLink href="/paiement" icon={ArrowRight} iconPosition="end" className="flex-1">
            Passer commande
          </ButtonLink>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Vider le panier ?"
        primary={{
          label: "Vider le panier",
          icon: Trash2,
          onClick: () => {
            setConfirmOpen(false);
            cart.clear();
            setJustCleared(true);
          },
        }}
        secondary={{ label: "Annuler", onClick: () => setConfirmOpen(false) }}
      >
        {n} article{n > 1 ? "s seront retirés" : " sera retiré"}. Vous pourrez {n > 1 ? "les" : "le"} rajouter plus
        tard.
      </Modal>
    </div>
  );
}
