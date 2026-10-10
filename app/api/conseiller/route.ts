import { buildSystemPrompt } from "@/lib/advisor/prompt";
import { buildSavPrompt } from "@/lib/advisor/sav";

type Mode = "conseil" | "sav";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 20;
const MAX_CHARS = 800;
const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

/** Rappel ajouté au dernier message : les petits modèles suivent mieux une consigne récente */
const REMINDER =
  "[Rappel interne, ne pas citer : si ce message ne concerne pas le choix d'un CBD Sève ou la boutique, refuse en une phrase (« Je suis spécialiste du CBD : je peux vous aider à trouver le meilleur CBD pour vous, mais je ne sais pas … ») puis pose ta prochaine question. " +
  "Une seule question par message, suivie de [[choix: … | …]]. Débutant : recommande seulement [[huile-cbd-10-spearmint]], [[bonhomme-de-neige]], [[dry-sift]] ou [[purple-punch]], jamais [[static-mango]], [[sweet-soy]] ni [[ice-o-lator]]. " +
  "Si la personne parle de santé, de traitement, de grossesse ou d'allaitement : dis que tu ne peux pas donner d'avis médical et invite-la à en parler à un médecin ou un pharmacien. " +
  "Aucun emoji, aucune allégation de santé, aucune recette ni usage culinaire.]";

const SAV_REMINDER =
  "[Rappel interne, ne pas citer : tu es le service après-vente Sève. Réponds directement à la question avec la politique de la boutique, sans rien inventer (pas de numéro de commande, de téléphone ni de statut de colis). " +
  "Hors sujet boutique : refuse en une phrase. Choix de produit : renvoie vers [[lien: /quiz | Trouver mon CBD]]. Santé ou grossesse : pas d'avis médical, renvoie vers un médecin ou un pharmacien. Aucun emoji, 80 mots maximum.]";

/**
 * Fournisseurs d'IA, essayés dans l'ordre : Gemini (principal) puis Mistral (secours).
 * Les deux exposent une API compatible OpenAI avec le même format de flux SSE.
 */
type Target = { provider: "gemini" | "mistral"; endpoint: string; key: string; model: string };

function targets(): Target[] {
  const list: Target[] = [];
  const gemini = process.env.GEMINI_API_KEY;
  if (gemini) {
    const primary = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    for (const model of Array.from(new Set([primary, "gemini-flash-latest"]))) {
      list.push({ provider: "gemini", endpoint: GEMINI_ENDPOINT, key: gemini, model });
    }
  }
  const mistral = process.env.MISTRAL_API_KEY;
  if (mistral) {
    const primary = process.env.MISTRAL_MODEL || "open-mistral-nemo";
    for (const model of Array.from(new Set([primary, "mistral-small-latest"]))) {
      list.push({ provider: "mistral", endpoint: MISTRAL_ENDPOINT, key: mistral, model });
    }
  }
  return list;
}

function sanitize(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;
  const msgs = input.slice(-MAX_MESSAGES).map((m) => {
    const role = m?.role === "assistant" ? "assistant" : m?.role === "user" ? "user" : null;
    const content = typeof m?.content === "string" ? m.content.trim().slice(0, MAX_CHARS) : "";
    return role && content ? { role, content } : null;
  });
  if (msgs.some((m) => m === null)) return null;
  const clean = msgs as ChatMessage[];
  return clean[clean.length - 1].role === "user" ? clean : null;
}

async function callModel(messages: ChatMessage[], mode: Mode): Promise<{ res: Response | null; model?: string }> {
  const withReminder = messages.map((m, i) =>
    i === messages.length - 1 ? { ...m, content: `${m.content}\n\n${mode === "sav" ? SAV_REMINDER : REMINDER}` } : m
  );
  const payload = [{ role: "system", content: mode === "sav" ? buildSavPrompt() : buildSystemPrompt() }, ...withReminder];

  let last: Response | null = null;
  for (const t of targets()) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(t.endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${t.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: t.model,
          stream: true,
          temperature: 0.3,
          max_tokens: 600,
          messages: payload,
          // Gemini : pas de phase de réflexion, réponse immédiate. Mistral : filtre de sécurité intégré.
          ...(t.provider === "gemini" ? { reasoning_effort: "none" } : { safe_prompt: true }),
        }),
      });
      if (res.ok && res.body) return { res, model: `${t.provider}/${t.model}` };
      last = res;
      // Clé refusée ou requête invalide : inutile de réessayer ce fournisseur
      if (res.status !== 429 && res.status < 500) break;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 800));
    }
  }
  return { res: last };
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY && !process.env.MISTRAL_API_KEY) {
    return Response.json({ error: "Le conseiller n'est pas configuré (clé d'API manquante)." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  const messages = sanitize((body as { messages?: unknown })?.messages);
  if (!messages) return Response.json({ error: "Requête invalide." }, { status: 400 });

  const mode: Mode = (body as { mode?: unknown })?.mode === "sav" ? "sav" : "conseil";
  const { res: upstream, model } = await callModel(messages, mode);
  if (!upstream || !upstream.ok || !upstream.body) {
    const busy = upstream?.status === 429;
    return Response.json(
      {
        error: busy
          ? "Le service est très demandé en ce moment. Réessayez dans quelques secondes."
          : "Le service est momentanément indisponible. Réessayez dans un instant.",
      },
      { status: busy ? 429 : 502 }
    );
  }

  // Flux SSE Mistral → flux texte brut pour le navigateur
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = upstream.body.getReader();
  let buffer = "";

  let finished = false;
  const finish = (controller: ReadableStreamDefaultController<Uint8Array>) => {
    if (finished) return;
    finished = true;
    controller.close();
    // Mistral peut garder la connexion ouverte après [DONE] : on la coupe
    reader.cancel().catch(() => undefined);
  };

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      // On lit jusqu'à pouvoir transmettre du texte : si pull() se termine sans rien
      // envoyer alors qu'un lecteur attend, le flux ne redemande jamais la suite.
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          finish(controller);
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        let sent = false;
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") {
            finish(controller);
            return;
          }
          try {
            const json = JSON.parse(data);
            const choice = json?.choices?.[0];
            const delta: string | undefined = choice?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(delta));
              sent = true;
            }
            if (choice?.finish_reason) {
              finish(controller);
              return;
            }
          } catch {
            /* fragment incomplet : ignoré */
          }
        }
        if (sent) return;
      }
    },
    cancel() {
      reader.cancel().catch(() => undefined);
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Seve-Model": model ?? "" },
  });
}
