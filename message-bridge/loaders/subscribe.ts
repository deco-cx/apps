import { AppContext } from "../mod.ts";

/**
 * @name SUBSCRIBE
 * @description Subscribes to a webhook
 */
export interface Props {
  /**
   * @description The url of the webhook to subscribe to
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
  await ctx.kv.set([`webhook:${phoneNumber}`], triggerUrl);
}
