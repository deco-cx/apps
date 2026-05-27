import manifest, { Manifest } from "./manifest.gen.ts";
import { Secret } from "../website/loaders/secret.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type FnContext } from "@deco/deco";
import { join } from "std/path/mod.ts";
import { BlogPost } from "./types.ts";

export type State = {
  /**
   * @title Page Slug
   * @description The slug of the BlogPostPage to embed. Use :category and :slug.
   */
  pageSlug?: string;
  /**
   * @title Spire Webhook Secret
   * @description Secret token to verify incoming webhooks from Spire. Create a Secret here and paste it in your Spire dashboard settings alongside your Deco Webhook URL.
   */
  spireWebhookSecret?: Secret;
};
export type AppContext = FnContext<State, Manifest>;

let isWatcherStarted = false;
let latestState: State | null = null;

function startBlogWatcher(state: State) {
  latestState = state; // Sempre atualiza a referência com as credenciais/configurações mais recentes do Admin
  if (isWatcherStarted) return;
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
      console.info(
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

                  // 2. Prevent feedback loop using transient environment sync flag check
                  const syncActive = Deno.env.get(
                    `SPIRE_SYNC_ACTIVE_${post.slug}`,
                  );
                  if (syncActive) {
                    const diff = Date.now() - parseInt(syncActive, 10);
                    if (diff < 8000) { // 8-second window
                      continue;
                    }
                  }

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
      console.error("[BlogWatcher] Error in watchFs loop:", err);
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
      console.error(
        `[BlogWatcher] Failed to sync manual edit back to Spire: ${response.status}`,
      );
    } else {
      console.info(
        `[BlogWatcher] Successfully synced manual edit back to Spire for: ${post.slug}`,
      );
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error(
        `[BlogWatcher] Request timed out (8s limit) syncing post: ${post.slug}`,
      );
    } else {
      console.error(
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
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Deco Blog",
      owner: "deco.cx",
      description: "Manage your posts, categories and authors.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png",
      images: [],
      tabs: [],
    },
  };
};
