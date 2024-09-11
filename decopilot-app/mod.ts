import type {
  App,
  AppContext as AC,
  // AppMiddlewareContext as AMC,
  // AppRuntime,
  // ManifestOf,
} from "deco/mod.ts";

import type { Secret } from "../website/loaders/secret.ts";

import manifest, { Manifest } from "./manifest.gen.ts";
// import workflow from "../workflows/mod.ts";
import { Prompt } from "./types.ts";
import { Provider } from "./types.ts";

/**@title {{{llmProvider}}} API Key */
interface Credentials {
  llmProvider: Provider;
  key: Secret;
}

export interface State {
  credentials: Credentials[];
  // you can freely change this to accept new properties when installing this app
  // exampleProp: string;

  content: Prompt[];
}
/**
 * @title decopilot-app
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

export type AppContext = AC<ReturnType<typeof App>>;
