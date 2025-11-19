import type { AppContext } from "../../mod.ts";

export interface WebhookPayload {
  challenge: string;
  // deno-lint-ignore no-explicit-any
  [key: string]: any;
}

/**
 * @description Used only for receiving webhook events from Slack
 * @internal true
 */
export default function webhookPayload(
  props: WebhookPayload,
  req: Request,
  ctx: AppContext,
): Promise<{ challenge: string }> {
  const response = Promise.resolve({ challenge: props.challenge });
  if (!ctx.webhookUrl) {
    return response;
  }

  const webhookUrl = new URL(ctx.webhookUrl);
  const reqUrl = new URL(req.url);
  const threadId = reqUrl.searchParams.get("threadId");
  const resourceId = reqUrl.searchParams.get("resourceId");

  threadId && webhookUrl.searchParams.set("threadId", threadId);
  resourceId && webhookUrl.searchParams.set("resourceId", resourceId);

  // cannot await since slack has a tight timeout for webhook responses
  fetch(webhookUrl.toString(), {
    method: "POST",
    body: JSON.stringify(props),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
}
