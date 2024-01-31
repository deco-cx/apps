import { decoManifestBuilder } from "deco/engine/manifest/manifestGen.ts";
import {
  assertIsDir,
  create,
  FileSystemNode,
  nodesToMap,
  read,
  walk,
} from "../../files/sdk.ts";

const genManifest = async (root: FileSystemNode) => {
  assertIsDir(root);

  const nodeMap = nodesToMap(root.nodes);
  const builder = await decoManifestBuilder(
    "",
    "files",
    async function* (dir) {
      const fs = nodeMap[dir];

      if (!fs) {
        return;
      }

      for await (const file of walk(fs)) {
        yield file;
      }
    },
  );

  return builder.build();
};

const handler = (_props: unknown) => {
  return async (req: Request, ctx) => {
    // TODO: sitename from release
    const { sitename, "0": path } = ctx.params;

    const state = JSON.parse(
      await Deno.readTextFile("/Users/gimenes/code/storefront/.decofile.json"),
    );

    const files = Object.values(state ?? {}).find(({ __resolveType }) =>
      __resolveType?.includes("decohub/apps/files.ts")
    );

    if (!files) {
      return new Response(`No filesystem found`, { status: 404 });
    }

    const { root = create() } = files as any;

    const content = path === "manifest.gen.ts"
      ? await genManifest(root)
      : read(root, `/${path}`);

    return new Response(content, {
      status: content ? 200 : 404,
      headers: {
        "content-type": "text/typescript",
      },
    });
  };
};

export default handler;
