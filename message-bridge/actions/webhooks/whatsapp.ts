import { AppContext } from "../../mod.ts";

interface WhatsappMessage {
  id: string;
  from: string;
  to: string;
  content: string;
}

interface Props {
  message: WhatsappMessage;
}

export default async function whatsappWebhook(
  { message }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const triggerUrl = await ctx.kv.get([`webhook:${message.to}`]);

  if (!triggerUrl.value) {
    return;
  }

  const bridgeMessage = ctx.state.toBridgeMessage(message);

  const reply = await sendToAgent(triggerUrl.value as string, bridgeMessage);
}


async function sendToAgent(triggerUrl: string, bridgeMessage: BridgeMessage) {
  const response = await fetch(triggerUrl, {
    method: "POST",
    body: JSON.stringify(bridgeMessage),
  });

  return response.json();
}
