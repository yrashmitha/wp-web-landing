import { siteConfig } from "../../config/site";
import type { Destination, TrackedEvent } from "./types";

type Win = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
  _fbq?: unknown;
};
const w = (): Win => window as Win;

function inject(src: string): void {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** Never let a destination break the page. */
const safe = (fn: () => void): void => {
  try {
    fn();
  } catch {
    /* analytics must never block UI */
  }
};

function gtmDestination(id: string): Destination {
  const win = w();
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  inject(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`);
  return {
    id: "gtm",
    send: (e: TrackedEvent) => safe(() => win.dataLayer?.push({ event: e.name, ...e.params })),
  };
}

function ga4Destination(id: string): Destination {
  const win = w();
  win.dataLayer = win.dataLayer ?? [];
  win.gtag = function gtag() {
    // gtag.js requires the Arguments object itself, not an array
    // eslint-disable-next-line prefer-rest-params
    win.dataLayer?.push(arguments);
  };
  win.gtag("js", new Date());
  win.gtag("config", id, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
  inject(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
  return { id: "ga4", send: (e) => safe(() => win.gtag?.("event", e.name, e.params)) };
}

function metaDestination(id: string): Destination {
  const win = w();
  if (!win.fbq) {
    const fbq = function (...args: unknown[]) {
      (fbq.queue as unknown[]).push(args);
    } as NonNullable<Win["fbq"]>;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    win.fbq = fbq;
    inject("https://connect.facebook.net/en_US/fbevents.js");
  }
  win.fbq("init", id);
  return {
    id: "meta",
    send: (e) =>
      safe(() => {
        // page_view maps to the standard PageView. Everything else is a custom event:
        // a WhatsApp click is an outbound click, never reported as a Lead or purchase.
        if (e.name === "page_view") win.fbq?.("track", "PageView");
        else win.fbq?.("trackCustom", e.name, e.params);
      }),
  };
}

/** GTM owns GA4 and Meta when present, so they are never initialised a second time. */
export function createDestinations(): Destination[] {
  const { gtmId, ga4Id, metaPixelId } = siteConfig.analytics;
  if (gtmId) return [gtmDestination(gtmId)];
  const list: Destination[] = [];
  if (ga4Id) list.push(ga4Destination(ga4Id));
  if (metaPixelId) list.push(metaDestination(metaPixelId));
  return list;
}

export function hasAnyDestination(): boolean {
  const { gtmId, ga4Id, metaPixelId } = siteConfig.analytics;
  return Boolean(gtmId || ga4Id || metaPixelId);
}
