import { LinkChannelProps, processStream } from "../../../mcp/bindings.ts";
import type { AppContext, SlackWebhookPayload } from "../../mod.ts";

/**
 * @name ON_CHANNEL_INVOKED
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

  const bindingProps =
    await ctx.appStorage.getItem<LinkChannelProps & { installId: string }>(
      props.event.team,
    ) ??
      undefined;
  if (!bindingProps) {
    return;
  }

  const config = await ctx.getConfiguration(bindingProps.installId);
  const botId = config.botUserId;
  // avoid loops
  if (
    botId &&
    props.type === "app_mention" &&
    props.user === botId
  ) {
    return;
  }
  const client = ctx.slackClientFor(config);
  const streamCallbackUrl = config.channels?.[props.event.channel]?.stream ??
    bindingProps.callbacks.stream;
  const streamURL = new URL(streamCallbackUrl);
  streamURL.searchParams.set(
    "__d",
    `slack-${props.event.team}-${props.event.channel}`,
  );
  let buffer = "";
  processStream({
    streamProps: {
      messages: [{
        id: props.event_id,
        content: props.event.text,
        role: "user",
      }],
      options: {
        threadId: props.event.channel,
        resourceId: props.event.channel,
      },
    },
    onTextPart: (part: string) => {
      buffer += part;
    },
    onErrorPart: (err: string) => {
      console.error("error on part", err);
    },
    onFinishMessagePart: () => {
      client.postMessage(props.event.channel, buffer).then((response) => {
        if (!response.ok) {
          console.error(
            "error sending message to slack",
            props,
            buffer,
            response,
          );
        }
      });
    },
  }, streamURL.href);
}
