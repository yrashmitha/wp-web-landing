import { z } from "zod";

/**
 * Schema for src/content/landing-page.json (value-first edition).
 * The JSON holds editable marketing text and configuration only: no markup, no scripts, no secrets.
 * Every string is rendered as plain text by the components.
 */

const text = z.string().trim().min(1);
const sentence = text.max(240);
const paragraph = text.max(500);
const stableId = z.string().regex(/^[a-z][a-z0-9_]*$/, "ids use lowercase letters, digits and underscores and never change once published");

/** The two campaign audiences, plus the neutral default shown with no choice. */
export const segmentIds = ["extra_income", "business_growth"] as const;
export const variantIds = ["neutral", ...segmentIds] as const;
export type SegmentId = (typeof segmentIds)[number];
export type VariantId = (typeof variantIds)[number];

/** The five sections the page may render, in the only order-independent mapping to their JSON type. */
export const sectionIds = ["hero", "recognition", "beginner_confidence", "opportunity", "instructor", "final_cta"] as const;
export type SectionId = (typeof sectionIds)[number];
const sectionTypeById = {
  hero: "adaptiveHero",
  recognition: "emotionalRecognition",
  beginner_confidence: "beginnerConfidence",
  opportunity: "opportunity",
  instructor: "instructor",
  final_cta: "conversion",
} as const satisfies Record<SectionId, string>;

const icon = z.enum(["wallet", "trending-up"]);

const benefit = z.object({ id: stableId, title: text.max(100), description: sentence }).strict();
const benefits = z.array(benefit).length(3);

const segmentSchema = z
  .object({
    hero: z.object({ headline: text.max(160), subheadline: sentence, description: paragraph, ctaLabel: text.max(80) }).strict(),
    recognition: z.object({ headline: text.max(160), statements: z.array(sentence).min(3).max(5), closing: paragraph }).strict(),
    opportunity: z.object({ headline: text.max(160), intro: paragraph, benefits, closing: paragraph }).strict(),
    finalCTA: z.object({ headline: text.max(160), description: paragraph }).strict(),
  })
  .strict();

