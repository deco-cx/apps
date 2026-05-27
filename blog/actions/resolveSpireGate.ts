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

  // 2. Fetch the target Spire Base URL (default: https://spire.blog)
  const spireUrl = Deno.env.get("SPIRE_URL") || "https://spire.blog";

  try {
    const response = await fetch(
      `${spireUrl}/api/blog/${encodeURIComponent(blogSlug)}/gates/resolve`,
      {
        method: "POST",
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

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Failed to resolve Spire gate: ${errorText}`,
      };
    }

    return { success: true, message: "Gate approved successfully!" };
  } catch (error) {
    console.error("[DecoResolveSpireGate] Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}
