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
import type { App, AppContext as AC } from "$live/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

// deno-lint-ignore ban-types
export type State = {};
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
