import manifest, { Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type FnContext } from "@deco/deco";
// deno-lint-ignore ban-types
export type State = {};
/**
 * @title Deco Workflows
 * @description Build customized and automated tasks.
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/workflows/logo.png
 */
export default function App(state: State): App<Manifest, State> {
  return { manifest, state };
}
export type AppContext = FnContext<State, Manifest>;
export type AppManifest = Manifest;
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Deco Workflows",
      owner: "deco.cx",
      description: "Build customized and automated tasks.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/workflows/logo.png",
      images: [],
      tabs: [],
    },
  };
};
