---
name: 100 Web Designers Mission
description: A calm, confident course page: white space, one strong blue, rounded cards and clear Sinhala type.
---

# Design System: 100 Web Designers Mission

"The Clear Route": near-white page, soft blue-grey bands, exactly one saturated blue, rounded cards, generous Sinhala leading. Tokens live in `src/styles/site.css` (`:root`).

- **Colour:** page-white `oklch(99% 0.004 250)`, tint-band `oklch(96.5% 0.014 255)`, signal-blue `oklch(50% 0.21 262)` (deep `oklch(40% 0.19 265)`, tint `oklch(94% 0.04 262)`), ink `oklch(22% 0.045 265)`, night-navy footer. Action green `oklch(80% 0.2 150)` is reserved for the WhatsApp CTA (pill, arrow, navy text) and appears nowhere else. Amber is reserved for the paid-course disclosure note.
- **Type:** Figtree Variable for Latin, Noto Sans Sinhala Variable for Sinhala (plain, not decorative), weights 400 to 750. Body leading 1.8, headings 1.32 or more. No condensed or poster faces, no letter-spacing on Sinhala.
- **Shape:** 12px radius for controls, 20px for cards and panels, 999px pills and icon chips (44px, blue-tint circles, Lucide line icons).
- **Depth:** one soft card shadow; blue button glow; no textures, no themed motifs.
- **Bands:** hero white, recognition tint, opportunity white, instructor tint, final full-bleed blue, footer night-navy. The mission is a contained blue panel inside the instructor section.
- **Hero:** course-name pill, headline, lead, blue WhatsApp button, amber paid-status note; on the right a white goal card where the chosen audience fills blue.
- **Motion:** fade-up once below the fold, nav progress line, card hover lift on desktop, sticky mobile CTA slide; all disabled under reduced motion. Phones turn the three benefit cards into a swipe rail.
