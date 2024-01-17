import { buildSourceMap } from "deco/blocks/utils.tsx";
import { type App, context, type FnContext } from "deco/mod.ts";
import { Markdown } from "./components/Markdown.tsx";
import manifest, { Manifest } from "./manifest.gen.ts";

// deno-lint-ignore ban-types
export type State = {};

/**
 * @title Deco Hub
 */
const ADMIN_APP = "decohub/apps/admin.ts";
export default async function App(
  state: State,
): Promise<App<Manifest, State>> {
  const resolvedImport = import.meta.resolve("../admin/mod.ts");
  return {
    manifest: {
      ...manifest,
      apps: {
        ...manifest.apps,
        ...context.play // this is an optimization to not include the admin code for everyone in case of play is not being used.
          ? {
            [ADMIN_APP]: await import(
              resolvedImport
            ),
          }
          : {},
      },
    } as Manifest,
    state,
    ...context.play
      ? {
        sourceMap: {
          ...buildSourceMap(manifest),
          [ADMIN_APP]: resolvedImport,
        },
      }
      : {},
  };
}

export type AppContext = FnContext<State, Manifest>;

export const Preview = await Markdown(
  new URL("./README.md", import.meta.url).href,
);
