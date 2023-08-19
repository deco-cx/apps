import { Routes } from "https://denopkg.com/deco-cx/live@1.27.6/flags/audience.ts";
import type { App, FnContext } from "./deps.ts";
import { asResolved } from "./deps.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = FnContext<Props, Manifest>;

export interface Props {
  /**
   * @title Site Map
   */
  routes: Routes[];
}

/**
 * @title Website
 */
export default function App(
  state: Props,
): App<Manifest, Props> {
  return {
    state,
    manifest,
    resolvables: {
      "./routes/[...catchall].tsx": {
        __resolveType: "website/handlers/router.ts",
      },
    },
  };
}

const deferPropsResolve = (
  routes: Routes,
): Routes => {
  if (Array.isArray(routes)) {
    const newRoutes = [];
    for (const route of routes) {
      newRoutes.push({
        ...route,
        handler: {
          value: asResolved(route.handler.value, true),
        },
      });
    }
    return newRoutes;
  }
  return routes;
};

export const onBeforeResolveProps = <T extends { routes?: Routes[] }>(
  props: T,
): T => {
  if (Array.isArray(props?.routes)) {
    const newRoutes: T = {
      ...props,
      routes: props.routes.map(deferPropsResolve),
    };
    return newRoutes;
  }
  return props;
};

// await devApp()
// await runApp("fashion")
// tudo começa com dados e apps. inicialmente so começa com apps
// o admin vai la e configura uma app e da um nome
// uma app "serializada" é uma lista de resolvers, um schema pra configurar eles (baseado no manifest) e o proprio manifest
// qualquer request (no middleware) faz um ctx.resolve("appName") e isso retorna {resolvers, schema, manifest, resolvables}
// depois faz um ctx.with({resolvers, resolvables})
// ctx.state.manifest = manifest;
// ctx.state.schema = schema;
// deno task gen => gen local manifest only (dev purposes)
