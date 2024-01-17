import { Head } from "$fresh/runtime.ts";
import { Section } from "deco/blocks/section.ts";
import { ComponentMetadata } from "deco/engine/block.ts";
import { context } from "deco/live.ts";
import {
  usePageContext as useDecoPageContext,
  useRouterContext,
} from "deco/runtime/fresh/routes/entrypoint.tsx";
import { JSX } from "preact";
import Events from "../components/Events.tsx";
import LiveControls from "../components/_Controls.tsx";
import { AppContext } from "../mod.ts";
import { Page } from "deco/blocks/page.tsx";
import { Component } from "preact";
import { ComponentFunc } from "deco/engine/block.ts";
import { HttpError } from "deco/engine/errors.ts";
import { logger } from "deco/observability/otel/config.ts";
import { isDeferred } from "deco/mod.ts";
import ErrorPageComponent from "../../utils/defaultErrorPage.tsx";

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
  sections: Sections;
}

export function renderSection(section: Props["sections"][number]) {
  if (section === undefined || section === null) return <></>;
  const { Component, props } = section;

  return <Component {...props} />;
}

class ErrorBoundary extends // deno-lint-ignore no-explicit-any
Component<{ fallback: ComponentFunc<any> }> {
  state = { error: null as Error | null };

  // deno-lint-ignore no-explicit-any
  static getDerivedStateFromError(error: any) {
    return { error };
  }

  render() {
    if (this.state.error) {
      const err = this?.state?.error;
      const msg = `rendering: ${this.props} ${err?.stack}`;
      logger.error(
        msg,
      );
      console.error(
        msg,
      );
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
  { sections, errorPage, devMode }:
    & Props
    & { errorPage?: Page; devMode: boolean },
): JSX.Element {
  const site = { id: context.siteId, name: context.site };
  const deco = useDeco();

  return (
    <ErrorBoundary
      fallback={(error) => (
        error instanceof HttpError && errorPage !== undefined &&
          errorPage !== null && !devMode
          ? <errorPage.Component {...errorPage.props}></errorPage.Component>
          : (
            <ErrorPageComponent
              error={(devMode && error instanceof (Error || HttpError)
                ? error.stack
                : "") || ""}
            />
          )
      )}
    >
      <LiveControls site={site} {...deco} />
      <Events deco={deco} />
      {sections.map(renderSection)}
    </ErrorBoundary>
  );
}

export const loader = async (
  { sections }: Props,
  req: Request,
  ctx: AppContext,
) => {
  const url = new URL(req.url);
  const devMode = url.searchParams.has("__d");
  return {
    sections,
    errorPage: isDeferred<Page>(ctx.errorPage)
      ? await ctx.errorPage()
      : undefined,
    devMode,
  };
};

export function Preview({ sections }: Props) {
  const deco = useDeco();

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Events deco={deco} />
      {sections.map(renderSection)}
    </>
  );
}

const PAGE_NOT_FOUND = -1;
export const pageIdFromMetadata = (
  metadata: ComponentMetadata | undefined,
) => {
  if (!metadata) {
    return PAGE_NOT_FOUND;
  }

  const { resolveChain, component } = metadata;
  const pageResolverIndex =
    (resolveChain.findLastIndex((chain) =>
      chain.type === "resolver" && chain.value === component
    )) || PAGE_NOT_FOUND;

  const pageParent = pageResolverIndex > 0
    ? resolveChain[pageResolverIndex - 1]
    : null;

  return pageParent?.value ?? PAGE_NOT_FOUND;
};

export default Page;
