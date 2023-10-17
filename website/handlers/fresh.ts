import { HandlerContext } from "$fresh/server.ts";
import { Page } from "deco/blocks/page.ts";
import { ResolveOptions } from "deco/engine/core/mod.ts";
import {
  asResolved,
  BaseContext,
  isDeferred,
  Resolvable,
} from "deco/engine/core/resolver.ts";
import { redis, caches as redisCache } from "deco/runtime/caches/redis.ts";
import { DecoState } from "deco/types.ts";
import { allowCorsFor } from "deco/utils/http.ts";
import { ConnInfo } from "std/http/server.ts";
import { AppContext } from "../mod.ts";

/**
 * @title Fresh Config
 */
export interface FreshConfig {
  page: Page;
}

export const isFreshCtx = <TState>(
  ctx: ConnInfo | HandlerContext<unknown, TState>,
): ctx is HandlerContext<unknown, TState> => {
  return typeof (ctx as HandlerContext).render === "function";
};

const runFlags: Required<
  Required<ResolveOptions>["hooks"]
>["onResolveStart"] = (proceed, props, resolver, __resolveType) => {
  if (resolver.type === "flags" || resolver.type === undefined) {
    return proceed();
  }
  return Promise.resolve({ ...props, __resolveType });
};

const caches: Cache | null = redis === null
  ? null
  : await redisCache.open("pages");

/**
 * @title Fresh Page
 * @description Renders a fresh page.
 */
export default function Fresh(
  freshConfig: FreshConfig,
  appContext: Pick<AppContext, "response" | "monitoring" | "segment" | "get">,
) {
  return async (req: Request, ctx: ConnInfo) => {
    const endResolvePage = appContext?.monitoring?.timings?.start?.(
      "load-data",
    );

    const isHead = req.method === "HEAD";
    const pageAfterFlags = await appContext?.monitoring?.tracer
      ?.startActiveSpan?.(
        "load-data",
        async (span) => {
          try {
            return isDeferred<Resolvable, BaseContext & { context: ConnInfo }>(
                freshConfig.page,
              )
              ? await freshConfig.page(
                { context: ctx },
                {
                  hooks: { onResolveStart: runFlags },
                  propagateOptions: true,
                  propsAreResolved: true,
                },
              )
              : freshConfig.page;
          } catch (e) {
            span.recordException(e);
            throw e;
          } finally {
            span.end();
          }
        },
      );

    const loadPage = () => appContext.get<Page>(pageAfterFlags);

    if (isHead) {
      return new Response(null, { status: 200 });
    }

    // appContext.response.headers.set(
    //   "cache-control",
    //   `public, max-age=0, s-maxage=${
    //     Math.floor(
    //       DEFAULT_MAX_AGE_SECONDS + (Math.random() * DEFAULT_JITTER_SECONDS),
    //     )
    //   }`,
    // );

    endResolvePage?.();
    const url = new URL(req.url);
    if (url.searchParams.get("asJson") !== null) {
      return Response.json(await loadPage(), { headers: allowCorsFor(req) });
    }
    if (isFreshCtx<DecoState>(ctx)) {
      const response = await appContext.monitoring!.tracer.startActiveSpan(
        "render-to-string-or-cached",
        async (span) => {
          try {
            const url = new URL(req.url);
            const etag = appContext.segment.build();
            url.searchParams.set("__deco_etag", etag);
            const reqKey = new Request(url, req);
            const response = await caches?.match(reqKey)?.then((response) => {
              response?.headers?.set?.("x-cache", "HIT");
              response && span.addEvent("hit", { etag });
              return response;
            }) ??
              (async () => {
                const end = appContext?.monitoring?.timings?.start?.(
                  "render-to-string",
                );
                const renderToString = appContext.monitoring!.tracer?.startSpan(
                  "render-to-string",
                );
                const page = await loadPage();
                console.log({ page });
                return Promise.resolve(ctx.render({
                  page,
                  routerInfo: {
                    flags: ctx.state.flags,
                    pagePath: ctx.state.pathTemplate,
                  },
                })).then((response) => {
                  span.addEvent("miss", { etag });
                  response.headers.set("etag", etag);
                  if (caches) {
                    const cloned = new Response(
                      response.clone().body,
                      response,
                    );
                    cloned.headers.set(
                      "expires",
                      new Date(Date.now() + (180 * 1e3)).toUTCString(),
                    );
                    caches?.put(reqKey, cloned);
                  }
                  response.headers.set("x-cache", "MISS");
                  return response;
                }).finally(() => {
                  end?.();
                  renderToString?.end?.();
                });
              })();
            return await response;
          } catch (err) {
            span.recordException(err);
            throw err;
          } finally {
            span.end();
          }
        },
      );

      return response;
    }
    return Response.json({ message: "Fresh is not being used" }, {
      status: 500,
    });
  };
}

export const onBeforeResolveProps = (
  props: FreshConfig,
) => {
  if (props?.page) {
    return { ...props, page: asResolved(props.page, true) };
  }
  return props;
};
