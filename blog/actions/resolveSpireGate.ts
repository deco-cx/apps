import { logger } from "@deco/deco/o11y";
import { AppContext } from "../mod.ts";

export interface Props {
  gateId: string;
  gateType: "campaign" | "post";
  blogSlug: string;
  campaignId?: string;
  postId?: string;
}

/**
 * @title Resolve Spire Gate
 * @description Resolves (approves) a pending Human-in-the-Loop review step directly from Deco Admin.
 */
export default async function resolveSpireGate(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message?: string }> {
  const { gateId, gateType, blogSlug, campaignId, postId } = props;

  // Auth model: Origin/Referer headers are spoofable and provide no real security.
  // The actual security boundary is the Spire API's Bearer token (spireWebhookSecret),
  // which is a server-side secret never exposed to clients. Gate IDs are UUIDs.

  // 1. Retrieve the Spire Webhook Secret configured on the Blog app state
  const expectedSecret =
    (typeof ctx.spireWebhookSecret === "string"
      ? ctx.spireWebhookSecret
      : ctx.spireWebhookSecret?.get?.()) ||
    Deno.env.get("SPIRE_WEBHOOK_SECRET");

  if (!expectedSecret) {
    return {
      success: false,
      message: "SPIRE_WEBHOOK_SECRET is not configured on your Deco site.",
    };
  }

  // 3. Fetch the target Spire Base URL (default: https://spire.blog)
  const spireUrl = Deno.env.get("SPIRE_URL") || "https://spire.blog";

  // 4. Implement AbortController timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second limit

  try {
    const response = await fetch(
      `${spireUrl}/api/blog/${encodeURIComponent(blogSlug)}/gates/resolve`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${expectedSecret}`,
        },
        body: JSON.stringify({
          gateId,
          gateType,
          campaignId,
          postId,
        }),
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Failed to resolve Spire gate: ${errorText}`,
      };
    }

    return { success: true, message: "Gate approved successfully!" };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === "AbortError") {
      logger.warn(
        `[DecoResolveSpireGate] Request timed out (8s limit) resolving gate ${gateId}.`,
      );
      return {
        success: false,
        message: "Request to Spire timed out (8s limit). Please try again.",
      };
    }

    logger.error("[DecoResolveSpireGate] Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}
