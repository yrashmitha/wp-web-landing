export type EventSource = "page" | "observer" | "segment" | "cta";

export type SegmentId = "extra_income" | "business_growth";
export type SegmentSource = "default" | "route" | "url_param" | "manual";

/** The five standard UTM parameters, lower-cased and trimmed by the attribution module. Empty string when absent. */
export interface Utms {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
}

/** Every event the page can emit, with the exact parameters each one carries. */
export interface EventMap {
  page_view: Utms & { page_path: string; traffic_source: string; campaign_name: string; device_type: DeviceType; segment_id: SegmentId | "neutral"; segment_source: SegmentSource };
  section_viewed: { section_id: string; section_index: number; segment_id: SegmentId | "neutral" };
  scroll_depth_reached: { percent: 10 | 25 | 50 | 75 | 90 | 100; segment_id: SegmentId | "neutral" };
  audience_segment_selected: Utms & { segment_id: SegmentId; previous_segment_id: SegmentId | "neutral"; source_section: string; interaction_count: number };
  whatsapp_cta_clicked: Utms & {
    cta_id: string;
    /** Placement: hero, final or mobile_sticky. */
    cta_location: string;
    section_id: string;
    page_scroll_percent: number;
    segment_id: SegmentId | "neutral";
    segment_source: SegmentSource;
    traffic_source: string;
    campaign_name: string;
  };
  /** The secondary link in the course highlights section. An internal navigation, never a registration. */
  course_content_link_clicked: Utms & { link_id: string; source_section: string; active_segment: SegmentId | "neutral"; page_scroll_percent: number };
  /** /course-content opened. source_section is where the visitor came from, or "direct". */
  course_content_page_viewed: Utms & { source_section: string; active_segment: SegmentId | "neutral"; page_path: string; traffic_source: string; campaign_name: string; device_type: DeviceType };
  /** A week of the curriculum opened. */
  curriculum_week_expanded: Utms & { week_id: string; source_section: string; active_segment: SegmentId | "neutral" };
  /** The Early Bird pricing section was at least half visible for a second. Not a lead and not a registration. */
  pricing_section_viewed: Utms & { section_id: string; active_segment: SegmentId | "neutral"; page_path: string };
  /** The gift teaser in the hero was at least 60% visible for under a second. It names no discount and no code. */
  hero_reward_teaser_viewed: Utms & { section_id: string; active_segment: SegmentId | "neutral"; page_path: string };
  /** The visitor copied the discount code. method says whether the clipboard API or the fallback did it. */
  discount_code_copied: Utms & { section_id: string; active_segment: SegmentId | "neutral"; page_path: string; method: "clipboard" | "fallback" };
  /** An outbound click on the reward's WhatsApp button. It fires alongside whatsapp_cta_clicked. */
  reward_whatsapp_clicked: Utms & { cta_id: string; cta_location: string; section_id: string; active_segment: SegmentId | "neutral"; page_path: string; page_scroll_percent: number };
  /** An outbound click on a WhatsApp button inside a pricing section. It fires alongside whatsapp_cta_clicked. */
  early_bird_cta_clicked: Utms & { cta_id: string; cta_location: string; section_id: string; active_segment: SegmentId | "neutral"; page_path: string; page_scroll_percent: number };
}

export type EventName = keyof EventMap;
export type DeviceType = "mobile" | "tablet" | "desktop";

export interface TrackedEvent<N extends EventName = EventName> {
  name: N;
  params: EventMap[N];
  timestamp: number;
  source: EventSource;
}

export type ConsentState = "granted" | "denied" | "unset";

export interface Destination {
  readonly id: string;
  /** Called once consent allows it. Must never throw. */
  send(event: TrackedEvent): void;
}
