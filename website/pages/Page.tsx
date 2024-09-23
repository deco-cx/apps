import { Head } from "$fresh/runtime.ts";
import {
  Context,
  HttpError,
  isDeferred,
  type SectionProps,
  usePageContext as useDecoPageContext,
  useRouterContext,
} from "@deco/deco";
import {
  type ComponentFunc,
  type ComponentMetadata,
  type Page,
  type Section,
} from "@deco/deco/blocks";
import { logger } from "@deco/deco/o11y";
import { Component, JSX } from "preact";
import ErrorPageComponent from "../../utils/defaultErrorPage.tsx";
import Clickhouse, {
  generateSessionId,
  generateUserId,
} from "../components/Clickhouse.tsx";
import Events from "../components/Events.tsx";
import { SEOSection } from "../components/Seo.tsx";
import LiveControls from "../components/_Controls.tsx";
import { AppContext } from "../mod.ts";
const noIndexedDomains = ["decocdn.com", "deco.site", "deno.dev"];
/**
 * @title Sections
 * @label hidden
 * @changeable true
 */
export type Sections = Section[];
export interface DefaultPathProps {
  possiblePaths: string[];
}
/**
 * @titleBy name
 * @label rootHidden
 */
export interface Props {
  name: string;
  /**
   * @format unused-path
   */
  path?: string;
  /** @hide true */
  seo?: Section<SEOSection>;
  sections: Sections;
  /** @hide true */
  unindexedDomain?: boolean;
}
export function renderSection(section: Props["sections"][number]) {
  if (section === undefined || section === null) {
    return <></>;
  }
  const { Component, props } = section;
  return <Component {...props} />;
}
class ErrorBoundary extends Component<{
  // deno-lint-ignore no-explicit-any
  fallback: ComponentFunc<any>;
}> {
  state = { error: null as Error | null };
  // deno-lint-ignore no-explicit-any
  static getDerivedStateFromError(error: any) {
    return { error };
  }
  render() {
    if (this.state.error) {
      const err = this?.state?.error;
      const msg = `rendering: ${this.props} ${err?.stack}`;
      logger.error(msg);
      console.error(msg);
    }
    return !this.state.error ||
        (this.state.error instanceof HttpError &&
          (this.state.error as HttpError).status < 400)
      ? this.props.children
      : this.props.fallback(this.state.error);
  }
}
const useDeco = () => {
  const metadata = useDecoPageContext()?.metadata;
  const routerCtx = useRouterContext();
  const pageId = pageIdFromMetadata(metadata);
  return {
    flags: routerCtx?.flags ?? [],
    page: {
      id: pageId,
      pathTemplate: routerCtx?.pagePath,
    },
  };
};
/**
 * @title Page
 */
function Page(
  {
    sections,
    errorPage,
    devMode,
    seo,
    unindexedDomain,
    avoidRedirectingToEditor,
    sendToClickHouse,
    userId,
    sessionId,
  }: SectionProps<typeof loader>,
): JSX.Element {
  const context = Context.active();
  const site = { id: context.siteId, name: context.site };
  const deco = useDeco();
  return (
    <>
      {unindexedDomain && (
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
      )}
      <ErrorBoundary
        fallback={(error: unknown) =>
          error instanceof HttpError &&
            errorPage !== undefined &&
            errorPage !== null &&
            !devMode
            ? <errorPage.Component {...errorPage.props}></errorPage.Component>
            : (
              <ErrorPageComponent
                error={(devMode && error instanceof (Error || HttpError)
                  ? error.stack
                  : "") || ""}
              />
            )}
      >
        {seo && renderSection(seo)}
        <LiveControls
          avoidRedirectingToEditor={avoidRedirectingToEditor}
          site={site}
          {...deco}
        />
        <Events deco={deco} />
        {sendToClickHouse && (
          <Clickhouse
            siteId={site.id}
            siteName={site.name}
            userId={userId}
            sessionId={sessionId}
          />
        )}
        {sections.map(renderSection)}
      </ErrorBoundary>
    </>
  );
}
const getClientIp = (req: Request): string => {
  return req.headers.get("CF-Connecting-IP") ||
    req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") ||
    "";
};
const getUserAgent = (req: Request): string => {
  return req.headers.get("user-agent") || "";
};
export const loader = async (
  { sections, ...restProps }: Props,
  req: Request,
  ctx: AppContext,
) => {
  const url = new URL(req.url);
  const devMode = url.searchParams.has("__d");
  const unindexedDomain = noIndexedDomains.some((domain) =>
    url.origin.includes(domain)
  );
  const global = ctx.global || [];
  const resolvedGlobals = await Promise.all(
    global?.map(async (section) => {
      return await ctx.get(section, {
        resolveChain: [{ value: ctx.resolverId ?? "root", type: "resolver" }],
      });
    }),
  );
  const globalSections = ctx.theme
    ? [ctx.theme, ...resolvedGlobals]
    : resolvedGlobals;
  const context = Context.active();
  const site = { id: context.siteId, name: context.site };
  const userId = await generateUserId(
    site.name,
    getClientIp(req),
    getUserAgent(req),
  );
  const sessionId = generateSessionId();
  return {
    ...restProps,
    sections: [...globalSections, ...sections],
    errorPage: isDeferred<Page>(ctx.errorPage)
      ? await ctx.errorPage()
      : undefined,
    devMode,
    unindexedDomain,
    avoidRedirectingToEditor: ctx.avoidRedirectingToEditor,
    sendToClickHouse: ctx.sendToClickHouse,
    userId,
    sessionId,
  };
};
export function Preview(props: SectionProps<typeof loader>) {
  const { sections, seo } = props;
  const deco = useDeco();
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {seo && renderSection(seo)}
      <Events deco={deco} />
      {sections.map(renderSection)}
    </>
  );
}
const PAGE_NOT_FOUND = -1;
export const pageIdFromMetadata = (metadata: ComponentMetadata | undefined) => {
  if (!metadata) {
    return PAGE_NOT_FOUND;
  }
  const { resolveChain, component } = metadata;
  const pageResolverIndex =
    resolveChain.findLastIndex((chain) =>
      chain.type === "resolver" && chain.value === component
    ) || PAGE_NOT_FOUND;
  const pageParent = pageResolverIndex > 0
    ? resolveChain[pageResolverIndex - 1]
    : null;
  return pageParent?.value ?? PAGE_NOT_FOUND;
};
export default Page;
