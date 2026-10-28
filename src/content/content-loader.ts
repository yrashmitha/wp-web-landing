import raw from "./landing-page.json";
import { landingPageSchema, type LandingPage, type SectionId } from "./landing-page.schema";

export interface LoadedContent {
  page: LandingPage;
  /** Enabled sections, in the order they appear in the JSON. */
  sections: SectionId[];
  /** Stable CTA ids by placement. These never change so reports never break. */
  ctaIds: { hero: string; final: string; sticky: string };
}

/** Validates the JSON once and fails the build with a readable list of problems. */
export function loadContent(): LoadedContent {
  const parsed = landingPageSchema.safeParse(raw);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
    throw new Error(`landing-page.json is invalid:\n${problems}`);
  }
  const page = parsed.data;

  if (page.settings.showPortfolioEvidence && page.shared.trust.realWork.projects.length === 0) {
    console.warn("[content] trust.realWork.projects is empty, so the project gallery is hidden. Add real instructor projects to show them.");
  }

  return {
    page,
    sections: page.sections.filter((s) => s.enabled).map((s) => s.id),
    ctaIds: { hero: "hero_whatsapp", final: "final_whatsapp", sticky: "sticky_whatsapp" },
  };
}
