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
    // Open KV store
    const kv = await Deno.openKv();

    // Create key for lookup - using a namespaced approach
    const key = ["whatsapp", "connections", userId];

    // Check if the key exists in KV store
    const result = await kv.get(key);

    // If the value is not null, the user has a mobile number connected
    const hasConnection = result.value !== null;

    // Close the KV connection
    kv.close();

    return hasConnection;
  } catch (error) {
    console.error("Error checking WhatsApp connection:", error);
    return false;
  }
}
