import { AppContext } from "../mod.ts";

/**
 * @name SUBSCRIBE
 * @description Subscribes to a webhook
 */
export interface Props {
  /**
   * @description The url of the webhook to subscribe to. This should be created from a tool call.
   */
  triggerUrl: string;
  /**
   * @description The installation id of the webhook
   */
  phoneNumber: string;
}

export default async function subscribe(
  { triggerUrl, phoneNumber }: Props,
  _request: Request,
  ctx: AppContext,
) {
  try {
    const key = [`webhook:${phoneNumber}`];
    const existing = await ctx.kv.get(key);
    const res = await ctx.kv.atomic()
      .set(key, triggerUrl)
      .check(existing)
      .commit();


    if (!res.ok) {
      const latest = await ctx.kv.get(key);
      if (!latest.value) {
        throw new Error(`Failed to subscribe to ${phoneNumber}`);
      }
      return {
        message: `Already subscribed to ${phoneNumber}`,
        status: "success",
      };
    }

    return {
      message: `Subscribed to ${phoneNumber}`,
      status: "success",
    };
  } catch (error) {
    console.error("Subscription error:", error);
    return {
      message: `Failed to subscribe to ${phoneNumber}`,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
