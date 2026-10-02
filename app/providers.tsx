"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { ShopProvider } from "@/components/shop/ShopProvider";
import { CartProvider } from "@/lib/cart";
import { AdvisorProvider } from "@/components/advisor/AdvisorProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <ToastProvider>
          <ShopProvider>
            <AdvisorProvider>{children}</AdvisorProvider>
          </ShopProvider>
        </ToastProvider>
      </CartProvider>
    </MotionConfig>
  );
}
