import { SourceMap } from "deco/blocks/app.ts";
import { buildSourceMap } from "deco/blocks/utils.tsx";
import { type App, AppModule, context, type FnContext } from "deco/mod.ts";
import { Markdown } from "./components/Markdown.tsx";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface DynamicApp {
  module: AppModule;
  name: string;
  sourceMap?: SourceMap;
}
export interface State {
  enableAdmin?: boolean;
  apps: DynamicApp[];
}

/**
 * @title Deco Hub
 */
const ADMIN_APP = "decohub/apps/admin.ts";
export default async function App(
  state: State,
): Promise<App<Manifest, State>> {
  const resolvedImport = import.meta.resolve("../admin/mod.ts");
  const baseSourceMap = buildSourceMap(manifest);
  const [dynamicApps, enhancedSourceMap] = (state?.apps ?? []).filter(Boolean)
    .reduce(
      ([apps, sourcemap], app) => {
        const appTs = `${app.name}.ts`;
        const appName = `${manifest.name}/apps/${appTs}`;
        return [{
          ...apps,
          [appName]: app.module,
        }, {
          ...sourcemap,
          ...app.sourceMap ?? {},
          [appName]: import.meta.resolve("../website/mod.ts"),
        }];
      },
      [{} as Record<string, AppModule>, baseSourceMap],
    );
  return {
    manifest: {
      ...manifest,
      apps: {
        // build apps based on name
        ...dynamicApps,
        ...manifest.apps,
        ...context.play || state.enableAdmin // this is an optimization to not include the admin code for everyone in case of play is not being used.
          ? {
            [ADMIN_APP]: await import(
              resolvedImport
            ),
          }
          : {},
      },
    } as Manifest,
    state,
    ...context.play || state.enableAdmin
      ? {
        sourceMap: {
          ...enhancedSourceMap,
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
