import { HandlerContext } from "$fresh/server.ts";
import { getSetCookies } from "std/http/cookie.ts";
import { __DECO_FBT } from "../../utils/deferred.ts";
import { errorIfFrameworkMismatch } from "../../utils/framework.tsx";
import { AppContext } from "../mod.ts";
import { type Page } from "@deco/deco/blocks";
import {
  allowCorsFor,
  asResolved,
  type BaseContext,
  type DecoState,
  isDeferred,
  RequestContext,
} from "@deco/deco";
type ConnInfo = Deno.ServeHandlerInfo;
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
function abortHandler(ctrl: AbortController, signal: AbortSignal) {
  let aborted = false;
  const abortCtrlInstance = () => {
    if (aborted) {
      return; // Early return if already handled
    }
    try {
      if (!ctrl.signal.aborted) {
        ctrl?.abort();
        aborted = true; // Mark as aborted after calling abort
      }
    } catch (_err) {
      // We tried our best, but it is already dead... so.. lets ignore it :)
    } finally {
      signal.removeEventListener("abort", abortCtrlInstance);
    }
  };
  return abortCtrlInstance;
}
function registerFinilizer(req: Request, abortCtrl: () => void) {
  const finalizer = new FinalizationRegistry((abortCtrl: () => void) => {
    req.signal.removeEventListener("abort", abortCtrl);
  });
  finalizer.register(req, abortCtrl);
}
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
    | "firstByteThresholdMS"
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
    const delayFromProps = appContext.firstByteThresholdMS ? 1 : 0;
    const delay = Number(url.searchParams.get(__DECO_FBT) ?? delayFromProps);
    /** Controller to abort third party fetch (loaders) */
    const ctrl = new AbortController();
    const abortCtrl = abortHandler(ctrl, req.signal);
    /** Aborts when: Incomming request is aborted */
    req.signal.addEventListener("abort", abortCtrl, { once: true });
    registerFinilizer(req, abortCtrl);
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
    try {
      const getPage = RequestContext.bind(
        { signal: ctrl.signal },
        async () =>
          isDeferred<
              Page,
              BaseContext & {
                context: ConnInfo;
              }
            >(freshConfig.page)
            ? await freshConfig.page({ context: ctx }, {
              propagateOptions: true,
              hooks: {
                onPropsResolveStart: (resolve, _props, resolver) => {
                  let next = resolve;
                  if (resolver?.type === "matchers") { // matchers should not have a timeout.
                    next = RequestContext.bind({ signal: req.signal }, resolve);
                  }
                  return next();
                },
              },
            })
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
        const renderToString = RequestContext.bind({
          framework: appContext.flavor?.framework ?? "fresh",
        }, ctx.render);
        const response = await appContext.monitoring!.tracer.startActiveSpan(
          "render-to-string",
          async (span) => {
            try {
              const response = await renderToString({
                page: appContext.flavor && page
                  ? errorIfFrameworkMismatch(appContext.flavor?.framework, page)
                  : page,
                routerInfo: {
                  // deno-lint-ignore no-explicit-any
                  flags: (ctx.state as any).flags,
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
    } finally {
      if (firstByteThreshold) {
        clearTimeout(firstByteThreshold);
      }
    }
  };
}
export const onBeforeResolveProps = (props: FreshConfig) => {
  if (props?.page) {
    return { ...props, page: asResolved(props.page, true) };
  }
  return props;
};
