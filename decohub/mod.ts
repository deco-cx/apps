import { ImportMap } from "deco/blocks/app.ts";
import { buildImportMap } from "deco/blocks/utils.tsx";
import { type App, AppModule, context, type FnContext } from "deco/mod.ts";
import { Markdown } from "./components/Markdown.tsx";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface DynamicApp {
  module: AppModule;
  name: string;
  importMap?: ImportMap;
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
  console.log(state?.apps);
  const resolvedImport = import.meta.resolve("../admin/mod.ts");
  const baseImportMap = buildImportMap(manifest);
  const [dynamicApps, enhancedImportMap] = (state?.apps ?? []).filter(Boolean)
    .reduce(
      ([apps, importmap], app) => {
        const appTs = `${app.name}.ts`;
        const appName = `${manifest.name}/apps/${appTs}`;
        return [{
          ...apps,
          [appName]: app.module,
        }, {
          ...importmap,
          ...app.importMap ?? {},
          imports: {
            ...importmap?.imports ?? {},
            ...app.importMap?.imports ?? {},
            [appName]: import.meta.resolve("../website/mod.ts"),
          },
        }];
      },
      [{} as Record<string, AppModule>, baseImportMap],
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
        importMap: {
          ...enhancedImportMap,
          imports: {
            ...enhancedImportMap?.imports ?? {},
            [ADMIN_APP]: resolvedImport,
          },
        },
      }
      : {},
  };
}

export type AppContext = FnContext<State, Manifest>;

export const Preview = await Markdown(
  new URL("./README.md", import.meta.url).href,
);
