# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Sinhala-speaking beginners in Sri Lanka, roughly 18 to 40, who own a laptop and want a new skill and extra income. Most arrive on a phone from Facebook ads and decide within seconds whether to join a WhatsApp interest group. Some are employed and learning on the side; many fear coding and do not know how to find a first client. (Audience confirmed by the owner: Facebook ad traffic on phones.)

## Product Purpose

Landing page for "100 Web Designers Mission", the interest-collection stage of a PAID practical course, "AI + WordPress Web Designing & Freelancing", taught in Sinhala by Yohan Rashmitha. The only conversion is an outbound click to a WhatsApp interest group where fee, start date, curriculum and registration will be announced. Joining the group is not enrolment, not payment and not a free course.

## Positioning

Value first: help the visitor recognise their aim (extra income or a stronger business), see the skill as a way there, meet the instructor, and ask for details in a WhatsApp group. Two campaign versions, one set of course facts.

## Operating Context

Sinhala copy mixed with English technical terms. Single static Astro page, content driven by `src/content/landing-page.json`, validated with Zod. Analytics (GA4, GTM, Meta Pixel) behind consent. Mobile first.

## Capabilities and Constraints

- Content comes from `src/content/landing-page.json` (Zod validated). The page has five sections only: hero, recognition, opportunity, instructor, final CTA. The website demo, income calculator, long FAQ and price are removed and cannot be re-enabled from the JSON.
- Never imply the course or group is free. Fee, start date and curriculum are undecided and announced in the group.
- No fake urgency, testimonials, students, certificates, client logos or guaranteed earnings. The two-hour claim stays hidden unless the owner verifies it.
- No real instructor photo yet: never generate one.
- WCAG 2.2 AA, reduced motion respected, Sinhala must wrap and set naturally.

## Brand Commitments

Name: 100 Web Designers Mission. Personality: premium, trustworthy, friendly, modern, technology-forward, ambitious without hype.

## Evidence on Hand

Instructor biography facts (freelancing since 2016, 10+ years, local and international clients). Three licensed demo photographs in `public/images/demo` (credited in footer). Absent and not to be fabricated: instructor photo, student results, testimonials, client logos, price, start date, OG image.

## Product Principles

1. Demonstrate, do not claim.
2. Honest about paid status and limits at every step.
3. One action: the WhatsApp interest group.
4. Phone first, Sinhala first.

## Accessibility & Inclusion

WCAG 2.2 AA; Sinhala script legibility; large tap targets; keyboard accessible demo controls.
