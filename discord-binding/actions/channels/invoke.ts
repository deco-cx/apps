import { OnEventReceivedProps } from "../../../mcp/bindings.ts";
import { HttpError } from "../../../utils/http.ts";
import type { DiscordWebhookPayload } from "../../client.ts";
import { AppContext } from "../../mod.ts";
import { verifyKey } from "npm:discord-interactions@4.3.0";

/**
 * @name ON_CHANNEL_INVOKED
 * @title On Discord Invoked
 * @description This action is triggered when Discord sends a webhook event
 */
export default async function invoke(
  props: OnEventReceivedProps<DiscordWebhookPayload>,
  req: Request,
  ctx: AppContext,
) {
  // Discord signature validation
  const signature = props.headers["x-signature-ed25519"];
  const timestamp = props.headers["x-signature-timestamp"];
  const publicKey = ctx.webhookPublicKey;

  if (signature && timestamp && publicKey) {
    const verified = await verifyKey(
      JSON.stringify(props.payload),
      signature,
      timestamp,
      publicKey,
    );
    if (!verified) {
      throw new HttpError(401, "Invalid signature");
    }
  }

  // Handle Discord ping (type 1 = PING)
  try {
    const payload = props.payload;
    if (payload.type === 1) {
      return { type: 1 };
    }
  } catch (_) {
    // ignore for now
  }

  // Pass to handler
  // discord needs to be responded within 3 seconds
  ctx.handle(props, req, ctx).catch((err: unknown) => {
    console.error("handle discord error", err);
  });
}
