import raw from "./course-offer.json";
import { courseOfferSchema, type CourseOfferData, type OfferPlaceholder } from "./course-offer.schema";

export interface CourseOffer {
  data: CourseOfferData;
  capacity: number;
  regularFee: number;
  earlyBirdFee: number;
  /** Calculated from the two fees. */
  savings: number;
  /** Calculated from the two fees, rounded to a whole percent. */
  discountPercent: number;
  enrollmentOpen: boolean;
  earlyBirdActive: boolean;
  /** False: no fee, discount or saving is drawn anywhere. */
  showPricing: boolean;
  money: (amount: number) => string;
  /** Replaces {placeholders} in a copy string with the configured, formatted values. */
  fill: (template: string) => string;
  /** Every copy string with its placeholders already filled. */
  copy: Record<keyof CourseOfferData["copy"], string | null>;
}

const money = (amount: number): string => `රු. ${amount.toLocaleString("en-US")}`;

/** Validates course-offer.json once and fails the build with a readable list of problems. */
export function loadOffer(): CourseOffer {
  const parsed = courseOfferSchema.safeParse(raw);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
    throw new Error(`course-offer.json is invalid:\n${problems}`);
  }
  const data = parsed.data;
  const { pricing, batch } = data;
  const savings = pricing.regularFee - pricing.earlyBirdFee;
  const discountPercent = Math.round((savings / pricing.regularFee) * 100);

  const values: Record<OfferPlaceholder, string> = {
    capacity: String(batch.capacity),
    regularFee: money(pricing.regularFee),
    earlyBirdFee: money(pricing.earlyBirdFee),
    savings: money(savings),
    discountPercent: `${discountPercent}%`,
    deadline: pricing.earlyBirdDeadline ?? "",
    seatLimit: pricing.earlyBirdSeatLimit === null ? "" : String(pricing.earlyBirdSeatLimit),
  };
  const fill = (template: string): string => template.replace(/\{(\w+)\}/g, (_, key: string) => values[key as OfferPlaceholder] ?? "");
  const copy = Object.fromEntries(Object.entries(data.copy).map(([k, v]) => [k, v === null ? null : fill(v)])) as CourseOffer["copy"];

  return {
    data,
    capacity: batch.capacity,
    regularFee: pricing.regularFee,
    earlyBirdFee: pricing.earlyBirdFee,
    savings,
    discountPercent,
    enrollmentOpen: batch.enrollmentOpen,
    earlyBirdActive: pricing.earlyBirdEnabled,
    showPricing: data.display.showPricing,
    money,
    fill,
    copy,
  };
}
