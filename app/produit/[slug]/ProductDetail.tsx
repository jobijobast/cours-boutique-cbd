"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, Download, FlaskConical, Heart, Package, ShoppingBag } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { Breadcrumb } from "@/components/shop/Catalog";
import {
  InlineAlert,
  labReportHref,
  PriceBlock,
  ProductVisual,
  Rating,
  StockLine,
  ThcBadge,
} from "@/components/shop/ProductBits";
import { useShop } from "@/components/shop/ShopProvider";
import { cn } from "@/lib/cn";
import { formatPrice, getProduct, MAX_QTY } from "@/lib/data/products";
import { getOrigin, LAB_NAME } from "@/lib/data/origins";
import { QualitySeal } from "@/components/shop/QualitySeal";
import { SevePouch } from "@/components/shop/SevePouch";

const ITEM: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const GUARANTEES = ["Analyse labo pour chaque lot", "THC < 0,3 %", "Chanvre cultivé et transformé en France"];
const GUARANTEES_IMPORT = ["Contrôle Sève à réception", "THC < 0,3 % en masse", "Article de collection importé"];

export function ProductDetail({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  const { addToCart } = useShop();
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  const out = product.stock === "out";
  const origin = getOrigin(product.slug);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-28 pt-5 md:px-8 md:pt-8 lg:pb-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Breadcrumb
          items={[
            { href: "/", label: "Accueil" },
            { href: "/boutique", label: "Boutique" },
            { label: product.name },
          ]}
        />
        <Link
          href="/resultats"
          className="inline-flex min-h-11 items-center gap-1.5 self-start text-[15px] font-semibold text-ink underline-offset-4 hover:underline"
        >
          <ArrowLeft aria-hidden className="size-5" strokeWidth={2} />
          Retour aux résultats
        </Link>
      </div>

      <div className="mt-4 grid gap-6 md:mt-6 md:grid-cols-2 md:gap-12">
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProductVisual product={product} size="lg" priority className="aspect-[4/3] w-full rounded-lg md:aspect-[5/4]" />
          <button
            type="button"
            aria-pressed={fav}
            aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
            onClick={() => setFav((f) => !f)}
            className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-surface text-ink shadow-e1 transition-transform duration-200 hover:scale-105"
          >
            <motion.span
              key={String(fav)}
              initial={{ scale: fav ? 0.4 : 1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 12 }}
            >
              <Heart aria-hidden strokeWidth={2} className={cn("size-5 transition-colors", fav && "fill-current")} />
            </motion.span>
          </button>
        </motion.div>

        <motion.div
          className="flex flex-col gap-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
        >
          <motion.div variants={ITEM} className="flex flex-col gap-2">
            <h1 className="text-title">{product.name}</h1>
            <p className="text-muted">{product.meta}</p>
          </motion.div>
          <motion.div variants={ITEM} className="flex flex-wrap items-center gap-3">
            <ThcBadge lot={product.lot} />
            <Rating rating={product.rating} reviews={product.reviews} />
          </motion.div>
          <motion.p variants={ITEM} className="text-body">
            {product.description}
          </motion.p>

          <motion.div variants={ITEM} className="flex flex-col gap-2 border-t border-line pt-4">
            <PriceBlock product={product} large />
            <StockLine status={product.stock} label={product.stockLabel} />
          </motion.div>

          <motion.div variants={ITEM} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <QtyStepper value={qty} onChange={setQty} label="Quantité" className="self-start" />
            <Button
              size="lg"
              fullWidth
              className="hidden lg:inline-flex"
              disabled={out}
              icon={out ? AlertTriangle : ShoppingBag}
              onClick={() => addToCart(product.slug, { qty, goToCart: true })}
            >
              {out ? "Rupture de stock" : "Ajouter au panier"}
            </Button>
          </motion.div>
          {qty >= MAX_QTY && <InlineAlert>Maximum {MAX_QTY} par commande atteint.</InlineAlert>}

          <p className="flex items-center gap-2 text-caption text-muted">
            <Package aria-hidden className="size-4 text-ink" strokeWidth={2} />
            Livraison discrète en 48 h · point relais offert · domicile offert dès 50 €
          </p>

          {/* Analyse labo + traçabilité du lot */}
          <motion.section
            variants={ITEM}
            aria-labelledby="labo"
            className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5"
          >
            <div className="flex items-start gap-4">
              <QualitySeal size={76} />
              <div className="min-w-0 flex-1">
                <h2 id="labo" className="font-sans text-[16px] font-bold">
                  Analyse labo · Lot {product.lot}
                </h2>
                <p className="text-caption text-muted">
                  {LAB_NAME} · THC {origin?.thc ?? "< 0,3 %"} · pesticides et métaux lourds conformes
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-caption font-semibold text-success">
                  <FlaskConical aria-hidden className="size-4" strokeWidth={2} />
                  Label Sève Qualité Contrôlée
                </p>
              </div>
            </div>

            {origin && (
              <dl className="grid gap-x-6 gap-y-2 border-t border-line pt-4 text-[14px] sm:grid-cols-2">
                {[
                  ["Cultivé à", `${origin.culture} · ${origin.mode}`],
                  ["Récolte", origin.recolte],
                  ["Fabriqué à", origin.fabrication],
                  ["Conditionné", origin.conditionnement],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <dt className="text-caption font-semibold uppercase tracking-[0.04em] text-muted">{k}</dt>
                    <dd className="text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-caption text-muted">Lieux et laboratoire fictifs (prototype).</p>
              <a
                href={labReportHref(product.lot)}
                download={`analyse-${product.lot}.pdf`}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-pill border-2 border-action px-4 text-[15px] font-semibold text-ink transition-colors duration-200 hover:bg-action-tint"
              >
                <Download aria-hidden className="size-5" strokeWidth={2} />
                Télécharger le rapport <span className="font-normal text-muted">(PDF)</span>
              </a>
            </div>
          </motion.section>
        </motion.div>
      </div>

      {/* Mobile : action principale toujours accessible au-dessus des onglets */}
      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-[720px] items-center gap-4">
          <p className="flex flex-col leading-tight">
            <span className="text-caption text-muted">{qty > 1 ? `${qty} × ${formatPrice(product.price)}` : "Prix"}</span>
            <span className="text-[18px] font-bold">{formatPrice(product.price * qty)}</span>
          </p>
          <Button
            className="flex-1"
            disabled={out}
            icon={out ? AlertTriangle : ShoppingBag}
            onClick={() => addToCart(product.slug, { qty, goToCart: true })}
          >
            {out ? "Rupture de stock" : "Ajouter au panier"}
          </Button>
        </div>
      </div>

      {/* Cartes d'information (TP11) */}
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <section className="rounded-lg border border-line bg-surface p-5 shadow-e1">
          <h2 className="text-[19px]">Composition</h2>
          <p className="mt-2 text-[15px] text-muted">{product.composition}</p>
        </section>
        <section className="rounded-lg border border-line bg-surface p-5 shadow-e1">
          <h2 className="text-[19px]">Nos garanties</h2>
          <ul className="mt-2 flex flex-col gap-1.5">
            {(product.category === "gummies" ? GUARANTEES_IMPORT : GUARANTEES).map((g) => (
              <li key={g} className="flex items-start gap-2 text-[15px]">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2.5} />
                {g}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-line bg-surface p-5 shadow-e1">
          <h2 className="text-[19px]">Le format</h2>
          {product.category === "fleur" || product.category === "resine" ? (
            <div className="mt-3 grid h-40 place-items-center rounded-md bg-photo">
              <motion.div
                initial={{ opacity: 0, y: 10, rotate: -3 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, rotate: 2 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <SevePouch height={128} />
              </motion.div>
            </div>
          ) : (
            <ProductVisual product={product} size="sm" className="mt-3 h-14 rounded-sm" />
          )}
          <p className="mt-2 text-[15px] text-muted">{product.packaging}</p>
        </section>
      </div>
    </div>
  );
}
