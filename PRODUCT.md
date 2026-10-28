# Product

> **Edition 5 (current): five sections.** `hero`, `solution`, `confidence`, `trust`, `final_cta`. Only the hero differs by audience (`segments.<id>.hero`). The recognition, vision/commitment, course-highlights and early-bird sections were merged into these five and removed. The CTA is a direct WhatsApp chat with the number in `src/config/site.ts`. No price, discount or saving is shown on any page (`course-offer.json` → `display.showPricing: false`). Sections below that describe the older nine-section layout are superseded by this note.


<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Sinhala-speaking beginners in Sri Lanka, roughly 18 to 40, who own a laptop and want a new skill and extra income. Most arrive on a phone from Facebook ads and decide within seconds whether to join a WhatsApp interest group. Some are employed and learning on the side; many fear coding and do not know how to find a first client. (Audience confirmed by the owner: Facebook ad traffic on phones.)

## Product Purpose

Landing page for "Next Step Academy" (programme: 100 Web Designers Mission), the interest-collection stage of a PAID practical course, "AI + WordPress Web Designing & Freelancing", taught in Sinhala by Yohan Rashmitha. The only conversion is an outbound click to a WhatsApp interest group where fee, start date, curriculum and registration will be announced. Joining the group is not enrolment, not payment and not a free course.

## Positioning

Future-self first: show a better 2027, let the visitor recognise themselves, frame Rs. 100,000 a month as an aspiration (never a promise), ask for one hour a day, then reveal AI + WordPress Web Designing, remove doubt, show the instructor and invite them to the WhatsApp group. Two campaign versions, one set of course facts.

## Operating Context

Sinhala copy mixed with English technical terms. Single static Astro page, content driven by `src/content/landing-page.json`, validated with Zod. Analytics (GA4, GTM, Meta Pixel) behind consent. Mobile first.

## Capabilities and Constraints

- Content comes from `src/content/landing-page.json` (Zod validated, v4). Seven sections in the JSON's order: hero, recognition, vision and commitment, solution reveal, beginner confidence, proof and community, final CTA. The previous edition lives at `/v1/`. The website demo, income calculator, long FAQ and price are removed and cannot be re-enabled from the JSON.
- Never imply the course or group is free. The first batch (20 students) and fees (regular, Early Bird) are fixed in `src/content/course-offer.json` and shown on both pages as an upcoming offer; the start date and Early Bird deadline are not decided and are never invented. The syllabus lives in `src/content/course-content.json`.
- No fake urgency, testimonials, students, certificates, client logos or guaranteed earnings. The two-hour claim stays hidden unless the owner verifies it.
- No real instructor photo yet: never generate one.
- WCAG 2.2 AA, reduced motion respected, Sinhala must wrap and set naturally.

## Brand Commitments

Name: Next Step Academy. Personality: premium, trustworthy, friendly, modern, technology-forward, ambitious without hype.

## Evidence on Hand

Instructor biography facts (freelancing since 2016, 10+ years, local and international clients). Three licensed demo photographs in `public/images/demo` (credited in footer). Absent and not to be fabricated: instructor photo, student results, testimonials, client logos, price, start date, OG image.

## Product Principles

1. Demonstrate, do not claim.
2. Honest about paid status and limits at every step.
3. One action: the WhatsApp interest group.
4. Phone first, Sinhala first.

## Accessibility & Inclusion

WCAG 2.2 AA; Sinhala script legibility; large tap targets; keyboard accessible demo controls.
