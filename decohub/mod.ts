import { ImportMap } from "deco/blocks/app.ts";
import { buildImportMap } from "deco/blocks/utils.tsx";
import { notUndefined } from "deco/engine/core/utils.ts";
import { type App, AppModule, context, type FnContext } from "deco/mod.ts";
import { Markdown } from "./components/Markdown.tsx";
import manifest, { Manifest } from "./manifest.gen.ts";

/**
 * @title App
 */
export interface DynamicApp {
  importUrl: string;
  name: string;
  importMap?: ImportMap;
}

export interface State {
  enableAdmin?: boolean;
  apps: DynamicApp[];
}

const DENY_DYNAMIC_IMPORT = Deno.env.get("DENY_DYNAMIC_IMPORT") === "true";

/**
 * @title Deco Hub
 * @description Unlock apps and integrations on deco.cx
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/decohub/logo.png
 */
const ADMIN_APP = "decohub/apps/admin.ts";
const FILES_APP = "decohub/apps/files.ts";
export default async function App(
  state: State,
): Promise<App<Manifest, State>> {
  const resolvedAdminImport = import.meta.resolve("../admin/mod.ts");
  const resolvedFilesImport = import.meta.resolve("../files/mod.ts");
  const baseImportMap = buildImportMap(manifest);
  const appModules = DENY_DYNAMIC_IMPORT ? [] : await Promise.all(
    (state?.apps ?? []).filter(Boolean).map(async (app) => {
      const appMod = await import(app.importUrl).catch((err) => {
        console.error("error when importing app", app.name, app.importUrl, err);
        return null;
      });
      if (!appMod) {
        return null;
      }
      return {
        module: appMod,
        importUrl: app.importUrl,
        importMap: app.importMap,
        name: app.name,
      };
    }),
  );
  const [dynamicApps, enhancedImportMap] = appModules.filter(notUndefined)
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
            [appName]: app.importUrl,
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
              resolvedAdminImport
            ),
            [FILES_APP]: await import(
              resolvedFilesImport
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
            [ADMIN_APP]: ADMIN_APP,
            [FILES_APP]: FILES_APP,
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
