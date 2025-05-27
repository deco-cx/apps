import { processStream } from "../../../mcp/bindings.ts";
import type { AppContext, SlackWebhookPayload } from "../../mod.ts";

/**
 * @name ON_BINDING_INVOKED
 * @description This action is triggered when slack sends a webhook event
 */
export default function invoke(
  props: SlackWebhookPayload & { challenge?: string },
  _req: Request,
  ctx: AppContext,
) {
  const challenge = props.challenge;
  if (challenge) {
    return { challenge };
  }

  if (!ctx.callbacks) {
    return;
  }

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
  }, ctx.callbacks.stream);
}
