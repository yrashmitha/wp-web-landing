import type { ConsentState } from "./types";

const KEY = "wdm_consent_v1";
const listeners = new Set<(state: ConsentState) => void>();

export function readConsent(): ConsentState {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}

export function writeConsent(state: Exclude<ConsentState, "unset">): void {
  try {
    localStorage.setItem(KEY, state);
  } catch {
    /* storage can be blocked; the choice then lasts for this page view only */
  }
  memory = state;
  listeners.forEach((fn) => fn(state));
}

let memory: ConsentState | null = null;

export function getConsent(): ConsentState {
  return memory ?? (memory = readConsent());
}

export function onConsentChange(fn: (state: ConsentState) => void): void {
  listeners.add(fn);
}
