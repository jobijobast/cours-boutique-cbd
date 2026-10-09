import { buildSystemPrompt } from "@/lib/advisor/prompt";
import { buildSavPrompt } from "@/lib/advisor/sav";

type Mode = "conseil" | "sav";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 20;
const MAX_CHARS = 800;
const ENDPOINT = "https://api.mistral.ai/v1/chat/completions";

/** Rappel ajouté au dernier message : les petits modèles suivent mieux une consigne récente */
const REMINDER =
  "[Rappel interne, ne pas citer : si ce message ne concerne pas le choix d'un CBD Sève ou la boutique, refuse en une phrase (« Je suis spécialiste du CBD : je peux vous aider à trouver le meilleur CBD pour vous, mais je ne sais pas … ») puis pose ta prochaine question. " +
  "Une seule question par message, suivie de [[choix: … | …]]. Débutant : recommande seulement [[huile-cbd-10-spearmint]], [[bonhomme-de-neige]], [[dry-sift]] ou [[purple-punch]], jamais [[static-mango]], [[sweet-soy]] ni [[ice-o-lator]]. " +
  "Si la personne parle de santé, de traitement, de grossesse ou d'allaitement : dis que tu ne peux pas donner d'avis médical et invite-la à en parler à un médecin ou un pharmacien. " +
  "Aucun emoji, aucune allégation de santé, aucune recette ni usage culinaire.]";

const SAV_REMINDER =
  "[Rappel interne, ne pas citer : tu es le service après-vente Sève. Réponds directement à la question avec la politique de la boutique, sans rien inventer (pas de numéro de commande, de téléphone ni de statut de colis). " +
  "Hors sujet boutique : refuse en une phrase. Choix de produit : renvoie vers [[lien: /quiz | Trouver mon CBD]]. Santé ou grossesse : pas d'avis médical, renvoie vers un médecin ou un pharmacien. Aucun emoji, 80 mots maximum.]";

/** Modèle principal puis replis si le plan est saturé (429) ou indisponible */
function models() {
  const primary = process.env.MISTRAL_MODEL || "open-mistral-nemo";
  return Array.from(new Set([primary, "mistral-small-latest", "open-mistral-nemo"]));
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

async function callMistral(messages: ChatMessage[], key: string, mode: Mode): Promise<{ res: Response | null; model?: string }> {
  let last: Response | null = null;
  for (const model of models()) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const withReminder = messages.map((m, i) =>
        i === messages.length - 1 ? { ...m, content: `${m.content}\n\n${mode === "sav" ? SAV_REMINDER : REMINDER}` } : m
      );
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          stream: true,
          temperature: 0.3,
          max_tokens: 450,
          safe_prompt: true,
          messages: [
            { role: "system", content: mode === "sav" ? buildSavPrompt() : buildSystemPrompt() },
            ...withReminder,
          ],
        }),
      });
      if (res.ok && res.body) return { res, model };
      last = res;
      if (res.status !== 429 && res.status < 500) return { res };
      await new Promise((r) => setTimeout(r, 900 * (attempt + 1)));
    }
  }
  return { res: last };
}

export async function POST(req: Request) {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) {
    return Response.json({ error: "Le conseiller n'est pas configuré (clé Mistral manquante)." }, { status: 500 });
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
  const { res: upstream, model } = await callMistral(messages, key, mode);
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
      const { done, value } = await reader.read();
      if (done) {
        finish(controller);
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
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
          if (delta) controller.enqueue(encoder.encode(delta));
          if (choice?.finish_reason) {
            finish(controller);
            return;
          }
        } catch {
          /* fragment incomplet : ignoré */
        }
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
