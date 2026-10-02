"use client";

import Link from "next/link";
import { AlertTriangle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/data/products";
import { PriceBlock, ProductVisual, Rating, StockLine, ThcBadge } from "./ProductBits";
import { useShop } from "./ShopProvider";

export function ProductCard({
  product,
  bestChoice,
  headingLevel = "h3",
}: {
  product: Product;
  bestChoice?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const { addToCart } = useShop();
  const Heading = headingLevel;
  const out = product.stock === "out";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-3 rounded-lg border-2 border-line bg-surface p-4 shadow-e1",
        "transition-[border-color,box-shadow,transform] duration-200 ease-out",
        "hover:border-action hover:shadow-e2 motion-safe:hover:-translate-y-0.5"
      )}
    >
      <div className="relative">
        <ProductVisual product={product} className="aspect-[4/3] rounded-md" />
        {bestChoice && (
          <span className="absolute left-3 top-3 rounded-pill bg-action px-3 py-1 text-caption font-semibold text-on-action">
            Meilleur choix pour vous
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Heading className="text-[19px] leading-snug">
          <Link
            href={`/produit/${product.slug}`}
            className="after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-[3px] focus-visible:after:outline-focus"
          >
            {product.name}
          </Link>
        </Heading>
        <p className="text-caption text-muted">{product.meta}</p>
      </div>

      <div>
        <ThcBadge lot={product.lot} />
      </div>

      <Rating rating={product.rating} reviews={product.reviews} />

      <div className="mt-auto flex flex-col gap-2">
        <PriceBlock product={product} />
        <StockLine status={product.stock} label={product.stockLabel} />
      </div>

      <Button
        fullWidth
        disabled={out}
        icon={out ? AlertTriangle : ShoppingBag}
        onClick={() => addToCart(product.slug)}
        className="relative z-10"
        aria-label={out ? `${product.name} : rupture de stock` : `Ajouter ${product.name} au panier`}
      >
        {out ? "Rupture de stock" : "Ajouter au panier"}
      </Button>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden className="flex h-full flex-col gap-3 rounded-lg border-2 border-line bg-surface p-4">
      <div className="skeleton aspect-[4/3] rounded-md" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-3.5 w-2/3" />
      <div className="skeleton h-6 w-44 rounded-pill" />
      <div className="skeleton h-3.5 w-28" />
      <div className="mt-2 flex justify-between">
        <div className="skeleton h-7 w-24" />
        <div className="skeleton h-4 w-16" />
      </div>
      <div className="skeleton h-3.5 w-20" />
      <div className="skeleton h-11 w-full rounded-pill" />
    </div>
  );
}
