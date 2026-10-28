import { z } from "zod";

/**
 * Schema for src/content/course-content.json: the full syllabus. Edit that file whenever the syllabus changes.
 * Prices, fees, discounts and seat counts never belong here; they come from course-offer.json.
 */

const text = z.string().trim().min(1);
const sentence = text.max(300);
const paragraph = text.max(520);
const stableId = z.string().regex(/^[a-z][a-z0-9_]*$/, "ids use lowercase letters, digits and underscores and never change once published");

export const courseContentSchema = z
  .object({
    page: z
      .object({
        slug: z.literal("/course-content"),
        title: text.max(160),
        eyebrow: text,
        headline: text.max(200),
        description: paragraph,
        backLabel: text.max(60),
        delivery: z.array(text.max(80)).min(1).max(8),
        duration: text.max(40),
        practice: sentence,
        isPaid: z.literal(true),
      })
      .strict(),
    weeks: z
      .array(
        z
          .object({
            id: stableId,
            title: text.max(160),
            subtitle: sentence,
            topics: z.array(text.max(200)).min(1).max(14),
            outcome: sentence,
            /** Optional caveat, always visible under the week even when it is collapsed. */
            notice: sentence.optional(),
          })
          .strict(),
      )
      .min(1)
      .max(8),
    support: z.object({ headline: text.max(160), description: paragraph, features: z.array(text.max(120)).min(1).max(8) }).strict(),
    enrollment: z
      .object({
        headline: text.max(160),
        description: paragraph,
        cta: z.object({ label: text.max(80), action: z.literal("join_whatsapp") }).strict(),
        /** Copy only. The fee, discount and capacity come from course-offer.json. */
        earlyBird: z.object({ enabled: z.boolean(), title: text.max(80), description: sentence }).strict(),
      })
      .strict(),
  })
  .strict()
  .superRefine((c, ctx) => {
    const issue = (path: (string | number)[], message: string): void => void ctx.addIssue({ code: "custom", path, message });
    const ids = c.weeks.map((w) => w.id);
    if (new Set(ids).size !== ids.length) issue(["weeks"], "week ids must be unique");

    // Claims this page may not make: prices (they live in course-offer.json), guarantees, live sessions, certificates, lifetime support, urgency.
    const banned: [RegExp, string][] = [
      [/(?:\brs\.?|\blkr|රු\.?|\$|£|€)\s?\d|\d\s?(?:rs\b|lkr\b|රුපියල්)/i, "a price"],
      [/\d{1,3}(?:,\d{3})+/, "a large figure"],
      [/guarantee|100\s?%|ඔප්පු|සහතික\s*කරනවා|සහතිකයි/i, "a guarantee"],
      [/live\s+(?:sessions?|classes|class|lessons?|zoom|webinars?|meetings?)|zoom|google meet|ලයිව්\s*(?:පන්ති|සැසි)/i, "a live session (the course is recorded lessons plus a community)"],
      [/certif|lifetime|ජීවිතාන්තය|සහතිකපත්‍ර/i, "a certificate or lifetime support"],
      [/last chance|limited (?:seats|spots)|seats left|hurry|ends (?:today|soon)|අවසන් අවස්ථාව|ආසන \d/i, "urgency or scarcity"],
      [/testimonial|\bstudents? (?:earn|made)|ශිෂ්‍යයන් (?:උපයා|ලබා)|instant approval/i, "student results or instant approval"],
    ];
    const walk = (value: unknown, path: (string | number)[]): void => {
      if (typeof value === "string") {
        for (const [re, label] of banned) if (re.test(value)) issue(path, `contains ${label}; this page may not say that`);
      } else if (Array.isArray(value)) value.forEach((v, i) => walk(v, [...path, i]));
      else if (value && typeof value === "object") Object.entries(value).forEach(([k, v]) => walk(v, [...path, k]));
    };
    walk(c, []);
  });

export type CourseContent = z.infer<typeof courseContentSchema>;
