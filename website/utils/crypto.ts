/// <reference lib="deno.unstable" />

// Cross-runtime crypto using Web Crypto API
const crypto = globalThis.crypto;

// Hex encode/decode utilities
const encodeHex = (data: Uint8Array): Uint8Array => {
  const hex = Array.from(data)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return new TextEncoder().encode(hex);
};

const decodeHex = (data: Uint8Array): Uint8Array => {
  const hex = new TextDecoder().decode(data);
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

const generateKey = async (): Promise<CryptoKey> => {
  return await crypto.subtle.generateKey(
    { name: "AES-CBC", length: 128 },
    true,
    ["encrypt", "decrypt"],
  );
};

export interface AESKey {
  key: CryptoKey;
  iv: Uint8Array;
}

interface SavedAESKey {
  key: Uint8Array;
  iv: Uint8Array;
}

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const textEncode = (str: string) => textEncoder.encode(str);
const textDecode = (bytes: Uint8Array) => textDecoder.decode(bytes);

export const fromSavedAESKey = async (
  { key, iv }: SavedAESKey,
): Promise<AESKey> => {
  const importedKey = await crypto.subtle.importKey(
    "raw",
    key.buffer as ArrayBuffer,
    "AES-CBC",
    true,
    ["encrypt", "decrypt"],
  );
  return {
    key: importedKey,
    iv,
  };
};
let key: null | Promise<AESKey> = null;

// Runtime-agnostic KV and env access
declare const Deno: {
  Kv: unknown;
  openKv: () => Promise<unknown>;
  env: { has: (key: string) => boolean; get: (key: string) => string | undefined };
  args: string[];
};

let kv: { get: <T>(key: string[]) => Promise<{ value: T | null }>; atomic: () => { set: (key: string[], value: unknown) => { check: (v: unknown) => { commit: () => Promise<{ ok: boolean }> } } } } | null = null;
try {
  if (typeof Deno !== "undefined" && Deno.openKv) {
    kv = await Deno?.openKv().catch((_err: unknown) => null) as typeof kv;
  }
} catch {
  console.warn("Deno KV not available in this runtime");
}
const cryptoKey = ["deco", "secret_cryptokey"];

export const getSavedAES = (kv: typeof kv) => {
  if (!kv) return Promise.resolve(null);
  return kv.get<SavedAESKey>(cryptoKey).then(({ value }) => {
    return value;
  });
};

export const CRYPTO_KEY_ENV_VAR = "DECO_CRYPTO_KEY";

export const hasLocalCryptoKey = () => {
  if (typeof Deno !== "undefined") {
    return Deno.env.has(CRYPTO_KEY_ENV_VAR);
  }
  return typeof process !== "undefined" && !!process.env[CRYPTO_KEY_ENV_VAR];
};

export const generateAESKey = async (): Promise<SavedAESKey> => {
  const generatedKey = await generateKey();
  const rawKey = new Uint8Array(
    await crypto.subtle.exportKey("raw", generatedKey),
  );
  const iv = crypto.getRandomValues(new Uint8Array(16));
  return { key: rawKey, iv };
};

/**
 * The overall behavior here is to generate the key in the first use and then use it for the entire environment life (across deployments).
 * Essentially we try to retrieve the key from the memory and then fallback to KV using the following order.
 * 1. Use the in-memory key variable if available (which means it was retrieved at least once)
 * 2. If not, try get from the environment (used by infra without kv)
 * 3. If not, try fetch from KV (which means it was generated at least once)
 * 4. If not available, on KV so it needs to be generated. So we generate a new key and then try to atomically save it on KV.
 * in that way we avoid concurrency of two keys being saved/stored in memory at the same time.
 * 5. If any transaction error occur so we try to retrieve from KV again and use it for the entire isolate life.
 */
const getOrGenerateKey = (): Promise<AESKey> => {
  if (key) {
    return key;
  }
  if (hasLocalCryptoKey()) {
    const envValue = typeof Deno !== "undefined" 
      ? Deno.env.get(CRYPTO_KEY_ENV_VAR)
      : process.env[CRYPTO_KEY_ENV_VAR];
    const parsedAESKey: SavedAESKey = JSON.parse(
      atob(envValue!),
    );
    return fromSavedAESKey({
      key: new Uint8Array(Object.values(parsedAESKey.key)),
      iv: new Uint8Array(Object.values(parsedAESKey.iv)),
    });
  }
  if (!kv) {
    throw new Error("could not generate keys, kv is not available.");
  }

  return key ??= kv.get<SavedAESKey>(cryptoKey).then(
    async (keys) => {
      const keyFromKv = keys.value;
      if (keyFromKv === null) {
        const generatedKey = await generateKey();
        const rawKey = new Uint8Array(
          await crypto.subtle.exportKey("raw", generatedKey),
        );
        const iv = crypto.getRandomValues(new Uint8Array(16));

        const res = await kv!.atomic().set(cryptoKey, {
          key: rawKey,
          iv,
        }).check(keys)
          .commit();
        if (!res.ok) {
          return await kv!.get<SavedAESKey>(cryptoKey).then(({ value }) => {
            if (!value) {
              throw new Error("could not generate keys, kv is not available.");
            }
            return fromSavedAESKey(value);
          });
        }

        return { key: generatedKey, iv };
      }
      return fromSavedAESKey(keyFromKv);
    },
  );
};

export const encryptToHex = async (value: string): Promise<string> => {
  const { key, iv } = await getOrGenerateKey();

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    textEncode(value),
  );
  const encryptedBytes = new Uint8Array(encrypted);
  return textDecode(encodeHex(encryptedBytes));
};

export const decryptFromHex = async (encrypted: string) => {
  const { key, iv } = await getOrGenerateKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    decodeHex(textEncode(encrypted)),
  );
  const decryptedBytes = new Uint8Array(decrypted);
  return { decrypted: textDecode(decryptedBytes) };
};

if (typeof Deno !== "undefined" && (import.meta as { main?: boolean }).main) {
  const [arg] = Deno.args;
  if (!arg) {
    // Generate and print a new CRYPTO_KEY
    const savedKey = await generateAESKey();
    const encoded = btoa(JSON.stringify({
      key: Array.from(savedKey.key),
      iv: Array.from(savedKey.iv),
    }));
    console.log("Generated CRYPTO_KEY (set as DECO_CRYPTO_KEY):\n", encoded);
  } else {
    // Decode and print the key and iv
    try {
      const parsed = JSON.parse(atob(arg));
      console.log("Decoded key:", parsed.key);
      console.log("Decoded iv:", parsed.iv);
    } catch (e) {
      console.error("Failed to decode the provided string:", e);
    }
  }
}
