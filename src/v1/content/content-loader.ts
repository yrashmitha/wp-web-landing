import raw from "./landing-page.json";
import { landingPageSchema, type LandingPage, type SectionId, type VariantId } from "./landing-page.schema";

export interface HeroCopy {
  headline: string;
  subheadline: string;
  ctaLabel: string;
}

export interface LoadedContent {
  page: LandingPage;
  /** Enabled sections, in the order they appear in the JSON. */
  sections: SectionId[];
  /** Stable CTA ids by placement. The final id comes from the JSON; the others are fixed so reports never break. */
  ctaIds: { hero: string; final: string; sticky: string };
  /** The hero copy for every version of the page (neutral uses the shared copy). */
  hero: Record<VariantId, HeroCopy>;
}

/** Validates the JSON once and fails the build with a readable list of problems. */
export function loadContent(): LoadedContent {
  const parsed = landingPageSchema.safeParse(raw);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
    throw new Error(`landing-page.json is invalid:\n${problems}`);
  }
  const page = parsed.data;
  const { shared, segments, navigation } = page;

  const v = shared.beginnerConfidence.verification;
  if (!v.courseFormatConfirmed) console.warn("[content] beginnerConfidence: the one-month / one-hour-a-day format is not confirmed (verification.courseFormatConfirmed is false). It is shown as a learning goal only.");
  if (!v.communitySupportConfirmed) console.warn("[content] beginnerConfidence: instructor presence and post-course community support are not confirmed (verification.communitySupportConfirmed is false). Confirm them before launch.");

  return {
    page,
    sections: page.sections.filter((s) => s.enabled).map((s) => s.id),
    ctaIds: { hero: "hero_whatsapp", final: shared.finalCTA.cta.id, sticky: "sticky_whatsapp" },
    hero: {
      neutral: { headline: shared.hero.headline, subheadline: shared.hero.subheadline, ctaLabel: navigation.primaryCTA },
      extra_income: segments.extra_income.hero,
      business_growth: segments.business_growth.hero,
    },
  };
}
