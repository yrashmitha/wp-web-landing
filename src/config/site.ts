/**
 * Operational configuration. Marketing text lives in src/content/landing-page.json;
 * the WhatsApp contact, IDs and switches live here and in environment variables (see .env.example).
 * Everything read here is public: never put a secret in a PUBLIC_ variable.
 */

const env = import.meta.env;

const clean = (value: string | undefined): string => (value ?? "").trim();

function safeHttpsUrl(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** The one WhatsApp contact for every button on every page. Visitors start a direct chat with this number. */
const whatsapp = {
  /** International format, digits only, as wa.me expects. */
  number: "94718523266",
  /** How the number is written on the page. */
  display: "+94 71 852 3266",
  /** Prefilled into the visitor's message box, so the first message already says what they want. */
  message: "ආයුබෝවන්! AI + WordPress Web Designing Course එක ගැන වැඩි විස්තර සහ Early Bird Offer එක දැනගන්න කැමතියි.",
} as const;
/** A wa.me link to the one contact with any prefilled message, encoded for the query string. */
export const whatsappLink = (message: string): string => `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(message)}`;
const whatsappUrl = whatsappLink(whatsapp.message);

const siteUrl = safeHttpsUrl(clean(env.PUBLIC_SITE_URL))?.replace(/\/$/, "") ?? null;

export const siteConfig = {
  /** Canonical origin, or null until PUBLIC_SITE_URL is set. */
  url: siteUrl,
  /** The WhatsApp chat link with the prefilled message. */
  whatsappUrl,
  whatsapp,
  skipLabel: "ප්‍රධාන අන්තර්ගතයට යන්න",
  /** Wording of the analytics consent banner. Operational text, not marketing copy. */
  consent: {
    message: "වඩා හොඳ අත්දැකීමක් දෙන්න මේ පිටුව භාවිත වන ආකාරය මනින්න Analytics භාවිත කරන්න අපිට ඉඩ දෙනවාද?",
    accept: "ඉඩ දෙන්න",
    decline: "එපා",
  },
  analytics: {
    ga4Id: /^G-[A-Z0-9]+$/.test(clean(env.PUBLIC_GA4_ID)) ? clean(env.PUBLIC_GA4_ID) : null,
    gtmId: /^GTM-[A-Z0-9]+$/.test(clean(env.PUBLIC_GTM_ID)) ? clean(env.PUBLIC_GTM_ID) : null,
    metaPixelId: /^\d{8,20}$/.test(clean(env.PUBLIC_META_PIXEL_ID)) ? clean(env.PUBLIC_META_PIXEL_ID) : null,
    requireConsent: clean(env.PUBLIC_REQUIRE_CONSENT).toLowerCase() !== "false",
  },
} as const;

export type SiteConfig = typeof siteConfig;
