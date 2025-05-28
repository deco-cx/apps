import { Callbacks, processStream } from "../../../mcp/bindings.ts";
import type { AppContext, SlackWebhookPayload } from "../../mod.ts";

/**
 * @name ON_BINDING_INVOKED
 * @description This action is triggered when slack sends a webhook event
 */
export default async function invoke(
  props: SlackWebhookPayload & { challenge?: string },
  _req: Request,
  ctx: AppContext,
) {
  const challenge = props.challenge;
  if (challenge) {
    return { challenge };
  }

  console.log("invoke", { props });
  if (!ctx.appStorage) {
    return;
  }
  console.log("has appstore");
  const callbacks = await ctx.appStorage.getItem<Callbacks>(props.event.team) ??
    undefined;
  if (!callbacks) {
    return;
  }
  console.log("slack callbacks", callbacks);
  let buffer = "";
  processStream({
    streamProps: {
      messages: [{
        id: props.event_id,
        content: props.event.text.replace(/^<@.*>\s*/, ""),
        role: "user",
      }],
      options: {
        threadId: props.event.channel,
        resourceId: props.event.channel,
      },
    },
    onTextPart: (part) => {
      buffer += part;
    },
    onFinishMessagePart: () => {
      ctx.slack.postMessage(props.event.channel, buffer);
    },
  }, callbacks.stream);
}
