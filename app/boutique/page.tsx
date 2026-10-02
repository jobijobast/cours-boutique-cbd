import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/shop/Catalog";

export const metadata: Metadata = { title: "Boutique" };

export default function BoutiquePage() {
  return (
    <Suspense>
      <Catalog mode="boutique" />
    </Suspense>
  );
}
