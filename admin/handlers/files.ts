import { Context } from "deco/deco.ts";
import { join } from "std/path/mod.ts";
import { create, walk } from "../../files/sdk.ts";

const handler = (_props: unknown) => {
  return async (req: Request) => {
    const url = new URL(req.url);

    if (url.pathname.includes("manifest.gen.ts")) {
      const state = await Context.active().release?.state();

      const files = Object.values(state ?? {}).find(({ __resolveType }) =>
        __resolveType.includes("decohub/apps/files.ts")
      );

      if (!files) {
        return;
      }

      const { root = create() } = files;

      for (const file of walk(root)) {
        if (!/\.tsx?$/.test(file.path)) {
          continue;
        }

        try {
          const [_, blockType] = file.path.split("/");

          const blockKey = join("files", file.path);
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
              path: file.path,
              content: file.content,
            },
          };
        } catch (error) {
          console.error(error);
        }
      }
    } else {
    }
  };
};

export default handler;
