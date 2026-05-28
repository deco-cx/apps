import { logger } from "@deco/deco/o11y";
import { activeSyncs, AppContext } from "../mod.ts";
import { SPIRE_BASE_URL, syncBlogPosts } from "../utils/spireImport.ts";

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
 *   Deco's native block storage. Uses `allowedBlogSlug` from app state.
 */
export default async function syncAllPosts(
  { limit = 500 }: Props,
  req: Request,
  ctx: AppContext,
): Promise<SyncResult> {
  // 1. Auth guard — accept preview-tab requests or webhook secret, or dev mode.
  // X-Requested-With is a non-simple CORS header: cross-origin callers must pass a preflight,
  // so same-origin preview-tab requests work while external forgery requires explicit CORS opt-in.
  const expectedSecret =
    (typeof ctx.spireWebhookSecret === "string"
      ? ctx.spireWebhookSecret
      : ctx.spireWebhookSecret?.get?.()) ||
    Deno.env.get("SPIRE_WEBHOOK_SECRET");

  const requestedWith = req.headers.get("X-Requested-With");
  const providedToken = req.headers.get("Authorization")?.replace(
    "Bearer ",
    "",
  );
  const isAuthenticated = requestedWith === "deco-preview-tab" ||
    (!!expectedSecret && providedToken === expectedSecret) ||
    Deno.env.get("DECO_ENV") === "development";

  if (!isAuthenticated) {
    return {
      success: false,
      synced: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      message: "Unauthorized: configure Spire Webhook Secret in app settings.",
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

  logger.info(`[SyncAllPosts] Starting full sync for blog "${blogSlug}"…`);

  const { synced, failed, skipped, errors } = await syncBlogPosts(blogSlug, {
    spireUrl,
    limit,
    activeSyncs,
    logPrefix: "[SyncAllPosts]",
  });

  const message = skipped > 0
    ? `Synced ${synced}, failed ${failed}, skipped ${skipped} (limit reached).`
    : `Synced ${synced} post(s)${failed > 0 ? `, ${failed} failed` : ""}.`;

  logger.info(`[SyncAllPosts] Done for "${blogSlug}": ${message}`);

  return { success: failed === 0, synced, failed, skipped, errors, message };
}
