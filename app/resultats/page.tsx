import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/shop/Catalog";

export const metadata: Metadata = { title: "Vos produits adaptés" };

export default function ResultatsPage() {
  return (
    <Suspense>
      <Catalog mode="results" />
    </Suspense>
  );
}
