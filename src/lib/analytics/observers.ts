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
    },
    { capture: true },
  );
}
