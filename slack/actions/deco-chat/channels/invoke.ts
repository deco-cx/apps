import { JoinChannelProps, processStream } from "../../../../mcp/bindings.ts";
import type { AppContext, SlackWebhookPayload } from "../../../mod.ts";

/**
 * @name DECO_CHAT_CHANNELS_INVOKE
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
  const linkProps =
    await ctx.appStorage.getItem<JoinChannelProps & { installId: string }>(
      ctx.cb.forTeam(props.event.team, props.event.channel),
    ) ??
      undefined;
  if (!linkProps) {
    return;
  }

  const config = await ctx.getConfiguration(linkProps.installId);
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
  const streamCallbackUrl = linkProps.callbacks?.stream ??
    config?.callbacks?.stream;
  const streamURL = new URL(streamCallbackUrl);
  streamURL.searchParams.set(
    "__d",
    `slack-${props.event.team}-${props.event.channel}`,
  );
  const toolCallMessageTs: Record<
    string,
    { ts: string; name: string; arguments: Record<string, unknown> }
  > = {};
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
    onToolCallPart: async (toolCall) => {
      const blocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🛠️ Running tool: *${toolCall.toolName}*`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Arguments:*",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "```" + JSON.stringify(toolCall.args, null, 2) + "```",
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "_Status: Processing..._",
            },
          ],
        },
      ];
      const response = await client.postMessage(props.event.channel, "", {
        thread_ts: props.event.ts,
        blocks,
      });
      if (response.ok) {
        toolCallMessageTs[toolCall.toolCallId] = {
          ts: response.ts,
          name: toolCall.toolName,
          arguments: toolCall.args,
        };
      }
    },
    onToolResultPart: async (toolCall) => {
      const call = toolCallMessageTs[toolCall.toolCallId];
      if (call) {
        const blocks = [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🛠️ Tool: *${call.name}*`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Arguments:*",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "```" + JSON.stringify(call.arguments, null, 2) + "```",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Result:*",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "```" + JSON.stringify(toolCall.result, null, 2) + "```",
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "✅ Result received.",
              },
            ],
          },
        ];
        await client.updateMessage(props.event.channel, call.ts, "", {
          blocks,
        });
      }
    },
    onTextPart: (part: string) => {
      buffer += part;
    },
    onErrorPart: async (err: string) => {
      await client.postMessage(props.event.channel, `❌ Error: ${err}`, {
        thread_ts: props.event.ts,
      });
    },
    onFinishMessagePart: async () => {
      if (linkProps.agentLink && linkProps.agentName) {
        buffer = `<${linkProps.agentLink}|${linkProps.agentName}>: ${buffer}`;
      }
      await client.postMessage(props.event.channel, buffer, {
        thread_ts: props.event.ts,
      }).then((response) => {
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
  }, streamURL.href).catch((err) => {
    console.error("error streaming to slack", err, linkProps, config, props);
  });
}
