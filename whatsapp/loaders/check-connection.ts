import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title User ID
   * @description The user ID to check for a mobile number connection
   */
  userId: string;
}

/**
 * @title Check WhatsApp Connection
 * @description Checks if a user ID has an associated mobile number in the KV store
 */
export default async function checkConnection(
  { userId }: Props,
  _req: Request,
  _ctx: AppContext,
): Promise<boolean> {
  try {
    const kv = await Deno.openKv();

    const key = ["whatsapp", "connections", userId];

    const result = await kv.get(key);

    const hasConnection = result.value !== null;

    kv.close();

    return hasConnection;
  } catch (error) {
    console.error("Error checking WhatsApp connection:", error);
    return false;
  }
}
