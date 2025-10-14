import { JoinChannelProps, processStream } from "../../../../mcp/bindings.ts";
import { DECO_CHAT_CHANNEL_ID } from "../../../loaders/deco-chat/channels/list.ts";
import type { AppContext, SlackWebhookPayload } from "../../../mod.ts";
import type { UIDataTypes, UIMessagePart, UITools } from "npm:ai@5.0.70";

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

  // Process the stream using the new async iterator API
  processStream(streamURL.href, {
    messages: [{
      id: props.event_id,
      parts: [{
        type: "text",
        text: props.event.text,
      }],
      role: "user",
    }],
    threadId: thread,
    resourceId: thread,
  }).then(async (stream) => {
    try {
      for await (const uiMessage of stream) {
        // Process each part in the UIMessage
        for (const part of uiMessage.parts) {
          console.log("slack part", part);
          switch (part.type) {
            case "text":
              // Accumulate text parts
              buffer += part.text;
              break;

            default:
              // Handle tool-call parts (type will be like "tool-weather")
              if (part.type.startsWith("tool-")) {
                const toolPart = part as UIMessagePart<UIDataTypes, UITools>;

                // Check if it's a typed tool part with state
                if ("state" in toolPart && "toolCallId" in toolPart) {
                  if (toolPart.state === "input-available") {
                    // Tool call with input available
                    if (isDebugMode && "input" in toolPart) {
                      const toolName = part.type.substring(5); // Remove "tool-" prefix
                      const blocks = [
                        {
                          type: "section",
                          text: {
                            type: "mrkdwn",
                            text: `🛠️ Running tool: *${toolName}*`,
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
                            text: "```" +
                              JSON.stringify(toolPart.input, null, 2) + "```",
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
                        toolCallMessageTs[toolPart.toolCallId] = {
                          ts: response.data.ts,
                          name: toolName,
                          arguments: toolPart.input as Record<string, unknown>,
                        };
                      }
                    }
                  } else if (toolPart.state === "output-available") {
                    // Tool result available
                    if (isDebugMode && "output" in toolPart) {
                      const call = toolCallMessageTs[toolPart.toolCallId];
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
                              text: "```" +
                                JSON.stringify(call.arguments, null, 2) + "```",
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
                              text: "```" +
                                JSON.stringify(toolPart.output, null, 2) +
                                "```",
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
                    }
                  }
                }
              }
              break;
          }
        }
      }

      // Send the final message after stream completes
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
    } catch (err) {
      console.error("error streaming to slack", err, linkProps, config, props);
      await client.postMessage(channel, `❌ Error: ${err}`, {
        thread_ts: props.event.ts,
      });
    }
  }).catch((err) => {
    console.error("error starting stream", err, linkProps, config, props);
  });
}
