"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, ArrowUp, RotateCcw, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Fragment, useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ProductVisual, StockLine } from "@/components/shop/ProductBits";
import { useShop } from "@/components/shop/ShopProvider";
import { cn } from "@/lib/cn";
import { formatPrice, getProduct } from "@/lib/data/products";

export type Msg = { id: number; role: "user" | "assistant"; content: string; error?: boolean; /** Texte affiché si différent de celui envoyé */ display?: string };

/* ---------- Analyse du texte renvoyé par l'agent ---------- */

const CHOICES_RE = /\[\[\s*choix\s*:([^\]]*)\]\]/gi;
const EMOJI_RE = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;

/** Nettoie le texte (emoji, italique, titres) et extrait les réponses rapides */
export function parseAnswer(raw: string, streaming?: boolean) {
  let text = raw.replace(EMOJI_RE, "");
  const choices: string[] = [];
  text = text.replace(CHOICES_RE, (_, list: string) => {
    list
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((c) => choices.push(c));
    return "";
  });
  // Pendant le flux : on masque un code encore incomplet en fin de texte
  if (streaming) text = text.replace(/\[\[[^\]]*\]?$/, "");
  text = text
    .replace(/^#+\s*/gm, "")
    .replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g, "$1$2") // *italique* → texte
    .replace(/^\s*[-*•]\s+/gm, "· ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { text, choices: choices.slice(0, 4) };
}

function inline(text: string, key: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${key}-${i}`} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={`${key}-${i}`}>{part.replace(/\*\*/g, "")}</Fragment>
    )
  );
}

export function ProductMini({ slug }: { slug: string }) {
  const { addToCart } = useShop();
  const p = getProduct(slug);
  if (!p) return null;
  const out = p.stock === "out";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group my-2 flex gap-3 rounded-md border border-line bg-surface p-2.5 shadow-e1 transition-[border-color,box-shadow] duration-200 hover:border-action hover:shadow-e2"
    >
      <ProductVisual product={p} size="sm" className="size-16 shrink-0 rounded-sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link href={`/produit/${p.slug}`} className="truncate font-display text-[15px] font-semibold text-ink hover:underline">
          {p.name}
        </Link>
        <p className="truncate text-[12px] text-muted">{p.meta}</p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-[15px] font-bold text-ink">{formatPrice(p.price)}</span>
          {out ? (
            <StockLine status={p.stock} label={p.stockLabel} />
          ) : (
            <button
              type="button"
              onClick={() => addToCart(p.slug, { toast: true })}
              aria-label={`Ajouter ${p.name} au panier`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-pill border-2 border-action px-3 text-[13px] font-semibold text-ink transition-colors duration-200 hover:bg-action-tint active:scale-95"
            >
              <ShoppingBag aria-hidden className="size-4" strokeWidth={2} />
              Ajouter
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const ALLOWED_LINKS = ["/compte", "/panier", "/boutique", "/analyses", "/quiz", "/guide"];

function RichText({ text }: { text: string }) {
  const blocks = text.split(/(\[\[[a-z0-9-]+\]\]|\[\[\s*lien\s*:[^\]]*\]\])/gi);
  return (
    <>
      {blocks.map((block, i) => {
        const link = block.match(/^\[\[\s*lien\s*:\s*([^|\]]+?)\s*\|\s*([^\]]+?)\s*\]\]$/i);
        if (link) {
          const href = link[1].trim();
          return ALLOWED_LINKS.includes(href) ? (
            <Link
              key={i}
              href={href}
              className="my-1.5 inline-flex min-h-11 items-center gap-1.5 rounded-pill border-2 border-action px-4 text-[14px] font-semibold text-ink transition-colors hover:bg-action-tint"
            >
              {link[2]}
              <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
          ) : null;
        }
        const m = block.match(/^\[\[([a-z0-9-]+)\]\]$/);
        if (m) return getProduct(m[1]) ? <ProductMini key={i} slug={m[1]} /> : null;
        return block
          .split(/\n+/)
          .filter((l) => l.trim())
          .map((para, j) => (
            <p key={`${i}-${j}`} className="[&:not(:first-child)]:mt-2">
              {inline(para, `${i}-${j}`)}
            </p>
          ));
      })}
    </>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Le conseiller écrit">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-muted"
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

/* ---------- Logique de conversation ---------- */

export function useAdvisorChat(storageKey: string, mode: "conseil" | "sav" = "conseil") {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const nextId = useRef(1);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Msg[]>([]);
  messagesRef.current = messages;

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Msg[];
        setMessages(parsed);
        nextId.current = parsed.reduce((m, x) => Math.max(m, x.id), 0) + 1;
      }
    } catch {
      /* rien */
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (busy || !hydrated) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages.filter((m) => !m.error)));
    } catch {
      /* rien */
    }
  }, [messages, busy, hydrated, storageKey]);

  const send = useCallback(async (text: string, display?: string) => {
    const content = text.trim();
    if (!content || abortRef.current) return;
    const userMsg: Msg = { id: nextId.current++, role: "user", content, display };
    const botId = nextId.current++;
    const history = [...messagesRef.current.filter((m) => !m.error), userMsg];
    setMessages([...history, { id: botId, role: "assistant", content: "" }]);
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort("timeout"), 45000);
    try {
      const res = await fetch("/api/conseiller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Le conseiller est momentanément indisponible.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((list) => list.map((m) => (m.id === botId ? { ...m, content: acc } : m)));
      }
      if (!acc.trim()) throw new Error("Je n'ai pas pu formuler de réponse. Pouvez-vous reformuler ?");
    } catch (err) {
      const aborted = (err as Error).name === "AbortError";
      if (aborted && controller.signal.reason !== "timeout") return;
      setMessages((list) =>
        list.map((m) =>
          m.id === botId
            ? {
                ...m,
                error: true,
                content: aborted
                  ? "La réponse prend trop de temps. Réessayez dans un instant."
                  : (err as Error).message || "Le conseiller est momentanément indisponible.",
              }
            : m
        )
      );
    } finally {
      window.clearTimeout(timeout);
      setBusy(false);
      abortRef.current = null;
    }
  }, [mode]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
    setMessages([]);
  }, []);

  const retry = useCallback(() => {
    const list = messagesRef.current;
    const lastUser = [...list].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMessages(list.filter((m) => !m.error && m.id !== lastUser.id));
    messagesRef.current = list.filter((m) => !m.error && m.id !== lastUser.id);
    void send(lastUser.content, lastUser.display);
  }, [send]);

  return { messages, busy, hydrated, send, reset, retry };
}

export type AdvisorChat = ReturnType<typeof useAdvisorChat>;

/* ---------- Affichage ---------- */

export function ChatMessages({
  chat,
  intro,
  suggestions,
  onSuggestion,
  large,
}: {
  chat: AdvisorChat;
  intro: ReactNode;
  suggestions?: string[];
  /** Action des suggestions de départ (par défaut : envoyer le libellé) */
  onSuggestion?: (s: string) => void;
  large?: boolean;
}) {
  const reduce = useReducedMotion();
  const { messages, busy, send, retry } = chat;
  const lastId = messages[messages.length - 1]?.id;
  const bubbleText = large ? "text-[16px]" : "text-[15px]";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "max-w-[88%] rounded-lg rounded-tl-sm border border-line bg-surface px-4 py-3 text-ink shadow-e1",
          bubbleText
        )}
      >
        {intro}
      </motion.div>

      {messages.length === 0 && suggestions && (
        <div className="flex flex-wrap gap-2 pt-1">
          {suggestions.map((s, i) => (
            <ChoiceButton key={s} label={s} index={i} onPick={onSuggestion ?? send} />
          ))}
        </div>
      )}

      <AnimatePresence initial={false}>
        {messages.map((m) => {
          const streaming = busy && m.id === lastId;
          const parsed = m.role === "assistant" && !m.error ? parseAnswer(m.content, streaming) : null;
          return (
            <motion.div
              key={m.id}
              layout={!reduce}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}
            >
              {m.role === "user" ? (
                <p className={cn("max-w-[85%] rounded-lg rounded-tr-sm bg-action px-4 py-2.5 text-on-action", bubbleText)}>
                  {m.display ?? m.content}
                </p>
              ) : m.error ? (
                <div role="alert" className="max-w-[92%] rounded-lg rounded-tl-sm border-2 border-alert bg-surface px-4 py-3 text-[14px]">
                  <p className="flex items-start gap-2 font-medium text-ink">
                    <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-alert" strokeWidth={2} />
                    {m.content}
                  </p>
                  <button
                    type="button"
                    onClick={retry}
                    className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-semibold text-ink underline underline-offset-4"
                  >
                    <RotateCcw aria-hidden className="size-4" strokeWidth={2} />
                    Réessayer
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "w-full max-w-[92%] rounded-lg rounded-tl-sm border border-line bg-surface px-4 py-3 leading-relaxed text-ink shadow-e1",
                      bubbleText
                    )}
                  >
                    {parsed && parsed.text ? <RichText text={parsed.text} /> : <TypingDots />}
                  </div>
                  {/* Réponses rapides : seulement sous le dernier message, une fois complet */}
                  {parsed && !streaming && m.id === lastId && parsed.choices.length > 0 && (
                    <div className="mt-2 flex max-w-full flex-wrap gap-2">
                      {parsed.choices.map((c, i) => (
                        <ChoiceButton key={c} label={c} index={i} onPick={send} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </>
  );
}

function ChoiceButton({ label, index, onPick }: { label: string; index: number; onPick: (v: string) => void }) {
  return (
    <motion.button
      type="button"
      onClick={() => onPick(label)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.25 }}
      whileTap={{ scale: 0.96 }}
      className="min-h-11 rounded-pill border-2 border-line bg-surface px-4 text-[14px] font-medium text-ink transition-colors hover:border-action hover:bg-action-tint"
    >
      {label}
    </motion.button>
  );
}

export function ChatComposer({
  chat,
  inputRef,
  placeholder = "Ex. : envie de douceur fruitée ce soir",
  id = "advisor-input",
  note = "Conseils sur les goûts et formats uniquement, pas d'avis médical. Réservé aux adultes.",
}: {
  chat: AdvisorChat;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  placeholder?: string;
  id?: string;
  note?: string;
}) {
  const [input, setInput] = useState("");
  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || chat.busy) return;
    void chat.send(input);
    setInput("");
  };
  return (
    <form onSubmit={submit}>
      <div className="flex items-end gap-2">
        <label htmlFor={id} className="sr-only">
          Votre message au conseiller
        </label>
        <textarea
          id={id}
          ref={inputRef}
          rows={1}
          value={input}
          maxLength={800}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          className="max-h-[120px] min-h-12 flex-1 resize-none rounded-md border-2 border-line bg-page px-4 py-3 text-[15px] text-ink placeholder:text-muted focus:border-focus"
        />
        <motion.button
          type="submit"
          disabled={!input.trim() || chat.busy}
          whileTap={{ scale: 0.9 }}
          aria-label="Envoyer"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-action text-on-action transition-colors hover:bg-action-hover disabled:opacity-40"
        >
          <ArrowUp aria-hidden className="size-5" strokeWidth={2.5} />
        </motion.button>
      </div>
      <p className="mt-2 text-center text-[12px] text-muted">
        {note}
      </p>
    </form>
  );
}
