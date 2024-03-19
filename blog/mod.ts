import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Author, BlogPost } from "./types.ts";

export type AppContext = AC<ReturnType<typeof App>>;

export interface State {
  posts: BlogPost[];
  authors: Author[];
};

export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}
