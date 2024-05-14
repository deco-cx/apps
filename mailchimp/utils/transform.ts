import { crypto } from "std/crypto/crypto.ts";

/**
 * @description Gets the MD5 hash of an email address, which is used to identify a subscriber in Mailchimp.
 * @doc https://mailchimp.com/developer/marketing/docs/methods-parameters/#path-parameters
 */
export const toMd5 = async (email: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase());
  const hash = await crypto.subtle.digest("MD5", data);
  return Array.from(new Uint8Array(hash)).map((b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
};
