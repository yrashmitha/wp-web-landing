import { siteConfig } from "../config/site";
import { getConsent, getSegment, startAnalytics, track } from "./analytics";
import { writeConsent } from "./analytics/consent";
import { hasAnyDestination } from "./analytics/destinations";
import { observeCtaClicks, observeScrollDepth, observeSections } from "./analytics/observers";
import { getAttribution } from "./attribution";
import type { SegmentId } from "./analytics/types";

/* Consent banner ---------------------------------------------------------------------- */

function initConsentBanner(): void {
  const banner = document.getElementById("consent-banner");
  if (!banner) return;
  const needed = hasAnyDestination() && siteConfig.analytics.requireConsent && getConsent() === "unset";
  banner.hidden = !needed;
  document.documentElement.classList.toggle("has-consent-banner", needed);
  banner.querySelectorAll<HTMLButtonElement>("[data-consent]").forEach((btn) =>
    btn.addEventListener("click", () => {
      writeConsent(btn.dataset.consent === "granted" ? "granted" : "denied");
      banner.hidden = true;
      document.documentElement.classList.remove("has-consent-banner");
    }),
  );
}

/* Mobile sticky CTA: appears after the hero, steps aside over the final section and footer ------ */

function initStickyCta(): void {
  const bar = document.getElementById("sticky-cta");
  const hero = document.querySelector<HTMLElement>("[data-section-id='hero']");
  if (!bar || !hero || !("IntersectionObserver" in window)) return;
  let pastHero = false;
  const covering = new Set<Element>();
  const apply = (): void => {
    bar.dataset.visible = String(pastHero && covering.size === 0);
  };
  new IntersectionObserver(([e]) => {
    pastHero = !!e && !e.isIntersecting && e.boundingClientRect.top < 0;
    apply();
  }).observe(hero);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? covering.add(e.target) : covering.delete(e.target)));
    apply();
  });
  document.querySelectorAll<HTMLElement>("[data-hide-sticky]").forEach((el) => io.observe(el));
}

/* Thin progress line along the nav, and a one-time fade up for blocks below the fold ---------- */

function initProgressAndReveal(): void {
  const nav = document.querySelector<HTMLElement>(".nav");
  let ticking = false;
  const update = (): void => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav?.style.setProperty("--progress", (max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0).toFixed(3));
  };
  window.addEventListener("scroll", () => !ticking && ((ticking = true), requestAnimationFrame(update)), { passive: true });
  update();

  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { rootMargin: "0px 0px -6% 0px" },
  );
  document.querySelectorAll<HTMLElement>(".s > .container > *").forEach((el, i) => {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add("rv");
    el.style.setProperty("--d", `${(i % 3) * 60}ms`);
    io.observe(el);
  });
}

/* Audience choice: switches the already-rendered versions in place, no reload, no flash -------- */

function syncSegmentUi(): void {
  const { id } = getSegment();
  document.querySelectorAll<HTMLElement>("[data-seg-choose]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.segChoose === id)));
}

function initSegmentChoice(): void {
  let interactions = 0;
  document.querySelectorAll<HTMLButtonElement>("[data-seg-choose]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const next = btn.dataset.segChoose as SegmentId;
      const prev = getSegment().id;
      if (next === prev) return;
      const d = document.documentElement;
      d.dataset.seg = next;
      d.dataset.segSource = "manual";
      try {
        // Remembered for this exact page only, so a different campaign link in the same tab still wins.
        sessionStorage.setItem("wdm_seg_manual", `${location.pathname}|${next}`);
      } catch {
        /* the choice then lasts for this page view only */
      }
      interactions += 1;
      const { utm_source, utm_medium, utm_campaign, utm_content, utm_term } = getAttribution();
      track(
        "audience_segment_selected",
        { segment_id: next, previous_segment_id: prev, source_section: "hero", interaction_count: interactions, utm_source, utm_medium, utm_campaign, utm_content, utm_term },
        "segment",
      );
      syncSegmentUi();
    }),
  );
  syncSegmentUi();
}

/* Boot -------------------------------------------------------------------------------- */

document.documentElement.classList.add("js");
initConsentBanner();
initStickyCta();
initProgressAndReveal();
initSegmentChoice();
startAnalytics();
observeSections();
observeScrollDepth();
observeCtaClicks();

if (import.meta.env.DEV && !siteConfig.whatsappUrl) {
  console.warn("[100 Web Designers Mission] LAUNCH BLOCKER: PUBLIC_WHATSAPP_URL is missing or invalid. CTAs render as disabled previews. See .env.example.");
}
