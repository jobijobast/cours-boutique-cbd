"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { ShopProvider } from "@/components/shop/ShopProvider";
import { CartProvider } from "@/lib/cart";
import { AccountProvider } from "@/lib/account";
import { AdvisorProvider } from "@/components/advisor/AdvisorProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <AccountProvider>
      <CartProvider>
        <ToastProvider>
          <ShopProvider>
            <AdvisorProvider>{children}</AdvisorProvider>
          </ShopProvider>
        </ToastProvider>
      </CartProvider>
      </AccountProvider>
    </MotionConfig>
  );
}
