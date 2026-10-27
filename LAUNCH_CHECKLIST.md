# Launch checklist

Blockers, because the page cannot honestly launch without them:

- [ ] `PUBLIC_WHATSAPP_URL` set to the real group invitation link. Until then every CTA is a disabled preview.
- [ ] Click-test all three CTAs (hero, final, mobile sticky) on a phone and on desktop against the real link.
- [ ] `PUBLIC_SITE_URL` set (canonical tag, sitemap, removes `noindex`).
- [ ] After deploying, open `/extra_income/`, `/business_growth/` and `/?segment=business_growth` and check the right headline shows immediately.
- [ ] A native Sinhala reader has read every string in `src/content/landing-page.json`.
- [ ] Confirm "10+ Years of Experience" and "2016" with the instructor (both come from the JSON).

Not on the page until you supply it:

- [ ] Instructor photograph (`shared.instructor.photo`: path under `/images/`, with alt text and size). The section is typographic until then.
- [ ] Open Graph image (not in the JSON; add when one exists).

Tracking:

- [ ] Tracking IDs set and tested in GTM Preview, GA4 DebugView and Meta Events Manager.
- [ ] GA4 custom dimensions registered (see ANALYTICS_GUIDE.md).
- [ ] Privacy policy page linked if you run paid ads.

Beginner confidence section (`beginner_confidence`), confirm before launch:

- [ ] The "about one month, about one hour a day" format matches the real course. It is shown as a learning goal ("අපේ ඉලක්කය"), never a result. Then set `shared.beginnerConfidence.verification.courseFormatConfirmed` to `true`.
- [ ] The instructor really joins the group, and post-course community support really exists. Then set `verification.communitySupportConfirmed` to `true`.
- [ ] If the paid student community differs from the current WhatsApp interest group (access, support), say so in `shared.beginnerConfidence.community.accessNote` (null hides it).
- [ ] Both flags stay `false` until then; every build prints a reminder.
