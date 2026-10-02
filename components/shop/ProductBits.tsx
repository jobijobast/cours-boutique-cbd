import Image from "next/image";
import { AlertTriangle, ArrowUpRight, Check, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  FREE_SHIPPING_THRESHOLD,
  formatPrice,
  formatRating,
  type Category,
  type Product,
  type StockStatus,
} from "@/lib/data/products";

const visualBg: Record<Category, string> = {
  huile: "bg-visuel-huile",
  gummies: "bg-visuel-gummies",
  fleur: "bg-visuel-fleur",
  resine: "bg-visuel-resine",
  coffret: "bg-visuel-coffret",
};

const photoSizes = {
  sm: "96px",
  md: "(max-width: 767px) 100vw, 440px",
  lg: "(max-width: 767px) 100vw, 640px",
};

/**
 * Bloc visuel produit : photo (fond blanc fondu dans le fond photo) si disponible,
 * sinon fond de format + nom du format en Fraunces Light Italic.
 */
export function ProductVisual({
  product,
  size = "md",
  className,
  priority,
}: {
  product: Pick<Product, "category" | "format"> & Partial<Pick<Product, "image" | "name">>;
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}) {
  if (product.image) {
    return (
      <div className={cn("relative overflow-hidden bg-photo", className)}>
        <Image
          src={product.image}
          alt={product.name ? `${product.name}, ${product.format.toLowerCase()}` : product.format}
          fill
          sizes={photoSizes[size]}
          priority={priority}
          className={cn(
            "object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.06]",
            size === "sm" ? "p-1" : "p-3 md:p-4"
          )}
        />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={`Visuel du format ${product.format.toLowerCase()}`}
      className={cn("grid place-items-center", visualBg[product.category], className)}
    >
      <span
        aria-hidden
        className={cn(
          "font-display font-light italic text-ink/80",
          size === "sm" && "text-[15px]",
          size === "md" && "text-[34px]",
          size === "lg" && "text-[56px] md:text-[80px]"
        )}
      >
        {product.format}
      </span>
    </div>
  );
}

export function labReportHref(lot: string) {
  return `/analyses/${lot}.pdf`;
}

/** Badge transparence : THC < 0,3 % + lien vers l'analyse du lot */
export function ThcBadge({ lot, className }: { lot: string; className?: string }) {
  return (
    <a
      href={labReportHref(lot)}
      target="_blank"
      rel="noopener"
      className={cn(
        "relative z-10 inline-flex min-h-7 items-center gap-1 rounded-pill bg-accent px-2.5 py-1 text-caption font-medium text-ink",
        "underline-offset-2 transition-colors duration-200 hover:underline",
        className
      )}
    >
      THC &lt; 0,3 % · Analyse labo
      <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={2} />
      <span className="sr-only">(lot {lot}, PDF, nouvel onglet)</span>
    </a>
  );
}

export function Rating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <p className="flex items-center gap-1 text-caption text-muted">
      <Star aria-hidden className="size-3.5 fill-current text-ink" strokeWidth={2} />
      <span className="font-semibold text-ink">{formatRating(rating)}</span>
      <span>({reviews} avis)</span>
      <span className="sr-only">sur 5</span>
    </p>
  );
}

/** Stock : pastille + libellé (jamais la couleur seule) */
export function StockLine({ status, label }: { status: StockStatus; label: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-caption font-medium",
        status === "in" ? "text-success" : "text-alert"
      )}
    >
      <span aria-hidden className="size-2 rounded-full bg-current" />
      {label}
    </p>
  );
}

export function PriceBlock({ product, large }: { product: Product; large?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <p className={cn("font-bold tracking-tight", large ? "text-[28px] md:text-[32px]" : "text-[22px]")}>
        {formatPrice(product.price)}
      </p>
      {product.unitPrice && <p className="text-caption text-muted">{product.unitPrice}</p>}
    </div>
  );
}

/** Barre de progression vers la livraison offerte */
export function FreeShippingBar({ subtotal, className }: { subtotal: number; className?: string }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const reached = remaining === 0;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className={cn("flex items-center gap-1.5 text-caption", reached ? "font-semibold text-success" : "text-muted")}>
        {reached ? (
          <>
            <Check aria-hidden className="size-4" strokeWidth={2.5} />
            Livraison à domicile offerte
          </>
        ) : (
          <>
            Plus que <span className="font-semibold text-ink">{formatPrice(remaining)}</span> pour la livraison à
            domicile offerte
          </>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Progression vers la livraison offerte"
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_THRESHOLD}
        aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
        aria-valuetext={reached ? "Livraison offerte atteinte" : `Encore ${formatPrice(remaining)}`}
        className="h-2 overflow-hidden rounded-pill bg-accent"
      >
        <div
          className="h-full rounded-pill bg-action transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function InlineAlert({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p role="alert" className={cn("flex items-start gap-1.5 text-caption font-medium text-alert", className)}>
      <AlertTriangle aria-hidden className="mt-px size-4 shrink-0" strokeWidth={2} />
      {children}
    </p>
  );
}
