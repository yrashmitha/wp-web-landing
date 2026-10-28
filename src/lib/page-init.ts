import { siteConfig } from "../config/site";
import { getConsent, getSegment, startAnalytics, track } from "./analytics";
import { writeConsent } from "./analytics/consent";
import { hasAnyDestination } from "./analytics/destinations";
import { observeCourseContentLinks, observeCoursePage, observeCtaClicks, observeRewardTeaser, observeScrollDepth, observeSections } from "./analytics/observers";
import { getAttribution, getUtms } from "./attribution";
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
  const hero = document.querySelector<HTMLElement>("[data-section-id='hero'], [data-sticky-after]");
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
  // Long sections reveal piece by piece as each piece arrives; short blocks reveal whole.
  const pieces = ".sol__head, .sol__caps > li, .sol__ai, .sol__cta, .bc__intro > *, .bc__points, .bc__closing, .trust > *, .final__lead > *, .final__act";
  const targets: HTMLElement[] = [];
  document.querySelectorAll<HTMLElement>(".s > .container > *").forEach((el) => {
    if (!el.querySelector(pieces)) targets.push(el);
  });
  document.querySelectorAll<HTMLElement>(pieces).forEach((el) => targets.push(el));
  targets.forEach((el, i) => {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add("rv");
    el.style.setProperty("--d", `${(i % 3) * 60}ms`);
    io.observe(el);
  });

  // The primary button draws the eye once, when it first scrolls into view.
  const seen = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-seen");
          seen.unobserve(e.target);
        }
      }),
    { threshold: 0.9 },
  );
  document.querySelectorAll<HTMLElement>(".btn--go").forEach((b) => seen.observe(b));
}

/* Copy the discount code: the clipboard API first, a selected-text fallback second, never a silent failure ------ */

function legacyCopy(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  field.remove();
  return ok;
}

function initCopyCode(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-copy-code]").forEach((btn) => {
    const label = btn.querySelector<HTMLElement>("[data-copy-label]");
    const status = document.querySelector<HTMLElement>("[data-copy-status]");
    const idle = label?.textContent ?? "";
    let reset: number | undefined;
    btn.addEventListener("click", async () => {
      const code = btn.dataset.copyCode ?? "";
      let method: "clipboard" | "fallback" = "clipboard";
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        method = "fallback";
        if (!legacyCopy(code)) {
          // Nothing could be copied: select the visible code so the visitor can copy it by hand.
          const target = document.getElementById(btn.getAttribute("aria-describedby") ?? "");
          if (target) window.getSelection()?.selectAllChildren(target);
          return;
        }
      }
      const done = btn.dataset.copiedLabel ?? idle;
      btn.classList.add("is-copied");
      if (label) label.textContent = done;
      if (status) status.textContent = done;
      window.clearTimeout(reset);
      reset = window.setTimeout(() => {
        btn.classList.remove("is-copied");
        if (label) label.textContent = idle;
        if (status) status.textContent = "";
      }, 2400);
      track("discount_code_copied", { section_id: btn.closest<HTMLElement>("[data-section-id]")?.dataset.sectionId ?? "global", active_segment: getSegment().id, page_path: location.pathname, method, ...getUtms() }, "cta");
    });
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

/* Internal links that carry the audience and campaign context to the next page ------------------
   The href works without this script. With it, ?segment= and the UTM labels travel along, so the next page
   reports the same audience and campaign. Click identifiers such as fbclid are never copied. */

function carryContext(): void {
  const { id } = getSegment();
  const utms = getUtms();
  document.querySelectorAll<HTMLAnchorElement>("a[data-carry]").forEach((a) => {
    const url = new URL(a.getAttribute("href") ?? "/", location.origin);
    if (id !== "neutral") url.searchParams.set("segment", id);
    for (const [key, value] of Object.entries(utms)) value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
    if (a.dataset.from) url.searchParams.set("from", a.dataset.from);
    a.setAttribute("href", `${url.pathname}${url.search}`);
  });
}

function initCarry(): void {
  carryContext();
  document.addEventListener("click", (event) => (event.target as Element | null)?.closest("a[data-carry]") && carryContext(), { capture: true });
}

/* Boot -------------------------------------------------------------------------------- */

document.documentElement.classList.add("js");
initConsentBanner();
initStickyCta();
initProgressAndReveal();
initSegmentChoice();
initCarry();
initCopyCode();
startAnalytics();
observeSections();
observeScrollDepth();
observeCtaClicks();
observeCourseContentLinks();
observeCoursePage();
observeRewardTeaser();
