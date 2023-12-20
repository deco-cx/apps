import { decryptFromHex } from "../utils/crypto.ts";

/**
 * @title Secret
 * @hideOption true
 */
export interface Secret {
  /**
   * @ignore
   */
  get: () => string | null;
}

export interface Props {
  /**
   * @title Secret Value
   * @format secret
   */
  encrypted: string;
  /**
   * @title Secret Name
   * @description Used in dev mode as a environment variable (should not contain spaces or special characters)
   * @pattern ^[a-zA-Z_][a-zA-Z0-9_]*$
   */
  name?: string;
}

const cache: Record<string, Promise<string | null>> = {};

const getSecret = (props: Props): Promise<string | null> => {
  const name = props?.name;
  if (name && Deno.env.has(name)) {
    return Promise.resolve(Deno.env.get(name)!);
  }
  const encrypted = props?.encrypted;
  if (!encrypted) {
    return Promise.resolve(null);
  }
  return cache[encrypted] ??= decryptFromHex(encrypted).then((d) => d.decrypted)
    .catch((err) => {
      console.error("decrypt secret error", err);
      return null;
    });
};
/**
 * @title Secret
 */
export default async function Secret(
  props: Props,
): Promise<Secret> {
  const secretValue = await getSecret(props);
  return {
    get: (): string | null => {
      return secretValue;
    },
  };
}
