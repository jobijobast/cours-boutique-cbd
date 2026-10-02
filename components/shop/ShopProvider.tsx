"use client";

import { AlertTriangle, ArrowRight, Bell, Check, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/lib/cart";
import { EDGE, formatPrice, getProduct, MAX_QTY, type Product } from "@/lib/data/products";
import { isEdgeActive } from "@/lib/demo";
import { FreeShippingBar } from "./ProductBits";

/** toast : force un toast (au lieu du panneau mobile), ex. depuis le conseiller */
type AddOptions = { qty?: number; goToCart?: boolean; toast?: boolean };

type Flight = { id: number; product: Product; from: { x: number; y: number }; to: { x: number; y: number } };

const ShopContext = createContext<{ addToCart: (slug: string, opts?: AddOptions) => void } | null>(null);

function isMobile() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const cart = useCart();
  const { show } = useToast();
  const router = useRouter();
  const [rupture, setRupture] = useState<AddOptions | null>(null);
  const [added, setAdded] = useState<Product | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const reduce = useReducedMotion();

  /** Petit visuel qui « vole » du bouton cliqué jusqu'au panier */
  const fly = useCallback(
    (product: Product) => {
      if (reduce) return;
      const target = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]")).find(
        (el) => el.offsetParent !== null
      );
      if (!target) return;
      const origin = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
        ? document.activeElement.getBoundingClientRect()
        : new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0);
      const to = target.getBoundingClientRect();
      const id = Date.now() + Math.random();
      setFlights((f) => [
        ...f,
        {
          id,
          product,
          from: { x: origin.left + origin.width / 2, y: origin.top + origin.height / 2 },
          to: { x: to.left + to.width / 2, y: to.top + to.height / 2 },
        },
      ]);
      window.setTimeout(() => setFlights((f) => f.filter((x) => x.id !== id)), 900);
    },
    [reduce]
  );

  const doAdd = useCallback(
    (slug: string, opts: AddOptions = {}) => {
      const product = getProduct(slug);
      if (!product) return;
      const { added: n } = cart.add(slug, opts.qty ?? 1);
      if (n === 0) {
        show({ type: "error", message: `Maximum ${MAX_QTY} par commande atteint pour ${product.name}.` });
        return;
      }
      fly(product);
      if (opts.goToCart && !isMobile()) {
        router.push("/panier");
        show({ type: "success", message: `Ajouté au panier · ${product.name}` });
      } else if (isMobile() && !opts.toast) {
        setAdded(product);
      } else {
        show({
          type: "success",
          message: `Ajouté au panier · ${product.name}`,
          action: { label: "Voir mon panier", href: "/panier" },
        });
      }
    },
    [cart, router, show, fly]
  );

  const addToCart = useCallback(
    (slug: string, opts: AddOptions = {}) => {
      if (slug === EDGE.product && isEdgeActive()) {
        setRupture(opts);
        return;
      }
      doAdd(slug, opts);
    },
    [doAdd]
  );

  const value = useMemo(() => ({ addToCart }), [addToCart]);
  const edgeProduct = getProduct(EDGE.product)!;
  const replacement = getProduct(EDGE.replacement)!;

  return (
    <ShopContext.Provider value={value}>
      {children}

      {/* Vol vers le panier */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[75]">
        <AnimatePresence>
          {flights.map((f) => {
            const dx = f.to.x - f.from.x;
            const dy = f.to.y - f.from.y;
            return (
              <motion.div
                key={f.id}
                className="absolute grid size-12 place-items-center overflow-hidden rounded-full border-2 border-action bg-photo shadow-e3"
                style={{ left: f.from.x - 24, top: f.from.y - 24 }}
                initial={{ x: 0, y: 0, scale: 0.6, opacity: 0 }}
                animate={{
                  x: [0, dx * 0.45, dx],
                  y: [0, Math.min(dy, 0) - 90, dy],
                  scale: [0.6, 1.1, 0.35],
                  opacity: [0, 1, 0.3],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, times: [0, 0.4, 1], ease: [0.33, 0, 0.2, 1] }}
              >
                {f.product.image ? (
                  <Image src={f.product.image} alt="" width={48} height={48} className="object-contain p-1 mix-blend-multiply" />
                ) : (
                  <ShoppingBag className="size-5 text-ink" strokeWidth={2} />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Edge Case : rupture pendant l'ajout */}
      <Modal
        open={rupture !== null}
        onClose={() => setRupture(null)}
        eyebrow={
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-alert-bg px-3 py-1 text-caption font-semibold text-ink">
            <AlertTriangle aria-hidden className="size-4 text-alert" strokeWidth={2} />
            Rupture de stock
          </span>
        }
        title={edgeProduct.name}
        primary={{
          label: `Ajouter ${replacement.name}`,
          icon: ShoppingBag,
          onClick: () => {
            const opts = rupture ?? {};
            setRupture(null);
            doAdd(EDGE.replacement, opts);
          },
        }}
        secondary={{
          label: "Me prévenir du retour",
          icon: Bell,
          onClick: () => {
            setRupture(null);
            show({ type: "info", message: `C'est noté : nous vous prévenons dès le retour de ${edgeProduct.name}.` });
          },
        }}
      >
        <p>
          {edgeProduct.name} vient de passer en rupture pendant votre ajout au panier.{" "}
          <strong className="font-semibold text-ink">Rien n&apos;a été débité.</strong> {replacement.name} (
          {EDGE.reason}) est disponible à {formatPrice(replacement.price)}.
        </p>
      </Modal>

      {/* Mobile : confirmation qui monte du bas (A8) */}
      <Modal
        open={added !== null}
        onClose={() => setAdded(null)}
        eyebrow={
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-accent text-success">
            <Check aria-hidden className="size-5" strokeWidth={2.5} />
          </span>
        }
        title="Ajouté à votre panier"
        primary={{
          label: "Voir mon panier",
          icon: ArrowRight,
          onClick: () => {
            setAdded(null);
            router.push("/panier");
          },
        }}
        secondary={{ label: "Continuer mes achats", onClick: () => setAdded(null) }}
      >
        {added && (
          <div className="flex flex-col gap-4">
            <p className="text-ink">
              {added.name} · <span className="font-semibold">{formatPrice(added.price)}</span>
            </p>
            <FreeShippingBar subtotal={cart.subtotal} />
          </div>
        )}
      </Modal>
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop doit être utilisé dans <ShopProvider>");
  return ctx;
}
