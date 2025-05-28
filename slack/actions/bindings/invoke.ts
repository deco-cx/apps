import { OnCreatedBindingProps, processStream } from "../../../mcp/bindings.ts";
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

  if (!ctx.appStorage) {
    return;
  }
  const bindingProps =
    await ctx.appStorage.getItem<OnCreatedBindingProps & { installId: string }>(
      props.event.team,
    ) ??
      undefined;
  if (!bindingProps) {
    return;
  }
  const config = await ctx.getConfiguration(bindingProps.installId);
  const client = ctx.slackClientFor(config);
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
    onErrorPart: (err) => {
      console.error("error on part", err);
    },
    onFinishMessagePart: () => {
      client.postMessage(props.event.channel, buffer);
    },
  }, bindingProps.callbacks.stream);
}
