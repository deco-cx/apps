import type { App, FnContext } from "./deps.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

/**
 * @title Site
 */
export default function App(
  state: unknown,
): App<Manifest, unknown> {
  return {
    manifest,
    state,
  };
}

export type AppContext = FnContext<unknown, Manifest>;

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
