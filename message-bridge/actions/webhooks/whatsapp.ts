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

  const mastraMessage = toMastraMessage(message);

  const reply = await sendToAgent(triggerUrl.value as string, mastraMessage);
}

function toMastraMessage(message: WhatsappMessage) {
  return {
    message: message.content,
  };
}

async function sendToAgent(triggerUrl: string, mastraMessage: any) {
  const response = await fetch(triggerUrl, {
    method: "POST",
    body: JSON.stringify(mastraMessage),
  });

  return response.json();
}
