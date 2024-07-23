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

export const __DECO_FBT = "__decoFBT";

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
    | "monitoring"
    | "response"
    | "caching"
    | "isBot"
    | "flavor"
  >,
) {
  return async (req: Request, ctx: ConnInfo) => {
    if (req.method === "HEAD") {
      return new Response(null, { status: 200 });
    }
    const timing = appContext?.monitoring?.timings?.start?.("load-data");
    const url = new URL(req.url);
    const asJson = url.searchParams.get("asJson");

    /** Controller to abort third party fetch (loaders) */
    const ctrl = new AbortController();

    /** Aborts when: Incomming request is aborted */
    const abortHandler = () => ctrl.abort();
    req.signal.addEventListener("abort", abortHandler);

    const getPage = RequestContext.bind(
      { signal: ctrl.signal },
      async () =>
        isDeferred<Page, BaseContext & { context: ConnInfo }>(
            freshConfig.page,
          )
          ? await freshConfig.page()
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

    if (asJson !== null) {
      return Response.json(page, { headers: allowCorsFor(req) });
    }
    if (isFreshCtx<DecoState>(ctx)) {
      const timing = appContext?.monitoring?.timings?.start?.(
        "render-to-string",
      );

      const renderToString = RequestContext.bind(
        { framework: appContext.flavor?.framework ?? "fresh" },
        ctx.render,
      );

      const response = await appContext.monitoring!.tracer.startActiveSpan(
        "render-to-string",
        async (span) => {
          try {
            const response = await renderToString({
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
                (appContext?.caching?.directives ?? []).map((
                  { name, value },
                ) => `${name}=${value}`).join(","),
              );
            }
            return response;
          } catch (err) {
            span.recordException(err);
            throw err;
          } finally {
            span.end();
            timing?.end();
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
