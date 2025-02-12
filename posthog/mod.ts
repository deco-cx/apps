import manifest, { Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { Secret } from "../website/loaders/secret.ts";
import { type App, type AppContext as AC } from "@deco/deco";
export type AppContext = AC<ReturnType<typeof App>>;
export interface Props {
  apiKey?: Secret;
  host?: string;
}
export interface State {
  apiKey?: string;
  host?: string;
}
/**
 * @title PostHog
 * @description All-in-one platform for product analytics, feature flags, session replays, experiments, and surveys.
 * @category Analytics
 * @logo https://posthog.com/brand/posthog-logomark.png
 */
export default function App(state: Props): App<Manifest, State> {
  return {
    manifest,
    state: {
      apiKey: state.apiKey?.get() ?? undefined,
      host: state.host,
    },
  };
}
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "PostHog",
      owner: "deco.cx",
      description:
        "PostHog is the only all-in-one platform for product analytics, feature flags, session replays, experiments, and surveys that's built for developers.",
      logo: "https://posthog.com/brand/posthog-logomark.png",
      images: [],
      tabs: [],
    },
  };
};
