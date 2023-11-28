import type { App } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

/**
 * @title Sourei
 */
export default function App() {
  const app: App<Manifest> = { manifest, state: {} };

  return app;
}
