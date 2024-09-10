import { Handler } from "deco/blocks/handler.ts";
import { FnContext } from "deco/types.ts";
import { Routes } from "../../../website/flags/audience.ts";
import { router } from "../../../website/handlers/router.ts";

export interface RouterConfig {
  base?: string;
  routes: Routes;
}

export default function Router({
  routes: entrypoints,
  base,
}: RouterConfig, ctx: FnContext): Handler {
  let routes = entrypoints;

  if (base) {
    routes = [];
    for (const route of routes) {
      const { pathTemplate: entrypoint, handler } = route;
      routes = [
        ...routes,
        { pathTemplate: `${base}${entrypoint}`, handler },
      ];
    }
  }

  return router(routes, {}, ctx.get.bind(ctx));
}
