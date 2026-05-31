import { logger } from "@deco/deco/o11y";
import { AppContext } from "../mod.ts";
import { removePostBlock, syncPostToBlocks } from "../utils/spireImport.ts";

export interface Props {
  postId: string;
  postSlug: string;
  blogSlug: string;
  event: "post.published" | "post.unpublished" | "post.saved";
}

/**
 * @title Spire Webhook
 * @description Receives event notifications from Spire (HMAC-SHA256 signed),
 *   validates the signature and tenant boundary, then:
 *   • Writes the post to .deco/blocks/ so it appears in Deco Studio's CMS browser.
 *   • The live site renders posts directly from the Spire API (via loaders), so
 *     there is no dependency on this block write for public content delivery.
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
    // Bearer token fallback — constant-time compare to prevent timing attacks.
    const token = authHeader?.replace("Bearer ", "");
    authorized = !!token && timingSafeCompare(token, secret);
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

  // 6. Sync to blocks for Studio CMS visibility (fire-and-forget)
  //    The live site fetches posts from the Spire API via loaders — this write
  //    is purely so the post appears in Deco Studio's CMS collection browser.
  if (event === "post.unpublished") {
    void removePostBlock(postSlug).catch((err) =>
      logger.error("[Webhook] Failed to remove block:", err)
    );
  } else {
    const spireUrl = Deno.env.get("SPIRE_URL") ?? "https://spire.blog";
    void syncPostToBlocks(blogSlug, postSlug, spireUrl).then(
      ({ success, message }) => {
        if (!success) logger.error(`[Webhook] Block sync failed: ${message}`);
      },
    );
  }

  logger.info(`[Webhook] Acknowledged: event="${event}" slug="${postSlug}"`);
  return { success: true };
}

/**
 * Constant-time string comparison — XORs every byte without short-circuit
 * to prevent timing-based secret extraction.
 */
function timingSafeCompare(a: string, b: string): boolean {
  const ae = new TextEncoder().encode(a);
  const be = new TextEncoder().encode(b);
  if (ae.length !== be.length) return false;
  let diff = 0;
  for (let i = 0; i < ae.length; i++) diff |= ae[i] ^ be[i];
  return diff === 0;
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
  // Use constant-time compare to prevent timing-based HMAC oracle attacks.
  return timingSafeCompare(computed, signature.toLowerCase());
}
