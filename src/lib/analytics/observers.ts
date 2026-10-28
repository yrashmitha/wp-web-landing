import { getCampaignLabels, getUtms } from "../attribution";
import { getPageState, getSegment, setScrollPercent, track } from "./index";

/* Section visibility ------------------------------------------------------------------ */

const VIEW_DWELL_MS = 1000; // visible this long (continuously) before section_viewed
const MIN_VISIBLE_SHARE = 0.5; // of the section, or of the viewport for oversized sections

interface SectionTrack {
  id: string;
  index: number;
  visible: boolean;
  viewTimer: number | undefined;
  viewed: boolean;
  /** The section shows the offer, so pricing_section_viewed fires with section_viewed. */
  pricing: boolean;
}

export function observeSections(): void {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-section-id]"));
  if (!nodes.length || !("IntersectionObserver" in window)) return;

  const tracks = new Map<Element, SectionTrack>();
  nodes.forEach((el, i) =>
    tracks.set(el, {
      id: el.dataset.sectionId ?? `section_${i}`,
      index: i,
      visible: false,
      viewTimer: undefined,
      viewed: false,
      pricing: el.dataset.pricingSection !== undefined,
    }),
  );

  const setVisible = (t: SectionTrack, visible: boolean): void => {
    if (t.visible === visible) return;
    t.visible = visible;
    if (visible) {
      if (!t.viewed) {
        t.viewTimer = window.setTimeout(() => {
          t.viewed = true;
          track("section_viewed", { section_id: t.id, section_index: t.index, segment_id: getSegment().id }, "observer");
          if (t.pricing) track("pricing_section_viewed", { section_id: t.id, active_segment: getSegment().id, page_path: location.pathname, ...getUtms() }, "observer");
        }, VIEW_DWELL_MS);
      }
    } else {
      window.clearTimeout(t.viewTimer);
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const t = tracks.get(entry.target);
        if (!t) continue;
        const vh = entry.rootBounds?.height ?? window.innerHeight;
        const needed = Math.min(entry.boundingClientRect.height * MIN_VISIBLE_SHARE, vh * MIN_VISIBLE_SHARE);
        setVisible(t, !document.hidden && entry.isIntersecting && entry.intersectionRect.height >= Math.max(needed, 1));
      }
    },
    { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
  );
  nodes.forEach((n) => io.observe(n));

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) tracks.forEach((t) => setVisible(t, false));
    else {
      // re-evaluate every section on return
      nodes.forEach((n) => {
        io.unobserve(n);
        io.observe(n);
      });
    }
  });
}

/* Scroll depth ------------------------------------------------------------------------ */

const DEPTHS = [10, 25, 50, 75, 90, 100] as const;

export function observeScrollDepth(): void {
  const fired = new Set<number>();
  let ticking = false;

  const measure = (): void => {
    ticking = false;
    const doc = document.documentElement;
    const total = doc.scrollHeight;
    if (total <= 0) return;
    const percent = Math.min(100, ((window.scrollY + window.innerHeight) / total) * 100);
    setScrollPercent(Math.round(percent));
    for (const d of DEPTHS) {
      if (percent >= d - 0.5 && !fired.has(d)) {
        fired.add(d);
        track("scroll_depth_reached", { percent: d, segment_id: getSegment().id }, "observer");
      }
    }
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(measure);
      }
    },
    { passive: true },
  );
  measure();
}

/* Clicks and disclosures ---------------------------------------------------------------- */

export function observeCtaClicks(): void {
  document.addEventListener(
    "click",
    (event) => {
      const link = (event.target as Element | null)?.closest<HTMLElement>("[data-cta-id]");
      if (!link) return;
      const s = getPageState();
      const seg = getSegment();
      // An outbound click only. It does not mean the visitor joined the group or enrolled.
      track(
        "whatsapp_cta_clicked",
        {
          cta_id: link.dataset.ctaId ?? "unknown",
          cta_location: link.dataset.ctaLocation ?? "unknown",
          section_id: link.closest<HTMLElement>("[data-section-id]")?.dataset.sectionId ?? "global",
          page_scroll_percent: s.scrollPercent,
          segment_id: seg.id,
          segment_source: seg.source,
          ...getCampaignLabels(),
          ...getUtms(),
        },
        "cta",
      );
      if (link.dataset.reward !== undefined) {
        track(
          "reward_whatsapp_clicked",
          {
            cta_id: link.dataset.ctaId ?? "unknown",
            cta_location: link.dataset.ctaLocation ?? "unknown",
            section_id: link.closest<HTMLElement>("[data-section-id]")?.dataset.sectionId ?? "global",
            active_segment: seg.id,
            page_path: location.pathname,
            page_scroll_percent: s.scrollPercent,
            ...getUtms(),
          },
          "cta",
        );
      }
      if (link.dataset.earlyBird !== undefined) {
        track(
          "early_bird_cta_clicked",
          {
            cta_id: link.dataset.ctaId ?? "unknown",
            cta_location: link.dataset.ctaLocation ?? "unknown",
            section_id: link.closest<HTMLElement>("[data-section-id]")?.dataset.sectionId ?? "global",
            active_segment: seg.id,
            page_path: location.pathname,
            page_scroll_percent: s.scrollPercent,
            ...getUtms(),
          },
          "cta",
        );
      }
    },
    { capture: true },
  );
}

/* Course content: the link from the landing page, the page view and the curriculum weeks ------ */

const safeLabel = (value: string | null, fallback: string): string => (value && /^[a-z0-9_]{1,40}$/.test(value) ? value : fallback);

export function observeCourseContentLinks(): void {
  document.addEventListener(
    "click",
    (event) => {
      const link = (event.target as Element | null)?.closest<HTMLElement>("[data-course-link]");
      if (!link) return;
      track(
        "course_content_link_clicked",
        {
          link_id: link.dataset.courseLink || "unknown",
          source_section: link.closest<HTMLElement>("[data-section-id]")?.dataset.sectionId ?? "global",
          active_segment: getSegment().id,
          page_scroll_percent: getPageState().scrollPercent,
          ...getUtms(),
        },
        "cta",
      );
    },
    { capture: true },
  );
}

export function observeCoursePage(): void {
  if (document.body.dataset.page !== "course_content") return;
  const width = window.innerWidth;
  track(
    "course_content_page_viewed",
    {
      source_section: safeLabel(new URLSearchParams(location.search).get("from"), "direct"),
      active_segment: getSegment().id,
      page_path: location.pathname,
      device_type: width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop",
      ...getCampaignLabels(),
      ...getUtms(),
    },
    "page",
  );
  // <details> toggle events do not bubble, so each week is listened to directly.
  document.querySelectorAll<HTMLDetailsElement>("details[data-week-id]").forEach((d) =>
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      track("curriculum_week_expanded", { week_id: d.dataset.weekId ?? "unknown", source_section: "curriculum", active_segment: getSegment().id, ...getUtms() }, "observer");
    }),
  );
}

/* The hero's gift teaser: counted once, after it has been on screen long enough to be read ------ */

export function observeRewardTeaser(): void {
  const el = document.querySelector<HTMLElement>("[data-reward-teaser]");
  if (!el || !("IntersectionObserver" in window)) return;
  let timer: number | undefined;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        window.clearTimeout(timer);
        if (!e.isIntersecting) continue;
        timer = window.setTimeout(() => {
          track("hero_reward_teaser_viewed", { section_id: "hero", active_segment: getSegment().id, page_path: location.pathname, ...getUtms() }, "observer");
          io.disconnect();
        }, 800);
      }
    },
    { threshold: 0.6 },
  );
  io.observe(el);
}
