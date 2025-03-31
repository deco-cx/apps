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
  _req: Request,
  ctx: AppContext,
): Promise<{ challenge: string }> {
  console.log("webhook-payload", props, ctx.webhookUrl);
  const response = Promise.resolve({ challenge: props.challenge });
  if (!ctx.webhookUrl) {
    return response;
  }
  // cannot await since slack has a tight timeout for webhook responses
  fetch(ctx.webhookUrl, {
    method: "POST",
    body: JSON.stringify(props),
    headers: {
      "content-type": "application/json",
    },
  });
  return response;
}
