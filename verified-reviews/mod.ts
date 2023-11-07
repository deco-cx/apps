import type { App, AppContext as AC } from "deco/mod.ts";
import { SecretString } from "../website/loaders/secretString.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
export interface ConfigVerifiedReviews {
  idWebsite: string;
  secretKey?: SecretString;
  plateforme?: string;
}

/**
 * @title App Opiniões Verificadas
 */
export default function App(
  state: ConfigVerifiedReviews,
): App<Manifest, ConfigVerifiedReviews> {
  return { manifest, state };
}

export type AppContext = AC<ReturnType<typeof App>>;
