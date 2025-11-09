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
  const TOGGLE_ID = "deco-debug-toggle";
  const STYLE_ID = "deco-debug-style";

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
    badge.style.background = color;
    const rgb = hexToRgb(color);
    if (!rgb) {
      badge.style.color = "#f8fafc";
      return;
    }
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    badge.style.color = luminance > 0.6 ? "#0f172a" : "#f8fafc";
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
      .${BADGE_CLASS} {
        position: absolute;
        top: 6px;
        left: 6px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px 10px;
        border-radius: 6px;
        background: rgba(34, 47, 62, 0.92);
        color: #fefefe;
        font: 11px/1.4 "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        max-width: min(320px, 90%);
        pointer-events: auto;
      }
      .${BADGE_CLASS}__title {
        font-weight: 600;
        font-size: 12px;
      }
      .${BADGE_CLASS}__meta {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        opacity: 0.85;
      }
      .${BADGE_CLASS}__meta span {
        white-space: nowrap;
      }
      .${BADGE_CLASS}__loaders {
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        margin-top: 4px;
        padding-top: 4px;
        display: grid;
        gap: 2px;
      }
      .${BADGE_CLASS}__loader-line {
        display: flex;
        justify-content: space-between;
        gap: 6px;
        white-space: nowrap;
      }
      .${BADGE_CLASS}__loader-name {
        font-weight: 500;
      }
      .${BADGE_CLASS}__loader-info {
        opacity: 0.7;
      }
      .${BADGE_CLASS}__empty {
        opacity: 0.7;
      }
      html.${OVERLAY_CLASS} section[data-manifest-key] {
        outline: 2px dashed var(--deco-debug-color, ${colors.default});
        outline-offset: 2px;
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
      .querySelectorAll<HTMLElement>(`.${BADGE_CLASS}`)
      .forEach((badge) => badge.remove());
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

  const applyOverlay = () => {
    removeBadges();
    const sections = document.querySelectorAll<HTMLElement>(
      "section[data-manifest-key]",
    );
    sections.forEach((section) => {
      const dataset = section.dataset;
      const loaderSummaries = parseLoaders(dataset.loaders);
      const isPure = dataset.pure === "true";
      const cacheSummary = dataset.cacheSummary ?? "none";
      const color = pickColor(isPure, cacheSummary, loaderSummaries);

      section.classList.add(SECTION_CLASS);
      section.style.setProperty("--deco-debug-color", color);

      const badge = document.createElement("div");
      badge.className = BADGE_CLASS;
      setBadgePalette(badge, color);

      const title = document.createElement("div");
      title.className = `${BADGE_CLASS}__title`;
      title.textContent = dataset.blockDef ??
        dataset.blockComponent ??
        "Section";
      badge.appendChild(title);

      const meta = document.createElement("div");
      meta.className = `${BADGE_CLASS}__meta`;
      const metaItems = [
        dataset.inline === "true" ? "inline" : "global",
        dataset.async ? `async:${dataset.async}` : undefined,
        cacheSummary ? `cache:${cacheSummary}` : undefined,
      ].filter(Boolean) as string[];
      metaItems.forEach((item) => {
        const span = document.createElement("span");
        span.textContent = item;
        meta.appendChild(span);
      });
      badge.appendChild(meta);

      const host = dataset.hostResolver;
      if (host) {
        const hostLine = document.createElement("div");
        hostLine.className = `${BADGE_CLASS}__meta`;
        const label = document.createElement("span");
        label.textContent = `host: ${host}`;
        hostLine.appendChild(label);
        badge.appendChild(hostLine);
      }

      const loadersContainer = document.createElement("div");
      loadersContainer.className = `${BADGE_CLASS}__loaders`;
      if (loaderSummaries.length === 0) {
        const empty = document.createElement("div");
        empty.className = `${BADGE_CLASS}__empty`;
        empty.textContent = isPure
          ? "Pure section (no loaders)"
          : "No loader telemetry";
        loadersContainer.appendChild(empty);
      } else {
        loaderSummaries.forEach((loader) => {
          const line = document.createElement("div");
          line.className = `${BADGE_CLASS}__loader-line`;

          const name = document.createElement("span");
          name.className = `${BADGE_CLASS}__loader-name`;
          name.textContent = loader.loader ?? "loader";
          line.appendChild(name);

          const info = document.createElement("span");
          info.className = `${BADGE_CLASS}__loader-info`;
          const parts = [
            loader.status,
            formatLatency(loader.latencyMs),
            loader.cacheMode,
            loader.cacheConfigured ? "cached" : "no-cache",
          ];
          info.textContent = parts.join(" • ");
          line.appendChild(info);

          loadersContainer.appendChild(line);
        });
      }
      badge.appendChild(loadersContainer);

      // Insert badge as first child to keep layout predictable
      section.insertBefore(badge, section.firstChild);
    });
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

  const ensureObserver = () => {
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains(OVERLAY_CLASS)) {
        applyOverlay();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
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
    ensureObserver();
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

