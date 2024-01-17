import { context } from "deco/live.ts";
import { walk } from "std/fs/mod.ts";
import { SEP } from "std/path/separator.ts";
import { encode } from "std/encoding/base64.ts";

export interface Bundle {
  release: Record<string, unknown>;
  code: Record<string, string>;
  name: string;
}

export default async function code(_props: unknown): Promise<Bundle | null> {
  if (context.isDeploy) {
    return null;
  }
  const codeEntries: Promise<[string, string]>[] = [];
  for await (
    const entry of walk(Deno.cwd(), {
      includeDirs: false,
      skip: [
        /.github/,
        /.git$/,
        /.release.json/,
        /.decofile.json/,
        /node_modules/,
        /_fresh/,
      ],
    })
  ) {
    codeEntries.push(
      Deno.readFile(entry.path).then((
        content,
      ) => [
        entry.path.replace(`${Deno.cwd()}${SEP}`, ""),
        encode(content),
      ]),
    );
  }

  const code = Object.fromEntries(await Promise.all(codeEntries));
  const release = { ...await context.release!.state() };
  delete release["admin-app"]; // remove admin-app as default installed

  const { manifest } = await context.runtime!;
  const name = manifest.name.replace("deco-sites/", "");
  return {
    code,
    release,
    name,
  };
}
