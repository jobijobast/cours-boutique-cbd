"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, MAX_QTY, type Product } from "./data/products";
import { readStorage, writeStorage } from "./storage";

export type CartLine = { slug: string; qty: number };
export type CartLineWithProduct = CartLine & { product: Product };

type CartContextValue = {
  hydrated: boolean;
  lines: CartLineWithProduct[];
  count: number;
  subtotal: number;
  /** Retourne la quantité réellement ajoutée (plafond MAX_QTY) */
  add: (slug: string, qty?: number) => { added: number; capped: boolean };
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CART_KEY = "seve-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRaw(readStorage<CartLine[]>(CART_KEY, []).filter((l) => getProduct(l.slug)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(CART_KEY, raw);
  }, [raw, hydrated]);

  const add = useCallback(
    (slug: string, qty = 1) => {
      const current = raw.find((l) => l.slug === slug)?.qty ?? 0;
      const next = Math.min(MAX_QTY, current + qty);
      const added = next - current;
      setRaw((list) =>
        list.some((l) => l.slug === slug)
          ? list.map((l) => (l.slug === slug ? { ...l, qty: next } : l))
          : [...list, { slug, qty: next }]
      );
      return { added, capped: current + qty > MAX_QTY };
    },
    [raw]
  );

  const setQty = useCallback((slug: string, qty: number) => {
    const q = Math.max(1, Math.min(MAX_QTY, qty));
    setRaw((list) => list.map((l) => (l.slug === slug ? { ...l, qty: q } : l)));
  }, []);

  const remove = useCallback((slug: string) => setRaw((list) => list.filter((l) => l.slug !== slug)), []);
  const clear = useCallback(() => setRaw([]), []);

  const value = useMemo<CartContextValue>(() => {
    const lines = raw
      .map((l) => ({ ...l, product: getProduct(l.slug)! }))
      .filter((l) => l.product);
    return {
      hydrated,
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: Math.round(lines.reduce((n, l) => n + l.qty * l.product.price, 0) * 100) / 100,
      add,
      setQty,
      remove,
      clear,
    };
  }, [raw, hydrated, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
