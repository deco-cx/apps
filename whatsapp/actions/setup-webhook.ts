import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Webhook URL
   * @description The full URL where your webhook endpoint is hosted
   */
  webhookUrl: string;

  /**
   * @title Persist Callbacks
   * @description Whether to persist callbacks
   * @default true
   */
  callbackPersist?: boolean;

  /**
   * @title Sent Status
   * @description Whether to receive sent status notifications
   * @default true
   */
  sentStatus?: boolean;

  /**
   * @title Delivered Status
   * @description Whether to receive delivered status notifications
   * @default true
   */
  deliveredStatus?: boolean;

  /**
   * @title Read Status
   * @description Whether to receive read status notifications
   * @default true
   */
  readStatus?: boolean;

  /**
   * @title Access Token
   * @description The same access token used to configure the WhatsApp app
   */
  accessToken: string;
}

/**
 * @title Setup WhatsApp Webhook
 * @description Configure webhook settings for the WhatsApp API
 */
export default async function setupWebhook(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> {
  // Set default values
  const {
    webhookUrl,
    callbackPersist = true,
    sentStatus = true,
    deliveredStatus = true,
    readStatus = true,
    accessToken,
  } = props;

  try {
    // Prepare the settings payload based on the API documentation
    const settingsPayload = {
      callback_persist: callbackPersist,
      sent_status: sentStatus, // Will be deprecated, but included for compatibility
      webhooks: {
        url: webhookUrl,
        message: {
          sent: sentStatus,
          delivered: deliveredStatus,
          read: readStatus,
        },
      },
    };

    // Get the base URL from the context
    const baseUrl = `https://graph.facebook.com/${ctx.apiVersion}`;

    // Make the request to configure webhook settings
    const response = await fetch(
      `${baseUrl}/v1/settings/application`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsPayload),
      },
    );

    // Check if the request was successful
    if (response.ok) {
      return {
        success: true,
        message: "Webhook configured successfully",
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: `Failed to configure webhook: ${JSON.stringify(errorData)}`,
      };
    }
  } catch (error: unknown) {
    console.error("Error configuring webhook:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Error configuring webhook: ${errorMessage}`,
    };
  }
}
