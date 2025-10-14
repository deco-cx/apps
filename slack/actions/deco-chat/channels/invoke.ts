import { JoinChannelProps, processStream } from "../../../../mcp/bindings.ts";
import { DECO_CHAT_CHANNEL_ID } from "../../../loaders/deco-chat/channels/list.ts";
import type { AppContext, SlackWebhookPayload } from "../../../mod.ts";

// Tool call interfaces for proper typing
interface ToolCall {
  toolName: string;
  toolCallId: string;
  args: Record<string, unknown>;
}

interface ToolResult extends ToolCall {
  result: unknown;
}

/**
 * @name DECO_CHAT_CHANNELS_INVOKE
 * @title Deco Chat Channel Invoke
 * @description This action is triggered when slack sends a webhook event
 */
export default async function invoke(
  props: SlackWebhookPayload & { challenge?: string },
  _req: Request,
  ctx: AppContext,
) {
  console.log("slack webhook invoked", props);
  const challenge = props.challenge;
  if (challenge) {
    return { challenge };
  }

  const botIdentifier = ctx.customBotName
    ? `@${ctx.customBotName}`
    : DECO_CHAT_CHANNEL_ID;

  const [joinChannel, channel, thread] = props.event.channel_type === "im"
    ? [botIdentifier, props.event.channel, props.event.user]
    : [props.event.channel, props.event.channel, props.event.channel];
  const linkProps =
    await ctx.appStorage.getItem<JoinChannelProps & { installId: string }>(
      ctx.cb.forTeam(props.event.team, joinChannel),
    ) ??
      undefined;
  console.log("linkProps", joinChannel, channel, thread, linkProps);
  if (!linkProps) {
    return;
  }

  const config = await ctx.getConfiguration(linkProps.installId);
  console.log("config", config);
  const botId = config.botUserId;
  console.log("botId", botId);
  // avoid loops
  if (
    botId &&
    ((props.type === "app_mention" &&
      props.user === botId) ||
      (props.event.channel_type === "im" &&
        props.event.user === botId))
  ) {
    console.log("botId is the same as the user, returning");
    return;
  }
  const client = ctx.slackClientFor(config);
  const streamCallbackUrl = linkProps.callbacks?.stream ??
    config?.callbacks?.stream;
  const streamURL = new URL(streamCallbackUrl);
  streamURL.searchParams.set(
    "__d",
    `slack-${props.event.team}-${channel}`,
  );

  // Debug mode: show tool calls only when enabled in app configuration
  // Configured during OAuth setup - defaults to false for clean user experience
  const isDebugMode = Boolean(config.debugMode);

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
        threadId: thread,
        resourceId: thread,
      },
    },
    onToolCallPart: async (toolCall: ToolCall) => {
      // Only show tool calls in debug mode
      if (!isDebugMode) {
        return;
      }

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
      const response = await client.postMessage(channel, "", {
        thread_ts: props.event.ts,
        blocks,
      });
      if (response.ok) {
        toolCallMessageTs[toolCall.toolCallId] = {
          ts: response.data.ts,
          name: toolCall.toolName,
          arguments: toolCall.args,
        };
      }
    },
    onToolResultPart: async (
      toolCall: Omit<ToolResult, "args" | "toolName">,
    ) => {
      // Only show tool results in debug mode
      if (!isDebugMode) {
        return;
      }

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
        await client.updateMessage(channel, call.ts, "", {
          blocks,
        });
      }
    },
    onTextPart: (part: string) => {
      buffer += part;
    },
    onErrorPart: async (err: string) => {
      await client.postMessage(channel, `❌ Error: ${err}`, {
        thread_ts: props.event.ts,
      });
    },
    onFinishMessagePart: async () => {
      if (linkProps.agentLink && linkProps.agentName) {
        buffer = `<${linkProps.agentLink}|${linkProps.agentName}>: ${buffer}`;
      }
      await client.postMessage(channel, buffer, {
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
