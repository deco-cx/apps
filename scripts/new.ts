import { join } from "std/path/mod.ts";

const appName = Deno.args[0];
const decoTsPath = join(Deno.cwd(), "deco.ts");
const decoTs = await Deno.readTextFile(decoTsPath);

await Deno.mkdir(join(Deno.cwd(), appName));
await Deno.writeTextFile(
  decoTsPath,
  decoTs.replace(`  apps: [`, `  apps: [\n    app("${appName}"),`),
);

await Deno.writeTextFile(
  join(Deno.cwd(), appName, "mod.ts"),
  `
import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface State {
    // you can freely change this to accept new properties when installing this app
    exampleProp: string
};
/**
 * @title ${appName}
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

export type AppContext = AC<ReturnType<typeof App>>;
`,
);
