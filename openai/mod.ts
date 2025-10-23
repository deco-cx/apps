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
 * @appName openai
 */
export default function App(state: Props): App<Manifest, State> {
  const getToken = state?.apiKey?.get;
  const token = typeof getToken === "function"
    ? getToken() ?? undefined
    : undefined;

  // Graceful fallback when no API key is provided: expose a no-op client
  // so apps can build and run without failing at init time.
  if (!token) {
    console.warn("[openai] Missing apiKey. OpenAI features are disabled.");
    // minimal stub implementing the used surface (beta.assistants.retrieve)
    const disabledOpenAI = {
      beta: {
        assistants: {
          // Return a resolved dummy to avoid unhandled rejections during build/runtime
          retrieve: (_id: string) => Promise.resolve({} as unknown),
        },
      },
    } as unknown as OpenAI;

    return {
      manifest,
      state: {
        openAI: disabledOpenAI,
      },
    };
  }

  const openAI = new OpenAI({ apiKey: token });
  return {
    manifest,
    state: {
      openAI,
    },
  };
}
export type AppContext = AC<ReturnType<typeof App>>;
