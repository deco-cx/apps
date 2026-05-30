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

/**
 * Last slug seen in this module session. Used only to detect slug CHANGES
 * between App() calls within the same process lifetime. It resets to null
 * on every HMR reload — that is intentional and handled by spireBlocksExist().
 */
let lastSyncedSlug: string | null = null;

/**
 * Guards against double sync when Deco calls App() multiple times rapidly
 * (e.g. on dependency resolution). Set to true when a sync is scheduled;
 * cleared after the async check+run completes so future slug changes can
 * trigger a new sync.
 */
let syncScheduled = false;

/**
 * Returns true if any Spire post block files already exist on disk.
 * Avoids redundant syncs on HMR restarts and server restarts when posts
 * are already present in .deco/blocks/.
 */
async function spireBlocksExist(): Promise<boolean> {
  try {
    // Use Deno.cwd() directly — avoids importing 'join' which causes
    // HMR "blocked by top-level ES module change" on first run.
    const blocksDir = `${Deno.cwd()}/.deco/blocks`;
    for await (const entry of Deno.readDir(blocksDir)) {
      if (
        entry.isFile &&
        entry.name.includes("posts%2F") &&
        entry.name.endsWith(".json")
      ) {
        return true;
      }
    }
  } catch {
    // Directory absent or unreadable — treat as empty
  }
  return false;
}

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

  // Wrap fetchSafe with a 10-second timeout so loader requests to the Spire
  // API never hang indefinitely (which would cause infinite loading in Studio).
  const fetchWithTimeout: typeof fetchSafe = (url, init) =>
    fetchSafe(url, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(10_000),
    });

  const spireApi = state.allowedBlogSlug
    ? createHttpClient<SpireApi>({
      base: `${spireBase}/api`,
      fetcher: fetchWithTimeout,
    })
    : undefined;

  if (state.allowedBlogSlug) {
    // Keep latest values so the hourly cron always uses current config.
    latestBlogSlug = state.allowedBlogSlug;
    latestSpireBase = spireBase;

    // Detect a real slug change within the same process session.
    // lastSyncedSlug === null means "first call this session" OR "HMR reload" —
    // both are resolved by the filesystem check in the deferred callback.
    const slugChangedFromKnownValue = lastSyncedSlug !== null &&
      lastSyncedSlug !== state.allowedBlogSlug;
    lastSyncedSlug = state.allowedBlogSlug;

    // Guard: Deco calls App() multiple times during dependency resolution.
    // syncScheduled prevents concurrent setTimeouts from triggering two syncs.
    if (!syncScheduled || slugChangedFromKnownValue) {
      syncScheduled = true;
      setTimeout(async () => {
        try {
          // Slug changed from a known value → always sync (new blog configured).
          if (slugChangedFromKnownValue) {
            runStartupSync(state.allowedBlogSlug!, spireBase);
            return;
          }
          // First call or HMR reset: only sync if no blocks exist yet.
          const hasBlocks = await spireBlocksExist();
          if (hasBlocks) {
            logger.info(
              `[SpireAutoSync] Blocks exist — skipping startup sync for "${state.allowedBlogSlug}".`,
            );
          } else {
            runStartupSync(state.allowedBlogSlug!, spireBase);
          }
        } finally {
          // Release the guard so the next slug change can schedule a sync.
          syncScheduled = false;
        }
      }, 3_000);
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
