# Analytics guide

> **Edition 5 (current): five sections.** `hero`, `solution`, `confidence`, `trust`, `final_cta`. Only the hero differs by audience (`segments.<id>.hero`). The recognition, vision/commitment, course-highlights and early-bird sections were merged into these five and removed. The CTA is a direct WhatsApp chat with the number in `src/config/site.ts`. No price, discount or saving is shown on any page (`course-offer.json` → `display.showPricing: false`). Sections below that describe the older nine-section layout are superseded by this note.


Everything goes through `track()` in [src/lib/analytics/index.ts](src/lib/analytics/index.ts). Destinations (GTM, GA4, Meta Pixel) live in `destinations.ts`. Event shapes are typed in `types.ts`. Nothing loads until the visitor consents, unless `PUBLIC_REQUIRE_CONSENT=false`.

## Entry URLs

| URL | Shows |
| --- | --- |
| `/` | the default audience (`settings.defaultSegment`, extra income) with the optional goal chooser |
| `/extra_income/`, `/business_growth/` | that audience, fixed |
| `/?segment=business_growth` | the same on the root |
| `/course-content` | the full curriculum; `?segment=` and UTMs are honoured here too |
| `/v1/` | the previous edition, kept for reference, `noindex` |

Add UTMs to any of them, for example `/extra_income/?utm_source=facebook&utm_medium=paid&utm_campaign=may_a&utm_content=ad1`. The link from the landing page to `/course-content` and the way back carry `segment` and the five UTM parameters, so the second page reports the same audience and campaign. Click identifiers such as `fbclid` are never copied.

## Events

| Event | Fires | Key parameters |
| --- | --- | --- |
| `page_view` | once on load, on both pages | utm_*, traffic_source, campaign_name, device_type, segment_id, segment_source, page_path |
| `section_viewed` | a section is at least half visible for 1 second | section_id, section_index, segment_id |
| `scroll_depth_reached` | 10, 25, 50, 75, 90, 100 percent | percent, segment_id |
| `audience_segment_selected` | the visitor switches audience | segment_id, previous_segment_id, source_section, interaction_count, utm_* |
| `whatsapp_cta_clicked` | an outbound click on any WhatsApp button | cta_id, cta_location, section_id, page_scroll_percent, segment_id, segment_source, utm_*, traffic_source, campaign_name |
| `course_content_link_clicked` | the secondary link in the course highlights section | link_id, source_section, active_segment, page_scroll_percent, utm_* |
| `course_content_page_viewed` | `/course-content` opens | source_section (`course_highlights` or `direct`), active_segment, page_path, device_type, traffic_source, campaign_name, utm_* |
| `curriculum_week_expanded` | a week opens (closing does not fire; week 1 starts open and is not counted) | week_id, source_section (`curriculum`), active_segment, utm_* |
| `pricing_section_viewed` | an offer section is at least half visible for 1 second | section_id (`early_bird_offer` or `course_offer`), active_segment, page_path, utm_* |
| `early_bird_cta_clicked` | a WhatsApp click inside an offer section; fires together with `whatsapp_cta_clicked` | cta_id, cta_location, section_id, active_segment, page_path, page_scroll_percent, utm_* |

`cta_location` values: `hero` (`hero_whatsapp`), `final` (`final_whatsapp`), `mobile_sticky` (`sticky_whatsapp`), `course_highlights` (the id in the JSON), `early_bird` (`early_bird_whatsapp`), `course_offer` (`course_offer_whatsapp`).

A click is an outbound click. A visit to `/course-content`, a pricing view and a WhatsApp click are never reported as a lead, a registration or a payment, and Meta never receives them as Lead, CompleteRegistration or Purchase.

Meta Pixel mapping (`destinations.ts`): `page_view` → `PageView`, `whatsapp_cta_clicked` → `Contact`, `course_content_page_viewed` → `ViewContent`. Every other event is sent with `trackCustom` under its own name. Set `PUBLIC_META_PIXEL_ID` in `.env`; with `PUBLIC_GTM_ID` set instead, the pixel must be configured inside GTM.

Register as custom dimensions in GA4: `segment_id`, `active_segment`, `segment_source`, `cta_id`, `cta_location`, `section_id`, `source_section`, `link_id`, `week_id`, `page_path`, `percent`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`.

## Testing events

Build with a GTM id and the consent requirement off, serve the output, and read `window.dataLayer`:

```
PUBLIC_GTM_ID=GTM-TEST123 PUBLIC_REQUIRE_CONSENT=false PUBLIC_WHATSAPP_URL=https://chat.whatsapp.com/TEST npx astro build --outDir dist-test
```
