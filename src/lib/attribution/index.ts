/**
 * Campaign attribution, kept in memory for the current page view only.
 *
 * Only low-cardinality campaign labels are exposed to analytics events. fbclid and
 * other click identifiers are never read into event parameters: we record only whether
 * one was present. Meta Pixel handles fbclid itself, under its own consent rules.
 */

export interface Attribution {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  has_fbclid: boolean;
}

const MAX_LEN = 60;
const clean = (value: string | null): string =>
  (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_\-. ]/g, "")
    .trim()
    .slice(0, MAX_LEN);

let cached: Attribution | null = null;

export function getAttribution(): Attribution {
  if (cached) return cached;
  const params = typeof location === "undefined" ? new URLSearchParams() : new URLSearchParams(location.search);
  cached = {
    utm_source: clean(params.get("utm_source")),
    utm_medium: clean(params.get("utm_medium")),
    utm_campaign: clean(params.get("utm_campaign")),
    utm_content: clean(params.get("utm_content")),
    utm_term: clean(params.get("utm_term")),
    has_fbclid: params.has("fbclid"),
  };
  return cached;
}

/** The two fields that travel with CTA and page_view events. */
export function getCampaignLabels(): { traffic_source: string; campaign_name: string } {
  const a = getAttribution();
  return {
    traffic_source: a.utm_source || (a.has_fbclid ? "facebook" : "direct"),
    campaign_name: a.utm_campaign || "none",
  };
}

/** The five UTM parameters for events that report campaign context. Never includes click identifiers. */
export function getUtms(): { utm_source: string; utm_medium: string; utm_campaign: string; utm_content: string; utm_term: string } {
  const { utm_source, utm_medium, utm_campaign, utm_content, utm_term } = getAttribution();
  return { utm_source, utm_medium, utm_campaign, utm_content, utm_term };
}
