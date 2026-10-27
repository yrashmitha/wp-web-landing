/**
 * Operational configuration. Marketing text lives in src/content/landing-page.json;
 * links, IDs and switches live here and in environment variables (see .env.example).
 * Everything read here is public: never put a secret in a PUBLIC_ variable.
 */

const env = import.meta.env;

const clean = (value: string | undefined): string => (value ?? "").trim();

function safeHttpsUrl(value: string, allowedHosts?: string[]): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (allowedHosts && !allowedHosts.includes(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

const whatsappUrl = safeHttpsUrl(clean(env.PUBLIC_WHATSAPP_URL), ["chat.whatsapp.com", "wa.me", "whatsapp.com"]);
const siteUrl = safeHttpsUrl(clean(env.PUBLIC_SITE_URL))?.replace(/\/$/, "") ?? null;

export const siteConfig = {
  /** Canonical origin, or null until PUBLIC_SITE_URL is set. */
  url: siteUrl,
  /** The single WhatsApp interest group invitation, or null when missing or invalid. */
  whatsappUrl,
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