export const landingPageSchema = z
  .object({
    site: z
      .object({
        brand: text,
        courseName: text,
        language: z.string().min(2),
        courseType: z.literal("paid"),
        status: z.literal("coming_soon"),
        seo: z.object({ title: text.max(120), description: text.max(320) }).strict(),
      })
      .strict(),

    /** Features removed from this edition can only be false: the page has no component for them. */
    settings: z
      .object({
        enablePersonalization: z.boolean(),
        showWebsiteDemo: z.literal(false),
        showIncomeCalculator: z.literal(false),
        showPortfolioGallery: z.literal(false),
        showLongFAQ: z.literal(false),
        showMobileStickyCTA: z.boolean(),
        showCoursePrice: z.literal(false),
      })
      .strict(),

    personalization: z
      .object({
        question: text.max(100),
        options: z
          .array(z.object({ id: z.enum(segmentIds), label: text.max(60), icon }).strict())
          .length(2)
          .refine((o) => new Set(o.map((x) => x.id)).size === 2, "options must list extra_income and business_growth once each"),
        changeLabel: text.max(60),
      })
      .strict(),

    navigation: z.object({ brandLabel: text, primaryCTA: text.max(80) }).strict(),

    sections: z
      .array(z.object({ id: z.enum(sectionIds), type: z.string(), enabled: z.boolean() }).strict())
      .length(sectionIds.length)
      .superRefine((list, ctx) => {
        const seen = new Set<string>();
        list.forEach((s, i) => {
          if (seen.has(s.id)) ctx.addIssue({ code: "custom", path: [i, "id"], message: `duplicate section "${s.id}"` });
          seen.add(s.id);
          if (s.type !== sectionTypeById[s.id]) ctx.addIssue({ code: "custom", path: [i, "type"], message: `section "${s.id}" must have type "${sectionTypeById[s.id]}"` });
        });
      }),

    shared: z
      .object({
        hero: z
          .object({ eyebrow: text, headline: text.max(160), subheadline: sentence, solution: text, supportingText: paragraph, microcopy: sentence })
          .strict(),
        recognition: z.object({ eyebrow: text, headline: text.max(160), closing: paragraph }).strict(),
        beginnerConfidence: z
          .object({
            eyebrow: text,
            headline: text.max(160),
            supportingText: sentence,
            coreMessage: sentence,
            requirementsLabel: text.max(60),
            requirements: z.array(z.object({ id: stableId, text: sentence }).strict()).length(2),
            /** Frames the progress message as what the course aims for, never as a result. */
            goalLabel: text.max(40),
            progress: paragraph,
            community: z
              .object({
                headline: text.max(160),
                supportingText: paragraph,
                benefits: z.array(z.object({ id: stableId, icon: z.enum(["messages-square", "graduation-cap", "users", "sprout"]), text: sentence }).strict()).length(4),
                closing: paragraph,
                /** Optional. Say here if the paid student community differs from the interest group. Null hides it. */
                accessNote: sentence.nullable(),
              })
              .strict(),
            /** Launch gates: the one-month, one-hour-a-day format and the community promises must be confirmed against the real course. */
            verification: z.object({ courseFormatConfirmed: z.boolean(), communitySupportConfirmed: z.boolean() }).strict(),
          })
          .strict(),
        opportunity: z.object({ eyebrow: text, headline: text.max(160), intro: paragraph, benefits, closing: paragraph }).strict(),
        instructor: z
          .object({
            eyebrow: text,
            headline: text.max(160),
            name: text,
            role: text,
            experienceBadge: text.max(60),
            freelancingSince: z.string().regex(/^\d{4}$/, "a four digit year"),
            description: paragraph,
            quote: paragraph,
            /** No photo is supplied yet. Never generated: the section is typographic until a real one exists. */
            photo: z
              .object({ src: z.string().startsWith("/images/"), alt: text, width: z.number().int().positive(), height: z.number().int().positive() })
              .strict()
              .nullable(),
          })
          .strict(),
        mission: z.object({ eyebrow: text, headline: text.max(160), description: paragraph }).strict(),
        finalCTA: z
          .object({
            eyebrow: text,
            headline: text.max(160),
            description: paragraph,
            value: z.array(text.max(120)).min(2).max(4),
            cta: z.object({ id: stableId, label: text.max(80), action: z.literal("join_whatsapp") }).strict(),
            microcopy: paragraph,
          })
          .strict(),
      })
      .strict(),

    segments: z.object({ extra_income: segmentSchema, business_growth: segmentSchema }).strict(),

    footer: z.object({ brand: text, course: text, note: text }).strict(),
  })
  .strict()
  .superRefine((page, ctx) => {
    const issue = (path: (string | number)[], message: string): void => void ctx.addIssue({ code: "custom", path, message });

    // Essential course facts live only in `shared`, so they cannot drift between audiences.
    // What is left to check is that the segments agree with them and promise nothing new.
    for (const id of segmentIds) {
      const seg = page.segments[id];
      if (seg.opportunity.benefits.length !== page.shared.opportunity.benefits.length) issue(["segments", id, "opportunity", "benefits"], "every audience shows the same number of benefits");
      const ids = seg.opportunity.benefits.map((b) => b.id);
      if (new Set(ids).size !== ids.length) issue(["segments", id, "opportunity", "benefits"], "benefit ids must be unique");
    }
    if (page.shared.finalCTA.cta.id === "hero_whatsapp" || page.shared.finalCTA.cta.id === "sticky_whatsapp") issue(["shared", "finalCTA", "cta", "id"], "cta id collides with the hero or sticky CTA id");

    // Paid status must stay visible in the copy, never be edited away.
    if (!/paid/i.test(page.shared.hero.microcopy)) issue(["shared", "hero", "microcopy"], 'the hero microcopy must say the programme is "Paid"');
    if (!/paid/i.test(page.shared.finalCTA.microcopy)) issue(["shared", "finalCTA", "microcopy"], 'the final microcopy must say the course is "Paid"');

    // Claims this page is not allowed to make: prices, guarantees, urgency, scarcity, income figures.
    const banned: [RegExp, string][] = [
      [/(?:\brs\.?|\blkr|රු\.?|\$|£|€)\s?\d|\d\s?(?:rs\b|lkr\b|රුපියල්)/i, "a price or income figure"],
      [/\d{1,3}(?:,\d{3})+/, "a large figure"],
      [/guarantee|100\s?%|ඔප්පු|සහතික\s*කරනවා|සහතිකයි/i, "a guarantee"],
      [/last chance|limited (?:seats|spots)|seats left|hurry|deadline|ends (?:today|soon)|අවසන් අවස්ථාව|ආසන \d/i, "urgency or scarcity"],
      [/testimonial|\bstudents? (?:earn|made)|ශිෂ්‍යයන් (?:උපයා|ලබා)/i, "student results"],
    ];
    const walk = (value: unknown, path: (string | number)[]): void => {
      if (typeof value === "string") {
        // The footer note is the one place a disclaimer may use the word "සහතික".
        if (path[0] === "footer" && path[1] === "note") return;
        for (const [re, label] of banned) if (re.test(value)) issue(path, `contains ${label}; this page may not invent that`);
      } else if (Array.isArray(value)) value.forEach((v, i) => walk(v, [...path, i]));
      else if (value && typeof value === "object") Object.entries(value).forEach(([k, v]) => walk(v, [...path, k]));
    };
    walk(page, []);
  });

export type LandingPage = z.infer<typeof landingPageSchema>;
export type Segment = z.infer<typeof segmentSchema>;
