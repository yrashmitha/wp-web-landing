import { z } from "zod";

/**
 * Schema for src/content/course-offer.json: the single source of truth for batch capacity and pricing.
 * Savings and the discount percentage are always calculated from the two fees, never stored.
 * Copy may reference numbers only through placeholders such as {earlyBirdFee}, so a number is typed once.
 */

const text = z.string().trim().min(1);
const nullableText = text.nullable();

export const offerPlaceholders = ["capacity", "regularFee", "earlyBirdFee", "savings", "discountPercent", "deadline", "seatLimit"] as const;
export type OfferPlaceholder = (typeof offerPlaceholders)[number];

export const courseOfferSchema = z
  .object({
    courseId: z.string().regex(/^[a-z0-9-]+$/, "a lowercase slug"),
    batch: z
      .object({
        name: text,
        capacity: z.number().int().positive().max(1000),
        /** While false the offer is shown as upcoming and nothing implies that registration is open. */
        enrollmentOpen: z.boolean(),
      })
      .strict(),
    display: z
      .object({
        /** false hides every fee, discount and saving on both pages and asks visitors to join WhatsApp for details. The prices below stay on file. */
        showPricing: z.boolean(),
      })
      .strict(),
    pricing: z
      .object({
        currency: z.literal("LKR"),
        regularFee: z.number().int().positive(),
        earlyBirdFee: z.number().int().positive(),
        earlyBirdEnabled: z.boolean(),
        /** Optional. Shown only when set, together with copy.deadlineLabel. Never invented. */
        earlyBirdDeadline: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "a date as YYYY-MM-DD")
          .nullable(),
        /** Optional. Shown only when set, together with copy.seatLimitLabel. Never invented. */
        earlyBirdSeatLimit: z.number().int().positive().nullable(),
      })
      .strict(),
    copy: z
      .object({
        eyebrow: text,
        headline: text.max(200),
        description: text.max(400),
        capacityMessage: text.max(300),
        earlyBirdMessage: text.max(300),
        communityMessage: text.max(300),
        primaryCTA: text.max(80),
        /** Used instead of headline and earlyBirdMessage while display.showPricing is false. */
        detailsHeadline: text.max(200),
        detailsNote: text.max(300),
        paymentNote: nullableText,
        regularLabel: text.max(60),
        earlyBirdLabel: text.max(60),
        discountBadge: text.max(80),
        savingsLine: text.max(120),
        upcomingNote: text.max(300),
        openNote: nullableText,
        deadlineLabel: nullableText,
        seatLimitLabel: nullableText,
      })
      .strict(),
  })
  .strict()
  .superRefine((offer, ctx) => {
    const issue = (path: (string | number)[], message: string): void => void ctx.addIssue({ code: "custom", path, message });
    const { pricing, batch, copy } = offer;

    if (pricing.earlyBirdFee >= pricing.regularFee) issue(["pricing", "earlyBirdFee"], "the Early Bird fee must be lower than the regular fee");
    if (pricing.earlyBirdSeatLimit !== null && pricing.earlyBirdSeatLimit > batch.capacity) issue(["pricing", "earlyBirdSeatLimit"], "the Early Bird seat limit cannot exceed the batch capacity");
    if (pricing.earlyBirdDeadline !== null && !copy.deadlineLabel) issue(["copy", "deadlineLabel"], "a deadline needs copy.deadlineLabel, otherwise it is never shown");
    if (pricing.earlyBirdSeatLimit !== null && !copy.seatLimitLabel) issue(["copy", "seatLimitLabel"], "a seat limit needs copy.seatLimitLabel, otherwise it is never shown");
    if (batch.enrollmentOpen && !copy.openNote) issue(["copy", "openNote"], "when enrollment is open, copy.openNote must say how to register");

    // Every placeholder in the copy must exist, and no price or count may be typed by hand.
    const allowed = new Set<string>(offerPlaceholders);
    for (const [key, value] of Object.entries(copy)) {
      if (typeof value !== "string") continue;
      for (const m of value.matchAll(/\{(\w+)\}/g)) if (!allowed.has(m[1] ?? "")) issue(["copy", key], `unknown placeholder {${m[1]}}`);
      if (key !== "eyebrow" && /\d/.test(value.replace(/\{\w+\}/g, ""))) issue(["copy", key], "numbers come from the pricing fields: use a placeholder such as {earlyBirdFee}");
    }
  });

export type CourseOfferData = z.infer<typeof courseOfferSchema>;
