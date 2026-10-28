import { z } from "zod";

/**
 * Schema for src/content/landing-page.json (v5, five-section conversion edition).
 * The JSON holds editable marketing text and configuration only: no markup, no scripts, no secrets.
 * Operational values (the WhatsApp number and message, analytics ids) live in src/config/site.ts and .env, never here.
 * Every string is rendered as plain text by the components.
 */

const text = z.string().trim().min(1);
const sentence = text.max(280);
const paragraph = text.max(520);
const stableId = z.string().regex(/^[a-z][a-z0-9_]*$/, "ids use lowercase letters, digits and underscores and never change once published");

/** The two campaign audiences. There is no neutral version: the default segment is shown with no choice. */
export const segmentIds = ["extra_income", "business_growth"] as const;
export type SegmentId = (typeof segmentIds)[number];
export const variantIds = segmentIds;
export type VariantId = SegmentId;

/** The five sections: attention and relevance, solution, confidence, trust, action. The JSON decides their order. */
export const sectionIds = ["hero", "solution", "confidence", "trust", "final_cta"] as const;
export type SectionId = (typeof sectionIds)[number];
const sectionTypeById = {
  hero: "futureHero",
  solution: "solutionReveal",
  confidence: "beginnerConfidence",
  trust: "proofAndCommunity",
  final_cta: "finalConversion",
} as const satisfies Record<SectionId, string>;

const icon = z.enum(["wallet", "store"]);
const capabilityIcon = z.enum(["monitor", "shopping-bag", "briefcase"]);
const pointIcon = z.enum(["clock", "monitor", "target"]);
const image = z.object({ src: z.string().startsWith("/images/"), alt: text, width: z.number().int().positive(), height: z.number().int().positive() }).strict();

/** Only the hero differs by audience: everything after it is shared, so no idea is told twice. */
const segmentSchema = z
  .object({
    /** mirror: three relatable, non-diagnostic lines shown once the visitor has chosen a goal. They describe common feelings, never a claim about the visitor or a result. */
    hero: z.object({ headline: text.max(180), subheadline: sentence, hook: sentence, bridge: sentence, mirror: z.array(sentence).length(3) }).strict(),
  })
  .strict();

