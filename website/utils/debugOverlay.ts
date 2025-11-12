/**
 * Lightweight, framework-agnostic debug overlay used during development
 * or when the __d debug flag is enabled. It surfaces section metadata,
 * loader latency, and cache behaviour directly on the rendered page.
 */
export function debugOverlay() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const OVERLAY_CLASS = "deco-debug-on";
  const SECTION_CLASS = "deco-debug-section";
  const BADGE_CLASS = "deco-debug-badge";
  const OVERLAY_PANEL_CLASS = "deco-debug-overlay-panel";
  const SUMMARY_CLASS = "deco-debug-summary";
  const TOGGLE_ID = "deco-debug-toggle";
  const STYLE_ID = "deco-debug-style";
  const SUMMARY_TOGGLE_ID = "deco-debug-summary-toggle";

  type LoaderSummary = {
    loader: string;
    status: string;
    latencyMs: number;
    cacheMode: string;
    cacheConfigured: boolean;
    cacheKey: string | null;
    cacheMaxAge: number | null;
  };

  const colors = {
    pure: "#2ecc71",
    cached: "#568203",
    stale: "#f1c40f",
    mixed: "#9b59b6",
    miss: "#e74c3c",
    error: "#c0392b",
    default: "#3498db",
  };

  const hexToRgb = (hex: string) => {
    const normalized = hex.replace("#", "");
    const value = normalized.length === 3
      ? normalized.split("").map((c) => c + c).join("")
      : normalized;
    const r = parseInt(value.substring(0, 2), 16);
    const g = parseInt(value.substring(2, 4), 16);
    const b = parseInt(value.substring(4, 6), 16);
    if ([r, g, b].some((channel) => Number.isNaN(channel))) {
      return undefined;
    }
    return { r, g, b };
  };

  const setBadgePalette = (badge: HTMLElement, color: string) => {
    badge.style.setProperty("--deco-badge-accent", color);
  };

  const ensureStyleTag = () => {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      html.${OVERLAY_CLASS} {
        scroll-behavior: auto;
      }
      .${OVERLAY_PANEL_CLASS} {
        position: absolute;
        inset: 0;
        z-index: 9999;
        background: rgba(15, 23, 42, 0.08);
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 6px;
        pointer-events: none;
      }
      .${BADGE_CLASS} {
        position: relative;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px 18px;
        background: rgba(248, 250, 252, 0.96);
        color: #0f172a;
        font: 12px/1.45 "Inter", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
        border: 2px solid var(--deco-badge-accent, rgba(148, 163, 184, 0.35));
        border-radius: 12px;
        min-height: 48px;
        min-width: 320px;
        max-width: min(780px, 96vw);
        pointer-events: auto;
      }
      .${BADGE_CLASS}__title {
        font-weight: 700;
        font-size: 14px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #0f172a;
        white-space: nowrap;
      }
      .${BADGE_CLASS}__body {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        min-width: 0;
      }
      .${BADGE_CLASS}__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        width: 100%;
      }
      .${BADGE_CLASS}__tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        background: rgba(15, 23, 42, 0.08);
        color: #0f172a;
        white-space: nowrap;
      }
      .${BADGE_CLASS}__tag-label {
        font-size: 10px;
        color: #475569;
      }
      .${BADGE_CLASS}__tag-value {
        font-size: 11px;
      }
      .${BADGE_CLASS}__tag--good {
        background: rgba(34, 197, 94, 0.18);
        color: #14532d;
      }
      .${BADGE_CLASS}__tag--warn {
        background: rgba(250, 204, 21, 0.22);
        color: #854d0e;
      }
      .${BADGE_CLASS}__tag--bad {
        background: rgba(248, 113, 113, 0.22);
        color: #7f1d1d;
      }
      .${BADGE_CLASS}__tag--info {
        background: rgba(59, 130, 246, 0.22);
        color: #1d4ed8;
      }
      .${BADGE_CLASS}__loaders {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 140px;
        overflow-y: auto;
        padding-right: 4px;
      }
      .${BADGE_CLASS}__loader-line {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 6px 10px;
        background: rgba(15, 23, 42, 0.08);
        border-radius: 6px;
        font-size: 11px;
        white-space: nowrap;
      }
      .${BADGE_CLASS}__loader-name {
        font-weight: 600;
        color: #0f172a;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .${BADGE_CLASS}__loader-info {
        color: #475569;
        white-space: nowrap;
        font-size: 10px;
      }
      .${BADGE_CLASS}__empty {
        opacity: 0.75;
        font-style: italic;
        color: #475569;
        font-size: 10px;
      }
      .${SUMMARY_CLASS} .${BADGE_CLASS} {
        background: rgba(13, 19, 33, 0.9);
        color: #e2e8f0;
        border-color: rgba(148, 163, 184, 0.4);
      }
      .${SUMMARY_CLASS} .${BADGE_CLASS}__tag {
        background: rgba(148, 163, 184, 0.24);
        color: #e2e8f0;
      }
      .${SUMMARY_CLASS} .${BADGE_CLASS}__tag-label {
        color: #cbd5f5;
      }
      .${SUMMARY_CLASS} .${BADGE_CLASS}__loader-line {
        background: rgba(148, 163, 184, 0.2);
        color: #e2e8f0;
      }
      .${SUMMARY_CLASS} .${BADGE_CLASS}__loader-info {
        color: #cbd5f5;
      }
      .${SUMMARY_CLASS} {
        position: fixed;
        bottom: 60px;
        left: 16px;
        right: 16px;
        z-index: 10001;
        padding: 16px 20px;
        background: rgba(12, 19, 33, 0.95);
        color: #f8fafc;
        font: 11px/1.45 "Inter", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
        box-shadow: 0 16px 32px rgba(15, 23, 42, 0.45);
        border-radius: 14px;
        max-height: 360px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: auto;
      }
      .${SUMMARY_CLASS}__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .${SUMMARY_CLASS}__title {
        font-weight: 700;
        font-size: 12px;
        color: #fff;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      .${SUMMARY_CLASS}__hide {
        background: rgba(148, 163, 184, 0.18);
        border: 1px solid rgba(148, 163, 184, 0.38);
        border-radius: 999px;
        color: #e2e8f0;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 6px 12px;
        cursor: pointer;
      }
      .${SUMMARY_CLASS}__hide:hover {
        background: rgba(148, 163, 184, 0.32);
      }
      .${SUMMARY_CLASS}__list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;
        padding-right: 6px;
      }
      .${SUMMARY_CLASS}__list .${BADGE_CLASS} {
        max-width: 100%;
      }
      .${SUMMARY_CLASS}--hidden {
        display: none;
      }
      #${SUMMARY_TOGGLE_ID} {
        position: fixed;
        bottom: 16px;
        left: 16px;
        z-index: 10002;
        padding: 10px 16px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: rgba(15, 23, 42, 0.9);
        color: #e2e8f0;
        font: 11px/1.4 "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.45);
      }
      #${SUMMARY_TOGGLE_ID}:hover {
        background: rgba(15, 23, 42, 0.98);
      }
      html.${OVERLAY_CLASS} section[data-manifest-key] {
        outline: 2px solid var(--deco-debug-color, ${colors.default});
        outline-offset: -2px;
      }
      html.${OVERLAY_CLASS} section[data-manifest-key].${SECTION_CLASS} {
        position: relative;
      }
      #${TOGGLE_ID} {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 10000;
        padding: 10px 16px;
        border: none;
        border-radius: 999px;
        background: #1e293b;
        color: #f8fafc;
        font: 13px/1.4 "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        box-shadow: 0 10px 20px rgba(15, 23, 42, 0.35);
        cursor: pointer;
        transition: transform 0.2s ease, opacity 0.2s ease;
      }
      #${TOGGLE_ID}:hover {
        transform: translateY(-1px);
        opacity: 0.92;
      }
    `;
    document.head.appendChild(style);
  };

  const removeBadges = () => {
    document
      .querySelectorAll<HTMLElement>(`.${OVERLAY_PANEL_CLASS}`)
      .forEach((panel) => {
        panel.remove();
      });
    document
      .querySelectorAll<HTMLElement>(`.${SUMMARY_CLASS}`)
      .forEach((summary) => {
        summary.remove();
      });
    document.getElementById(SUMMARY_TOGGLE_ID)?.remove();
    document
      .querySelectorAll<HTMLElement>(
        `section[data-manifest-key].${SECTION_CLASS}`,
      )
      .forEach((section) => {
        section.classList.remove(SECTION_CLASS);
        section.style.removeProperty("--deco-debug-color");
      });
  };

  const parseLoaders = (raw: string | undefined | null): LoaderSummary[] => {
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as LoaderSummary | LoaderSummary[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [parsed];
    } catch (_) {
      console.warn("deco debug overlay: failed to parse loader data", raw);
      return [];
    }
  };

  const pickColor = (
    isPure: boolean,
    cacheSummary: string | undefined,
    loaders: LoaderSummary[],
  ) => {
    if (isPure) {
      return colors.pure;
    }
    const hasConfiguredCache = loaders.some((loader) =>
      loader.cacheConfigured
    );
    const hasUncachedLoader = loaders.some((loader) => !loader.cacheConfigured);
    switch (cacheSummary) {
      case "error":
        return colors.error;
      case "miss":
      case "bypass":
        return colors.miss;
      case "stale":
        return colors.stale;
      case "hit":
        return hasConfiguredCache ? colors.cached : colors.miss;
      case "mixed":
        return colors.mixed;
      case "none":
        return hasUncachedLoader ? colors.miss : colors.default;
      default:
        return hasUncachedLoader ? colors.miss : colors.default;
    }
  };

  const formatLatency = (latency: number) => {
    if (!Number.isFinite(latency)) {
      return "—";
    }
    if (latency >= 1000) {
      return `${(latency / 1000).toFixed(2)}s`;
    }
    return `${latency.toFixed(1)}ms`;
  };

  type BadgeInfo = {
    title: string;
    path?: string;
    scope: string;
    asyncMode: string;
    cache: string;
    source?: string;
    host?: string;
    loaderCount: number;
    loaders: LoaderSummary[];
    color: string;
    pure: boolean;
  };

  const buildBadge = (info: BadgeInfo) => {
    const badge = document.createElement("div");
    badge.className = BADGE_CLASS;
    setBadgePalette(badge, info.color);

    const title = document.createElement("span");
    title.className = `${BADGE_CLASS}__title`;
    title.textContent = info.title;
    badge.appendChild(title);

    const body = document.createElement("div");
    body.className = `${BADGE_CLASS}__body`;

    const tags = document.createElement("div");
    tags.className = `${BADGE_CLASS}__tags`;

    type Tone = "neutral" | "good" | "warn" | "bad" | "info";
    const appendTag = (
      label: string,
      value: string | undefined,
      tone: Tone = "neutral",
    ) => {
      if (!value || value === "") {
        return;
      }
      const tag = document.createElement("span");
      tag.className = `${BADGE_CLASS}__tag`;
      if (tone !== "neutral") {
        tag.classList.add(`${BADGE_CLASS}__tag--${tone}`);
      }

      const labelSpan = document.createElement("span");
      labelSpan.className = `${BADGE_CLASS}__tag-label`;
      labelSpan.textContent = `${label}:`;

      const valueSpan = document.createElement("span");
      valueSpan.className = `${BADGE_CLASS}__tag-value`;
      valueSpan.textContent = value;

      tag.append(labelSpan, valueSpan);
      tags.appendChild(tag);
    };

    const asyncModeNormalized = info.asyncMode?.toLowerCase?.() ?? "false";
    const isAsync = !["false", "no", "sync"].includes(asyncModeNormalized);
    const asyncDisplay = isAsync ? info.asyncMode : "no";
    const syncDisplay = isAsync ? "no" : "yes";
    const pureTone: Tone = info.pure ? "good" : "warn";
    const asyncTone: Tone = isAsync ? "info" : "neutral";
    const syncTone: Tone = isAsync ? "neutral" : "info";
    const cacheTone: Tone = (() => {
      switch (info.cache) {
        case "none":
        case "miss":
        case "bypass":
          return "bad";
        case "stale":
        case "mixed":
          return "warn";
        case "hit":
          return "good";
        default:
          return "neutral";
      }
    })();
    const loaderTone: Tone = info.loaderCount === 0 ? "good" : "info";

    appendTag("PURE", info.pure ? "yes" : "no", pureTone);
    appendTag("ASYNC", asyncDisplay, asyncTone);
    appendTag("SYNC", syncDisplay, syncTone);
    appendTag("CACHE", info.cache ?? "none", cacheTone);
    appendTag("SCOPE", info.scope.toLowerCase());
    appendTag("SOURCE", info.source);
    appendTag("HOST", info.host);
    appendTag("LOADERS", `${info.loaderCount}`, loaderTone);
    appendTag("PATH", info.path ?? info.title);

    body.appendChild(tags);

    const loadersContainer = document.createElement("div");
    loadersContainer.className = `${BADGE_CLASS}__loaders`;
    if (info.loaders.length === 0) {
      const empty = document.createElement("span");
      empty.className = `${BADGE_CLASS}__empty`;
      empty.textContent = "Pure section (no loaders)";
      loadersContainer.appendChild(empty);
    } else {
      info.loaders.forEach((loader) => {
        const chip = document.createElement("span");
        chip.className = `${BADGE_CLASS}__loader-line`;

        const name = document.createElement("span");
        name.className = `${BADGE_CLASS}__loader-name`;
        name.textContent = loader.loader ?? "loader";
        chip.appendChild(name);

        const detail = document.createElement("span");
        detail.className = `${BADGE_CLASS}__loader-info`;
        const parts = [
          loader.status,
          formatLatency(loader.latencyMs),
          loader.cacheMode,
          loader.cacheConfigured ? "cached" : "no-cache",
        ];
        detail.textContent = parts.join(" • ");
        chip.appendChild(detail);

        loadersContainer.appendChild(chip);
      });
    }
    body.appendChild(loadersContainer);
    badge.appendChild(body);
    return badge;
  };

  const applyOverlay = () => {
    removeBadges();
    const sections = document.querySelectorAll<HTMLElement>(
      "section[data-manifest-key]",
    );
    const emptySections: BadgeInfo[] = [];

    sections.forEach((section) => {
        const dataset = section.dataset;
        const loaderSummaries = parseLoaders(dataset.loaders);
        const isPure = dataset.pure === "true";
        const cacheSummary = dataset.cacheSummary ?? "none";
        const color = pickColor(isPure, cacheSummary, loaderSummaries);

        section.classList.add(SECTION_CLASS);
        section.style.setProperty("--deco-debug-color", color);

        const asyncMode = dataset.async ?? "false";
        const badgeInfo: BadgeInfo = {
          title: dataset.blockDef ?? dataset.blockComponent ?? "Section",
          path: dataset.blockComponent ?? dataset.blockDef ?? undefined,
          scope: dataset.inline === "true" ? "inline" : "global",
          asyncMode,
          cache: cacheSummary,
          source: dataset.sourceProp,
          host: dataset.hostResolver,
          loaderCount: loaderSummaries.length,
          loaders: loaderSummaries,
          color,
          pure: loaderSummaries.length === 0,
        };

        const rect = section.getBoundingClientRect();
        const hasVisibleSize = rect.width > 0 && rect.height > 0;

        if (!hasVisibleSize) {
          emptySections.push(badgeInfo);
          return;
        }

        // Create overlay panel with transparent background
        const overlayPanel = document.createElement("div");
        overlayPanel.className = OVERLAY_PANEL_CLASS;
        const overlayRgb = hexToRgb(color);
        if (overlayRgb) {
          overlayPanel.style.background = `rgba(${overlayRgb.r}, ${overlayRgb.g}, ${overlayRgb.b}, 0.12)`;
        } else {
          overlayPanel.style.background = "rgba(15, 23, 42, 0.12)";
        }

        const badge = buildBadge(badgeInfo);
        overlayPanel.appendChild(badge);
        section.appendChild(overlayPanel);
      });

    const summaryEntries: BadgeInfo[] = [];

    const pageInfoEl = document.querySelector<HTMLElement>(
      ".deco-debug-page-info",
    );
    if (pageInfoEl) {
      const blockId = pageInfoEl.dataset.decoPageBlockId ?? "unknown";
      const pathTemplate = pageInfoEl.dataset.decoPagePathTemplate ?? "";
      summaryEntries.push({
        title: `Page ${blockId}`,
        path: pathTemplate || undefined,
        scope: "page",
        asyncMode: "false",
        cache: "n/a",
        source: blockId ? `block:${blockId}` : undefined,
        host: undefined,
        loaderCount: 0,
        loaders: [],
        color: colors.default,
        pure: true,
      });
    }

    summaryEntries.push(...emptySections);

    // Create summary panel for non-visual sections and page info
    if (summaryEntries.length > 0) {
      const summary = document.createElement("div");
      summary.className = SUMMARY_CLASS;

      const header = document.createElement("div");
      header.className = `${SUMMARY_CLASS}__header`;

      const summaryTitle = document.createElement("div");
      summaryTitle.className = `${SUMMARY_CLASS}__title`;
      summaryTitle.textContent = `Debug summary${
        emptySections.length
          ? ` • Non-visual: ${emptySections.length}`
          : ""
      }`;
      header.appendChild(summaryTitle);

      const hideButton = document.createElement("button");
      hideButton.type = "button";
      hideButton.className = `${SUMMARY_CLASS}__hide`;
      hideButton.textContent = "hide";
      hideButton.addEventListener("click", () => {
        summary.classList.add(`${SUMMARY_CLASS}--hidden`);
        if (!document.getElementById(SUMMARY_TOGGLE_ID)) {
          const toggle = document.createElement("button");
          toggle.id = SUMMARY_TOGGLE_ID;
          toggle.type = "button";
          toggle.textContent = "show debug summary";
          toggle.addEventListener("click", () => {
            summary.classList.remove(`${SUMMARY_CLASS}--hidden`);
            toggle.remove();
          });
          document.body.appendChild(toggle);
        }
      });
      header.appendChild(hideButton);

      summary.appendChild(header);

      const list = document.createElement("div");
      list.className = `${SUMMARY_CLASS}__list`;

      summaryEntries.forEach((info) => {
        list.appendChild(buildBadge(info));
      });

      summary.appendChild(list);

      document.body.appendChild(summary);
      document.getElementById(SUMMARY_TOGGLE_ID)?.remove();
    }
  };

  const toggleOverlay = () => {
    const enabled = document.documentElement.classList.toggle(OVERLAY_CLASS);
    const button = document.getElementById(TOGGLE_ID);
    if (button) {
      button.textContent = enabled
        ? "deco debug off"
        : "deco debug on";
    }
    if (enabled) {
      applyOverlay();
    } else {
      removeBadges();
    }
  };

  const init = () => {
    if (document.getElementById(TOGGLE_ID)) {
      return;
    }
    ensureStyleTag();

    const button = document.createElement("button");
    button.id = TOGGLE_ID;
    button.type = "button";
    button.textContent = "deco debug on";
    button.addEventListener("click", toggleOverlay);
    document.body.appendChild(button);
  };

  const ready = () => {
    init();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready, { once: true });
  } else {
    ready();
  }
}

export default debugOverlay;

