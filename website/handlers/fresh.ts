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
  computeRenderCb,
  type DecoState,
  isDeferred,
  RequestContext,
  type ResolvedSection,
  sectionModuleLookup,
  type SerializeContext,
  serializeResolvedSection,
} from "@deco/deco";
import type { Exception } from "npm:@opentelemetry/api@1.9.0";

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
function abortHandler(
  ctrl: AbortController,
  signal: AbortSignal,
  info?: {
    url?: string;
    startedAt?: number;
    pathTemplate?: string;
    userAgent?: string;
    referer?: string;
    completed?: () => boolean;
  },
) {
  let aborted = false;
  const abortCtrlInstance = () => {
    if (aborted) {
      return; // Early return if already handled
    }
    try {
      if (!ctrl.signal.aborted) {
        const skipLog =
          (typeof info?.completed === "function" && info.completed()) ||
          (info?.url?.startsWith("/.well-known")) ||
          (info?.url?.endsWith(".css")) ||
          (info?.url?.endsWith(".map"));

        const elapsed = info?.startedAt
          ? (Date.now() - info.startedAt)
          : undefined;
        if (!skipLog) {
          console.warn(
            `[fresh][request-abort] aborting loaders due to incoming request abort` +
              (info?.url ? ` url=${info.url}` : "") +
              (info?.pathTemplate ? ` pathTemplate=${info.pathTemplate}` : "") +
              (info?.userAgent ? ` ua=${JSON.stringify(info.userAgent)}` : "") +
              (info?.referer
                ? ` referer=${JSON.stringify(info.referer)}`
                : "") +
              (elapsed !== undefined ? ` elapsedMs=${elapsed}` : "") +
              ` known=true reason=incoming-request-abort`,
          );
        }
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
  const finalizationRegistry = new FinalizationRegistry(
    (abortCtrl: () => void) => {
      req.signal.removeEventListener("abort", abortCtrl);
    },
  );
  finalizationRegistry.register(req, abortCtrl);
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
    | "renderJson"
  >,
) {
  return async (req: Request, ctx: ConnInfo) => {
    if (req.method === "HEAD") {
      return new Response(null, { status: 200 });
    }
    const timing = appContext?.monitoring?.timings?.start?.("load-data");
    let didFinish = false;
    const url = new URL(req.url);
    const startedAt = Date.now();
    const asJson = url.searchParams.get("asJson");
    // Structured JSON rendering (sections serialized honoring the section's
    // `renderJson` export).
    const renderJson = url.searchParams.has("renderJson");
    // One-shot JSON responses (asJson/renderJson) never use async render.
    const isJsonOneShot = asJson !== null || renderJson;
    const delayFromProps = appContext.firstByteThresholdMS ? 1 : 0;
    const delay = Number(url.searchParams.get(__DECO_FBT) ?? delayFromProps);
    /** Controller to abort third party fetch (loaders) */
    const ctrl = new AbortController();
    const pathTemplate = isFreshCtx<DecoState>(ctx)
      // deno-lint-ignore no-explicit-any
      ? (ctx as any).state?.pathTemplate
      : undefined;
    // Only wire request-abort propagation when async render (firstByteThreshold) is in effect.
    let abortCtrl: (() => void) | undefined;
    /**
     * Aborts when:
     *
     * 1. Page is HTML
     * 2. Async Rendering Feature is activated
     * 3. Is not a bot (bot requires the whole page html for boosting SEO)
     */
    const firstByteThreshold = !isJsonOneShot && delay && !appContext.isBot
      ? (delay === 1
        ? (() => {
          console.warn(
            `[fresh][async-render-abort] aborting loaders immediately due to firstByteThreshold` +
              ` delay=${delay} url=${url.pathname}${url.search}` +
              (pathTemplate ? ` pathTemplate=${pathTemplate}` : "") +
              ` known=true reason=first-byte-threshold stage=loaders`,
          );
          ctrl.abort();
          return undefined;
        })()
        : setTimeout(() => {
          console.warn(
            `[fresh][async-render-abort] aborting loaders after ${delay}ms due to firstByteThreshold` +
              ` url=${url.pathname}${url.search}` +
              (pathTemplate ? ` pathTemplate=${pathTemplate}` : "") +
              ` known=true reason=first-byte-threshold stage=loaders`,
          );
          ctrl.abort();
        }, delay))
      : undefined;

    // Propagate client aborts to loaders only when async render is enabled
    if (!isJsonOneShot && delay && !appContext.isBot) {
      abortCtrl = abortHandler(ctrl, req.signal, {
        url: `${url.pathname}${url.search}`,
        startedAt,
        pathTemplate,
        userAgent: req.headers.get("user-agent") ?? undefined,
        referer: req.headers.get("referer") ?? undefined,
        completed: () => didFinish,
      });
      req.signal.addEventListener("abort", abortCtrl, { once: true });
      registerFinilizer(req, abortCtrl);
    }
    try {
      // Section drop for renderJson = consumer override (app-owned sections
      // configured in the website app props) + the section's own
      // `renderJson === false` export.
      const getSectionModule = renderJson ? await sectionModuleLookup() : null;
      // Trim and drop blank suffixes — an empty entry would make `endsWith("")`
      // match every section and drop the whole page.
      const sectionsToIgnore = (appContext.renderJson?.sectionsToIgnore ?? [])
        .map((suffix) => suffix.trim())
        .filter((suffix) => suffix.length > 0);
      const isDroppedSection = (resolveType: string) =>
        !!getSectionModule &&
        (sectionsToIgnore.some((suffix) => resolveType.endsWith(suffix)) ||
          getSectionModule(resolveType)?.renderJson === false);

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
                // Dropped sections short-circuit child resolution (their
                // prop-loaders never run) — see deco engine/core/resolver.ts.
                onPropsResolveStart: (
                  resolve,
                  _props,
                  resolver,
                  resolveType,
                ) => {
                  if (renderJson && isDroppedSection(resolveType)) {
                    return Promise.resolve([]);
                  }
                  let next = resolve;
                  if (resolver?.type === "matchers") { // matchers should not have a timeout.
                    next = RequestContext.bind({ signal: req.signal }, resolve);
                  }
                  return next();
                },
                // Skip the dropped section's own inline `mod.loader` by
                // stubbing before the section resolver runs. Cast via
                // `unknown` because the hook is generic over T.
                onResolveStart: <T>(
                  proceed: () => Promise<T>,
                  _props: T,
                  _resolver: unknown,
                  resolveType: string,
                ): Promise<T> => {
                  if (renderJson && isDroppedSection(resolveType)) {
                    const stub: ResolvedSection = {
                      metadata: { component: resolveType },
                    };
                    return Promise.resolve(stub as unknown as T);
                  }
                  return proceed();
                },
              },
            })
            : freshConfig.page,
      );
      const page = await appContext?.monitoring?.tracer?.startActiveSpan?.(
        "load-data",
        async (span) => {
          try {
            span?.setAttribute?.("http.target", `${url.pathname}${url.search}`);
            if (pathTemplate) {
              span?.setAttribute?.("deco.path_template", pathTemplate);
            }
            if (delay && !isJsonOneShot && !appContext.isBot) {
              span?.setAttribute?.(
                "deco.async_render.first_byte_threshold_ms",
                delay,
              );
            }
            return await getPage();
          } catch (e) {
            span?.setAttribute?.("error.path", `${url.pathname}${url.search}`);
            if (pathTemplate) {
              span?.setAttribute?.("error.path_template", pathTemplate);
            }
            const isKnownAbort =
              (e as { name?: string })?.name === "AbortError" &&
              ctrl.signal.aborted;
            if (isKnownAbort) {
              span?.setAttribute?.("deco.abort.known", true);
              span?.setAttribute?.(
                "deco.abort.reason",
                "async-render-or-client-abort",
              );
              console.warn(
                `[fresh][known-abort] stage=load-data url=${url.pathname}${url.search}` +
                  (pathTemplate ? ` pathTemplate=${pathTemplate}` : "") +
                  ` known=true reason=async-render-or-client-abort`,
              );
            } else {
              span.recordException(e as Exception);
            }
            throw e;
          } finally {
            span.end();
            timing?.end();
          }
        },
      );
      // renderJson takes precedence over asJson when both params are sent.
      if (renderJson) {
        didFinish = true;
        const pageProps = (page as unknown as Record<string, unknown>)?.props as
          | Record<string, unknown>
          | undefined;
        // appContext runtime spreads state.global (= the full request state),
        // so vary/revision/release/deco are reachable here even though the
        // type declares a narrower surface.
        // deno-lint-ignore no-explicit-any
        const appCtx = appContext as any;
        const cb = computeRenderCb({
          revision: appCtx?.revision ?? (await appCtx?.release?.revision?.()),
          vary: appCtx?.vary?.build?.(),
          href: req.url,
          deploymentId: appCtx?.deco?.ctx?.deploymentId,
        });
        const serializeCtx: SerializeContext = {
          href: req.url,
          pathTemplate: pathTemplate ?? url.pathname,
          cb,
          getSectionModule: getSectionModule ?? undefined,
        };
        const sections = ((pageProps?.sections as Array<ResolvedSection>) ?? [])
          .map((section) => serializeResolvedSection(section, serializeCtx))
          // Drops renderJson === false sections (serialized to null) and the
          // stubs left by onResolveStart for the ignored list.
          .filter((s): s is NonNullable<typeof s> =>
            s !== null && !isDroppedSection(s.component)
          );
        return Response.json(
          { name: pageProps?.name, path: pageProps?.path, sections },
          { headers: allowCorsFor(req) },
        );
      }
      if (asJson !== null) {
        didFinish = true;
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
              span?.setAttribute?.(
                "http.target",
                `${url.pathname}${url.search}`,
              );
              if (pathTemplate) {
                span?.setAttribute?.("deco.path_template", pathTemplate);
              }
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
              if (!isJsonOneShot && delay && !appContext.isBot) {
                console.info(
                  `[fresh][async-render-response] returned initial HTML with async render` +
                    ` url=${url.pathname}${url.search}` +
                    (pathTemplate ? ` pathTemplate=${pathTemplate}` : "") +
                    ` thresholdMs=${delay}`,
                );
              }
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
              const isKnownAbort =
                (err as { name?: string })?.name === "AbortError" &&
                ctrl.signal.aborted;
              if (isKnownAbort) {
                span?.setAttribute?.("deco.abort.known", true);
                span?.setAttribute?.("deco.abort.stage", "render-to-string");
                console.warn(
                  `[fresh][known-abort] stage=render-to-string url=${url.pathname}${url.search}` +
                    (pathTemplate ? ` pathTemplate=${pathTemplate}` : "") +
                    ` known=true reason=async-render-or-client-abort`,
                );
              } else {
                span.recordException(err as Exception);
              }
              throw err;
            } finally {
              span.end();
              timing?.end();
            }
          },
        );
        didFinish = true;
        return response;
      }
      didFinish = true;
      return Response.json({ message: "Fresh is not being used" }, {
        status: 500,
      });
    } finally {
      if (firstByteThreshold) {
        clearTimeout(firstByteThreshold);
      }
      if (abortCtrl) {
        req.signal.removeEventListener("abort", abortCtrl);
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
