import manifest, { Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type AppContext as AC } from "@deco/deco";
// deno-lint-ignore no-empty-interface
export interface Props {
}
/**
 * @title Deco Brand Assistant
 * @description A concierge for your ecommerce.
 * @category Sales channel
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/brand-assistant/logo.png
 */
export default function App(state: Props): App<Manifest, Props> {
  return {
    manifest,
    state,
  };
}
export type AppContext = AC<ReturnType<typeof App>>;
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Deco Brand Assistant",
      owner: "deco.cx",
      description: "A concierge for your ecommerce.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/brand-assistant/logo.png",
      images: [],
      tabs: [],
    },
  };
};
