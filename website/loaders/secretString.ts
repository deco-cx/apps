import { Secret } from "./secret.ts";

export interface Props {
  secret: Secret;
}

export type SecretString = string | null;

/** @title Secret String */
export default function ({ secret }: Props): SecretString {
  return secret.get();
}
