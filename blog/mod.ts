import { logger } from "@deco/deco/o11y";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Secret } from "../website/loaders/secret.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type FnContext } from "@deco/deco";
import { h } from "preact";
import { type ClientOf, createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { SpireApi } from "../spire/utils/client.ts";
import SpireSyncPreviewTab from "./components/SpireSyncPreviewTab.tsx";
import { syncPostToBlocks } from "./utils/spireImport.ts";

/** Configurable by the site owner in Deco Studio settings. */
export type State = {
  /**
   * @title Page Slug
   * @description The slug of the BlogPostPage to embed. Use :category and :slug.
   */
  pageSlug?: string;
  /**
   * @title Spire Blog Slug
   * @description Your Spire blog account slug (e.g. "moleca").
   *   When set, Spire posts are fetched live from the Spire API and merged with
   *   native Deco posts in all loaders. Published posts are also automatically
   *   synced to Deco Studio's CMS collection browser on startup.
   */
  allowedBlogSlug?: string;
  /**
   * @title Spire Webhook Secret
   * @description Shared secret for verifying incoming webhooks from Spire (HMAC-SHA256).
   *   Generate one in Spire Settings → Deco Integration and paste the same value here.
   */
  spireWebhookSecret?: Secret;
  /**
   * @title Spire API URL
   * @description Override only when using a self-hosted Spire instance. Default: https://spire.blog
   */
  spireUrl?: string;
};

/** Internal state derived in App() — not user-configured. */
interface BlogState extends State {
  /** Typed Spire API HTTP client. Present only when allowedBlogSlug is set. */
  spireApi?: ClientOf<SpireApi>;
}

export type AppContext = FnContext<BlogState, Manifest>;

// ---------------------------------------------------------------------------
// Auto-sync: write Spire posts to .deco/blocks/ so they appear in Studio CMS
// ---------------------------------------------------------------------------

/** Last slug that triggered a full startup sync — prevents redundant syncs. */
let lastSyncedSlug: string | null = null;

/**
 * Fetches all published posts from the Spire API and writes them to blocks
 * so they appear in Deco Studio's CMS collection browser automatically.
 * Runs once per process when allowedBlogSlug is first configured or changed.
 * Fire-and-forget — does not block app initialisation.
 */
function runStartupSync(blogSlug: string, spireUrl: string): void {
  logger.info(`[SpireAutoSync] Starting sync for "${blogSlug}"…`);

  (async () => {
    try {
      const base = spireUrl.replace(/\/$/, "");
      let page = 1;
      let totalPages = 1;
      let synced = 0;

      while (page <= totalPages) {
        const res = await fetch(
          `${base}/api/blog/${
            encodeURIComponent(blogSlug)
          }?page=${page}&perPage=50`,
          { signal: AbortSignal.timeout(15_000) },
        );
        if (!res.ok) break;

        const { posts, pagination } = await res.json() as {
          posts: Array<{ slug: string }>;
          pagination: { totalPages: number };
        };

        totalPages = pagination?.totalPages ?? 1;

        for (const summary of posts ?? []) {
          const result = await syncPostToBlocks(blogSlug, summary.slug, base);
          if (result.success) synced++;
        }

        page++;
      }

      logger.info(`[SpireAutoSync] Done: ${synced} posts synced to blocks.`);
    } catch (err) {
      logger.error("[SpireAutoSync] Error:", err);
    }
  })();
}

// ---------------------------------------------------------------------------
// Periodic reconciliation — catches edits missed by webhooks (Deno Deploy only)
// ---------------------------------------------------------------------------

/** Tracks the latest configured slug/base so the hourly cron always uses current values. */
let latestBlogSlug: string | null = null;
let latestSpireBase = "https://spire.blog";
let reconcileCronRegistered = false;

/**
 * Registers a Deno.cron that re-syncs all Spire posts once per hour.
 * Only runs in Deno Deploy (where Deno.cron is available).
 *
 * Why hourly and not shorter: each sync makes 1 listing call + N post calls
 * (one per post). Hourly keeps API load reasonable (24×N calls/day vs 288×N
 * at 5-minute intervals). Webhooks handle real-time updates; this is a
 * safety-net for missed webhooks and edited-but-not-published changes.
 *
 * Local daemon: watchFs already reloads blocks on disk change. A webhook
 * configured with a tunnel (e.g. ngrok) or a server restart covers edits.
 */
function registerReconcileCron(): void {
  if (reconcileCronRegistered) return;

  const denoWithCron = Deno as typeof Deno & {
    cron?: (
      name: string,
      schedule: string,
      handler: () => void | Promise<void>,
    ) => void;
  };

  if (typeof denoWithCron.cron !== "function") return; // local daemon — skip

  reconcileCronRegistered = true;
  denoWithCron.cron("spire-reconcile", "0 * * * *", () => {
    // Re-read slug at cron time so config changes are respected.
    if (latestBlogSlug) runStartupSync(latestBlogSlug, latestSpireBase);
  });
  logger.info("[SpireAutoSync] Registered hourly Deno.cron reconciliation.");
}

// ---------------------------------------------------------------------------
// App entry point
// ---------------------------------------------------------------------------

/**
 * @title Deco Blog
 * @description A blog app for Deco.cx. Supports native block-based posts and
 *   Spire AI integration: when a Spire Blog Slug is configured, all published
 *   Spire posts are automatically synced to Deco Studio's CMS collection browser
 *   on startup and every 5 minutes (picks up edits even without webhooks).
 *   The live site always fetches from both sources in real-time.
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png
 */
export default function App(state: State): App<Manifest, BlogState> {
  // Normalize: strip trailing slash and any trailing "/api" so users can enter
  // either "https://spire.blog" or "https://spire.blog/api" without double-path.
  const spireBase = (state.spireUrl ?? "https://spire.blog")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

  const spireApi = state.allowedBlogSlug
    ? createHttpClient<SpireApi>({
      base: `${spireBase}/api`,
      fetcher: fetchSafe,
    })
    : undefined;

  if (state.allowedBlogSlug) {
    // Keep latest values so the hourly cron always uses current config.
    latestBlogSlug = state.allowedBlogSlug;
    latestSpireBase = spireBase;

    // Startup sync: runs once per process on first configuration or slug change.
    if (state.allowedBlogSlug !== lastSyncedSlug) {
      lastSyncedSlug = state.allowedBlogSlug;
      setTimeout(
        () => runStartupSync(state.allowedBlogSlug!, spireBase),
        3_000,
      );
    }

    // Register the hourly Deno.cron reconciliation (Deno Deploy only, once per process).
    registerReconcileCron();
  }

  return { manifest, state: { ...state, spireApi } };
}

export const preview = (
  { state }: { manifest?: typeof manifest; state?: State } = {},
) => {
  const isConfigured = !!state?.allowedBlogSlug && !!(
    typeof state.spireWebhookSecret === "string"
      ? state.spireWebhookSecret
      : state.spireWebhookSecret?.get?.()
  );

  return {
    Component: PreviewContainer,
    props: {
      name: "Deco Blog",
      owner: "deco.cx",
      description:
        "Native Deco blog with Spire AI integration. Set a Spire Blog Slug to automatically sync all published Spire posts to Deco Studio — no manual steps required.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png",
      images: [],
      tabs: [
        {
          title: "Spire",
          content: h(SpireSyncPreviewTab, {
            isConfigured,
            blogSlug: state?.allowedBlogSlug,
            spireUrl: state?.spireUrl,
          }),
        },
      ],
    },
  };
};
