import { timingSafeEqual } from "@std/crypto/timing-safe-equal";
import { encodeHex } from "@std/encoding/hex";

const encoder = new TextEncoder();

async function sign(secret: string, payload: string): Promise<Uint8Array> {
  if (!secret || !payload) {
    throw new TypeError(
      "secret & payload required for sign()",
    );
  }

  if (typeof payload !== "string") {
    throw new TypeError("payload must be a string");
  }

  const algorithm = { name: "HMAC", hash: "SHA-256" };
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    algorithm,
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    algorithm.name,
    key,
    encoder.encode(payload),
  );

  return encoder.encode(`sha256=${encodeHex(new Uint8Array(signature))}`);
}

export async function verify(
  secret: string,
  eventPayload: string,
  signature: string,
): Promise<boolean> {
  if (!secret || !eventPayload || !signature) {
    throw new TypeError(
      "secret, eventPayload & signature required",
    );
  }

  if (typeof eventPayload !== "string") {
    throw new TypeError(
      "eventPayload must be a string",
    );
  }

  const signatureBuffer = encoder.encode(signature);

  const verificationBuffer = await sign(secret, eventPayload);

  if (signatureBuffer.length !== verificationBuffer.length) {
    return false;
  }

  // constant time comparison to prevent timing attacks
  // https://stackoverflow.com/a/31096242/206879
  // https://en.wikipedia.org/wiki/Timing_attack
  return timingSafeEqual(signatureBuffer, verificationBuffer);
}
