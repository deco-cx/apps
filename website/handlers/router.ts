import {
  type DecoSiteState,
  type DecoState,
  isDeferred,
  type Resolvable,
  ResolveFunc,
  ResolveOptions,
  RouteContext,
} from "@deco/deco";
import { isAwaitable } from "@deco/deco/utils";
import { weakcache } from "../../utils/weakcache.ts";
import { Route, Routes } from "../flags/audience.ts";
import { isFreshCtx } from "../handlers/fresh.ts";
import { AppContext } from "../mod.ts";
export type ConnInfo = Deno.ServeHandlerInfo;
export type Handler = Deno.ServeHandler;
export interface SelectionConfig {
  audiences: Routes[];
}
interface MaybePriorityHandler {
  func: Resolvable<Handler>;
  highPriority?: boolean;
}
const HIGH_PRIORITY_ROUTE_RANK_BASE_VALUE = 1000;
const rankRoute = (pattern: string): number =>
  pattern
    .split("/")
    .reduce((acc, routePart) => {
      if (routePart === "*") {
        return acc;
      }
      if (routePart.startsWith(":")) {
        return acc + 1;
      }
      if (routePart.includes("*")) {
        return acc + 2;
      }
      return acc + 3;
    }, 0);
const urlPatternCache: Record<string, URLPattern> = {};
export const router = (
  routes: Route[],
  hrefRoutes: Record<string, Resolvable<Handler>> = {},
  resolver: ResolveFunc,
  configs?: ResolveOptions,
  parsedUrl?: URL,
): Handler => {
  return async (req: Request, connInfo: ConnInfo): Promise<Response> => {
    const url = parsedUrl ?? new URL(req.url);
    const route = async (
      handler: Resolvable<Handler>,
      routePath: string,
      groups?: Record<string, string | undefined>,
    ) => {
      const ctx = connInfo as ConnInfo & {
        params: Record<string, string | undefined>;
        state: DecoState;
      };
      ctx.params = groups ?? {};
      ctx.state.routes = routes;
      ctx.state.pathTemplate = routePath;
      const resolvedOrPromise = isDeferred<
          Handler,
          Omit<RouteContext, "context"> & {
            context: typeof ctx;
          }
        >(handler)
        ? handler({ context: ctx, request: req })
        : resolver<Handler>(handler, configs, { context: ctx, request: req });
      const hand = isAwaitable(resolvedOrPromise)
        ? await resolvedOrPromise
        : resolvedOrPromise;
      return await hand(req, ctx);
    };
    const handler = hrefRoutes[`${url.pathname}${url.search || ""}`] ??
      hrefRoutes[url.pathname];
    if (handler) {
      return route(handler, `${url.pathname}${url.search || ""}`);
    }
    for (const { pathTemplate: routePath, handler } of routes) {
      const pattern = urlPatternCache[routePath] ??= (() => {
        let url;
        if (URL.canParse(routePath)) {
          url = new URL(routePath);
        } else {
          url = new URL(routePath, "http://localhost:8000");
        }
        return new URLPattern({
          pathname: url.pathname,
          ...(url.search ? { search: url.search } : {}),
        });
      })();
      const res = pattern.exec(req.url);
      const groups = res?.pathname.groups ?? {};
      if (res !== null) {
        return await route(handler.value, routePath, groups);
      }
    }
    return new Response(null, {
      status: 404,
    });
  };
};
export const buildRoutes = (audiences: Routes[]): [
  Record<string, MaybePriorityHandler>,
  Record<string, Resolvable<Handler>>,
] => {
  const routeMap: Record<string, MaybePriorityHandler> = {};
  const hrefRoutes: Record<string, Resolvable<Handler>> = {};
  // We should tackle this problem elsewhere
  // check if the audience matches with the given context considering the `isMatch` provided by the cookies.
  for (const audience of audiences.filter(Boolean).flat()) {
    const { pathTemplate, isHref, highPriority, handler: { value: handler } } =
      audience;
    if (isHref) {
      hrefRoutes[pathTemplate] = handler;
    } else {
      routeMap[pathTemplate] = { func: handler, highPriority };
    }
  }
  return [routeMap, hrefRoutes];
};
export interface SelectionConfig {
  audiences: Routes[];
}
const RouterId = {
  fromFlags: (flags: AppContext["flags"]): string => {
    return flags.toSorted((flagA, flagB) =>
      flagA.name.localeCompare(flagB.name)
    ).map((flag) => `${flag.name}@${flag.value}`).join("/");
  },
};
const routerCache = new weakcache.WeakLRUCache({
  cacheSize: 16, // up to 16 different routers stored here.
});
const prepareRoutes = (audiences: Routes[], ctx: AppContext) => {
  const routesFromProps = Array.isArray(audiences) ? audiences : [];
  // everyone should come first in the list given that we override the everyone value with the upcoming flags.
  const [routes, hrefRoutes] = buildRoutes(
    Array.isArray(ctx.routes)
      ? [...ctx.routes, ...routesFromProps]
      : routesFromProps,
  );
  // build the router from entries
  const builtRoutes = Object.entries(routes).sort((
    [routeStringA, { highPriority: highPriorityA }],
    [routeStringB, { highPriority: highPriorityB }],
  ) =>
    (highPriorityB ? HIGH_PRIORITY_ROUTE_RANK_BASE_VALUE : 0) +
    rankRoute(routeStringB) -
    ((highPriorityA ? HIGH_PRIORITY_ROUTE_RANK_BASE_VALUE : 0) +
      rankRoute(routeStringA))
  );
  return {
    routes: builtRoutes.map((route) => ({
      pathTemplate: route[0],
      handler: { value: route[1].func },
    })),
    hrefRoutes,
  };
};
/**
 * @title Router
 * @description Route requests based on audience
 */
export default function RoutesSelection(
  { audiences }: SelectionConfig,
  ctx: AppContext,
): Handler {
  return async (req: Request, connInfo: ConnInfo): Promise<Response> => {
    // TODO: (@tlgimenes) Remove routing from request cycle
    const url = new URL(req.url);
    if (url.pathname.startsWith("/_frsh/")) {
      return new Response(null, {
        status: 404,
      });
    }
    const monitoring = isFreshCtx<DecoSiteState>(connInfo)
      ? connInfo.state.monitoring
      : undefined;
    const timing = monitoring?.timings.start("router");
    const routerId = `${RouterId.fromFlags(ctx.flags)}/${ctx.revision ?? ""}`;
    if (!routerCache.has(routerId)) {
      routerCache.setValue(routerId, prepareRoutes(audiences, ctx));
    }
    const { routes, hrefRoutes }: {
      routes: Route[];
      hrefRoutes: Record<string, Resolvable<Handler>>;
    } = routerCache.getValue(routerId);
    const server = router(routes, hrefRoutes, ctx.get, { monitoring }, url);
    timing?.end();
    return await server(req, connInfo);
  };
}
