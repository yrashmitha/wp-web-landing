# Analytics guide

Everything goes through `track()` in [src/lib/analytics/index.ts](src/lib/analytics/index.ts). Destinations (GTM, GA4, Meta Pixel) live in `destinations.ts`. Event shapes are typed in `types.ts`. Nothing loads until the visitor consents, unless `PUBLIC_REQUIRE_CONSENT=false`.

## Campaign entry URLs

| URL | Shows |
| --- | --- |
| `/` | neutral version with the goal switcher |
| `/extra_income/` | extra income version |
| `/business_growth/` | business growth version |
| `/?segment=extra_income` | the same, on the root (neutral page only) |

Add UTMs to any of them, for example `/extra_income/?utm_source=facebook&utm_medium=paid&utm_campaign=may_a&utm_content=ad1`. A visitor's manual switch is remembered for that exact page in the tab.

## Events

| Event | Fires | Key parameters |
| --- | --- | --- |
| `page_view` | once on load | utm_*, traffic_source, campaign_name, device_type, segment_id, segment_source |
| `section_viewed` | a section is at least half visible for 1 second | section_id (`hero`, `recognition`, `opportunity`, `instructor`, `final_cta`), section_index, segment_id |
| `scroll_depth_reached` | 10, 25, 50, 75, 90, 100 percent | percent, segment_id |
| `audience_segment_selected` | the visitor switches audience | segment_id, previous_segment_id, source_section, interaction_count, utm_* |
| `whatsapp_cta_clicked` | an outbound click on a WhatsApp button | cta_id, cta_location, section_id, page_scroll_percent, segment_id, segment_source, utm_*, traffic_source, campaign_name |

`cta_location` is the placement: `hero` (`hero_whatsapp`), `final` (id from the JSON, `final_whatsapp`) or `mobile_sticky` (`sticky_whatsapp`). A click is an outbound click, never a lead or enrolment. Click identifiers such as fbclid are never sent as parameters.

Register as custom dimensions in GA4: `segment_id`, `segment_source`, `cta_id`, `cta_location`, `section_id`, `percent`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`.
