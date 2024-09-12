import { join } from "std/path/mod.ts";
import { copy } from "std/fs/mod.ts";

const appName = Deno.args[0];
const srcFolder = join(Deno.cwd(), "app-template");
const destFolder = join(Deno.cwd(), appName);

await copy(srcFolder, destFolder);

const decoTsPath = join(Deno.cwd(), "deco.ts");
const decoTs = await Deno.readTextFile(decoTsPath);

const updatedDecoTs = decoTs.replace(
  `apps: [`,
  `apps: [\n    app("${appName}"),`,
);

await Deno.writeTextFile(decoTsPath, updatedDecoTs);
