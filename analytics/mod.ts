import manifest, { Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type AppContext as AC } from "@deco/deco";
export type AppContext = AC<ReturnType<typeof App>>;
// deno-lint-ignore no-explicit-any
export type State = any;
/**
 * @title Deco Analytics
 * @description Measure your site traffic at a glance in a simple and modern web analytics dashboard.
 * @category Analytics
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/analytics/logo.png
 */
export default function App(state: State): App<Manifest, State> {
  return { manifest, state };
}
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Deco Analytics",
      owner: "deco.cx",
      description:
        "Measure your site traffic at a glance in a simple and modern web analytics dashboard.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/analytics/logo.png",
      images: [],
      tabs: [],
    },
  };
};
