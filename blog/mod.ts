import manifest, { Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type FnContext } from "@deco/deco";
// deno-lint-ignore no-explicit-any
export type State = any;
export type AppContext = FnContext<State, Manifest>;
/**
 * @title Deco Blog
 * @description Manage your posts.
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png
 */
export default function App(state: State): App<Manifest, State> {
  return { manifest, state };
}
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Deco Blog",
      owner: "deco.cx",
      description: "Manage your posts, categories and authors.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png",
      images: [],
      tabs: [],
    },
  };
};
