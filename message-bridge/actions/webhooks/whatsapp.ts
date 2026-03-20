import { AppContext, BridgeRequest } from "../../mod.ts";
interface Props {
  message: any;
}

export default async function whatsappWebhook(
  { message }: Props,
  _req: Request,
  ctx: AppContext,
) {
  try {
    const key = [`webhook:${message.to}`];
    const triggerUrlResult = await ctx.kv.get<string>(key);
    if (!triggerUrlResult.value) {
      return {
        message: `No webhook subscription found for ${message.to}`,
        status: "error",
      };
    }

    const triggerUrl = triggerUrlResult.value;

    // const bridgeMessage = await ctx.connector.toBridgeMessage(message);
    const bridgeMessage = message;
    
    const reply = await sendToAgent(triggerUrl, {prompt: bridgeMessage.prompt});

    console.log({ reply });
    
    // await sendToWhatsapp({ message: reply, contactName: "Deco" });
    
    return {
      message: "Message processed successfully",
      status: "success",
    };
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return {
      message: "Failed to process WhatsApp message",
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function sendToAgent(triggerUrl: string, bridgeMessage: BridgeRequest) {
  const body = JSON.stringify(bridgeMessage);
  
  const request = new Request(triggerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
  
  const response = await fetch(request);

  return response.json();
}


const WHATSAPP_WEBHOOK_URL =
  "https://webhooks.deco.site/live/invoke/whatsappSendMessage";

export async function sendToWhatsapp({ message, contactName }: {
  message: BridgeRequest;
  contactName: string;
}) {
  try {
    const payload = {
      contactName,
      ...getMessagePayload({
        text: message.prompt,
      }),
    };

    const response = await fetch(WHATSAPP_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp send message failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending to WhatsApp:", error);
    throw error;
  }
}

export interface WhatsAppMessage {
  text?: string;
  image?: {
    url: string;
    caption?: string;
  };
  audio?: {
    url: string;
    seconds: number;
  };
  video?: {
    url: string;
    caption: string;
  };
}
function getMessagePayload(message: WhatsAppMessage): Record<string, unknown> {
  if (message.text) {
    return { text: message.text };
  }
  if (message.image) {
    return { image: message.image };
  }
  if (message.video) {
    return { video: message.video };
  }
  if (message.audio) {
    return { audio: message.audio };
  }

  throw new Error(
    "Invalid message format: Message must contain one of text, image, video, audio, or document",
  );
}