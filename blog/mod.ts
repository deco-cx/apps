import { logger } from "@deco/deco/o11y";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Secret } from "../website/loaders/secret.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type FnContext } from "@deco/deco";
import { h } from "preact";
import SpireSyncPreviewTab from "./components/SpireSyncPreviewTab.tsx";
import {
  activeSyncs,
  migrateSpireBlocks,
  syncPostToBlocks,
} from "./utils/spireImport.ts";
import type { BlogPost } from "./types.ts";

export type State = {
  /**
   * @title Page Slug
   * @description The slug of the BlogPostPage to embed. Use :category and :slug.
   */
  pageSlug?: string;
  /**
   * @title Spire Blog Slug
   * @description Your Spire blog account slug (e.g. "moleca"). When set, published
   *   Spire posts are automatically synced to Deco Studio's CMS collection browser
   *   on startup and reconciled periodically.
   */
  spireBlogSlug?: string;
  /**
   * @title Spire Webhook Secret
   * @description Shared HMAC-SHA256 secret from Spire Settings → Deco Integration.
   *   Required for webhook authentication and syncing Studio edits back to Spire.
   */
  spireWebhookSecret?: Secret;
  /**
   * @title Spire API URL
   * @description Override only for self-hosted Spire instances. Default: https://spire.blog
   */
  spireUrl?: string;
};

export type AppContext = FnContext<State, Manifest>;

// Module-level state shared across App() calls and async loops.
let latestState: State | null = null;
let lastSyncedSlug: string | null = null;
let syncScheduled = false;
let watcherStarted = false;
let latestBlogSlug: string | null = null;
let latestSpireBase = "https://spire.blog";
let reconcileCronRegistered = false;

// ---------------------------------------------------------------------------
// File watcher — syncs Studio edits (title/excerpt/SEO) back to Spire
// ---------------------------------------------------------------------------

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
            if (!path.endsWith(".json") || !path.includes("posts%2F")) continue;
            try {
              const data = JSON.parse(await Deno.readTextFile(path));
              const post = data?.post as BlogPost | undefined;
              if (!post?.spirePostId) continue;
              if (activeSyncs.has(post.slug)) continue;
              await notifySpireOfEdit(post);
            } catch {
              // Ignore transient read/parse errors
            }
          }
        }
        retries = 0;
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
  if (!state?.spireBlogSlug || !state.spireWebhookSecret) return;

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
        `[FileWatcher] sync-manual ${res.status} for "${post.slug}".`,
      );
    }
  } catch (err) {
    logger.error(`[FileWatcher] sync-manual error for "${post.slug}":`, err);
  }
}

// ---------------------------------------------------------------------------
// Startup sync — bulk-writes Spire posts to .deco/blocks/ on first run
// ---------------------------------------------------------------------------

function runStartupSync(spireBlogSlug: string, spireUrl: string): void {
  logger.info(`[SpireAutoSync] Starting sync for "${spireBlogSlug}"…`);
  (async () => {
    try {
      const base = spireUrl.replace(/\/$/, "");
      let page = 1;
      let totalPages = 1;
      let synced = 0;
      while (page <= totalPages) {
        const res = await fetch(
          `${base}/api/blog/${
            encodeURIComponent(spireBlogSlug)
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
          const result = await syncPostToBlocks(
            spireBlogSlug,
            summary.slug,
            base,
          );
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

async function spireBlocksExist(): Promise<boolean> {
  try {
    const blocksDir = `${Deno.cwd()}/.deco/blocks`;
    for await (const entry of Deno.readDir(blocksDir)) {
      if (
        entry.isFile && entry.name.includes("posts%2F") &&
        entry.name.endsWith(".json")
      ) {
        return true;
      }
    }
  } catch {
    // Directory absent or unreadable
  }
  return false;
}

// ---------------------------------------------------------------------------
// Periodic reconciliation (Deno Deploy cron / local setInterval)
// ---------------------------------------------------------------------------

function registerReconcileCron(): void {
  if (reconcileCronRegistered) return;
  reconcileCronRegistered = true;

  const denoWithCron = Deno as typeof Deno & {
    cron?: (
      name: string,
      schedule: string,
      handler: () => void | Promise<void>,
    ) => void;
  };

  if (typeof denoWithCron.cron === "function") {
    denoWithCron.cron("spire-reconcile", "0 * * * *", () => {
      if (latestBlogSlug) runStartupSync(latestBlogSlug, latestSpireBase);
    });
    logger.info("[SpireAutoSync] Registered hourly Deno.cron reconciliation.");
  } else {
    setInterval(() => {
      if (latestBlogSlug) runStartupSync(latestBlogSlug, latestSpireBase);
    }, 30 * 60 * 1_000);
    logger.info("[SpireAutoSync] Registered 30-min setInterval fallback.");
  }
}

// ---------------------------------------------------------------------------
// App entry point
// ---------------------------------------------------------------------------

/**
 * @title Deco Blog
 * @description Native Deco blog with optional Spire AI integration. Set a Spire
 *   Blog Slug to automatically sync published Spire posts to Deco Studio's CMS
 *   collection browser and serve them alongside native posts.
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/blog/logo.png
 */
export default function App(state: State): App<Manifest, State> {
  const spireBase = (state.spireUrl ?? "https://spire.blog")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

  latestState = state;

  if (state.spireBlogSlug) {
    latestBlogSlug = state.spireBlogSlug;
    latestSpireBase = spireBase;

    // File watcher requires webhook secret to sync edits back to Spire.
    if (state.spireWebhookSecret) {
      startFileWatcher();
    }

    // Migrate any Spire blocks with stale __resolveType.
    migrateSpireBlocks().catch(() => {});

    const slugChangedFromKnownValue = lastSyncedSlug !== null &&
      lastSyncedSlug !== state.spireBlogSlug;
    lastSyncedSlug = state.spireBlogSlug;

    if (!syncScheduled || slugChangedFromKnownValue) {
      syncScheduled = true;
      setTimeout(async () => {
        try {
          if (slugChangedFromKnownValue) {
            runStartupSync(state.spireBlogSlug!, spireBase);
            return;
          }
          const hasBlocks = await spireBlocksExist();
          if (hasBlocks) {
            logger.info(
              `[SpireAutoSync] Blocks exist — skipping startup sync for "${state.spireBlogSlug}".`,
            );
          } else {
            runStartupSync(state.spireBlogSlug!, spireBase);
          }
        } finally {
          syncScheduled = false;
        }
      }, 3_000);
    }

    registerReconcileCron();
  }

  return { manifest, state };
}

export const preview = (
  { state }: { manifest?: typeof manifest; state?: State } = {},
) => {
  const isConfigured = !!state?.spireBlogSlug && !!(
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
      logo: "https://raw.githubusercontent.com/deco-cx/apps/main/blog/logo.png",
      images: [],
      tabs: [
        {
          title: "Spire",
          content: h(SpireSyncPreviewTab, {
            isConfigured,
            blogSlug: state?.spireBlogSlug,
            spireUrl: state?.spireUrl,
          }),
        },
      ],
    },
  };
};
