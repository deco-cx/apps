import manifest, { Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App } from "@deco/deco";
/**
 * @title Sourei
 * @description Get sourei to analyze your data.
 * @category Analytics
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/sourei/logo.png
 */
export default function App() {
  const app: App<Manifest> = { manifest, state: {} };
  return app;
}
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Sourei",
      owner: "Henrique Sourei",
      description: "Get sourei to analyze your data.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/sourei/logo.png",
      images: [],
      tabs: [],
    },
  };
};
