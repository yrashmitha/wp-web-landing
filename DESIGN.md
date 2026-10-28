---

> **Edition 5 (current): five sections.** `hero`, `solution`, `confidence`, `trust`, `final_cta`. Only the hero differs by audience (`segments.<id>.hero`). The recognition, vision/commitment, course-highlights and early-bird sections were merged into these five and removed. The CTA is a direct WhatsApp chat with the number in `src/config/site.ts`. No price, discount or saving is shown on any page (`course-offer.json` → `display.showPricing: false`). Sections below that describe the older nine-section layout are superseded by this note.

name: 100 Web Designers Mission
description: A calm, confident course page: white space, one strong blue, rounded cards and clear Sinhala type.
---

# Design System: 100 Web Designers Mission

"The Clear Route": near-white page, soft blue-grey bands, exactly one saturated blue, rounded cards, generous Sinhala leading. Tokens live in `src/styles/site.css` (`:root`).

- **Colour:** page-white `oklch(99% 0.004 250)`, tint-band `oklch(96.5% 0.014 255)`, signal-blue `oklch(50% 0.21 262)` (deep `oklch(40% 0.19 265)`, tint `oklch(94% 0.04 262)`), ink `oklch(22% 0.045 265)`, night-navy hero and footer. Action green `oklch(80% 0.2 150)` is reserved for the WhatsApp CTA (pill, arrow, navy text) and appears nowhere else. Amber is reserved for the paid-course disclosure note.
- **Type:** Figtree Variable for Latin, Noto Sans Sinhala Variable for Sinhala (plain, not decorative). Six size roles in `:root` as `--t-*`, fluid with the viewport so a 320px phone gets smaller type than a 390px one (390px to desktop): small 15, body 17 to 18, lead 20 to 22, title 24 to 30, heading 30 to 44, display 34 to 56 (about x1.24 per step on a phone, so each level reads as different), plus the numeral role for the year and goal figure. Three weights only: 400 reading, 600 labels and titles, 700 headings, display and numerals. Size sets the rank; never add a size or weight for one element. Body leading 1.8, headings 1.32. No letter-spacing on Sinhala.
- **Shape:** 12px radius for controls, 20px for cards and panels, 999px pills and icon chips (44px, blue-tint circles, Lucide line icons).
- **Depth:** one soft card shadow; blue button glow; no textures, no themed motifs.
- **Bands:** night-navy hero (a large "2027" in sky blue), recognition tint, vision white with a night goal panel, solution full-bleed blue, confidence white, trust tint, final full-bleed blue, footer night-navy. Sky blue `oklch(80% 0.11 250)` appears only on dark bands, for the year and the goal figure.
- **Hero:** the year set big, kicker, headline, lead, green WhatsApp button, amber paid note, then a quiet divider with the optional goal chooser (two outlined choices, the picked one filled blue) and a scroll cue. Recognition statements are large quote rows; the one-hour commitment is the widest, blue card in its row.
- **Course highlights:** a ruled two-column list (icon chip, title, one line), not five cards. Domain and hosting is the one tinted block because it is the one note. Community is a tint panel with check pills; the section ends with the green WhatsApp button and an outlined secondary link.
- **Offer:** a night-navy band after the proof. Left: the headline and three icon facts. Right: one translucent price panel with the regular fee struck through, the Early Bird fee set large in sky blue, a discount pill, the savings line, an amber upcoming note and the green button. The same component serves the landing page and `/course-content`.
- **Course content page:** night intro with a large "30 Days", four weeks as native `<details>` accordions (first open, caveat notices always visible under each week), a tint support band and the offer. Nav shows a back link to the landing page.
- **Motion:** fade-up once below the fold, nav progress line, card hover lift on desktop, sticky mobile CTA slide; all disabled under reduced motion. 
