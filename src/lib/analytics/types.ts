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
