import { logger } from "@deco/deco/o11y";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Secret } from "../website/loaders/secret.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import SpireSyncPreviewTab from "./components/SpireSyncPreviewTab.tsx";
import { type App, type FnContext } from "@deco/deco";
import { h } from "preact";
import { join } from "std/path/mod.ts";
import { BlogPost } from "./types.ts";

export type State = {
  /**
   * @title Page Slug
   * @description The slug of the BlogPostPage to embed. Use :category and :slug.
   */
  pageSlug?: string;
  /**
   * @title Spire Blog Slug
   * @description Your Spire blog account slug (e.g. "my-store"). When set, only webhooks
   *   from this exact blog will be accepted — prevents cross-tenant data injection in
   *   multi-site setups. Also used by the Sync All Posts action to know which blog to import.
   */
  allowedBlogSlug?: string;
  /**
   * @title Spire Webhook Secret
   * @description Secret token to verify incoming webhooks from Spire. Create a Secret here
   *   and paste it in your Spire dashboard settings alongside your Deco Webhook URL.
   */
  spireWebhookSecret?: Secret;
};
export type AppContext = FnContext<State, Manifest>;

let isWatcherStarted = false;
let latestState: State | null = null;

/**
 * In-process set of slugs currently being synced FROM Spire → Deco.
 * Prevents the file watcher from bouncing edits back to Spire immediately after a webhook write.
 * Exported so the webhook action can register its slug before writing the JSON file.
 */
export const activeSyncs = new Set<string>();

function startBlogWatcher(state: State) {
  latestState = state; // Sempre atualiza a referência com as credenciais/configurações mais recentes do Admin
  if (isWatcherStarted) return;

  // Deno.watchFs is not available in Deno Deploy serverless isolates.
  if (typeof Deno.watchFs !== "function") {
    logger.info(
      "[BlogWatcher] Deno.watchFs unavailable — reverse sync disabled.",
    );
    return;
  }

  isWatcherStarted = true;

  const blocksDir = join(
    Deno.cwd(),
    ".deco",
    "blocks",
    "collections",
    "blog",
    "posts",
  );

  (async () => {
    try {
      // Ensure the posts directory exists
      try {
        await Deno.mkdir(blocksDir, { recursive: true });
      } catch {
        // Ignore if already exists
      }

      const watcher = Deno.watchFs(blocksDir);
      logger.info(
        `[BlogWatcher] Watching Deco CMS posts for manual edits in: ${blocksDir}`,
      );

      for await (const event of watcher) {
        if (event.kind === "modify" || event.kind === "create") {
          for (const path of event.paths) {
            if (path.endsWith(".json")) {
              try {
                // Read and parse modified JSON resolvable file
                const text = await Deno.readTextFile(path);
                const data = JSON.parse(text);

                if (
                  data?.__resolveType === "blog/loaders/Blogpost.ts" &&
                  data?.post
                ) {
                  const post = data.post as BlogPost;

                  // 1. Skip posts that don't belong to Spire
                  if (!post.spirePostId) continue;

                  // 2. Prevent feedback loop: skip if a Spire→Deco sync just wrote this slug
                  if (activeSyncs.has(post.slug)) continue;

                  // 3. Sync manual content updates back to Spire
                  await notifySpireOfManualUpdate(post);
                }
              } catch {
                // Ignore transient JSON parse or read conflicts on fast saves
              }
            }
          }
        }
      }
    } catch (err) {
      logger.error("[BlogWatcher] Error in watchFs loop:", err);
      // Restart watcher in case of unexpected file system handle drops
      isWatcherStarted = false;
      setTimeout(() => {
        if (latestState) startBlogWatcher(latestState);
      }, 5000);
    }
  })();
}

async function notifySpireOfManualUpdate(post: BlogPost) {
  const currentState = latestState;
  if (!currentState) return;

  const expectedSecret =
    (typeof currentState.spireWebhookSecret === "string"
      ? currentState.spireWebhookSecret
      : currentState.spireWebhookSecret?.get?.()) ||
    Deno.env.get("SPIRE_WEBHOOK_SECRET");

  if (!expectedSecret) return;

  const spireUrl = Deno.env.get("SPIRE_URL") || "https://spire.blog";

  // Implement AbortController timeout to prevent watcher stall
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second limit

  try {
    const response = await fetch(`${spireUrl}/api/blog/posts/sync-manual`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${expectedSecret}`,
      },
      body: JSON.stringify({
        spirePostId: post.spirePostId,
        title: post.title,
        excerpt: post.excerpt,
        seoTitle: post.seo?.title,
        seoDescription: post.seo?.description,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.error(
        `[BlogWatcher] Failed to sync manual edit back to Spire: ${response.status}`,
      );
    } else {
      logger.info(
        `[BlogWatcher] Successfully synced manual edit back to Spire for: ${post.slug}`,
      );
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === "AbortError") {
      logger.error(
        `[BlogWatcher] Request timed out (8s limit) syncing post: ${post.slug}`,
      );
    } else {
      logger.error(
        "[BlogWatcher] Error sending manual sync update back to Spire:",
        err,
      );
    }
  }
}

/**
 * @title Deco Blog
 * @description Manage your posts.
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png
 */
export default function App(state: State): App<Manifest, State> {
  startBlogWatcher(state);
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
      description: "Manage your posts, categories and authors.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png",
      images: [],
      tabs: [
        {
          title: "Spire",
          content: h(SpireSyncPreviewTab, {
            isConfigured,
            blogSlug: state?.allowedBlogSlug,
          }),
        },
      ],
    },
  };
};
