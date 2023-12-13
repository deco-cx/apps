import { Secret } from "./secret.ts";

export interface Props {
  secret: Secret;
}

/**
 * @title Secret String (use Secret instead)
 */
export type SecretString = string | null;

/**
 * @title Secret String
 * @deprecated true
 */
export default function ({ secret }: Props): SecretString {
  return secret.get();
}
