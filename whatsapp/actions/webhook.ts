import type { AppContext } from "../mod.ts";

/**
 * WhatsApp webhook interface for receiving incoming messages and status updates
 */
export interface WebhookPayload {
  // For API Local format
  contacts?: {
    profile: {
      name: string;
    };
    wa_id: string;
  }[];
  messages?: {
    from: string;
    id: string;
    timestamp: string;
    text?: {
      body: string;
    };
    type: string;
    // Add other message types as needed
  }[];

  // For status updates
  statuses?: {
    id: string;
    status: "sent" | "delivered" | "read" | "failed";
    timestamp: string;
    recipient_id: string;
  }[];

  // For errors
  errors?: {
    code: number;
    title: string;
    details: string;
    href?: string;
  }[];
}

export interface Props extends WebhookPayload {
}

/**
 * @title WhatsApp Webhook
 * @description Webhook handler for receiving WhatsApp messages and status updates
 */
export default async function webhook(
  props: Props,
  req: Request,
  _ctx: AppContext,
): Promise<Response> {
  //   console.log({req});
  // const mode = req.hub.mode;
  // const token = req.hub.verify_token;
  // const challenge = req.hub.challenge

  // console.log({mode, token, challenge});

  // if (mode === "subscribe" && token && challenge) {
  //   console.log("Challenge", challenge);
  //   return new Response(challenge, {
  //     status: 200,
  //   });
  // }

  // Handle incoming webhook data
  if (req.method === "POST") {
    try {
      const payload: WebhookPayload = props;

      const messages = payload.messages;
      const firstTextMessage = messages?.find((message) =>
        message.type === "text"
      );

      if (firstTextMessage?.text?.body === "Finish") {
        console.log("Finish");
        const body = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: firstTextMessage?.from,
          type: "text",
          text: {
            body:
              "Your integration is finished. You can now talk to your agent.",
          },
        } as const;

        // Add reply context if replying to a message
        if (firstTextMessage?.id) {
          Object.assign(body, {
            context: {
              message_id: firstTextMessage.id,
            },
          });
        }

        console.log("Sending reply to", firstTextMessage?.from);
        console.log("Phone number id", _ctx.phoneNumberId);
        const response = await _ctx.api["POST /:phone_number_id/messages"]({
          phone_number_id: _ctx.phoneNumberId,
        }, {
          body,
        });

        console.log("Webhook response", response);

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const from = firstTextMessage?.from;
      if (!from) {
        console.error("No from found in message");
        return new Response(
          JSON.stringify({ error: "No from found in message" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const kv = await Deno.openKv();
      const hasWebhook = await kv.get(["whatsapp", "webhooks", from]);

      if (hasWebhook) {
        // const webhookUrl = hasWebhook.value as string;
        const webhookUrl =
          "https://fs.deco.chat/actors/Trigger/invoke/run?passphrase=undefined&deno_isolate_instance_id=/users/d9064704-4fdd-45e1-9ae5-df90b6be42e3/Agents/277d890f-72c1-4449-a72d-faa5ccaf5e31/triggers/510ce4b7-07e3-410b-8305-747a2c1e500c";
        console.log("Sending webhook to", webhookUrl);
        const message = firstTextMessage?.text?.body;
        console.log("Message", message);
        const response = await fetch(
          webhookUrl.replace("https://fs.deco.chat", "http://localhost:8000"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
          },
        );
        console.log("Webhook response", response);
        const responseBody = await response.json();
        console.log("Webhook response body", responseBody);

        if (responseBody.text) {
          const body = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: from,
            type: "text",
            text: {
              body: responseBody.text,
            },
          } as const;

          // Add reply context if replying to a message
          if (responseBody.replyToMessageId) {
            Object.assign(body, {
              context: {
                message_id: responseBody.replyToMessageId,
              },
            });
          }

          console.log("Sending reply to", from);
          console.log("Phone number id", _ctx.phoneNumberId);
          const response = await _ctx.api["POST /:phone_number_id/messages"]({
            phone_number_id: _ctx.phoneNumberId,
          }, {
            body,
          });
          console.log("Webhook response", response);
        }
      }

      // Process messages
      if (payload.messages && payload.messages.length > 0) {
        // You can add custom logic to handle different message types here
        for (const message of payload.messages) {
          console.log(
            `Message from ${message.from}: ${
              message.text?.body || "[non-text content]"
            }`,
          );

          // Handle the message (e.g., store in database, trigger a response, etc.)
          // This is where you would implement your business logic
        }
      }

      // Process status updates
      if (payload.statuses && payload.statuses.length > 0) {
        for (const status of payload.statuses) {
          console.log(`Message ${status.id} status: ${status.status}`);
        }
      }

      // Process errors
      if (payload.errors && payload.errors.length > 0) {
        for (const error of payload.errors) {
          console.error(`WhatsApp error: ${error.title} - ${error.details}`);
        }
      }

      // Always return 200 OK to acknowledge receipt
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response(
        JSON.stringify({ error: "Failed to process webhook" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  // Method not allowed for other request types
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
