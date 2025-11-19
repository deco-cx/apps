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
  if (!linkProps) {
    return;
  }

  const config = await ctx.getConfiguration(linkProps.installId);
  const botId = config.botUserId;
  // avoid loops
  if (
    botId &&
    ((props.type === "app_mention" &&
      props.user === botId) ||
      (props.event.channel_type === "im" &&
        props.event.user === botId))
  ) {
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
    console.log("stream received in slack:", stream);
    console.log("stream type:", typeof stream);
    console.log("stream is async iterable:", Symbol.asyncIterator in stream);

    try {
      let lastMessage;
      console.log("starting to iterate over stream");

      try {
        for await (const uiMessage of stream) {
          console.log("slack uiMessage", uiMessage);
          lastMessage = uiMessage;

          // Process each part in the UIMessage for real-time tool updates
          for (const part of uiMessage.parts) {
            console.log("slack part", part);
            switch (part.type) {
              case "text":
                // Text is already accumulated in each UIMessage, so we just update the buffer
                // We'll use the final message's text after the stream completes
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
                            arguments: toolPart.input as Record<
                              string,
                              unknown
                            >,
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
                                  JSON.stringify(call.arguments, null, 2) +
                                  "```",
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
      } catch (iterError) {
        console.error("Error during stream iteration:", iterError);
        throw iterError;
      }

      console.log("finished iterating over stream");

      // Extract text from the final message
      console.log("lastMessage:", lastMessage);
      if (lastMessage) {
        console.log("lastMessage.parts:", lastMessage.parts);
        for (const part of lastMessage.parts) {
          console.log("final part type:", part.type, "part:", part);
          if (part.type === "text") {
            console.log("adding text to buffer:", part.text);
            buffer += part.text;
          }
        }
      }
      console.log("final buffer:", buffer);

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
