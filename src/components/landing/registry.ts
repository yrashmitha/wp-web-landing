import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { SectionId } from "../../content/landing-page.schema";
import BeginnerConfidenceSection from "./BeginnerConfidenceSection.astro";
import FinalSection from "./FinalSection.astro";
import HeroSection from "./HeroSection.astro";
import ProofCommunitySection from "./ProofCommunitySection.astro";
import SolutionSection from "./SolutionSection.astro";

/**
 * Explicit component registry: each section id in landing-page.json maps to exactly one
 * component, and the schema allows no other ids. The page cannot render a section that is not listed here.
 */
export const sectionRegistry: Record<SectionId, AstroComponentFactory> = {
  hero: HeroSection,
  solution: SolutionSection,
  confidence: BeginnerConfidenceSection,
  trust: ProofCommunitySection,
  final_cta: FinalSection,
};
