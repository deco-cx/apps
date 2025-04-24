import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title User ID
   * @description The user ID to associate with a mobile number
   */
  userId: string;

  /**
   * @title Mobile Number
   * @description The mobile number to store (with country code, e.g., 551199999999)
   */
  mobileNumber: string;

  /**
   * @title Webhook URL
   * @description The URL to send webhooks to the user agent
   */
  webhookUrl: string;
}

/**
 * @title Setup WhatsApp Connection
 * @description Stores a user ID and mobile number connection in the KV store
 */
export default async function setup(
  { userId, mobileNumber, webhookUrl }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<boolean> {
  try {
    // Open KV store
    const kv = await Deno.openKv();

    // Create key for storage - using a namespaced approach
    const key = ["whatsapp", "connections", userId];

    // const alreadySetup = await kv.get(key);

    // if (alreadySetup) {
    //   return true;
    // }

    // Store the mobile number as the value
    const result = await kv.set(key, mobileNumber);
    const webhookKey = ["whatsapp", "webhooks", mobileNumber];
    await kv.set(webhookKey, webhookUrl);

    // Close the KV connection
    kv.close();

    // If the KV operation was successful, send the message with a button
    if (result.ok) {
      try {
        // Get phone number ID and access token from context

        ctx.api["POST /:phone_number_id/messages"]({
          phone_number_id: ctx.phoneNumberId,
        }, {
          body: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            template: {
              name: "setup_user",
              language: {
                code: "en",
              },
            },
            to: mobileNumber,
            type: "template",
          },
        });
        console.log("Setup message sent successfully");
      } catch (messageError) {
        console.error("Error sending setup message:", messageError);
        // Still return true since the KV operation was successful
      }
    }

    return result.ok;
  } catch (error) {
    console.error("Error storing WhatsApp connection:", error);
    return false;
  }
}
