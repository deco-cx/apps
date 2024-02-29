import { ResolveOptions } from "deco/engine/core/mod.ts";
import {
  isDeferred,
  Resolvable,
  ResolveFunc,
} from "deco/engine/core/resolver.ts";
import { isAwaitable } from "deco/engine/core/utils.ts";
import { FreshContext } from "deco/engine/manifest/manifest.ts";
import { isFreshCtx } from "../handlers/fresh.ts";
import { DecoSiteState, DecoState } from "deco/types.ts";
import { ConnInfo, Handler } from "std/http/server.ts";
import { Route, Routes } from "../flags/audience.ts";
import { AppContext } from "../mod.ts";

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
    .reduce(
      (acc, routePart) => {
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
      },
      0,
    );

const urlPatternCache: Record<string, URLPattern> = {};

export const router = (
  routes: Route[],
  hrefRoutes: Record<string, Resolvable<Handler>> = {},
  resolver: ResolveFunc,
  configs?: ResolveOptions,
): Handler => {
  return async (req: Request, connInfo: ConnInfo): Promise<Response> => {
    const url = new URL(req.url);
    const route = async (
      handler: Resolvable<Handler>,
      routePath: string,
      groups?: Record<string, string | undefined>,
    ) => {
      const ctx = { ...connInfo, params: (groups ?? {}) } as ConnInfo & {
        params: Record<string, string>;
        state: DecoState;
      };

      ctx.state.routes = routes;
      ctx.state.pathTemplate = routePath;

      const resolvedOrPromise = isDeferred<
          Handler,
          Omit<FreshContext, "context"> & { context: typeof ctx }
        >(handler)
        ? handler({ context: ctx, request: req })
        : resolver<Handler>(
          handler,
          configs,
          { context: ctx, request: req },
        );

      const hand = isAwaitable(resolvedOrPromise)
        ? await resolvedOrPromise
        : resolvedOrPromise;

      return await hand(req, ctx);
    };

    const handler = hrefRoutes[`${url.pathname}${url.search || ""}`] ??
      hrefRoutes[url.pathname];
    if (handler) {
      return route(
        handler,
        `${url.pathname}${url.search || ""}`,
      );
    }

    for (const { pathTemplate: routePath, handler } of routes) {
      const pattern = urlPatternCache[routePath] ??= new URLPattern({
        pathname: routePath,
      });
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

export const buildRoutes = (
  audiences: Routes[],
): [
  Record<string, MaybePriorityHandler>,
  Record<string, Resolvable<Handler>>,
] => {
  const routeMap: Record<string, MaybePriorityHandler> = {};
  const hrefRoutes: Record<string, Resolvable<Handler>> = {};

  // We should tackle this problem elsewhere
  // check if the audience matches with the given context considering the `isMatch` provided by the cookies.
  for (const audience of audiences.filter(Boolean).flat()) {
    const {
      pathTemplate,
      isHref,
      highPriority,
      handler: { value: handler },
    } = audience;

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

    const monitoring = isFreshCtx<DecoSiteState>(connInfo)
      ? connInfo.state.monitoring
      : undefined;

    const timing = monitoring?.timings.start("router");

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

    const server = router(
      builtRoutes.map((route) => ({
        pathTemplate: route[0],
        handler: { value: route[1].func },
      })),
      hrefRoutes,
      ctx.get,
      { monitoring },
    );

    timing?.end();

    return await server(req, connInfo);
  };
}
