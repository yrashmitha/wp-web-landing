# Content guide

> **Edition 5 (current): five sections.** `hero`, `solution`, `confidence`, `trust`, `final_cta`. Only the hero differs by audience (`segments.<id>.hero`). The recognition, vision/commitment, course-highlights and early-bird sections were merged into these five and removed. The CTA is a direct WhatsApp chat with the number in `src/config/site.ts`. No price, discount or saving is shown on any page (`course-offer.json` → `display.showPricing: false`). Sections below that describe the older nine-section layout are superseded by this note.


Three JSON files hold everything that is written or priced. All are validated with Zod on every build; run `npm run validate:content` to check an edit quickly.

| File | Holds | Schema |
| --- | --- | --- |
| [src/content/landing-page.json](src/content/landing-page.json) | landing page copy, both audiences, CTA labels | [landing-page.schema.ts](src/content/landing-page.schema.ts) |
| [src/content/course-content.json](src/content/course-content.json) | the `/course-content` syllabus: weeks, topics, outcomes, notices | [course-content.schema.ts](src/content/course-content.schema.ts) |
| [src/content/course-offer.json](src/content/course-offer.json) | batch capacity and fees: the only place a price or seat count is typed | [course-offer.schema.ts](src/content/course-offer.schema.ts) |

The WhatsApp link and analytics ids are configuration, not content: `.env` and [src/config/site.ts](src/config/site.ts).

## Changing the syllabus

Edit `course-content.json` only. Add, reorder or reword `weeks[].topics`, change an `outcome`, or add a `notice` (a caveat that stays visible under the week even when it is collapsed). Week ids (`week_1`...) are analytics keys: keep them stable.

## Changing the offer

Edit `course-offer.json` only.

- `pricing.regularFee` and `pricing.earlyBirdFee` are the two fees. Savings and the discount percentage are calculated from them, never stored.
- `batch.capacity` is the batch size. `batch.enrollmentOpen` stays `false` until registration really opens; while it is `false` both pages show the offer as upcoming. Setting it to `true` requires `copy.openNote` (how to register).
- `pricing.earlyBirdDeadline` (YYYY-MM-DD) and `pricing.earlyBirdSeatLimit` are `null` and nothing is shown for them. Setting one also requires its label (`copy.deadlineLabel`, `copy.seatLimitLabel`), which may use `{deadline}` and `{seatLimit}`.
- Copy never contains a typed number. Use placeholders: `{capacity}`, `{regularFee}`, `{earlyBirdFee}`, `{savings}`, `{discountPercent}`. The schema rejects a hand-typed digit.

## landing-page.json structure

- `brand`: name (Next Step Academy), course name, SEO title and description.
- `sections`: nine, in the order they render. `hero`, `recognition`, `vision_commitment`, `solution`, `course_highlights`, `confidence`, `trust`, `early_bird_offer`, `final_cta`. Set `enabled` to false to hide one (the hero must stay on). `early_bird_offer` takes all its copy and numbers from `course-offer.json`.
- `shared`: copy every audience sees (one block per section). `trust.instructor.name` and `role` may be `null` to hide them.
- `segments.extra_income` and `segments.business_growth`: audience copy for the hero, recognition, vision, solution bridge and final CTA.
- `cta`: button labels, the supporting line and the "joining is not registration" note. `personalization`: the optional goal chooser.

## What the schemas refuse

- Turning on the demo, calculator or long FAQ (`settings` flags must stay `false`).
- A price or number in the landing page or syllabus copy (fees live in `course-offer.json`), guarantees, urgency or scarcity wording, student results, and any income figure on the business-growth copy.
- In the syllabus: live sessions, Zoom or Google Meet, certificates, lifetime support, instant approval.
- A missing "Paid" disclosure, unknown keys, a wrong section type, an unknown placeholder, or an Early Bird fee that is not lower than the regular fee.
- `npm run validate:content` also fails if an offer number is typed in either of the other two files.

## Notes

- Eyebrow fields are drawn as small sentence-case labels, never tracked capitals.
- The previous edition is kept at `/v1/` (code in `src/v1/`). Back-ups of earlier JSON are in `assets-src/`.
