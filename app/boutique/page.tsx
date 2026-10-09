import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/shop/Catalog";
import { ProductFinderPrompt } from "@/components/shop/ProductFinderPrompt";

export const metadata: Metadata = { title: "Nos produits" };

export default function BoutiquePage() {
  return (
    <Suspense>
      <Catalog mode="boutique" />
      <ProductFinderPrompt />
    </Suspense>
  );
}
