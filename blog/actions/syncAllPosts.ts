import { logger } from "@deco/deco/o11y";
import { isAdmin } from "@deco/deco/utils";
import { AppContext } from "../mod.ts";
import { activeSyncs } from "../mod.ts";
import { importSpirePost, SPIRE_BASE_URL } from "../utils/spireImport.ts";

export interface Props {
  /**
   * @hide true
   * @description Maximum posts to import per run (safety cap). Defaults to 500.
   */
  limit?: number;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  skipped: number;
  errors: string[];
  message: string;
}

/**
 * @title Sync All Posts from Spire
 * @description Bulk-imports all published posts from the configured Spire blog into
 *   Deco's native block storage. Admin-only. Uses `allowedBlogSlug` from app state.
 */
export default async function syncAllPosts(
  { limit = 500 }: Props,
  req: Request,
  ctx: AppContext,
): Promise<SyncResult> {
  // 1. Admin-only guard
  const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
  if (!isAdmin(origin) && Deno.env.get("DECO_ENV") !== "development") {
    return {
      success: false,
      synced: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      message: "Unauthorized: admin access required.",
    };
  }

  // 2. Require allowedBlogSlug — avoids ambiguity in multi-tenant setups
  const blogSlug = ctx.allowedBlogSlug;
  if (!blogSlug) {
    return {
      success: false,
      synced: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      message:
        'Configure "Spire Blog Slug" in the blog app settings before syncing.',
    };
  }

  const spireUrl = Deno.env.get("SPIRE_URL") ?? SPIRE_BASE_URL;
  let page = 1;
  let totalPages = 1;
  let synced = 0;
  let failed = 0;
  let skipped = 0;
  const errors: string[] = [];

  logger.info(`[SyncAllPosts] Starting full sync for blog "${blogSlug}"…`);

  while (page <= totalPages && (synced + failed) < limit) {
    // Fetch post listing page
    const listController = new AbortController();
    const listTimeout = setTimeout(() => listController.abort(), 15_000);
    let listResponse: Response;

    try {
      listResponse = await fetch(
        `${spireUrl}/api/blog/${
          encodeURIComponent(blogSlug)
        }?page=${page}&perPage=50`,
        { signal: listController.signal },
      );
    } catch (err) {
      clearTimeout(listTimeout);
      logger.error(`[SyncAllPosts] Listing page ${page} fetch error:`, err);
      errors.push(`page:${page}`);
      failed++;
      break;
    } finally {
      clearTimeout(listTimeout);
    }

    if (!listResponse.ok) {
      logger.error(
        `[SyncAllPosts] Listing page ${page} returned ${listResponse.status}`,
      );
      break;
    }

    const {
      posts,
      pagination,
    } = await listResponse.json() as {
      posts: Array<{ slug: string }>;
      pagination: { totalPages: number };
    };

    totalPages = pagination?.totalPages ?? 1;

    for (const summary of posts ?? []) {
      if ((synced + failed) >= limit) {
        skipped++;
        continue;
      }

      // Register anti-loop flag so the file watcher skips this write
      activeSyncs.add(summary.slug);
      setTimeout(() => activeSyncs.delete(summary.slug), 15_000);

      const result = await importSpirePost(blogSlug, summary.slug, spireUrl);
      if (result.success) {
        synced++;
      } else {
        failed++;
        errors.push(`${summary.slug}: ${result.message ?? "unknown error"}`);
        logger.error(
          `[SyncAllPosts] Failed to import "${summary.slug}": ${result.message}`,
        );
      }
    }

    page++;
  }

  const message = skipped > 0
    ? `Synced ${synced}, failed ${failed}, skipped ${skipped} (limit reached).`
    : `Synced ${synced} post(s)${failed > 0 ? `, ${failed} failed` : ""}.`;

  logger.info(`[SyncAllPosts] Done for "${blogSlug}": ${message}`);

  return { success: failed === 0, synced, failed, skipped, errors, message };
}
