import type { App } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

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
