import { readFileSync } from "node:fs";
import { loadContent } from "../src/content/content-loader";
import { loadCourseContent } from "../src/content/course-content-loader";
import { loadOffer } from "../src/content/course-offer";

const read = (file: string): string => readFileSync(new URL(`../src/content/${file}`, import.meta.url), "utf8");

try {
  const { page, sections } = loadContent();
  console.log(`landing-page.json is valid: ${sections.length} enabled sections (${sections.join(", ")}), ${page.personalization.options.length} audiences, paid course, status ${page.brand.phase}.`);

  const course = loadCourseContent();
  console.log(`course-content.json is valid: ${course.weeks.length} weeks (${course.weeks.map((w) => w.id).join(", ")}), ${course.weeks.reduce((n, w) => n + w.topics.length, 0)} topics.`);

  const offer = loadOffer();
  console.log(
    `course-offer.json is valid: capacity ${offer.capacity}; regular ${offer.money(offer.regularFee)}, Early Bird ${offer.money(offer.earlyBirdFee)}, savings ${offer.money(offer.savings)} (${offer.discountPercent}%), enrollment ${offer.enrollmentOpen ? "open" : "not open (shown as upcoming)"}.`,
  );

  const { finalReward } = page.shared;
  if (finalReward.enabled && finalReward.discountPercent !== offer.discountPercent) {
    console.error(`finalReward.discountPercent is ${finalReward.discountPercent} but course-offer.json calculates ${offer.discountPercent}%`);
    process.exit(1);
  }
  console.log(`reward is valid: ${finalReward.discountPercent}% with code ${finalReward.discountCode}, matching the offer's calculated discount.`);

  // Pricing must be defined once: the offer's numbers may not appear as typed text in the other two files.
  const others: Record<string, string> = { "landing-page.json": read("landing-page.json"), "course-content.json": read("course-content.json") };
  const numbers = [offer.regularFee, offer.earlyBirdFee, offer.savings].flatMap((n) => [String(n), n.toLocaleString("en-US")]);
  const alone = (n: string): RegExp => new RegExp(`(?<![\\d,])${n}(?![\\d,])`);
  let repeated = 0;
  for (const [file, body] of Object.entries(others)) {
    for (const n of numbers) {
      if (alone(n).test(body)) {
        repeated += 1;
        console.error(`${file} repeats the offer number ${n}; use course-offer.json`);
      }
    }
    if (alone(String(offer.capacity)).test(body)) {
      repeated += 1;
      console.error(`${file} repeats the batch capacity ${offer.capacity}; use course-offer.json`);
    }
  }
  if (repeated) process.exit(1);
  console.log("pricing is defined once: no offer number is repeated in landing-page.json or course-content.json.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
