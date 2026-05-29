import { logger } from "@deco/deco/o11y";
import { AppContext } from "../mod.ts";

export interface Props {
  postId: string;
  postSlug: string;
  blogSlug: string;
  event: "post.published" | "post.unpublished" | "post.saved";
}

/**
 * @title Spire Webhook
 * @description Receives event notifications from Spire (HMAC-SHA256 signed).
 *   Validates the signature and tenant boundary. No storage is performed — the
 *   blog loaders fetch Spire content live from the API on each request (with CDN
 *   caching). This endpoint exists to authenticate inbound Spire events and can
 *   be extended for cache invalidation or audit logging in the future.
 */
export default async function webhook(
  { postId, postSlug, blogSlug, event }: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message?: string }> {
  // 1. Resolve shared secret
  const secret =
    (typeof ctx.spireWebhookSecret === "string"
      ? ctx.spireWebhookSecret
      : ctx.spireWebhookSecret?.get?.()) ||
    Deno.env.get("SPIRE_WEBHOOK_SECRET");

  if (!secret) {
    return { success: false, message: "Webhook secret not configured." };
  }

  // 2. Validate required fields
  if (!blogSlug || !postSlug || !event) {
    return { success: false, message: "Missing required webhook fields." };
  }

  // 3. Tenant isolation
  if (ctx.allowedBlogSlug && blogSlug !== ctx.allowedBlogSlug) {
    logger.error(
      `[Webhook] Rejected: "${blogSlug}" ≠ allowedBlogSlug "${ctx.allowedBlogSlug}"`,
    );
    return {
      success: false,
      message: "Blog slug does not match site configuration.",
    };
  }

  // 4. Authenticate — HMAC-SHA256 first, Bearer token fallback
  const spireSignature = req.headers.get("X-Spire-Signature");
  const authHeader = req.headers.get("Authorization");
  const querySecret = new URL(req.url).searchParams.get("secret");

  let authorized = false;

  if (spireSignature) {
    const canonical = JSON.stringify({ postId, postSlug, blogSlug, event });
    try {
      authorized = await verifyHmac(canonical, spireSignature, secret);
    } catch (err) {
      logger.error("[Webhook] HMAC error:", err);
    }
  }

  if (!authorized) {
    const token = authHeader?.replace("Bearer ", "") || querySecret;
    authorized = !!token && token === secret;
  }

  if (!authorized) {
    return {
      success: false,
      message: "Signature or token verification failed.",
    };
  }

  // 5. Slug format guard (path-traversal prevention)
  if (!/^[a-zA-Z0-9_-]+$/.test(postSlug)) {
    return { success: false, message: "Invalid post slug format." };
  }

  logger.info(`[Webhook] Acknowledged: event="${event}" slug="${postSlug}"`);

  // Content delivery is handled by the Spire API in real-time — no file writes needed.
  // New/updated posts appear in the blog listing within the loader's cache TTL (default 60s).
  return { success: true };
}

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
