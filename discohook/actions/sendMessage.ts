import { AppContext } from "../mod.ts";
import { DiscordMessage, DiscordWebhookResponse } from "../utils/types.ts";

interface Props extends DiscordMessage {
  /**
   * @title Thread ID
   * @description Optional: Send the message to a specific thread in the channel
   */
  thread_id?: string;

  /**
   * @title Wait for Confirmation
   * @description Wait for server confirmation of message send before response
   */
  wait?: boolean;

  /**
   * @title Webhook ID
   * @description The ID part of your webhook URL (found in Channel Settings > Integrations > Webhooks)
   */
  webhookId: string;

  /**
   * @title Webhook Token
   * @description The token part of your webhook URL (found in Channel Settings > Integrations > Webhooks)
   */
  webhookToken: string;
}

/**
 * @title Send Discord Message
 * @description Send a customized message to your Discord channel with optional rich formatting, embeds, and custom appearance
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordWebhookResponse> => {
  const { thread_id, wait, webhookId, webhookToken, ...messageProps } = props;

  const body = {
    ...messageProps,
    embeds: Array.isArray(messageProps.embeds)
      ? messageProps.embeds
      : undefined,
  };

  const params = {
    wait: wait ?? true,
    ...(thread_id ? { thread_id } : {}),
  };

  const response = await ctx.api["POST /:webhookId/:webhookToken"]({
    webhookId,
    webhookToken,
    ...params,
  }, {
    body,
  });

  const result = await response.json();
  return result;
};

export default action;
