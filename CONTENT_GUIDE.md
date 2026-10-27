# Content guide

All marketing text lives in [src/content/landing-page.json](src/content/landing-page.json). It is validated with Zod ([src/content/landing-page.schema.ts](src/content/landing-page.schema.ts)) on every build; run `npm run validate:content` to check an edit quickly.

## Structure

- `site`, `navigation`: brand, course name, SEO title and description, sticky CTA label (`primaryCTA`).
- `sections`: exactly five, `hero`, `recognition`, `opportunity`, `instructor`, `final_cta`. Set `enabled` to false to hide one. No other sections can be added without a component.
- `shared`: the neutral version of every section and every essential course fact (course name, paid status, instructor, WhatsApp CTA). These never vary by audience.
- `segments.extra_income` and `segments.business_growth`: the audience copy for hero, recognition, opportunity and final CTA only.
- `personalization`: the goal question and the two options. `settings.enablePersonalization: false` turns the page into the neutral version only.
- `footer`: brand, course and the results disclaimer.

## What the schema refuses

- Turning on the demo, calculator, gallery, long FAQ or course price (`settings` flags must stay `false`).
- A price, income figure, guarantee, urgency or scarcity wording, or student results anywhere in the copy.
- Removing the word "Paid" from `shared.hero.microcopy` or `shared.finalCTA.microcopy`.
- Unknown keys, a wrong section type, or a segment with the wrong number of benefits.

## Notes

- The `eyebrow` fields are validated but not drawn: the design has no eyebrows.
- The `description` of each segment hero is validated but not drawn, to keep the hero to a headline, one sentence and an action.
- The WhatsApp link is configuration, not content: `PUBLIC_WHATSAPP_URL` in `.env`.
- Neutral recognition has no statement list in the supplied JSON, so that version shows the headline and closing line only.

## Beginner confidence section

`sections` lists six sections; `beginner_confidence` sits after `recognition`. Its copy is in `shared.beginnerConfidence` and is the same for every audience. The `eyebrow` of this section is drawn as a pill. `requirementsLabel` and `goalLabel` are short labels added around your copy. `verification` holds two launch gates and `community.accessNote` is an optional line for explaining how the paid community differs from the interest group.