export const landingPageSchema = z
  .object({
    version: z.literal("5.0"),

    brand: z
      .object({
        name: text,
        courseName: text,
        locale: z.string().min(2),
        paid: z.literal(true),
        phase: z.literal("interest_collection"),
        seo: z.object({ title: text.max(120), description: text.max(320) }).strict(),
      })
      .strict(),

    /** Documents the journey and the copy rules. The checks below enforce what can be enforced. */
    strategy: z
      .object({
        narrative: z.array(text),
        psychologyPrinciples: z.array(text),
        editorialGuidelines: z
          .object({
            voice: text,
            incomeGoalIsAspirationNotPromise: z.literal(true),
            showPaidDisclosure: z.literal(true),
            noFakeScarcity: z.literal(true),
            noFabricatedTestimonials: z.literal(true),
            doNotPromiseIncomeByJanuary2027: z.literal(true),
          })
          .strict(),
      })
      .strict(),

    /** Features removed from this edition can only be false: the page has no component for them. */
    settings: z
      .object({
        defaultSegment: z.enum(segmentIds),
        supportedSegments: z.array(z.enum(segmentIds)).length(2),
        showDemo: z.literal(false),
        showCalculator: z.literal(false),
        showLongFaq: z.literal(false),
        showMobileStickyCTA: z.boolean(),
        showPortfolioEvidence: z.boolean(),
        showInstructorPhoto: z.boolean(),
        /** Prices and batch capacity live in course-offer.json, the single source for both pages. */
        courseStartDate: z.null(),
      })
      .strict(),

    /** One button, one label, everywhere. The number and the prefilled message live in src/config/site.ts. */
    cta: z.object({ action: z.literal("join_whatsapp"), label: text.max(80) }).strict(),

    personalization: z
      .object({
        enabled: z.boolean(),
        mode: z.literal("optional_inline"),
        question: text.max(100),
        options: z
          .array(z.object({ id: z.enum(segmentIds), label: text.max(60), icon }).strict())
          .length(2)
          .refine((o) => new Set(o.map((x) => x.id)).size === 2, "options must list extra_income and business_growth once each"),
        changeLabel: text.max(60),
      })
      .strict(),

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
        hero: z.object({ eyebrow: text, readingInvitation: text.max(80), mirrorLabel: text.max(80) }).strict(),
        /** Demand, then skill, then the AI advantage. Only the hero differs by audience, so this reads the same for both. */
        solution: z
          .object({
            eyebrow: text,
            headline: text.max(180),
            description: paragraph,
            capabilities: z.array(z.object({ id: stableId, icon: capabilityIcon, label: text.max(80) }).strict()).length(3),
            aiReveal: z.object({ eyebrow: text.max(80), headline: text.max(120), description: paragraph, closing: sentence }).strict(),
            secondaryCTA: z.object({ id: stableId, label: text.max(80), href: z.string().regex(/^\/[a-z0-9\-/]*$/, "an internal path such as /course-content") }).strict(),
          })
          .strict(),
        confidence: z
          .object({
            headline: text.max(160),
            answer: sentence,
            description: paragraph,
            points: z.array(z.object({ id: stableId, icon: pointIcon, text: sentence }).strict()).length(3),
            closing: sentence,
          })
          .strict(),
        trust: z
          .object({
            headline: text.max(180),
            instructor: z
              .object({
                /** Optional. Null hides the name and role; the experience and client lines still show. */
                name: text.nullable(),
                role: text.nullable(),
                experience: text.max(80),
                clientBackground: sentence,
                experienceBadge: text.max(60),
                image: image.nullable(),
              })
              .strict(),
            realWork: z
              .object({
                /** Only real, supplied instructor projects. While empty the gallery is not rendered. */
                projects: z.array(z.object({ id: stableId, title: text.max(100), image, url: z.string().url().startsWith("https://").nullable() }).strict()),
                emptyStateBehavior: z.literal("hide_project_gallery_until_real_projects_are_added"),
              })
              .strict(),
            community: z
              .object({
                headline: text.max(160),
                description: text.max(120),
                benefits: z.array(z.object({ id: stableId, icon: z.enum(["message-circle", "graduation-cap", "users"]), text: text.max(60) }).strict()).length(3),
                capacityNote: sentence,
              })
              .strict(),
          })
          .strict(),
        /** A quiet hint in the hero. It may not name the discount or the code: the reveal is at the end of the page. */
        heroRewardTeaser: z
          .object({
            enabled: z.boolean(),
            icon: z.literal("gift"),
            headline: text.max(100),
            description: sentence,
            showDiscountAmount: z.literal(false),
            showCode: z.literal(false),
          })
          .strict(),
        /** The reward is a percentage off the course, never a free course or cash. {discount} and {code} are filled in. */
        finalReward: z
          .object({
            enabled: z.boolean(),
            eyebrow: text.max(80),
            headline: text.max(160),
            description: sentence,
            discountPercent: z.number().int().min(1).max(90),
            discountCode: z.string().regex(/^[A-Za-z0-9]{4,24}$/, "letters and digits only, so the code survives copy and paste"),
            codeInstruction: sentence,
            copyButtonLabel: text.max(60),
            copiedLabel: text.max(60),
            ctaLabel: text.max(80),
            prefilledMessage: text.max(400),
            paidDisclosure: sentence,
          })
          .strict(),
        /** {capacity} is filled from course-offer.json, so the batch size is typed once. */
        final_cta: z
          .object({
            eyebrow: text,
            headline: text.max(160),
            description: paragraph,
            earlyBird: sentence,
            paidDisclosure: sentence,
          })
          .strict(),
      })
      .strict(),

    segments: z.object({ extra_income: segmentSchema, business_growth: segmentSchema }).strict(),

    analytics: z
      .object({
        events: z.array(text),
        scrollMilestones: z.array(z.number().int().min(1).max(100)),
        trackUtmParameters: z.boolean(),
      })
      .strict(),
  })
  .strict()
  .superRefine((page, ctx) => {
    const issue = (path: (string | number)[], message: string): void => void ctx.addIssue({ code: "custom", path, message });

    if (!page.settings.supportedSegments.includes(page.settings.defaultSegment)) issue(["settings", "defaultSegment"], "the default segment must be a supported segment");
    if (page.sections.filter((s) => s.enabled).length !== sectionIds.length) issue(["sections"], "all five sections stay enabled: this edition is exactly five sections");
    if (page.sections.find((s) => s.id === "hero")?.enabled !== true) issue(["sections"], "the hero must stay enabled: it carries the first CTA and the sticky CTA trigger");

    // Paid status must stay visible in the copy, never be edited away.
    if (!/paid/i.test(page.shared.final_cta.paidDisclosure)) issue(["shared", "final_cta", "paidDisclosure"], 'the final disclosure must say the course is "Paid"');

    // The only placeholder the copy may use is {capacity}.
    for (const key of ["headline", "description", "earlyBird", "paidDisclosure"] as const) {
      for (const m of page.shared.final_cta[key].matchAll(/\{(\w+)\}/g)) if (m[1] !== "capacity") issue(["shared", "final_cta", key], `unknown placeholder {${m[1]}}`);
    }

    // The reward: promised in the hero, delivered at the end, never revealed early and never a free course.
    const { heroRewardTeaser: teaser, finalReward: reward } = page.shared;
    if (teaser.enabled && !reward.enabled) issue(["shared", "finalReward", "enabled"], "the hero promises a gift, so the final reward must be enabled");
    if (teaser.headline.includes(reward.discountCode) || teaser.description.includes(reward.discountCode) || /\d\s?%|\{discount\}/.test(`${teaser.headline} ${teaser.description}`))
      issue(["shared", "heroRewardTeaser"], "the hero teaser may not reveal the discount or the code");
    for (const key of ["eyebrow", "headline", "description", "codeInstruction", "ctaLabel", "prefilledMessage"] as const) {
      for (const m of reward[key].matchAll(/\{(\w+)\}/g)) if (m[1] !== "discount" && m[1] !== "code") issue(["shared", "finalReward", key], `unknown placeholder {${m[1]}}`);
    }
    if (!reward.prefilledMessage.includes("{code}")) issue(["shared", "finalReward", "prefilledMessage"], "the WhatsApp message must carry {code}, so the visitor never has to type it");
    if (!/paid/i.test(reward.paidDisclosure)) issue(["shared", "finalReward", "paidDisclosure"], 'the reward disclosure must say the course is "Paid"');
    if (/free|නොමිලේ|cash|මුදල් තෑග්ග/i.test(JSON.stringify([reward, teaser]))) issue(["shared", "finalReward"], "the reward is a discount on the course, never a free course or cash");

    // The income figure is the visitor's aspiration and belongs to the extra-income audience only.
    // Business owners are shown business-growth outcomes, never an income figure.
    const goal = /රු\.?\s?100,000/;
    const bg = page.segments.business_growth;
    if (goal.test(JSON.stringify(bg))) issue(["segments", "business_growth"], "business owners are shown business-growth outcomes, never an income figure");
    // And it is said once, in the hero: nowhere in the shared copy.
    if (goal.test(JSON.stringify(page.shared))) issue(["shared"], "the income goal is said once, in the extra_income hero, never in the shared sections");

    // Claims this page is not allowed to make: prices, other figures, guarantees, urgency, scarcity, student results.
    const banned: [RegExp, string][] = [
      [/(?:\brs\.?|\blkr|රු\.?|\$|£|€)\s?\d|\d\s?(?:rs\b|lkr\b|රුපියල්)/i, "a price or income figure"],
      [/\d{1,3}(?:,\d{3})+/, "a large figure"],
      [/guarantee|100\s?%|ඔප්පු|සහතික\s*කරනවා|සහතිකයි/i, "a guarantee"],
      [/last chance|limited (?:seats|spots)|seats left|hurry|deadline|ends (?:today|soon)|අවසන් අවස්ථාව|ආසන \d/i, "urgency or scarcity"],
      [/testimonial|\bstudents? (?:earn|made)|ශිෂ්‍යයන් (?:උපයා|ලබා)/i, "student results"],
    ];
    // Free text that describes the project, never the copy: lists of event names and ids hold no claims.
    const skip = new Set(["strategy", "analytics", "version"]);
    const walk = (value: unknown, path: (string | number)[]): void => {
      if (typeof value === "string") {
        // The one permitted figure is the aspirational goal itself; every other number is still checked.
        const checked = value.replace(/රු\.?\s?100,000/g, "");
        for (const [re, label] of banned) if (re.test(checked)) issue(path, `contains ${label}; this page may not invent that`);
      } else if (Array.isArray(value)) value.forEach((v, i) => walk(v, [...path, i]));
      else if (value && typeof value === "object") Object.entries(value).forEach(([k, v]) => !(path.length === 0 && skip.has(k)) && walk(v, [...path, k]));
    };
    walk(page, []);
  });

export type LandingPage = z.infer<typeof landingPageSchema>;
export type Segment = z.infer<typeof segmentSchema>;
