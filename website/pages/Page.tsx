import { Head } from "$fresh/runtime.ts";
import {
  Context,
  HttpError,
  isDeferred,
  type SectionProps,
  usePageContext as useDecoPageContext,
  useRouterContext,
} from "@deco/deco";
import { useScriptAsDataURI } from "@deco/deco/hooks";
import type {
  ComponentFunc,
  ComponentMetadata,
  Page as DecoPage,
  Section,
} from "@deco/deco/blocks";
import { logger } from "@deco/deco/o11y";
import { Component } from "preact";
import type { JSX } from "preact";
import ErrorPageComponent from "../../utils/defaultErrorPage.tsx";
import OneDollarStats from "../components/OneDollarStats.tsx";
import Events from "../components/Events.tsx";
import type { SEOSection } from "../components/Seo.tsx";
import LiveControls from "../components/_Controls.tsx";
import type { AppContext } from "../mod.ts";
import debugOverlay from "../utils/debugOverlay.ts";

const noIndexedDomains = ["decocdn.com", "deco.site", "deno.dev"];

const ONEDOLLAR_ENABLED = Deno.env.get("ONEDOLLAR_ENABLED") !== "false";
const ONEDOLLAR_COLLECTOR = Deno.env.get("ONEDOLLAR_COLLECTOR");
const ONEDOLLAR_STATIC_SCRIPT = Deno.env.get("ONEDOLLAR_STATIC_SCRIPT");

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
type DebuggableAppContext = AppContext & { debugEnabled?: boolean };
export function renderSection(section: Props["sections"][number]) {
  if (section === undefined || section === null) {
    return <div></div>;
  }
  const { Component, props } = section;
  return <Component {...props} />;
}
class ErrorBoundary extends Component<{
  fallback: ComponentFunc<Error | null>;
}> {
  override state = { error: null as Error | null };
  static override getDerivedStateFromError(error: Error) {
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
  }: SectionProps<typeof loader>,
): JSX.Element {
  const context = Context.active();
  const site = { id: context.siteId, name: context.site };
  const deco = useDeco();
  const debugActive = devMode || !context.isDeploy;
  const showPageMeta = debugActive && deco.page.id !== PAGE_NOT_FOUND;
  return (
    <>
      {debugActive && (
        <div
          data-deco-page-block-id={String(deco.page.id)}
          data-deco-page-path-template={deco.page.pathTemplate ?? ""}
          class="deco-debug-page-info"
          aria-hidden="true"
          style="display: none"
        >
          {`deco:page-block-id=${deco.page.id ?? "unknown"}${
            deco.page.pathTemplate
              ? ` | deco:page-path-template=${deco.page.pathTemplate}`
              : ""
          }`}
        </div>
      )}
      {(unindexedDomain || showPageMeta) && (
        <Head>
          {unindexedDomain && (
            <meta name="robots" content="noindex, nofollow" />
          )}
          {showPageMeta && (
            <>
              <meta
                name="deco:page-block-id"
                content={String(deco.page.id)}
              />
              {deco.page.pathTemplate && (
                <meta
                  name="deco:page-path-template"
                  content={deco.page.pathTemplate}
                />
              )}
            </>
          )}
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
        {/* Client-side debug overlay (dev mode or __d) */}
        {debugActive && (
          <script defer src={useScriptAsDataURI(debugOverlay)} />
        )}
        {ONEDOLLAR_ENABLED && (
          <OneDollarStats
            collectorAddress={ONEDOLLAR_COLLECTOR}
            staticScriptUrl={ONEDOLLAR_STATIC_SCRIPT}
          />
        )}
        {sections?.map(renderSection)}
      </ErrorBoundary>
    </>
  );
}

export const loader = async (
  { sections, ...restProps }: Props,
  req: Request,
  ctx: AppContext,
) => {
  const url = new URL(req.url);
  const debugEnabled = (ctx as DebuggableAppContext).debugEnabled === true;
  const devMode = debugEnabled || url.searchParams.has("__d");
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

  return {
    ...restProps,
    sections: [...globalSections, ...(Array.isArray(sections) ? sections : [])],
    errorPage: isDeferred<DecoPage>(ctx.errorPage)
      ? await ctx.errorPage()
      : undefined,
    devMode,
    unindexedDomain,
    avoidRedirectingToEditor: ctx.avoidRedirectingToEditor,
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
      {sections?.map(renderSection)}
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
