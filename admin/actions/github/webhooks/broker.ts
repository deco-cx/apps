import { context } from "deco/live.ts";
import { badRequest } from "deco/mod.ts";
import { k8s } from "../../../../platforms/kubernetes/deps.ts";
import { WebhookEvent, WebhookEventName } from "../../../deps.ts";
import { AppContext, GithubEventListener } from "../../../mod.ts";

const canHandle = (
  event: WebhookEventName,
  listener: GithubEventListener,
): listener is GithubEventListener<WebhookEventName> => {
  return !Array.isArray(listener.events) || listener.events.includes(event);
};

/**
 * Used as an entrypoint for any webhook event from github
 * It skips signature verify when running locally
 * use /live/invoke/deco-sites/admin/actions/github/webhooks/broker.ts and pass the payload
 */
export default async function onEventReceived(
  event: WebhookEvent,
  req: Request,
  ctx: AppContext,
) {
  const valid = !context.isDeploy || (await ctx.webhooks?.verify(
    JSON.stringify(event),
    req.headers.get("x-hub-signature-256")!,
  ) ?? true);
  if (!valid) {
    badRequest({ message: "signature is invalid" });
    return;
  }

  const eventName = req.headers.get("x-github-event") as WebhookEventName;

  await Promise.all(ctx.githubEventListeners.map((listener) => {
    if (canHandle(eventName, listener)) {
      return listener.handle(event, req, ctx);
    }
    return Promise.resolve();
  })).catch((err) => {
    if ((err as k8s.HttpError).body) {
      console.error("k8s error", JSON.stringify((err as k8s.HttpError).body));
    }
    console.error(err);
    throw err;
  });
}
