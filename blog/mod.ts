import { logger } from "@deco/deco/o11y";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Secret } from "../website/loaders/secret.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type FnContext } from "@deco/deco";
import { h } from "preact";
import SpireSyncPreviewTab from "./components/SpireSyncPreviewTab.tsx";
import { activeSyncs, syncPostToBlocks } from "./utils/spireImport.ts";
import type { BlogPost } from "./types.ts";

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

export type AppContext = FnContext<State, Manifest>;

// ---------------------------------------------------------------------------
// Auto-sync: write Spire posts to .deco/blocks/ so they appear in Studio CMS
// ---------------------------------------------------------------------------

/**
 * Current app state — refreshed on every App() call so the file watcher
 * always uses up-to-date credentials even after Studio config changes.
 */
let latestState: State | null = null;

/**
 * Last slug seen in this module session. Used only to detect slug CHANGES
 * between App() calls within the same process lifetime. It resets to null
 * on every HMR reload — that is intentional and handled by spireBlocksExist().
 */
let lastSyncedSlug: string | null = null;

let watcherStarted = false;

// ---------------------------------------------------------------------------
// File watcher — syncs Studio metadata edits back to Spire via sync-manual
// ---------------------------------------------------------------------------

/**
 * Starts a Deno.watchFs loop on .deco/blocks/ that detects when a Studio
 * user edits a SpirePost block (title, excerpt, SEO) and pushes those
 * changes back to Spire via the sync-manual endpoint.
 *
 * Only runs when:
 *   - Deno.watchFs is available (daemon context, not Deno Deploy serverless)
 *   - allowedBlogSlug + spireWebhookSecret are configured
 *   - Not already running (watcherStarted guard)
 *
 * Anti-loop: checks activeSyncs so writes from syncPostToBlocks() are ignored.
 */
function startFileWatcher(): void {
  if (watcherStarted) return;
  if (typeof Deno.watchFs !== "function") return;

  watcherStarted = true;
  const blocksDir = `${Deno.cwd()}/.deco/blocks`;

  (async () => {
    let retries = 0;
    while (retries < 5) {
      try {
        await Deno.mkdir(blocksDir, { recursive: true });
        const watcher = Deno.watchFs(blocksDir);

        for await (const event of watcher) {
          if (event.kind !== "modify" && event.kind !== "create") continue;

          for (const path of event.paths) {
            if (!path.endsWith(".json")) continue;
            if (!path.includes("posts%2F")) continue;

            try {
              const text = await Deno.readTextFile(path);
              const data = JSON.parse(text);

              // Only process SpirePost blocks (Spire-sourced posts)
              if (data?.__resolveType !== "blog/loaders/SpirePost.ts") continue;
              const post = data?.post as BlogPost | undefined;
              if (!post?.spirePostId) continue;

              // Skip if this write came from syncPostToBlocks (anti-loop)
              if (activeSyncs.has(post.slug)) continue;

              // Sync editable metadata back to Spire
              await notifySpireOfEdit(post);
            } catch {
              // Ignore transient read/parse errors on rapid saves
            }
          }
        }

        retries = 0; // reset on clean exit
      } catch (err) {
        logger.error("[FileWatcher] Error:", err);
        watcherStarted = false;
        retries++;
        await new Promise((r) => setTimeout(r, 5_000 * retries));
        watcherStarted = true;
      }
    }
    logger.warn("[FileWatcher] Max retries reached — watcher stopped.");
    watcherStarted = false;
  })();
}

async function notifySpireOfEdit(post: BlogPost): Promise<void> {
  const state = latestState;
  if (!state?.allowedBlogSlug || !state.spireWebhookSecret) return;

  const secret = typeof state.spireWebhookSecret === "string"
    ? state.spireWebhookSecret
    : state.spireWebhookSecret?.get?.();
  if (!secret) return;

  const base = (state.spireUrl ?? "https://spire.blog")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

  try {
    const res = await fetch(`${base}/api/blog/posts/sync-manual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        spirePostId: post.spirePostId,
        title: post.title,
        excerpt: post.excerpt,
        seoTitle: post.seo?.title,
        seoDescription: post.seo?.description,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) {
      logger.info(`[FileWatcher] Synced metadata for "${post.slug}" to Spire.`);
    } else {
      logger.warn(
        `[FileWatcher] sync-manual returned ${res.status} for "${post.slug}".`,
      );
    }
  } catch (err) {
    logger.error(`[FileWatcher] sync-manual error for "${post.slug}":`, err);
  }
}

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

  reconcileCronRegistered = true;

  if (typeof denoWithCron.cron === "function") {
    // Deno Deploy: use cron for reliable hourly scheduling.
    denoWithCron.cron("spire-reconcile", "0 * * * *", () => {
      if (latestBlogSlug) runStartupSync(latestBlogSlug, latestSpireBase);
    });
    logger.info("[SpireAutoSync] Registered hourly Deno.cron reconciliation.");
  } else {
    // Local daemon: webhooks can't reach localhost from cloud Spire servers,
    // so use a 30-minute interval as a fallback to pick up post edits.
    // 30 min = 48×N calls/day (much cheaper than the rejected 5-min / 288×N).
    setInterval(() => {
      if (latestBlogSlug) runStartupSync(latestBlogSlug, latestSpireBase);
    }, 30 * 60 * 1_000);
    logger.info(
      "[SpireAutoSync] Registered 30-min setInterval fallback (local dev).",
    );
  }
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
export default function App(state: State): App<Manifest, State> {
  // Normalize: strip trailing slash and any trailing "/api" so users can enter
  // either "https://spire.blog" or "https://spire.blog/api" without double-path.
  const spireBase = (state.spireUrl ?? "https://spire.blog")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

  // Always keep latestState fresh so file watcher uses current credentials.
  latestState = state;

  if (state.allowedBlogSlug) {
    // Keep latest values so the hourly cron always uses current config.
    latestBlogSlug = state.allowedBlogSlug;
    latestSpireBase = spireBase;

    // Start the file watcher that syncs Studio metadata edits → Spire.
    startFileWatcher();

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

  return { manifest, state };
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
