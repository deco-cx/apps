import { logger } from "@deco/deco/o11y";
import { activeSyncs, AppContext } from "../mod.ts";
import { importSpirePost } from "../utils/spireImport.ts";

export interface Props {
  postId: string;
  postSlug: string;
  blogSlug: string;
  event: "post.published" | "post.unpublished" | "post.saved";
}

/**
 * @title Blog Webhook Router Gateway
 * @description Securely receives incoming webhooks from Spire (signed with HMAC-SHA256),
 *   validates the signature, enforces the configured blog-slug tenant boundary,
 *   and routes events to import or remove posts from native Deco block storage.
 */
export default async function webhook(
  { postId, postSlug, blogSlug, event }: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; path?: string; message?: string }> {
  try {
    // 1. Resolve expected secret
    const expectedSecret = (typeof ctx.spireWebhookSecret === "string"
      ? ctx.spireWebhookSecret
      : ctx.spireWebhookSecret?.get?.()) ||
      Deno.env.get("SPIRE_WEBHOOK_SECRET");

    if (!expectedSecret) {
      return {
        success: false,
        message: "Unauthorized: webhook secret not configured.",
      };
    }

    // 2. Validate required fields — catches missing body (e.g., direct GET/test calls)
    if (!blogSlug || !postSlug || !event) {
      return { success: false, message: "Missing required webhook fields." };
    }

    // 3. Tenant isolation — reject webhooks from any blog other than the configured one.
    //    This prevents a valid-secret holder from injecting a different tenant's content.
    const allowedBlogSlug = ctx.allowedBlogSlug;
    if (allowedBlogSlug && blogSlug !== allowedBlogSlug) {
      logger.error(
        `[Webhook] Rejected: blogSlug "${blogSlug}" does not match allowedBlogSlug "${allowedBlogSlug}"`,
      );
      return {
        success: false,
        message: "Unauthorized: blog slug does not match site configuration.",
      };
    }

    // 4. Authenticate — HMAC-SHA256 first, Bearer token fallback.
    //
    //    Note: the Deco /live/invoke/* handler reads req.body to extract Props before this
    //    action runs, so the body stream is already consumed. We reconstruct the canonical
    //    payload from the already-parsed props (field order must match Spire's JSON.stringify).
    const spireSignature = req.headers.get("X-Spire-Signature");
    const authHeader = req.headers.get("Authorization");
    const querySecret = new URL(req.url).searchParams.get("secret");

    let isAuthorized = false;

    if (spireSignature) {
      const canonicalPayload = JSON.stringify({
        postId,
        postSlug,
        blogSlug,
        event,
      });
      try {
        isAuthorized = await verifyHmac(
          canonicalPayload,
          spireSignature,
          expectedSecret,
        );
      } catch (err) {
        logger.error("[Webhook] HMAC verification error:", err);
      }
    }

    if (!isAuthorized) {
      const token = authHeader?.replace("Bearer ", "") || querySecret;
      isAuthorized = !!token && token === expectedSecret;
    }

    if (!isAuthorized) {
      return {
        success: false,
        message: "Unauthorized: signature or token verification failed.",
      };
    }

    // 5. Validate slug (path-traversal guard)
    if (!postSlug || !/^[a-zA-Z0-9_-]+$/.test(postSlug)) {
      return { success: false, message: "Invalid post slug format." };
    }

    // 6. Route event
    if (event === "post.unpublished") {
      return await removePostBlock(postSlug);
    }

    // 7. Import post — register anti-loop flag before writing the file
    activeSyncs.add(postSlug);
    setTimeout(() =>
      activeSyncs.delete(postSlug), 15_000);

    const spireUrl = Deno.env.get("SPIRE_URL");
    return await importSpirePost(blogSlug, postSlug, spireUrl);
  } catch (error) {
    logger.error("[Webhook] Unexpected error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}

async function removePostBlock(
  slug: string,
): Promise<{ success: boolean; message: string }> {
  const { join } = await import("std/path/mod.ts");
  const filePath = join(
    Deno.cwd(),
    ".deco",
    "blocks",
    "collections",
    "blog",
    "posts",
    `${slug}.json`,
  );
  try {
    await Deno.remove(filePath);
    logger.info(`[Webhook] Removed unpublished post: ${filePath}`);
    return { success: true, message: "Post unpublished successfully" };
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return {
        success: true,
        message: "Post already unpublished or not found",
      };
    }
    throw err;
  }
}

/** Verifies HMAC-SHA256 signature using Web Crypto. */
async function verifyHmac(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const computed = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return computed === signature.toLowerCase();
}
