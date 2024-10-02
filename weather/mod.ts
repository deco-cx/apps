import manifest, { Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type AppContext as AC } from "@deco/deco";
// deno-lint-ignore ban-types
export type State = {};
/**
 * @title Deco Weather
 * @description Vary your content based on the current weather of your visitors.
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png
 */
export default function App(state: State): App<Manifest, State> {
  return { manifest, state };
}
export type AppContext = AC<ReturnType<typeof App>>;
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Deco Weather",
      owner: "deco.cx",
      description:
        "Vary your content based on the current weather of your visitors.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png",
      images: [],
      tabs: [],
    },
  };
};
