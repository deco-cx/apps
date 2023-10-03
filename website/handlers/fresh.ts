import { HandlerContext } from "$fresh/server.ts";
import { Page } from "deco/blocks/page.ts";
import {
  asResolved,
  BaseContext,
  isDeferred,
} from "deco/engine/core/resolver.ts";
import { DecoState } from "deco/types.ts";
//import { allowCorsFor } from "deco/utils/http.ts";
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
  appContext: Pick<AppContext, "monitoring">,
) {
  return (req: Request, ctx: ConnInfo) => {
    if (req.method === "HEAD") {
      return new Response(null, { status: 200 });
    }
    const endResolvePage = appContext?.monitoring?.timings?.start?.(
      "load-data",
    );

    const stream = new TransformStream();

    const response = new Response(stream.readable, {
      status: 200,
      headers: {
        "content-type": "text/html",
      },
    });

    appContext?.monitoring?.tracer?.startActiveSpan?.(
      "load-data",
      (span) => {
        const streamPageContent = async (page: Page) => {
          endResolvePage?.();
          const url = new URL(req.url);
          if (url.searchParams.get("asJson") !== null) {
            stream.writable.close();
            return;
          }
          if (isFreshCtx<DecoState>(ctx)) {
            const end = appContext?.monitoring?.timings?.start?.(
              "render-to-string",
            );
            const response = await appContext.monitoring!.tracer
              .startActiveSpan(
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

            response.body?.pipeTo(stream.writable);

            return response;
          } else {
            stream.writable.close();
          }
        };
        let resolvePromise: null | Promise<Page> = null;
        if (
          isDeferred<Page, BaseContext & { context: ConnInfo }>(
            freshConfig.page,
          )
        ) {
          resolvePromise = Promise.resolve(freshConfig.page({ context: ctx }));
        } else {
          resolvePromise = Promise.resolve(freshConfig.page);
        }

        resolvePromise?.then(streamPageContent).catch((e) => {
          span.recordException(e);
          throw e;
        }).finally(() => {
          span.end();
        });
      },
    );

    return response;
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
