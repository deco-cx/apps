import { Secret } from "../website/loaders/secret.ts";
import { OpenAI } from "./deps.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { type App, type AppContext as AC } from "@deco/deco";
export interface Props {
  apiKey?: Secret;
}
export interface State {
  openAI: OpenAI;
}
/**
 * @title OpenAI
 */
export default function App(state: Props): App<Manifest, State> {
  const getToken = state?.apiKey?.get;
  try {
    const openAI = new OpenAI({
      apiKey: typeof getToken === "function"
        ? getToken() ?? undefined
        : undefined,
    });
    return {
      manifest,
      state: {
        openAI,
      },
    };
  } catch {
    throw new Error(`Failed to initialize OpenAI. Please check the API key.`);
  }
}
export type AppContext = AC<ReturnType<typeof App>>;
