import { HandlerContext } from "$fresh/server.ts";
import { Page } from "deco/blocks/page.tsx";
import { RequestContext } from "deco/deco.ts";
import {
  asResolved,
  BaseContext,
  isDeferred,
} from "deco/engine/core/resolver.ts";
import { DecoState } from "deco/types.ts";
import { allowCorsFor } from "deco/utils/http.ts";
import { getSetCookies } from "std/http/cookie.ts";
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

/**
 * @title Fresh Page
 * @description Renders a fresh page.
 */
export default function Fresh(
  freshConfig: FreshConfig,
  appContext: Pick<
    AppContext,
    "monitoring" | "response" | "caching" | "firstByteThresholdMS" | "isBot"
  >,
) {
  return async (req: Request, ctx: ConnInfo) => {
    if (req.method === "HEAD") {
      return new Response(null, { status: 200 });
    }
    const timing = appContext?.monitoring?.timings?.start?.("load-data");
    const url = new URL(req.url);
    const asJson = url.searchParams.get("asJson");
    const delayFromProps = appContext.firstByteThresholdMS ? 1 : 0;
    const delay = Number(
      url.searchParams.get("__decoFBT") ?? delayFromProps,
    );

    /** Controller to abort third party fetch (loaders) */
    const ctrl = new AbortController();

    /** Aborts when: Incomming request is aborted */
    const abortHandler = () => ctrl.abort();
    req.signal.addEventListener("abort", abortHandler);

    /**
     * Aborts when:
     *
     * 1. Page is HTML
     * 2. Async Rendering Feature is activated
     * 3. Is not a bot (bot requires the whole page html for boosting SEO)
     */
    const firstByteThreshold = !asJson && delay && !appContext.isBot
      ? delay === 1 ? ctrl.abort() : setTimeout(() => ctrl.abort(), delay)
      : undefined;

    const getPage = RequestContext.bind(
      { signal: ctrl.signal },
      async () =>
        isDeferred<Page, BaseContext & { context: ConnInfo }>(freshConfig.page)
          ? await freshConfig.page({ context: ctx })
          : freshConfig.page,
    );

    const page = await appContext?.monitoring?.tracer?.startActiveSpan?.(
      "load-data",
      async (span) => {
        try {
          return await getPage();
        } catch (e) {
          span.recordException(e);
          throw e;
        } finally {
          span.end();
          timing?.end();
        }
      },
    );

    if (firstByteThreshold) {
      clearTimeout(firstByteThreshold);
    }

    if (asJson !== null) {
      return Response.json(page, { headers: allowCorsFor(req) });
    }
    if (isFreshCtx<DecoState>(ctx)) {
      const timing = appContext?.monitoring?.timings?.start?.(
        "render-to-string",
      );
      const response = await appContext.monitoring!.tracer.startActiveSpan(
        "render-to-string",
        async (span) => {
          try {
            const response = await ctx.render({
              page,
              routerInfo: {
                flags: ctx.state.flags,
                pagePath: ctx.state.pathTemplate,
              },
            });
            const setCookies = getSetCookies(appContext.response.headers);
            if (appContext?.caching?.enabled && setCookies.length === 0) {
              appContext.response.headers.set(
                "Cache-Control",
                (appContext?.caching?.directives ?? []).map(({ name, value }) =>
                  `${name}=${value}`
                ).join(","),
              );
            }
            return response;
          } catch (err) {
            span.recordException(err);
            throw err;
          } finally {
            span.end();
            timing?.end();
            req.signal.removeEventListener("abort", abortHandler);
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
