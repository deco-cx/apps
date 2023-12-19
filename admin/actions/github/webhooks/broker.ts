import { shortcircuit } from "deco/engine/errors.ts";
import { badRequest } from "deco/mod.ts";
import { WebhookEvent, WebhookEventName } from "../../../deps.ts";
import { AppContext, GithubEventListener } from "../../../mod.ts";

async function generateSignature(
  secret: string,
  payload: string,
): Promise<string> {
  const key = new TextEncoder().encode(secret);
  const data = new TextEncoder().encode(payload);
  const hmac = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", hmac, data);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signature = signatureArray.map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return signature;
}

const verify = async (payload: WebhookEvent, req: Request, secret?: string) => {
  if (!secret) {
    return;
  }
  const signature = req.headers.get("x-hub-signature-256");

  if (!signature) {
    badRequest({ message: "signature is missing" });
    return;
  }

  const expectedSignature = `sha256=${await generateSignature(
    secret,
    JSON.stringify(payload),
  )}`;

  if (signature !== expectedSignature) {
    shortcircuit(new Response(null, { status: 401 }));
    return;
  }
};

const canHandle = (
  event: WebhookEventName,
  listener: GithubEventListener,
): listener is GithubEventListener<WebhookEventName> => {
  return !Array.isArray(listener.events) || listener.events.includes(event);
};

export default async function onEventReceived(
  event: WebhookEvent,
  req: Request,
  ctx: AppContext,
) {
  await verify(event, req, ctx.githubWebhookSecret);
  const eventName = req.headers.get("x-github-event") as WebhookEventName;

  await Promise.all(ctx.githubEventListeners.map((listener) => {
    if (canHandle(eventName, listener)) {
      return listener.handle(event, ctx);
    }
    return Promise.resolve();
  }));
}
