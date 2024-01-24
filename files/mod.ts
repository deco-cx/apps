import { SourceMap } from "deco/blocks/app.ts";
import { buildSourceMap } from "deco/blocks/utils.tsx";
import type { AppContext as AC, App } from "deco/mod.ts";
import { ensureFile } from "std/fs/ensure_file.ts";
import { join } from "std/path/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { FileSystemNode, create, walk } from "./sdk.ts";

export interface TsContent {
  path: string;
  content: string;
}

export interface State {
  /**
   * @title File System
   */
  root?: FileSystemNode;
}

/**
 * @title My Workspace
 */
export default async function App(
  state: State,
): Promise<App<Manifest, State>> {
  const { root = create() } = state;

  let appManifest = manifest;
  let appSourceMap: SourceMap = buildSourceMap(appManifest);

  // output all files to filesystem
  for (const file of walk(root)) {
    if (!/\.tsx?$/.test(file.path)) {
      continue;
    }

    const fullpath = join(base, file.path);

    const previous = await Deno.readTextFile(fullpath).catch(() => null);

    if (file.content !== previous) {
      await ensureFile(fullpath);
      await Deno.writeTextFile(fullpath, file.content);
    }
  }

  // import files
  for (const file of walk(root)) {
    if (!/\.tsx?$/.test(file.path)) {
      continue;
    }

    try {
      const [_, blockType] = file.path.split("/");
      const blockPath = join(base, file.path);
      const blockKey = join(manifest.name, file.path);
      const tsModule = await import(
        `data:text/tsx;base64,${btoa(file.content)}`
      );

      appManifest = {
        ...appManifest,
        [blockType]: {
          ...appManifest[blockType],
          [blockKey]: tsModule,
        },
      };

      appSourceMap = {
        ...appSourceMap,
        [blockKey]: {
          path: blockPath,
          content: file.content,
        },
      };
    } catch (error) {
      console.error(error);
    }
  }

  import(`http://localhost:8000/`)

  return { manifest: appManifest, state, sourceMap: appSourceMap };
}

export type AppContext = AC<Awaited<ReturnType<typeof App>>>;
