import { InputBindingProps, processStream } from "../../../mcp/bindings.ts";
import type { AppContext, SlackWebhookPayload } from "../../mod.ts";

/**
 * @name ON_AGENT_INPUT
 * @description This action is triggered when slack sends a webhook event
 */
export default function input(
  props: InputBindingProps<SlackWebhookPayload & { challenge: string }>,
  _req: Request,
  ctx: AppContext,
) {
  const challenge = props.payload.challenge;
  if (challenge) {
    return { challenge };
  }

  let buffer = "";
  processStream({
    streamProps: {
      messages: [{
        id: props.payload.event_id,
        content: props.payload.event.text.replace(/^<@.*>\s*/, ""),
        role: "user",
      }],
      options: {
        threadId: props.payload.event.channel,
        resourceId: props.payload.event.channel,
      },
    },
    onTextPart: (part) => {
      buffer += part;
    },
    onFinishMessagePart: () => {
      ctx.slack.postMessage(props.payload.event.channel, buffer);
    },
  }, props);
  // Pass to handler
  // discord needs to be responded within 3 seconds
}
