/**
 * États de démonstration : ?state=empty | error | edge | loading
 * « edge » est mémorisé pour la session afin que la rupture se déclenche
 * aussi depuis la fiche produit.
 */
export type DemoState = "empty" | "error" | "edge" | "loading" | null;

const KEY = "seve-demo-edge";

export function parseDemoState(value: string | null): DemoState {
  return value === "empty" || value === "error" || value === "edge" || value === "loading" ? value : null;
}

export function rememberEdge(on: boolean) {
  try {
    if (on) window.sessionStorage.setItem(KEY, "1");
    else window.sessionStorage.removeItem(KEY);
  } catch {
    /* rien */
  }
}

export function isEdgeActive() {
  try {
    if (new URLSearchParams(window.location.search).get("state") === "edge") return true;
    return window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
