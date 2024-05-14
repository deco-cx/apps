
import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface State {
    // you can freely change this to accept new properties when installing this app
    exampleProp: string
};
/**
 * @title resend
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

export type AppContext = AC<ReturnType<typeof App>>;
