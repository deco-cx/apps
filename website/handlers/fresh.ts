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
import { UAParser } from "https://esm.sh/ua-parser-js@2.0.0-beta.2";
import { Bots } from "https://esm.sh/ua-parser-js@2.0.0-beta.2/extensions";
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

const UABotParser = new UAParser(Bots);

const isBot = (req: Request) => {
  return (UABotParser.setUA(req.headers.get("user-agent") || "")
    // deno-lint-ignore no-explicit-any
    .getBrowser() as any)
    .type === "bot";
};

/**
 * @title Fresh Page
 * @description Renders a fresh page.
 */
export default function Fresh(
  freshConfig: FreshConfig,
  appContext: Pick<
    AppContext,
    "monitoring" | "response" | "caching" | "firstByteThresholdMS"
  >,
) {
  return async (req: Request, ctx: ConnInfo) => {
    if (req.method === "HEAD") {
      return new Response(null, { status: 200 });
    }
    const timing = appContext?.monitoring?.timings?.start?.("load-data");
    const url = new URL(req.url);
    const asJson = url.searchParams.get("asJson");
    const delay = Number(
      url.searchParams.get("__deco_fbt") ?? appContext.firstByteThresholdMS,
    );

    /** Controller to abort third party fetch (loaders) */
    const ctrl = new AbortController();

    /** Aborts when: Incomming request is aborted */
    req.signal.addEventListener("abort", () => ctrl.abort());

    /**
     * Aborts when:
     *
     * 1. Page is HTML
     * 2. Async Rendering Feature is activated
     * 3. Is not a bot (bot requires the whole page html for boosting SEO)
     */
    const firstByteThreshold = !asJson && delay && !isBot(req)
      ? setTimeout(() => ctrl.abort(), delay)
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

    clearTimeout(firstByteThreshold);

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
