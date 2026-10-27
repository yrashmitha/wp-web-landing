import { siteConfig } from "../../config/site";
import { getCampaignLabels, getUtms } from "../attribution";
import { getConsent, onConsentChange } from "./consent";
import { createDestinations, hasAnyDestination } from "./destinations";
import type { Destination, EventMap, EventName, EventSource, SegmentId, SegmentSource, TrackedEvent } from "./types";

/**
 * The single tracking abstraction. Components call track(); only this file knows about
 * GA4, GTM, Meta Pixel, consent and the development inspector.
 *
 * Rules: analytics never throws, never awaits, and never delays a click or navigation.
 */

interface PageState {
  scrollPercent: number;
}

const state: PageState = { scrollPercent: 0 };

export const getPageState = (): Readonly<PageState> => state;
export const setScrollPercent = (p: number): void => void (state.scrollPercent = p);

/** The audience version currently on screen, read from the document so the static route and the visitor's own choice agree. */
export function getSegment(): { id: SegmentId | "neutral"; source: SegmentSource } {
  const d = document.documentElement;
  const id = d.dataset.seg;
  const source = d.dataset.segSource;
  return {
    id: id === "extra_income" || id === "business_growth" ? id : "neutral",
    source: source === "route" || source === "url_param" || source === "manual" ? source : "default",
  };
}
const QUEUE_LIMIT = 100;
let queue: TrackedEvent[] = [];
let destinations: Destination[] | null = null;
type Listener = (event: TrackedEvent) => void;
const inspectors = new Set<Listener>();

/** Development-only hook used by the event inspector. */
export function subscribeToEvents(fn: Listener): void {
  inspectors.add(fn);
}

function deliver(event: TrackedEvent): void {
  destinations?.forEach((d) => d.send(event));
}

function consentAllows(): boolean {
  return !siteConfig.analytics.requireConsent || getConsent() === "granted";
}

function activateDestinations(): void {
  if (destinations || !hasAnyDestination() || !consentAllows()) return;
  try {
    destinations = createDestinations();
  } catch {
    destinations = [];
  }
  const pending = queue;
  queue = [];
  pending.forEach(deliver);
}

export function track<N extends EventName>(name: N, params: EventMap[N], source: EventSource): void {
  try {
    const event: TrackedEvent<N> = { name, params, timestamp: Date.now(), source };
    inspectors.forEach((fn) => fn(event));
    if (!hasAnyDestination()) return;
    if (destinations) deliver(event);
    else if (getConsent() !== "denied" && queue.length < QUEUE_LIMIT) queue.push(event);
  } catch {
    /* never block the UI */
  }
}

let started = false;

export function startAnalytics(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  onConsentChange((c) => {
    if (c === "granted") activateDestinations();
    else queue = [];
  });
  activateDestinations();

  const width = window.innerWidth;
  track(
    "page_view",
    { page_path: location.pathname, ...getCampaignLabels(), ...getUtms(), device_type: width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop", segment_id: getSegment().id, segment_source: getSegment().source },
    "page",
  );
}

export { getConsent };
