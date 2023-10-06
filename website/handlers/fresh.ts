import { HandlerContext } from "$fresh/server.ts";
import { Page } from "deco/blocks/page.ts";
import { ResolveOptions } from "deco/engine/core/mod.ts";
import {
  asResolved,
  BaseContext,
  isDeferred,
} from "deco/engine/core/resolver.ts";
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

const runOnlyMatchers: Required<
  Required<ResolveOptions>["hooks"]
>["onResolveStart"] = (proceed, props, resolver) => {
  if (resolver.type === "matchers") {
    return proceed();
  }
  proceed().catch((_err) => {
    //ignore errors
  }); // make the next resolver pass
  return Promise.resolve(props);
};
/**
 * @title Fresh Page
 * @description Renders a fresh page.
 */
export default function Fresh(
  freshConfig: FreshConfig,
  appContext: AppContext,
) {
  return async (req: Request, ctx: ConnInfo) => {
    const endResolvePage = appContext?.monitoring?.timings?.start?.(
      "load-data",
    );

    const isHead = req.method === "HEAD";
    const page = await appContext?.monitoring?.tracer?.startActiveSpan?.(
      "load-data",
      async (span) => {
        try {
          return isDeferred<Page, BaseContext & { context: ConnInfo }>(
              freshConfig.page,
            )
            ? await freshConfig.page(
              { context: ctx },
              isHead
                ? {
                  hooks: { onResolveStart: runOnlyMatchers },
                  propagateOptions: true,
                  propsAreResolved: true,
                }
                : undefined,
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
    if (isHead) {
      return new Response(null, { status: 200 });
    }

    const caching = appContext.caching;

    if (caching) {
      const { maxAgeSeconds, jitterSeconds } = caching;
      const jitter = jitterSeconds ?? 2;
      const maxAge = maxAgeSeconds ?? 3;

      appContext.response.headers.set(
        "cache-control",
        `max-age=${Math.floor(maxAge + (Math.random() * jitter))}`,
      );
    }

    endResolvePage?.();
    const url = new URL(req.url);
    if (url.searchParams.get("asJson") !== null) {
      return Response.json(page, { headers: allowCorsFor(req) });
    }
    if (isFreshCtx<DecoState>(ctx)) {
      const end = appContext?.monitoring?.timings?.start?.("render-to-string");
      const response = await appContext.monitoring!.tracer.startActiveSpan(
        "render-to-string",
        async (span) => {
          try {
            return await ctx.render({
              page,
              routerInfo: {
                flags: ctx.state.flags,
                pagePath: ctx.state.pathTemplate,
              },
            });
          } catch (err) {
            span.recordException(err);
            throw err;
          } finally {
            span.end();
          }
        },
      );
      end?.();

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
